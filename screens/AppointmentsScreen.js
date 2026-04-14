import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { PatientAppointmentSkeleton } from '../components/SkeletonLoaders';
import { supabase } from '../utils/supabase';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';

const FILTERS = ['All', 'pending', 'confirmed', 'completed', 'cancelled'];

const AppointmentsScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          therapist:therapist_id (
            full_name,
            specialization,
            profile_picture
          )
        `)
        .eq('patient_id', user.id)
        .order('appointment_date', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [fetchAppointments])
  );

  const filteredData = appointments.filter(a => activeFilter === 'All' || a.status === activeFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { bg: '#FFF8E6', text: '#B8860B' };
      case 'confirmed': return { bg: '#E3F2FD', text: '#1976D2' };
      case 'completed': return { bg: '#E6F4EA', text: COLORS.success };
      case 'cancelled': return { bg: '#FFEBEE', text: COLORS.error };
      default: return { bg: COLORS.gray100, text: COLORS.gray600 };
    }
  };

  const renderItem = ({ item }) => {
    const sc = getStatusColor(item.status);
    const therapist = item.therapist || {};
    const formattedDate = moment(item.appointment_date).format('MMM D, YYYY');
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AppointmentDetail', { 
          appointment: {
            ...item,
            doctor: therapist.full_name || 'Therapist',
            title: therapist.specialization || 'Mental Health Professional',
            date: formattedDate,
            time: item.appointment_time,
            image: therapist.profile_picture ? { uri: therapist.profile_picture } : require('../assets/person.webp'),
            amount: `$${item.fee}`,
            paymentMethod: item.payment_method?.toUpperCase() || 'Not specified'
          } 
        })}
        activeOpacity={0.9}
      >
        <Image 
          source={therapist.profile_picture ? { uri: therapist.profile_picture } : require('../assets/person.webp')} 
          style={styles.avatar} 
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.docName}>{therapist.full_name || 'Therapist'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
              <Text style={[styles.statusText, { color: sc.text }]}>{item.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.docTitle}>{therapist.specialization || 'Mental Health Specialist'}</Text>
          <View style={styles.metaRow}>
            <CustomIcon name="calendar-outline" size={14} color={COLORS.gray500} iconType="Ionicons" touchable={false} />
            <Text style={styles.metaText}>{formattedDate} · {item.appointment_time}</Text>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.detailsText}>View Details</Text>
            <CustomIcon name="chevron-forward" size={18} color={COLORS.primary} iconType="Ionicons" touchable={false} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Appointments</Text>
      </View>

      <View style={styles.filterRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={item => item}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ gap: SPACING.sm }}
        />
      </View>

      {loading ? (
        <View style={styles.listContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <PatientAppointmentSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No {activeFilter.toLowerCase()} appointments</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.gray900 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    ...SHADOWS.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.gray600 },
  filterTextActive: { color: COLORS.white },
  listContainer: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: SPACING.md },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  docName: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  statusText: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
  docTitle: { fontSize: FONTS.sizes.sm, color: COLORS.gray500, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  metaText: { fontSize: FONTS.sizes.sm, color: COLORS.gray600, marginLeft: 6 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    paddingTop: 12,
  },
  detailsText: { color: COLORS.primary, fontWeight: '600', marginRight: 4 },
  emptyText: { textAlign: 'center', color: COLORS.gray500, marginTop: 40, fontSize: FONTS.sizes.md },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default AppointmentsScreen;
