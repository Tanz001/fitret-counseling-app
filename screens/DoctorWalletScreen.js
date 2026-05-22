import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { formatEtb, formatEtbSigned } from '../constants/currency';

const MOCK_TRANSACTIONS = [
  { id: '1', title: 'Session with John Doe', date: 'Today, 11:00 AM', amount: formatEtbSigned(120, 'credit'), type: 'credit', status: 'Completed' },
  { id: '2', title: 'Withdrawal to Bank', date: 'Yesterday, 06:30 PM', amount: formatEtbSigned(500, 'debit'), type: 'debit', status: 'Processing' },
  { id: '3', title: 'Session with Sarah M.', date: 'Oct 12, 02:00 PM', amount: formatEtbSigned(150, 'credit'), type: 'credit', status: 'Completed' },
  { id: '4', title: 'Session with Marcus Webb', date: 'Oct 10, 09:00 AM', amount: formatEtbSigned(120, 'credit'), type: 'credit', status: 'Completed' },
  { id: '5', title: 'Platform Fee (Oct)', date: 'Oct 01, 12:00 PM', amount: formatEtbSigned(45, 'debit'), type: 'debit', status: 'Completed' },
];

const DoctorWalletScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.transactionRow} activeOpacity={0.9}>
       <View style={[styles.iconContainer, item.type === 'debit' ? styles.debitIcon : styles.creditIcon]}>
          <CustomIcon name={item.type === 'debit' ? 'arrow-up' : 'arrow-down'} size={20} color={item.type === 'debit' ? COLORS.error : COLORS.success} iconType="Feather" touchable={false} />
       </View>
       <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <View style={styles.txMetaRow}>
            <Text style={styles.transactionDate}>{item.date}</Text>
            {item.status === 'Processing' && (
              <View style={styles.processingBadge}>
                <Text style={styles.processingText}>Processing</Text>
              </View>
            )}
          </View>
       </View>
       <Text style={[styles.transactionAmount, item.type === 'debit' ? styles.debitAmount : styles.creditAmount]}>
          {item.amount}
       </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Top Green Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
             <CustomIcon name="chevron-left" size={24} color={COLORS.white} iconType="Feather" touchable={false} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet & Earnings</Text>
          <TouchableOpacity style={styles.headerBtn}>
             <CustomIcon name="clock" size={24} color={COLORS.white} iconType="Feather" touchable={false} />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
           <Text style={styles.balanceLabel}>Available for Withdrawal</Text>
           <Text style={styles.balanceAmount}>{formatEtb(1250)}</Text>
           
           <View style={styles.heroStatsRow}>
             <View style={styles.heroStatItem}>
               <Text style={styles.heroStatTitle}>Total Earned YTD</Text>
               <Text style={styles.heroStatValue}>{formatEtb(24500)}</Text>
             </View>
             <View style={styles.heroStatDivider} />
             <View style={styles.heroStatItem}>
               <Text style={styles.heroStatTitle}>Pending</Text>
               <Text style={styles.heroStatValue}>{formatEtb(360)}</Text>
             </View>
           </View>

           <TouchableOpacity style={styles.withdrawBtn} activeOpacity={0.9}>
              <Text style={styles.withdrawBtnText}>Withdraw Funds</Text>
              <CustomIcon name="arrow-right" size={18} color={COLORS.primary} iconType="Feather" touchable={false} style={{marginLeft: 8}}/>
           </TouchableOpacity>
        </View>
      </View>

      <View style={styles.transactionsSection}>
         <View style={styles.sectionHeaderRow}>
           <Text style={styles.sectionTitle}>Recent Transactions</Text>
           <TouchableOpacity>
             <Text style={styles.filterText}>Filter</Text>
           </TouchableOpacity>
         </View>
         <FlatList
            data={MOCK_TRANSACTIONS}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
         />
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  
  heroSection: { paddingBottom: SPACING.xl },
  header: { padding: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: RADIUS.full },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.white },

  balanceCard: { alignItems: 'center', paddingHorizontal: SPACING.xl, marginTop: SPACING.md },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: FONTS.sizes.md, marginBottom: 8, fontWeight: '500' },
  balanceAmount: { color: COLORS.white, fontSize: 48, fontWeight: 'bold', marginBottom: SPACING.xl },
  
  heroStatsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.xl, width: '100%' },
  heroStatItem: { flex: 1, alignItems: 'center' },
  heroStatDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  heroStatTitle: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontWeight: '600', marginBottom: 4 },
  heroStatValue: { fontSize: FONTS.sizes.lg, color: COLORS.white, fontWeight: '700' },

  withdrawBtn: { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: 32, paddingVertical: 16, borderRadius: RADIUS.full, ...SHADOWS.md, alignItems: 'center' },
  withdrawBtnText: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: '700' },

  transactionsSection: { flex: 1, backgroundColor: COLORS.offWhite, borderTopLeftRadius: RADIUS.xl * 1.5, borderTopRightRadius: RADIUS.xl * 1.5, padding: SPACING.xl },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  filterText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },
  
  listContainer: { paddingBottom: SPACING.xxl },
  transactionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.md, ...SHADOWS.sm, borderWidth: 1, borderColor: COLORS.gray100 },
  iconContainer: { width: 48, height: 48, borderRadius: RADIUS.full, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  creditIcon: { backgroundColor: '#E8F5E9' },
  debitIcon: { backgroundColor: '#FFEBEE' },
  transactionInfo: { flex: 1 },
  transactionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.gray900, marginBottom: 4 },
  txMetaRow: { flexDirection: 'row', alignItems: 'center' },
  transactionDate: { fontSize: FONTS.sizes.sm, color: COLORS.gray500 },
  processingBadge: { marginLeft: 8, backgroundColor: '#FFF3E0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  processingText: { fontSize: 10, color: '#E65100', fontWeight: '700' },
  
  transactionAmount: { fontSize: FONTS.sizes.lg, fontWeight: 'bold' },
  creditAmount: { color: COLORS.success },
  debitAmount: { color: COLORS.gray900 }
});

export default DoctorWalletScreen;
