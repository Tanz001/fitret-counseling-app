import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';

const RESOURCE_ITEMS = [
  { icon: 'headphones', iconType: 'Feather', label: 'Guided exercises', route: null },
  { icon: 'book', iconType: 'Feather', label: 'Articles', route: null },
  { icon: 'message-circle', iconType: 'Feather', label: 'Fitret Chat', route: 'Chat' },
];

const DEFAULT_PATIENT = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  avatar: require('../assets/person.webp'),
};

const PatientProfileScreen = ({ navigation, route }) => {
  const [patient, setPatient] = useState(route?.params?.patient ?? DEFAULT_PATIENT);
  const logoutSheetRef = useRef(null);

  // Refetch profile from DB when screen is focused so profile picture is always up to date
  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      const loadProfile = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user || cancelled) return;
          const { data: userData } = await supabase
            .from('users')
            .select('full_name, email, profile_picture')
            .eq('id', user.id)
            .single();

          if (cancelled) return;
          if (userData) {
            setPatient(prev => ({
              ...prev,
              name: userData.full_name || prev.name,
              email: userData.email || user.email || prev.email,
              avatar: userData.profile_picture ? { uri: userData.profile_picture } : DEFAULT_PATIENT.avatar,
            }));
          }
        } catch (e) {
          // keep current state on error
        }
      };
      loadProfile();
      return () => { cancelled = true; };
    }, []),
  );

  // When navigating back from Edit Profile with updated params, show them
  React.useEffect(() => {
    if (route?.params?.patient) {
      setPatient(route.params.patient);
    }
  }, [route?.params?.patient]);

  const handleLogout = async () => {
    logoutSheetRef.current?.close();
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    await AsyncStorage.clear();
    navigation.reset({ index: 0, routes: [{ name: 'AuthWelcome' }] });
  };

  const renderOptionRow = (icon, iconType, title, route) => (
    <TouchableOpacity
      style={styles.optionRow}
      onPress={() => route && navigation.navigate(route)}
      activeOpacity={0.8}
    >
      <View style={styles.optionIconBg}>
        <CustomIcon name={icon} size={20} color={COLORS.primary} iconType={iconType} touchable={false} />
      </View>
      <Text style={styles.optionTitle}>{title}</Text>
      <CustomIcon name="chevron-right" size={20} color={COLORS.gray400} iconType="Feather" touchable={false} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image
            source={
              typeof patient.avatar === 'string'
                ? { uri: patient.avatar }
                : (patient.avatar || DEFAULT_PATIENT.avatar)
            }
            style={styles.avatar}
          />
          <Text style={styles.name}>{patient.name}</Text>
          <Text style={styles.email}>{patient.email}</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('PatientEditProfile', { patient })}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <Text style={styles.sectionSubtitle}>Wellness tools and support</Text>
          <View style={styles.resourcesGrid}>
            {RESOURCE_ITEMS.map((r, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.resourceCard}
                onPress={() => r.route && navigation.navigate(r.route)}
              >
                <View style={styles.resourceIconBg}>
                  <CustomIcon name={r.icon} size={24} color={COLORS.primary} iconType={r.iconType} touchable={false} />
                </View>
                <Text style={styles.resourceLabel}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {renderOptionRow('bell', 'Feather', 'Notifications', 'Notifications')}
          {renderOptionRow('lock', 'Feather', 'Privacy & Security')}
          {renderOptionRow('credit-card', 'Feather', 'Payment Methods')}
          {renderOptionRow('file-text', 'Feather', 'Intake Forms')}
          {renderOptionRow('help-circle', 'Feather', 'Help Center')}
          {renderOptionRow('info', 'Feather', 'About Fitret')}
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => logoutSheetRef.current?.open()}
        >
          <CustomIcon name="log-out" size={20} color={COLORS.error} style={{ marginRight: 10 }} iconType="Feather" touchable={false} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <RBSheet
        ref={logoutSheetRef}
        closeOnDragDown
        closeOnPressMask
        height={220}
        customStyles={{
          container: { borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl },
          wrapper: { backgroundColor: COLORS.overlay },
        }}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Log out?</Text>
          <Text style={styles.sheetMessage}>You can sign back in anytime.</Text>
          <TouchableOpacity style={styles.sheetCancelBtn} onPress={() => logoutSheetRef.current?.close()} activeOpacity={0.8}>
            <Text style={styles.sheetCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetConfirmBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={styles.sheetConfirmText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </RBSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: SPACING.md },
  name: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.gray900, marginBottom: 4 },
  email: { fontSize: FONTS.sizes.md, color: COLORS.gray500, marginBottom: SPACING.lg },
  editBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: RADIUS.full },
  editBtnText: { color: COLORS.white, fontWeight: '600', fontSize: FONTS.sizes.md },
  section: { padding: SPACING.lg, paddingTop: SPACING.xl },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900, marginBottom: 4 },
  sectionSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.gray500, marginBottom: SPACING.lg },
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  resourceCard: {
    width: '30%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  resourceIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  resourceLabel: { fontSize: FONTS.sizes.xs, color: COLORS.gray700, fontWeight: '500', textAlign: 'center' },
  optionRow: {
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
  optionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  optionTitle: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.gray900, fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
    padding: SPACING.lg,
    backgroundColor: '#FFEBEE',
    borderRadius: RADIUS.lg,
  },
  logoutText: { color: COLORS.error, fontSize: FONTS.sizes.md, fontWeight: '700' },
  sheetContent: { padding: SPACING.xl },
  sheetTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.gray900, marginBottom: 8 },
  sheetMessage: { fontSize: FONTS.sizes.md, color: COLORS.gray500, marginBottom: SPACING.lg },
  sheetCancelBtn: { paddingVertical: 14, alignItems: 'center', borderRadius: RADIUS.lg, backgroundColor: COLORS.gray100, marginBottom: SPACING.sm },
  sheetCancelText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.gray700 },
  sheetConfirmBtn: { paddingVertical: 14, alignItems: 'center', borderRadius: RADIUS.lg, backgroundColor: COLORS.error + '15', borderWidth: 1, borderColor: COLORS.error + '40' },
  sheetConfirmText: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.error },
});

export default PatientProfileScreen;
