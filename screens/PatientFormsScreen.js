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
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { fetchPatientForms } from '../services/formsApi';
import { resolveTherapyFileUrl } from '../utils/resolveTherapyFileUrl';
import { buildFormOpenUrl } from '../utils/openFormUrl';

const PatientFormsScreen = ({ navigation }) => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPatientForms();
      setForms(data);
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not load forms');
      setForms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openForm = async (form) => {
    setOpeningId(form.id);
    try {
      let url = String(form.file_url || '').trim();
      if (!url) {
        Alert.alert('Unavailable', 'This form has no file attached yet.');
        return;
      }
      if (!/^https?:\/\//i.test(url)) {
        url = await resolveTherapyFileUrl(url);
      }
      if (!url) {
        Alert.alert('Unavailable', 'This form has no file attached yet.');
        return;
      }

      const openUrl = buildFormOpenUrl(url, form.file_type);
      try {
        await Linking.openURL(openUrl);
      } catch (linkErr) {
        try {
          await Linking.openURL(url);
        } catch {
          Alert.alert(
            'Could not open form',
            linkErr?.message || 'Please install a browser or PDF viewer and try again.',
          );
        }
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not open form');
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <CustomIcon name="chevron-left" size={24} color={COLORS.gray900} iconType="Feather" touchable={false} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forms</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.sectionDesc}>
            Forms assigned to you by your care team. Tap to view or download.
          </Text>
          {forms.length === 0 ? (
            <Text style={styles.empty}>No forms assigned yet.</Text>
          ) : (
            forms.map((form) => (
              <TouchableOpacity
                key={form.id}
                style={styles.card}
                onPress={() => openForm(form)}
                disabled={openingId === form.id}
                activeOpacity={0.8}
              >
                <View style={styles.iconWrap}>
                  <CustomIcon name="file-text" size={22} color={COLORS.primary} iconType="Feather" touchable={false} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{form.title}</Text>
                  {form.description ? (
                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {form.description}
                    </Text>
                  ) : null}
                  <Text style={styles.meta}>
                    {(form.file_type || 'document').toUpperCase()}
                  </Text>
                </View>
                {openingId === form.id ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : (
                  <CustomIcon name="chevron-right" size={20} color={COLORS.gray400} iconType="Feather" touchable={false} />
                )}
              </TouchableOpacity>
            ))
          )}
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
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  sectionDesc: { fontSize: FONTS.sizes.sm, color: COLORS.gray500, marginBottom: SPACING.lg, lineHeight: 20 },
  empty: { textAlign: 'center', color: COLORS.gray500, marginTop: SPACING.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.gray900 },
  cardDesc: { fontSize: FONTS.sizes.xs, color: COLORS.gray500, marginTop: 4 },
  meta: { fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: '600', marginTop: 6 },
});

export default PatientFormsScreen;
