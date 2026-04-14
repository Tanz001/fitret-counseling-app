import React from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CustomIcon from '../components/CustomIcon';
import {COLORS, RADIUS} from '../constants/theme';

import DoctorHomeScreen from './DoctorHomeScreen';
import DoctorAppointmentsScreen from './DoctorAppointmentsScreen';
import DoctorProfileSettingsScreen from './DoctorProfileSettingsScreen';
import DoctorWalletScreen from './DoctorWalletScreen';

const Tab = createBottomTabNavigator();

const DoctorTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = 'home';
          } else if (route.name === 'Appointments') {
            iconName = 'calendar';
          } else if (route.name === 'Transactions') {
            iconName = 'credit-card';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          }

          return (
            <View style={[styles.iconWrap, focused && styles.iconWrapFocused]}>
              <CustomIcon
                key={route.name}
                name={iconName}
                size={22}
                color={color}
                iconType="Feather"
                touchable={false}
              />
            </View>
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
          paddingTop: 12,
          paddingBottom: bottomPadding,
          height: 56 + bottomPadding,
          backgroundColor: COLORS.white,
          borderTopWidth: 0,
          borderTopLeftRadius: RADIUS.xl,
          borderTopRightRadius: RADIUS.xl,
          overflow: 'hidden',
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: {width: 0, height: -4},
              shadowOpacity: 0.06,
              shadowRadius: 16,
            },
            android: {elevation: 16},
          }),
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}>
      <Tab.Screen
        name="Dashboard"
        component={DoctorHomeScreen}
        options={{tabBarLabel: 'Home'}}
      />
      <Tab.Screen
        name="Appointments"
        component={DoctorAppointmentsScreen}
        options={{tabBarLabel: 'Schedule'}}
      />
      <Tab.Screen
        name="Transactions"
        component={DoctorWalletScreen}
        options={{tabBarLabel: 'Wallet'}}
      />
      <Tab.Screen
        name="Profile"
        component={DoctorProfileSettingsScreen}
        options={{tabBarLabel: 'Profile'}}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapFocused: {
    backgroundColor: COLORS.primary + '18',
  },
});

export default DoctorTabNavigator;
