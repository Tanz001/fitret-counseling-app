import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Line,
  Circle,
} from 'react-native-svg';
import CustomIcon from '../components/CustomIcon';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from '../utils/supabase';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';

const {width} = Dimensions.get('window');
const CHART_WIDTH = width - SPACING.lg * 2 - SPACING.lg * 2;
const CHART_HEIGHT = 140;
const PAD = {left: 8, right: 8, top: 20, bottom: 28};
const GRAPH_H = CHART_HEIGHT - PAD.top - PAD.bottom;
const LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEK_DATA = [4, 7, 5, 9, 6, 3, 8];

const DoctorHomeScreen = ({navigation}) => {
  const [doctorName, setDoctorName] = useState('Doctor');
  const [avatar, setAvatar] = useState(require('../assets/person.webp'));
  const [stats, setStats] = useState({ appointments: 0, earnings: 0 });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [myPatients, setMyPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const graphW = CHART_WIDTH - PAD.left - PAD.right;
  const maxVal = Math.max(...WEEK_DATA);
  const minVal = Math.min(...WEEK_DATA);
  const range = maxVal - minVal || 1;
  const stepX = graphW / (WEEK_DATA.length - 1);

  const points = WEEK_DATA.map((val, i) => ({
    x: PAD.left + i * stepX,
    y: PAD.top + GRAPH_H - ((val - minVal) / range) * GRAPH_H,
  }));

  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    PAD.top + GRAPH_H
  } L ${points[0].x} ${PAD.top + GRAPH_H} Z`;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Assigned patient mapping for this therapist
      const { data: assignments } = await supabase
        .from('patient_therapists')
        .select('patient_id')
        .eq('therapist_id', user.id);
      const assignedPatientIds = [...new Set((assignments || []).map((a) => a.patient_id).filter(Boolean))];

      // 1. Fetch Profile
      const { data: profile } = await supabase
        .from('users')
        .select('full_name, profile_picture')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        if (profile.full_name) setDoctorName(profile.full_name.split(' ')[0]);
        if (profile.profile_picture) setAvatar({ uri: profile.profile_picture });
      }

      // 2. Fetch Stats & Upcoming
      const { data: allAppointments, error: aptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('therapist_id', user.id);

      if (!aptError && allAppointments) {
        const scopedAppointments = allAppointments.filter((apt) => assignedPatientIds.includes(apt.patient_id));
        const totalEarnings = scopedAppointments.reduce((sum, apt) => sum + (apt.fee || 0), 0);
        setStats({
          appointments: scopedAppointments.length,
          earnings: totalEarnings
        });

        // Get 2 latest upcoming (pending or confirmed)
        const upcoming = scopedAppointments
          .filter(a => a.status === 'pending' || a.status === 'confirmed')
          .sort((a, b) => {
            // Sort by combined date and time
            const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
            const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
            return dateA - dateB;
          })
          .slice(0, 2);

        // Fetch assigned patients for list + upcoming name mapping
        if (assignedPatientIds.length > 0) {
          const { data: patients } = await supabase
            .from('users')
            .select('id, full_name, profile_picture')
            .in('id', assignedPatientIds);
          
          const patientMap = {};
          if (patients) patients.forEach(p => patientMap[p.id] = p);

          const formattedUpcoming = upcoming.map(u => {
            const p = patientMap[u.patient_id] || {};
            const isToday = moment(u.appointment_date).isSame(moment(), 'day');
            return {
              ...u,
              patientName: p.full_name || 'Patient',
              patientAvatar: p.profile_picture ? { uri: p.profile_picture } : null,
              displayDate: isToday ? 'Today' : moment(u.appointment_date).format('MMM D'),
              displayTime: u.appointment_time
            };
          });
          setUpcomingSessions(formattedUpcoming);
          setMyPatients(patients || []);
        } else {
          setUpcomingSessions([]);
          setMyPatients([]);
        }
      }
    } catch (e) {
      console.error('Error fetching doctor dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      fetchDashboardData();
    } catch (e) {
      console.error('Error updating status:', e);
      alert('Failed to update status');
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.greetingHeader}>
          <Image
            source={avatar}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.drName}>Dr. {doctorName}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <View style={styles.notifBadge} />
          <CustomIcon
            name="bell"
            size={24}
            color={COLORS.gray900}
            iconType="Feather"
            touchable={false}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Main Stats Widget */}
        <View style={styles.statsCardWrapper}>
          <View style={styles.statsCard}>
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>Total Earnings</Text>
              <Text style={styles.statNumber}>${stats.earnings}</Text>
              <Text style={styles.statSubInfo}>Lifetime sum</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>Appointments</Text>
              <Text style={styles.statNumber}>{stats.appointments}</Text>
              <Text style={styles.statSubInfo}>Total booked</Text>
            </View>
          </View>
        </View>

        {/* Mock Analytics Graph Area */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DoctorWallet')}>
            <Text style={styles.seeAll}>Full Report</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.graphContainer}>
          <View style={styles.graphHeader}>
            <Text style={styles.graphTitle}>Weekly sessions</Text>
            <View style={styles.graphLegend}>
              <View
                style={[styles.legendDot, {backgroundColor: COLORS.primary}]}
              />
              <Text style={styles.legendText}>Sessions</Text>
            </View>
          </View>
          <Svg
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            style={styles.svgChart}>
            <Defs>
              <LinearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop
                  offset="0%"
                  stopColor={COLORS.primary}
                  stopOpacity={0.35}
                />
                <Stop
                  offset="100%"
                  stopColor={COLORS.primary}
                  stopOpacity={0.02}
                />
              </LinearGradient>
            </Defs>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
              <Line
                key={i}
                x1={PAD.left}
                y1={PAD.top + t * GRAPH_H}
                x2={PAD.left + graphW}
                y2={PAD.top + t * GRAPH_H}
                stroke={COLORS.gray100}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            ))}
            {/* Area fill */}
            <Path d={areaPath} fill="url(#chartGrad)" />
            {/* Line */}
            <Path
              d={linePath}
              stroke={COLORS.primary}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Data points */}
            {points.map((p, i) => (
              <Circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={4}
                fill={COLORS.white}
                stroke={COLORS.primary}
                strokeWidth={2}
              />
            ))}
          </Svg>
          <View style={styles.graphLabels}>
            {LABELS.map((label, i) => (
              <Text key={i} style={styles.graphLabelText}>
                {label}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Assigned Patients</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl, gap: SPACING.lg }}>
          {myPatients.length > 0 ? myPatients.map(p => {
            const isActive = selectedPatient === p.id;
            return (
              <TouchableOpacity 
                key={p.id} 
                style={[styles.patientCard, isActive && styles.patientCardActive]}
                onPress={() => setSelectedPatient(isActive ? null : p.id)}
                activeOpacity={0.8}
              >
                <View style={styles.patientAvatarContainer}>
                  <Image 
                    source={p.profile_picture ? {uri: p.profile_picture} : require('../assets/person.webp')} 
                    style={[styles.patientCardAvatar, isActive && styles.activeAvatarBorder]} 
                  />
                  {isActive && (
                    <View style={styles.activeCheck}>
                      <CustomIcon name="check" size={10} color={COLORS.white} iconType="Feather" touchable={false} />
                    </View>
                  )}
                </View>
                <Text style={[styles.patientCardName, isActive && styles.patientCardNameActive]} numberOfLines={1}>
                  {p.full_name.split(' ')[0]}
                </Text>
                <Text style={styles.patientCardStatus}>Active</Text>
              </TouchableOpacity>
            );
          }) : (
            <Text style={{color: COLORS.gray500, marginLeft: SPACING.lg}}>No patients assigned yet.</Text>
          )}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Up Next Today</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
            <Text style={styles.seeAll}>View Schedule</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Sessions Section */}
        {upcomingSessions.length > 0 ? (
          upcomingSessions.map((apt) => (
            <TouchableOpacity
              key={apt.id}
              style={styles.appointmentCard}
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate('DoctorAppointmentDetail', {
                  appointment: {
                    ...apt,
                    name: apt.patientName,
                    issue: apt.notes || 'General Consultation',
                    date: apt.displayDate,
                    time: apt.appointment_time,
                    status: apt.status.charAt(0).toUpperCase() + apt.status.slice(1),
                    type: apt.appointment_type || 'Video Call',
                  }
                })
              }>
              <View style={styles.aptHeader}>
                <View style={styles.aptTimeRow}>
                  <CustomIcon
                    name="clock"
                    size={16}
                    color={COLORS.gray600}
                    iconType="Feather"
                    touchable={false}
                    style={{marginRight: 4}}
                  />
                  <Text style={styles.aptTime}>{apt.displayDate} · {apt.displayTime}</Text>
                </View>
                <View style={[styles.badge, apt.status === 'confirmed' && styles.confirmedBadge]}>
                  <Text style={[styles.badgeText, apt.status === 'confirmed' && styles.confirmedBadgeText]}>
                    {apt.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.aptDivider} />

              <View style={styles.patientInfo}>
                <View style={styles.patientAvatarWrapper}>
                  {apt.patientAvatar ? (
                    <Image source={apt.patientAvatar} style={styles.patientAvatarSmall} />
                  ) : (
                    <View style={styles.patientAvatarInitials}>
                      <Text style={styles.initialsText}>{apt.patientName.charAt(0)}</Text>
                    </View>
                  )}
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.patientName}>{apt.patientName}</Text>
                  <Text style={styles.patientIssue} numberOfLines={1}>
                    {apt.notes || 'General Consultation'}
                  </Text>
                </View>
                {apt.status === 'confirmed' ? (
                  <TouchableOpacity 
                    style={styles.joinBtn}
                    onPress={() => navigation.navigate('VideoCall')} // Example navigation
                  >
                    <CustomIcon
                      name="video"
                      size={18}
                      color={COLORS.white}
                      iconType="Feather"
                      touchable={false}
                    />
                  </TouchableOpacity>
                ) : apt.status === 'pending' ? (
                  <TouchableOpacity 
                    style={styles.confirmBtn}
                    onPress={() => handleUpdateStatus(apt.id, 'confirmed')}
                  >
                     <Text style={styles.confirmBtnText}>Confirm</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Quick Actions Row */}
              <View style={styles.quickActionsRow}>
                {apt.status === 'confirmed' && (
                  <TouchableOpacity 
                    style={styles.actionLink}
                    onPress={() => handleUpdateStatus(apt.id, 'completed')}
                  >
                    <Text style={styles.actionLinkText}>Mark as Completed</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.actionLink}
                  onPress={() =>
                    navigation.navigate('DoctorAppointmentDetail', {
                      appointment: {
                        ...apt,
                        name: apt.patientName,
                        issue: apt.notes || 'General Consultation',
                        date: apt.displayDate,
                        time: apt.appointment_time,
                        status: apt.status.charAt(0).toUpperCase() + apt.status.slice(1),
                        type: apt.appointment_type || 'Video Call',
                      }
                    })
                  }
                >
                  <Text style={[styles.actionLinkText, {color: COLORS.gray500}]}>View Details</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyAptCard}>
            <Text style={styles.emptyAptText}>No upcoming sessions found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.offWhite},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    ...SHADOWS.sm,
  },
  greetingHeader: {flexDirection: 'row', alignItems: 'center'},
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    marginRight: SPACING.md,
  },
  greeting: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  drName: {fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.gray900},
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.error,
    zIndex: 2,
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  scrollContent: {padding: SPACING.lg, paddingBottom: 100},

  statsCardWrapper: {marginBottom: SPACING.xl},
  statsCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  statColumn: {flex: 1},
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 2,
  },
  statSubInfo: {
    fontSize: FONTS.sizes.xs,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: SPACING.md,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  seeAll: {fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '700'},

  graphContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  graphTitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    fontWeight: '600',
  },
  graphLegend: {flexDirection: 'row', alignItems: 'center'},
  legendDot: {width: 8, height: 8, borderRadius: 4, marginRight: 6},
  legendText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
    fontWeight: '600',
  },
  svgChart: {alignSelf: 'center'},
  graphLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: PAD.left + 2,
    marginTop: -4,
  },
  graphLabelText: {
    fontSize: 10,
    color: COLORS.gray400,
    fontWeight: '600',
    width: (CHART_WIDTH - PAD.left - PAD.right) / 7,
    textAlign: 'center',
  },

  appointmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
    marginBottom: SPACING.md,
  },
  aptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aptTimeRow: {flexDirection: 'row', alignItems: 'center'},
  aptTime: {color: COLORS.gray700, fontWeight: '600', fontSize: FONTS.sizes.sm},
  badge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    color: COLORS.primaryDark,
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
  },
  aptDivider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: SPACING.md,
  },
  patientInfo: {flexDirection: 'row', alignItems: 'center'},
  patientAvatarInitials: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  initialsText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: FONTS.sizes.lg,
  },
  patientName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 2,
  },
  patientIssue: {fontSize: FONTS.sizes.xs, color: COLORS.gray500},
  joinBtn: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.gray900,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  confirmedBadge: { backgroundColor: '#E3F2FD' },
  confirmedBadgeText: { color: '#1976D2' },
  patientAvatarWrapper: { marginRight: SPACING.md },
  patientAvatarSmall: { width: 48, height: 48, borderRadius: 24 },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  confirmBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONTS.sizes.sm,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
    gap: 16,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray50,
  },
  actionLink: {
    paddingVertical: 4,
  },
  actionLinkText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyAptCard: {
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
    borderStyle: 'dashed',
  },
  emptyAptText: { color: COLORS.gray500, fontSize: FONTS.sizes.md },
  patientCard: {
    width: 90,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  patientCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  patientAvatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  patientCardAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.gray50,
  },
  activeAvatarBorder: {
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  activeCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.gray900,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  patientCardName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.gray900,
    textAlign: 'center',
  },
  patientCardNameActive: {
    color: COLORS.white,
  },
  patientCardStatus: {
    fontSize: 10,
    color: COLORS.gray400,
    marginTop: 2,
    fontWeight: '600',
  },
});

export default DoctorHomeScreen;
