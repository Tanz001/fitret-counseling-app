
import React, { Component } from 'react';
import moment from 'moment';

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
  Pressable,
  ToastAndroid,
  BackHandler
} from 'react-native';
import CustomIcon from '../components/CustomIcon';
import Dialog, { SlideAnimation, DialogContent, DialogFooter, DialogButton, DialogTitle } from 'react-native-popup-dialog';
 import Connection from "../connection";
import ImageLoad from 'react-native-image-placeholder';
 
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

const width = Dimensions.get('screen').width
const height = Dimensions.get('screen').height

class book_appointment extends React.Component {

  constructor(props) {

    super(props)


    this.state = {
      show: false,
      date1: new Date(),
      mode1: 'time',
      dateshow1: '',
      timeshow1: '',
      timeshow2: '',
      dateshow2: '',

      date_1: '',
      date_2: '',
      date_3: '',
      date_4: '',
      date_5: '',
      date_6: '',
      date_7: '',
      day_1: 'aa',
      day_2: '',
      day_3: '',
      day_4: '',
      day_5: '',
      day_6: '',
      day_7: '',
      appointment_date: this.props.final_date_1,



      arr: [],
      arr1: [],
      arr2: [],
      arr3: [],
      arr4: [],
      arr5: [],


      record1: [],
      record2: [],
      data4: [],
      monday1: [],
      tuesday1: [],
      wednesday1: [],
      thursday1: [],
      saturday1: [],
      friday1: [],
      sunday1: [],

      main_array: [],

      category: this.props.day_1,
      text1: 2,
      text2: 1,
      text3: 1,
      text4: 1,
      text5: 1,
      text6: 1,
      text7: 1,

      timeSelected: false,
      timeSelected1: false,
      add_new: false,


      show1: false,
      updated_time: '',
      value_for_updating_index: '',
      changes_time_for_specific_day: this.props.day_1,
      appointment_time: '',

      final_date: '',
      spinner: false,
      skalton: false


    }
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  componentWillMount() {
    BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackButtonClick
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      "hardwareBackPress",
      this.handleBackButtonClick
    );
  }
  onButtonPress = () => {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
    // then navigate
    navigate("NewScreen");
  };
  handleBackButtonClick() {
    // BackHandler.exitApp();
     this.props.navigation.pop()
    return true;
  }







  componentDidMount = async () => {
    let aa = moment(new Date()).format("YYYY-MM-DD hh:mm A");
    console.log('QQQQQQQQQQQQ,AA', aa)
    let split = aa.split(' ')
    let date = split[0]

    let time = split[1]
    let am_pm = split[2]
    let final_time = time + "" + am_pm


    this.setState({
      time: final_time,
      date: date
    })


    var today = new Date();

    var nextweek_T = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let date0 = nextweek_T.toString()
    let ddd = date0.split(' ')
    let day_1 = ddd[0]
    let dd_2 = ddd[1]
    let dd_3 = ddd[2]
    let dd_4 = ddd[3]


    let final_date_1 = dd_2 + ' ' + dd_3 + ', ' + dd_4


    var nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    let date1 = nextweek.toString()
    let ccc = date1.split(' ')
    let day_2 = ccc[0]
    let cc_2 = ccc[1]
    let cc_3 = ccc[2]
    let cc_4 = ccc[3]


    let final_date_2 = cc_2 + ' ' + cc_3 + ', ' + cc_4


    var nextweek1 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
    let date2 = nextweek1.toString()
    let eee = date2.split(' ')
    let day_3 = eee[0]
    let ee_2 = eee[1]
    let ee_3 = eee[2]
    let ee_4 = eee[3]


    let final_date_3 = ee_2 + ' ' + ee_3 + ', ' + ee_4


    var nextweek2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);
    let date3 = nextweek2.toString()
    let fff = date3.split(' ')
    let day_4 = fff[0]
    let ff_2 = fff[1]
    let ff_3 = fff[2]
    let ff_4 = fff[3]


    let final_date_4 = ff_2 + ' ' + ff_3 + ', ' + ff_4


    var nextweek3 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4);
    let date4 = nextweek3.toString()
    let ggg = date4.split(' ')
    let day_5 = ggg[0]
    let gg_2 = ggg[1]
    let gg_3 = ggg[2]
    let gg_4 = ggg[3]


    let final_date_5 = gg_2 + ' ' + gg_3 + ', ' + gg_4


    var nextweek4 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5);
    let date5 = nextweek4.toString()
    let hhh = date5.split(' ')
    let day_6 = hhh[0]
    let hh_2 = hhh[1]
    let hh_3 = hhh[2]
    let hh_4 = hhh[3]


    let final_date_6 = hh_2 + ' ' + hh_3 + ', ' + hh_4


    var nextweek5 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6);
    let date6 = nextweek5.toString()
    let iii = date6.split(' ')
    let day_7 = iii[0]
    let ii_2 = iii[1]
    let ii_3 = iii[2]
    let ii_4 = iii[3]


    let final_date_7 = ii_2 + ' ' + ii_3 + ', ' + ii_4





    this.setState({
      day_1: day_1,
      day_2: day_2,
      day_3: day_3,
      day_4: day_4,
      day_5: day_5,
      day_6: day_6,
      day_7: day_7,
      date_1: final_date_1,
      date_2: final_date_2,
      date_3: final_date_3,
      date_4: final_date_4,
      date_5: final_date_5,
      date_6: final_date_6,
      date_7: final_date_7,

      date_1_1: dd_3,
      date_2_2: cc_3,
      date_3_3: ee_3,
      date_4_4: ff_3,
      date_5_5: gg_3,
      date_6_6: hh_3,
      date_7_7: ii_3,


      m1: cc_2,
      m2: dd_2,
      m3: ee_2,
      m4: ff_2,
      m5: gg_2,
      m6: hh_2,
      m7: ii_2




    })

  }

  render() {

    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, backgroundColor: 'white', paddingHorizontal: 15, }}>
              <CustomIcon
                                                      iconType="MaterialCommunityIcons"
                                                      name="keyboard-backspace"
                                                      size={28}
                                                      color="black"
                                                      onPress={() => this.props.navigation.pop()}
                                                   
                                                     />
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black', }}>Select Slot</Text>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'black', }}>    </Text>

        </View>
        <ScrollView>

          <TouchableOpacity
            style={{ width: width / 1.1, alignSelf: 'center', backgroundColor: 'white', borderRadius: 8, flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 10, marginTop: 15, }}>
            <View style={{ width: 70, height: 120, }}>
              <Image style={{
                width: 70, height: 70, borderRadius: 70,

              }} source={require('../assets/doctor-11.jpg')} />

            </View>
            <View style={{ marginLeft: 10, width: '77%' }}>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: 'black', fontSize: 15, fontWeight: 'bold', maxWidth: '50%' }} numberOfLines={2} ellipsizeMode="tail">Dr. Mario Bianchi</Text>
                <Text style={{ color: '#0EAFF6', fontSize: 15, fontWeight: 'bold', }}>   </Text>

              </View>

              <Text style={{ color: '#0EAFF6', fontSize: 13, fontWeight: '600' }}>Urgent Care</Text>
              <Text style={{ color: 'gray', fontSize: 13, fontWeight: '400' }}>8 years experience</Text>
              <Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold', marginTop: 5 }}>$50</Text>

            </View>
          </TouchableOpacity>

          <Text style={{ color: 'black', fontSize: 13, fontWeight: '500', paddingHorizontal: 15, marginTop: 5, textAlign: 'center' }}>Dec 27, 2022</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginVertical: 15, width: width, }}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              <Pressable   style={this.state.text1 == 1 ? styles.view1 : styles.view}>
                <Text style={this.state.text1 == 1 ? styles.text1 : styles.text}>{this.state.day_1}</Text>
                <Text style={this.state.text1 == 1 ? styles.text1 : styles.text}>{this.state.date_1_1}</Text>
              </Pressable>

              <Pressable style={this.state.text2 == 1 ? styles.view1 : styles.view}>
                <Text style={this.state.text2 == 1 ? styles.text1 : styles.text}>{this.state.day_2}</Text>
                <Text style={this.state.text2 == 1 ? styles.text1 : styles.text}>{this.state.date_2_2}</Text>
              </Pressable>

              <Pressable  style={this.state.text3 == 1 ? styles.view1 : styles.view}>
                <Text style={this.state.text3 == 1 ? styles.text1 : styles.text}>{this.state.day_3}</Text>
                <Text style={this.state.text3 == 1 ? styles.text1 : styles.text}>{this.state.date_3_3}</Text>
              </Pressable>

              <Pressable   style={this.state.text4 == 1 ? styles.view1 : styles.view}>
                <Text style={this.state.text4 == 1 ? styles.text1 : styles.text}>{this.state.day_4}</Text>
                <Text style={this.state.text4 == 1 ? styles.text1 : styles.text}>{this.state.date_4_4}</Text>
              </Pressable>

              <Pressable   style={this.state.text5 == 1 ? styles.view1 : styles.view}>
                <Text style={this.state.text5 == 1 ? styles.text1 : styles.text}>{this.state.day_5}</Text>
                <Text style={this.state.text5 == 1 ? styles.text1 : styles.text}>{this.state.date_5_5}</Text>
              </Pressable>

              <Pressable  style={this.state.text6 == 1 ? styles.view1 : styles.view}>
                <Text style={this.state.text6 == 1 ? styles.text1 : styles.text}>{this.state.day_6}</Text>
                <Text style={this.state.text6 == 1 ? styles.text1 : styles.text}>{this.state.date_6_6}</Text>
              </Pressable>

              <Pressable  style={this.state.text7 == 1 ? styles.view1 : styles.view}>
                <Text style={this.state.text7 == 1 ? styles.text1 : styles.text}>{this.state.day_7}</Text>
                <Text style={this.state.text7 == 1 ? styles.text1 : styles.text}>{this.state.date_7_7}</Text>
              </Pressable>
            </ScrollView>
          </View>

          <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 14, marginLeft: 20 }}>Book Slot for appointment</Text>

          <View>

            {this.state.skalton == true ?

              <SkeletonPlaceholder>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginHorizontal: 10, marginTop: 10, }} >
                  <View
                    style={{ width: width / 2.3, borderWidth: 1, borderColor: '#0EAFF6', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 12, marginTop: 10, height: 50, marginHorizontal: 5 }}
                  ></View>
                  <View
                    style={{ width: width / 2.3, borderWidth: 1, borderColor: '#0EAFF6', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 12, marginTop: 10, height: 50, marginHorizontal: 5 }}
                  ></View>
                  <View
                    style={{ width: width / 2.3, borderWidth: 1, borderColor: '#0EAFF6', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 12, marginTop: 10, height: 50, marginHorizontal: 5 }}
                  ></View>
                  <View
                    style={{ width: width / 2.3, borderWidth: 1, borderColor: '#0EAFF6', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 12, marginTop: 10, height: 50, marginHorizontal: 5 }}
                  ></View>

                </View>
              </SkeletonPlaceholder>


              :
              
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', paddingHorizontal: 10, marginTop: 10 }}>
                <Pressable style={styles.unselect} >
                  <Text style={styles.unselect_text}>09:00 AM</Text>
                </Pressable>


                <Pressable style={styles.unselect} >
                  <Text style={styles.unselect_text}>09:30 AM</Text>
                </Pressable>


                <Pressable style={styles.unselect} >
                  <Text style={styles.unselect_text}>10:00 AM</Text>
                </Pressable>


                <Pressable style={styles.unselect} >
                  <Text style={styles.unselect_text}>10:30 AM</Text>
                </Pressable>

                <Pressable style={styles.select} >
                  <Text style={styles.select_text}>11:00 AM</Text>
                </Pressable>

                <Pressable style={styles.unselect} >
                  <Text style={styles.unselect_text}>11:30 AM</Text>
                </Pressable>
              </View>

            }
          </View>

        </ScrollView>
 
        <TouchableOpacity activeOpacity={0.8} onPress={() => this.props.navigation.navigate('appointment_checkout')}
          style={{ width: width / 1.1, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', paddingVertical: 13, borderRadius: 100, backgroundColor: '#0EAFF6', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 3, position: 'absolute', bottom: 20 }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Next</Text>
        </TouchableOpacity>


         


      </View>

    )
  }
}

const styles = StyleSheet.create({
  unselect: {
    width: 90, marginHorizontal: 6, marginVertical: 5, borderWidth: 1, borderColor: '#0EAFF6', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 5
  },
  select: {
    width: 90, marginHorizontal: 6, marginVertical: 5, borderWidth: 1, backgroundColor: '#0EAFF6', borderColor: '#0EAFF6', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 5
  },
  unselect_text: {
    color: '#0EAFF6', fontWeight: 'bold'

  },
  select_text: {
    color: 'white', fontWeight: 'bold', fontSize: 14

  },



  select_text_red: {
    color: 'white', fontWeight: 'bold', fontSize: 15

  },
  unselect_text_red: {
    color: 'white', fontWeight: 'bold', fontSize: 15

  },
  select_red: {
    width: width / 2.4, marginHorizontal: 4, borderWidth: 1, backgroundColor: '#FFD242', borderColor: '#FFD242', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 12

  },
  unselect_red: {
    width: width / 2.4, marginHorizontal: 4, borderWidth: 1, borderColor: '#FFD242', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 12

  },
  text1: {
    color: 'gray', fontSize: 15, fontWeight: 'bold',
  },
  text: {
    color: '#0EAFF6', fontSize: 15, fontWeight: 'bold',
  },
  view1: {
    paddingHorizontal: 8, paddingVertical: 7, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 5, marginRight: 5
  },
  view: {
    paddingHorizontal: 8, paddingVertical: 7, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 5, marginRight: 5,
  }
})



export default book_appointment;