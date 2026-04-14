import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomIcon from '../components/CustomIcon';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

import PatientDashboardScreen from "./PatientDashboardScreen";
import AppointmentsScreen from "./AppointmentsScreen";
import AIChatBotScreen from "./AIChatBotScreen";
import PatientWellnessScreen from "./PatientWellnessScreen";
import PatientProfileScreen from "./PatientProfileScreen";

const Tab = createBottomTabNavigator();

const PatientTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 12);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Chat') {
            return (
              <View style={styles.centerButton}>
                <CustomIcon
                  name="chatbubble-ellipses"
                  size={26}
                  color={COLORS.white}
                  iconType="Ionicons"
                  touchable={false}
                />
              </View>
            );
          }

          let iconName;
          let iconType = 'Ionicons';
          if (route.name === 'Dashboard') { iconName = focused ? 'grid' : 'grid-outline'; }
          else if (route.name === 'Appointments') { iconName = focused ? 'calendar' : 'calendar-outline'; }
          else if (route.name === 'Wellness') { iconName = 'heart'; iconType = 'Feather'; }
          else if (route.name === 'Profile') { iconName = focused ? 'person' : 'person-outline'; }
          return (
            <CustomIcon
              key={route.name}
              name={iconName}
              size={24}
              color={color}
              iconType={iconType}
              touchable={false}
            />
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarStyle: {
          paddingTop: 14,
          paddingBottom: bottomPadding,
          height: 68 + bottomPadding,
          backgroundColor: COLORS.white,
          borderTopWidth: 0,
          borderTopLeftRadius: RADIUS.xl,
          borderTopRightRadius: RADIUS.xl,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.06,
              shadowRadius: 16,
            },
            android: { elevation: 16 },
          }),
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={PatientDashboardScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} options={{ tabBarLabel: 'Appointments' }} />
      <Tab.Screen
        name="Chat"
        component={AIChatBotScreen}
        options={{
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen name="Wellness" component={PatientWellnessScreen} options={{ tabBarLabel: 'Wellness' }} />
      <Tab.Screen name="Profile" component={PatientProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  centerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -24,
    marginBottom: 4,
    ...SHADOWS.md,
    borderWidth: 4,
    borderColor: COLORS.offWhite,
  }
});

export default PatientTabNavigator;
