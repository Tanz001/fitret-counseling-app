import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import CustomIcon from '../components/CustomIcon';

const MOCK_MESSAGES = [
  { id: '1', text: 'Hello Doctor, I wanted to ask about the assignment.', sender: 'me', time: '10:40 AM' },
  { id: '2', text: 'Hi John, yes go ahead. What is your question?', sender: 'them', time: '10:41 AM' },
  { id: '3', text: 'Should I fill it out daily?', sender: 'me', time: '10:42 AM' },
  { id: '4', text: 'Great, see you then.', sender: 'them', time: '10:45 AM' },
];

const ChatThreadScreen = ({ navigation, route }) => {
  const chatName = route?.params?.chat?.name || 'Dr. Aisha Rahman';
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: inputText,
        sender: 'me',
        time: 'Now'
      };
      setMessages([...messages, newMessage]);
      setInputText('');
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === 'me';
    return (
      <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>{item.text}</Text>
        <Text style={[styles.messageTime, isMe ? styles.myTime : styles.theirTime]}>{item.time}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <CustomIcon name="chevron-back" size={24} color="#333" iconType="Ionicons" touchable={false} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
           <Text style={styles.headerTitle}>{chatName}</Text>
           <Text style={styles.statusText}>Online</Text>
        </View>
        <TouchableOpacity style={styles.callBtn} onPress={() => navigation.navigate('VideoCall')}>
          <CustomIcon name="videocam-outline" size={24} color="#84bca4" iconType="Ionicons" touchable={false} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.flex1} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachBtn}>
            <CustomIcon name="add-outline" size={26} color="#888" iconType="Ionicons" touchable={false} />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
             style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
             onPress={sendMessage}
             disabled={!inputText.trim()}
          >
            <CustomIcon name="send" size={20} color="#fff" iconType="Ionicons" touchable={false} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { padding: 5 },
  headerInfo: { flex: 1, marginLeft: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  statusText: { fontSize: 12, color: '#84bca4', fontWeight: '600' },
  callBtn: { padding: 5, backgroundColor: '#f0f8f4', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  
  listContainer: { padding: 20 },
  messageBubble: { maxWidth: '80%', padding: 15, borderRadius: 20, marginBottom: 15 },
  myBubble: { alignSelf: 'flex-end', backgroundColor: '#84bca4', borderBottomRightRadius: 5 },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 5, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  messageText: { fontSize: 16, lineHeight: 22 },
  myText: { color: '#fff' },
  theirText: { color: '#333' },
  messageTime: { fontSize: 11, marginTop: 5, alignSelf: 'flex-end' },
  myTime: { color: 'rgba(255,255,255,0.7)' },
  theirTime: { color: '#999' },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, paddingBottom: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  attachBtn: { padding: 10 },
  textInput: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 15, paddingTop: 12, paddingBottom: 12, fontSize: 16, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#84bca4', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  sendBtnDisabled: { backgroundColor: '#ccc' }
});

export default ChatThreadScreen;
