import React from 'react';
import { View, StyleSheet, Modal, Text, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';

const Loader = ({ visible, text }) => {
  return (
    <Modal
      transparent={true}
      animationType={'none'}
      visible={visible}
      onRequestClose={() => {}}>
      <View style={styles.modalBackground}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          {text && <Text style={styles.loadingText}>{text}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loaderContainer: {
    width: 120,
    height: 120,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  loadingText: {
    marginTop: 2,
    fontSize: 16,
    color: COLORS.primary,
  },
});

export default Loader;