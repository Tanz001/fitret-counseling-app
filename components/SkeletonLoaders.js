import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');

export const PatientAppointmentSkeleton = () => {
  return (
    <View style={styles.card}>
      <SkeletonPlaceholder backgroundColor={COLORS.gray100} highlightColor={COLORS.white}>
        <View style={styles.patientContainer}>
          <View style={styles.avatar} />
          <View style={styles.content}>
            <View style={styles.headerRow}>
              <View style={styles.title} />
              <View style={styles.badge} />
            </View>
            <View style={styles.subtitle} />
            <View style={styles.metaRow} />
            <View style={styles.footer}>
              <View style={styles.footerText} />
            </View>
          </View>
        </View>
      </SkeletonPlaceholder>
    </View>
  );
};

export const DoctorAppointmentSkeleton = () => {
  return (
    <View style={styles.card}>
      <SkeletonPlaceholder backgroundColor={COLORS.gray100} highlightColor={COLORS.white}>
        <View style={styles.doctorContainer}>
          <View style={styles.headerRow}>
            <View style={styles.dateRow} />
            <View style={styles.badge} />
          </View>
          <View style={styles.divider} />
          <View style={styles.patientInfo}>
            <View style={styles.avatarSmall} />
            <View style={styles.content}>
              <View style={styles.titleSmall} />
              <View style={styles.subtitleSmall} />
            </View>
          </View>
          <View style={styles.footerRow}>
            <View style={styles.typeBadge} />
            <View style={styles.button} />
          </View>
        </View>
      </SkeletonPlaceholder>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  patientContainer: {
    flexDirection: 'row',
  },
  doctorContainer: {
    flexDirection: 'column',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    width: 120,
    height: 20,
    borderRadius: 4,
  },
  titleSmall: {
    width: 100,
    height: 18,
    borderRadius: 4,
    marginBottom: 4,
  },
  subtitle: {
    width: 180,
    height: 14,
    borderRadius: 4,
    marginBottom: 10,
  },
  subtitleSmall: {
    width: 140,
    height: 12,
    borderRadius: 4,
  },
  badge: {
    width: 80,
    height: 22,
    borderRadius: 11,
  },
  metaRow: {
    width: 150,
    height: 14,
    borderRadius: 4,
    marginBottom: 12,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  footerText: {
    width: 100,
    height: 16,
    borderRadius: 4,
  },
  dateRow: {
    width: 180,
    height: 16,
    borderRadius: 4,
  },
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  typeBadge: {
    width: 90,
    height: 28,
    borderRadius: 4,
  },
  button: {
    width: 100,
    height: 36,
    borderRadius: 18,
  },
});
