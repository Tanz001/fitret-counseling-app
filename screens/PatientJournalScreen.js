import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { supabase } from '../utils/supabase';
import Toast from 'react-native-simple-toast';

const PatientJournalScreen = ({ navigation }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setEntries([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('therapy_journal')
        .select('id, title, content, entry_date, created_at')
        .eq('patient_id', user.id)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (e) {
      console.error('Fetch journal entries:', e);
      Toast.show('Could not load journal');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [fetchEntries])
  );

  const handleSave = async () => {
    const trimmed = (content || '').trim();
    if (!trimmed) {
      Toast.show('Please write something');
      return;
    }
    try {
      setSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Toast.show('Please sign in');
        return;
      }

      const { data: newEntry, error } = await supabase
        .from('therapy_journal')
        .insert({
          patient_id: user.id,
          title: (title || '').trim() || null,
          content: trimmed,
        })
        .select('id, title, content, entry_date, created_at')
        .single();

      if (error) throw error;
      Toast.show('Entry saved');
      setTitle('');
      setContent('');
      // Show new entry immediately so it appears even if SELECT RLS isn't set up yet
      if (newEntry) {
        setEntries((prev) => [newEntry, ...prev]);
      }
      // Refetch to sync list (if SELECT policy exists); don't refetch if it would replace with []
    } catch (e) {
      console.error('Save journal:', e);
      Toast.show(e.message || 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (entry) => {
    setViewEntry(null);
    setEditingEntry(entry);
    setEditTitle(entry.title || '');
    setEditContent(entry.content || '');
  };

  const closeEdit = () => {
    setEditingEntry(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleUpdate = async () => {
    const trimmed = (editContent || '').trim();
    if (!editingEntry || !trimmed) {
      Toast.show('Content is required');
      return;
    }
    try {
      setUpdating(true);
      const { data: updated, error } = await supabase
        .from('therapy_journal')
        .update({
          title: (editTitle || '').trim() || null,
          content: trimmed,
        })
        .eq('id', editingEntry.id)
        .select('id, title, content, entry_date, created_at')
        .single();

      if (error) throw error;
      Toast.show('Entry updated');
      setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      closeEdit();
    } catch (e) {
      console.error('Update journal:', e);
      Toast.show(e.message || 'Failed to update entry');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = (entry) => {
    Alert.alert(
      'Delete entry',
      'This cannot be undone. Delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              setViewEntry(null);
              const { error } = await supabase.from('therapy_journal').delete().eq('id', entry.id);
              if (error) throw error;
              setEntries((prev) => prev.filter((e) => e.id !== entry.id));
              Toast.show('Entry deleted');
            } catch (e) {
              console.error('Delete journal:', e);
              Toast.show(e.message || 'Failed to delete');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerSide} onPress={() => navigation.goBack()}>
          <CustomIcon name="chevron-left" size={24} color={COLORS.gray900} iconType="Feather" touchable={false} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            Therapy Journal
          </Text>
        </View>
        <View style={styles.headerSide} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.newEntryCard}>
            <Text style={styles.newEntryLabel}>What's on your mind today?</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Title (optional)"
              placeholderTextColor={COLORS.gray400}
              value={title}
              onChangeText={setTitle}
            />
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.entryInput}
                placeholder="Write your thoughts, reflections, or how you're feeling..."
                placeholderTextColor={COLORS.gray400}
                multiline
                value={content}
                onChangeText={setContent}
                textAlignVertical="top"
              />
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.9}
            >
              {saving ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.saveBtnText}>Save Entry</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Past Entries</Text>
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : entries.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Image
                source={require('../assets/person holding phone.webp')}
                style={styles.emptyHeroImage}
                resizeMode="cover"
                accessibilityRole="image"
                accessibilityLabel="Wellness journey illustration"
              />
              <Text style={styles.emptyHeadline}>Start your wellness journey today.</Text>
              <Text style={styles.emptyText}>No entries yet. Write your first one above.</Text>
            </View>
          ) : (
            entries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryCard}
                activeOpacity={0.9}
                onPress={() => setViewEntry(entry)}
              >
                <View style={styles.entryHeader}>
                  <View style={styles.dateRow}>
                    <CustomIcon name="calendar" size={16} color={COLORS.primary} iconType="Feather" touchable={false} style={styles.entryIcon} />
                    <Text style={styles.entryDate}>{formatDate(entry.entry_date)}</Text>
                  </View>
                </View>
                {entry.title ? <Text style={styles.entryTitle}>{entry.title}</Text> : null}
                <Text style={styles.entryPreview} numberOfLines={3}>
                  {entry.content}
                </Text>
              </TouchableOpacity>
            ))
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={!!viewEntry}
        transparent
        animationType="fade"
        onRequestClose={() => setViewEntry(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setViewEntry(null)}
        >
          <View style={styles.modalBox} onStartShouldSetResponder={() => true}>
            {viewEntry && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalDate}>{formatDate(viewEntry.entry_date)}</Text>
                  <TouchableOpacity onPress={() => setViewEntry(null)} style={styles.modalClose}>
                    <CustomIcon name="x" size={24} color={COLORS.gray600} iconType="Feather" touchable={false} />
                  </TouchableOpacity>
                </View>
                {viewEntry.title ? <Text style={styles.modalTitle}>{viewEntry.title}</Text> : null}
                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalContent}>{viewEntry.content}</Text>
                </ScrollView>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalBtnEdit}
                    onPress={() => openEdit(viewEntry)}
                    disabled={deleting}
                  >
                    <CustomIcon name="edit-3" size={18} color={COLORS.primary} iconType="Feather" touchable={false} />
                    <Text style={styles.modalBtnEditText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalBtnDelete}
                    onPress={() => handleDelete(viewEntry)}
                    disabled={deleting}
                  >
                    <CustomIcon name="trash-2" size={18} color={COLORS.error} iconType="Feather" touchable={false} />
                    <Text style={styles.modalBtnDeleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={!!editingEntry}
        transparent
        animationType="slide"
        onRequestClose={closeEdit}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeEdit} />
          <View style={styles.editModalBox} onStartShouldSetResponder={() => true}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit entry</Text>
              <TouchableOpacity onPress={closeEdit} style={styles.modalClose}>
                <CustomIcon name="x" size={24} color={COLORS.gray600} iconType="Feather" touchable={false} />
              </TouchableOpacity>
            </View>
            {editingEntry ? (
              <Text style={styles.modalDate}>{formatDate(editingEntry.entry_date)}</Text>
            ) : null}
            <TextInput
              style={styles.titleInput}
              placeholder="Title (optional)"
              placeholderTextColor={COLORS.gray400}
              value={editTitle}
              onChangeText={setEditTitle}
            />
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.entryInput}
                placeholder="Content..."
                placeholderTextColor={COLORS.gray400}
                multiline
                value={editContent}
                onChangeText={setEditContent}
                textAlignVertical="top"
              />
            </View>
            <View style={styles.editModalActions}>
              <TouchableOpacity style={styles.editCancelBtn} onPress={closeEdit}>
                <Text style={styles.editCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, updating && styles.saveBtnDisabled]}
                onPress={handleUpdate}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.saveBtnText}>Save changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerSide: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray900,
    textAlign: 'center',
    width: '100%',
  },

  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl * 2 },

  newEntryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  newEntryLabel: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.gray800, marginBottom: SPACING.md },
  titleInput: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray900,
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  inputWrap: {
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.lg,
    minHeight: 120,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  entryInput: { fontSize: FONTS.sizes.md, color: COLORS.gray900, lineHeight: 24, minHeight: 100 },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },

  loadingWrap: { padding: SPACING.xl, alignItems: 'center' },
  emptyWrap: { alignItems: 'center', padding: SPACING.xxl },
  emptyHeroImage: {
    width: '100%',
    maxWidth: 280,
    aspectRatio: 1,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.gray100,
  },
  emptyHeadline: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray800,
    textAlign: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  emptyText: { fontSize: FONTS.sizes.md, color: COLORS.gray500, marginTop: SPACING.sm, textAlign: 'center' },

  entryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  entryIcon: { marginRight: 6 },
  entryDate: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.gray800 },
  entryTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.gray900, marginBottom: 6 },
  entryPreview: { fontSize: FONTS.sizes.md, color: COLORS.gray700, lineHeight: 22 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    maxHeight: '80%',
    width: '100%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  modalDate: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.primary },
  modalClose: { padding: 4 },
  modalTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.md },
  modalScroll: { maxHeight: 320 },
  modalContent: { fontSize: FONTS.sizes.md, color: COLORS.gray800, lineHeight: 24 },
  modalActions: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    gap: SPACING.md,
  },
  modalBtnEdit: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 8,
  },
  modalBtnEditText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.primary },
  modalBtnDelete: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.error,
    gap: 8,
  },
  modalBtnDeleteText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.error },

  editModalBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 560,
    maxHeight: '85%',
  },
  editModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  editModalTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  editModalActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg },
  editCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  editCancelBtnText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.gray700 },

  bottomSpacer: { height: 40 },
});

export default PatientJournalScreen;
