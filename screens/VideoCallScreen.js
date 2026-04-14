import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import CustomIcon from '../components/CustomIcon';

const VideoCallScreen = ({ navigation }) => {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Mock Remote Video Stream Layer */}
      <View style={styles.remoteVideoContainer}>
        <Image 
          source={require('../assets/person.webp')} 
          style={styles.remoteVideoMock} 
        />
        <View style={styles.overlayTextContainer}>
          <Text style={styles.overlayText}>Dr. Aisha</Text>
          <Text style={styles.timerText}>12:04</Text>
        </View>
      </View>

      {/* Mock Local Video Stream (Picture-in-Picture) */}
      <View style={styles.localVideoContainer}>
          <View style={styles.localVideoPlaceholder}>
             <CustomIcon name="person" size={40} color="#ccc" iconType="Ionicons" touchable={false} />
          </View>
      </View>

      {/* Floating Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton}>
          <CustomIcon name="camera-reverse-outline" size={28} color="#fff" iconType="Ionicons" touchable={false} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, !videoOn && styles.controlButtonOff]} 
          onPress={() => setVideoOn(!videoOn)}
        >
          <CustomIcon name={videoOn ? "videocam-outline" : "videocam-off-outline"} size={28} color="#fff" iconType="Ionicons" touchable={false} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, !micOn && styles.controlButtonOff]}
          onPress={() => setMicOn(!micOn)}
        >
          <CustomIcon name={micOn ? "mic-outline" : "mic-off-outline"} size={28} color="#fff" iconType="Ionicons" touchable={false} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.endCallButton]}
          onPress={() => navigation.goBack()}
        >
          <CustomIcon name="call" size={28} color="#fff" style={{transform: [{rotate: '135deg'}]}} iconType="Ionicons" touchable={false} />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  
  remoteVideoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  remoteVideoMock: { width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.8 },
  overlayTextContainer: { position: 'absolute', top: 50, left: 20 },
  overlayText: { color: '#fff', fontSize: 24, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 3 },
  timerText: { color: '#fff', fontSize: 16, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 3, marginTop: 5 },
  
  localVideoContainer: { 
    position: 'absolute', top: 50, right: 20, 
    width: 100, height: 150, borderRadius: 15, overflow: 'hidden', 
    borderWidth: 2, borderColor: '#fff', backgroundColor: '#333' 
  },
  localVideoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  controlsContainer: { 
    position: 'absolute', bottom: 40, width: '100%', 
    flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center',
    paddingHorizontal: 20
  },
  controlButton: { 
    width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', alignItems: 'center' 
  },
  controlButtonOff: { backgroundColor: 'rgba(255,255,255,0.5)' },
  endCallButton: { backgroundColor: '#eb5757' }
});

export default VideoCallScreen;
