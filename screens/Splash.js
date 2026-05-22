import React, { useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';

const Splash = ({ navigation }) => {
  useEffect(() => {
    const goToAuthOrIntro = async () => {
      navigation.replace('AuthScreens', { authRole: 'patient' });
    };

    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // No session: clear cached profile and go to auth or intro
        if (!session) {
          await AsyncStorage.removeItem('@user_profile');
          await goToAuthOrIntro();
          return;
        }

        // Explicit expiry check
        if (session.expires_at && session.expires_at * 1000 <= Date.now()) {
          await supabase.auth.signOut();
          await AsyncStorage.removeItem('@user_profile');
          await goToAuthOrIntro();
          return;
        }

        // Try cached profile first
        const cached = await AsyncStorage.getItem('@user_profile');
        if (cached) {
          const profile = JSON.parse(cached);
          if (profile.role === 'therapist') {
            if (!profile.specialization) {
              navigation.replace('DoctorSetup');
            } else {
              navigation.replace('DoctorTabNavigator');
            }
          } else {
            navigation.replace('PatientTabNavigator');
          }
          return;
        }

        // Fallback: fetch from DB and cache
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const resolvedRole = userData?.role === 'therapist' ? 'therapist' : 'patient';

        await AsyncStorage.setItem(
          '@user_profile',
          JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            role: resolvedRole,
            full_name: userData?.full_name || '',
            phone: userData?.phone || '',
            gender: userData?.gender || null,
            date_of_birth: userData?.date_of_birth || null,
            specialization: userData?.specialization || null,
          }),
        );

        if (resolvedRole === 'therapist') {
          // If setup is not complete, go to DoctorSetup
          if (!userData?.specialization) {
            navigation.replace('DoctorSetup');
          } else {
            navigation.replace('DoctorTabNavigator');
          }
        } else {
          navigation.replace('PatientTabNavigator');
        }
      } catch (e) {
        await AsyncStorage.removeItem('@user_profile');
        await goToAuthOrIntro();
      }
    };

    const timer = setTimeout(() => {
      checkUser();
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/logoo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 340,
    height: 340,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 320,
    height: 320,
  },
});

export default Splash;
