import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, StatusBar, ActivityIndicator } from 'react-native';
import moment from 'moment';
import CustomIcon from '../components/CustomIcon';
import RBSheet from "react-native-raw-bottom-sheet";
import { supabase } from '../utils/supabase';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const MOCK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SESSION_TYPES = ['general', 'individual', 'couple', 'child', 'group'];

const BookingCalendarScreen = ({ navigation, route }) => {
  const selectedPlan = route?.params?.selectedPlan || null;
  const therapist = route?.params?.therapist || {
    id: null,
    name: "Dr. Aisha Rahman",
    specialty: "Anxiety, Depression, Trauma",
    image: require('../assets/person.webp')
  };
  
  const timeSheetRef = useRef();
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDateObj, setSelectedDateObj] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedSessionType, setSelectedSessionType] = useState('general');
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [isAssigned, setIsAssigned] = useState(true);

  useEffect(() => {
    fetchTherapistSchedule();
  }, [therapist.id]);

  const fetchTherapistSchedule = async () => {
    if (!therapist.id) {
       setLoading(false);
       return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAssigned(false);
        generateDates([], true);
        setAvailabilityMessage('Please sign in to book appointments.');
        return;
      }

      const { data: assignmentRows, error: assignmentError } = await supabase
        .from('patient_therapists')
        .select('id')
        .eq('patient_id', user.id)
        .eq('therapist_id', therapist.id)
        .limit(1);
      if (assignmentError) {
        console.error('Error checking therapist assignment:', assignmentError);
        setIsAssigned(false);
        generateDates([], true);
        setAvailabilityMessage('Unable to verify therapist assignment.');
        return;
      }

      const assigned = (assignmentRows || []).length > 0;
      setIsAssigned(assigned);

      const { data, error } = await supabase
        .from('therapist_schedules')
        .select('weekly_schedule')
        .eq('therapist_id', therapist.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching therapist schedule:', error);
      } else if (data) {
        generateDates(data.weekly_schedule, !assigned);
      } else {
        // Fallback or handle no schedule set
        generateDates([], !assigned);
      }
    } catch (e) {
      console.error('Exception fetching therapist schedule:', e);
    } finally {
      setLoading(false);
    }
  };

  const generateDates = (weeklySchedule, forceUnavailable = false) => {
    const dates = [];
    const today = moment().startOf('day');
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');
    
    // Add padding for the beginning of the month
    const startDay = startOfMonth.day(); // 0 (Sun) to 6 (Sat)
    for (let i = 0; i < startDay; i++) {
      dates.push({ padding: true });
    }
    
    // Generate all days of the month
    const daysInMonth = endOfMonth.date();
    for (let i = 1; i <= daysInMonth; i++) {
      const current = moment(startOfMonth).date(i);
      const dayName = current.format('dddd');
      const isPast = current.isBefore(today);
      
      const dayConfig = weeklySchedule.find(s => s.day === dayName);
      // Available only if it's in the schedule AND not in the past
      const isAvailable = (dayConfig ? dayConfig.isWorking : false) && !isPast && !forceUnavailable;
      
      dates.push({
        fullDate: current.toISOString(),
        date: current.format('D'),
        day: current.format('ddd'),
        month: current.format('MMM'),
        year: current.format('YYYY'),
        available: isAvailable,
        isPast: isPast,
        slots: dayConfig?.slots || []
      });
    }
    setAvailableDates(dates);
    
    // Default selection: first available date that is NOT in the past
    const firstAvailable = dates.find(d => !d.padding && d.available);
    if (firstAvailable) {
      setSelectedDateObj(firstAvailable);
      setAvailabilityMessage('');
    } else {
      // Fallback to today or first of month if no available dates
      const todayObj = dates.find(d => !d.padding && moment(d.fullDate).isSame(today, 'day'));
      setSelectedDateObj(todayObj || dates.find(d => !d.padding));
      setAvailabilityMessage(
        forceUnavailable
          ? 'You can book appointments only with therapists assigned to you.'
          : 'No available slots for the remainder of this month.'
      );
    }
  };

  const openTimeSlots = (dateObj) => {
    setSelectedDateObj(dateObj);
    setSelectedTime(null);
    if (!isAssigned) {
      setAvailabilityMessage('You can book appointments only with therapists assigned to you.');
      return;
    }
    if (!dateObj.available) {
      setAvailabilityMessage('Doctor is not available on this day.');
      return;
    }
    setAvailabilityMessage('');
    timeSheetRef.current.open();
  };

  const handleConfirmSlot = () => {
    if (!isAssigned || !selectedDateObj || !selectedTime || !selectedSessionType) {
      return;
    }
    timeSheetRef.current?.close();
    
    // Extract only the start time for the appointment_time field
    const startTimeStr = selectedTime.split(' - ')[0];
    const dbFormattedDate = moment(selectedDateObj.fullDate).format('YYYY-MM-DD');

    navigation.navigate('Payment', {
      therapist,
      date: `${selectedDateObj?.month} ${selectedDateObj?.date}, ${selectedDateObj?.year}`,
      time: selectedTime,
      dbDate: dbFormattedDate,
      dbTime: startTimeStr,
      sessionType: selectedSessionType,
      selectedPlan,
      amount: therapist.fee || 120,
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.gray500 }}>Loading therapist availability...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.offWhite} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <CustomIcon name="chevron-left" size={24} color={COLORS.gray900} iconType="Feather" touchable={false} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Date & Time</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.therapistCard, styles.therapistCardColored]}>
          <Image source={therapist.image} style={styles.avatar} />
          <View style={styles.therapistInfo}>
            <Text style={styles.doctorName}>{therapist.name}</Text>
            <Text style={styles.doctorTitle}>{therapist.specialty}</Text>
          </View>
        </View>

        <View style={[styles.calendarShell, styles.calendarShellAccent]}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>Book a session with</Text>
            <Text style={styles.calendarDoctor}>{therapist.name}</Text>
          </View>

          <View style={styles.calendarContainer}>
            <View style={styles.monthRow}>
              <Text style={styles.monthText}>{moment().format('MMMM YYYY')}</Text>
            </View>

            <View style={styles.weekRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <Text key={idx} style={styles.weekDayText}>{day}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {availableDates.map((dateObj, idx) => {
                if (dateObj.padding) {
                  return <View key={`pad-${idx}`} style={styles.dayCell} />;
                }

                const isSelected = selectedDateObj?.fullDate === dateObj.fullDate;
                const isPast = dateObj.isPast;
                
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.dayCell,
                      (!dateObj.available || isPast) && styles.dayCellUnavailable,
                    ]}
                    onPress={() => !isPast && openTimeSlots(dateObj)}
                    disabled={isPast}
                    activeOpacity={isPast ? 1 : 0.7}
                  >
                    <View style={[styles.dayBtn, isSelected && styles.dayCellSelected]}>
                      <Text
                        style={[
                          styles.dateText,
                          isSelected && styles.dateTextSelected,
                          (isPast || !dateObj.available) && styles.dateTextUnavailable,
                          isPast && styles.dateTextPast,
                        ]}
                      >
                        {dateObj.date}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.calendarFooter}>
            <View style={styles.footerInfo}>
              <Text style={styles.footerLabel}>Selected date</Text>
              <Text style={styles.footerValue}>
                {selectedDateObj
                  ? `${selectedDateObj?.month} ${selectedDateObj?.date}, ${selectedDateObj?.year}`
                  : 'Choose a date'}
              </Text>
            </View>
            <View style={styles.footerDot} />
          </View>
          {availabilityMessage ? (
            <Text style={styles.unavailableText}>{availabilityMessage}</Text>
          ) : null}
        </View>
      </ScrollView>

      <RBSheet
        ref={timeSheetRef}
        height={460}
        closeOnDragDown={true}
        customStyles={{
          container: styles.sheetContainer,
          draggableIcon: { backgroundColor: COLORS.gray300, width: 40, height: 4 }
        }}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>
             {selectedDateObj?.day}, {selectedDateObj?.month} {selectedDateObj?.date}
          </Text>
          <Text style={styles.sheetSubtitle}>Pick an available time</Text>
        </View>

        <ScrollView contentContainerStyle={styles.timeSlotGrid} showsVerticalScrollIndicator={false}>
          {selectedDateObj?.slots && selectedDateObj.slots.length > 0 ? (
            selectedDateObj.slots.map((slot, idx) => {
               const slotTime = `${slot.start} - ${slot.end}`;
               const isSelected = selectedTime === slotTime;
               return (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.timeSlot, isSelected && styles.timeSlotSelected]}
                  onPress={() => setSelectedTime(slotTime)}
                >
                  <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextSelected]} numberOfLines={1}>
                    {slotTime}
                  </Text>
                </TouchableOpacity>
               );
            })
          ) : (
            <Text style={styles.noSlotsText}>No specific slots available for this day.</Text>
          )}
        </ScrollView>
        <View style={styles.sessionTypeSection}>
          <Text style={styles.sessionTypeTitle}>Select session type</Text>
          <View style={styles.sessionTypeGrid}>
            {SESSION_TYPES.map((type) => {
              const isSelected = selectedSessionType === type;
              const label = type.charAt(0).toUpperCase() + type.slice(1);
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.sessionTypeChip, isSelected && styles.sessionTypeChipSelected]}
                  onPress={() => setSelectedSessionType(type)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.sessionTypeChipText, isSelected && styles.sessionTypeChipTextSelected]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.sheetFooter}>
          <TouchableOpacity 
            style={[styles.primaryBtn, (!selectedTime || !selectedSessionType) && styles.primaryBtnDisabled]}
            onPress={handleConfirmSlot}
            disabled={!selectedTime || !selectedSessionType}
          >
            <Text style={styles.primaryBtnText}>Confirm Appointment</Text>
          </TouchableOpacity>
        </View>
      </RBSheet>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.offWhite },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, 
    backgroundColor: COLORS.offWhite 
  },
  iconButton: {
    width: 40, height: 40, borderRadius: RADIUS.full, 
    backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', 
    ...SHADOWS.sm
  },
  headerRight: { width: 40 },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.primary },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  
  therapistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  therapistCardColored: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primaryDark,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  therapistInfo: { flex: 1 },
  doctorName: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.white, marginBottom: 4 },
  doctorTitle: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.92)', fontWeight: '600' },
  
  calendarShell: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    ...SHADOWS.md,
  },
  calendarShellAccent: {
    borderWidth: 1,
    borderColor: COLORS.primary + '1F',
  },
  calendarHeader: {
    marginBottom: SPACING.md,
  },
  calendarTitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    marginBottom: 2,
  },
  calendarDoctor: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  calendarContainer: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  monthRow: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    backgroundColor: COLORS.primary + '0D',
  },
  monthText: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.primaryDark },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray50,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.gray500,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  dayCell: {
    width: '14.28%',
    padding: 4,
  },
  dayBtn: {
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    backgroundColor: 'transparent',
  },
  dayCellSelected: {
    backgroundColor: 'transparent',
  },
  dayCellUnavailable: {
    opacity: 0.6,
  },
  dateText: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.gray900 },
  dateTextSelected: { color: COLORS.primary, fontWeight: '800' },
  dateTextUnavailable: { color: COLORS.gray400 },
  dateTextPast: { color: COLORS.gray300, textDecorationLine: 'line-through', opacity: 0.5 },
  calendarFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
  },
  footerInfo: { flex: 1 },
  footerLabel: { fontSize: FONTS.sizes.xs, color: COLORS.gray400, marginBottom: 2 },
  footerValue: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.gray800 },
  footerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.md,
  },
  unavailableText: {
    marginTop: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
  },

  sheetContainer: { borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, paddingHorizontal: 0 },
  sheetHeader: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.md, paddingBottom: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  sheetTitle: { fontSize: 22, fontWeight: '800', color: COLORS.primaryDark, marginBottom: 4 },
  sheetSubtitle: { fontSize: FONTS.sizes.md, color: COLORS.gray500, fontWeight: '500' },
  
  timeSlotGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', padding: SPACING.xl, gap: SPACING.md },
  timeSlot: { 
    width: '46%', paddingVertical: 14, borderRadius: RADIUS.lg, 
    borderWidth: 1, borderColor: COLORS.gray200, backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center'
  },
  timeSlotSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeSlotText: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.gray900 },
  timeSlotTextSelected: { color: COLORS.white },
  noSlotsText: { color: COLORS.gray500, fontSize: FONTS.sizes.md, textAlign: 'center', width: '100%', marginTop: 20 },
  sessionTypeSection: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.md },
  sessionTypeTitle: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.gray700, marginBottom: SPACING.sm },
  sessionTypeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  sessionTypeChip: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sessionTypeChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '18',
  },
  sessionTypeChipText: { fontSize: FONTS.sizes.sm, color: COLORS.gray600, fontWeight: '600' },
  sessionTypeChipTextSelected: { color: COLORS.primary, fontWeight: '700' },
  
  sheetFooter: { padding: SPACING.xl, borderTopWidth: 1, borderTopColor: COLORS.gray100, backgroundColor: COLORS.white },
  primaryBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: RADIUS.lg, alignItems: 'center', ...SHADOWS.sm },
  primaryBtnDisabled: { backgroundColor: COLORS.gray300, shadowOpacity: 0 },
  primaryBtnText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' }
});

export default BookingCalendarScreen;
