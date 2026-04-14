// CustomSafeAreaView.js
import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CustomsSafeareaView = ({ children, style }) => {
  if (Platform.OS === 'ios') {
    return (
      <SafeAreaView style={[styles.safeArea, style]}>
        {children}
      </SafeAreaView>
    );
  } else {
    return <View style={[styles.safeArea, style]}>{children}</View>;
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  backgroundColor: 'white', // Set a default background color
  },
});

export default CustomsSafeareaView;
