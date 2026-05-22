import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { fetchTherapistResourceSubmission } from '../services/resourcesApi';
import { resolveTherapyFileUrl } from '../utils/resolveTherapyFileUrl';

const TherapistResourceDetailScreen = ({ navigation, route }) => {
  const { resource, patientId, patientName, status } = route.params || {};
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openingFile, setOpeningFile] = useState(false);

  const questions = resource?.content?.questions || [];

  const load = useCallback(async () => {
    if (!resource?.id || !patientId) return;
    setLoading(true);
    try {
      const sub = await fetchTherapistResourceSubmission(resource.id, patientId);
      setSubmission(sub);
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not load submission');
    } finally {
      setLoading(false);
    }
  }, [resource?.id, patientId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openFile = async () => {
    if (!resource?.file_url) return;
    setOpeningFile(true);
    try {
      const url = await resolveTherapyFileUrl(resource.file_url);
      if (!url) {
        Alert.alert('Unavailable', 'No file URL.');
        return;
      }
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not open file');
    } finally {
      setOpeningFile(false);
    }
  };

  const answers = submission?.submitted_data || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <CustomIcon name="chevron-left" size={24} color={COLORS.gray900} iconType="Feather" touchable={false} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {resource?.title || 'Resource'}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.patientRow}>
          <CustomIcon name="user" size={18} color={COLORS.primary} iconType="Feather" touchable={false} />
          <Text style={styles.patientName}>{patientName}</Text>
          <View style={[styles.badge, status === 'Completed' ? styles.badgeDone : styles.badgePending]}>
            <Text style={styles.badgeText}>{status}</Text>
          </View>
        </View>

        {resource?.description ? (
          <Text style={styles.description}>{resource.description}</Text>
        ) : null}

        {resource?.file_url ? (
          <TouchableOpacity style={styles.fileBtn} onPress={openFile} disabled={openingFile} activeOpacity={0.85}>
            {openingFile ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <CustomIcon name="paperclip" size={18} color={COLORS.white} iconType="Feather" touchable={false} />
                <Text style={styles.fileBtnText}>Open attached file</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}

        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color={COLORS.primary} />
        ) : questions.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Patient responses</Text>
            {submission ? null : (
              <Text style={styles.noSub}>Not submitted yet.</Text>
            )}
            {questions.map((q) => (
              <View key={q.id} style={styles.answerBlock}>
                <Text style={styles.qLabel}>{q.label}</Text>
                <Text style={styles.qAnswer}>
                  {String(answers[q.id] ?? '').trim() || '—'}
                </Text>
              </View>
            ))}
            {submission?.updated_at ? (
              <Text style={styles.submittedAt}>
                Last updated: {new Date(submission.updated_at).toLocaleString()}
              </Text>
            ) : null}
          </>
        ) : resource?.resource_type === 'audio' ? (
          <Text style={styles.hint}>Audio resource — use “Open attached file” to listen.</Text>
        ) : (
          <Text style={styles.hint}>No questionnaire configured for this resource.</Text>
        )}
      </ScrollView>
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
  headerTitle: { flex: 1, fontSize: FONTS.sizes.lg, fontWeight: '700', textAlign: 'center', color: COLORS.gray900 },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  patientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  patientName: { flex: 1, marginLeft: 8, fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.gray900 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.sm },
  badgeDone: { backgroundColor: COLORS.primaryLight },
  badgePending: { backgroundColor: COLORS.gray100 },
  badgeText: { fontSize: 11, fontWeight: '700', color: COLORS.primaryDark },
  description: { fontSize: FONTS.sizes.md, color: COLORS.gray600, lineHeight: 22, marginBottom: SPACING.md },
  fileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  fileBtnText: { color: COLORS.white, fontWeight: '700', marginLeft: 8 },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.sm },
  noSub: { color: COLORS.gray500, marginBottom: SPACING.md },
  answerBlock: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  qLabel: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.gray700, marginBottom: 6 },
  qAnswer: { fontSize: FONTS.sizes.md, color: COLORS.gray900, lineHeight: 22 },
  submittedAt: { fontSize: FONTS.sizes.xs, color: COLORS.gray500, marginTop: SPACING.md },
  hint: { fontSize: FONTS.sizes.sm, color: COLORS.gray500, marginTop: SPACING.md },
});

export default TherapistResourceDetailScreen;
