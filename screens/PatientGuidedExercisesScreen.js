/**
 * Guided audio comes from `therapy_documents` where document_type = 'audio'.
 * Uses `file_url`: full https URL, or a Storage object path in the `assets` bucket
 * (resolved via signed URL, then public URL).
 * Visibility is enforced by RLS (patient_id = auth.uid(), therapist, or admin).
 */
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Video from 'react-native-video';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { supabase } from '../utils/supabase';
import { resolveTherapyFileUrl } from '../utils/resolveTherapyFileUrl';

const PatientGuidedExercisesScreen = ({ navigation }) => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [activeUri, setActiveUri] = useState(null);
  const [paused, setPaused] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);

  const loadTracks = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const { data, error } = await supabase
        .from('therapy_documents')
        .select('id, title, description, file_url, document_type, created_at')
        .eq('document_type', 'audio')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTracks(data || []);
    } catch (e) {
      console.warn('therapy_documents (audio) fetch:', e);
      setListError(e.message || 'Could not load exercises');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTracks();
      return () => {
        setPlayingId(null);
        setActiveUri(null);
        setPaused(true);
      };
    }, [loadTracks]),
  );

  const togglePlay = async (item) => {
    if (playingId === item.id && activeUri) {
      setPaused((p) => !p);
      return;
    }

    setResolvingId(item.id);
    try {
      const uri = await resolveTherapyFileUrl(item.file_url);
      if (!uri) {
        Alert.alert('Unavailable', 'This document has no playable file URL yet.');
        return;
      }
      setPlayingId(item.id);
      setActiveUri(uri);
      setPaused(false);
    } catch (err) {
      Alert.alert('Error', err?.message || 'Could not prepare audio.');
    } finally {
      setResolvingId(null);
    }
  };

  const onPlaybackEnd = () => {
    setPlayingId(null);
    setActiveUri(null);
    setPaused(true);
  };

  const renderItem = ({ item }) => {
    const isPlaying = playingId === item.id && activeUri && !paused;
    const busy = resolvingId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardIconBg}>
          <CustomIcon name="headphones" size={22} color={COLORS.primary} iconType="Feather" touchable={false} />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{item.title || 'Guided session'}</Text>
          {item.description ? (
            <Text style={styles.cardDesc} numberOfLines={3}>
              {item.description}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.playBtn, isPlaying && styles.playBtnActive]}
          onPress={() => togglePlay(item)}
          disabled={busy}
          activeOpacity={0.85}
        >
          {busy ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <CustomIcon
              name={isPlaying ? 'pause' : 'play'}
              size={22}
              color={COLORS.white}
              iconType="Feather"
              touchable={false}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerSide} onPress={() => navigation.goBack()} hitSlop={12}>
          <CustomIcon name="chevron-left" size={24} color={COLORS.gray900} iconType="Feather" touchable={false} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Guided exercises
        </Text>
        <View style={styles.headerSide} />
      </View>

      <Text style={styles.intro}>
        Listen to sessions curated by your care team. New tracks appear here when they are published.
      </Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : listError ? (
        <View style={styles.centered}>
          <CustomIcon name="alert-circle" size={40} color={COLORS.gray400} iconType="Feather" touchable={false} />
          <Text style={styles.errorText}>{listError}</Text>
          <Text style={styles.hintText}>
            Check therapy_documents RLS and that audio rows use document_type audio with a valid file_url.
          </Text>
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={tracks.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <CustomIcon name="music" size={48} color={COLORS.gray300} iconType="Feather" touchable={false} />
              <Text style={styles.emptyTitle}>No guided audio yet</Text>
              <Text style={styles.emptyText}>Check back soon — new sessions will show up here.</Text>
            </View>
          }
        />
      )}

      {activeUri ? (
        <Video
          key={playingId || activeUri}
          source={{ uri: activeUri }}
          paused={paused}
          playInBackground
          playWhenInactive={Platform.OS === 'ios'}
          ignoreSilentSwitch="ignore"
          onEnd={onPlaybackEnd}
          onError={() => {
            Alert.alert('Playback error', 'Could not play this audio file.');
            onPlaybackEnd();
          }}
          style={styles.hiddenPlayer}
        />
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerSide: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.gray900,
  },
  intro: {
    fontSize: FONTS.sizes.sm,
    lineHeight: 20,
    color: COLORS.gray600,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  list: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  emptyList: { flexGrow: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardIconBg: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.gray900,
    marginBottom: 4,
  },
  cardDesc: { fontSize: FONTS.sizes.sm, color: COLORS.gray600, lineHeight: 20 },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  playBtnActive: { backgroundColor: COLORS.gray800 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  errorText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  hintText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    lineHeight: 20,
  },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxl * 2, paddingHorizontal: SPACING.lg },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.gray700,
    marginTop: SPACING.lg,
  },
  emptyText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
  hiddenPlayer: { width: 1, height: 1, opacity: 0, position: 'absolute', bottom: 0, right: 0 },
});

export default PatientGuidedExercisesScreen;
