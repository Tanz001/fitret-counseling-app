import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { formatEtb } from '../constants/currency';

const MOCK_TRANSACTIONS = [
  {
    id: 'tx_1',
    therapist: 'Dr. Aisha Rahman',
    service: 'Video Therapy Session',
    date: 'Oct 12, 2026',
    time: '10:00 AM',
    amount: formatEtb(120),
    method: 'Visa •••• 4242',
    status: 'Completed',
  },
  {
    id: 'tx_2',
    therapist: 'Dr. Marcus Webb',
    service: 'Couples Counseling',
    date: 'Sep 28, 2026',
    time: '02:00 PM',
    amount: formatEtb(150),
    method: 'MasterCard •••• 8812',
    status: 'Completed',
  },
  {
    id: 'tx_3',
    therapist: 'Dr. Sarah Jenkins',
    service: 'Initial Consultation',
    date: 'Sep 10, 2026',
    time: '11:00 AM',
    amount: formatEtb(90),
    method: 'Apple Pay',
    status: 'Completed',
  },
  {
    id: 'tx_4',
    therapist: 'Dr. Aisha Rahman',
    service: 'Video Therapy Session',
    date: 'Aug 24, 2026',
    time: '10:00 AM',
    amount: formatEtb(120),
    method: 'Visa •••• 4242',
    status: 'Completed',
  }
];

const PatientTransactionsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <CustomIcon name="chevron-back" size={24} color={COLORS.gray900} iconType="Ionicons" touchable={false} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transactions</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.summaryCard}>
           <Text style={styles.summaryTitle}>Total Spent (YTD)</Text>
           <Text style={styles.summaryAmount}>{formatEtb(480)}</Text>
           <Text style={styles.summarySubtitle}>4 Sessions in 2026</Text>
        </View>

        <Text style={styles.sectionTitle}>Recent History</Text>
        
        {MOCK_TRANSACTIONS.map((tx) => (
          <View key={tx.id} style={styles.txCard}>
            <View style={styles.txHeader}>
              <View style={styles.iconBg}>
                <CustomIcon name="receipt" size={20} color={COLORS.primary} iconType="Ionicons" touchable={false} />
              </View>
              <View style={styles.txMainInfo}>
                <Text style={styles.txTherapist}>{tx.therapist}</Text>
                <Text style={styles.txService}>{tx.service}</Text>
              </View>
              <Text style={styles.txAmount}>{tx.amount}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.txFooter}>
              <View style={styles.txDetailRow}>
                <CustomIcon name="calendar-outline" size={14} color={COLORS.gray500} style={styles.detailIcon} iconType="Ionicons" touchable={false} />
                <Text style={styles.txDetailText}>{tx.date}</Text>
              </View>
              <View style={styles.txDetailRow}>
                <CustomIcon name="card-outline" size={14} color={COLORS.gray500} style={styles.detailIcon} iconType="Ionicons" touchable={false} />
                <Text style={styles.txDetailText}>{tx.method}</Text>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.downloadBtn}>
          <CustomIcon name="download-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} iconType="Ionicons" touchable={false} />
          <Text style={styles.downloadBtnText}>Download Yearly Statement</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  scrollContent: { padding: SPACING.lg },
  
  summaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  summaryTitle: { fontSize: FONTS.sizes.md, color: 'rgba(255,255,255,0.8)', fontWeight: '500', marginBottom: SPACING.sm },
  summaryAmount: { fontSize: FONTS.sizes.hero, color: COLORS.white, fontWeight: '700', marginBottom: 4 },
  summarySubtitle: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.md },
  
  txCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray50,
  },
  txHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBg: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary + '15',
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md
  },
  txMainInfo: { flex: 1 },
  txTherapist: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.gray900, marginBottom: 2 },
  txService: { fontSize: FONTS.sizes.sm, color: COLORS.gray500 },
  txAmount: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  
  divider: { height: 1, backgroundColor: COLORS.gray100, marginVertical: SPACING.md },
  
  txFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  txDetailRow: { flexDirection: 'row', alignItems: 'center' },
  detailIcon: { marginRight: 4 },
  txDetailText: { fontSize: FONTS.sizes.sm, color: COLORS.gray600, fontWeight: '500' },
  
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xxl,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  downloadBtnText: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: '600' }
});

export default PatientTransactionsScreen;
