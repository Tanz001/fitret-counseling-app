import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { fetchTherapistForms } from '../services/formsApi';
import { resolveTherapyFileUrl } from '../utils/resolveTherapyFileUrl';
import { buildFormOpenUrl } from '../utils/openFormUrl';

const TherapistFormsScreen = ({ navigation, route }) => {
  const patientId = route.params?.patientId ?? null;
  const patientName = route.params?.patientName ?? null;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openingId, setOpeningId] = useState(null);

  const load = useCallback(async () => {
    try {
      setRows(await fetchTherapistForms(patientId));
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not load forms');
      setRows([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [patientId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  const openForm = async (item) => {
    const { form } = item;
    setOpeningId(item.accessId);
    try {
      let url = String(form.file_url || '').trim();
      if (!url) {
        Alert.alert('Unavailable', 'No file attached.');
        return;
      }
      if (!/^https?:\/\//i.test(url)) {
        url = await resolveTherapyFileUrl(url);
      }
      const openUrl = buildFormOpenUrl(url, form.file_type);
      try {
        await Linking.openURL(openUrl);
      } catch {
        await Linking.openURL(url);
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not open form');
    } finally {
      setOpeningId(null);
    }
  };

  const renderItem = ({ item }) => {
    const { form } = item;
    const busy = openingId === item.accessId;

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{form.title}</Text>
        {form.description ? (
          <Text style={styles.desc} numberOfLines={2}>
            {form.description}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <CustomIcon name="user" size={14} color={COLORS.gray500} iconType="Feather" touchable={false} />
          <Text style={styles.metaText}>{item.patientName}</Text>
          <Text style={styles.fileType}>{(form.file_type || 'file').toUpperCase()}</Text>
        </View>
        <TouchableOpacity style={styles.openBtn} onPress={() => openForm(item)} disabled={busy} activeOpacity={0.85}>
          {busy ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <CustomIcon name="external-link" size={16} color={COLORS.white} iconType="Feather" touchable={false} />
              <Text style={styles.openBtnText}>Open form</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerSide} onPress={() => navigation.goBack()}>
          <CustomIcon name="chevron-left" size={24} color={COLORS.gray900} iconType="Feather" touchable={false} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {patientName ? `${patientName.split(' ')[0]}'s forms` : 'Client forms'}
        </Text>
        <View style={styles.headerSide} />
      </View>

      <Text style={styles.intro}>
        {patientName
          ? `Forms assigned to ${patientName}. Open to preview the document.`
          : 'Forms assigned to your clients. Open to preview the document.'}
      </Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.accessId}
          renderItem={renderItem}
          contentContainerStyle={rows.length === 0 ? styles.emptyList : styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              {patientName
                ? `No forms assigned to ${patientName} yet.`
                : 'No forms assigned to your clients yet.'}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerSide: { width: 44 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  intro: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray600,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    lineHeight: 20,
  },
  list: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  emptyList: { flexGrow: 1, padding: SPACING.lg },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  title: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.gray900 },
  desc: { fontSize: FONTS.sizes.sm, color: COLORS.gray500, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  metaText: { flex: 1, marginLeft: 6, fontSize: FONTS.sizes.sm, color: COLORS.gray600 },
  fileType: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    marginTop: 12,
  },
  openBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.sm, marginLeft: 8 },
  empty: { textAlign: 'center', color: COLORS.gray500, marginTop: SPACING.xl },
});

export default TherapistFormsScreen;
