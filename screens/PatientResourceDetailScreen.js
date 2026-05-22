import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Video from 'react-native-video';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import {
  fetchPatientSubmission,
  upsertResourceSubmission,
} from '../services/resourcesApi';
import { resolveTherapyFileUrl } from '../utils/resolveTherapyFileUrl';

const PatientResourceDetailScreen = ({ navigation, route }) => {
  const resource = route.params?.resource;
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const [audioPaused, setAudioPaused] = useState(true);

  const questions = resource?.content?.questions || [];

  const loadSubmission = useCallback(async () => {
    if (!resource?.id) return;
    setLoading(true);
    try {
      const sub = await fetchPatientSubmission(resource.id);
      if (sub?.submitted_data && typeof sub.submitted_data === 'object') {
        setAnswers(sub.submitted_data);
      }
      if (resource.resource_type === 'audio' && resource.file_url) {
        const uri = await resolveTherapyFileUrl(resource.file_url);
        setAudioUri(uri);
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not load resource');
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useFocusEffect(
    useCallback(() => {
      loadSubmission();
    }, [loadSubmission]),
  );

  const setAnswer = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    for (const q of questions) {
      if (q.required !== false && !String(answers[q.id] ?? '').trim()) {
        Alert.alert('Required', `Please answer: ${q.label}`);
        return;
      }
    }
    setSaving(true);
    try {
      await upsertResourceSubmission(resource.id, answers);
      Alert.alert('Saved', 'Your responses have been submitted.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  if (!resource) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Resource not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <CustomIcon name="chevron-left" size={24} color={COLORS.gray900} iconType="Feather" touchable={false} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {resource.title}
        </Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {resource.description ? (
            <Text style={styles.description}>{resource.description}</Text>
          ) : null}

          {resource.resource_type === 'audio' && audioUri ? (
            <View style={styles.audioBlock}>
              <Video
                source={{ uri: audioUri }}
                paused={audioPaused}
                audioOnly
                playInBackground={false}
                onEnd={() => setAudioPaused(true)}
                style={styles.hiddenVideo}
              />
              <TouchableOpacity
                style={styles.playBtn}
                onPress={() => setAudioPaused((p) => !p)}
                activeOpacity={0.85}
              >
                <CustomIcon
                  name={audioPaused ? 'play' : 'pause'}
                  size={28}
                  color={COLORS.white}
                  iconType="Feather"
                  touchable={false}
                />
              </TouchableOpacity>
              <Text style={styles.audioHint}>Tap to {audioPaused ? 'play' : 'pause'}</Text>
            </View>
          ) : null}

          {questions.map((q) => (
            <View key={q.id} style={styles.field}>
              <Text style={styles.label}>{q.label}</Text>
              {q.type === 'multiline' ? (
                <TextInput
                  style={[styles.input, styles.multiline]}
                  placeholder={q.placeholder || ''}
                  placeholderTextColor={COLORS.gray400}
                  multiline
                  value={String(answers[q.id] ?? '')}
                  onChangeText={(t) => setAnswer(q.id, t)}
                />
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder={q.placeholder || ''}
                  placeholderTextColor={COLORS.gray400}
                  value={String(answers[q.id] ?? '')}
                  onChangeText={(t) => setAnswer(q.id, t)}
                />
              )}
            </View>
          ))}

          {questions.length > 0 ? (
            <TouchableOpacity
              style={[styles.submitBtn, saving && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitText}>Submit</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900, textAlign: 'center' },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  description: { fontSize: FONTS.sizes.md, color: COLORS.gray600, marginBottom: SPACING.lg, lineHeight: 22 },
  field: { marginBottom: SPACING.lg },
  label: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.gray700, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray900,
  },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  audioBlock: { alignItems: 'center', marginVertical: SPACING.xl },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioHint: { marginTop: SPACING.sm, color: COLORS.gray500, fontSize: FONTS.sizes.sm },
  hiddenVideo: { width: 0, height: 0 },
  errorText: { textAlign: 'center', marginTop: 40, color: COLORS.gray500 },
});

export default PatientResourceDetailScreen;
