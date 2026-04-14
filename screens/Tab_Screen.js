import React, {Component} from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Alert,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  BackHandler,
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
 

import Home from './Home';
import All_Items from './All_Items';
import  Chat from './Chat';
import User_Profile from './User_Profile';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Feather from 'react-native-vector-icons/Feather';

const Tab = createBottomTabNavigator();

const getIconComponent = iconType => {
  switch (iconType) {
    case 'FontAwesome5':
      return FontAwesome5;
    case 'Entypo':
      return Entypo;
    case 'MaterialCommunityIcons':
      return MaterialCommunityIcons;
    case 'Fontisto':
      return Fontisto;
    case 'Feather':
      return Feather;
    default:
      return FontAwesome5; // Fallback icon type
  }
};

class Patient_Tab_Screen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {selectedbtn: '1', name: '', id: ''};
  }

  backAction = () => {
    BackHandler.exitApp();
    return true;
  };

  componentWillUnmount() {
    this.backHandler.remove();
  }

  componentDidMount = async () => {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backAction,
    );


  };

  render() {
    return (
      <Tab.Navigator
        initialRouteName="Home"
        backBehavior="Home"
        screenOptions={({route}) => {
          let iconName, iconType;

          if (route.name === 'Home') {
            iconName = 'home';
            iconType = 'Entypo';
          } else if (route.name === 'Requests') {
            iconName = 'clipboard-list';
            iconType = 'FontAwesome5';
          } else if (route.name === 'Chat') {
            iconName = 'chat';
            iconType = 'Entypo';
          } 
        
          else if (route.name === 'Setting') {
            iconName = 'settings';
            iconType = 'Feather';
          }

          // Get the correct Icon component based on iconType
          const IconComponent = getIconComponent(iconType);

          return {
            tabBarIcon: ({color, size}) => (
              <IconComponent
                name={iconName}
                size={size || 24}
                color={color || 'black'}
              />
            ),
            tabBarActiveTintColor: '#5B0001',
            tabBarInactiveTintColor: 'lightgray',
            // unmountOnBlur: true,
          };
        }}>
        <Tab.Screen
          name="Home"
          component={Home}
          options={{headerShown: false}}
          // options={{ tabBarLabel: "Home" }}
        />
        <Tab.Screen
          name="Requests"
          component={All_Items}
          options={{headerShown: false}}
          // options={{ tabBarLabel: "Wallet" }}
        />
        <Tab.Screen
          name="Chat"
          component={Chat}
          options={{headerShown: false}}
          // options={{ tabBarLabel: "Orders" }}
        />
    
        <Tab.Screen
          name="Setting"
          component={User_Profile}
          options={{headerShown: false}}

          // options={{ tabBarLabel: "Profile" }}
        />
      </Tab.Navigator>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },

  inactiveicone: {
    color: 'lightgray',
    fontSize: 22,
  },
  activeicone: {
    color: '#5B0001',
    fontSize: 25,
  },
  footer: {
    backgroundColor: 'white',
    paddingVertical: 3,
  },
  icon: {
    marginTop: 5,
    marginLeft: 10,
    fontSize: 40,
    color: 'white',
  },
  name: {
    alignSelf: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 50,
    color: 'white',
  },

  inactiveText: {
    color: 'lightgray',
    fontSize: 11,
    // fontWeight: 'bold',

    maxWidth: '100%',
  },
  activeText: {
    color: '#5FB08D',
    fontSize: 11,
    maxWidth: '100%',
    // fontWeight: 'bold',
  },
});

export default Patient_Tab_Screen;
