import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, ActivityIndicator, Modal, Platform } from 'react-native';
import CustomIcon from '../components/CustomIcon';
import { supabase } from '../utils/supabase';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { formatEtb } from '../constants/currency';

const PaymentScreen = ({ navigation, route }) => {
  const { therapist, date, time, dbDate, dbTime, sessionType = 'general', selectedPlan, amount } = route?.params || {};
  const [selectedMethod, setSelectedMethod] = useState('chapa');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activePlans, setActivePlans] = useState([]);
  const [selectedUserPlan, setSelectedUserPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);

  const fetchActivePlans = useCallback(async () => {
    try {
      setPlanLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setActivePlans([]);
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      const { data: userPlans, error: userPlansError } = await supabase
        .from('user_plans')
        .select('id, plan_id, sessions_remaining, sessions_total, start_date, end_date, status')
        .eq('patient_id', user.id)
        .eq('status', 'active');
      if (userPlansError) throw userPlansError;

      const activeRows = (userPlans || []).filter((p) => !p.end_date || p.end_date >= today);
      const userPlanIds = activeRows.map((p) => p.id).filter(Boolean);
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

      const planIds = [...new Set(activeRows.map((p) => p.plan_id).filter(Boolean))];
      let planMap = {};
      if (planIds.length > 0) {
        const { data: plansData, error: plansError } = await supabase
          .from('plans')
          .select('id, name, description, sessions_count, price, duration_days')
          .in('id', planIds);
        if (plansError) throw plansError;
        (plansData || []).forEach((p) => {
          planMap[p.id] = p;
        });
      }

      const merged = activeRows
        .map((up) => {
          const plan = planMap[up.plan_id] || null;
          const used = usedByUserPlanId[up.id] || 0;
          const totalFromPlan = Number(plan?.sessions_count ?? 0);
          const total =
            Number(up.sessions_total ?? 0) > 0
              ? Number(up.sessions_total)
              : totalFromPlan > 0
                ? totalFromPlan
                : 0;
          const remainingEffective =
            total > 0
              ? Math.max(0, total - used)
              : Math.max(0, Number(up.sessions_remaining || 0) - used);
          return {
            ...up,
            plan,
            usedSessions: used,
            remainingEffective,
            sessions_remaining: remainingEffective,
          };
        })
        .filter((p) => p.remainingEffective > 0);
      setActivePlans(merged);

      const preselectedId = selectedPlan?.id;
      const initialPlan =
        merged.find((p) => p.id === preselectedId || p.plan_id === preselectedId) ||
        merged[0] ||
        null;
      setSelectedUserPlan(initialPlan);
      if (initialPlan) setSelectedMethod('plan');
    } catch (error) {
      console.error('Error loading active plans:', error);
      setActivePlans([]);
      setSelectedUserPlan(null);
    } finally {
      setPlanLoading(false);
    }
  }, [selectedPlan?.id]);

  useEffect(() => {
    fetchActivePlans();
  }, [fetchActivePlans]);

  const handlePay = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (selectedMethod === 'plan') {
        const planRemaining =
          Number(selectedUserPlan?.remainingEffective ?? selectedUserPlan?.sessions_remaining ?? 0) || 0;
        if (!selectedUserPlan || planRemaining <= 0) {
          throw new Error('No active plan session available.');
        }

        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .insert({
            patient_id: user.id,
            therapist_id: therapist.id,
            appointment_date: dbDate,
            appointment_time: dbTime,
            session_type: sessionType,
            fee: 0,
            payment_method: 'wallet',
            status: 'pending',
            notes: '',
          })
          .select()
          .single();
        if (appointmentError) throw appointmentError;

        const { error: usageError } = await supabase.from('plan_usages').insert({
          user_plan_id: selectedUserPlan.id,
          appointment_id: appointmentData.id,
          used_sessions: 1,
        });
        if (usageError) throw usageError;

        const newRemaining = Math.max(0, planRemaining - 1);
        const { error: updatePlanError } = await supabase
          .from('user_plans')
          .update({
            sessions_remaining: newRemaining,
            status: newRemaining <= 0 ? 'expired' : 'active',
          })
          .eq('id', selectedUserPlan.id)
          .select('id, sessions_remaining, status')
          .single();
        if (updatePlanError) throw updatePlanError;
      } else {
        const baseMethod = String(selectedMethod || '').trim();
        const normalizedUpper = baseMethod.toUpperCase();
        const normalizedLower = baseMethod.toLowerCase();
        const normalizedTitle =
          normalizedLower.length > 0
            ? normalizedLower.charAt(0).toUpperCase() + normalizedLower.slice(1)
            : baseMethod;

        const paymentMethodAttempts = Array.from(
          new Set([normalizedUpper, normalizedTitle, normalizedLower])
        );

        let lastError = null;

        for (let i = 0; i < paymentMethodAttempts.length; i++) {
          const payment_method = paymentMethodAttempts[i];
          const res = await supabase
            .from('appointments')
            .insert({
              patient_id: user.id,
              therapist_id: therapist.id,
              appointment_date: dbDate,
              appointment_time: dbTime,
              session_type: sessionType,
              fee: amount || 120,
              payment_method,
              status: 'pending',
              notes: '',
            })
            .select()
            .single();

          if (!res.error) {
            lastError = null;
            break;
          }

          lastError = res.error;
          if (!String(res.error?.message || '').includes('appointments_payment_method_check')) {
            break;
          }
        }

        if (lastError) throw lastError;
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const closeAndFinish = () => {
    setShowSuccessModal(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'PatientTabNavigator' }],
    });
  };

  const PaymentOption = ({ id, label, icon, iconType = "Ionicons" }) => (
    <TouchableOpacity
      style={[styles.paymentRow, selectedMethod === id && styles.paymentRowActive]}
      onPress={() => setSelectedMethod(id)}
    >
      <CustomIcon name={icon} size={24} color={selectedMethod === id ? COLORS.primary : COLORS.gray500} iconType={iconType} touchable={false} />
      <Text style={[styles.paymentLabel, selectedMethod === id && styles.paymentLabelActive]}>{label}</Text>
      {selectedMethod === id && <CustomIcon name="checkmark-circle" size={24} color={COLORS.primary} iconType="Ionicons" touchable={false} />}
    </TouchableOpacity>
  );

  const totalPayable = selectedMethod === 'plan' ? 0 : (amount || 120);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerSide}>
          <CustomIcon name="chevron-left" size={24} color={COLORS.gray700} iconType="Feather" touchable={false} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            Payment
          </Text>
        </View>
        <View style={styles.headerSide} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Image source={therapist?.image || require('../assets/person.webp')} style={styles.avatar} />
          <Text style={styles.therapistName}>{therapist?.name || 'Dr. Aisha Rahman'}</Text>
          <Text style={styles.sessionInfo}>Session on {date} at {time}</Text>
          <Text style={styles.sessionTypeText}>
            Type: {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)}
          </Text>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Total Fee</Text>
            <Text style={styles.amount}>{formatEtb(totalPayable)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        {planLoading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginBottom: SPACING.md }} />
        ) : activePlans.length > 0 ? (
          <TouchableOpacity
            style={[styles.paymentRow, selectedMethod === 'plan' && styles.paymentRowActive]}
            onPress={() => setSelectedMethod('plan')}
          >
            <CustomIcon
              name="layers"
              size={24}
              color={selectedMethod === 'plan' ? COLORS.primary : COLORS.gray500}
              iconType="Feather"
              touchable={false}
            />
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={[styles.paymentLabel, selectedMethod === 'plan' && styles.paymentLabelActive]}>
                Use plan session ({selectedUserPlan?.sessions_remaining || 0} left)
              </Text>
              <Text style={styles.planHint}>
                {selectedUserPlan?.plan?.name || 'Active plan'} - no fee will be charged
              </Text>
            </View>
            {selectedMethod === 'plan' && (
              <CustomIcon name="checkmark-circle" size={24} color={COLORS.primary} iconType="Ionicons" touchable={false} />
            )}
          </TouchableOpacity>
        ) : null}
        
        <PaymentOption id="chapa" label="Chapa (Credit / Mobile Money)" icon="credit-card" iconType="Feather" />
        <PaymentOption id="wallet" label="Wallet Balance" icon="pocket" iconType="Feather" />
        <PaymentOption id="cash" label="Cash After Session" icon="dollar-sign" iconType="Feather" />

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.payBtn, loading && styles.payBtnDisabled]} 
          onPress={handlePay}
          disabled={loading || (selectedMethod === 'plan' && !selectedUserPlan)}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.payBtnText}>Confirm and Pay {formatEtb(totalPayable)}</Text>}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconCircle}>
              <CustomIcon name="check" size={40} color={COLORS.white} iconType="Feather" touchable={false} />
            </View>
            <Text style={styles.successTitle}>Booking Successful!</Text>
            <Text style={styles.successSubtitle}>Your appointment with {therapist?.name} has been confirmed.</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <CustomIcon name="calendar" size={16} color={COLORS.gray500} iconType="Feather" touchable={false} />
                <Text style={styles.infoValue}>{date}</Text>
              </View>
              <View style={styles.infoRow}>
                <CustomIcon name="clock" size={16} color={COLORS.gray500} iconType="Feather" touchable={false} />
                <Text style={styles.infoValue}>{time}</Text>
              </View>
              <View style={styles.infoRow}>
                <CustomIcon name="dollar-sign" size={16} color={COLORS.gray500} iconType="Feather" touchable={false} />
                <Text style={styles.infoValue}>Total Paid: {formatEtb(totalPayable)}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={closeAndFinish}>
              <Text style={styles.doneBtnText}>Go to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    borderRadius: 22,
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
  content: { padding: SPACING.lg, paddingBottom: 120 },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, marginBottom: SPACING.md },
  therapistName: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  sessionInfo: { fontSize: FONTS.sizes.sm, color: COLORS.gray500, marginTop: 4 },
  sessionTypeText: { fontSize: FONTS.sizes.sm, color: COLORS.gray700, marginTop: 4, fontWeight: '600' },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: SPACING.lg, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
  amountLabel: { fontSize: FONTS.sizes.md, color: COLORS.gray600 },
  amount: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.primary },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.md },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.gray200,
  },
  paymentRowActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '08' },
  paymentLabel: { flex: 1, marginLeft: SPACING.md, fontSize: FONTS.sizes.md, fontWeight: '500', color: COLORS.gray700 },
  paymentLabelActive: { color: COLORS.gray900, fontWeight: '600' },
  planHint: { fontSize: FONTS.sizes.xs, color: COLORS.gray500, marginTop: 2 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SPACING.lg, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
  payBtn: { backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: RADIUS.lg, alignItems: 'center' },
  payBtnDisabled: { backgroundColor: COLORS.gray300 },
  payBtnText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  successModal: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  successSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  infoCard: {
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    width: '100%',
    marginBottom: SPACING.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: 12,
  },
  infoValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  doneBtn: {
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  doneBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
  },
});

export default PaymentScreen;
