import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Upcoming Appointment', message: 'You have a session with Dr. Aisha in 30 minutes.', time: '1h ago', type: 'appointment', read: false },
  { id: '2', title: 'New Message', message: 'Sarah M. sent you a new message.', time: '2h ago', type: 'message', read: false },
  { id: '3', title: 'Payment Successful', message: 'Your wallet has been credited with ETB 150.', time: 'Yesterday', type: 'wallet', read: true },
];

const NotificationsScreen = ({ navigation }) => {
  const markAllSheetRef = useRef(null);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const handleMarkAllRead = () => {
    markAllSheetRef.current?.close();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIconForType = (type) => {
    switch(type) {
      case 'appointment': return 'calendar';
      case 'message': return 'chatbubble-ellipses';
      case 'wallet': return 'wallet';
      default: return 'notifications';
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.notificationCard, !item.read && styles.unreadCard]}>
      <View style={[styles.iconContainer, !item.read && styles.unreadIcon]}>
        <CustomIcon name={getIconForType(item.type)} size={24} color={item.read ? '#888' : COLORS.primary} iconType="Ionicons" touchable={false} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.title, !item.read && styles.unreadText]}>{item.title}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.message}>{item.message}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
           <CustomIcon name="chevron-back" size={24} color="#333" iconType="Ionicons" touchable={false} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={() => markAllSheetRef.current?.open()}>
           <Text style={styles.markAllRead}>Mark All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />

      <RBSheet
        ref={markAllSheetRef}
        closeOnDragDown
        closeOnPressMask
        height={200}
        customStyles={{
          container: { borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl },
          wrapper: { backgroundColor: COLORS.overlay },
        }}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Mark all as read?</Text>
          <TouchableOpacity style={styles.sheetCancelBtn} onPress={() => markAllSheetRef.current?.close()} activeOpacity={0.8}>
            <Text style={styles.sheetCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetConfirmBtn} onPress={handleMarkAllRead} activeOpacity={0.8}>
            <Text style={styles.sheetConfirmText}>Mark all read</Text>
          </TouchableOpacity>
        </View>
      </RBSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
  markAllRead: { color: COLORS.primary, fontWeight: '600' },

  listContainer: { padding: 20 },
  notificationCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  unreadCard: { backgroundColor: '#f0f8f4' },
  
  iconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  unreadIcon: { backgroundColor: '#fff' },
  
  cardContent: { flex: 1, justifyContent: 'center' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  title: { fontSize: 16, fontWeight: '600', color: '#555' },
  unreadText: { color: '#333', fontWeight: 'bold' },
  time: { fontSize: 13, color: '#999' },
  message: { fontSize: 14, color: '#666', lineHeight: 20 },
  
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary, marginLeft: 10, alignSelf: 'center' },
  sheetContent: { padding: SPACING.xl },
  sheetTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900, marginBottom: SPACING.lg },
  sheetCancelBtn: { paddingVertical: 14, alignItems: 'center', borderRadius: RADIUS.lg, backgroundColor: COLORS.gray100, marginBottom: SPACING.sm },
  sheetCancelText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.gray700 },
  sheetConfirmBtn: { paddingVertical: 14, alignItems: 'center', borderRadius: RADIUS.lg, backgroundColor: COLORS.primary },
  sheetConfirmText: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.white },
});

export default NotificationsScreen;
