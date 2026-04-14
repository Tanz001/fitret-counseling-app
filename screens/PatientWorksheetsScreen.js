import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const WORKSHEETS = [
  {
    id: '1',
    title: 'Cognitive Behavioral Therapy (CBT)',
    description: 'Identifying and reframing negative thought patterns.',
    duration: '10 min',
    status: 'In Progress',
    color: '#4A90E2',
  },
  {
    id: '2',
    title: 'Anxiety Coping Strategy',
    description: 'Grounding techniques and worry exploration.',
    duration: '5 min',
    status: 'Assigned',
    color: '#F5A623',
  },
  {
    id: '3',
    title: 'Daily Gratitude Log',
    description: 'A quick 3-item gratitude list.',
    duration: '2 min',
    status: 'Completed',
    color: '#22C55E',
  },
];

const PatientWorksheetsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <CustomIcon name="chevron-left" size={24} color={COLORS.gray900} iconType="Feather" touchable={false} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Worksheets</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Assigned by your therapist</Text>
        <Text style={styles.sectionDesc}>Complete these exercises offline or online. They will sync automatically.</Text>
        
        {WORKSHEETS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => alert('Opening ' + item.title)}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
              <CustomIcon
                name="file-text"
                size={24}
                color={item.color}
                iconType="Feather"
                touchable={false}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
              <View style={styles.metaRow}>
                <CustomIcon name="clock" size={14} color={COLORS.gray500} iconType="Feather" touchable={false} />
                <Text style={styles.metaText}>{item.duration}</Text>
                
                <View style={styles.dotSeparator} />
                
                <Text style={[styles.statusText, { color: item.status === 'Completed' ? COLORS.primary : COLORS.gray600 }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  sectionLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  sectionDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    marginTop: 4,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
    lineHeight: 18,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray500,
    marginLeft: 4,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray300,
    marginHorizontal: 8,
  },
  statusText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
});

export default PatientWorksheetsScreen;
