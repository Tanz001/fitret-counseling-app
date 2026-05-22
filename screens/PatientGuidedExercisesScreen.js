/**
 * Guided audio from `resources` where resource_type = 'audio' (assigned via resource_access).
 */
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Video from 'react-native-video';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { fetchPatientResources } from '../services/resourcesApi';
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
      const data = await fetchPatientResources('audio');
      setTracks(data);
    } catch (e) {
      console.warn('resources (audio) fetch:', e);
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
        Alert.alert('Unavailable', 'This exercise has no audio file yet.');
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
              size={20}
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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <CustomIcon name="chevron-left" size={24} color={COLORS.gray900} iconType="Feather" touchable={false} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Guided Exercises</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
      ) : listError ? (
        <Text style={styles.errorText}>{listError}</Text>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No audio exercises assigned yet.</Text>
          }
        />
      )}

      {activeUri ? (
        <Video
          source={{ uri: activeUri }}
          paused={paused}
          audioOnly
          playInBackground={false}
          onEnd={onPlaybackEnd}
          style={styles.hiddenVideo}
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  list: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  cardIconBg: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.gray900 },
  cardDesc: { fontSize: FONTS.sizes.sm, color: COLORS.gray500, marginTop: 4 },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtnActive: { backgroundColor: COLORS.primaryDark },
  hiddenVideo: { width: 0, height: 0, position: 'absolute' },
  emptyText: { textAlign: 'center', color: COLORS.gray500, marginTop: SPACING.xl },
  errorText: { textAlign: 'center', color: COLORS.error, marginTop: SPACING.xl, paddingHorizontal: SPACING.lg },
});

export default PatientGuidedExercisesScreen;
