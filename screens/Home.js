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
  ImageBackground,
  Dimensions,
  BackHandler,
  Pressable,
  FlatList,
} from 'react-native';
import CustomIcon from '../components/CustomIcon';
const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;
class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      spinner: false,
    };
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
      <View style={{flex: 1, backgroundColor: '#f7f8fa'}}>
                <StatusBar backgroundColor="#5B0001" barStyle="light-content" />
        
        <ScrollView>
          <View
            style={{
              width: width,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 10,
              justifyContent: 'space-between',
            }}>
            <Image
              style={{width: 45, borderRadius: 100, height: 45}}
              source={require('../assets/person.webp')}
            />
            <View style={{width: '67%'}}>
              <Text style={{fontSize: 15, fontWeight: '500', color: 'black'}}>
                Tanzeel Qaiser. 
              </Text>
              <Text style={{fontSize: 12, fontWeight: '500', color: 'gray'}}>
                Narowal, Pakistan
              </Text>
            </View>

            <CustomIcon
              iconType="AntDesign"
              name="search1"
              size={22}
              color="black"
            />
            <CustomIcon
              iconType="FontAwesome"
              name="bell"
              size={22}
              color="black"
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              width: width / 1.1,
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              marginTop: 15,
            }}>
            <TouchableOpacity
              style={{
                width: width / 1.1,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 6,
                backgroundColor: 'white',
                borderColor: 'white',
                borderWidth: 1,
                height: 45,
                borderWidth: 1,
                borderColor: 'lightgray',
                elevation: 3,
              }}>
              <Text
                style={{
                  width: '100%',
                  alignSelf: 'center',
                  height: 45,
                  borderRadius: 8,
                  paddingLeft: 15,
                  color: 'black',
                  paddingLeft: 40,
                  marginTop: 25,
                }}>
                Search Items
              </Text>

              <CustomIcon
                iconType="AntDesign"
                name="search1"
                size={22}
                color="black"
                style={{fontSize: 25, position: 'absolute', left: 10}}
              />
            </TouchableOpacity>
          </TouchableOpacity>

          <View
            style={{
              width: width / 1.1,
              alignSelf: 'center',
              paddingHorizontal: 20,
              paddingVertical: 20,
              marginTop: 10,
              backgroundColor: '#5B0001',
              borderRadius: 8,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{width: '80%'}}>
                <Text style={{fontSize: 15, fontWeight: '600', color: 'white'}}>
                  Lost and Found
                </Text>
                <Text style={{fontSize: 12, fontWeight: '600', color: 'white'}}>
                  Lost something? Don’t worry, we’re here to help you find it!
                </Text>
              </View>

              {/* <Image
              style={{width: 60, height: 60}}
              source={require('../assets/idea.png')}
            /> */}
            </View>

            <View
              style={{
                width: '98%',
                alignSelf: 'center',
                paddingVertical: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#CDB071',
                borderRadius: 8,
                marginTop: 15,
              }}>
              <Text style={{fontSize: 15, fontWeight: '600', color: 'black'}}>
                Request
              </Text>
            </View>
          </View>

          <View
            style={{
              width: width / 1.1,
              alignSelf: 'center',
              marginTop: 15,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: 'black'}}>
              Categories
            </Text>
            <Text style={{fontSize: 13, fontWeight: 'bold', color: '#5B0001'}}>
              View all
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
              width: width / 1.1,
              alignSelf: 'center',
            }}>
            <TouchableOpacity
              style={{
                paddingVertical: 5,
                paddingHorizontal: 10,
                flexDirection: 'row',
                alignItems: 'center',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                borderRadius: 12,
                marginLeft: 10,
                marginTop: 10,
                backgroundColor: 'white',
              }}>
              <Image
                style={{
                  width: 20,
                  height: 20,
                  alignSelf: 'center',
                  tintColor: '#5B0001',
                }}
                resizeMode="contain"
                source={require('../assets/belongings.png')}
              />
              <Text style={{fontSize: 14, color: 'black', marginLeft: 7}}>
                Personal Belongings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                paddingVertical: 5,
                paddingHorizontal: 10,
                flexDirection: 'row',
                alignItems: 'center',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                borderRadius: 12,
                marginLeft: 10,
                marginTop: 10,
                backgroundColor: 'white',
              }}>
              <Image
                style={{
                  width: 20,
                  height: 20,
                  alignSelf: 'center',
                  tintColor: '#5B0001',
                }}
                resizeMode="contain"
                source={require('../assets/clothes.png')}
              />
              <Text style={{fontSize: 14, color: 'black', marginLeft: 7}}>
                Clothes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                paddingVertical: 5,
                paddingHorizontal: 10,
                flexDirection: 'row',
                alignItems: 'center',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                borderRadius: 12,
                marginLeft: 10,
                marginTop: 10,
                backgroundColor: 'white',
              }}>
              <Image
                style={{
                  width: 20,
                  height: 20,
                  alignSelf: 'center',
                  tintColor: '#5B0001',
                }}
                resizeMode="contain"
                source={require('../assets/responsive.png')}
              />
              <Text style={{fontSize: 14, color: 'black', marginLeft: 7}}>
                Electronics
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                paddingVertical: 5,
                paddingHorizontal: 10,
                flexDirection: 'row',
                alignItems: 'center',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                borderRadius: 12,
                marginLeft: 10,
                marginTop: 10,
                backgroundColor: 'white',
              }}>
              <Image
                style={{
                  width: 20,
                  height: 20,
                  alignSelf: 'center',
                  tintColor: '#5B0001',
                }}
                resizeMode="contain"
                source={require('../assets/money.png')}
              />
              <Text style={{fontSize: 14, color: 'black', marginLeft: 7}}>
                Money
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                paddingVertical: 5,
                paddingHorizontal: 10,
                flexDirection: 'row',
                alignItems: 'center',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                borderRadius: 12,
                marginLeft: 10,
                marginTop: 10,
                backgroundColor: 'white',
              }}>
              <Image
                style={{
                  width: 20,
                  height: 20,
                  alignSelf: 'center',
                  tintColor: '#5B0001',
                }}
                resizeMode="contain"
                source={require('../assets/school_bag.png')}
              />
              <Text style={{fontSize: 14, color: 'black', marginLeft: 7}}>
                Stationery
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            style={{
              marginLeft: 25,
              fontSize: 18,
              fontWeight: 'bold',
              color: 'black',
              marginTop: 15,
            }}>
            Recent Requests
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 10,
              width: width / 1.1,
              alignSelf: 'center',
              shadowOffset: {width: 1, height: 1},
              shadowOpacity: 0,
              shadowRadius: 1,
              elevation: 3,
              backgroundColor: 'white',
              paddingVertical: 10,
              marginBottom: 5,
              paddingHorizontal: 10,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '60%',
              }}>
              <Image
                style={{width: 50, height: 50, borderRadius: 15}}
                source={require('../assets/person.webp')}
              />

              <View style={{marginLeft: 10, width: '70%'}}>
                <Text
                  allowFontScaling={false}
                  numberOfLines={1}
                  style={{
                    color: 'black',
                    fontSize: 15,
                    maxWidth: '100%',
                  }}>
                  Akbar Ali
                </Text>
                <Text
                  allowFontScaling={false}
                  numberOfLines={2}
                  style={{
                    color: 'gray',
                    fontSize: 14,
                    maxWidth: '100%',
                  }}>
                  Lost Wallet
                </Text>
              </View>
            </View>

            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: '40%',
                paddingBottom: 10,
              }}>
              <Text
                allowFontScaling={false}
                style={{fontSize: 12, color: '#565759'}}>
                10-05-2023
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 10,
              width: width / 1.1,
              alignSelf: 'center',
              shadowOffset: {width: 1, height: 1},
              shadowOpacity: 0,
              shadowRadius: 1,
              elevation: 3,
              backgroundColor: 'white',
              paddingVertical: 10,
              marginBottom: 5,
              paddingHorizontal: 10,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '60%',
              }}>
              <Image
                style={{width: 50, height: 50, borderRadius: 15}}
                source={require('../assets/person.webp')}
              />

              <View style={{marginLeft: 10, width: '70%'}}>
                <Text
                  allowFontScaling={false}
                  numberOfLines={1}
                  style={{
                    color: 'black',
                    fontSize: 15,
                    maxWidth: '100%',
                  }}>
                  Akbar Ali
                </Text>
                <Text
                  allowFontScaling={false}
                  numberOfLines={2}
                  style={{
                    color: 'gray',
                    fontSize: 14,
                    maxWidth: '100%',
                  }}>
                  Lost Wallet
                </Text>
              </View>
            </View>

            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: '40%',
                paddingBottom: 10,
              }}>
              <Text
                allowFontScaling={false}
                style={{fontSize: 12, color: '#565759'}}>
                10-05-2023
              </Text>
            </View>
          </View>

          <View style={{marginTop: 40}}></View>
        </ScrollView>
      </View>
    );
  }
}

export default Home;
