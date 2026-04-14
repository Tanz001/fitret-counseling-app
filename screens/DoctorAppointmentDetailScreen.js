
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, StatusBar, Alert, Platform, ActivityIndicator, Image } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import CustomIcon from '../components/CustomIcon';
import RBSheet from "react-native-raw-bottom-sheet";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { supabase } from '../utils/supabase';
import Toast from 'react-native-simple-toast';

const DoctorAppointmentDetailScreen = ({ navigation, route }) => {
  const appointment = route?.params?.appointment || {};
  const [patient, setPatient] = useState(() => {
    const raw = appointment.patient;
    return raw != null ? (Array.isArray(raw) ? raw[0] : raw) : {};
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(appointment.status?.toLowerCase() || 'pending');
  const [notes, setNotes] = useState(appointment.notes || '');
  const [docs, setDocs] = useState([
    { id: 1, name: 'Intake Questionnaire.pdf', date: 'Yesterday' },
    { id: 2, name: 'Medical History.pdf', date: '2 days ago' }
  ]);

  const notesSheetRef = useRef(null);
  const statusSheetRef = useRef(null);
  const uploadSheetRef = useRef(null);

  // If patient data was not passed (e.g. join failed), fetch by patient_id from users
  useEffect(() => {
    const pid = appointment.patient_id;
    const hasPatient = patient && (patient.full_name || patient.id);
    if (!pid || hasPatient) return;

    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, email, phone, profile_picture')
          .eq('id', pid)
          .single();
        if (!cancelled && !error && data) setPatient(data);
      } catch (e) {
        if (!cancelled) console.error('Fetch patient for detail:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [appointment.patient_id, patient?.id]);

  const getStatusStyle = (s) => {
    if (!s) return { bg: COLORS.gray100, text: COLORS.gray700 };
    switch(s.toLowerCase()) {
      case 'pending': return { bg: '#FFF8E6', text: '#B8860B' };
      case 'confirmed': return { bg: '#E3F2FD', text: '#1976D2' };
      case 'completed': return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'cancelled': return { bg: '#FFEBEE', text: '#C62828' };
      default: return { bg: COLORS.gray100, text: COLORS.gray700 };
    }
  };
  
  const currentStatusStyle = getStatusStyle(status);

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus.toLowerCase() })
        .eq('id', appointment.id);

      if (error) throw error;
      setStatus(newStatus.toLowerCase());
      statusSheetRef.current?.close();
      Toast.show('Status updated to ' + newStatus.charAt(0).toUpperCase() + newStatus.slice(1));
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('appointments')
        .update({ notes: notes })
        .eq('id', appointment.id);

      if (error) throw error;
      notesSheetRef.current?.close();
      Alert.alert('Success', 'Notes updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save notes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickFromCamera = () => {
    uploadSheetRef.current?.close();
    launchCamera({ mediaType: 'mixed', saveToPhotos: false, includeBase64: false }, (res) => {
      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert('Error', res.errorMessage || 'Camera failed');
        return;
      }
      const asset = res.assets?.[0];
      if (asset?.fileName) {
        setDocs(prev => [...prev, { id: Date.now(), name: asset.fileName, date: 'Just now' }]);
        Alert.alert('Added', 'File attached to this session.');
      }
    });
  };

  const handlePickFromGallery = () => {
    uploadSheetRef.current?.close();
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 5 }, (res) => {
      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert('Error', res.errorMessage || 'Gallery failed');
        return;
      }
      (res.assets || []).forEach((asset, i) => {
        if (asset?.fileName) {
          setDocs(prev => [...prev, { id: Date.now() + i, name: asset.fileName, date: 'Just now' }]);
        }
      });
      if (res.assets?.length) Alert.alert('Added', `${res.assets.length} file(s) attached.`);
    });
  };

  const handlePickFromFiles = () => {
    uploadSheetRef.current?.close();
    launchImageLibrary({ mediaType: 'mixed', selectionLimit: 5 }, (res) => {
      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert('Error', res.errorMessage || 'Could not open files');
        return;
      }
      (res.assets || []).forEach((asset, i) => {
        if (asset?.fileName) {
          setDocs(prev => [...prev, { id: Date.now() + i, name: asset.fileName, date: 'Just now' }]);
        }
      });
      if (res.assets?.length) Alert.alert('Added', `${res.assets.length} file(s) attached.`);
    });
  };

  const profileImage = patient.profile_picture ? { uri: patient.profile_picture } : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.offWhite} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <CustomIcon name="chevron-left" size={24} color={COLORS.gray900} iconType="Feather" touchable={false} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Control</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
         {/* Main Info Card */}
         <View style={styles.patientCard}>
            <View style={styles.patientHeader}>
               <View style={styles.avatarWrap}>
                  {profileImage ? (
                    <Image source={profileImage} style={styles.patientAvatar} />
                  ) : (
                    <Text style={styles.avatarInitials}>{(patient.full_name || 'P').charAt(0)}</Text>
                  )}
               </View>
               <View style={{ flex: 1 }}>
                  <Text style={styles.patientName}>{patient.full_name || 'Patient'}</Text>
                  <Text style={styles.patientIssue}>{appointment.issue}</Text>
               </View>
               
               <TouchableOpacity 
                 style={[styles.statusTapBtn, { backgroundColor: currentStatusStyle.bg }]}
                 onPress={() => statusSheetRef.current?.open()}
               >
                  <Text style={[styles.statusBtnText, { color: currentStatusStyle.text }]}>{status.toUpperCase()}</Text>
                  <CustomIcon name="chevron-down" size={14} color={currentStatusStyle.text} iconType="Feather" touchable={false} style={{marginLeft: 4}} />
               </TouchableOpacity>
            </View>

            <View style={styles.patientMeta}>
               <View style={styles.metaItem}>
                  <CustomIcon name="phone" size={16} color={COLORS.gray500} iconType="Feather" touchable={false} />
                  <Text style={styles.metaText}>{patient.phone || 'No phone'}</Text>
               </View>
               <View style={styles.metaItem}>
                  <CustomIcon name="map-pin" size={16} color={COLORS.gray500} iconType="Feather" touchable={false} />
                  <Text style={styles.metaText} numberOfLines={1}>{patient.address || 'Remote'}</Text>
               </View>
            </View>
            
            <View style={styles.cardDivider} />
           
          <View style={styles.infoGrid}>
             <View style={styles.infoItem}>
                <CustomIcon name="calendar" size={18} color={COLORS.gray500} iconType="Feather" touchable={false} style={styles.infoIcon} />
                <Text style={styles.infoText}>{appointment.date}</Text>
             </View>
             <View style={styles.infoItem}>
                <CustomIcon name="clock" size={18} color={COLORS.gray500} iconType="Feather" touchable={false} style={styles.infoIcon} />
                <Text style={styles.infoText}>{appointment.time}</Text>
             </View>
             <View style={styles.infoItem}>
                <CustomIcon name="video" size={18} color={COLORS.gray500} iconType="Feather" touchable={false} style={styles.infoIcon} />
                <Text style={styles.infoText}>{appointment.type}</Text>
             </View>
          </View>
        </View>

 
        {/* Action Tools */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manage Appointment</Text>
            
            <View style={styles.actionGrid}>
              {status === 'pending' && (
                <TouchableOpacity 
                  style={[styles.mainActionBtn, {backgroundColor: COLORS.primary}]}
                  onPress={() => handleStatusChange('confirmed')}
                  disabled={loading}
                >
                  <CustomIcon name="check-circle" size={20} color={COLORS.white} iconType="Feather" touchable={false} />
                  <Text style={styles.mainActionText}>Confirm Appointment</Text>
                </TouchableOpacity>
              )}

              {status === 'confirmed' && (
                <TouchableOpacity 
                  style={[styles.mainActionBtn, {backgroundColor: COLORS.success}]}
                  onPress={() => handleStatusChange('completed')}
                  disabled={loading}
                >
                  <CustomIcon name="check-square" size={20} color={COLORS.white} iconType="Feather" touchable={false} />
                  <Text style={styles.mainActionText}>Mark as Completed</Text>
                </TouchableOpacity>
              )}

              {status !== 'cancelled' && status !== 'completed' && (
                <TouchableOpacity 
                  style={[styles.mainActionBtn, {backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.error}]}
                  onPress={() => {
                    Alert.alert(
                      "Cancel Appointment",
                      "Are you sure you want to cancel this session?",
                      [
                        { text: "No", style: "cancel" },
                        { text: "Yes, Cancel", style: "destructive", onPress: () => handleStatusChange('cancelled') }
                      ]
                    );
                  }}
                  disabled={loading}
                >
                  <CustomIcon name="x-circle" size={20} color={COLORS.error} iconType="Feather" touchable={false} />
                  <Text style={[styles.mainActionText, {color: COLORS.error}]}>Cancel Session</Text>
                </TouchableOpacity>
              )}
            </View>
        </View>

        {/* Notes & Actions */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session Tools</Text>
            
            <TouchableOpacity 
              style={[styles.toolCard, {borderColor: COLORS.primaryLight, backgroundColor: COLORS.white}]}
              onPress={() => notesSheetRef.current?.open()}
            >
               <View style={[styles.toolIconBg, {backgroundColor: COLORS.primary + '15'}]}>
                  <CustomIcon name="edit-3" size={24} color={COLORS.primary} iconType="Feather" touchable={false} />
               </View>
               <View style={styles.toolTextWrap}>
                  <Text style={styles.toolTitle}>{notes.length > 0 ? 'Edit Notes' : 'Write Notes'}</Text>
                  <Text style={styles.toolDesc}>{notes.length > 0 ? 'You have saved notes' : 'Record observations privately'}</Text>
               </View>
               <CustomIcon name="chevron-right" size={20} color={COLORS.gray300} iconType="Feather" touchable={false} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toolCard, {borderColor: '#90CAF9', backgroundColor: COLORS.white}]}
              onPress={() => uploadSheetRef.current?.open()}
            >
               <View style={[styles.toolIconBg, {backgroundColor: '#E3F2FD'}]}>
                  <CustomIcon name="upload-cloud" size={24} color="#1976D2" iconType="Feather" touchable={false} />
               </View>
               <View style={styles.toolTextWrap}>
                  <Text style={styles.toolTitle}>Upload File</Text>
                  <Text style={styles.toolDesc}>Camera, gallery, or browse files</Text>
               </View>
               <CustomIcon name="chevron-right" size={20} color={COLORS.gray300} iconType="Feather" touchable={false} />
            </TouchableOpacity>
        </View>

        <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
               <Text style={styles.sectionTitle}>Shared Documents</Text>
            </View>
            
            {docs.map(doc => (
               <View key={doc.id} style={styles.docRow}>
                  <CustomIcon name="file-text" size={24} color={COLORS.gray400} iconType="Feather" touchable={false} />
                  <View style={styles.docTextWrap}>
                     <Text style={styles.docName}>{doc.name}</Text>
                     <Text style={styles.docDate}>Added {doc.date}</Text>
                  </View>
                  <TouchableOpacity style={styles.downloadBtn}>
                     <CustomIcon name="download" size={20} color={COLORS.primary} iconType="Feather" touchable={false} />
                  </TouchableOpacity>
               </View>
            ))}
        </View>

      </ScrollView>

      {/* Notes Bottom Sheet */}
      <RBSheet
        ref={notesSheetRef}
        height={500}
        closeOnDragDown={true}
        customStyles={{
          container: styles.sheetContainer,
          draggableIcon: { backgroundColor: COLORS.gray300, width: 40, height: 4 }
        }}
      >
        <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Clinical Notes</Text>
            <TouchableOpacity onPress={handleSaveNotes}>
               {loading ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Text style={styles.saveBtnText}>Save</Text>}
            </TouchableOpacity>
        </View>
        <View style={styles.sheetPadded}>
           <TextInput 
              style={styles.notesInput}
              placeholder="Record observations, diagnosis codes, or session summaries..."
              placeholderTextColor={COLORS.gray400}
              multiline
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
              autoFocus
           />
        </View>
      </RBSheet>

      {/* Status Bottom Sheet */}
      <RBSheet
        ref={statusSheetRef}
        height={300}
        closeOnDragDown
        closeOnPressMask
        customStyles={{
          container: styles.sheetContainer,
          draggableIcon: { backgroundColor: COLORS.gray300, width: 40, height: 4 }
        }}
      >
        <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Update appointment status</Text>
        </View>
        <View style={styles.sheetPadded}>
            {['pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
               <TouchableOpacity 
                 key={s} 
                 style={[styles.statusOption, status === s && styles.statusOptionActive]}
                 onPress={() => handleStatusChange(s)}
                 disabled={loading}
               >
                  <Text style={[styles.statusOptionText, status === s && styles.statusOptionTextActive]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                  {status === s && <CustomIcon name="check-circle" size={24} color={COLORS.primary} iconType="Feather" touchable={false} />}
               </TouchableOpacity>
            ))}
        </View>
      </RBSheet>

      {/* Upload file – Camera / Gallery / Files */}
      <RBSheet
        ref={uploadSheetRef}
        height={280}
        closeOnDragDown
        closeOnPressMask
        customStyles={{
          container: styles.sheetContainer,
          draggableIcon: { backgroundColor: COLORS.gray300, width: 40, height: 4 }
        }}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Upload file</Text>
          <TouchableOpacity onPress={() => uploadSheetRef.current?.close()}>
            <Text style={styles.sheetCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.sheetPadded}>
          <TouchableOpacity style={styles.uploadOption} onPress={handlePickFromCamera} activeOpacity={0.7}>
            <View style={[styles.uploadOptionIcon, { backgroundColor: COLORS.primary + '18' }]}>
              <CustomIcon name="camera" size={28} color={COLORS.primary} iconType="Feather" touchable={false} />
            </View>
            <Text style={styles.uploadOptionTitle}>Camera</Text>
            <Text style={styles.uploadOptionDesc}>Take a photo or video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadOption} onPress={handlePickFromGallery} activeOpacity={0.7}>
            <View style={[styles.uploadOptionIcon, { backgroundColor: '#E3F2FD' }]}>
              <CustomIcon name="image" size={28} color="#1976D2" iconType="Feather" touchable={false} />
            </View>
            <Text style={styles.uploadOptionTitle}>Gallery</Text>
            <Text style={styles.uploadOptionDesc}>Choose from photos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadOption} onPress={handlePickFromFiles} activeOpacity={0.7}>
            <View style={[styles.uploadOptionIcon, { backgroundColor: COLORS.gray200 }]}>
              <CustomIcon name="file-text" size={28} color={COLORS.gray700} iconType="Feather" touchable={false} />
            </View>
            <Text style={styles.uploadOptionTitle}>Browse files</Text>
            <Text style={styles.uploadOptionDesc}>Documents and media</Text>
          </TouchableOpacity>
        </View>
      </RBSheet>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.gray100
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.gray50, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  
  content: { padding: SPACING.lg, paddingBottom: 110 },
  
  patientCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.lg,
    ...SHADOWS.md, marginBottom: SPACING.xl
  },
  patientHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  patientMeta: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.gray50, paddingTop: 12, gap: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: COLORS.gray600, fontWeight: '500' },
  avatarWrap: { width: 56, height: 56, borderRadius: RADIUS.full, backgroundColor: COLORS.primaryLight + '30', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  patientAvatar: { width: 56, height: 56, borderRadius: RADIUS.full },
  avatarInitials: { fontSize: 24, fontWeight: '700', color: COLORS.primaryDark },
  patientName: { fontSize: 20, fontWeight: '700', color: COLORS.gray900, marginBottom: 2 },
  patientIssue: { fontSize: FONTS.sizes.sm, color: COLORS.gray500 },
  statusTapBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full },
  statusBtnText: { fontSize: FONTS.sizes.xs, fontWeight: '700' },
  
  cardDivider: { height: 1, backgroundColor: COLORS.gray100, marginVertical: SPACING.lg },
  
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  infoItem: { flexDirection: 'row', alignItems: 'center', width: '45%' },
  infoIcon: { marginRight: 6 },
  infoText: { fontSize: FONTS.sizes.sm, color: COLORS.gray700, fontWeight: '500' },

  section: { marginBottom: SPACING.xl },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.gray800, marginBottom: SPACING.md, textTransform: 'uppercase' },
  
  toolCard: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.md, 
    borderRadius: RADIUS.lg, borderWidth: 1, marginBottom: SPACING.sm,
    ...SHADOWS.sm
  },
  toolIconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  toolTextWrap: { flex: 1 },
  toolTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.gray900, marginBottom: 2 },
  toolDesc: { fontSize: FONTS.sizes.sm, color: COLORS.gray500 },

  docRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  docTextWrap: { flex: 1, marginLeft: SPACING.md },
  docName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.gray900, marginBottom: 2 },
  docDate: { fontSize: FONTS.sizes.xs, color: COLORS.gray500 },
  downloadBtn: { padding: 8 },

  sheetContainer: { borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, paddingHorizontal: 0 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingTop: SPACING.sm, paddingBottom: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  sheetTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  saveBtnText: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.primary },
  sheetPadded: { padding: SPACING.xl, flex: 1 },
  notesInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.gray900, lineHeight: 24, backgroundColor: COLORS.gray50, padding: SPACING.md, borderRadius: RADIUS.md },

  statusOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  statusOptionActive: {  },
  statusOptionText: { fontSize: FONTS.sizes.lg, color: COLORS.gray700, fontWeight: '500' },
  statusOptionTextActive: { color: COLORS.primary, fontWeight: '700' },

  sheetCancelText: { fontSize: FONTS.sizes.md, color: COLORS.gray500, fontWeight: '600' },
  uploadOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  uploadOptionIcon: { width: 52, height: 52, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  uploadOptionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.gray900, marginBottom: 2 },
  uploadOptionDesc: { fontSize: FONTS.sizes.sm, color: COLORS.gray500 },
  actionGrid: {
    gap: SPACING.md,
  },
  mainActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
  },
  mainActionText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default DoctorAppointmentDetailScreen;
