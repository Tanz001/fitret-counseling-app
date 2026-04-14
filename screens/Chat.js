import React, {Component} from 'react';
import {
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  SafeAreaView,
  ImageBackground,
  TextInput,
  Dimensions,
  View,
  BackHandler,
  TouchableOpacity,
  Text,
  FlatList,
} from 'react-native';
import CustomIcon from '../components/CustomIcon';
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  backAction = () => {
    this.props.navigation.pop();

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
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <StatusBar backgroundColor="white" barStyle="light-content" />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 15,
            paddingVertical: 15,
            backgroundColor: 'white',
            borderBottomWidth: 1,
            borderBottomColor: 'lightgray',
          }}>
          <Text
            allowFontScaling={false}
            style={{color: '#032644', fontSize: 20}}>
            Inbox
          </Text>

          <Text></Text>
        </View>

        <ScrollView>
          <View
            style={{
              width: width / 1.1,
              height: 50,
              alignItems: 'center',
              alignSelf: 'center',
              marginTop: 25,
            }}>
            <TextInput
              allowFontScaling={false}
              value={this.state.email}
              onChangeText={email => this.setState({email})}
              style={styles.input}
              placeholder="Search Chats"
              placeholderTextColor="gray"
            />

            <CustomIcon
              iconType="FontAwesome"
              name="search"
              size={24}
              color="lightgray"
              style={{position: 'absolute', left: 10, top: 11}}
            />
          </View>

          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('Chatroom')}
            activeOpacity={0.8}
            style={{
              paddingVertical: 10,
              marginTop: 10,
              paddingHorizontal: 10,
              alignSelf: 'center',
              flexDirection: 'row',
              marginBottom: 10,
              width: width / 1.1,
              backgroundColor: 'white',
              borderRadius: 8,
              marginLeft: 7,
              justifyContent: 'space-between',
              borderBottomColor: 'lightgray',
              borderBottomWidth: 1,
            }}>
            <Image
              style={{width: 50, height: 50, borderRadius: 40}}
              source={require('../assets/person.webp')}
            />

            <View style={{width: '85%'}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '90%',
                  alignSelf: 'center',
                }}>
                <View>
                  <Text
                    style={{color: 'black', fontSize: 14, fontWeight: 'bold'}}>
                    ane Fernandes Dcosta
                  </Text>
                  <Text
                    style={{fontSize: 12, color: 'gray', maxWidth: '92%'}}
                    numberOfLines={2}>
                    Thanks Lawyer
                  </Text>
                </View>
                <Text style={{color: 'gray', fontSize: 10, fontWeight: 'bold'}}>
                  09:00 AM
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Actions.Chatroom()}
            activeOpacity={0.8}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 10,
              alignSelf: 'center',
              flexDirection: 'row',
              marginBottom: 10,
              width: width / 1.1,
              backgroundColor: 'white',
              borderRadius: 8,
              marginLeft: 7,
              justifyContent: 'space-between',
              borderBottomColor: 'lightgray',
              borderBottomWidth: 1,
            }}>
            <Image
              style={{width: 50, height: 50, borderRadius: 40}}
              source={require('../assets/person.webp')}
            />

            <View style={{width: '85%'}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '90%',
                  alignSelf: 'center',
                }}>
                <View>
                  <Text
                    style={{color: 'black', fontSize: 14, fontWeight: 'bold'}}>
                    Karima Dize
                  </Text>
                  <Text
                    style={{fontSize: 12, color: 'gray', maxWidth: '100%'}}
                    numberOfLines={2}>
                    How are you???
                  </Text>
                </View>
                <Text style={{color: 'gray', fontSize: 10, fontWeight: 'bold'}}>
                  09:00 AM
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    width: width / 1.1,
    height: 45,
    backgroundColor: 'white',
    paddingLeft: 40,
    paddingRight: 20,
    alignSelf: 'center',
    color: 'black',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'lightgray',
  },
});

export default Chat;
