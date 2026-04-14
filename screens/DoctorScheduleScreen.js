import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, StatusBar, ActivityIndicator, Alert } from 'react-native';
import CustomIcon from '../components/CustomIcon';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { supabase } from '../utils/supabase';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import Toast from 'react-native-simple-toast';

const INITIAL_SCHEDULE = [
  { id: 1, day: 'Monday', isWorking: true, slots: [{ start: '09:00 AM', end: '05:00 PM' }] },
  { id: 2, day: 'Tuesday', isWorking: true, slots: [{ start: '09:00 AM', end: '05:00 PM' }] },
  { id: 3, day: 'Wednesday', isWorking: true, slots: [{ start: '09:00 AM', end: '05:00 PM' }] },
  { id: 4, day: 'Thursday', isWorking: true, slots: [{ start: '09:00 AM', end: '05:00 PM' }] },
  { id: 5, day: 'Friday', isWorking: true, slots: [{ start: '09:00 AM', end: '02:00 PM' }] },
  { id: 6, day: 'Saturday', isWorking: false, slots: [{ start: '10:00 AM', end: '02:00 PM' }] },
  { id: 7, day: 'Sunday', isWorking: false, slots: [{ start: '10:00 AM', end: '02:00 PM' }] },
];

const DoctorScheduleScreen = ({ navigation }) => {
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [scheduleId, setScheduleId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickerInfo, setPickerInfo] = useState(null); // { dayId, slotIndex, type: 'start' | 'end' }
  const [isPickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('therapist_schedules')
        .select('id, weekly_schedule')
        .eq('therapist_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching schedule:', error);
      } else if (data) {
        // Migration logic: Handle old format (flat) vs new format (nested slots)
        const migratedSchedule = data.weekly_schedule.map(day => {
          if (!day.slots) {
            return {
              ...day,
              slots: [{ start: day.start || '09:00 AM', end: day.end || '05:00 PM' }]
            };
          }
          return day;
        });
        setSchedule(migratedSchedule);
        setScheduleId(data.id);
      }
    } catch (e) {
      console.error('Exception fetching schedule:', e);
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const payload = {
        therapist_id: user.id,
        weekly_schedule: schedule,
        updated_at: new Date().toISOString(),
      };

      if (scheduleId) payload.id = scheduleId;

      const { data, error } = await supabase
        .from('therapist_schedules')
        .upsert(payload, { onConflict: 'id' })
        .select();

      if (error) {
        console.error('Error saving schedule:', error);
        Alert.alert('Error', 'Failed to save schedule. Please try again.');
      } else {
        Toast.show('Schedule saved successfully!');
        if (data && data[0]) setScheduleId(data[0].id);
      }
    } catch (e) {
      console.error('Exception saving schedule:', e);
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (dayId) => {
    setSchedule(schedule.map(d => d.id === dayId ? { ...d, isWorking: !d.isWorking } : d));
  };

  const addSlot = (dayId) => {
    setSchedule(schedule.map(d => {
      if (d.id === dayId) {
        return {
          ...d,
          slots: [...d.slots, { start: '09:00 AM', end: '10:00 AM' }]
        };
      }
      return d;
    }));
  };

  const removeSlot = (dayId, slotIndex) => {
    setSchedule(schedule.map(d => {
      if (d.id === dayId) {
        const newSlots = d.slots.filter((_, idx) => idx !== slotIndex);
        return {
          ...d,
          slots: newSlots.length > 0 ? newSlots : [{ start: '09:00 AM', end: '05:00 PM' }],
          isWorking: newSlots.length > 0 ? d.isWorking : false
        };
      }
      return d;
    }));
  };

  const showPicker = (dayId, slotIndex, type) => {
    setPickerInfo({ dayId, slotIndex, type });
    setPickerVisible(true);
  };

  const handleConfirm = (date) => {
    if (!pickerInfo) return;
    
    // Format to AM/PM string
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    const timeString = `${hours < 10 ? '0' + hours : hours}:${strMinutes} ${ampm}`;

    const { dayId, slotIndex, type } = pickerInfo;

    setSchedule(schedule.map(day => {
       if (day.id === dayId) {
         const updatedSlots = day.slots.map((slot, idx) => 
           idx === slotIndex ? { ...slot, [type]: timeString } : slot
         );
         return { ...day, slots: updatedSlots };
       }
       return day;
    }));
    
    setPickerVisible(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <CustomIcon name="chevron-left" size={24} color={COLORS.gray900} iconType="Feather" touchable={false} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weekly Schedule</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageDescription}>
          Set your standard weekly availability. You can add multiple shifts for each working day.
        </Text>

        {schedule.map((day) => (
          <View key={day.id} style={[styles.dayCard, !day.isWorking && styles.dayCardDisabled]}>
            <View style={styles.dayHeader}>
               <Text style={[styles.dayName, !day.isWorking && styles.dayNameDisabled]}>{day.day}</Text>
               <Switch 
                 value={day.isWorking} 
                 onValueChange={() => toggleDay(day.id)} 
                 trackColor={{ false: COLORS.gray200, true: COLORS.primary }}
                 thumbColor={COLORS.white}
               />
            </View>
            
            {day.isWorking && (
              <View style={styles.slotsContainer}>
                {day.slots.map((slot, index) => (
                  <View key={index} style={styles.slotRow}>
                    <View style={styles.timeSettings}>
                      <View style={styles.timeBox}>
                         <Text style={styles.timeLabel}>Start</Text>
                         <TouchableOpacity style={styles.timeSelector} onPress={() => showPicker(day.id, index, 'start')}>
                            <Text style={styles.timeValue}>{slot.start}</Text>
                         </TouchableOpacity>
                      </View>
                      <CustomIcon name="arrow-right" size={16} color={COLORS.gray400} iconType="Feather" touchable={false} style={{marginHorizontal: SPACING.sm, marginTop: 22}} />
                      <View style={styles.timeBox}>
                         <Text style={styles.timeLabel}>End</Text>
                         <TouchableOpacity style={styles.timeSelector} onPress={() => showPicker(day.id, index, 'end')}>
                            <Text style={styles.timeValue}>{slot.end}</Text>
                         </TouchableOpacity>
                      </View>
                    </View>
                    {day.slots.length > 1 && (
                      <TouchableOpacity style={styles.removeSlotBtn} onPress={() => removeSlot(day.id, index)}>
                        <CustomIcon name="x" size={18} color={COLORS.error} iconType="Feather" touchable={false} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                
                <TouchableOpacity style={styles.addSlotBtn} onPress={() => addSlot(day.id)}>
                   <CustomIcon name="plus" size={16} color={COLORS.primary} iconType="Feather" touchable={false} style={{marginRight: 4}} />
                   <Text style={styles.addSlotText}>Add another shift</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {!day.isWorking && (
               <Text style={styles.offDutyText}>You are off duty on this day.</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveBtn} onPress={saveSchedule} disabled={saving}>
           {saving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveBtnText}>Save Schedule</Text>}
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.gray100
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  content: { padding: SPACING.lg, paddingBottom: 110 },
  pageDescription: { fontSize: FONTS.sizes.md, color: COLORS.gray600, lineHeight: 22, marginBottom: SPACING.xl },
  dayCard: { 
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, 
    padding: SPACING.lg, marginBottom: SPACING.md, 
    borderWidth: 1, borderColor: COLORS.gray100, ...SHADOWS.sm 
  },
  dayCardDisabled: { backgroundColor: COLORS.gray50 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayName: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  dayNameDisabled: { color: COLORS.gray400 },
  slotsContainer: { marginTop: SPACING.md },
  slotRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  timeSettings: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
  timeBox: { flex: 1 },
  timeLabel: { fontSize: 10, color: COLORS.gray500, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  timeSelector: { backgroundColor: COLORS.gray50, paddingVertical: 10, paddingHorizontal: 12, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.gray200, alignItems: 'center' },
  timeValue: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.gray900 },
  removeSlotBtn: { marginLeft: SPACING.md, marginTop: 20, width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.error + '10', justifyContent: 'center', alignItems: 'center' },
  addSlotBtn: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.md, paddingVertical: 8 },
  addSlotText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },
  offDutyText: { marginTop: SPACING.sm, color: COLORS.gray400, fontStyle: 'italic' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SPACING.lg, paddingBottom: SPACING.xl, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.gray100, ...SHADOWS.md },
  saveBtn: { backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: RADIUS.lg, alignItems: 'center', minHeight: 60, justifyContent: 'center' },
  saveBtnText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' }
});

export default DoctorScheduleScreen;
