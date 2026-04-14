import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const WELLNESS_TOOLS = [
  {
    id: 'journal',
    title: 'Daily Journal',
    description: 'Write down your thoughts and reflections for the day.',
    icon: 'edit-3',
    iconType: 'Feather',
    route: 'PatientJournal',
  },
  {
    id: 'mood',
    title: 'Mood Tracker',
    description: 'Track how you feel and monitor your mental wellbeing.',
    icon: 'smile',
    iconType: 'Feather',
    route: 'PatientMoodTracker',
  },
  {
    id: 'worksheets',
    title: 'Worksheets',
    description: 'Complete therapist-assigned exercises and worksheets (Offline supported).',
    icon: 'file-text',
    iconType: 'Feather',
    route: 'PatientWorksheets',
  },
];

const PatientWellnessScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wellness Hub</Text>
        <Text style={styles.headerSubtitle}>
          Your personal space for reflection and growth.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {WELLNESS_TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={styles.card}
            onPress={() => tool.route && navigation.navigate(tool.route)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: COLORS.accent }]}>
              <CustomIcon
                name={tool.icon}
                size={28}
                color={COLORS.primary}
                iconType={tool.iconType}
                touchable={false}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{tool.title}</Text>
              <Text style={styles.cardDescription}>{tool.description}</Text>
            </View>
            <CustomIcon
              name="chevron-right"
              size={24}
              color={COLORS.gray400}
              iconType="Feather"
              touchable={false}
            />
          </TouchableOpacity>
        ))}

        <View style={styles.infoBox}>
          <CustomIcon name="info" size={20} color={COLORS.primary} iconType="Feather" touchable={false} />
          <Text style={styles.infoText}>
            Worksheets work offline and will automatically sync when you reconnect.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    marginTop: 4,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight + '30',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  infoText: {
    flex: 1,
    marginLeft: SPACING.md,
    fontSize: FONTS.sizes.sm,
    color: COLORS.primaryDark,
    lineHeight: 20,
  },
});

export default PatientWellnessScreen;
