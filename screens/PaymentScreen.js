import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, ActivityIndicator, Modal, Platform } from 'react-native';
import CustomIcon from '../components/CustomIcon';
import { supabase } from '../utils/supabase';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { formatEtb } from '../constants/currency';

const PaymentScreen = ({ navigation, route }) => {
  const { therapist, date, time, dbDate, dbTime, amount } = route?.params || {};
  const [selectedMethod, setSelectedMethod] = useState('chapa');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

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

      let data = null;
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
            fee: amount || 120,
            payment_method,
            status: 'pending',
            notes: '',
          })
          .select()
          .single();

        if (!res.error) {
          data = res.data;
          lastError = null;
          break;
        }

        lastError = res.error;

        // If it's specifically the payment_method check constraint, try other normalizations.
        if (!String(res.error?.message || '').includes('appointments_payment_method_check')) {
          break;
        }
      }

      if (lastError) throw lastError;

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <CustomIcon name="chevron-left" size={24} color={COLORS.gray700} iconType="Feather" touchable={false} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Image source={therapist?.image || require('../assets/person.webp')} style={styles.avatar} />
          <Text style={styles.therapistName}>{therapist?.name || 'Dr. Aisha Rahman'}</Text>
          <Text style={styles.sessionInfo}>Session on {date} at {time}</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Total Fee</Text>
            <Text style={styles.amount}>{formatEtb(amount || 120)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        
        <PaymentOption id="chapa" label="Chapa (Credit / Mobile Money)" icon="credit-card" iconType="Feather" />
        <PaymentOption id="wallet" label="Wallet Balance" icon="pocket" iconType="Feather" />
        <PaymentOption id="cash" label="Cash After Session" icon="dollar-sign" iconType="Feather" />

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.payBtn, loading && styles.payBtnDisabled]} 
          onPress={handlePay}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.payBtnText}>Confirm and Pay {formatEtb(amount || 120)}</Text>}
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
                <Text style={styles.infoValue}>Total Paid: {formatEtb(amount || 120)}</Text>
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
    justifyContent: 'space-between',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
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
