import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { fetchPatientResources } from '../services/resourcesApi';

const TYPE_LABELS = {
  journal: 'Journal',
  exercise: 'Exercise',
};

const PatientActivitiesScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [journals, exercises] = await Promise.all([
        fetchPatientResources('journal'),
        fetchPatientResources('exercise'),
      ]);
      setItems([...journals, ...exercises]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not load activities');
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <CustomIcon name="chevron-left" size={24} color={COLORS.gray900} iconType="Feather" touchable={false} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activities</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {items.length === 0 ? (
            <Text style={styles.empty}>No journal or exercise activities assigned yet.</Text>
          ) : (
            items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() =>
                  navigation.getParent()?.navigate('PatientResourceDetail', { resource: item })
                  ?? navigation.navigate('PatientResourceDetail', { resource: item })
                }
                activeOpacity={0.8}
              >
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{TYPE_LABELS[item.resource_type] || item.resource_type}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {item.description ? (
                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                  <Text style={styles.status}>{item.status}</Text>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
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
  badge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryDark },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.gray900 },
  cardDesc: { fontSize: FONTS.sizes.xs, color: COLORS.gray500, marginTop: 4 },
  status: { fontSize: FONTS.sizes.xs, fontWeight: '600', color: COLORS.primary, marginTop: 6 },
});

export default PatientActivitiesScreen;
