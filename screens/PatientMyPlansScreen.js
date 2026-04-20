import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { formatEtb } from '../constants/currency';
import { supabase } from '../utils/supabase';

const PatientMyPlansScreen = ({ navigation }) => {
  const [myPlans, setMyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyPlans = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setMyPlans([]);
        return;
      }

      const { data: userPlans, error: userPlansError } = await supabase
        .from('user_plans')
        .select('id, patient_id, plan_id, sessions_remaining, sessions_total, start_date, end_date, status, created_at')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });
      if (userPlansError) throw userPlansError;

      const planIds = [...new Set((userPlans || []).map((u) => u.plan_id).filter(Boolean))];
      let planMap = {};
      if (planIds.length > 0) {
        const { data: joinedPlans, error: joinedPlansError } = await supabase
          .from('plans')
          .select('id, name, description, sessions_count, price, duration_days')
          .in('id', planIds);
        if (joinedPlansError) throw joinedPlansError;
        (joinedPlans || []).forEach((p) => {
          planMap[p.id] = p;
        });
      }

      const userPlanIds = (userPlans || []).map((u) => u.id).filter(Boolean);
      const usedByUserPlanId = {};
      if (userPlanIds.length > 0) {
        const { data: usages, error: usagesError } = await supabase
          .from('plan_usages')
          .select('user_plan_id')
          .in('user_plan_id', userPlanIds);
        if (usagesError) throw usagesError;
        (usages || []).forEach((row) => {
          const id = row.user_plan_id;
          if (!id) return;
          usedByUserPlanId[id] = (usedByUserPlanId[id] || 0) + 1;
        });
      }

      const merged = (userPlans || []).map((u) => {
        const plan = planMap[u.plan_id] || null;
        const totalSessions =
          Number(u.sessions_total ?? plan?.sessions_count ?? 0) || 0;
        const usedSessions = usedByUserPlanId[u.id] || 0;
        const remainingEffective = Math.max(0, totalSessions - usedSessions);
        return {
          ...u,
          plan,
          totalSessions,
          usedSessions,
          remainingEffective,
        };
      });
      setMyPlans(merged);
    } catch (e) {
      console.error('Error fetching my plans:', e);
      setMyPlans([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchMyPlans();
    }, [fetchMyPlans]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyPlans();
  };

  const renderItem = ({ item }) => {
    const total = Number(item.totalSessions ?? 0);
    const used = Number(item.usedSessions ?? 0);
    const remaining = Number(item.remainingEffective ?? 0);
    const isActive = item.status === 'active' && remaining > 0;
    const progress = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.iconWrap}>
            <CustomIcon name="layers" size={22} color={COLORS.primary} iconType="Feather" touchable={false} />
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.planName} numberOfLines={2} ellipsizeMode="tail">
              {item.plan?.name || 'Plan'}
            </Text>
            <View style={[styles.statusPill, isActive ? styles.statusPillActive : styles.statusPillInactive]}>
              <Text style={[styles.statusText, isActive ? styles.statusTextActive : styles.statusTextInactive]}>
                {isActive ? 'ACTIVE' : (item.status || '').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Sessions</Text>
            <Text style={styles.progressCount}>
              {remaining} left of {total}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressHint}>{used} session{used === 1 ? '' : 's'} used</Text>
        </View>

        <View style={styles.detailPanel}>
          <Text style={styles.panelTitle}>Your plan</Text>
          <View style={styles.detailRow}>
            <CustomIcon name="calendar" size={16} color={COLORS.gray500} iconType="Feather" touchable={false} />
            <Text style={styles.detailLabel}>Included sessions</Text>
            <Text style={styles.detailValue}>{total}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <CustomIcon name="repeat" size={16} color={COLORS.gray500} iconType="Feather" touchable={false} />
            <Text style={styles.detailLabel}>Remaining</Text>
            <Text style={styles.detailValue}>{remaining}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <CustomIcon name="play-circle" size={16} color={COLORS.gray500} iconType="Feather" touchable={false} />
            <Text style={styles.detailLabel}>Started</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {item.start_date || '—'}
            </Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <CustomIcon name="clock" size={16} color={COLORS.gray500} iconType="Feather" touchable={false} />
            <Text style={styles.detailLabel}>Valid until</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {item.end_date || 'No end date'}
            </Text>
          </View>
          {item.plan?.price != null ? (
            <>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <CustomIcon name="tag" size={16} color={COLORS.gray500} iconType="Feather" touchable={false} />
                <Text style={styles.detailLabel}>Plan price</Text>
                <Text style={styles.detailValue}>{formatEtb(item.plan.price)}</Text>
              </View>
            </>
          ) : null}
        </View>

        {item.plan?.description ? (
          <View style={styles.aboutBlock}>
            <Text style={styles.aboutTitle}>About this plan</Text>
            <Text style={styles.description} numberOfLines={5}>
              {item.plan.description}
            </Text>
          </View>
        ) : null}

        {isActive ? (
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => navigation.navigate('FindTherapists', { selectedPlan: item })}
            activeOpacity={0.85}
          >
            <Text style={styles.bookBtnText}>Book using this plan</Text>
            <CustomIcon name="arrow-right" size={18} color={COLORS.white} iconType="Feather" touchable={false} />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.offWhite} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerSide} activeOpacity={0.8}>
          <CustomIcon name="chevron-left" size={24} color={COLORS.gray900} iconType="Feather" touchable={false} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            My plans
          </Text>
        </View>
        <View style={styles.headerSide} />
      </View>

      <View style={styles.toolbar}>
        <Text style={styles.subtitle}>
          Plans you have purchased. Book sessions with no extra fee when sessions remain.
        </Text>
        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() => navigation.navigate('PatientPlans')}
          activeOpacity={0.85}
        >
          <Text style={styles.viewAllBtnText}>View all plans</Text>
          <CustomIcon name="chevron-right" size={18} color={COLORS.primary} iconType="Feather" touchable={false} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={myPlans}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <CustomIcon name="package" size={48} color={COLORS.gray300} iconType="Feather" touchable={false} />
              <Text style={styles.emptyTitle}>No purchased plans</Text>
              <Text style={styles.emptyText}>Browse available plans and pick one that fits you.</Text>
              <TouchableOpacity style={styles.emptyCta} onPress={() => navigation.navigate('PatientPlans')} activeOpacity={0.85}>
                <Text style={styles.emptyCtaText}>View all plans</Text>
              </TouchableOpacity>
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerSide: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray900,
    textAlign: 'center',
    width: '100%',
  },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  subtitle: {
    flex: 1,
    flexBasis: 200,
    minWidth: 0,
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    lineHeight: 20,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 4,
  },
  viewAllBtnText: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.primary },
  list: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    ...SHADOWS.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary + '18',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  titleBlock: { flex: 1, minWidth: 0 },
  planName: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.xs },
  statusPill: { alignSelf: 'flex-start', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
  statusPillActive: { backgroundColor: '#E6F4EA' },
  statusPillInactive: { backgroundColor: COLORS.gray100 },
  statusText: { fontSize: FONTS.sizes.xs, fontWeight: '700' },
  statusTextActive: { color: COLORS.success },
  statusTextInactive: { color: COLORS.gray500 },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.gray500, textTransform: 'uppercase' },
  progressCount: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.gray900 },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray100,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  progressHint: { fontSize: FONTS.sizes.xs, color: COLORS.gray500, marginTop: 4 },
  detailPanel: {
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  panelTitle: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  detailDivider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: SPACING.sm,
    marginLeft: 22,
  },
  detailLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  detailValue: {
    flexShrink: 0,
    maxWidth: '48%',
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.gray900,
    textAlign: 'right',
  },
  aboutBlock: { marginBottom: SPACING.sm },
  aboutTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: SPACING.xs,
  },
  description: { fontSize: FONTS.sizes.sm, color: COLORS.gray600, lineHeight: 20 },
  bookBtn: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  bookBtnText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: SPACING.xxl * 2, paddingHorizontal: SPACING.xl },
  emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900, marginTop: SPACING.md },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.gray500, textAlign: 'center', marginTop: SPACING.sm },
  emptyCta: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
  },
  emptyCtaText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
});

export default PatientMyPlansScreen;
