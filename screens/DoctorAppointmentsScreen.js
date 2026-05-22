import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { DoctorAppointmentSkeleton } from '../components/SkeletonLoaders';
import { supabase } from '../utils/supabase';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import { formatDisplayTime } from '../constants/formatters';

const DoctorAppointmentsScreen = ({ navigation }) => {
  const [filter, setFilter] = useState('Upcoming');
  const [sessionTypeFilter, setSessionTypeFilter] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTypePickerVisible, setIsTypePickerVisible] = useState(false);
  const SESSION_TYPE_OPTIONS = [
    { label: 'All', value: 'all' },
    { label: 'General', value: 'general' },
    { label: 'Individual', value: 'individual' },
    { label: 'Couple', value: 'couple' },
    { label: 'Child', value: 'child' },
    { label: 'Group', value: 'group' },
  ];
  const formatSessionType = (type) => {
    if (!type) return 'General';
    return type
      .toString()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Restrict doctor view to assigned patients
      const { data: assignments, error: assignError } = await supabase
        .from('patient_therapists')
        .select('patient_id')
        .eq('therapist_id', user.id);
      if (assignError) throw assignError;
      const assignedPatientIds = [...new Set((assignments || []).map((a) => a.patient_id).filter(Boolean))];
      if (assignedPatientIds.length === 0) {
        setAppointments([]);
        return;
      }

      // 1) Fetch appointments for this therapist
      const { data: appointmentsOnly, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('therapist_id', user.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (appointmentsError) throw appointmentsError;

      const list = (appointmentsOnly || []).filter((a) => assignedPatientIds.includes(a.patient_id));

      // 2) Fetch patient rows from users by patient_id (requires RLS policy "Therapists can read their patients")
      const patientIds = [...new Set(list.map((a) => a.patient_id).filter(Boolean))];
      let patientMap = {};
      if (patientIds.length > 0) {
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, full_name, email, phone, profile_picture')
          .in('id', patientIds);
        if (!usersError && users) users.forEach((u) => { patientMap[u.id] = u; });
      }

      // 3) Attach patient to each appointment
      const withPatients = list.map((a) => ({
        ...a,
        patient: a.patient_id ? patientMap[a.patient_id] || null : null,
      }));

      setAppointments(withPatients);
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [fetchAppointments])
  );

  const filteredData = appointments.filter(a => {
    const byStatus =
      filter === 'Upcoming'
        ? a.status === 'pending' || a.status === 'confirmed'
        : a.status === 'completed';
    if (!byStatus) return false;
    if (sessionTypeFilter === 'all') return true;
    return (a.session_type || 'general') === sessionTypeFilter;
  });

  const renderItem = ({ item }) => {
    const patientRaw = item.patient;
    // Defensive check if patient is an array or object
    const patient = Array.isArray(patientRaw) ? patientRaw[0] : (patientRaw || {});
    const profileImage = patient.profile_picture
      ? { uri: patient.profile_picture }
      : null;

    const formattedDate = moment(item.appointment_date).format('MMM D, YYYY');
    const formattedTime = formatDisplayTime(item.appointment_time);
    const isToday = moment(item.appointment_date).isSame(moment(), 'day');
    const dateLabel = isToday ? 'Today' : formattedDate;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('DoctorAppointmentDetail', {
            appointment: {
              ...item,
              patient: patient,
              name: patient.full_name || 'Patient',
              issue: item.notes || 'General Session',
              date: dateLabel,
              time: formattedTime,
              status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
              type: formatSessionType(item.session_type),
            }
          })
        }>
        <View style={styles.cardHeader}>
          <View style={styles.dateTimeRow}>
            <CustomIcon
              name="calendar"
              size={16}
              color={COLORS.gray600}
              iconType="Feather"
              touchable={false}
            />
            <Text style={styles.dateText}>{dateLabel}</Text>
            <View style={styles.dot} />
            <CustomIcon
              name="clock"
              size={16}
              color={COLORS.gray600}
              iconType="Feather"
              touchable={false}
            />
            <Text style={styles.dateText}>{formattedTime}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              item.status === 'completed' ? styles.statusBadgeCompleted :
                item.status === 'confirmed' ? styles.statusBadgeConfirmed : {},
            ]}>
            <View
              style={[
                styles.statusDot,
                item.status === 'completed' ? styles.statusDotCompleted :
                  item.status === 'confirmed' ? styles.statusDotConfirmed : {},
              ]}
            />
            <Text
              style={[
                styles.statusText,
                item.status === 'completed' ? styles.statusTextCompleted :
                  item.status === 'confirmed' ? styles.statusTextConfirmed : {},
              ]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.patientInfo}>
          <View style={styles.patientAvatarWrap}>
            {profileImage ? (
              <Image source={profileImage} style={styles.patientAvatar} />
            ) : (
              <View style={styles.patientAvatarInitials}>
                <Text style={styles.initialsText}>{(patient.full_name || 'P').charAt(0)}</Text>
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.patientName}>{patient.full_name || 'Patient'}</Text>
            <Text style={styles.patientIssue}>{item.notes || 'General Session'}</Text>
          </View>
        </View>

        {item.status !== 'completed' && item.status !== 'cancelled' && (
          <View style={styles.cardFooter}>
            <View style={styles.typeBadge}>
              <CustomIcon
                name="video"
                size={14}
                color={COLORS.gray600}
                iconType="Feather"
                touchable={false}
              />
              <Text style={styles.typeText}>{formatSessionType(item.session_type)}</Text>
            </View>
            <TouchableOpacity style={styles.joinBtn}>
              <Text style={styles.joinBtnText}>View details</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.offWhite} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Schedule</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <CustomIcon
            name="search"
            size={20}
            color={COLORS.gray900}
            iconType="Feather"
            touchable={false}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, filter === 'Upcoming' && styles.activeTab]}
          onPress={() => setFilter('Upcoming')}>
          <Text
            style={[
              styles.tabText,
              filter === 'Upcoming' && styles.activeTabText,
            ]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, filter === 'Completed' && styles.activeTab]}
          onPress={() => setFilter('Completed')}>
          <Text
            style={[
              styles.tabText,
              filter === 'Completed' && styles.activeTabText,
            ]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.sessionTypeFilterWrap}>
        <TouchableOpacity
          style={styles.dropdownSelector}
          onPress={() => setIsTypePickerVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.dropdownLeft}>
            <CustomIcon name="filter" size={16} color={COLORS.primary} iconType="Feather" touchable={false} />
            <Text style={styles.dropdownLabel}>Session Type:</Text>
            <Text style={styles.dropdownValue}>
              {SESSION_TYPE_OPTIONS.find(opt => opt.value === sessionTypeFilter)?.label}
            </Text>
          </View>
          <CustomIcon name="chevron-down" size={20} color={COLORS.gray400} iconType="Feather" touchable={false} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isTypePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTypePickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsTypePickerVisible(false)}
        >
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Session Type</Text>
              <TouchableOpacity onPress={() => setIsTypePickerVisible(false)}>
                <CustomIcon name="x" size={24} color={COLORS.gray900} iconType="Feather" touchable={false} />
              </TouchableOpacity>
            </View>
            {SESSION_TYPE_OPTIONS.map((item) => {
              const active = sessionTypeFilter === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.pickerItem, active && styles.pickerItemActive]}
                  onPress={() => {
                    setSessionTypeFilter(item.value);
                    setIsTypePickerVisible(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, active && styles.pickerItemTextActive]}>
                    {item.label}
                  </Text>
                  {active && (
                    <CustomIcon name="check" size={20} color={COLORS.primary} iconType="Feather" touchable={false} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {loading ? (
        <View style={styles.listContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <DoctorAppointmentSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <CustomIcon
                name="calendar"
                size={48}
                color={COLORS.gray300}
                iconType="Feather"
                touchable={false}
              />
              <Text style={styles.emptyTitle}>No Appointments</Text>
              <Text style={styles.emptySubtitle}>
                You don't have any {filter.toLowerCase()} sessions.
              </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    paddingHorizontal: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: FONTS.sizes.md, color: COLORS.gray500, fontWeight: '600' },
  activeTabText: { color: COLORS.primary },
  sessionTypeFilterWrap: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    paddingBottom: SPACING.sm,
  },
  sessionTypeFilterContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  sessionTypeChip: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sessionTypeChipActive: {
    backgroundColor: COLORS.primary + '18',
    borderColor: COLORS.primary,
  },
  sessionTypeChipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  sessionTypeChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray50,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    fontWeight: '600',
  },
  dropdownValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray900,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  pickerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray50,
  },
  pickerItemActive: {
    backgroundColor: COLORS.primary + '08',
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  pickerItemText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  pickerItemTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  listContainer: { padding: SPACING.lg, paddingBottom: 100 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeRow: { flexDirection: 'row', alignItems: 'center' },
  dateText: {
    color: COLORS.gray700,
    fontWeight: '600',
    fontSize: FONTS.sizes.sm,
    marginLeft: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray300,
    marginHorizontal: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusBadgeCompleted: { backgroundColor: '#E6F4EA' },
  statusBadgeConfirmed: { backgroundColor: '#E3F2FD' },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#B8860B',
    marginRight: 4,
  },
  statusDotCompleted: { backgroundColor: COLORS.success },
  statusDotConfirmed: { backgroundColor: '#1976D2' },
  statusText: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: '#B8860B' },
  statusTextCompleted: { color: COLORS.success },
  statusTextConfirmed: { color: '#1976D2' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: SPACING.md,
  },

  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  patientAvatarWrap: {
    marginRight: SPACING.md,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
  },
  patientAvatarInitials: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: COLORS.primaryDark,
    fontWeight: '700',
    fontSize: FONTS.sizes.lg,
  },
  patientName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 2,
  },
  patientIssue: { fontSize: FONTS.sizes.sm, color: COLORS.gray500 },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  typeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray600,
    fontWeight: '600',
    marginLeft: 6,
  },
  joinBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
  },
  joinBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONTS.sizes.sm,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray900,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});

export default DoctorAppointmentsScreen;
