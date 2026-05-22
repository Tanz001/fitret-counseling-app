import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  ScrollView,
  Modal,
  StatusBar,
  Image,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CustomIcon from '../components/CustomIcon';
import Loader from '../components/Loader';
import { supabase } from '../utils/supabase';
import { resolveSignInEmail, isValidEthiopianMobile } from '../utils/phoneAuth';
import { formatEthiopianPhone } from '../constants/formatters';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');
/** hero.jpeg 1600×1068 */
const CLIENT_HERO_ASPECT = 1600 / 1068;
const CLIENT_HERO_HEIGHT = height * 0.55;
const CLIENT_IMAGE_HEIGHT = width / CLIENT_HERO_ASPECT;
const CLIENT_FORM_PULL_UP = Math.max(0, CLIENT_HERO_HEIGHT - CLIENT_IMAGE_HEIGHT);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

const AuthScreens = ({ navigation, route }) => {
  const authRole = route.params?.authRole;
  const isRoleLocked =
    authRole === 'therapist' || authRole === 'patient';

  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bio, setBio] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [fee, setFee] = useState('');
  const [role, setRole] = useState(() =>
    authRole === 'therapist'
      ? 'therapist'
      : authRole === 'patient'
        ? 'patient'
        : 'patient',
  );
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [passVisible, setPassVisible] = useState(false);

  const genderSheetRef = useRef(null);

  useEffect(() => {
    if (route.params?.showLogin) {
      setIsLogin(true);
    }
  }, [route.params?.showLogin]);

  useEffect(() => {
    if (authRole === 'therapist') setRole('therapist');
    else if (authRole === 'patient') setRole('patient');
  }, [authRole]);

  const openGenderSheet = () => genderSheetRef.current?.open();
  const closeGenderSheet = () => genderSheetRef.current?.close();

  const selectGender = (val) => {
    setGender(val);
    closeGenderSheet();
  };

  const onConfirmDob = (date) => {
    setDateOfBirth(date.toISOString().split('T')[0]);
    setShowDobPicker(false);
  };

  const validateSignup = () => {
    if (!fullName.trim()) {
      Alert.alert('Required', 'Please enter your full name.');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your email.');
      return false;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Required', 'Please enter your phone number.');
      return false;
    }
    if (!isValidEthiopianMobile(phone)) {
      Alert.alert('Invalid phone', 'Enter a valid Ethiopian mobile number (9 digits starting with 9).');
      return false;
    }
    if (!password) {
      Alert.alert('Required', 'Please enter a password.');
      return false;
    }
    if (password.length < MIN_PASSWORD) {
      Alert.alert('Weak password', `Password must be at least ${MIN_PASSWORD} characters.`);
      return false;
    }
    return true;
  };

  const validateLogin = () => {
    if (authMethod === 'email') {
      if (!email.trim()) {
        Alert.alert('Required', 'Please enter your email.');
        return false;
      }
      if (!EMAIL_REGEX.test(email.trim())) {
        Alert.alert('Invalid email', 'Please enter a valid email address.');
        return false;
      }
    } else if (!phoneNumber.trim()) {
      Alert.alert('Required', 'Please enter your phone number.');
      return false;
    } else if (!isValidEthiopianMobile(phoneNumber)) {
      Alert.alert('Invalid phone', 'Enter a valid Ethiopian mobile number (9 digits starting with 9).');
      return false;
    }
    if (!password) {
      Alert.alert('Required', 'Please enter your password.');
      return false;
    }
    return true;
  };

  const handleAuth = async () => {
    if (isLogin) {
      if (!validateLogin()) return;
    } else {
      if (!validateSignup()) return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        let signInEmail = email.trim();
        if (authMethod === 'phone') {
          signInEmail = await resolveSignInEmail({ authMethod, email, phoneNumber });
          if (!signInEmail) {
            Alert.alert(
              'Account not found',
              'No account is linked to this phone number. Try email sign-in or sign up first.',
            );
            return;
          }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: signInEmail,
          password,
        });

        if (error) {
          console.log('%c [API Error] Login Failed: ', `color: ${COLORS.error}; font-weight: bold;`, error);
          throw error;
        }

        console.log('%c [API Success] Login Result: ', `color: ${COLORS.success}; font-weight: bold;`, data);

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        let resolvedRole = role || 'patient';
        if (userError) {
          console.log(
            '%c [API Error] Fetch User Failed: ',
            `color: ${COLORS.error}; font-weight: bold;`,
            userError,
          );
        } else if (userData?.role) {
          resolvedRole = userData.role;
        }

        // Cache profile locally for splash/profile screens
        try {
          await AsyncStorage.setItem(
            '@user_profile',
            JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              role: resolvedRole,
              full_name: userData?.full_name || data.user.user_metadata?.full_name || '',
              phone: userData?.phone || '',
              date_of_birth: userData?.date_of_birth || null,
              specialization: userData?.specialization || null,
            }),
          );
        } catch (storageError) {
          console.log(
            '%c [Storage Error] Failed to persist user_profile: ',
            `color: ${COLORS.error}; font-weight: bold;`,
            storageError,
          );
        }

        if (resolvedRole === 'therapist') {
          if (!userData?.specialization) {
            navigation.navigate('DoctorSetup');
          } else {
            navigation.navigate('DoctorTabNavigator');
          }
        } else {
          navigation.navigate('PatientTabNavigator');
        }
      } else {
        // Sign up flow
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          console.log('%c [API Error] Signup Failed: ', `color: ${COLORS.error}; font-weight: bold;`, error);
          throw error;
        }

        console.log('%c [API Success] Signup Result: ', `color: ${COLORS.success}; font-weight: bold;`, data);

        if (data?.user) {
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: data.user.id,
                full_name: fullName.trim(),
                email: email.trim(),
                role,
                phone: formatEthiopianPhone(phone) || null,
                gender: gender || null,
                date_of_birth: dateOfBirth || null,
                bio: role === 'therapist' ? bio.trim() || null : null,
                specialization: role === 'therapist' ? specialization.trim() || null : null,
                experience_years: role === 'therapist' ? (parseInt(experienceYears, 10) || null) : null,
                fee: role === 'therapist' ? (parseFloat(fee) || null) : null,
              },
            ]);

          if (insertError) {
            console.log(
              '%c [API Error] Users Insert Failed: ',
              `color: ${COLORS.error}; font-weight: bold;`,
              insertError,
            );
            Alert.alert(
              'Profile not saved',
              'Your account is created, but a database Row Level Security (RLS) policy is blocking saving your profile. In Supabase, add an INSERT policy on the \"users\" table that allows authenticated users to insert a row where id = auth.uid().',
            );
          } else {
            console.log(
              '%c [API Success] Users Insert Result: ',
              `color: ${COLORS.success}; font-weight: bold;`,
              'Success',
            );
            setShowSuccessModal(true);
          }
        }
      }
    } catch (error) {
      console.log('%c [API Catch Block] Error processing request: ', `color: ${COLORS.error}; font-weight: bold;`, error);
      Alert.alert(isLogin ? 'Login Failed' : 'Signup Failed', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    setShowSuccessModal(false);
    setIsLogin(true);
  };

  const isPatient = role === 'patient';
  const isTherapistAuth = authRole === 'therapist';
  const isTherapistSignup = !isLogin && isTherapistAuth;
  const screenBackground =
    (isLogin && isTherapistAuth) || isTherapistSignup ? COLORS.gray50 : COLORS.offWhite;

  // ─── Full-screen patient login ───────────────────────────────────────────────
  if (isLogin && authRole === 'patient') {
    return (
      <View style={styles.clientFullScreen}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <Loader visible={loading} text="Signing in..." />

        {/* ── TOP: Photo section ── */}
        <View style={styles.clientPhotoSection}>
          <Image
            source={require('../assets/hero.jpeg')}
            style={styles.clientPhotoImage}
            resizeMode="contain"
          />
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(244,238,219,0.7)', '#f4eedb']}
          locations={[0, 0.6, 1]}
          style={styles.clientDiffusionGradient}
          pointerEvents="none"
        />

        <TouchableOpacity
          style={styles.clientAbsBackBtn}
          onPress={() => navigation.replace('AuthScreens', { authRole: 'therapist', showLogin: true })}
          activeOpacity={0.8}
        >
          <CustomIcon iconType="Feather" name="briefcase" size={20} color={COLORS.white} />
        </TouchableOpacity>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.clientFormKAV}
        >
          <ScrollView
            contentContainerStyle={styles.clientFormScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.leafDecorBL} />
            <View style={styles.leafDecorBR} />

            <Text style={styles.clientLabel1}>Sign in with</Text>
            <View style={styles.methodTabs}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setAuthMethod('email')}
                style={[styles.methodTab, authMethod === 'email' && styles.methodTabActive]}
              >
                <View style={styles.methodTabContent}>
                  <CustomIcon
                    iconType="Feather"
                    name="mail"
                    size={14}
                    color={authMethod === 'email' ? '#4e8f7a' : '#7fa293'}
                    style={styles.methodTabIcon}
                  />
                  <Text style={[styles.methodTabText, authMethod === 'email' && styles.methodTabTextActive]}>
                    Email
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setAuthMethod('phone')}
                style={[styles.methodTab, authMethod === 'phone' && styles.methodTabActive]}
              >
                <View style={styles.methodTabContent}>
                  <CustomIcon
                    iconType="Feather"
                    name="phone"
                    size={14}
                    color={authMethod === 'phone' ? '#4e8f7a' : '#7fa293'}
                    style={styles.methodTabIcon}
                  />
                  <Text style={[styles.methodTabText, authMethod === 'phone' && styles.methodTabTextActive]}>
                    Phone
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            {authMethod === 'email' ? (
              <View style={styles.clientInputWrap}>
                <CustomIcon iconType="Feather" name="mail" size={18} color="#6f9e8a" style={styles.inputIcon} />
                <TextInput
                  style={styles.clientInput}
                  placeholder="Enter your email"
                  placeholderTextColor="#99b8ad"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            ) : (
              <View style={styles.clientInputWrap}>
                <Text style={styles.countryPrefix}>+251</Text>
                <TextInput
                  style={styles.clientInput}
                  placeholder="9XXXXXXXX"
                  placeholderTextColor="#99b8ad"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            )}

            {/* Password */}
            <Text style={styles.clientLabel}>Password</Text>
            <View style={styles.clientInputWrap}>
              <CustomIcon iconType="Feather" name="lock" size={18} color="#6f9e8a" style={styles.inputIcon} />
              <TextInput
                style={[styles.clientInput, { paddingRight: 44 }]}
                placeholder="Enter password"
                placeholderTextColor="#99b8ad"
                secureTextEntry={!passVisible}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setPassVisible(!passVisible)}
                activeOpacity={0.7}
              >
                <CustomIcon
                  iconType="Feather"
                  name={passVisible ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6f9e8a"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot password */}
            <View style={styles.clientRowMeta}>
              <TouchableOpacity activeOpacity={0.8}>
                <Text style={styles.clientForgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              style={styles.clientSignInBtn}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.clientSignInBtnText}>SIGN IN</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.clientFooterRow}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => setIsLogin(false)} activeOpacity={0.8}>
                <Text style={styles.footerAction}>Sign up</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.therapistSwitchLink}
              onPress={() => navigation.replace('AuthScreens', { authRole: 'therapist', showLogin: true })}
            >
              <Text style={styles.therapistSwitchText}>Click here if therapist</Text>
            </TouchableOpacity>

            <Text style={styles.clientCopyright}>© 2024 Fitret Counseling. All rights reserved.</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }
  // ─── End full-screen patient login ────────────────────────────────────────────

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: screenBackground },
        ((isLogin && isTherapistAuth) || isTherapistSignup) && styles.containerTherapistPaper,
      ]}
    >
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      <Loader visible={loading} text={isLogin ? 'Signing in...' : 'Creating account...'} />

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <CustomIcon
              iconType="Feather"
              name="check-circle"
              size={52}
              color={COLORS.success}
            />
            <Text style={styles.modalTitle}>Account created</Text>
            <Text style={styles.modalMessage}>
              Your account has been created successfully. You can now sign in with your email and
              password.
            </Text>
            <TouchableOpacity style={styles.modalBtnPrimary} onPress={goToLogin} activeOpacity={0.85}>
              <Text style={styles.modalBtnPrimaryText}>Continue to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={showDobPicker}
        mode="date"
        maximumDate={new Date()}
        onConfirm={onConfirmDob}
        onCancel={() => setShowDobPicker(false)}
      />

      <RBSheet
        ref={genderSheetRef}
        height={260}
        openDuration={250}
        closeOnDragDown={true}
        dragFromTopOnly={true}
        customStyles={{
          container: styles.rbSheet,
          draggableIcon: { backgroundColor: COLORS.gray300, width: 40 }
        }}
      >
        <View style={styles.rbSheetContent}>
          <Text style={styles.rbSheetTitle}>Select Gender</Text>
          {['Male', 'Female', 'Other'].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.rbSheetOption,
                gender === opt && styles.rbSheetOptionSelected
              ]}
              onPress={() => selectGender(opt)}
              activeOpacity={0.7}
            >
              <Text style={[styles.rbSheetOptionText, gender === opt && styles.rbSheetOptionTextSelected]}>{opt}</Text>
              {gender === opt && <CustomIcon iconType="Feather" name="check" size={20} color={COLORS.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </RBSheet>

      {isLogin ? (
        authRole === 'therapist' ? (
          <View style={styles.therapistLoginHero}>
            <TouchableOpacity
              style={styles.authBackBtn}
              onPress={() => navigation.replace('AuthScreens', { authRole: 'patient', showLogin: true })}
              activeOpacity={0.8}
            >
              <CustomIcon
                iconType="Feather"
                name="chevron-left"
                size={22}
                color={COLORS.gray700}
              />
            </TouchableOpacity>
            <View style={styles.therapistDecorTL} />
            <View style={styles.therapistDecorBR} />
            <Image
              source={require('../assets/logo1.webp')}
              style={styles.therapistLogoMark}
              resizeMode="contain"
            />
            <Text style={styles.therapistLoginTitle}>Therapist Login</Text>
            <View style={styles.brainRow}>
              <Image
                source={require('../assets/brain.png')}
                style={[styles.brainEmoji, { width: 68, height: 68, tintColor: '#6f9e8a' }]}
                resizeMode="contain"
              />
              <View style={styles.brainPlusBadge}>
                <Text style={styles.brainPlusText}>+</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.loginHero}>
            <Image
              source={require('../assets/hero.jpeg')}
              style={styles.loginHeroImage}
              resizeMode="contain"
            />
            <LinearGradient
              colors={['transparent', 'rgba(244,238,219,0.5)', '#f4eedb']}
              locations={[0, 0.5, 1]}
              style={styles.loginHeroGradient}
              pointerEvents="none"
            />
            <View style={styles.loginHeroTextWrap}>
              <Text style={styles.loginHeadline}>Welcome Back</Text>
              <Text style={styles.loginSubheadline}>Sign in to continue your journey</Text>
            </View>
          </View>
        )
      ) : (
        <View style={[styles.headerSimple, isTherapistSignup && styles.headerSimpleTherapist]}>
          {isRoleLocked && (
            <TouchableOpacity
              style={styles.signupBackRow}
              onPress={() => navigation.replace('AuthScreens', { authRole: 'patient', showLogin: true })}
              activeOpacity={0.8}
            >
              <CustomIcon
                iconType="Feather"
                name="chevron-left"
                size={20}
                color={COLORS.primary}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.signupBackText}>Account type</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>
            {isRoleLocked
              ? authRole === 'therapist'
                ? 'Therapist registration'
                : 'Client registration'
              : 'Sign up to get started'}
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.keyboardView, { backgroundColor: screenBackground }]}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 6 : 0}
      >
        <ScrollView
          style={[styles.keyboardScroll, { backgroundColor: screenBackground }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          bounces={false}
          overScrollMode="never"
          nestedScrollEnabled
        >
          <View style={styles.formContainer}>
            {!isRoleLocked && (
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setRole('patient')}
                  style={[styles.tabButton, isPatient && styles.tabButtonActive]}>
                  <Text style={[styles.tabText, isPatient && styles.tabTextActive]}>
                    Patient
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setRole('therapist')}
                  style={[styles.tabButton, !isPatient && styles.tabButtonActive]}>
                  <Text style={[styles.tabText, !isPatient && styles.tabTextActive]}>
                    Therapist
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!isLogin && (
              <>
                <Text style={styles.label}>Full name</Text>
                <View style={styles.inputWrap}>
                  <CustomIcon iconType="Feather" name="user" size={18} color={COLORS.gray400} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter full name"
                    placeholderTextColor={COLORS.gray400}
                    autoCapitalize="words"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>

                <Text style={styles.label}>Gender</Text>
                <TouchableOpacity style={styles.inputWrap} onPress={openGenderSheet} activeOpacity={0.8}>
                  <CustomIcon iconType="Feather" name="user" size={18} color={COLORS.gray400} style={styles.inputIcon} />
                  <Text
                    style={[styles.pickerFieldText, gender ? styles.valueText : styles.placeholderText]}
                    numberOfLines={1}
                  >
                    {gender || 'Select your gender'}
                  </Text>
                  <CustomIcon iconType="Feather" name="chevron-down" size={18} color={COLORS.gray400} />
                </TouchableOpacity>

                <Text style={styles.label}>Date of birth (optional)</Text>
                <TouchableOpacity style={styles.inputWrap} onPress={() => setShowDobPicker(true)} activeOpacity={0.8}>
                  <CustomIcon iconType="Feather" name="calendar" size={18} color={COLORS.gray400} style={styles.inputIcon} />
                  <Text
                    style={[styles.pickerFieldText, dateOfBirth ? styles.valueText : styles.placeholderText]}
                    numberOfLines={1}
                  >
                    {dateOfBirth || 'Select your date of birth'}
                  </Text>
                  <CustomIcon iconType="Feather" name="chevron-down" size={18} color={COLORS.gray400} />
                </TouchableOpacity>
              </>
            )}

            {isLogin ? (
              <>
                <Text style={styles.label}>Sign in with</Text>
                <View style={styles.methodTabsMain}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setAuthMethod('email')}
                    style={[styles.methodTabMain, authMethod === 'email' && styles.methodTabMainActive]}
                  >
                    <View style={styles.methodTabMainContent}>
                      <CustomIcon
                        iconType="Feather"
                        name="mail"
                        size={14}
                        color={authMethod === 'email' ? COLORS.primary : COLORS.gray500}
                        style={styles.methodTabIcon}
                      />
                      <Text style={[styles.methodTabMainText, authMethod === 'email' && styles.methodTabMainTextActive]}>
                        Email
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setAuthMethod('phone')}
                    style={[styles.methodTabMain, authMethod === 'phone' && styles.methodTabMainActive]}
                  >
                    <View style={styles.methodTabMainContent}>
                      <CustomIcon
                        iconType="Feather"
                        name="phone"
                        size={14}
                        color={authMethod === 'phone' ? COLORS.primary : COLORS.gray500}
                        style={styles.methodTabIcon}
                      />
                      <Text style={[styles.methodTabMainText, authMethod === 'phone' && styles.methodTabMainTextActive]}>
                        Phone
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                {authMethod === 'email' ? (
                  <View style={[styles.inputWrap, styles.loginInputWrap]}>
                    <CustomIcon iconType="Feather" name="mail" size={18} color={COLORS.gray400} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="your@email.com"
                      placeholderTextColor={COLORS.gray400}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                ) : (
                  <View style={[styles.inputWrap, styles.loginInputWrap]}>
                    <Text style={styles.countryPrefixMain}>+251</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="9XXXXXXXX"
                      placeholderTextColor={COLORS.gray400}
                      keyboardType="phone-pad"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                    />
                  </View>
                )}
              </>
            ) : (
              <>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrap}>
                  <CustomIcon iconType="Feather" name="mail" size={18} color={COLORS.gray400} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor={COLORS.gray400}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <Text style={styles.label}>Phone number</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.countryPrefixMain}>+251</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="9XXXXXXXX"
                    placeholderTextColor={COLORS.gray400}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </>
            )}

            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputWrap, isLogin && styles.loginInputWrap]}>
              <CustomIcon iconType="Feather" name="lock" size={18} color={COLORS.gray400} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { paddingRight: 44 }]}
                placeholder={isLogin ? 'Password' : 'Min 6 characters'}
                placeholderTextColor={COLORS.gray400}
                secureTextEntry={!passVisible}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setPassVisible(!passVisible)}
                activeOpacity={0.7}
              >
                <CustomIcon
                  iconType="Feather"
                  name={passVisible ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.gray500}
                />
              </TouchableOpacity>
            </View>

            {isLogin && (
              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity activeOpacity={0.8}>
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!isLogin && role === 'therapist' && (
              <>
                <Text style={styles.label}>Bio (optional)</Text>
                <View style={[styles.inputWrap, styles.inputWrapMultiline]}>
                  <TextInput
                    style={[styles.input, styles.inputMultiline]}
                    placeholder="Tell us a little about yourself, your approach, and experience..."
                    placeholderTextColor={COLORS.gray400}
                    multiline
                    numberOfLines={5}
                    value={bio}
                    onChangeText={setBio}
                  />
                </View>
                <Text style={styles.label}>Specialization</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. CBT"
                    placeholderTextColor={COLORS.gray400}
                    value={specialization}
                    onChangeText={setSpecialization}
                  />
                </View>
                <Text style={styles.label}>Years of experience</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 5"
                    placeholderTextColor={COLORS.gray400}
                    keyboardType="numeric"
                    value={experienceYears}
                    onChangeText={setExperienceYears}
                  />
                </View>
                <Text style={styles.label}>Session Fee (ETB)</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 100"
                    placeholderTextColor={COLORS.gray400}
                    keyboardType="numeric"
                    value={fee}
                    onChangeText={setFee}
                  />
                </View>
              </>
            )}

            <TouchableOpacity
              style={[
                styles.mainButton,
                isLogin && styles.loginButton,
                isLogin && authRole === 'patient' && styles.clientLoginButton,
              ]}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.mainButtonText,
                  isLogin && authRole === 'patient' && styles.clientLoginButtonText,
                ]}
              >
                {isLogin ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
            {isLogin && authRole === 'therapist' && (
              <Text style={styles.therapistAccessFooter}>Therapist Access Only</Text>
            )}
          </View>

          <View style={[styles.footer, isLogin && styles.loginFooter]}>
            <Text style={styles.footerText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} activeOpacity={0.8}>
              <Text style={styles.footerAction}>{isLogin ? 'Sign up' : 'Log in'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  // ─── Client Full-Screen Login Styles ────────────────────────────────────────
  clientFullScreen: {
    flex: 1,
    backgroundColor: '#f4eedb',   // warm skin base
  },
  clientPhotoSection: {
    width: '100%',
    height: CLIENT_HERO_HEIGHT,
    backgroundColor: '#f4eedb',
    overflow: 'hidden',
    alignItems: 'center',
  },
  clientPhotoImage: {
    width: '100%',
    height: CLIENT_IMAGE_HEIGHT,
  },
  clientDiffusionGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: CLIENT_IMAGE_HEIGHT - height * 0.1,
    height: height * 0.16,
    zIndex: 2,
  },
  clientAbsBackBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 38,
    left: 16,
    zIndex: 20,
    padding: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  // Logo + text positioning
  clientTopBranding: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 70 : 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  clientLogoImg: { width: 80, height: 80 },
  clientBrandTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 10,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  clientBrandSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  // Form KAV sits in the bottom half
  clientFormKAV: {
    flex: 1,
    backgroundColor: '#f4eedb',
    zIndex: 3,
    marginTop: -CLIENT_FORM_PULL_UP,
  },
  clientFormScroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 60,
  },
  // Green leaf decorators (bottom-left & bottom-right corners)
  leafDecorBL: {
    position: 'absolute',
    bottom: 20,
    left: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#c5dbce',
    opacity: 0.45,
  },
  leafDecorBR: {
    position: 'absolute',
    bottom: -10,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#90beab',
    opacity: 0.30,
  },
  clientLabel1: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4e4b45',
    marginBottom: 7,
    marginTop: 10,
  },
  clientLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4e4b45',
    marginBottom: 7,
    marginTop: 2,
  },
  // Inputs: light sage-green tint background
  clientInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#b8d5c8',
    backgroundColor: 'transparent',
    marginBottom: 16,
    paddingHorizontal: 16,
    // shadowColor: '#6f9e8a',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.08,
    // shadowRadius: 4,
    // elevation: 2,
  },
  countryPrefix: {
    marginRight: SPACING.sm,
    color: '#6f9e8a',
    fontWeight: '700',
    fontSize: 15,
  },
  clientInput: {
    flex: 1,
    fontSize: 15,
    color: '#35332f',
    // paddingVertical: 0,
    height: '100%',
    height: 45,

  },
  clientRowMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 22,
    marginTop: -4,
  },
  clientForgotText: {
    color: '#6f9e8a',
    fontWeight: '600',
    fontSize: 13,
  },
  // Button: warm gold pill
  clientSignInBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#c5a96a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b6f4a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  clientSignInBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  clientFooterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  therapistSwitchLink: {
    alignSelf: 'center',
    marginTop: 6,
  },
  therapistSwitchText: {
    color: '#6f9e8a',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  clientCopyright: {
    textAlign: 'center',
    color: '#aaa59b',
    fontSize: 11,
    marginTop: 20,
  },
  // ─── End Client Full-Screen Login Styles ────────────────────────────────────
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  containerTherapistPaper: {
    backgroundColor: COLORS.gray50,
  },
  therapistLoginHero: {
    alignItems: 'center',
    minHeight: Math.round(height * 0.38),
    paddingTop: 52,
    paddingBottom: 28,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    backgroundColor: COLORS.gray50,
    overflow: 'hidden',
    marginBottom: 4,
  },
  authBackBtn: {
    position: 'absolute',
    top: 48,
    left: SPACING.md,
    zIndex: 10,
    padding: 8,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  authBackBtnClient: {
    position: 'absolute',
    top: 48,
    left: SPACING.md,
    zIndex: 10,
    padding: 8,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  therapistDecorTL: {
    position: 'absolute',
    top: -20,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight + '66',
  },
  therapistDecorBR: {
    position: 'absolute',
    bottom: 10,
    right: -24,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.accent + '99',
  },
  therapistLogoMark: {
    width: 120,
    height: 120,
    marginBottom: SPACING.md,
  },
  therapistLoginTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.gray800,
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  brainRow: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brainEmoji: {
    fontSize: 56,
    lineHeight: 64,
  },
  brainPlusBadge: {
    position: 'absolute',
    top: 4,
    right: -8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#e8956a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  brainPlusText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    marginTop: -1,
  },
  clientHeroTextWrap: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    bottom: 28,
    alignItems: 'center',
  },
  clientBrandName: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
  },
  clientLoginHeadline: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 6,
  },
  clientLoginSub: {
    fontSize: FONTS.sizes.md,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
    fontWeight: '500',
  },
  clientLoginButton: {
    backgroundColor: '#b8956a',
    shadowColor: '#8b6f4a',
  },
  clientLoginButtonText: {
    color: COLORS.white,
    letterSpacing: 1,
  },
  therapistAccessFooter: {
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    fontWeight: '600',
  },
  signupBackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  signupBackText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  keyboardView: { flex: 1 },
  keyboardScroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl + 16,
  },
  headerSimpleTherapist: {
    backgroundColor: COLORS.gray50,
    borderBottomColor: COLORS.gray100,
  },
  loginHero: {
    width: '100%',
    height: Math.round(height * 0.42),
    backgroundColor: '#e8e4dc',
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 8 },
    }),
  },
  loginHeroImage: {
    width: '100%',
    height: '100%',
  },
  loginHeroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  loginHeroTextWrap: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    bottom: 22,
    alignItems: 'center',
  },
  loginHeadline: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2f2f2f',
    letterSpacing: -0.5,
  },
  loginSubheadline: {
    fontSize: 16,
    color: '#6f9e8a',
    marginTop: 8,
    fontWeight: '500',
  },
  headerSimple: {
    paddingTop: SPACING.xl + 8,
    paddingBottom: SPACING.lg + 4,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.gray900,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    marginTop: 6,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.sm,
    padding: 4,
    marginBottom: SPACING.xl,
  },
  methodTabsMain: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: SPACING.md,
  },
  methodTabMain: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  methodTabMainActive: {
    borderBottomColor: COLORS.primary,
  },
  methodTabMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodTabMainText: {
    color: COLORS.gray600,
    fontWeight: '600',
    fontSize: FONTS.sizes.sm,
  },
  methodTabMainTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  countryPrefixMain: {
    marginRight: SPACING.sm,
    color: COLORS.gray700,
    fontWeight: '700',
    fontSize: FONTS.sizes.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.sm - 2,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.gray700,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    color: COLORS.gray600,
    fontWeight: '600',
    fontSize: FONTS.sizes.md,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  formContainer: { marginBottom: SPACING.lg },
  label: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray700,
    marginBottom: 8,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  methodTabs: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#d7e5de',
    marginBottom: 14,
  },
  methodTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 0,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  methodTabActive: {
    borderBottomColor: '#4e8f7a',
  },
  methodTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodTabIcon: {
    marginRight: 6,
  },
  methodTabText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#6f9e8a',
  },
  methodTabTextActive: {
    color: '#4e8f7a',
    fontWeight: '700',
  },
  loginInputWrap: {
    height: 45,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderColor: '#E8E8E8',
    borderWidth: 1.5,
  },
  inputIcon: { marginRight: SPACING.sm },
  pickerFieldText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    paddingVertical: 0,
    ...Platform.select({
      android: { includeFontPadding: false, textAlignVertical: 'center' },
      ios: { lineHeight: 20 },
    }),
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray900,
    paddingVertical: 0,
    height: '100%',
  },
  inputWrapMultiline: {
    height: 120,
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  inputMultiline: {
    flex: 1,
    width: '100%',
    textAlignVertical: 'top',
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  placeholderText: { color: COLORS.gray400 },
  valueText: { color: COLORS.gray900 },
  eyeBtn: { padding: SPACING.sm },

  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: SPACING.xl,
    marginTop: -5,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },

  mainButton: {
    backgroundColor: COLORS.primary,
    height: 45,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  loginButton: {
    height: 45,
    marginTop: SPACING.xl,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginFooter: {
    marginTop: 30,
  },
  mainButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 0.5,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.sm },
  footerText: { color: COLORS.gray600, fontSize: FONTS.sizes.md },
  footerAction: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalBox: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  modalTitle: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.gray900,
  },
  modalMessage: {
    marginTop: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  modalBtnPrimary: {
    marginTop: SPACING.lg,
    width: '100%',
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnPrimaryText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },

  rbSheet: { borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, paddingBottom: SPACING.xl },
  rbSheetContent: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.sm },
  rbSheetTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.lg,
  },
  rbSheetOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  rbSheetOptionSelected: {
    backgroundColor: COLORS.gray50,
    marginHorizontal: -SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  rbSheetOptionText: { fontSize: FONTS.sizes.md, color: COLORS.gray700, fontWeight: FONTS.weights.medium },
  rbSheetOptionTextSelected: { color: COLORS.primary, fontWeight: FONTS.weights.bold },
});

export default AuthScreens;
