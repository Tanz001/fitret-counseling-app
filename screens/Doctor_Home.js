
import React, { Component } from 'react';
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
  AppState,
  Platform,
  FlatList
} from 'react-native';
import RBSheet from "react-native-raw-bottom-sheet";
import CustomIcon from '../components/CustomIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageLoad from 'react-native-image-placeholder';
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
 
import Connection from "../connection";
import { supabase } from '../utils/supabase';
import moment from 'moment';
 
const width = Dimensions.get('screen').width
const height = Dimensions.get('screen').height


class Doctor_Home extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      data1: [],
      skalton: false,
      doctor_profile: null,
      first_name: '',
      last_name: '',
      address: ''
    }
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
    let user = await AsyncStorage.getItem('user');

    console.log("userrrrrrrrr", user);
    let parsed = JSON.parse(user);
    if (parsed && parsed[0]) {
        let first_name = parsed[0].first_name;
        let last_name = parsed[0].last_name;
        let id = parsed[0].id;
        let address = parsed[0].address;
        let email = parsed[0].email;
        let phone_number = parsed[0].phonenumber;
        let profile = parsed[0].profile;

        if(profile != null) {
          let user_profile = profile.startsWith('http') ? profile : Connection + 'images/' + profile;
          this.setState({doctor_profile: user_profile})
        }

        this.setState({
          first_name: first_name,
          last_name: last_name,
          doctor_id: id,
          phone_number: phone_number,
          email: email,
          address: address,
        }, () => {
            this.get_active_appointments();
        });
    }
  };

  get_active_appointments = async () => {
    try {
      this.setState({ skalton: true });
      
      console.log('[DoctorHome] Fetching for doctor_id:', this.state.doctor_id);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:users!patient_id (
            full_name,
            profile_picture,
            address,
            phone
          )
        `)
        .eq('therapist_id', this.state.doctor_id)
        .eq('status', 'pending')
        .order('appointment_date', { ascending: true })
        .limit(5);

      if (error) {
        console.error('[DoctorHome] Error:', error);
        throw error;
      }

      console.log('[DoctorHome] Raw Dashboard Data:', JSON.stringify(data, null, 2));

      this.setState({
        data1: data || [],
        skalton: false
      });
    } catch (error) {
      console.error('Error fetching dashboard appointments:', error);
      this.setState({ data1: [], skalton: false });
    }
  };

  render() {
    const {
      doctor_profile,
      first_name,
      last_name,
      address,
      data1,
      skalton
    } = this.state;

    const imageSource = doctor_profile 
      ? { uri: doctor_profile }
      : require('../assets/empty.png');

    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <StatusBar backgroundColor="white" barStyle="dark-content" />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: width / 1.1,
            alignSelf: 'center',
            paddingVertical: 10,
          }}>
          <View
            style={{
              justifyContent: 'space-between',
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center'
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
               <ImageLoad
                 style={{width: 40, borderRadius: 100, height: 40}}
                 loadingStyle={{size: 'large', color: 'blue'}}
                 source={imageSource}
                 borderRadius={100}
                 placeholderStyle={{width: 40, borderRadius: 100, height: 40}}
               />
               <Text
                 style={{
                   fontWeight: 'bold',
                   fontSize: 17,
                   marginLeft: 10,
                 }}>
                 Hello, Doctor {first_name} {last_name}
               </Text>
            </View>
            <CustomIcon
              iconType="Feather"
              name="bell"
              size={25}
              color="black"
            />
          </View>
        </View>
        
        <ScrollView>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingLeft: 15,
              marginTop: 10,
            }}>
            <CustomIcon
              iconType="Entypo"
              name="location-pin"
              size={23}
              color="#60606C"
            />
            <Text
              style={{
                color: '#60606C',
                fontSize: 16,
                fontWeight: '600',
                marginLeft: 7,
              }}>
              {address || 'Remote Office'}
            </Text>
            <CustomIcon
              iconType="AntDesign"
              name="down"
              size={23}
              color="#60606C"
              style={{marginLeft: 7}}
            />
          </View>

          <View>
            {skalton ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 15,
                }}>
                <SkeletonPlaceholder>
                  <View style={{ width: width / 1.3, height: 140, borderRadius: 8, marginHorizontal: 8 }} />
                </SkeletonPlaceholder>
                <SkeletonPlaceholder>
                  <View style={{ width: width / 1.3, height: 140, borderRadius: 8, marginHorizontal: 8 }} />
                </SkeletonPlaceholder>
              </View>
            ) : (
              <View>
                {data1.length === 0 ? (
                  <View
                    style={{
                      marginTop: 20,
                      width: width / 1.2,
                      alignSelf: 'center',
                      alignItems: 'center',
                      paddingVertical: 15,
                    }}>
                    <Text
                      style={{
                        color: '#032644',
                        fontWeight: '300',
                        fontSize: 16,
                      }}>
                      No active appointments found.
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    horizontal={true}  
                    showsHorizontalScrollIndicator={false}
                    data={data1}  
                    keyExtractor={(item) => item.id}   
                    renderItem={({ item }) => {
                      const patientRaw = item.patient;
                      const patient = Array.isArray(patientRaw) ? patientRaw[0] : (patientRaw || {});
                      const profileImage = patient.profile_picture 
                        ? { uri: patient.profile_picture } 
                        : require('../assets/empty.png');
                      
                      const dateLabel = moment(item.appointment_date).format('MMM D');
                      const user_name = patient.full_name || 'Patient';

                      return (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={{
                            width: width / 1.3,
                            alignSelf: 'center',
                            backgroundColor: 'white',
                            borderRadius: 12,
                            flexDirection: 'row',
                            paddingVertical: 15,
                            paddingHorizontal: 15,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 5,
                            marginTop: 20,
                            marginBottom: 10,
                            marginLeft: 15,
                          }}>
                          <View>
                            <ImageLoad
                              style={{ width: 60, height: 60 }}
                              loadingStyle={{size: 'large', color: 'blue'}}
                              source={profileImage}
                              borderRadius={30}
                              placeholderStyle={{ width: 60, height: 60 }}
                            />
                          </View>
                          <View style={{marginLeft: 12, flex: 1}}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                              <Text style={{color: 'black', fontSize: 16, fontWeight: 'bold'}} numberOfLines={1}>
                                {user_name}
                              </Text>
                            </View>

                            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                              <Text style={{color: '#60606C', fontSize: 12}}>Session</Text>
                              <View style={{
                                marginLeft: 8,
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                backgroundColor: '#E3F2FD',
                                borderRadius: 4,
                              }}>
                                <Text style={{color: '#1976D2', fontSize: 10, fontWeight: 'bold'}}>PENDING</Text>
                              </View>
                            </View>

                            <View style={{flexDirection: 'row', marginTop: 8}}>
                               <Text style={{color: 'black', fontSize: 12, fontWeight: '600'}}>{dateLabel}</Text>
                               <Text style={{color: 'black', fontSize: 12, marginLeft: 10}}>{item.appointment_time}</Text>
                            </View>

                            <TouchableOpacity
                              onPress={() =>
                                this.props.navigation.navigate('DoctorAppointmentDetail', { 
                                  appointment: {
                                    ...item,
                                    patient: patient,
                                    name: user_name,
                                    issue: item.notes || 'General Session',
                                    date: dateLabel,
                                    time: item.appointment_time,
                                    status: 'Pending',
                                    type: 'Video Call'
                                  } 
                                })
                              }
                              style={{
                                marginTop: 12,
                                paddingVertical: 6,
                                borderColor: '#159AB3',
                                borderRadius: 6,
                                borderWidth: 1,
                                alignItems: 'center',
                                width: '100%'
                              }}>
                              <Text style={{color: '#159AB3', fontSize: 12, fontWeight: 'bold'}}>View details</Text>
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}
              </View>
            )}
          </View>

          <Text style={{ fontSize: 18, marginTop: 25, fontWeight: '600', marginLeft: 20 }}>
            Dashboard
          </Text>

          {/* Dummy Stats (Can be expanded with real Supabase queries) */}
          {[
            { label: 'Total Pending Requests', val: '22', color: '#FF8651', icon: 'calendar-clock', iconType: 'MaterialCommunityIcons' },
            { label: 'Total Completed Appointments', val: '14', color: '#19B46E', icon: 'calendar-check', iconType: 'MaterialCommunityIcons' },
            { label: 'Total Cancel Appointments', val: '2', color: '#D91F11', icon: 'calendar-times', iconType: 'FontAwesome5' },
            { label: 'No of patients', val: '34', color: '#3085F4', icon: 'female', iconType: 'FontAwesome5' },
            { label: 'Total Earning', val: '$200,000', color: '#F5C518', icon: 'dollar', iconType: 'FontAwesome' },
          ].map((stat, i) => (
            <View key={i} style={{
              width: width / 1.1,
              flexDirection: 'row',
              backgroundColor: stat.color + '1A',
              alignSelf: 'center',
              borderRadius: 12,
              marginTop: 10,
              paddingVertical: 12,
              paddingHorizontal: 20,
              alignItems: 'center'
            }}>
              <View style={{
                width: 45, height: 45,
                backgroundColor: stat.color,
                borderRadius: 12,
                justifyContent: 'center',
                alignItems: 'center',
                }}>
                <CustomIcon iconType={stat.iconType} name={stat.icon} size={24} color="white" />
              </View>
              <View style={{marginLeft: 15}}>
                <Text style={{color: '#666', fontSize: 12}}>{stat.label}</Text>
                <Text style={{color: 'black', fontSize: 18, fontWeight: '700', marginTop: 2}}>{stat.val}</Text>
              </View>
            </View>
          ))}

          <View style={{marginBottom: 80}} />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  // Keeping styles minimal as most are inline
});

export default Doctor_Home;
