import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomIcon from '../components/CustomIcon';
import { FONTS, SPACING } from '../constants/theme';

const { height } = Dimensions.get('window');

const AuthWelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ── HERO IMAGE ── */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/hero.jpeg')}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Dark overlay for readability */}
        <View style={styles.overlay} />

        {/* LOGO */}

      </View>

      {/* Gradient transition */}
      <LinearGradient
        colors={['transparent', 'rgba(244,238,219,0.8)', '#f4eedb']}
        locations={[0, 0.6, 1]}
        style={styles.gradient}
        pointerEvents="none"
      />

      {/* ── CONTENT ── */}
      <View style={styles.content}>
        {/* <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo1.webp')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View> */}
        <Text style={styles.title}>Fitret</Text>
        <Text style={styles.subtitle}>Choose how you would like to continue</Text>

        {/* Therapist */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('AuthScreens', { authRole: 'therapist' })}
        >
          <View style={styles.iconWrap}>
            <CustomIcon name="briefcase" size={22} color="#4e8f7a" iconType="Feather" />
          </View>

          <View style={styles.textWrap}>
            <Text style={styles.cardTitle}>Therapist</Text>
            <Text style={styles.cardDesc}>Provide care & consultations</Text>
          </View>

          <CustomIcon name="chevron-right" size={20} color="#aaa" iconType="Feather" />
        </TouchableOpacity>

        {/* Client */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('AuthScreens', { authRole: 'patient' })}
        >
          <View style={styles.iconWrap}>
            <CustomIcon name="heart" size={22} color="#4e8f7a" iconType="Feather" />
          </View>

          <View style={styles.textWrap}>
            <Text style={styles.cardTitle}>Client</Text>
            <Text style={styles.cardDesc}>Get help & wellness support</Text>
          </View>

          <CustomIcon name="chevron-right" size={20} color="#aaa" iconType="Feather" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AuthWelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4eedb',
  },

  /* IMAGE */
  imageContainer: {
    height: height * 0.55,
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  /* LOGO */
  logoContainer: {
    // position: 'absolute',
    // top: Platform.OS === 'ios' ? 70 : 50,
    // left: 0,
    // right: 0,
    // alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },

  /* GRADIENT */
  gradient: {
    position: 'absolute',
    top: height * 0.35,
    left: 0,
    right: 0,
    height: height * 0.25,
  },

  /* CONTENT */
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    marginTop: -10,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2f2f2f',
    textAlign: 'center',
    marginTop: 15
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 28,
    fontSize: 14,
    color: '#6f9e8a',
    textAlign: 'center',
  },

  /* CARD */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'lightgray',

    // shadowColor: '#000',
    // shadowOpacity: 0.06,
    // shadowRadius: 10,
    // shadowOffset: { width: 0, height: 4 },
    // elevation: 3,
  },

  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#edf7f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  textWrap: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2f2f2f',
  },

  cardDesc: {
    fontSize: 13,
    color: '#7a8a86',
    marginTop: 2,
  },
});