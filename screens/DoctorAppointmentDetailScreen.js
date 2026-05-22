
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, StatusBar, Alert, Platform, ActivityIndicator, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import CustomIcon from '../components/CustomIcon';
import RBSheet from "react-native-raw-bottom-sheet";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { supabase } from '../utils/supabase';
import Toast from 'react-native-simple-toast';
import Video from 'react-native-video';
import { Linking } from 'react-native';
import { formatTimeWithLocalLabel } from '../constants/formatters';

const DoctorAppointmentDetailScreen = ({ navigation, route }) => {
  const appointment = route?.params?.appointment || {};
  const formatSessionType = (type) => {
    if (!type) return 'General';
    return type
      .toString()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };
  const decodeBase64 = (base64) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const lookup = new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;
    let bufferLength = base64.length * 0.75;
    if (base64[base64.length - 1] === '=') bufferLength--;
    if (base64[base64.length - 2] === '=') bufferLength--;
    const arrayBuffer = new Uint8Array(bufferLength);
    let p = 0;
    for (let i = 0; i < base64.length; i += 4) {
      const e1 = lookup[base64.charCodeAt(i)];
      const e2 = lookup[base64.charCodeAt(i + 1)];
      const e3 = lookup[base64.charCodeAt(i + 2)];
      const e4 = lookup[base64.charCodeAt(i + 3)];
      arrayBuffer[p++] = (e1 << 2) | (e2 >> 4);
      arrayBuffer[p++] = ((e2 & 15) << 4) | (e3 >> 2);
      arrayBuffer[p++] = ((e3 & 3) << 6) | (e4 & 63);
    }
    return arrayBuffer;
  };
  const detectPrescriptionType = (fileName = '', mimeType = '') => {
    const n = fileName.toLowerCase();
    const t = mimeType.toLowerCase();
    if (t.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic)$/.test(n)) return 'image';
    if (t.includes('pdf') || n.endsWith('.pdf')) return 'pdf';
    if (t.startsWith('audio/') || /\.(mp3|wav|m4a|aac)$/.test(n)) return 'audio';
    return 'document';
  };
  const [patient, setPatient] = useState(() => {
    const raw = appointment.patient;
    return raw != null ? (Array.isArray(raw) ? raw[0] : raw) : {};
  });
  const [loading, setLoading] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [showUploadSuccessModal, setShowUploadSuccessModal] = useState(false);
  const [uploadedDocsCount, setUploadedDocsCount] = useState(0);
  const [status, setStatus] = useState(appointment.status?.toLowerCase() || 'pending');
  const [notes, setNotes] = useState(appointment.notes || '');
  const [docs, setDocs] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackData, setPlaybackData] = useState({ currentTime: 0, duration: 0 });

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

  const fetchPrescriptions = async () => {
    if (!appointment.id) return;
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('id, title, file_url, file_type, issued_date, created_at')
        .eq('appointment_id', appointment.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDocs(data || []);
    } catch (e) {
      console.error('Fetch prescriptions failed:', e);
      setDocs([]);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [appointment.id]);

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

  const uploadPrescriptionAssets = async (assets = []) => {
    if (!assets.length) return;
    try {
      setUploadingDocs(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Authentication required', 'Please log in again and retry.');
        return;
      }
      if (!appointment.patient_id) {
        Alert.alert('Missing patient', 'Cannot upload prescription without patient id.');
        return;
      }

      let successCount = 0;
      for (const asset of assets) {
        const fileName = asset?.fileName || `prescription_${Date.now()}`;
        const fileExt = fileName.includes('.') ? fileName.split('.').pop() : 'jpg';
        const mimeType = asset?.type || 'application/octet-stream';
        const storagePath = `prescriptions/${user.id}/${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}.${fileExt}`;

        let body;
        if (asset?.base64) {
          body = decodeBase64(asset.base64).buffer;
        } else if (asset?.uri) {
          body = await fetch(asset.uri).then((r) => r.arrayBuffer());
        } else {
          continue;
        }

        const { error: uploadError } = await supabase.storage
          .from('assets')
          .upload(storagePath, body, {
            contentType: mimeType,
            upsert: false,
          });
        if (uploadError) throw uploadError;

        const urlResult = supabase.storage.from('assets').getPublicUrl(storagePath);
        const fileUrl = urlResult?.data?.publicUrl || urlResult?.data?.publicURL;
        if (!fileUrl) throw new Error('Failed to get uploaded file URL');

        const { error: insertError } = await supabase
          .from('prescriptions')
          .insert({
            patient_id: appointment.patient_id,
            doctor_id: user.id,
            appointment_id: appointment.id || null,
            title: `${formatSessionType(appointment.session_type)} Prescription`,
            notes: notes || null,
            file_url: fileUrl,
            file_type: detectPrescriptionType(fileName, mimeType),
          });
        if (insertError) throw insertError;
        successCount += 1;
      }

      await fetchPrescriptions();
      if (successCount > 0) {
        setUploadedDocsCount(successCount);
        setShowUploadSuccessModal(true);
      }
    } catch (e) {
      console.error('Upload prescription failed:', e);
      Alert.alert('Upload failed', e?.message || 'Could not upload prescription.');
    } finally {
      setUploadingDocs(false);
    }
  };

  const handleViewDoc = (doc) => {
    if (doc.file_type === 'pdf') {
      Linking.openURL(doc.file_url).catch(err => {
        Alert.alert('Error', 'Could not open PDF file.');
      });
      return;
    }
    setPreviewDoc(doc);
    if (doc.file_type === 'audio') {
      setIsPlaying(true);
    }
  };

  const closePreview = () => {
    setPreviewDoc(null);
    setIsPlaying(false);
    setPlaybackData({ currentTime: 0, duration: 0 });
  };

  const handlePickFromCamera = () => {
    uploadSheetRef.current?.close();
    launchCamera({ mediaType: 'photo', saveToPhotos: false, includeBase64: true }, async (res) => {
      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert('Error', res.errorMessage || 'Camera failed');
        return;
      }
      await uploadPrescriptionAssets(res.assets || []);
    });
  };

  const handlePickFromGallery = () => {
    uploadSheetRef.current?.close();
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 5, includeBase64: true }, async (res) => {
      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert('Error', res.errorMessage || 'Gallery failed');
        return;
      }
      await uploadPrescriptionAssets(res.assets || []);
    });
  };

  const handlePickFromFiles = () => {
    uploadSheetRef.current?.close();
    launchImageLibrary({ mediaType: 'mixed', selectionLimit: 5, includeBase64: true }, async (res) => {
      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert('Error', res.errorMessage || 'Could not open files');
        return;
      }
      await uploadPrescriptionAssets(res.assets || []);
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
                <Text style={styles.infoText}>
                  {formatTimeWithLocalLabel(appointment.time)}
                </Text>
             </View>
             <View style={styles.infoItem}>
                <CustomIcon name="video" size={18} color={COLORS.gray500} iconType="Feather" touchable={false} style={styles.infoIcon} />
                <Text style={styles.infoText}>
                  {appointment.type || formatSessionType(appointment.session_type)}
                </Text>
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
            
            {docs.length === 0 ? (
               <Text style={styles.emptyDocsText}>No prescriptions uploaded yet.</Text>
            ) : docs.map(doc => {
               const isAudio = doc.file_type === 'audio';
               const isImage = doc.file_type === 'image';
               const isPdf = doc.file_type === 'pdf';
               
               let iconName = 'file-text';
               let iconColor = COLORS.gray400;
               if (isAudio) { iconName = 'music'; iconColor = COLORS.primary; }
               if (isImage) { iconName = 'image'; iconColor = COLORS.success; }
               if (isPdf) { iconName = 'file-text'; iconColor = COLORS.error; }

               return (
                 <TouchableOpacity 
                   key={doc.id} 
                   style={styles.docRow}
                   onPress={() => handleViewDoc(doc)}
                 >
                    <View style={[styles.docIconBg, { backgroundColor: iconColor + '10' }]}>
                       <CustomIcon name={iconName} size={20} color={iconColor} iconType="Feather" touchable={false} />
                    </View>
                    <View style={styles.docTextWrap}>
                       <Text style={styles.docName} numberOfLines={1}>{doc.title || 'Shared File'}</Text>
                       <Text style={styles.docDate}>Issued {doc.issued_date || 'today'} • {doc.file_type?.toUpperCase?.() || 'DOCUMENT'}</Text>
                    </View>
                    <View style={styles.docActionBtn}>
                       <CustomIcon 
                         name={isAudio ? (isPlaying && previewDoc?.id === doc.id ? "pause" : "play") : "eye"} 
                         size={18} 
                         color={COLORS.primary} 
                         iconType="Feather" 
                         touchable={false} 
                       />
                    </View>
                 </TouchableOpacity>
               );
            })}
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
        height={430}
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

      <Modal visible={uploadingDocs} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.uploadingModal}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.uploadingTitle}>Uploading Documents</Text>
            <Text style={styles.uploadingSubtitle}>Please wait while we save your prescription file.</Text>
          </View>
        </View>
      </Modal>

      <Modal visible={showUploadSuccessModal} transparent animationType="fade" onRequestClose={() => setShowUploadSuccessModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconCircle}>
              <CustomIcon name="check" size={32} color={COLORS.white} iconType="Feather" touchable={false} />
            </View>
            <Text style={styles.successTitle}>Upload Successful</Text>
            <Text style={styles.successSubtitle}>
              {uploadedDocsCount} document{uploadedDocsCount > 1 ? 's were' : ' was'} uploaded to prescriptions.
            </Text>
            <TouchableOpacity style={styles.successDoneBtn} onPress={() => setShowUploadSuccessModal(false)}>
              <Text style={styles.successDoneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Document Preview Modal (Image/Audio) */}
      <Modal visible={!!previewDoc} transparent animationType="slide" onRequestClose={closePreview}>
        <SafeAreaView style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <TouchableOpacity onPress={closePreview} style={styles.previewCloseBtn}>
              <CustomIcon name="x" size={24} color={COLORS.white} iconType="Feather" touchable={false} />
            </TouchableOpacity>
            <Text style={styles.previewTitle} numberOfLines={1}>{previewDoc?.title || 'Preview'}</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.previewContent}>
            {previewDoc?.file_type === 'image' && (
              <Image 
                source={{ uri: previewDoc.file_url }} 
                style={styles.fullImage} 
                resizeMode="contain" 
              />
            )}

            {previewDoc?.file_type === 'audio' && (
              <View style={styles.audioPlayerCard}>
                <View style={styles.audioIconLarge}>
                  <CustomIcon name="music" size={64} color={COLORS.primary} iconType="Feather" touchable={false} />
                </View>
                
                <Video
                  source={{ uri: previewDoc.file_url }}
                  paused={!isPlaying}
                  onProgress={(data) => setPlaybackData({
                    currentTime: data.currentTime,
                    duration: data.seekableDuration || data.duration
                  })}
                  onEnd={() => setIsPlaying(false)}
                  style={{ height: 0, width: 0 }}
                  audioOnly={true}
                  playInBackground={true}
                />

                <View style={styles.audioInfo}>
                   <Text style={styles.audioFileName}>{previewDoc.title}</Text>
                   <Text style={styles.audioMeta}>
                      {Math.floor(playbackData.currentTime / 60)}:{Math.floor(playbackData.currentTime % 60).toString().padStart(2, '0')} / 
                      {Math.floor(playbackData.duration / 60)}:{Math.floor(playbackData.duration % 60).toString().padStart(2, '0')}
                   </Text>
                </View>

                <View style={styles.audioControls}>
                   <TouchableOpacity 
                     style={styles.playPauseBtn} 
                     onPress={() => setIsPlaying(!isPlaying)}
                   >
                      <CustomIcon 
                        name={isPlaying ? "pause" : "play"} 
                        size={32} 
                        color={COLORS.white} 
                        iconType="Feather" 
                        touchable={false} 
                      />
                   </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

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
  emptyDocsText: { fontSize: FONTS.sizes.sm, color: COLORS.gray500 },

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  uploadingModal: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  uploadingTitle: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  uploadingSubtitle: {
    marginTop: SPACING.xs,
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    textAlign: 'center',
  },
  successModal: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  successTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  successSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  successDoneBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm + 2,
  },
  successDoneBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
  
  docIconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  docActionBtn: {
    padding: 8,
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.full,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? 0 : SPACING.lg,
  },
  previewCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  previewTitle: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md
  },
  previewContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  audioPlayerCard: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  audioIconLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  audioInfo: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  audioFileName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray900,
    textAlign: 'center',
    marginBottom: 8
  },
  audioMeta: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray500,
    fontWeight: '600'
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
});

export default DoctorAppointmentDetailScreen;
