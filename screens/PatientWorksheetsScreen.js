import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { fetchPatientResources } from '../services/resourcesApi';
import { resolveTherapyFileUrl } from '../utils/resolveTherapyFileUrl';

const THUMB_DEFAULT = require('../assets/Emotional regulation.webp');

const PatientWorksheetsScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPatientResources('worksheet');
      const enriched = await Promise.all(
        data.map(async (item) => {
          let thumbUri = null;
          if (item.thumbnail) {
            try {
              thumbUri = await resolveTherapyFileUrl(item.thumbnail);
            } catch (_) {
              thumbUri = null;
            }
          }
          return { ...item, thumbUri };
        }),
      );
      setItems(enriched);
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not load worksheets');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openResource = (item) => {
    navigation.getParent()?.navigate('PatientResourceDetail', { resource: item })
      ?? navigation.navigate('PatientResourceDetail', { resource: item });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <CustomIcon name="chevron-left" size={24} color={COLORS.gray900} iconType="Feather" touchable={false} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Worksheets</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>Assigned to you</Text>
          <Text style={styles.sectionDesc}>
            Complete these worksheets and submit your answers to your care team.
          </Text>

          {items.length === 0 ? (
            <Text style={styles.empty}>No worksheets assigned yet.</Text>
          ) : (
            items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => openResource(item)}
              >
                <View style={styles.thumbnailWrap}>
                  <Image
                    source={item.thumbUri ? { uri: item.thumbUri } : THUMB_DEFAULT}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {item.description ? (
                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                  <Text
                    style={[
                      styles.statusText,
                      { color: item.status === 'Completed' ? COLORS.primary : COLORS.gray600 },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
                <CustomIcon name="chevron-right" size={20} color={COLORS.gray400} iconType="Feather" touchable={false} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
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
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  sectionLabel: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  sectionDesc: { fontSize: FONTS.sizes.sm, color: COLORS.gray500, marginTop: 4, marginBottom: SPACING.lg, lineHeight: 20 },
  empty: { textAlign: 'center', color: COLORS.gray500, marginTop: SPACING.xl },
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
  thumbnailWrap: {
    width: 52,
    height: 52,
    borderRadius: 10,
    marginRight: SPACING.md,
    overflow: 'hidden',
    backgroundColor: COLORS.accent,
  },
  thumbnailImage: { width: '100%', height: '100%' },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.gray900, marginBottom: 4 },
  cardDescription: { fontSize: FONTS.sizes.xs, color: COLORS.gray500, lineHeight: 18, marginBottom: 6 },
  statusText: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
});

export default PatientWorksheetsScreen;
