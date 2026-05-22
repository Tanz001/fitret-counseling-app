import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomIcon from '../components/CustomIcon';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { supabase } from '../utils/supabase';

const AI_AVATAR = require('../assets/logoo.png');

const INITIAL_MESSAGES = [
  {
    id: '1',
    text: "Hello! Welcome to Fitret Chat. How are you feeling today?",
    sender: 'ai',
    timestamp: new Date().toISOString(),
  },
];

const HEADER_APPROX = 56;

const AIChatBotScreen = ({ navigation }) => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef();

  const handleSend = () => {
    if (inputText.trim() === '') return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Mock AI Response
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm here to listen and help. That sounds like something we can explore together. Would you like to try a quick breathing exercise or journal about this?",
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const renderMessage = ({ item }) => {
    const isAI = item.sender === 'ai';
    return (
      <View style={[styles.messageWrapper, isAI ? styles.aiWrapper : styles.userWrapper]}>
        {isAI && <Image source={AI_AVATAR} style={styles.messageAvatar} />}
        <View style={[styles.messageBubble, isAI ? styles.aiBubble : styles.userBubble]}>
          <Text style={[styles.messageText, isAI ? styles.aiText : styles.userText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? HEADER_APPROX : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <CustomIcon name="chevron-left" size={24} color={COLORS.gray700} iconType="Feather" touchable={false} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Fitret Chat</Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.statusText}>Always Online</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreBtn}>
            <CustomIcon name="more-vertical" size={20} color={COLORS.gray700} iconType="Feather" touchable={false} />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          style={styles.chatList}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatListContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {isTyping && (
          <View style={styles.typingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.typingText}>Thinking...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <CustomIcon name="send" size={20} color={COLORS.white} iconType="Feather" touchable={false} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    ...SHADOWS.sm,
  },
  backBtn: { padding: 8 },
  headerTitleContainer: { flex: 1, marginLeft: SPACING.sm },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginRight: 6 },
  statusText: { fontSize: 12, color: COLORS.gray500, fontWeight: '500' },
  moreBtn: { padding: 8 },
  chatList: { flex: 1 },
  chatListContent: { padding: SPACING.lg, flexGrow: 1 },
  messageWrapper: { flexDirection: 'row', marginBottom: SPACING.lg, maxWidth: '85%' },
  aiWrapper: { alignSelf: 'flex-start' },
  userWrapper: { alignSelf: 'flex-end' },
  messageAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8, alignSelf: 'flex-end' },
  messageBubble: { padding: SPACING.md, borderRadius: RADIUS.lg },
  aiBubble: { backgroundColor: COLORS.white, borderBottomLeftRadius: 0, ...SHADOWS.sm },
  userBubble: { backgroundColor: COLORS.primary, borderBottomRightRadius: 0 },
  messageText: { fontSize: FONTS.sizes.md, lineHeight: 22 },
  aiText: { color: COLORS.gray900 },
  userText: { color: COLORS.white },
  typingContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.xl, marginBottom: SPACING.md },
  typingText: { marginLeft: 8, fontSize: 12, color: COLORS.gray500, fontStyle: 'italic' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginRight: SPACING.md,
    fontSize: FONTS.sizes.md,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  sendBtnDisabled: { backgroundColor: COLORS.gray300 },
});

export default AIChatBotScreen;
