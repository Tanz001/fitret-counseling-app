import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, FlatList, Image, TouchableOpacity, Platform } from 'react-native';
import CustomIcon from '../components/CustomIcon';
import RBSheet from "react-native-raw-bottom-sheet";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { formatEtb } from '../constants/currency';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';
import { useFocusEffect } from '@react-navigation/native';

const PatientHomeScreen = ({ navigation }) => {
  const filterSheetRef = useRef();
  const [userName, setUserName] = useState('There');
  const [therapists, setTherapists] = useState([]);
  const [therapistError, setTherapistError] = useState(null);

  useEffect(() => {
    const loadName = async () => {
      try {
        const cached = await AsyncStorage.getItem('@user_profile');
        if (cached) {
          const profile = JSON.parse(cached);
          if (profile.full_name) {
            setUserName(profile.full_name.split(' ')[0]);
            return;
          }
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('full_name, profile_picture')
            .eq('id', user.id)
            .single();

          const fullName = userData?.full_name || user.user_metadata?.full_name || user.email;
          if (fullName) {
            setUserName(fullName.split(' ')[0]);
          }
        }
      } catch (e) {
        // keep default
      }
    };

    loadName();
  }, []);

  const loadTherapistsWithReviews = useCallback(async () => {
    try {
      setTherapistError(null);
      console.log('[Therapists API] calling...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTherapists([]);
        return;
      }

      const { data: assignments, error: assignError } = await supabase
        .from('patient_therapists')
        .select('therapist_id')
        .eq('patient_id', user.id);

      if (assignError) {
        console.log('[API Error] Fetch assigned therapists failed:', assignError);
        setTherapistError('Unable to load assigned therapists.');
        setTherapists([]);
        return;
      }

      const assignedTherapistIds = [...new Set((assignments || []).map((a) => a.therapist_id).filter(Boolean))];
      if (assignedTherapistIds.length === 0) {
        setTherapists([]);
        return;
      }

      const { data: therapistsData, error: therapistsError } = await supabase
        .from('users')
        .select('id, full_name, specialization, role, profile_picture, fee');

      console.log('[Therapists API] data:', therapistsData);
      console.log('[Therapists API] error:', therapistsError);

      if (therapistsError || !therapistsData) {
        console.log('[API Error] Fetch therapists failed:', therapistsError);
        setTherapistError('Unable to load therapists.');
        setTherapists([]);
        return;
      }

      const therapistRows = therapistsData.filter(
        (t) => t.role === 'therapist' && assignedTherapistIds.includes(t.id)
      );
      console.log('[Therapists] filtered therapists:', therapistRows);
      const therapistIds = therapistRows.map(t => t.id);
      if (therapistIds.length === 0) {
        setTherapists([]);
        return;
      }

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('therapist_id, rating')
        .in('therapist_id', therapistIds);

      if (reviewsError) {
        console.log('[API Error] Fetch reviews failed:', reviewsError);
      }

      const grouped = {};
      (reviewsData || []).forEach(r => {
        if (!grouped[r.therapist_id]) grouped[r.therapist_id] = [];
        grouped[r.therapist_id].push(r.rating);
      });

      const enriched = therapistRows.map(t => {
        const ratings = grouped[t.id] || [];
        const count = ratings.length;
        const avg = count
          ? ratings.reduce((sum, v) => sum + v, 0) / count
          : null;

        return {
          id: t.id,
          name: t.full_name || 'Therapist',
          title: t.specialization || 'Licensed Therapist',
          subtitle: count ? `${avg?.toFixed(1)} ★ • ${count} review${count > 1 ? 's' : ''}` : 'No reviews yet',
          image: t.profile_picture ? { uri: t.profile_picture } : require('../assets/person.webp'),
          avgRating: avg,
          reviewCount: count,
          fee: t.fee != null ? Number(t.fee) : null,
        };
      });

      setTherapists(enriched);
      console.log('[Therapists API] success, count:', enriched.length);
    } catch (e) {
      console.log('[Client Error] loadTherapistsWithReviews failed:', e);
      setTherapists([]);
    }
  }, []);

  useEffect(() => {
    loadTherapistsWithReviews();
  }, [loadTherapistsWithReviews]);

  useFocusEffect(
    useCallback(() => {
      loadTherapistsWithReviews();
    }, [loadTherapistsWithReviews]),
  );

  const renderTherapist = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => navigation.navigate('DoctorProfile', { therapist: item })}
    >
      <Image source={item.image} style={styles.avatar} />
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        {item.fee != null && !isNaN(item.fee) && (
          <Text style={styles.feeText}>{formatEtb(item.fee)}/session</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={(e) => { e.stopPropagation(); navigation.navigate('BookingCalendar', { therapist: item }); }}
      >
        <Text style={styles.actionButtonText}>Get Session</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Welcome back,</Text>
          <Text style={styles.headerTitleCompact}>{userName}</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <View style={styles.notifDot} />
          <CustomIcon
            name="notifications-outline"
            size={22}
            color={COLORS.gray700}
            iconType="Ionicons"
            touchable={false}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.headerContent}>
        <View style={styles.searchContainer}>
          <View style={styles.iconBg}>
            <CustomIcon name="search-outline" size={18} color={COLORS.primaryDark} style={styles.searchIcon} iconType="Ionicons" touchable={false} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search therapists..."
            placeholderTextColor={COLORS.gray400}
          />
          <TouchableOpacity onPress={() => filterSheetRef.current?.open()} style={styles.iconBg}>
            <CustomIcon name="options-outline" size={18} color={COLORS.primaryDark} iconType="Ionicons" touchable={false} />
          </TouchableOpacity>
        </View>
      </View>

      {therapistError ? (
        <Text style={styles.errorText}>{therapistError}</Text>
      ) : null}

      <FlatList
        data={therapists}
        renderItem={renderTherapist}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <RBSheet
        ref={filterSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          wrapper: { backgroundColor: 'rgba(0,0,0,0.4)' },
          draggableIcon: { backgroundColor: COLORS.gray300 },
          container: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: 320,
            padding: SPACING.lg,
          },
        }}
      >
        <Text style={styles.sheetTitle}>Filters</Text>
        <Text style={styles.sheetDesc}>Filter by availability, specialty, or location.</Text>
      </RBSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  greetingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  headerTitleCompact: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.gray900 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  headerContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, backgroundColor: COLORS.white },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    ...SHADOWS.sm,
  },
  searchIcon: {
    marginRight: 0,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray900,
  },
  listContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  errorText: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    color: COLORS.error,
    fontSize: FONTS.sizes.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: SPACING.lg,
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 2,
  },
  title: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray400,
  },
  feeText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: RADIUS.full,
    ...SHADOWS.sm,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  sheetTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  sheetDesc: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
  },
});

export default PatientHomeScreen;
