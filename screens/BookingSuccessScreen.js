import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

const BookingSuccessScreen = ({ navigation, route }) => {
  const { therapist, date, time, amount } = route?.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <CustomIcon name="checkmark-circle" size={80} color={COLORS.success} iconType="Ionicons" touchable={false} />
        </View>
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>Your session has been successfully scheduled</Text>

        <View style={styles.detailsCard}>
          <Image source={therapist?.image || require('../assets/person.webp')} style={styles.avatar} />
          <Text style={styles.therapistName}>{therapist?.name || 'Dr. Aisha Rahman'}</Text>
          <Text style={styles.detailText}>Day {date} at {time}</Text>
          <Text style={styles.amountText}>${amount || 120} paid</Text>
        </View>

        <Text style={styles.note}>A confirmation email has been sent. You can view this appointment in the Appointments tab.</Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'PatientTabNavigator' }] })}
        >
          <Text style={styles.primaryBtnText}>Go to Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('AppointmentDetail', {
            appointment: {
              doctor: therapist?.name || 'Dr. Aisha Rahman',
              date: `Oct ${date}, 2026`,
              time,
              status: 'Pending',
              amount: `$${amount}`,
            },
          })}
        >
          <Text style={styles.secondaryBtnText}>View Appointment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  content: { flex: 1, padding: SPACING.xl, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { marginBottom: SPACING.xl },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.gray900, textAlign: 'center' },
  subtitle: { fontSize: FONTS.sizes.md, color: COLORS.gray500, marginTop: SPACING.sm, textAlign: 'center' },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.xl,
    width: '100%',
  },
  avatar: { width: 72, height: 72, borderRadius: 36, marginBottom: SPACING.md },
  therapistName: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  detailText: { fontSize: FONTS.sizes.md, color: COLORS.gray600, marginTop: 4 },
  amountText: { fontSize: FONTS.sizes.sm, color: COLORS.success, marginTop: 8, fontWeight: '600' },
  note: { fontSize: FONTS.sizes.sm, color: COLORS.gray500, marginTop: SPACING.xl, textAlign: 'center', paddingHorizontal: SPACING.lg },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    width: '100%',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  primaryBtnText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  secondaryBtn: {
    paddingVertical: 14,
    marginTop: SPACING.md,
  },
  secondaryBtnText: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: '600' },
});

export default BookingSuccessScreen;
