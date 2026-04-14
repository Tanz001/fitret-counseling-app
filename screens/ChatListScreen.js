import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const MOCK_CHATS = [
  { id: '1', name: 'Dr. Aisha Rahman', lastMessage: 'Great, see you then.', time: '10:45 AM', unread: 2, image: require('../assets/person.webp') },
  { id: '2', name: 'Dr. Sarah Miller', lastMessage: 'Could you fill out the intake form?', time: 'Yesterday', unread: 0, image: require('../assets/person.webp') },
  { id: '3', name: 'Support Team', lastMessage: 'Your payment was successful.', time: 'Mon', unread: 0 },
];

const ChatListScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatRow}
      onPress={() => navigation.navigate('ChatThread', { chat: item })}
      activeOpacity={0.8}
    >
      <View style={styles.avatarContainer}>
        {item.image ? (
          <Image source={item.image} style={styles.avatar} />
        ) : (
          <CustomIcon name="person" size={28} color={COLORS.gray400} iconType="Ionicons" touchable={false} />
        )}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={[styles.chatTime, item.unread > 0 && styles.chatTimeUnread]}>{item.time}</Text>
        </View>
        <View style={styles.chatFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
      <CustomIcon name="chevron-forward" size={20} color={COLORS.gray400} iconType="Ionicons" touchable={false} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity style={styles.newChatBtn}>
            <CustomIcon name="create-outline" size={24} color={COLORS.primary} iconType="Ionicons" touchable={false} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={MOCK_CHATS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.gray900 },
  newChatBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.gray50, justifyContent: 'center', alignItems: 'center' },
  listContainer: { paddingBottom: SPACING.xxl },
  chatRow: {
    flexDirection: 'row',
    padding: SPACING.lg,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  avatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },
  chatInfo: { flex: 1 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  chatName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.gray900 },
  chatTime: { fontSize: FONTS.sizes.sm, color: COLORS.gray500 },
  chatTimeUnread: { color: COLORS.primary, fontWeight: '600' },
  chatFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMessage: { fontSize: FONTS.sizes.sm, color: COLORS.gray600, flex: 1, paddingRight: 12 },
  unreadBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  unreadText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  separator: { height: 1, backgroundColor: COLORS.gray100, marginLeft: 86 },
});

export default ChatListScreen;
