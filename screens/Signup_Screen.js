import React, {Component} from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import CustomIcon from '../components/CustomIcon';
import {CountryPicker} from 'react-native-country-codes-picker';
import RBSheet from 'react-native-raw-bottom-sheet';
import {COLORS, SPACING, RADIUS} from '../constants/theme';

const {width} = Dimensions.get('screen');

const INPUT_BORDER = '#E0E0E0';
const INPUT_BG = '#FAFAFA';
const PRIMARY = '#5B0001';

class Signup_Screen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fullName: '',
      email: '',
      phoneNumber: '',
      address: '',
      password: '',
      confirmPassword: '',
      placeholder: '+234',
      department: '',
      smester: '',
      show2: false,
      show: false,
      dob: 'Date of Birth',
      gender: 'Select Gender',
      age: '',
    };
  }

  backAction = () => {
    this.props.navigation.pop();
    return true;
  };

  componentWillUnmount() {
    this.backHandler?.remove();
  }

  componentDidMount = async () => {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backAction,
    );
  };

  setCountryCode = val => {
    this.setState({
      show2: false,
      placeholder: val.dial_code,
      country: val.name.en,
    });
  };

  Sign_Up = async () => {
    const {fullName, email, address, age} = this.state;
    const api = 'http://192.168.0.123:3000/tanzeel/practice/user/signup';
    const payload = {name: fullName, email, address, age};

    try {
      const response = await fetch(api, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
      const responseData = await response.json();

      if (response.ok && responseData.success) {
        alert('Account saved successfully!');
      } else {
        alert(responseData.message || 'Account creation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      this.setState({spinner: false});
    }
  };

  show_country = () => this.setState({show2: true});

  select_gender = val => {
    this.setState({gender: val});
    this.RBSheet5?.close();
  };

  render() {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Enter your details to get started</Text>

            <View style={styles.form}>
              <TextInput
                allowFontScaling={false}
                value={this.state.fullName}
                onChangeText={fullName => this.setState({fullName})}
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={COLORS.gray500}
                autoCapitalize="words"
              />
              <TextInput
                allowFontScaling={false}
                value={this.state.email}
                onChangeText={email => this.setState({email})}
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.gray500}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                allowFontScaling={false}
                value={this.state.age}
                onChangeText={age => this.setState({age})}
                style={styles.input}
                placeholder="Age"
                placeholderTextColor={COLORS.gray500}
                keyboardType="number-pad"
              />
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.inputTouchable}
                onPress={() => this.RBSheet5?.open()}>
                <Text
                  style={[
                    styles.inputTouchableText,
                    this.state.gender === 'Select Gender' && styles.placeholderText,
                  ]}>
                  {this.state.gender}
                </Text>
              </TouchableOpacity>

              <View style={styles.phoneRow}>
                <CountryPicker
                  show={this.state.show2}
                  pickerButtonOnPress={item => this.setCountryCode(item)}
                  androidWindowSoftInputMode={false}
                  inputPlaceholder="Search"
                  style={{
                    countryName: {color: '#000'},
                    dialCode: {color: '#000'},
                    modal: {height: 400},
                    textInput: {height: 48, borderRadius: 0, color: '#000'},
                    countryButtonStyles: {height: 48, color: '#000'},
                  }}
                />
                <TouchableOpacity
                  onPress={this.show_country}
                  style={styles.countryCodeBtn}>
                  <Text style={styles.countryCodeText}>{this.state.placeholder}</Text>
                </TouchableOpacity>
                <TextInput
                  allowFontScaling={false}
                  value={this.state.phoneNumber}
                  onChangeText={phoneNumber => this.setState({phoneNumber})}
                  style={styles.phoneInput}
                  placeholder="Phone number"
                  placeholderTextColor={COLORS.gray500}
                  keyboardType="phone-pad"
                />
                <CustomIcon
                  iconType="FontAwesome"
                  name="phone"
                  size={18}
                  color={COLORS.gray500}
                  style={styles.phoneIcon}
                />
              </View>

              <View style={styles.inputWrap}>
                <TextInput
                  allowFontScaling={false}
                  value={this.state.address}
                  onChangeText={address => this.setState({address})}
                  style={styles.input}
                  placeholder="Address"
                  placeholderTextColor={COLORS.gray500}
                />
                <CustomIcon
                  iconType="Entypo"
                  name="location-pin"
                  size={20}
                  color={PRIMARY}
                  style={styles.inputIcon}
                />
              </View>

              <TextInput
                allowFontScaling={false}
                value={this.state.department}
                onChangeText={department => this.setState({department})}
                style={styles.input}
                placeholder="Department"
                placeholderTextColor={COLORS.gray500}
              />
              <TextInput
                allowFontScaling={false}
                value={this.state.smester}
                onChangeText={smester => this.setState({smester})}
                style={styles.input}
                placeholder="Semester"
                placeholderTextColor={COLORS.gray500}
                keyboardType="numeric"
              />
              <TextInput
                allowFontScaling={false}
                value={this.state.password}
                onChangeText={password => this.setState({password})}
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.gray500}
                secureTextEntry
              />
              <TextInput
                allowFontScaling={false}
                value={this.state.confirmPassword}
                onChangeText={confirmPassword => this.setState({confirmPassword})}
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={COLORS.gray500}
                secureTextEntry
              />

              <TouchableOpacity
                onPress={this.Sign_Up}
                activeOpacity={0.85}
                style={styles.registerBtn}>
                <Text style={styles.registerBtnText}>Register</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('Login_Screen')}
              activeOpacity={0.8}
              style={styles.signInRow}>
              <Text style={styles.signInLabel}>Already have an account? </Text>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </KeyboardAvoidingView>

        <RBSheet
          ref={ref => (this.RBSheet5 = ref)}
          height={120}
          openDuration={120}
          customStyles={{container: {paddingHorizontal: 20}}}>
          <TouchableOpacity onPress={() => this.select_gender('male')} activeOpacity={0.8}>
            <Text style={styles.sheetOption}>Male</Text>
          </TouchableOpacity>
          <View style={styles.sheetDivider} />
          <TouchableOpacity onPress={() => this.select_gender('female')} activeOpacity={0.8}>
            <Text style={styles.sheetOption}>Female</Text>
          </TouchableOpacity>
        </RBSheet>

        <RBSheet
          ref={ref => (this.RBSheet1 = ref)}
          height={230}
          openDuration={200}
          customStyles={{container: {paddingHorizontal: 20}}}>
          <Text style={styles.sheetTitle}>Choose an action</Text>
          <View style={styles.sheetActions}>
            <TouchableOpacity activeOpacity={0.6} style={styles.sheetAction}>
              <CustomIcon iconType="Entypo" name="images" size={30} color={PRIMARY} />
              <Text style={styles.sheetActionText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.6} style={styles.sheetAction}>
              <CustomIcon iconType="Entypo" name="camera" size={30} color={PRIMARY} />
              <Text style={styles.sheetActionText}>Camera</Text>
            </TouchableOpacity>
          </View>
        </RBSheet>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  title: {
    color: PRIMARY,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.gray500,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 6,
  },
  form: {
    marginTop: SPACING.xl,
  },
  input: {
    height: 52,
    backgroundColor: INPUT_BG,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  inputTouchable: {
    height: 52,
    backgroundColor: INPUT_BG,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  inputTouchableText: {
    fontSize: 16,
    color: COLORS.gray900,
  },
  placeholderText: {
    color: COLORS.gray500,
  },
  inputWrap: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  inputIcon: {
    position: 'absolute',
    right: 14,
    top: 16,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: INPUT_BG,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    paddingRight: 40,
    marginBottom: SPACING.md,
  },
  countryCodeBtn: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    height: '100%',
  },
  countryCodeText: {
    fontSize: 16,
    color: COLORS.gray900,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    paddingLeft: 4,
    fontSize: 16,
    color: COLORS.gray900,
  },
  phoneIcon: {
    position: 'absolute',
    right: 14,
  },
  registerBtn: {
    height: 52,
    backgroundColor: PRIMARY,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  registerBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  signInLabel: {
    fontSize: 15,
    color: COLORS.gray600,
  },
  signInLink: {
    fontSize: 15,
    color: PRIMARY,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
  sheetOption: {
    fontSize: 18,
    color: COLORS.gray900,
    textAlign: 'center',
    marginTop: 20,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginTop: 10,
  },
  sheetTitle: {
    fontSize: 18,
    color: PRIMARY,
    marginTop: 20,
  },
  sheetActions: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 40,
  },
  sheetAction: {
    alignItems: 'center',
  },
  sheetActionText: {
    fontSize: 16,
    color: PRIMARY,
    marginTop: 8,
  },
});

export default Signup_Screen;
