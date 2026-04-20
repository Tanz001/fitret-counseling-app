import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import CustomIcon from '../components/CustomIcon';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../constants/theme';
import { formatEtb } from '../constants/currency';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from '../utils/supabase';

const DoctorProfileScreen = ({navigation, route}) => {
  const [therapist, setTherapist] = useState(
    route?.params?.therapist || {
      name: 'Dr. Aisha Rahman',
      specialty: 'Anxiety, Depression, Trauma',
      rating: 4.9,
      reviews: 128,
      experience: '8 years',
      about:
        'Licensed therapist specializing in cognitive behavioral therapy and mindfulness-based interventions. Committed to creating a safe, compassionate space for healing and growth.',
      image: require('../assets/person.webp'),
    },
  );

  useEffect(() => {
    const loadProfile = async () => {
      const doctorId = route?.params?.therapist?.id || route?.params?.doctorId;
      if (!doctorId) return;

      try {
        const {data: userData, error} = await supabase
          .from('users')
          .select('*')
          .eq('id', doctorId)
          .single();

        if (error) {
          console.error('Error fetching doctor details:', error);
          return;
        }

        if (userData) {
          setTherapist(prev => ({
            ...prev,
            id: userData.id,
            name: userData.full_name || prev.name,
            specialty: userData.specialization || prev.specialty,
            about: userData.bio || prev.about,
            experience: userData.experience_years
              ? `${userData.experience_years} years`
              : prev.experience,
            image: userData.profile_picture ? { uri: userData.profile_picture } : prev.image,
            fee: userData.fee != null ? Number(userData.fee) : prev.fee,
            rating: prev.rating, // Keep existing if any
            reviews: prev.reviews,
          }));
        }
      } catch (e) {
        console.error('Exception loading doctor profile:', e);
      }
    };

    loadProfile();
  }, [route?.params?.therapist?.id, route?.params?.doctorId]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}>
            <CustomIcon
              name="chevron-left"
              size={24}
              color={COLORS.gray700}
              iconType="Feather"
              touchable={false}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuBtn}>
            <CustomIcon
              name="more-horizontal"
              size={24}
              color={COLORS.gray700}
              iconType="Feather"
              touchable={false}
            />
          </TouchableOpacity>
          <Image source={therapist.image} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image source={therapist.image} style={styles.avatar} />
            <View style={styles.profileMeta}>
              <Text style={styles.name}>{therapist.name}</Text>
              <Text style={styles.specialty}>{therapist.specialty}</Text>
              <View style={styles.ratingRow}>
                <CustomIcon
                  name="star"
                  size={16}
                  color="#F5A623"
                  iconType="Feather"
                  touchable={false}
                />
                <Text style={styles.ratingText}>{therapist.rating}</Text>
                <Text style={styles.reviewsText}>
                  ({therapist.reviews || 128} reviews)
                </Text>
              </View>
              <Text style={styles.expText}>
                {therapist.experience || '8 years'} experience
              </Text>
              {therapist.fee != null && !isNaN(therapist.fee) && (
                <Text style={styles.feeText}>
                  Session fee: {formatEtb(therapist.fee)}
                </Text>
              )}
            </View>
          </View>

          <Text style={styles.aboutTitle}>About</Text>
          <Text style={styles.aboutText}>{therapist.about}</Text>

          <Text style={styles.sectionTitle}>Education</Text>
          <Text style={styles.aboutText}>
            Ph.D. in Clinical Psychology, Stanford University{'\n'}M.A. in
            Psychology, Boston University
          </Text>

          <Text style={styles.sectionTitle}>Experience</Text>
          <Text style={styles.aboutText}>
            {therapist.experience || '8 years'} of clinical practice
            specializing in cognitive behavioral therapy and mindfulness.
          </Text>

          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Reviews', {therapist})}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.reviewCard}>
            <View style={styles.reviewUserRow}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.reviewAvatarText}>M</Text>
              </View>
              <View>
                <Text style={styles.reviewUserName}>Michael T.</Text>
                <View style={styles.reviewRatingRow}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <CustomIcon
                      key={i}
                      name="star"
                      size={12}
                      color="#F5A623"
                      iconType="Feather"
                      touchable={false}
                    />
                  ))}
                </View>
              </View>
            </View>
            <Text style={styles.reviewText}>
              "Dr. Rahman is incredibly patient and understanding. I've seen
              major improvements in my anxiety levels."
            </Text>
          </View>

          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() =>
              navigation.navigate('BookingCalendar', {
                therapist,
                selectedPlan: route?.params?.selectedPlan || null,
              })
            }
            activeOpacity={0.9}>
            <Text style={styles.bookBtnText}>Book Appointment</Text>
            <CustomIcon
              name="arrow-right"
              size={20}
              color={COLORS.white}
              iconType="Feather"
              touchable={false}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.offWhite},
  heroContainer: {
    width: '100%',
    height: 320,
    backgroundColor: COLORS.gray50,
    position: 'relative',
  },
  heroImage: {width: '100%', height: '100%', resizeMode: 'cover'},
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'transparent',
  },
  backBtn: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({ios: {shadowOpacity: 0.1}, android: {elevation: 4}}),
  },
  menuBtn: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({ios: {shadowOpacity: 0.1}, android: {elevation: 4}}),
  },
  profileCard: {
    marginTop: -60,
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  profileHeader: {flexDirection: 'row', marginBottom: SPACING.lg},
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: SPACING.lg,
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.md,
  },
  profileMeta: {flex: 1},
  name: {fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.gray900},
  specialty: {fontSize: FONTS.sizes.sm, color: COLORS.gray500, marginTop: 4},
  ratingRow: {flexDirection: 'row', alignItems: 'center', marginTop: 8},
  ratingText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.gray900,
    marginLeft: 6,
  },
  reviewsText: {fontSize: FONTS.sizes.sm, color: COLORS.gray500, marginLeft: 4},
  expText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  feeText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray700,
    marginTop: 6,
    fontWeight: '600',
  },
  aboutTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
    marginTop: 4,
  },
  aboutText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray600,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  seeAllText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  reviewUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  reviewAvatarText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONTS.sizes.md,
  },
  reviewUserName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  reviewRatingRow: {flexDirection: 'row', marginTop: 2},
  reviewText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray600,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  bookBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bookBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
  },
  reviewBtn: {alignItems: 'center', paddingVertical: SPACING.lg},
  reviewBtnText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
});

export default DoctorProfileScreen;
