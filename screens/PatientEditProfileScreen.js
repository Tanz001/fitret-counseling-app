import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { pickAndUploadImage } from '../utils/imageUpload';
import { supabase } from '../utils/supabase';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultPatient = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  phone: '',
  avatar: require('../assets/person.webp'),
};

// Normalize avatar: { uri: url } -> url string, else keep as-is (URL string or require())
const normalizeAvatar = (av) => {
  if (!av) return null;
  if (typeof av === 'string') return av;
  if (av && typeof av === 'object' && av.uri) return av.uri;
  return av;
};

const PatientEditProfileScreen = ({ navigation, route }) => {
  const initial = route?.params?.patient ?? defaultPatient;
  const photoSheetRef = React.useRef(null);

  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone || '');
  const [avatar, setAvatar] = useState(() => normalizeAvatar(initial.avatar) ?? defaultPatient.avatar);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // Load latest profile picture from DB when screen opens so we always show current photo
  useEffect(() => {
    let cancelled = false;
    const loadProfilePicture = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        const { data } = await supabase
          .from('users')
          .select('profile_picture')
          .eq('id', user.id)
          .single();
        if (!cancelled && data?.profile_picture) {
          setAvatar(data.profile_picture);
        }
      } catch (e) {
        // keep current avatar on error
      }
    };
    loadProfilePicture();
    return () => { cancelled = true; };
  }, []);

  const handleUpload = async (source) => {
    photoSheetRef.current?.close();
    const url = await pickAndUploadImage(source);
    if (url) {
      setAvatar(url);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { error } = await supabase
          .from('users')
          .update({ profile_picture: url })
          .eq('id', user.id);
        if (error) {
          console.error('Profile picture DB update error:', error);
          Toast.show('Photo saved but failed to update profile. Try saving again.');
          return;
        }
        await AsyncStorage.removeItem('@user_profile');
        setSuccessModalVisible(true);
      } catch (e) {
        console.error('HandleUpload DB update exception:', e);
        Toast.show('Photo saved but failed to update profile.');
      }
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Toast.show('User session not found');
        return;
      }

      const updated = {
        full_name: name.trim() || initial.name,
        email: email.trim() || initial.email,
        phone: phone.trim(),
        profile_picture: typeof avatar === 'string' ? avatar : null,
      };

      const { error } = await supabase
        .from('users')
        .update(updated)
        .eq('id', user.id);

      if (error) {
        console.error('Update Error:', error);
        Toast.show('Error saving profile: ' + error.message);
        return;
      }

      Toast.show('Profile updated successfully');
      navigation.navigate('PatientTabNavigator', {
        screen: 'Profile',
        params: { patient: { ...updated, avatar: avatar } },
      });
    } catch (e) {
      console.error('Exception in handleSave:', e);
      Toast.show('An unexpected error occurred');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <CustomIcon name="chevron-back" size={24} color={COLORS.gray700} iconType="Ionicons" touchable={false} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarSection}>
            <Image source={typeof avatar === 'string' ? { uri: avatar } : avatar} style={styles.avatar} />
            <TouchableOpacity style={styles.changePhotoBtn} activeOpacity={0.8} onPress={() => photoSheetRef.current?.open()}>
              <Text style={styles.changePhotoText}>Change photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={COLORS.gray400}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={COLORS.gray400}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Phone (optional)</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 234 567 8900"
              placeholderTextColor={COLORS.gray400}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.9}>
            <Text style={styles.saveBtnText}>Save changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

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
            onPress={() => handleUpload('camera')}
          >
            <View style={[styles.optionIcon, { backgroundColor: COLORS.primary + '15' }]}>
              <CustomIcon name="camera" size={24} color={COLORS.primary} iconType="Feather" touchable={false} />
            </View>
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.sheetOption} 
            onPress={() => handleUpload('library')}
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
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  flex: { flex: 1 },
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
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.gray50, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl * 2 },

  avatarSection: { alignItems: 'center', marginBottom: SPACING.xl },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: SPACING.sm },
  changePhotoBtn: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  changePhotoText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },

  form: { marginBottom: SPACING.xl },
  label: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.gray700, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray900,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },

  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  saveBtnText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  
  sheetContent: { padding: SPACING.xl },
  sheetTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.gray900, marginBottom: 4 },
  sheetMessage: { fontSize: FONTS.sizes.md, color: COLORS.gray500, marginBottom: SPACING.lg },
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

export default PatientEditProfileScreen;
