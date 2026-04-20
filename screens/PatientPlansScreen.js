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
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { formatEtb } from '../constants/currency';
import { supabase } from '../utils/supabase';

const PatientPlansScreen = ({ navigation }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [buyingPlanId, setBuyingPlanId] = useState(null);

  const fetchPlans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('id, name, description, sessions_count, price, duration_days, is_active')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (e) {
      console.error('Error fetching plans:', e);
      setPlans([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPlans();
    }, [fetchPlans]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlans();
  };

  const handleBuyPlan = async (plan) => {
    try {
      setBuyingPlanId(plan.id);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in to buy a plan.');

      const startDate = new Date();
      const endDate = plan.duration_days
        ? new Date(startDate.getTime() + plan.duration_days * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10)
        : null;

      const { error } = await supabase.from('user_plans').insert({
        patient_id: user.id,
        plan_id: plan.id,
        sessions_total: plan.sessions_count,
        sessions_remaining: plan.sessions_count,
        start_date: startDate.toISOString().slice(0, 10),
        end_date: endDate,
        status: 'active',
      });
      if (error) throw error;

      Alert.alert('Plan purchased', `${plan.name} is now active on your account.`);
      fetchPlans();
    } catch (e) {
      console.error('Error buying plan:', e);
      Alert.alert('Purchase failed', e.message || 'Could not buy this plan.');
    } finally {
      setBuyingPlanId(null);
    }
  };

  const renderPlan = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconWrap}>
          <CustomIcon name="layers" size={22} color={COLORS.primary} iconType="Feather" touchable={false} />
        </View>
        <View style={styles.cardTitleCol}>
          <Text style={styles.planName} numberOfLines={2} ellipsizeMode="tail">
            {item.name}
          </Text>
          {item.duration_days ? (
            <View style={styles.durationBadge}>
              <CustomIcon name="clock" size={12} color={COLORS.primaryDark} iconType="Feather" touchable={false} />
              <Text style={styles.durationBadgeText}>{item.duration_days} days access</Text>
            </View>
          ) : (
            <View style={styles.durationBadgeMuted}>
              <Text style={styles.durationBadgeMutedText}>No fixed end date</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.detailPanel}>
        <Text style={styles.panelTitle}>Plan details</Text>
        <View style={styles.detailRow}>
          <CustomIcon name="calendar" size={16} color={COLORS.gray500} iconType="Feather" touchable={false} />
          <Text style={styles.detailLabel}>Therapy sessions</Text>
          <Text style={styles.detailValue}>{item.sessions_count} included</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailRow}>
          <CustomIcon name="repeat" size={16} color={COLORS.gray500} iconType="Feather" touchable={false} />
          <Text style={styles.detailLabel}>Session use</Text>
          <Text style={styles.detailValue}>Book sessions until used</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailRow}>
          <CustomIcon name="credit-card" size={16} color={COLORS.gray500} iconType="Feather" touchable={false} />
          <Text style={styles.detailLabel}>Plan price</Text>
          <Text style={styles.detailValue}>{formatEtb(item.price)}</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailRow}>
          <CustomIcon name="shield" size={16} color={COLORS.gray500} iconType="Feather" touchable={false} />
          <Text style={styles.detailLabel}>Access period</Text>
          <Text style={styles.detailValue}>
            {item.duration_days ? `${item.duration_days} days from purchase` : 'No duration set'}
          </Text>
        </View>
      </View>

      {item.description ? (
        <View style={styles.aboutBlock}>
          <Text style={styles.aboutTitle}>About this plan</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.actionBtn, buyingPlanId === item.id && styles.actionBtnDisabled]}
        disabled={buyingPlanId === item.id}
        onPress={() => handleBuyPlan(item)}
        activeOpacity={0.85}
      >
        {buyingPlanId === item.id ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <Text style={styles.actionBtnText}>Buy plan</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.offWhite} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerSide} activeOpacity={0.8}>
          <CustomIcon name="chevron-left" size={24} color={COLORS.gray900} iconType="Feather" touchable={false} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            All plans
          </Text>
        </View>
        <View style={styles.headerSide} />
      </View>
      <Text style={styles.subtitle}>Browse available plans. Prices are in ETB.</Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id}
          renderItem={renderPlan}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <CustomIcon name="package" size={48} color={COLORS.gray300} iconType="Feather" touchable={false} />
              <Text style={styles.emptyTitle}>No plans yet</Text>
              <Text style={styles.emptyText}>Check back soon or contact support for available packages.</Text>
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
  subtitle: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    lineHeight: 20,
  },
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
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary + '18',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardTitleCol: { flex: 1, minWidth: 0 },
  planName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary + '14',
  },
  durationBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  durationBadgeMuted: {
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gray100,
  },
  durationBadgeMutedText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.gray500,
  },
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
  aboutBlock: {
    marginBottom: SPACING.md,
  },
  aboutTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  actionBtn: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  actionBtnDisabled: {
    backgroundColor: COLORS.gray300,
  },
  actionBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: {
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray900,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});

export default PatientPlansScreen;
