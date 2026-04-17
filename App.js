import React, { useEffect } from 'react';
import { StatusBar, LogBox, StyleSheet, Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from './utils/supabase';

// New Screens
import Splash from "./screens/Splash";
import AuthScreens from "./screens/AuthScreens";
import AuthWelcomeScreen from "./screens/AuthWelcomeScreen";
import OTPVerifyScreen from "./screens/OTPVerifyScreen";

// Patient flow
import PatientTabNavigator from "./screens/PatientTabNavigator";
import PatientHomeScreen from "./screens/PatientHomeScreen";
import BookingCalendarScreen from "./screens/BookingCalendarScreen";
import DoctorProfileScreen from "./screens/DoctorProfileScreen";
import ReviewsScreen from "./screens/ReviewsScreen";
import AppointmentDetailScreen from "./screens/AppointmentDetailScreen";
import PaymentScreen from "./screens/PaymentScreen";
import BookingSuccessScreen from "./screens/BookingSuccessScreen";
import PatientTransactionsScreen from "./screens/PatientTransactionsScreen";
import PatientMoodTrackerScreen from "./screens/PatientMoodTrackerScreen";
import PatientJournalScreen from "./screens/PatientJournalScreen";
import PatientWorksheetsScreen from "./screens/PatientWorksheetsScreen";

// Doctor flow
import DoctorTabNavigator from "./screens/DoctorTabNavigator";
import DoctorAppointmentDetailScreen from "./screens/DoctorAppointmentDetailScreen";
import DoctorSetupScreen from "./screens/DoctorSetupScreen";
import DoctorWalletScreen from "./screens/DoctorWalletScreen";
import DoctorScheduleScreen from "./screens/DoctorScheduleScreen";

// Shared/Secondary Flow
import VideoCallScreen from "./screens/VideoCallScreen";
import ChatListScreen from "./screens/ChatListScreen";
import ChatThreadScreen from "./screens/ChatThreadScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import PatientEditProfileScreen from "./screens/PatientEditProfileScreen";

const Stack = createStackNavigator();

LogBox.ignoreAllLogs(true);

export default function App() {
  useEffect(() => {
    const handleUrl = async (event) => {
      if (!event.url) return;
      if (event.url.includes('fitret://login')) {
        const { data, error } = await supabase.auth.getSessionFromUrl(event.url);
        if (data?.session) {
          console.log('User confirmed and logged in:', data.session.user);
        }
      }
    };

    const linkingSubscription = Linking.addEventListener('url', handleUrl);

    // Handle initial URL if app was opened via link
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    return () => {
      linkingSubscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          
          {/* Welcome & Auth */}
          <Stack.Screen name="Splash" component={Splash} />
          <Stack.Screen name="AuthWelcome" component={AuthWelcomeScreen} />
          <Stack.Screen name="AuthScreens" component={AuthScreens} />
          <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
          
          {/* Patient Stack */}
          <Stack.Screen name="PatientTabNavigator" component={PatientTabNavigator} />
          <Stack.Screen name="FindTherapists" component={PatientHomeScreen} />
          <Stack.Screen name="BookingCalendar" component={BookingCalendarScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
          <Stack.Screen name="PatientTransactions" component={PatientTransactionsScreen} />
          <Stack.Screen name="PatientMoodTracker" component={PatientMoodTrackerScreen} />
          <Stack.Screen name="PatientJournal" component={PatientJournalScreen} />
          <Stack.Screen name="PatientWorksheets" component={PatientWorksheetsScreen} />
          <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
          <Stack.Screen name="Reviews" component={ReviewsScreen} />
          <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
          <Stack.Screen
            name="PatientEditProfile"
            component={PatientEditProfileScreen}
            options={{ presentation: 'modal' }}
          />

          {/* Doctor Stack */}
          <Stack.Screen name="DoctorSetup" component={DoctorSetupScreen} />
          <Stack.Screen name="DoctorSchedule" component={DoctorScheduleScreen} />
          <Stack.Screen name="DoctorTabNavigator" component={DoctorTabNavigator} />
          <Stack.Screen name="DoctorAppointmentDetail" component={DoctorAppointmentDetailScreen} />
          <Stack.Screen name="DoctorWallet" component={DoctorWalletScreen} />

          {/* Shared / Secondary Stack */}
          <Stack.Screen name="VideoCall" component={VideoCallScreen} />
          <Stack.Screen name="ChatList" component={ChatListScreen} />
          <Stack.Screen name="ChatThread" component={ChatThreadScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
});