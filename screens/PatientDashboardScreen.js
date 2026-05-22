import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import CustomIcon from '../components/CustomIcon';
import moment from 'moment';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../constants/theme';
import {supabase} from '../utils/supabase';

const MOTIVATIONAL_QUOTES = [
  "Every day is a fresh start.",
  "You are stronger than you think.",
  "Progress, not perfection.",
  "Small steps lead to big changes."
];

const PatientDashboardScreen = ({navigation}) => {
  const [pendingSessions, setPendingSessions] = useState([]);
  const [myTherapists, setMyTherapists] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [userName, setUserName] = useState('There');
  const [userAvatar, setUserAvatar] = useState(require('../assets/person.webp'));
  const [quote] = useState(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

  useEffect(() => {
    fetchUserData();
    fetchDashboardData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
      fetchDashboardData();
    }, []),
  );

  const fetchDashboardData = async () => {
    try {
      setLoadingSessions(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all appointments for the patient
      const { data: allAppointments, error: aptError } = await supabase
        .from('appointments')
        .select(`
          *,
          therapist:therapist_id (
            id,
            full_name,
            specialization,
            profile_picture
          )
        `)
        .eq('patient_id', user.id);

      if (aptError) throw aptError;

      // 1. Filter pending/upcoming sessions
      const upcoming = (allAppointments || [])
        .filter(a => ['pending', 'confirmed'].includes(a.status))
        .filter(a => moment(a.appointment_date).isSameOrAfter(moment(), 'day'))
        .sort((a, b) => {
          const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
          const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
          return dateA - dateB;
        })
        .slice(0, 3);

      const formattedUpcoming = upcoming.map(u => {
        const t = u.therapist || {};
        return {
          id: u.id,
          doctor: t.full_name || 'Therapist',
          specialty: t.specialization || 'Professional',
          rawDate: u.appointment_date,
          date: moment(u.appointment_date).format('MMM D, YYYY'),
          time: u.appointment_time,
          status: u.status,
          image: t.profile_picture ? { uri: t.profile_picture } : require('../assets/person.webp'),
        };
      });
      setPendingSessions(formattedUpcoming);

      // 2. Get unique therapists
      const uniqueTherapistsMap = {};
      (allAppointments || []).forEach(apt => {
        if (apt.therapist && !uniqueTherapistsMap[apt.therapist.id]) {
          uniqueTherapistsMap[apt.therapist.id] = apt.therapist;
        }
      });
      setMyTherapists(Object.values(uniqueTherapistsMap));

    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('full_name, profile_picture')
          .eq('id', user.id)
          .single();

        if (userData) {
          if (userData.full_name) setUserName(userData.full_name.split(' ')[0]);
          if (userData.profile_picture) setUserAvatar({ uri: userData.profile_picture });
        }
      }
    } catch (e) {
      console.log('Error fetching user data for dashboard:', e);
    }
  };

  const getGreeting = () => {
    const hour = moment().hour();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getGreetingEmoji = () => {
    const hour = moment().hour();
    if (hour < 12) return '☀️';
    if (hour < 18) return '🌤️';
    return '🌙';
  };

  const getNextSessionText = () => {
    if (!pendingSessions.length) return null;

    const sorted = [...pendingSessions].sort((a,b) => {
      return new Date(`${a.rawDate}T${a.time || '00:00:00'}`) - new Date(`${b.rawDate}T${b.time || '00:00:00'}`);
    });
    
    // Filter out sessions that ended > 1 hour ago
    const validSessions = sorted.filter(s => {
      const sDate = moment(`${s.rawDate}T${s.time || '00:00:00'}`);
      return sDate.isAfter(moment().subtract(1, 'hours'));
    });
    
    if (!validSessions.length) return null;

    const next = validSessions[0];
    const sessionDateTime = moment(`${next.rawDate}T${next.time || '00:00:00'}`);
    const now = moment();
    
    if (sessionDateTime.isBefore(now)) {
      return `Your session with your therapist has started`;
    }
    
    const diffHours = sessionDateTime.diff(now, 'hours');
    const diffMinutes = sessionDateTime.diff(now, 'minutes') % 60;
    const diffDays = sessionDateTime.clone().startOf('day').diff(now.clone().startOf('day'), 'days');

    let timeText = '';
    if (diffDays === 0) {
      if (diffHours > 0) timeText = `in ${diffHours} hr ${diffMinutes > 0 ? diffMinutes + ' min' : ''}`;
      else timeText = `in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    } else if (diffDays === 1) {
      timeText = `tomorrow at ${moment(next.time, 'HH:mm:ss').format('h:mm A')}`;
    } else {
      timeText = `in ${diffDays} days`;
    }

    return `Your next session is ${timeText}`;
  };

  const nextSessionText = getNextSessionText();
  const nextSession = pendingSessions.length > 0 ? pendingSessions[0] : null;
  const isTodaySession = !!nextSession && moment(nextSession.rawDate).isSame(moment(), 'day');
  const isNearSession =
    !!nextSession &&
    isTodaySession &&
    moment(`${nextSession.rawDate}T${nextSession.time || '00:00:00'}`).diff(moment(), 'minutes') <= 60 &&
    moment(`${nextSession.rawDate}T${nextSession.time || '00:00:00'}`).diff(moment(), 'minutes') >= 0;
  const sessionStatusLabel = isNearSession ? 'Starting soon' : isTodaySession ? 'Today' : 'Future';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={require('../assets/dashboard1.webp')}
          style={styles.header}
          resizeMode="cover">
          <View style={styles.headerOverlay} />
          <View style={styles.headerRow}>
            <View style={{flex: 1}}>
              <Text style={styles.dateText}>{moment().format('dddd, MMMM Do YYYY')}</Text>
              <Text style={styles.greeting}>{getGreeting()}, {userName} {getGreetingEmoji()}</Text>
              <Text style={styles.subGreeting}>Here's your wellness overview</Text>
              <Text style={styles.quoteText}>"{quote}"</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.getParent()?.navigate('Profile')}
              style={styles.headerAvatarBtn}>
              <Image
                source={userAvatar}
                style={styles.headerAvatar}
              />
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* Next Session Countdown */}
        {loadingSessions ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={{marginTop: 20}} />
        ) : nextSessionText ? (
          <View style={styles.countdownCard}>
            <View style={styles.countdownIconBg}>
              <CustomIcon name="calendar" size={24} color={COLORS.primary} iconType="Ionicons" touchable={false} />
            </View>
            <View style={{flex: 1}}>
              <View style={[styles.sessionStatusBadge, isTodaySession ? styles.sessionStatusToday : styles.sessionStatusFuture, isNearSession && styles.sessionStatusPulse]}>
                <Text style={[styles.sessionStatusText, isTodaySession ? styles.sessionStatusTodayText : styles.sessionStatusFutureText]}>
                  {sessionStatusLabel}
                </Text>
              </View>
              <Text style={styles.countdownText}>{nextSessionText}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.countdownCard}>
            <View style={styles.countdownIconBg}>
              <CustomIcon name="calendar" size={24} color={COLORS.primary} iconType="Ionicons" touchable={false} />
            </View>
            <View style={styles.countdownContent}>
              <Text style={styles.countdownText}>No upcoming sessions scheduled.</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
                <Text style={styles.bookNowInline}>Book Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Mood Check-in Prompt */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.moodPromptCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('PatientMoodTracker')}
          >
            <View style={[styles.activityIconBg, {backgroundColor: COLORS.accent}]}>
              <CustomIcon name="smile" size={24} color={COLORS.primary} iconType="Feather" touchable={false} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Mood Check-in</Text>
              <Text style={styles.activitySub}>How are you feeling right now? Log today&apos;s mood.</Text>
            </View>
            <CustomIcon name="chevron-right" size={20} color={COLORS.gray400} iconType="Feather" touchable={false} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.toolsRow}>
            <TouchableOpacity style={styles.toolCard} onPress={() => navigation.navigate('PatientWorksheets')}>
              <View style={[styles.toolIconBg, { backgroundColor: COLORS.accent }]}>
                <CustomIcon name="file-text" size={24} color={COLORS.primary} iconType="Feather" touchable={false} />
              </View>
              <Text style={styles.toolLabel}>Worksheets</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.toolCard}
              activeOpacity={0.85}
              onPress={() => navigation.getParent()?.navigate('PatientGuidedExercises')}
            >
              <View style={[styles.toolIconBg, { backgroundColor: COLORS.accent }]}>
                <CustomIcon name="headphones" size={24} color={COLORS.primary} iconType="Feather" touchable={false} />
              </View>
              <Text style={styles.toolLabel}>Guided exercises</Text>
            </TouchableOpacity>
 
             <TouchableOpacity style={styles.toolCard} onPress={() => navigation.navigate('Chat')}>
              <View style={[styles.toolIconBg, { backgroundColor: COLORS.accent }]}>
                <CustomIcon name="message-circle" size={24} color={COLORS.primary} iconType="Feather" touchable={false} />
              </View>
              <Text style={styles.toolLabel}>Fitret Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Activity Trackers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Tracker</Text>
          
          <TouchableOpacity 
            style={styles.activityCard}
            onPress={() => navigation.navigate('Wellness')}
          >
            <View style={[styles.activityIconBg, { backgroundColor: COLORS.accent }]}>
              <CustomIcon name="award" size={24} color={COLORS.primary} iconType="Feather" touchable={false} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Journal Streak</Text>
              <Text style={styles.activitySub}>You've logged 5 days in a row</Text>
            </View>
            <CustomIcon name="chevron-right" size={20} color={COLORS.gray400} iconType="Feather" touchable={false} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.activityCard}
            onPress={() => navigation.navigate('Wellness')}
          >
            <View style={[styles.activityIconBg, { backgroundColor: COLORS.accent }]}>
              <CustomIcon name="pie-chart" size={24} color={COLORS.primary} iconType="Feather" touchable={false} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Mood Summary</Text>
              <Text style={styles.activitySub}>Feeling mostly positive lately</Text>
            </View>
            <CustomIcon name="chevron-right" size={20} color={COLORS.gray400} iconType="Feather" touchable={false} />
          </TouchableOpacity>
        </View>

        {/* Assigned Therapists - Redesigned & Relocated */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Therapist</Text>
          <View style={styles.therapistList}>
            {myTherapists.length > 0 ? myTherapists.map(t => (
              <TouchableOpacity 
                key={t.id} 
                style={styles.therapistCard}
                onPress={() => navigation.navigate('DoctorProfile', { therapist: t })}
                activeOpacity={0.8}
              >
                <Image source={t.profile_picture ? {uri: t.profile_picture} : require('../assets/person.webp')} style={styles.therapistCardAvatar} />
                <View style={styles.therapistCardInfo}>
                  <Text style={styles.therapistCardName}>{t.full_name}</Text>
                  <Text style={styles.therapistCardSpec} numberOfLines={1}>{t.specialization || 'Mental Health Professional'}</Text>
                  <View style={styles.viewProfileBtn}>
                    <Text style={styles.viewProfileText}>View Profile</Text>
                    <CustomIcon name="arrow-right" size={14} color={COLORS.primary} iconType="Feather" touchable={false} />
                  </View>
                </View>
              </TouchableOpacity>
            )) : (
              <TouchableOpacity style={styles.emptyTherapist} onPress={() => navigation.navigate('Appointments')}>
                <CustomIcon name="user-plus" size={24} color={COLORS.gray400} iconType="Feather" touchable={false} />
                <Text style={styles.emptyTherapistText}>Find your perfect therapist</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.offWhite},
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? SPACING.xl : SPACING.xxl,
    paddingBottom: SPACING.xxl * 1.5,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22, 38, 31, 0.52)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerAvatarBtn: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 8,
  },
  headerAvatar: {width: 44, height: 44, borderRadius: 22},
  dateText: {fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)', marginBottom: 4, fontWeight: '600'},
  greeting: {fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.white},
  subGreeting: {fontSize: FONTS.sizes.md, color: COLORS.gray100, marginTop: 4},
  quoteText: {fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', marginTop: 12, lineHeight: 20},
  
  countdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: -SPACING.xxl,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  countdownIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  countdownText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.gray900,
    lineHeight: 22,
    flexShrink: 1,
  },
  countdownContent: {
    flex: 1,
    minWidth: 0,
  },
  sessionStatusBadge: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  sessionStatusToday: {
    backgroundColor: '#EAF7EF',
  },
  sessionStatusFuture: {
    backgroundColor: '#EEF2F7',
  },
  sessionStatusPulse: {
    borderWidth: 1,
    borderColor: '#8ED2A6',
  },
  sessionStatusText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
  },
  sessionStatusTodayText: {
    color: '#2E7D32',
  },
  sessionStatusFutureText: {
    color: COLORS.gray600,
  },
  bookNowInline: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: FONTS.sizes.sm,
    marginTop: 4,
  },

  section: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  moodPromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  toolCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  toolIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  toolLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.gray800,
  },

  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  activityIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  activitySub: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  therapistList: {
    gap: SPACING.md,
  },
  therapistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  therapistCardAvatar: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.md,
  },
  therapistCardInfo: {
    flex: 1,
  },
  therapistCardName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  therapistCardSpec: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  viewProfileText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyTherapist: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray100,
    borderStyle: 'dashed',
  },
  emptyTherapistText: {
    marginTop: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    fontWeight: '600',
  },
});

export default PatientDashboardScreen;
