import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RBSheet from 'react-native-raw-bottom-sheet';
import CustomIcon from '../components/CustomIcon';
import { pickAndUploadImage } from '../utils/imageUpload';
import { supabase } from '../utils/supabase';
import Toast from 'react-native-simple-toast';

const DoctorSetupScreen = ({ navigation }) => {
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [fee, setFee] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const photoSheetRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from('users')
          .select('profile_picture, fee, phone, specialization')
          .eq('id', user.id)
          .single();
        if (data) {
          if (data.profile_picture) setAvatar(data.profile_picture);
          if (data.fee != null) setFee(String(data.fee));
          if (data.phone) setPhone(data.phone);
          if (data.specialization) setSpecialty(data.specialization);
        }
      } catch (e) {
        console.error('Error loading doctor profile:', e);
      }
    };
    loadProfile();
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
          Toast.show('Photo saved but failed to update profile.');
          return;
        }
        setSuccessModalVisible(true);
      } catch (e) {
        console.error('HandleUpload DB update exception:', e);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex1}>
         <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
               <CustomIcon name="chevron-back" size={24} color="#333" iconType="Ionicons" touchable={false} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
         </View>
 
         <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Professional details</Text>
            <Text style={styles.subtitle}>Update your profile information seen by patients</Text>

            <View style={styles.avatarContainer}>
               <TouchableOpacity style={styles.avatarWrapper} onPress={() => photoSheetRef.current?.open()}>
                  <Image 
                     source={avatar ? { uri: avatar } : require('../assets/person.webp')} 
                     style={styles.avatar} 
                  />
                  <View style={styles.cameraIcon}>
                     <CustomIcon name="camera" size={16} color="#fff" iconType="Feather" touchable={false} />
                  </View>
               </TouchableOpacity>
               <Text style={styles.avatarLabel}>Upload Profile Picture</Text>
            </View>

            <View style={styles.formGroup}>
               <Text style={styles.label}>Phone Number</Text>
               <TextInput 
                  style={styles.input}
                  placeholder="+1 234 567 8900"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
               />
            </View>

            <View style={styles.formGroup}>
               <Text style={styles.label}>Session Fee (ETB)</Text>
               <TextInput 
                  style={styles.input}
                  placeholder="e.g. 50.00"
                  value={fee}
                  onChangeText={setFee}
                  keyboardType="decimal-pad"
               />
            </View>

            <View style={styles.formGroup}>
               <Text style={styles.label}>Specialty</Text>
               <TextInput 
                  style={styles.input}
                  placeholder="e.g. Clinical Psychologist"
                  value={specialty}
                  onChangeText={setSpecialty}
               />
            </View>


            <TouchableOpacity 
               style={[styles.continueBtn, loading && { opacity: 0.7 }]}
               disabled={loading}
               onPress={async () => {
                  try {
                     setLoading(true);
                     const { data: { user } } = await supabase.auth.getUser();
                     if (!user) return;
 
                     const feeNum = fee.trim() ? parseFloat(fee.trim()) : null;
 
                     const { error } = await supabase
                        .from('users')
                        .update({
                           profile_picture: avatar,
                           phone: phone.trim(),
                           specialization: specialty.trim(),
                           fee: feeNum != null && !isNaN(feeNum) ? feeNum : null,
                        })
                        .eq('id', user.id);
 
                     if (error) {
                        Toast.show('Error saving profile: ' + error.message);
                        return;
                     }
 
                     Toast.show('Profile updated successfully');
                     navigation.goBack();
                  } catch (e) {
                     console.error('Setup Error:', e);
                  } finally {
                     setLoading(false);
                  }
               }} 
            >
               <Text style={styles.continueBtnText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
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
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          },
          wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
        }}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Profile Photo</Text>
          <Text style={styles.sheetMessage}>Choose how you want to add your photo</Text>
          
          <TouchableOpacity 
            style={styles.sheetOption} 
            onPress={() => handleUpload('camera')}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#84bca415' }]}>
              <CustomIcon name="camera" size={24} color="#84bca4" iconType="Feather" touchable={false} />
            </View>
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.sheetOption} 
            onPress={() => handleUpload('library')}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#E6F4EA' }]}>
              <CustomIcon name="image" size={24} color="#34A853" iconType="Feather" touchable={false} />
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
              <CustomIcon name="check-circle" size={48} color="#4A9B7C" iconType="Feather" touchable={false} />
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
  flex1: { flex: 1 },
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', marginRight: 40 }, // Balance back button
  
  content: { padding: 25 },
  
  title: { fontSize: 26, fontWeight: '700', color: '#333', marginBottom: 5 },
  subtitle: { fontSize: 15, color: '#777', marginBottom: 30 },

  avatarContainer: { alignItems: 'center', marginBottom: 30 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#84bca4' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#84bca4', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  avatarLabel: { marginTop: 10, fontSize: 14, color: '#666', fontWeight: '600' },

  formGroup: { marginBottom: 25 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 10 },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 16, fontSize: 16, color: '#333' },

  continueBtn: { backgroundColor: '#84bca4', paddingVertical: 18, borderRadius: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  sheetContent: { padding: 28 },
  sheetTitle: { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 8 },
  sheetMessage: { fontSize: 16, color: '#777', marginBottom: 24 },
  sheetOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  optionIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  optionText: { fontSize: 17, fontWeight: '600', color: '#444' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successModalBox: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: 340,
  },
  successIconWrap: { marginBottom: 16 },
  successModalTitle: { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 8 },
  successModalMessage: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 },
  successModalBtn: { backgroundColor: '#84bca4', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 },
  successModalBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default DoctorSetupScreen;
