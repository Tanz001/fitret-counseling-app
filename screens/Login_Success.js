import React, {Component} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  AsyncStorage,
  ImageBackground,
  Dimensions,
  BackHandler,
} from 'react-native';
import CustomIcon from '../components/CustomIcon';
const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;
class Login_Success extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      
    };
  }

  backAction = () => {
    this.props.navigation.pop();
    return true;
  };

  render() {
    return (
      <>
        <StatusBar backgroundColor="#5B0001" barStyle="light-content" />

        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#5B0001',
          }}>
          <Image
            style={{width: 130, height: 130, tintColor: '#CDB071'}}
            source={require('../assets/success.png')}
          />
          <Text
            style={{
              color: 'white',
              marginTop: 25,
              paddingHorizontal: 15,
              textAlign: 'center',
              fontSize: 18,
              fontWeight: '600',
            }}>
            Welcome Tanzeel Qaiser!
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => this.props.navigation.navigate('Login_Screen')}
            style={{
              width: width / 1.1,
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 10,
              borderRadius: 6,
              backgroundColor: '#CDB071',
              position: 'absolute',
              bottom: 10,
            }}>
            <Text
              style={{
                color: 'white',
                fontSize: 15,
                fontWeight: '600',
              }}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  textage: {
    width: '80%',
    height: '80%',
  },
});

export default Login_Success;
