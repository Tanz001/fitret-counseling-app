import React from 'react';
import { Image, StyleSheet } from 'react-native';

const AppLogo = ({ size = 80, style }) => (
  <Image
    source={require('../assets/applogo.png')}
    style={[styles.logo, { width: size, height: size }, style]}
    resizeMode="contain"
  />
);

const styles = StyleSheet.create({
  logo: {
    borderRadius: 999,
  },
});

export default AppLogo;
