import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  StatusBar,
  Modal,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import CustomIcon from '../components/CustomIcon';
import {supabase} from '../utils/supabase';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../constants/theme';
import {pickAndUploadImage} from '../utils/imageUpload';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';


const DoctorProfileSettingsScreen = ({navigation}) => {
  const [available, setAvailable] = useState(true);
  const [profile, setProfile] = useState({
    name: 'Doctor',
    title: 'Loading...',
    rating: 'New',
    reviews: 0,
    avatar: require('../assets/person.webp'),
  });

  const logoutSheetRef = useRef(null);
  const photoSheetRef = useRef(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: {user},
      } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      const {data: userData, error} = await supabase
        .from('users')
        .select(
          `
          full_name,
          specialization,
          profile_picture,
          reviews!reviews_therapist_id_fkey ( rating )
        `,
        )
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching therapist profile in settings:', error);
        return;
      }

      let reviewsArr = userData?.reviews || [];
      let avgRating =
        reviewsArr.length > 0
          ? (
              reviewsArr.reduce((s, r) => s + r.rating, 0) / reviewsArr.length
            ).toFixed(1)
          : 'New';

      setProfile({
        name: userData?.full_name || 'Doctor',
        title: userData?.specialization || 'Licensed Clinical Therapist',
        rating: avgRating,
        reviews: reviewsArr.length,
        avatar: userData?.profile_picture ? { uri: userData.profile_picture } : require('../assets/person.webp'),
      });
    } catch (e) {
      console.error('Exception loading profile:', e);
    }
  };

  const handleAvatarUpload = async (source) => {
    photoSheetRef.current?.close();
    const url = await pickAndUploadImage(source);
    if (url) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('users')
          .update({ profile_picture: url })
          .eq('id', user.id);

        if (error) {
          console.error('Update Avatar Error:', error);
          Toast.show('Error updating avatar in database');
          return;
        }

        setProfile(prev => ({ ...prev, avatar: { uri: url } }));
        setSuccessModalVisible(true);
      } catch (e) {
        console.error('HandleAvatarUpload Exception:', e);
      }
    }
  };

  const handleLogout = async () => {
    logoutSheetRef.current?.close();
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    await AsyncStorage.clear();
    navigation.reset({index: 0, routes: [{name: 'AuthWelcome'}]});
  };

  const renderOptionRow = (icon, title, route = null, customColor = null) => {
    const color = customColor || COLORS.primary;
    return (
      <TouchableOpacity
        style={styles.optionRow}
        onPress={() => route && navigation.navigate(route)}
        activeOpacity={0.8}>
        <View style={[styles.iconContainer, {backgroundColor: color + '15'}]}>
          <CustomIcon
            name={icon}
            size={20}
            color={color}
            iconType="Feather"
            touchable={false}
          />
        </View>
        <Text style={styles.optionTitle}>{title}</Text>
        <CustomIcon
          name="chevron-right"
          size={20}
          color={COLORS.gray300}
          iconType="Feather"
          touchable={false}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 100}}>
        <View style={styles.header}>
          <View style={styles.headerTopBtns}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => photoSheetRef.current?.open()}>
              <CustomIcon
                name="camera"
                size={24}
                color={COLORS.gray600}
                iconType="Feather"
                touchable={false}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <CustomIcon
                name="settings"
                size={24}
                color={COLORS.gray600}
                iconType="Feather"
                touchable={false}
              />
            </TouchableOpacity>
          </View>

          <Image
            source={profile.avatar}
            style={styles.avatar}
          />
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.title}>{profile.title}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <CustomIcon
                name="star"
                size={16}
                color="#F5B041"
                style={{marginRight: 4}}
                iconType="Feather"
                touchable={false}
              />
              <Text style={styles.statBoxNum}>
                {profile.rating}
                {profile.rating !== 'New' ? '/5' : ''}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statBoxNum}>{profile.reviews}</Text>
              <Text style={styles.statBoxLabel}> Reviews</Text>
            </View>
          </View>

          <View style={styles.availabilityCard}>
            <View style={styles.availabilityLeft}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: available
                      ? COLORS.success
                      : COLORS.gray400,
                  },
                ]}
              />
              <Text style={styles.availabilityText}>
                {available ? 'Accepting Appointments' : 'Currently Unavailable'}
              </Text>
            </View>
            <Switch
              value={available}
              onValueChange={setAvailable}
              trackColor={{false: COLORS.gray200, true: COLORS.success}}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        <View style={styles.optionsContainer}>
          <Text style={styles.sectionTitle}>Practice Management</Text>
          {renderOptionRow(
            'credit-card',
            'Wallet & Transactions',
            'DoctorWallet',
          )}
          {renderOptionRow(
            'user',
            'Edit Public Profile',
            'DoctorSetup',
          )}
          {renderOptionRow(
            'clock',
            'Manage Schedule / Hours',
            'DoctorSchedule',
          )}
          {renderOptionRow('folder', 'Review Client Documents', 'TherapistTherapyDocuments')}
          {renderOptionRow(
            'file-text',
            'Clinical Notes & Templates',
          )}

          <Text style={[styles.sectionTitle, {marginTop: SPACING.xl}]}>
            Account & Legal
          </Text>
          {renderOptionRow(
            'star',
            'See Patient Reviews',
            'Reviews',
            '#F5B041',
          )}
          {renderOptionRow(
            'help-circle',
            'Provider Help Center',
            null,
            '#3498DB',
          )}
          {renderOptionRow(
            'info',
            'App Version & Policies',
            null,
            COLORS.gray600,
          )}

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => logoutSheetRef.current?.open()}
            activeOpacity={0.8}>
            <CustomIcon
              name="log-out"
              size={20}
              color={COLORS.error}
              style={{marginRight: 10}}
              iconType="Feather"
              touchable={false}
            />
            <Text style={styles.logoutText}>Log Out Securely</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <RBSheet
        ref={logoutSheetRef}
        closeOnDragDown
        closeOnPressMask
        height={220}
        customStyles={{
          container: {
            borderTopLeftRadius: RADIUS.xl,
            borderTopRightRadius: RADIUS.xl,
          },
          wrapper: {backgroundColor: COLORS.overlay},
        }}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Log out?</Text>
          <Text style={styles.sheetMessage}>You can sign back in anytime.</Text>
          <TouchableOpacity
            style={styles.sheetCancelBtn}
            onPress={() => logoutSheetRef.current?.close()}
            activeOpacity={0.8}>
            <Text style={styles.sheetCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sheetConfirmBtn}
            onPress={handleLogout}
            activeOpacity={0.8}>
            <Text style={styles.sheetConfirmText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </RBSheet>

      <RBSheet
        ref={photoSheetRef}
        closeOnDragDown
        closeOnPressMask
        height={320}
        customStyles={{
          container: {
            borderTopLeftRadius: RADIUS.xl,
            borderTopRightRadius: RADIUS.xl,
          },
          wrapper: { backgroundColor: COLORS.overlay },
        }}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Profile Photo</Text>
          <Text style={styles.sheetMessage}>Choose how you want to add your photo</Text>
          
          <TouchableOpacity 
            style={styles.sheetOption} 
            onPress={() => handleAvatarUpload('camera')}
          >
            <View style={[styles.optionIcon, { backgroundColor: COLORS.primary + '15' }]}>
              <CustomIcon name="camera" size={24} color={COLORS.primary} iconType="Feather" touchable={false} />
            </View>
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.sheetOption} 
            onPress={() => handleAvatarUpload('library')}
          >
            <View style={[styles.optionIcon, { backgroundColor: COLORS.success + '15' }]}>
              <CustomIcon name="image" size={24} color={COLORS.success} iconType="Feather" touchable={false} />
            </View>
            <Text style={styles.optionText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      </RBSheet>

      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setSuccessModalVisible(false)}
        >
          <View style={styles.successModalBox}>
            <View style={styles.successIconWrap}>
              <CustomIcon name="check-circle" size={48} color={COLORS.success} iconType="Feather" touchable={false} />
            </View>
            <Text style={styles.successModalTitle}>Photo updated</Text>
            <Text style={styles.successModalMessage}>Your profile picture has been updated successfully.</Text>
            <TouchableOpacity
              style={styles.successModalBtn}
              onPress={() => setSuccessModalVisible(false)}
              activeOpacity={0.9}
            >
              <Text style={styles.successModalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.offWhite},
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    ...SHADOWS.sm,
    zIndex: 10,
  },
  headerTopBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: SPACING.lg,
    position: 'absolute',
    top: SPACING.lg,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: COLORS.primaryLight + '50',
    marginBottom: SPACING.md,
    marginTop: SPACING.xl,
  },
  name: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  title: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    fontWeight: '500',
    marginBottom: SPACING.md,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statBox: {flexDirection: 'row', alignItems: 'center'},
  statBoxNum: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  statBoxLabel: {fontSize: FONTS.sizes.md, color: COLORS.gray600},
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.gray300,
    marginHorizontal: SPACING.md,
  },

  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray50,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    width: '85%',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  availabilityLeft: {flexDirection: 'row', alignItems: 'center'},
  statusDot: {width: 10, height: 10, borderRadius: 5, marginRight: 8},
  availabilityText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray800,
  },

  optionsContainer: {padding: SPACING.lg, paddingTop: SPACING.xl},
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.gray500,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
    marginLeft: SPACING.xs,
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  optionTitle: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray900,
    fontWeight: '600',
  },

  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xxl,
    padding: SPACING.lg,
    backgroundColor: COLORS.error + '10',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  logoutText: {
    color: COLORS.error,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
  sheetContent: {padding: SPACING.xl},
  sheetTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 8,
  },
  sheetMessage: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    marginBottom: SPACING.lg,
  },
  sheetCancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.gray100,
    marginBottom: SPACING.sm,
  },
  sheetCancelText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  sheetConfirmBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.error + '15',
    borderWidth: 1,
    borderColor: COLORS.error + '40',
  },
  sheetConfirmText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.error,
  },
  sheetOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  optionIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  optionText: { fontSize: FONTS.sizes.lg, fontWeight: '600', color: COLORS.gray800 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  successModalBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: 340,
  },
  successIconWrap: { marginBottom: SPACING.md },
  successModalTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.sm },
  successModalMessage: { fontSize: FONTS.sizes.md, color: COLORS.gray600, textAlign: 'center', marginBottom: SPACING.lg },
  successModalBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: RADIUS.lg },
  successModalBtnText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700' },
});

export default DoctorProfileSettingsScreen;
