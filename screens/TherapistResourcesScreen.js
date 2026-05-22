import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { fetchTherapistResources } from '../services/resourcesApi';

const TYPE_LABELS = {
  worksheet: 'Worksheet',
  journal: 'Journal',
  exercise: 'Exercise',
  audio: 'Audio',
};

const TherapistResourcesScreen = ({ navigation, route }) => {
  const patientId = route.params?.patientId ?? null;
  const patientName = route.params?.patientName ?? null;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listError, setListError] = useState(null);

  const load = useCallback(async () => {
    setListError(null);
    try {
      setRows(await fetchTherapistResources(patientId));
    } catch (e) {
      setListError(e.message || 'Could not load resources');
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

  const renderItem = ({ item }) => {
    const { resource } = item;
    const typeLabel = TYPE_LABELS[resource.resource_type] || resource.resource_type;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('TherapistResourceDetail', {
            resource,
            patientId: item.patientId,
            patientName: item.patientName,
            status: item.status,
          })
        }
      >
        <View style={styles.cardTop}>
          <View style={styles.typePill}>
            <Text style={styles.typePillText}>{typeLabel}</Text>
          </View>
          <View
            style={[
              styles.statusPill,
              item.status === 'Completed' ? styles.statusDone : styles.statusPending,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === 'Completed' ? styles.statusTextDone : styles.statusTextPending,
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
        <Text style={styles.title}>{resource.title}</Text>
        {resource.description ? (
          <Text style={styles.desc} numberOfLines={2}>
            {resource.description}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <CustomIcon name="user" size={14} color={COLORS.gray500} iconType="Feather" touchable={false} />
          <Text style={styles.metaText} numberOfLines={1}>
            {item.patientName}
          </Text>
        </View>
        <View style={styles.viewRow}>
          <Text style={styles.viewLink}>View details</Text>
          <CustomIcon name="chevron-right" size={18} color={COLORS.primary} iconType="Feather" touchable={false} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerSide} onPress={() => navigation.goBack()}>
          <CustomIcon name="chevron-left" size={24} color={COLORS.gray900} iconType="Feather" touchable={false} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {patientName ? `${patientName.split(' ')[0]}'s resources` : 'Client resources'}
        </Text>
        <View style={styles.headerSide} />
      </View>

      <Text style={styles.intro}>
        {patientName
          ? `Resources assigned to ${patientName}. Tap to view details and responses.`
          : 'Resources assigned to your clients. Tap an item to view details and patient responses.'}
      </Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
      ) : listError ? (
        <Text style={styles.errorText}>{listError}</Text>
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
                ? `No resources assigned to ${patientName} yet.`
                : 'No resources assigned to your clients yet.'}
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
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typePill: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  typePillText: { fontSize: 11, fontWeight: '700', color: COLORS.primaryDark },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.sm },
  statusDone: { backgroundColor: COLORS.primaryLight + '99' },
  statusPending: { backgroundColor: COLORS.gray100 },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextDone: { color: COLORS.primaryDark },
  statusTextPending: { color: COLORS.gray600 },
  title: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.gray900 },
  desc: { fontSize: FONTS.sizes.sm, color: COLORS.gray500, marginTop: 4, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  metaText: { marginLeft: 6, fontSize: FONTS.sizes.sm, color: COLORS.gray600, flex: 1 },
  viewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 10 },
  viewLink: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.primary, marginRight: 4 },
  empty: { textAlign: 'center', color: COLORS.gray500, marginTop: SPACING.xl },
  errorText: { textAlign: 'center', color: COLORS.error, marginTop: SPACING.xl, paddingHorizontal: SPACING.lg },
});

export default TherapistResourcesScreen;
