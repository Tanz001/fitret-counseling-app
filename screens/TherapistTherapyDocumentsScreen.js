/**
 * Lists therapy_documents visible to the signed-in therapist (RLS), including
 * admin-uploaded worksheets, journals, exercises, audio, etc. Admin rows should
 * set therapist_id to this therapist (and patient_id when assigned to a patient).
 */
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { supabase } from '../utils/supabase';
import { resolveTherapyFileUrl } from '../utils/resolveTherapyFileUrl';

const TYPE_LABELS = {
  worksheet: 'Worksheet',
  journal: 'Journal',
  exercise: 'Exercise',
  audio: 'Audio',
  other: 'Other',
};

function formatType(t) {
  const k = String(t || 'other').toLowerCase();
  return TYPE_LABELS[k] || TYPE_LABELS.other;
}

const TherapistTherapyDocumentsScreen = ({ navigation }) => {
  const [rows, setRows] = useState([]);
  const [patientNames, setPatientNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listError, setListError] = useState(null);
  const [openingId, setOpeningId] = useState(null);

  const loadDocuments = useCallback(async () => {
    setListError(null);
    try {
      const { data, error } = await supabase
        .from('therapy_documents')
        .select('id, title, description, file_url, document_type, patient_id, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const list = data || [];
      setRows(list);

      const patientIds = [...new Set(list.map((r) => r.patient_id).filter(Boolean))];
      if (patientIds.length > 0) {
        const { data: users, error: uErr } = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', patientIds);
        if (!uErr && users) {
          const map = {};
          users.forEach((u) => {
            map[u.id] = u.full_name || 'Patient';
          });
          setPatientNames(map);
        } else {
          setPatientNames({});
        }
      } else {
        setPatientNames({});
      }
    } catch (e) {
      console.warn('therapy_documents (therapist) fetch:', e);
      setListError(e.message || 'Could not load documents');
      setRows([]);
      setPatientNames({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadDocuments();
    }, [loadDocuments]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDocuments();
  };

  const openDocument = async (item) => {
    setOpeningId(item.id);
    try {
      const url = await resolveTherapyFileUrl(item.file_url);
      if (!url) {
        Alert.alert('Unavailable', 'No file URL is set for this document.');
        return;
      }
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Could not open the document.');
    } finally {
      setOpeningId(null);
    }
  };

  const renderItem = ({ item }) => {
    const patientLabel = item.patient_id ? patientNames[item.patient_id] || 'Patient' : '—';
    const busy = openingId === item.id;
    const created = item.created_at ? new Date(item.created_at).toLocaleDateString() : '';

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.typePill}>
            <Text style={styles.typePillText}>{formatType(item.document_type)}</Text>
          </View>
          <Text style={styles.dateText}>{created}</Text>
        </View>
        <Text style={styles.title}>{item.title || 'Untitled'}</Text>
        {item.description ? (
          <Text style={styles.desc} numberOfLines={3}>
            {item.description}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <CustomIcon name="user" size={14} color={COLORS.gray500} iconType="Feather" touchable={false} />
          <Text style={styles.metaText} numberOfLines={1}>
            {item.patient_id ? `Patient: ${patientLabel}` : 'Not assigned to a patient'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.openBtn}
          onPress={() => openDocument(item)}
          disabled={busy}
          activeOpacity={0.85}
        >
          {busy ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <CustomIcon name="external-link" size={18} color={COLORS.white} iconType="Feather" touchable={false} />
              <Text style={styles.openBtnText}>Open file</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerSide} onPress={() => navigation.goBack()} hitSlop={12}>
          <CustomIcon name="chevron-left" size={24} color={COLORS.gray900} iconType="Feather" touchable={false} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Client documents
        </Text>
        <View style={styles.headerSide} />
      </View>

      <Text style={styles.intro}>
        Materials uploaded by your team (worksheets, journals, exercises, and more) appear here when you are listed as
        the therapist on the document.
      </Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : listError ? (
        <View style={styles.centered}>
          <CustomIcon name="alert-circle" size={40} color={COLORS.gray400} iconType="Feather" touchable={false} />
          <Text style={styles.errorText}>{listError}</Text>
          <Text style={styles.hintText}>
            Confirm RLS allows select when therapist_id matches your account, and that admin rows set therapist_id.
          </Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={rows.length === 0 ? styles.emptyList : styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <CustomIcon name="folder" size={48} color={COLORS.gray300} iconType="Feather" touchable={false} />
              <Text style={styles.emptyTitle}>No documents yet</Text>
              <Text style={styles.emptyText}>
                When an admin assigns materials to you (therapist_id), they will show up here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerSide: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.gray900,
  },
  intro: {
    fontSize: FONTS.sizes.sm,
    lineHeight: 20,
    color: COLORS.gray600,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  list: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  emptyList: { flexGrow: 1 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  typePill: {
    backgroundColor: COLORS.primary + '22',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  typePillText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
  },
  dateText: { fontSize: FONTS.sizes.xs, color: COLORS.gray500 },
  title: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.gray900,
    marginBottom: 6,
  },
  desc: { fontSize: FONTS.sizes.sm, color: COLORS.gray600, lineHeight: 20, marginBottom: SPACING.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.md, minWidth: 0 },
  metaText: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.gray600 },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  openBtnText: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold, color: COLORS.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  errorText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  hintText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    lineHeight: 20,
  },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxl * 2, paddingHorizontal: SPACING.lg },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.gray700,
    marginTop: SPACING.lg,
  },
  emptyText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
});

export default TherapistTherapyDocumentsScreen;
