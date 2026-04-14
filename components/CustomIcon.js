import React from 'react';
import {
    Text,
    StyleSheet,
    TouchableOpacity,
    View,
  } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import Fontisto from 'react-native-vector-icons/Fontisto';
 



// Map Ionicons icon names to other icon libraries so we don't depend on Ionicons
const ioniconsToOther = {
  // Navigation / arrows
  'chevron-back': { component: Feather, name: 'chevron-left' },
  'chevron-forward': { component: Feather, name: 'chevron-right' },
  'chevron-down': { component: Feather, name: 'chevron-down' },
  'chevron-up': { component: Feather, name: 'chevron-up' },
  'arrow-forward': { component: Feather, name: 'arrow-right' },
  'arrow-up': { component: Feather, name: 'arrow-up' },
  'arrow-down': { component: Feather, name: 'arrow-down' },
  'ellipsis-horizontal': { component: Feather, name: 'more-horizontal' },

  // Date / time
  'calendar-outline': { component: Feather, name: 'calendar' },
  calendar: { component: Feather, name: 'calendar' },
  'time-outline': { component: Feather, name: 'clock' },
  time: { component: Feather, name: 'clock' },
  'hourglass-outline': { component: Feather, name: 'clock' },

  // Payment / wallet
  'card-outline': { component: Feather, name: 'credit-card' },
  card: { component: Feather, name: 'credit-card' },
  wallet: { component: FontAwesome5, name: 'wallet' },
  cash: { component: Feather, name: 'dollar-sign' },
  'logo-paypal': { component: FontAwesome, name: 'paypal' },

  // Status / selection
  'checkmark-circle': { component: Feather, name: 'check-circle' },

  // Media & communication
  'mic-outline': { component: Feather, name: 'mic' },
  'mic-off-outline': { component: Feather, name: 'mic-off' },
  'videocam': { component: Feather, name: 'video' },
  'videocam-outline': { component: Feather, name: 'video' },
  'videocam-off-outline': { component: Feather, name: 'video-off' },
  'camera-reverse-outline': { component: Feather, name: 'refresh-ccw' },
  chatbubble: { component: Feather, name: 'message-circle' },
  'chatbubble-ellipses': { component: Feather, name: 'message-circle' },
  'chatbubbles-outline': { component: Feather, name: 'message-circle' },
  'chatbubble-ellipses-outline': { component: Feather, name: 'message-circle' },

  // System / app actions
  'search-outline': { component: Feather, name: 'search' },
  'options-outline': { component: Feather, name: 'sliders' },
  notifications: { component: Feather, name: 'bell' },
  'notifications-outline': { component: Feather, name: 'bell' },
  'log-out-outline': { component: Feather, name: 'log-out' },
  'help-circle-outline': { component: Feather, name: 'help-circle' },
  'information-circle-outline': { component: Feather, name: 'info' },
  'information-circle': { component: Feather, name: 'info' },
  'add-outline': { component: Feather, name: 'plus-circle' },
  'create-outline': { component: Feather, name: 'plus-circle' },
  add: { component: Feather, name: 'plus' },
  send: { component: Feather, name: 'send' },
  'download-outline': { component: Feather, name: 'download' },

  // Documents
  'document-text-outline': { component: Feather, name: 'file-text' },
  'document-text': { component: Feather, name: 'file-text' },

  // Tab bar / home / grid
  home: { component: Feather, name: 'home' },
  'home-outline': { component: Feather, name: 'home' },
  grid: { component: Feather, name: 'grid' },
  'grid-outline': { component: Feather, name: 'grid' },

  // People
  person: { component: Feather, name: 'user' },
  'person-outline': { component: Feather, name: 'user' },
  'person-circle-outline': { component: Feather, name: 'user' },
  call: { component: Feather, name: 'phone' },
  'call-outline': { component: Feather, name: 'phone' },
  'location-outline': { component: Feather, name: 'map-pin' },

  // Chat (tab bar)
  chatbubbles: { component: Feather, name: 'message-circle' },

  // Ratings
  star: { component: FontAwesome, name: 'star' },

  // Charts / stats
  'trending-up-outline': { component: Feather, name: 'trending-up' },
  'trending-up': { component: Feather, name: 'trending-up' },
  'trending-down-outline': { component: Feather, name: 'trending-down' },
};

// Map MaterialCommunityIcons names to Feather/FontAwesome (we don't use MaterialCommunityIcons)
const materialCommunityToOther = {
  email: { component: Feather, name: 'mail' },
  'lock-outline': { component: Feather, name: 'lock' },
  lock: { component: Feather, name: 'lock' },
  'eye-outline': { component: Feather, name: 'eye' },
  'eye-off-outline': { component: Feather, name: 'eye-off' },
  calendar: { component: Feather, name: 'calendar' },
  clock: { component: Feather, name: 'clock' },
  'credit-card-outline': { component: Feather, name: 'credit-card' },
  'file-document-outline': { component: Feather, name: 'file-text' },
  video: { component: Feather, name: 'video' },
  'message-text-outline': { component: Feather, name: 'message-circle' },
  'wallet-outline': { component: FontAwesome5, name: 'wallet' },
};

const CustomIcon = ({ name, size, color, onPress, label, iconType = 'FontAwesome', style, touchable = true }) => {
  let IconComponent;
  let iconName = name;

  if (iconType === 'Ionicons') {
    const mapped = ioniconsToOther[name];
    if (mapped) {
      IconComponent = mapped.component;
      iconName = mapped.name;
    } else {
      IconComponent = Feather;
    }
  } else if (iconType === 'MaterialCommunityIcons') {
    const mapped = materialCommunityToOther[name];
    if (mapped) {
      IconComponent = mapped.component;
      iconName = mapped.name;
    } else {
      IconComponent = Feather;
    }
  } else {
    switch (iconType) {
      case 'MaterialIcons':
        IconComponent = MaterialIcons;
        break;
      case 'AntDesign':
        IconComponent = AntDesign;
        break;
      case 'Entypo':
        IconComponent = Entypo;
        break;
      case 'Feather':
        IconComponent = Feather;
        break;
      case 'FontAwesome5':
        IconComponent = FontAwesome5;
        break;
      case 'Fontisto':
        IconComponent = Fontisto;
        break;
      case 'FontAwesome':
      default:
        IconComponent = FontAwesome;
        break;
    }
  }

  const iconElement = (
    <>
      <IconComponent name={iconName} size={size || 24} color={color || 'black'} />
      {label && <Text style={{ fontSize: 12 }}>{label}</Text>}
    </>
  );

  if (touchable) {
    return (
      <TouchableOpacity
        style={[styles.iconContainer, style]}
        onPress={onPress}
        activeOpacity={onPress ? 0.6 : 1}
        disabled={!onPress}
      >
        {iconElement}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.iconContainer, style]}>
      {iconElement}
    </View>
  );
};

const styles = StyleSheet.create({
    iconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontSize: 12,
      textAlign: 'center',
    },
  });
  

export default CustomIcon;
