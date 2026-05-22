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
  Dimensions,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import CustomIcon from '../components/CustomIcon';
import LinearGradient from 'react-native-linear-gradient';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

class Login_Screen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      passhide: true,
      spinner: false,
      role: 'patient',
      email: '',
      password: '',
    };
  }

  backAction = () => {
    this.props.navigation.exitApp();
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

  seePassword = () => {
    this.setState({
      passhide: !this.state.passhide,
    });
  };

  render() {
    const isPatient = this.state.role === 'patient';
    
    return (
      <View style={{flex: 1, backgroundColor: '#f4f6fc'}}>
        <StatusBar backgroundColor="#370000" barStyle="light-content" />

        <View style={styles.headerHero}>
          <Image
            source={require('../assets/hero.jpeg')}
            style={styles.heroImage}
            resizeMode="contain"
          />
          <CustomIcon
            iconType="AntDesign"
            name="left"
            size={25}
            color="#CDB071"
            style={{position: 'absolute', top: 40, left: 20}}
            onPress={() => this.props.navigation.pop()}
          />
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text allowFontScaling={false} style={styles.headerTitle}>
            Welcome Back
          </Text>
          <Text allowFontScaling={false} style={styles.headerSubtitle}>
            Please sign in to continue
          </Text>
        </View>

        <KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
          <ScrollView contentContainerStyle={{paddingBottom: 40}}>
            <View style={{paddingHorizontal: 20, marginTop: 30}}>
              
              {/* Role Tabs */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => this.setState({role: 'patient'})}
                  style={[styles.tabButton, isPatient && styles.tabButtonActive]}>
                  <Text allowFontScaling={false} style={[styles.tabText, isPatient && styles.tabTextActive]}>
                    Patient
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => this.setState({role: 'therapist'})}
                  style={[styles.tabButton, !isPatient && styles.tabButtonActive]}>
                  <Text allowFontScaling={false} style={[styles.tabText, !isPatient && styles.tabTextActive]}>
                    Therapist
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Inputs */}
              <View style={styles.inputWrapper}>
                <CustomIcon iconType="MaterialCommunityIcons" name="email-outline" size={24} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  allowFontScaling={false}
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#94a3b8"
                  value={this.state.email}
                  onChangeText={email => this.setState({email})}
                />
              </View>

              <View style={styles.inputWrapper}>
                <CustomIcon iconType="MaterialCommunityIcons" name="lock-outline" size={24} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  allowFontScaling={false}
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={this.state.passhide}
                  value={this.state.password}
                  onChangeText={password => this.setState({password})}
                />
                <CustomIcon
                  iconType="Entypo"
                  name={this.state.passhide ? "eye-with-line" : "eye"}
                  size={22}
                  color="#64748b"
                  style={{padding: 10}}
                  onPress={this.seePassword}
                />
              </View>

              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity activeOpacity={0.8}>
                  <Text allowFontScaling={false} style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity activeOpacity={0.8} style={styles.loginBtn}>
                <Text allowFontScaling={false} style={styles.loginBtnText}>
                  Sign In
                </Text>
              </TouchableOpacity>

              <View style={styles.signupContainer}>
                <Text allowFontScaling={false} style={styles.signupText}>
                  Don't have an account?{' '}
                </Text>
                <TouchableOpacity activeOpacity={0.8}>
                  {/* // onPress={() => this.props.navigation.navigate('Doctor_Signup')} */}
                  <Text allowFontScaling={false} style={styles.signupLink}>
                    Sign up
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerHero: {
    width: width,
    height: height / 2.5,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    backgroundColor: '#f4f6fc',
    shadowColor: '#370000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  logo: {
    width: 100,
    height: 100,
  },
  headerTitle: {
    color: '#CDB071',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 15,
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: '#e0c99a',
    fontSize: 15,
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    color: '#64748b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#5B0001',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 15,
    height: 55,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#0f172a',
    fontSize: 16,
    height: '100%',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 30,
    marginTop: 10,
  },
  forgotPasswordText: {
    color: '#5B0001',
    fontWeight: '600',
    fontSize: 14,
  },
  loginBtn: {
    backgroundColor: '#5B0001',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5B0001',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  loginBtnText: {
    color: '#CDB071',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  signupText: {
    color: '#64748b',
    fontSize: 15,
  },
  signupLink: {
    color: '#5B0001',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default Login_Screen;
