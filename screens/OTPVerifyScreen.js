import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import CustomIcon from '../components/CustomIcon';
import Loader from '../components/Loader';
import { supabase } from '../utils/supabase';
import { COLORS, FONTS, RADIUS, SPACING } from '../constants/theme';

const OTPVerifyScreen = ({ navigation, route }) => {
  const { email } = route.params || {};
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    const trimmed = (code || '').trim();
    if (!trimmed || trimmed.length < 6) {
      Alert.alert('Invalid code', 'Please enter the 6-digit code from your email.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: trimmed,
        type: 'email',
      });
      if (error) throw error;
      Alert.alert('Verified', 'Your email is verified. You can sign in now.', [
        { text: 'OK', onPress: () => navigation.navigate('AuthScreens', { showLogin: true }) },
      ]);
    } catch (e) {
      Alert.alert('Verification failed', e.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      Alert.alert('Sent', 'A new code has been sent to your email.');
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={loading} text="Verifying..." />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <CustomIcon iconType="Feather" name="chevron-left" size={24} color={COLORS.gray700} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <CustomIcon iconType="Feather" name="mail" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to {email || 'your email'}. Enter it below.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="000000"
            placeholderTextColor={COLORS.gray400}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleVerify} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Verify</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resendBtn} onPress={handleResend} activeOpacity={0.8}>
            <Text style={styles.resendText}>Resend code</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  keyboard: { flex: 1 },
  backBtn: {
    padding: SPACING.md,
    alignSelf: 'flex-start',
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray600,
    marginBottom: SPACING.xl,
  },
  input: {
    height: 48,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    fontSize: 18,
    letterSpacing: 8,
    textAlign: 'center',
    color: COLORS.gray900,
    marginBottom: SPACING.lg,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
  },
});

export default OTPVerifyScreen;
