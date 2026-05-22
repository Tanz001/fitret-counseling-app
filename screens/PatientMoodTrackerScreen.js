import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppIntroSlider from 'react-native-app-intro-slider';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { supabase } from '../utils/supabase';
import Toast from 'react-native-simple-toast';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - SPACING.lg * 2 - 40;
const CHART_HEIGHT = 220;
const CHART_PAD = { top: 20, right: 12, bottom: 28, left: 32 };
const PLOT_WIDTH = CHART_WIDTH - CHART_PAD.left - CHART_PAD.right;
const PLOT_HEIGHT = CHART_HEIGHT - CHART_PAD.top - CHART_PAD.bottom;
const MAX_POINTS = 14;
const GRID_LINES = [1, 2, 3, 4, 5, 6, 7]; // mood score axis

// DB enum: very_happy, happy, neutral, sad, very_sad, angry, anxious
const MOODS = [
  { id: 'very_happy', emoji: '😄', label: 'Very Happy', color: '#22C55E' },
  { id: 'happy', emoji: '😊', label: 'Happy', color: '#84CC16' },
  { id: 'neutral', emoji: '😐', label: 'Neutral', color: '#94A3B8' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: '#F59E0B' },
  { id: 'very_sad', emoji: '😭', label: 'Very Sad', color: '#EF4444' },
  { id: 'angry', emoji: '😠', label: 'Angry', color: '#DC2626' },
  { id: 'anxious', emoji: '😰', label: 'Anxious', color: '#8B5CF6' },
];

// Mood to score 1–7 for chart (higher = better mood)
const MOOD_SCORE = {
  very_sad: 1,
  sad: 2,
  anxious: 3,
  angry: 4,
  neutral: 5,
  happy: 6,
  very_happy: 7,
};

const MOOD_COLOR_MAP = Object.fromEntries(MOODS.map((m) => [m.id, m.color]));

function getTodayISO() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

const PatientMoodTrackerScreen = ({ navigation }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [hasSeenIntro, setHasSeenIntro] = useState(true); // default true while checking
  const [timeFilter, setTimeFilter] = useState('7');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates?.height || 0);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('moodTrackerIntroShown')
      .then((val) => {
        if (val !== 'true') setHasSeenIntro(false);
      })
      .catch((e) => console.error(e));
  }, []);

  const onDoneIntro = async () => {
    try {
      await AsyncStorage.setItem('moodTrackerIntroShown', 'true');
      setHasSeenIntro(true);
    } catch (e) {
      console.error(e);
      setHasSeenIntro(true);
    }
  };

  const fetchMoodLogs = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLogs([]);
        setLoading(false);
        return;
      }

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - parseInt(timeFilter, 10));
      const dateString = pastDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('mood_logs')
        .select('id, mood, mood_date, note, created_at')
        .eq('patient_id', user.id)
        .gte('mood_date', dateString)
        .order('mood_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (e) {
      console.error('Fetch mood logs:', e);
      Toast.show('Could not load mood history');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  useFocusEffect(
    useCallback(() => {
      fetchMoodLogs();
    }, [fetchMoodLogs])
  );

  const handleSave = async () => {
    if (!selectedMood) {
      Toast.show('Select how you feel');
      return;
    }
    try {
      setSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Toast.show('Please sign in');
        return;
      }

      const { error } = await supabase.from('mood_logs').insert({
        patient_id: user.id,
        mood: selectedMood,
        mood_date: getTodayISO(),
        note: note.trim() || null,
      });

      if (error) throw error;
      Toast.show('Mood saved');
      setNote('');
      setSelectedMood(null);
      fetchMoodLogs();
    } catch (e) {
      console.error('Save mood:', e);
      Toast.show(e.message || 'Failed to save mood');
    } finally {
      setSaving(false);
    }
  };

  // Build chart data: one point per day (latest mood that day), oldest → newest
  const chartData = (() => {
    const byDate = {};
    logs.forEach((log) => {
      const d = log.mood_date;
      if (!byDate[d]) byDate[d] = log;
    });
    const sortedDates = Object.keys(byDate).sort();
    const maxDataPoints = timeFilter === '90' ? 30 : parseInt(timeFilter, 10);
    const recentDays = sortedDates.slice(-maxDataPoints); // limit visually on chart
    return recentDays.map((d) => ({
      date: d,
      mood: byDate[d].mood,
      score: MOOD_SCORE[byDate[d].mood] ?? 4,
      color: MOOD_COLOR_MAP[byDate[d].mood] || COLORS.gray400,
    }));
  })();

  const scoreToY = (score) => {
    const normalized = (7 - score) / 6;
    return CHART_PAD.top + normalized * PLOT_HEIGHT;
  };
  const indexToX = (i) => {
    if (chartData.length <= 1) return CHART_PAD.left + PLOT_WIDTH / 2;
    return CHART_PAD.left + (i / (chartData.length - 1)) * PLOT_WIDTH;
  };

  let linePath = '';
  let areaPath = '';
  if (chartData.length > 0) {
    const points = chartData.map((item, i) => ({ x: indexToX(i), y: scoreToY(item.score) }));
    linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const bottomY = CHART_PAD.top + PLOT_HEIGHT;
    areaPath = `${linePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
  }

  if (!hasSeenIntro) {
    const slides = [
      {
        key: '1',
        title: 'Benefits of mood tracking',
        text: 'Studies have shown that tracking your mood can improve your overall wellness by increasing your awareness of trends and influences.',
        image: { uri: 'https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?auto=format&fit=crop&w=600&q=80' },
      },
      {
        key: '2',
        title: 'How it works',
        text: "It's easy! Log your mood regularly, view trends, and discuss your moods with your therapist for tailored support.",
        image: { uri: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?auto=format&fit=crop&w=600&q=80' },
      },
      {
        key: '3',
        title: 'See your progress',
        text: 'Review daily, weekly, or monthly charts of your emotional journey and take control of your well-being.',
        image: { uri: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80' },
      }
    ];

    const renderItem = ({ item }) => (
      <View style={styles.introSlide}>
        <View style={styles.introContent}>
          <Image source={item.image} style={styles.introImage} resizeMode="cover" />
          <Text style={styles.introTitle}>{item.title}</Text>
          <Text style={styles.introText}>{item.text}</Text>
        </View>
      </View>
    );

    const renderNextButton = () => (
      <View style={styles.introButtonContainer}>
        <Text style={styles.introButtonText}>Next</Text>
      </View>
    );

    const renderDoneButton = () => (
      <View style={styles.introButtonContainer}>
        <Text style={styles.introButtonText}>Get Started</Text>
      </View>
    );

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerSide} onPress={() => navigation.goBack()}>
            <CustomIcon name="chevron-left" size={24} color={COLORS.gray900} iconType="Feather" touchable={false} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
              Mood Tracker
            </Text>
          </View>
          <View style={styles.headerSide} />
        </View>
        <AppIntroSlider
          renderItem={renderItem}
          data={slides}
          onDone={onDoneIntro}
          showSkipButton={false}
          bottomButton={true}
          renderNextButton={renderNextButton}
          renderDoneButton={renderDoneButton}
          activeDotStyle={styles.introActiveDot}
          dotStyle={styles.introDot}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerSide} onPress={() => navigation.goBack()}>
          <CustomIcon name="chevron-left" size={24} color={COLORS.gray900} iconType="Feather" touchable={false} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            Mood Tracker
          </Text>
        </View>
        <View style={styles.headerSide} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.greetingCard}>
            <Text style={styles.greetingTitle}>How are you feeling?</Text>
            <Text style={styles.greetingSub}>
              Log your mood to spot patterns. Your therapist can use this between sessions.
            </Text>
          </View>

          <View style={styles.moodSection}>
            <Text style={styles.sectionLabel}>Select your mood</Text>
            <View style={styles.moodGrid}>
              {MOODS.map((mood) => {
                const isSelected = selectedMood === mood.id;
                return (
                  <TouchableOpacity
                    key={mood.id}
                    style={[styles.moodOption, isSelected && { borderColor: mood.color, backgroundColor: mood.color + '18' }]}
                    onPress={() => setSelectedMood(mood.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.moodEmoji, isSelected && { transform: [{ scale: 1.15 }] }]}>{mood.emoji}</Text>
                    <Text style={[styles.moodLabel, isSelected && { color: mood.color, fontWeight: '700' }]}>{mood.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.noteSection}>
            <Text style={styles.sectionLabel}>Note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Add a short note about why you feel this way..."
              placeholderTextColor={COLORS.gray400}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <Text style={styles.chartTitle}>Your mood over time</Text>
                <View style={{flexDirection: 'row', gap: 6}}>
                  {['7', '30', '90'].map(f => (
                    <TouchableOpacity 
                      key={f} 
                      onPress={() => setTimeFilter(f)}
                      style={[styles.filterChip, timeFilter === f && styles.filterChipActive]}
                    >
                      <Text style={[styles.filterText, timeFilter === f && styles.filterTextActive]}>{f}d</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {chartData.length === 0 && !loading && (
                <Text style={styles.chartEmpty}>Log your mood to see the graph</Text>
              )}
            </View>

            {loading ? (
              <View style={styles.chartPlaceholder}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : chartData.length > 0 ? (
              <View style={styles.chartWrap}>
                <View style={styles.chartYLabels}>
                  <Text style={styles.yLabel}>Very happy</Text>
                  <Text style={styles.yLabel}>Neutral</Text>
                  <Text style={styles.yLabel}>Very sad</Text>
                </View>
                <Svg width={CHART_WIDTH} height={CHART_HEIGHT} style={styles.svg}>
                  <Defs>
                    <LinearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.35} />
                      <Stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.02} />
                    </LinearGradient>
                  </Defs>
                  {GRID_LINES.map((score) => {
                    const y = scoreToY(score);
                    return (
                      <Line
                        key={score}
                        x1={CHART_PAD.left}
                        y1={y}
                        x2={CHART_PAD.left + PLOT_WIDTH}
                        y2={y}
                        stroke={COLORS.gray100}
                        strokeWidth={1}
                        strokeDasharray="4,4"
                      />
                    );
                  })}
                  {areaPath ? <Path d={areaPath} fill="url(#moodGradient)" /> : null}
                  {linePath ? (
                    <Path
                      d={linePath}
                      fill="none"
                      stroke={COLORS.primary}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : null}
                  {chartData.map((item, i) => {
                    const x = indexToX(i);
                    const y = scoreToY(item.score);
                    return (
                      <Circle
                        key={item.date}
                        cx={x}
                        cy={y}
                        r={5}
                        fill={COLORS.white}
                        stroke={item.color}
                        strokeWidth={2.5}
                      />
                    );
                  })}
                </Svg>
                <View style={[styles.chartXLabels, { width: CHART_WIDTH }]}>
                  {chartData.map((item, i) => (
                    <View key={item.date} style={[styles.xLabelWrap, { flex: 1 }]}>
                      <Text style={styles.xLabel} numberOfLines={1}>
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>

          {logs.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.sectionTitle}>Recent entries</Text>
              {logs.slice(0, 7).map((log) => (
                <View key={log.id} style={styles.recentRow}>
                  <Text style={styles.recentEmoji}>{MOODS.find((m) => m.id === log.mood)?.emoji ?? '•'}</Text>
                  <View style={styles.recentTextWrap}>
                    <Text style={styles.recentDate}>
                      {new Date(log.mood_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    {log.note ? <Text style={styles.recentNote} numberOfLines={2}>{log.note}</Text> : null}
                  </View>
                  <View style={[styles.recentDot, { backgroundColor: MOOD_COLOR_MAP[log.mood] || COLORS.gray400 }]} />
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, (!selectedMood || saving) && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!selectedMood || saving}
            activeOpacity={0.9}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.saveBtnText}>Save today&apos;s check-in</Text>
            )}
          </TouchableOpacity>

          <View style={[styles.bottomSpacer, keyboardHeight > 0 && { height: keyboardHeight + SPACING.lg }]} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerSide: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray900,
    textAlign: 'center',
    width: '100%',
  },

  content: { padding: SPACING.lg, paddingBottom: 130 },

  greetingCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  greetingTitle: { fontSize: 22, fontWeight: '800', color: COLORS.gray900, marginBottom: 8 },
  greetingSub: { fontSize: FONTS.sizes.md, color: COLORS.gray500, lineHeight: 22 },

  moodSection: { marginBottom: SPACING.xl },
  sectionLabel: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.gray700, marginBottom: SPACING.sm },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  moodOption: {
    width: (width - SPACING.lg * 2 - SPACING.sm * 3) / 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  moodEmoji: { fontSize: 28, marginBottom: 4 },
  moodLabel: { fontSize: 10, fontWeight: '600', color: COLORS.gray600, textAlign: 'center' },

  noteSection: { marginBottom: SPACING.xl },
  noteInput: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray900,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },

  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  chartHeader: { marginBottom: SPACING.md },
  chartTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  chartEmpty: { fontSize: FONTS.sizes.sm, color: COLORS.gray500, marginTop: 4 },
  chartPlaceholder: { height: CHART_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  chartWrap: { flexDirection: 'row', alignItems: 'flex-end' },
  chartYLabels: {
    width: 56,
    height: CHART_HEIGHT,
    justifyContent: 'space-between',
    paddingVertical: 2,
    marginRight: 4,
  },
  yLabel: { fontSize: 9, color: COLORS.gray500, fontWeight: '600' },
  svg: { overflow: 'visible' },
  chartXLabels: {
    flexDirection: 'row',
    marginTop: 8,
    marginLeft: 60,
  },
  xLabelWrap: { alignItems: 'center', minWidth: 24 },
  xLabel: { fontSize: 9, color: COLORS.gray500, textAlign: 'center' },

  recentSection: { marginBottom: SPACING.xl },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.gray800, marginBottom: SPACING.md },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  recentEmoji: { fontSize: 24, marginRight: SPACING.md },
  recentTextWrap: { flex: 1 },
  recentDate: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.gray800 },
  recentNote: { fontSize: FONTS.sizes.xs, color: COLORS.gray500, marginTop: 2 },
  recentDot: { width: 10, height: 10, borderRadius: 5, marginLeft: SPACING.sm },

  bottomSpacer: { height: 20 },

  // Intro Slider Styles
  introSlide: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
    paddingTop: 0,
    paddingBottom: 40,
  },
  introContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introImage: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xxl,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray900,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  introText: {
    fontSize: 16,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: SPACING.sm,
  },
  introButtonContainer: {
    backgroundColor: '#DA6140', // Screenshot brand color
    paddingVertical: 16,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: Platform.OS === 'ios' ? 0 : 12,
  },
  introButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
  },
  introActiveDot: {
    backgroundColor: COLORS.gray600,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    marginBottom: 44, // move up above the bottom button
  },
  introDot: {
    backgroundColor: COLORS.gray200,
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    marginBottom: 44,
  },
  filterChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  filterChipActive: {
    backgroundColor: COLORS.primaryLight + '30',
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  filterTextActive: {
    color: COLORS.primaryDark,
  },
});

export default PatientMoodTrackerScreen;
