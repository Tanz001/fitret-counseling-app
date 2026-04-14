import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, StatusBar, ActivityIndicator } from 'react-native';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { supabase } from '../utils/supabase';
import moment from 'moment';

const AppointmentDetailScreen = ({ navigation, route }) => {
  const initialAppointment = route?.params?.appointment || {};
  const [appointment, setAppointment] = useState(initialAppointment);
  const [loading, setLoading] = useState(true);

  const fetchAppointmentDetails = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          therapist:therapist_id (
            full_name,
            specialization,
            profile_picture,
            experience_years,
            about
          )
        `)
        .eq('id', initialAppointment.id)
        .single();

      if (error) throw error;
      
      const therapist = data.therapist || {};
      setAppointment({
        ...data,
        doctor: therapist.full_name || 'Therapist',
        title: therapist.specialization || 'Mental Health Professional',
        date: moment(data.appointment_date).format('MMM D, YYYY'),
        time: data.appointment_time,
        image: therapist.profile_picture ? { uri: therapist.profile_picture } : require('../assets/person.webp'),
        amount: `$${data.fee}`,
        paymentMethod: data.payment_method?.toUpperCase() || 'Not specified',
        notes: data.notes || initialAppointment.notes, // Fallback to initial if DB is empty but route has it
        experience: `${therapist.experience_years || 8} years`,
        about: therapist.about || 'Licensed therapist committed to creating a safe space for healing.'
      });
    } catch (error) {
      console.error('Error fetching appointment details:', error);
    } finally {
      setLoading(false);
    }
  }, [initialAppointment.id]);

  useEffect(() => {
    fetchAppointmentDetails();
  }, [fetchAppointmentDetails]);

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return { bg: '#FFF8E6', text: '#B8860B', dot: '#F5B041' };
      case 'confirmed': return { bg: '#E3F2FD', text: '#1976D2', dot: '#1976D2' };
      case 'completed': return { bg: '#E6F4EA', text: COLORS.success, dot: COLORS.success };
      case 'cancelled': return { bg: '#FFEBEE', text: COLORS.error, dot: COLORS.error };
      default: return { bg: COLORS.gray100, text: COLORS.gray600, dot: COLORS.gray400 };
    }
  };
  
  const sc = getStatusColor(appointment.status);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.offWhite} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <CustomIcon name="chevron-back" size={24} color={COLORS.gray900} iconType="Ionicons" touchable={false} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment Detail</Text>
        <TouchableOpacity style={styles.iconButton}>
          <CustomIcon name="ellipsis-horizontal" size={24} color={COLORS.gray900} iconType="Ionicons" touchable={false} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading && <ActivityIndicator color={COLORS.primary} style={{ marginBottom: 15 }} />}
        
        {/* Doctor Info Card */}
        <TouchableOpacity 
          style={styles.doctorProfileCard} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('DoctorProfile', { 
            therapist: {
              name: appointment.doctor,
              specialty: appointment.title,
              image: appointment.image,
              rating: 4.9,
              reviews: 128,
              experience: appointment.experience,
              about: appointment.about
            } 
          })}
        >
          <View style={[styles.doctorInfoRow, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Image source={appointment.image || require('../assets/person.webp')} style={styles.doctorImage} />
              <View style={styles.doctorTextInfo}>
                <Text style={styles.doctorName}>{appointment.doctor}</Text>
                <Text style={styles.doctorTitle}>{appointment.title}</Text>
              </View>
            </View>
            <CustomIcon name="chevron-forward" size={20} color={COLORS.gray400} iconType="Ionicons" touchable={false} />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.appointmentSpecs}>
            <View style={styles.specItem}>
              <View style={styles.specIconContainer}>
                <CustomIcon name="calendar" size={20} color={COLORS.primary} iconType="Ionicons" touchable={false} />
              </View>
              <View>
                <Text style={styles.specLabel}>Date</Text>
                <Text style={styles.specValue}>{appointment.date}</Text>
              </View>
            </View>
            <View style={styles.specItem}>
              <View style={[styles.specIconContainer, { backgroundColor: '#F0F4F8' }]}>
                <CustomIcon name="time" size={20} color="#3B82F6" iconType="Ionicons" touchable={false} />
              </View>
              <View>
                <Text style={styles.specLabel}>Time</Text>
                <Text style={styles.specValue}>{appointment.time}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Status Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: sc.dot }]} />
              <Text style={[styles.statusText, { color: sc.text }]}>{appointment.status?.toUpperCase()}</Text>
            </View>
            <Text style={styles.statusDesc}>
              {appointment.status?.toLowerCase() === 'pending' ? 'Waiting for therapist' : `Session ${appointment.status?.toLowerCase()}`}
            </Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Session Details</Text>
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <View style={styles.detailIconWrap}>
                <CustomIcon name="videocam" size={20} color={COLORS.gray600} iconType="Ionicons" touchable={false} />
              </View>
              <Text style={styles.detailText}>Type</Text>
              <Text style={styles.detailValue}>{appointment.type || 'Video Call'}</Text>
            </View>
            <View style={styles.lineDivider} />
            <View style={styles.detailRow}>
              <View style={styles.detailIconWrap}>
                <CustomIcon name="hourglass-outline" size={20} color={COLORS.gray600} iconType="Ionicons" touchable={false} />
              </View>
              <Text style={styles.detailText}>Duration</Text>
              <Text style={styles.detailValue}>{appointment.duration || '50 minutes'}</Text>
            </View>
          </View>
        </View>

        {/* Payment Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <View style={styles.detailIconWrap}>
                <CustomIcon name="card" size={20} color={COLORS.gray600} iconType="Ionicons" touchable={false} />
              </View>
              <Text style={styles.detailText}>Method</Text>
              <Text style={styles.detailValue}>{appointment.paymentMethod}</Text>
            </View>
            <View style={styles.lineDivider} />
            <View style={styles.detailRow}>
              <View style={styles.detailIconWrap}>
                <CustomIcon name="cash" size={20} color={COLORS.gray600} iconType="Ionicons" touchable={false} />
              </View>
              <Text style={styles.detailText}>Total Amount</Text>
              <Text style={styles.detailValueBold}>{appointment.amount}</Text>
            </View>
          </View>
        </View>

        {/* Notes & Documents section */}
        {appointment.notes && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Session Notes</Text>
            <View style={styles.notesCard}>
              <CustomIcon name="information-circle" size={24} color={COLORS.primary} style={styles.notesIcon} iconType="Ionicons" touchable={false} />
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </View>
          </View>
        )}
        
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      {/*
      {appointment.status === 'Pending' && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('ChatThread', { chat: { name: appointment.doctor } })}>
            <CustomIcon name="chatbubble-ellipses-outline" size={24} color={COLORS.primary} iconType="Ionicons" touchable={false} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('VideoCall')}>
            <CustomIcon name="videocam" size={22} color={COLORS.white} style={styles.btnIcon} iconType="Ionicons" touchable={false} />
            <Text style={styles.primaryBtnText}>Join Video Call</Text>
          </TouchableOpacity>
        </View>
      )}
      */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.offWhite 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.offWhite,
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 110, // accommodate bottom bar
  },
  doctorProfileCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorImage: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    marginRight: SPACING.md,
  },
  doctorTextInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  doctorTitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: SPACING.lg,
  },
  appointmentSpecs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  specIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  specLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
    fontWeight: '500',
    marginBottom: 2,
  },
  specValue: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  sectionContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
    marginLeft: SPACING.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginRight: SPACING.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
  },
  statusDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  detailIconWrap: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  detailText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray900,
    fontWeight: '600',
  },
  detailValueBold: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.primary,
    fontWeight: '700',
  },
  lineDivider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginLeft: 48,
  },
  notesCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '0A',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  notesIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  notesText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray700,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    ...SHADOWS.lg,
  },
  secondaryBtn: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    backgroundColor: COLORS.white,
  },
  primaryBtn: {
    flex: 1,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  btnIcon: {
    marginRight: 8,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
});

export default AppointmentDetailScreen;
