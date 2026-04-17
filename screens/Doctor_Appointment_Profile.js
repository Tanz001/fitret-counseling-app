import React, {Component} from 'react';
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
  ImageBackground,
  Dimensions,
  Pressable,
  ToastAndroid,
  BackHandler,
  KeyboardAvoidingView
} from 'react-native';
import CustomIcon from '../components/CustomIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Connection from '../connection';
import ImageLoad from 'react-native-image-placeholder';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import CustomsSafeareaView from '../components/CustomsSafeareaView';
import RBSheet from "react-native-raw-bottom-sheet";

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

class Doctor_Appointment_Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      date1: new Date(),
      mode1: 'time',
      appointment_for: '',
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
      appointment_date: this.props.route.params.final_date_1,

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

      category: this.props.route.params.day_1,
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
      // changes_time_for_specific_day: this.props.day_1,
      appointment_time: '',

      final_date: '',
      spinner: false,
      skalton: true,
    };
  }

  backAction = () => {
    this.props.navigation.pop();
    return true;
  };

  componentWillUnmount() {
    this.backHandler.remove();
  }

  get_shedule = () => {
    let uploaddata = new FormData();

    uploaddata.append('doctor_id', this.props.route.params.doctor_id);

    let api = Connection + 'apis.php?action=display_schedulde';
      console.log("pass => ", api);
    fetch(api, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        otherHeader: 'foo',
      },
      body: uploaddata,
    })
      .then(response => response.json())
      .then(response => {
        let record4 = response.response;
        console.log('responseeeeeeeeeeeeee', response.response);

        if (record4 != 'fail') {
          let monday = record4[0].monday;
          let tuesday = record4[0].tuesday;
          let wednesday = record4[0].wednesday;
          let thursday = record4[0].thursday;
          let friday = record4[0].friday;
          let saturday = record4[0].saturday;
          let sunday = record4[0].sunday;

          let array_mon = JSON.parse(monday);
          let array_tue = JSON.parse(tuesday);
          let array_wed = JSON.parse(wednesday);
          let array_thu = JSON.parse(thursday);
          let array_fri = JSON.parse(friday);
          let array_sat = JSON.parse(saturday);
          let array_sun = JSON.parse(sunday);

          console.log('monnnnnnnnnn', array_mon);
          let len_mon = array_mon.length;
          for (let i = 0; i < len_mon; i++) {
            let doctor_time = array_mon[i];
            let boxes = 'box' + doctor_time;
            this.setState({[boxes]: false});
          }

          let len_tue = array_tue.length;
          for (let i = 0; i < len_tue; i++) {
            let doctor_time = array_tue[i];
            let boxes = 'box' + doctor_time;
            this.setState({[boxes]: false});
          }

          let len_wed = array_wed.length;
          for (let i = 0; i < len_wed; i++) {
            let doctor_time = array_wed[i];
            let boxes = 'box' + doctor_time;
            this.setState({[boxes]: false});
          }

          let len_thu = array_thu.length;
          for (let i = 0; i < len_thu; i++) {
            let doctor_time = array_thu[i];
            let boxes = 'box' + doctor_time;
            this.setState({[boxes]: false});
          }

          let len_fri = array_fri.length;
          for (let i = 0; i < len_fri; i++) {
            let doctor_time = array_fri[i];
            let boxes = 'box' + doctor_time;
            this.setState({[boxes]: false});
          }

          let len_sat = array_sat.length;
          for (let i = 0; i < len_sat; i++) {
            let doctor_time = array_sat[i];
            let boxes = 'box' + doctor_time;
            this.setState({[boxes]: false});
          }

          let len_sun = array_sun.length;
          for (let i = 0; i < len_sun; i++) {
            let doctor_time = array_sun[i];
            let boxes = 'box' + doctor_time;
            this.setState({[boxes]: false});
          }

          if (this.props.route.params.day_1 == 'Fri') {
            this.setState({
              main_array: array_fri,
            });
          } else if (this.props.route.params.day_1 == 'Sat') {
            this.setState({
              main_array: array_sat,
            });
          } else if (this.props.route.params.day_1 == 'Sun') {
            this.setState({
              main_array: array_sun,
            });
          } else if (this.props.route.params.day_1 == 'Mon') {
            this.setState({
              main_array: array_mon,
            });
          } else if (this.props.route.params.day_1 == 'Tue') {
            this.setState({
              main_array: array_tue,
            });
          } else if (this.props.route.params.day_1 == 'Wed') {
            this.setState({
              main_array: array_wed,
            });
          } else if (this.props.route.params.day_1 == 'Thu') {
            this.setState({
              main_array: array_thu,
            });
          }

          this.setState({
            monday1: array_mon,
            tuesday1: array_tue,
            wednesday1: array_wed,
            thursday1: array_thu,
            friday1: array_fri,
            saturday1: array_sat,
            sunday1: array_sun,
            skalton: false,
          });

          // this.Get_appointments_with_doctor_id(this.props.day_1, this.props.final_date_1,)
        } else {
          this.setState({
            main_array: [],
            skalton: false,
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

 
 

  changebtn2(value, value2, value3) {
    this.setState({
      changes_time_for_specific_day: value2,
      appointment_date: value3,
      skalton: true,
    });

    if (this.state.daybox != value2) {
      let boxes = 'box' + this.state.appointment_time;
      this.setState({[boxes]: false});
    } else {
      let boxes = 'box' + this.state.appointment_time;
      this.setState({[boxes]: true});
    }

    if (this.state[value] == 2) {
      this.setState({
        text1: 1,
        text2: 1,
        text3: 1,
        text4: 1,
        text5: 1,
        text6: 1,
        text7: 1,

        [value]: 2,

        category: '',
      });
    } else {
      this.setState({
        text1: 1,
        text2: 1,
        text3: 1,
        text4: 1,
        text5: 1,
        text6: 1,
        text7: 1,

        [value]: 2,
        category: value2,
      });
    }

    if (value2 == 'Mon') {
      this.setState({
        main_array: this.state.monday1,
      });
    } else if (value2 == 'Tue') {
      this.setState({
        main_array: this.state.tuesday1,
      });
    } else if (value2 == 'Wed') {
      this.setState({
        main_array: this.state.wednesday1,
      });
    } else if (value2 == 'Thu') {
      this.setState({
        main_array: this.state.thursday1,
      });
    } else if (value2 == 'Fri') {
      this.setState({
        main_array: this.state.friday1,
      });
    } else if (value2 == 'Sat') {
      this.setState({
        main_array: this.state.saturday1,
      });
    } else if (value2 == 'Sun') {
      this.setState({
        main_array: this.state.sunday1,
      });
    }

    setTimeout(() => {
      this.setState({
        skalton: false,
      });
    }, 100);

    // this.Get_appointments_with_doctor_id(value2, value3)
  }

  componentDidMount = async () => {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backAction,
    );

    let aa = moment(new Date()).format('YYYY-MM-DD hh:mm A');
    console.log('QQQQQQQQQQQQ,AA', aa);
    let split = aa.split(' ');
    let date = split[0];

    let time = split[1];
    let am_pm = split[2];
    let final_time = time + '' + am_pm;

    this.setState({
      time: final_time,
      date: date,
    });

    this.get_shedule()

    let user = await AsyncStorage.getItem('user');

    let parsed = JSON.parse(user);

    let id = parsed[0].id;
    this.setState({
      user_id: id,
    });

    // this.get_shedule()

    var today = new Date();

    var nextweek_T = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    let date0 = nextweek_T.toString();
    let ddd = date0.split(' ');
    let day_1 = ddd[0];
    let dd_2 = ddd[1];
    let dd_3 = ddd[2];
    let dd_4 = ddd[3];

    let final_date_1 = dd_2 + ' ' + dd_3 + ', ' + dd_4;

    var nextweek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );
    let date1 = nextweek.toString();
    let ccc = date1.split(' ');
    let day_2 = ccc[0];
    let cc_2 = ccc[1];
    let cc_3 = ccc[2];
    let cc_4 = ccc[3];
    console.log(date1, 'cccccc');

    let final_date_2 = cc_2 + ' ' + cc_3 + ', ' + cc_4;

    var nextweek1 = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 2,
    );
    let date2 = nextweek1.toString();
    let eee = date2.split(' ');
    let day_3 = eee[0];
    let ee_2 = eee[1];
    let ee_3 = eee[2];
    let ee_4 = eee[3];

    let final_date_3 = ee_2 + ' ' + ee_3 + ', ' + ee_4;

    var nextweek2 = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 3,
    );
    let date3 = nextweek2.toString();
    let fff = date3.split(' ');
    let day_4 = fff[0];
    let ff_2 = fff[1];
    let ff_3 = fff[2];
    let ff_4 = fff[3];

    let final_date_4 = ff_2 + ' ' + ff_3 + ', ' + ff_4;

    var nextweek3 = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 4,
    );
    let date4 = nextweek3.toString();
    let ggg = date4.split(' ');
    let day_5 = ggg[0];
    let gg_2 = ggg[1];
    let gg_3 = ggg[2];
    let gg_4 = ggg[3];

    let final_date_5 = gg_2 + ' ' + gg_3 + ', ' + gg_4;

    var nextweek4 = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 5,
    );
    let date5 = nextweek4.toString();
    let hhh = date5.split(' ');
    let day_6 = hhh[0];
    let hh_2 = hhh[1];
    let hh_3 = hhh[2];
    let hh_4 = hhh[3];

    let final_date_6 = hh_2 + ' ' + hh_3 + ', ' + hh_4;

    var nextweek5 = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 6,
    );
    let date6 = nextweek5.toString();
    let iii = date6.split(' ');
    let day_7 = iii[0];
    let ii_2 = iii[1];
    let ii_3 = iii[2];
    let ii_4 = iii[3];

    let final_date_7 = ii_2 + ' ' + ii_3 + ', ' + ii_4;

    this.setState({
      day_1: day_1,
      day_2: day_2,
      day_3: day_3,
      day_4: day_4,
      day_5: day_5,
      day_6: day_6,
      day_7: day_7,
      date_1: final_date_1,
      date_2: date1,
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
      m7: ii_2,
    });

    
  };

  selected_time = (val, val1) => {
    let record1 = this.state.main_array;
    let len = record1.length;
    let boxes = 'box' + val;

    if (this.state[boxes] == false) {
      for (let i = 0; i < len; i++) {
        let doctor_time = record1[i];
        let boxes = 'box' + doctor_time;
        this.setState({[boxes]: false});
      }
    } else {
    }

    setTimeout(() => {
      if (this.state[boxes] == false) {
        this.setState({[boxes]: true});
        this.setState({
          appointment_time: val,
          daybox: this.state.changes_time_for_specific_day,
        });
      } else {
        this.setState({[boxes]: false});

        this.setState({
          appointment_time: '',
          daybox: '',
        });
      }
    }, 100);
  };

  createtable1 = () => {
    let table = [];

    let record1 = this.state.main_array;
    let len = record1.length;

    if (record1 != 'fail') {
      for (let i = 0; i < len; i++) {
        let doctor_time = record1[i];
        let boxes = 'box' + doctor_time;
        let boxred = 'boxred' + doctor_time;

        table.push(
          <View>
            {
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: 5,
                }}>
                <Pressable
                  onPress={() => this.selected_time(doctor_time, 'selected')}
                  style={
                    this.state[boxes] == true ? styles.select : styles.unselect
                  }>
                  <Text
                    allowFontScaling={false}
                    style={
                      this.state[boxes] == true
                        ? styles.select_text
                        : styles.unselect_text
                    }>
                    {doctor_time}
                  </Text>
                </Pressable>
              </View>
            }
          </View>,
        );
      }
      return table;
    } else {
      let img = [];
      img.push(
        <View style={{flex: 1, justifyContent: 'center'}}>
          {<View></View>}
        </View>,
      );
      return img;
    }
  };



  Add_appointment = () => {
    if (this.state.appointment_time == '') {
      alert('Please select appointment time for moving next.');
    } else {
      setTimeout(() => {
        this.props.navigation.navigate('Select_Reason', {    
          doctor_id: this.props.route.params.doctor_id,
          category: this.props.route.params.category,
          experience: this.props.route.params.experience,
          fee: this.props.route.params.fee,
          appointment_date: this.state.appointment_date,
          appointment_time: this.state.appointment_time,
          appointment_day: this.state.category,
          first_name:this.props.route.params.first_name,
          last_name:this.props.route.params.last_name

        });
      }, 100);
    }
  };





    render() {

const {first_name,last_name,experience,education,category,total_reviews,average_rating,about,doctor_id,phone_number,profileImage,address,fee} = this.props.route.params;
        return (
            <View style={{ flex: 1,backgroundColor:'white' }}>
<StatusBar backgroundColor="white" barStyle="light-content" />

                <ScrollView>


                <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 15,
            paddingVertical: 15,
            backgroundColor: "white",
            borderBottomWidth:1,
            borderBottomColor:'lightgray'
          }}
        >
                        <CustomIcon
                                                                     iconType="MaterialCommunityIcons"
                                                                     name="keyboard-backspace"
                                                                     size={28}
                                                                     color="black"
                                                                     onPress={() => this.props.navigation.pop()}
                                                                  
                                                                    />

 
          <Text
            style={{
              color: "#2B79C3",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            Consult Doctor</Text>
            <View style={{flexDirection:'row',alignItems:'center', }}>
 
                <CustomIcon
                                                                       iconType="FontAwesome"
                                                                       name="heart-o"
                                                                       size={24}
                                                                       color="#2B79C3"
                                                                   
                                                                    
                                                                      />                               
              

            
                 
     </View>

        </View>



        <TouchableOpacity activeOpacity={0.8}  


style={{ width: width / 1.1, alignSelf: 'center', backgroundColor: 'white', borderRadius: 8, flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 10, marginTop: 15,    }}>

<View>

 
  <ImageLoad
                             style={{width: 80, height: 80,  }}

                                loadingStyle={{size: 'large', color: 'blue'}}
                                source={profileImage}
                                borderRadius={80}
                                placeholderStyle={{
                                  width: 80, height: 80,
                                }}
                            
                              />
       



</View>  
<View style={{ marginLeft: 10, width: '77%' }}>
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: 10 }}>
    <View>
    <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold', }} numberOfLines={1} ellipsizeMode="tail">Dr. {first_name} {last_name}</Text>

     
      <Text style={{ color: '#82829B', fontSize: 14, fontWeight: '400' }}>{category}</Text>
      <Text style={{ color: '#82829B', fontSize: 14, fontWeight: '400' }}>{education} - {category}</Text>
      <Text style={{ color: 'black', fontSize: 14, fontWeight: '400' }}>{experience} yrs expertise</Text>

<View style={{flexDirection:'row',alignItems:'center', justifyContent:'space-between', }}>

<View style={{flexDirection:'row',alignItems:'center',marginTop:5}}>
              
             <CustomIcon
                                                                       iconType="Entypo"
                                                                       name="star"
                                                                       size={16}
                                                                       color="#2B79C3"
                                                                   
                                                                    
                                                                      />     

             <Text style={{color:'#2B79C3', fontSize:13,fontWeight:'bold'}}>{average_rating}/5 ratings</Text>
          
            
                 
     </View>



     <View style={{flexDirection:'row',alignItems:'center',marginTop:5,marginLeft:15}}>
              
             <CustomIcon
                                                                       iconType="MaterialCommunityIcons"
                                                                       name="account-group"
                                                                       size={16}
                                                                       color="#2B79C3"
                                                                   
                                                                    
                                                                      />   
             <Text style={{color:'#2B79C3', fontSize:13,fontWeight:'bold'}}> 23 patients consulted</Text>
          
            
                 
     </View>
</View>

     
  


    </View>


  </View>


</View>
</TouchableOpacity>




<View style={{width:width,height:1,backgroundColor:'lightgray' , marginVertical:25}}></View>


<View style={{ width: width / 1.1, alignSelf: 'center', marginTop: 20,  borderWidth:1,borderColor:'#2B79C3', borderRadius:12,  paddingBottom: 15, backgroundColor: 'white',borderTopLeftRadius:12,borderTopRightRadius:12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center',backgroundColor:'#2B79C3' ,paddingHorizontal:20,paddingVertical:10,borderTopLeftRadius:8,borderTopRightRadius:8,width:'100%'}}>
             <CustomIcon
                                                                       iconType="FontAwesome"
                                                                       name="home"
                                                                       size={24}
                                                                       color="white"
                                                                   
                                                                    
                                                                      />  

              <Text style={{ color: 'white', wiadth:'70%',  fontWeight: '600',fontSize:15 }}> In-clinic Appointment</Text>
              <Text style={{ color: 'white',   fontWeight: '600',fontSize:15 }}> ETB {fee} Fees</Text>
                                   

            </View>




            <View style={{ flexDirection: 'row', alignItems: 'center',justifyContent:'space-between', marginTop: 10,paddingHorizontal:15,width:'100%' }}>
              <Text numberOfLines={2} style={{ color: 'black', width:'60%', fontSize:14 }}>{address}</Text>

              <Text numberOfLines={2} style={{ color: '#2B79C3',   fontWeight: '600',fontSize:14 }}> VIEW ALL</Text>
            </View>


            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              <Pressable onPress={() => this.changebtn2("text1", this.state.day_1, this.state.date_1)}  style={this.state.text1 == 1 ? styles.view1 : styles.view}>
                {/* <Text style={this.state.text1 == 1 ? styles.text1 : styles.text}>{this.state.m1}</Text> */}
                <Text style={this.state.text1 == 1 ? styles.text1 : styles.text}>{this.state.day_1} </Text>
             
                {/* <Text style={this.state.text1 == 1 ? styles.text1 : styles.text}>{this.state.date_1_1}</Text> */}
              </Pressable>

              <Pressable onPress={() => this.changebtn2("text2", this.state.day_2, this.state.date_2)}  style={this.state.text2 == 1 ? styles.view1 : styles.view}>
              <Text style={this.state.text2 == 1 ? styles.text1 : styles.text}>{this.state.day_2}   </Text>

                {/* <Text style={this.state.text2 == 1 ? styles.text1 : styles.text}>{this.state.date_2_2}</Text> */}
              </Pressable>

              <Pressable onPress={() => this.changebtn2("text3", this.state.day_3, this.state.date_3)}  style={this.state.text3 == 1 ? styles.view1 : styles.view}>
              <Text style={this.state.text3 == 1 ? styles.text1 : styles.text}>{this.state.day_3}  </Text>

                {/* <Text style={this.state.text3 == 1 ? styles.text1 : styles.text}>{this.state.date_3_3}</Text> */}
              </Pressable>

              <Pressable onPress={() => this.changebtn2("text4", this.state.day_4, this.state.date_4)}  style={this.state.text4 == 1 ? styles.view1 : styles.view}>
              <Text style={this.state.text4 == 1 ? styles.text1 : styles.text}>{this.state.day_4}  </Text>

                {/* <Text style={this.state.text4 == 1 ? styles.text1 : styles.text}>{this.state.date_4_4}</Text> */}
              </Pressable>

              <Pressable onPress={() => this.changebtn2("text5", this.state.day_5, this.state.date_5)}   style={this.state.text5 == 1 ? styles.view1 : styles.view}>

              <Text style={this.state.text5 == 1 ? styles.text1 : styles.text}>{this.state.day_5} </Text>

                {/* <Text style={this.state.text5 == 1 ? styles.text1 : styles.text}>{this.state.date_5_5}</Text> */}
              </Pressable>



              <Pressable  onPress={() => this.changebtn2("text6", this.state.day_6, this.state.date_6)} style={this.state.text6 == 1 ? styles.view1 : styles.view}>

              <Text style={this.state.text6 == 1 ? styles.text1 : styles.text}>{this.state.day_6} </Text>

                {/* <Text style={this.state.text6 == 1 ? styles.text1 : styles.text}>{this.state.date_6_6}</Text> */}
              </Pressable>



              <Pressable onPress={() => this.changebtn2("text7", this.state.day_7, this.state.date_7)}  style={this.state.text7 == 1 ? styles.view1 : styles.view}>
              <Text style={this.state.text7 == 1 ? styles.text1 : styles.text}>{this.state.day_7}  </Text>
                {/* <Text style={this.state.text7 == 1 ? styles.text1 : styles.text}>{this.state.date_7_7}</Text> */}
               
              </Pressable>
            </ScrollView>


 
            <View style={{flexDirection:'row',alignItems:'center',marginLeft:15,marginTop:20,marginBottom:10}}>
                                         
             {/* <CustomIcon
                                                                       iconType="MaterialCommunityIcons"
                                                                       name="white-balance-sunny"
                                                                       size={16}
                                                                       color="#00B0AD"
                                                                   
                                                                    
                                                                      />   */}

             <Text style={{color:'black', fontSize:13,fontWeight:'bold'}}> SLOTS</Text>
          
            
                 
     </View>




     <View>
            {this.state.skalton == true ? (
              <SkeletonPlaceholder>
               
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    marginHorizontal: 10,
                    marginTop: 10,
                  }}>
                  <View
                    style={{
                      width: width / 2.6,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingVertical: 8,
                      borderRadius: 6,
                      marginTop: 10,
                      height: 50,
                      marginHorizontal: 5,
                    }}></View>
                  <View
                    style={{
                      width: width / 2.6,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingVertical: 8,
                      borderRadius: 6,
                      marginTop: 10,
                      height: 50,
                      marginHorizontal: 5,
                    }}></View>
                  <View
                    style={{
                      width: width / 2.6,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingVertical: 8,
                      borderRadius: 6,
                      marginTop: 10,
                      height: 50,
                      marginHorizontal: 5,
                    }}></View>
                  <View
                    style={{
                      width: width / 2.6,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingVertical: 8,
                      borderRadius: 6,
                      marginTop: 10,
                      height: 50,
                      marginHorizontal: 5,
                    }}></View>
                </View>
              </SkeletonPlaceholder>
            ) : (
              <View>
                {this.state.main_array == '' ? (
                  <View>
                    <Text
                      allowFontScaling={false}
                      style={{marginTop: 10, alignSelf: 'center'}}>
                      No slot available
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      width: width / 1.2,
                      alignSelf: 'center',
                      flexDirection: 'row',
                      alignItems: 'center',
                      
                      flexWrap: 'wrap',
                    }}>
                    {this.createtable1()}
                  </View>
                )}
              </View>
            )}
          </View>









 
{/* 

<View style={{flexDirection:'row',alignItems:'center',marginLeft:15,marginTop:20,marginBottom:10}}>
              <CustomIcon
                                                                       iconType="FontAwesome5"
                                                                       name="cloud-sun"
                                                                       size={16}
                                                                       color="#00B0AD"
                                                                   
                                                                    
                                                                      /> 

             <Text style={{color:'black', fontSize:13,fontWeight:'bold'}}> EVENING</Text>
          
            
                 
     </View>

<View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',width:'95%', alignSelf:'center', }}>

<View style={{alignItems:'center',justifyContent:'center',width:'23%',borderRadius:4,backgroundColor:'#00B0AD',paddingVertical:10,marginTop:10}}>

  <Text style={{fontWeight:'bold', color:'white',fontSize:14}}>12:00 PM</Text>
</View>


<View style={{alignItems:'center',justifyContent:'center',width:'23%',borderRadius:4,backgroundColor:'#00B0AD',paddingVertical:10,marginTop:10}}>

  <Text style={{fontWeight:'bold', color:'white',fontSize:14}}>12:00 PM</Text>
</View>



<View style={{alignItems:'center',justifyContent:'center',width:'23%',borderRadius:4,backgroundColor:'#00B0AD',paddingVertical:10,marginTop:10}}>

  <Text style={{fontWeight:'bold', color:'white',fontSize:14}}>12:00 PM</Text>
</View>



<View style={{alignItems:'center',justifyContent:'center',width:'23%',borderRadius:4,backgroundColor:'#00B0AD',paddingVertical:10,marginTop:10}}>

  <Text style={{fontWeight:'bold', color:'white',fontSize:14}}>12:00 PM</Text>
</View>



<View style={{alignItems:'center',justifyContent:'center',width:'23%',borderRadius:4,backgroundColor:'#00B0AD',paddingVertical:10,marginTop:10}}>

  <Text style={{fontWeight:'bold', color:'white',fontSize:14}}>12:00 PM</Text>
</View>

</View> */}



{/* <View style={{flexDirection:'row',alignItems:'center',marginLeft:15,marginTop:20,marginBottom:10}}>
                                      
             <CustomIcon
                                                                       iconType="FontAwesome5"
                                                                       name="moon"
                                                                       size={16}
                                                                       color="#00B0AD"
                                                                   
                                                                    
                                                                      /> 

             <Text style={{color:'black', fontSize:13,fontWeight:'bold'}}> NIGHT</Text>
          
            
                 
     </View>

<View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',width:'95%', alignSelf:'center', }}>

<View style={{alignItems:'center',justifyContent:'center',width:'23%',borderRadius:4,backgroundColor:'#00B0AD',paddingVertical:10,marginTop:10}}>

  <Text style={{fontWeight:'bold', color:'white',fontSize:14}}>12:00 PM</Text>
</View>


<View style={{alignItems:'center',justifyContent:'center',width:'23%',borderRadius:4,backgroundColor:'#00B0AD',paddingVertical:10,marginTop:10}}>

  <Text style={{fontWeight:'bold', color:'white',fontSize:14}}>12:00 PM</Text>
</View>



<View style={{alignItems:'center',justifyContent:'center',width:'23%',borderRadius:4,backgroundColor:'#00B0AD',paddingVertical:10,marginTop:10}}>

  <Text style={{fontWeight:'bold', color:'white',fontSize:14}}>12:00 PM</Text>
</View>



<View style={{alignItems:'center',justifyContent:'center',width:'23%',borderRadius:4,backgroundColor:'#00B0AD',paddingVertical:10,marginTop:10}}>

  <Text style={{fontWeight:'bold', color:'white',fontSize:14}}>12:00 PM</Text>
</View>



<View style={{alignItems:'center',justifyContent:'center',width:'23%',borderRadius:4,backgroundColor:'#00B0AD',paddingVertical:10,marginTop:10}}>

  <Text style={{fontWeight:'bold', color:'white',fontSize:14}}>12:00 PM</Text>
</View>

</View>
 
             */}
 

          </View>
          <View style={{width:width,height:1,backgroundColor:'lightgray' , marginVertical:25}}></View>


          <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold',paddingHorizontal:15,  }} numberOfLines={1} ellipsizeMode="tail">About Jane</Text>

<Text style={{ color: 'black', fontWeight: '400' , paddingHorizontal:15}}>{about}</Text>
<TouchableOpacity onPress={()=>this.props.navigation.navigate('Description')}  style={{flexDirection:'row',alignItems:'center',justifyContent:'center',alignSelf:'flex-end',marginRight:10}}>
<Text style={{ color: '#2B79C3',textAlign:'right', fontSize: 14, fontWeight: 'bold', }} numberOfLines={1} ellipsizeMode="tail">VIEW ALL DETAILS  </Text>
                            
                           
<CustomIcon
                                                                       iconType="Entypo"
                                                                       name="chevron-right"
                                                                       size={24}
                                                                       color="#2B79C3"
                                                                   
                                                                    
                                                                      /> 

</TouchableOpacity>

<View style={{width:width,height:1,backgroundColor:'lightgray' , marginVertical:25}}></View>


<Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold',paddingHorizontal:15 }} numberOfLines={1} ellipsizeMode="tail">Services</Text>


<View style={{ flexDirection: 'row',alignItems:'center',   marginTop: 10,paddingHorizontal:15,  }}>
                                         
            <CustomIcon
                                                                       iconType="FontAwesome"
                                                                       name="circle"
                                                                       size={11}
                                                                       color="gray"
                                                                       style={{marginTop:3}}
                                                                      /> 

              <Text style={{ color: 'gray',   fontWeight: '600',fontSize:15,marginLeft:10 }}>Office Visits</Text>
            </View>


            <View style={{ flexDirection: 'row',alignItems:'center',   marginTop: 10,paddingHorizontal:15, }}>
                                         
            <CustomIcon
                                                                       iconType="FontAwesome"
                                                                       name="circle"
                                                                       size={11}
                                                                       color="gray"
                                                                       style={{marginTop:3}}
                                                                      /> 

              <Text style={{ color: 'gray',   fontWeight: '600',fontSize:15,marginLeft:10 }}>Full Shot</Text>
            </View>


            <View style={{ flexDirection: 'row',alignItems:'center',   marginTop: 10,paddingHorizontal:15, }}>
                                           
            <CustomIcon
                                                                       iconType="FontAwesome"
                                                                       name="circle"
                                                                       size={11}
                                                                       color="gray"
                                                                       style={{marginTop:3}}
                                                                      /> 

              <Text style={{ color: 'gray',   fontWeight: '600',fontSize:15,marginLeft:10 }}>Sports Physicals</Text>
            </View>



            <View style={{ flexDirection: 'row',alignItems:'center',   marginTop: 10,paddingHorizontal:15, }}>
             <CustomIcon
                                                                       iconType="FontAwesome"
                                                                       name="circle"
                                                                       size={11}
                                                                       color="gray"
                                                                       style={{marginTop:3}}
                                                                      /> 

              <Text style={{ color: 'gray',   fontWeight: '600',fontSize:15,marginLeft:10 }}>School Physical</Text>
            </View>



            <View style={{ flexDirection: 'row',alignItems:'center',   marginTop: 10,paddingHorizontal:15,  }}>
             <CustomIcon
                                                                       iconType="FontAwesome"
                                                                       name="circle"
                                                                       size={11}
                                                                       color="gray"
                                                                       style={{marginTop:3}}
                                                                      /> 

              <Text style={{ color: 'gray',   fontWeight: '600',fontSize:15,marginLeft:10 }}>Camp Physicals</Text>
            </View>
            <TouchableOpacity onPress={()=>this.props.navigation.navigate('Services')}  style={{flexDirection:'row',alignItems:'center',justifyContent:'center',alignSelf:'flex-end',marginRight:10}}>
<Text style={{ color: '#2B79C3',textAlign:'right', fontSize: 14, fontWeight: 'bold', }} numberOfLines={1} ellipsizeMode="tail">VIEW ALL  </Text>
                              

<CustomIcon
                                                                       iconType="Entypo"
                                                                       name="chevron-right"
                                                                       size={24}
                                                                       color="#2B79C3"
                                                                     
                                                                      /> 
</TouchableOpacity>
            <View style={{width:width,height:1,backgroundColor:'lightgray' , marginVertical:25}}></View>


            <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',alignSelf:'center', width:width/1.1}}>
<Text style={{ color: 'black',  fontSize: 15, fontWeight: 'bold', }} numberOfLines={1} ellipsizeMode="tail">Ratings & reviews</Text>


<View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',alignSelf:'flex-end', }}>
                               

<CustomIcon
                                                                       iconType="AntDesign"
                                                                       name="star"
                                                                       size={20}
                                                                       color="#2B79C3"
                                                                     
                                                                      /> 
<Text style={{ color: '#2B79C3', fontSize: 14, fontWeight: 'bold', }} numberOfLines={1} ellipsizeMode="tail"> {average_rating}/5  </Text>


</View>                      


</View>



<View style={{  justifyContent: 'space-between', marginTop: 10,width:width/1.1,alignSelf:'center', paddingBottom:10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
<Image source={require("../assets/doc9.jpg")} style={{ width: 44, borderRadius: 44, height: 44 }}/>
                               
                               
                               
                                {/* <ImageLoad
                                    style={{ width: 44, borderRadius: 44, height: 44 }}
                                    loadingStyle={{ size: 'large', color: 'blue' }}
                                    source={{ uri: profile }}
                                    borderRadius={150}
                                    placeholderStyle={{ width: 44, borderRadius: 44, height: 44 }}
                                /> */}
                                <View style={{ marginLeft: 10, width: '60%' }}>
                                    <Text numberOfLines={1} style={{ color: 'black', fontWeight: 'bold', fontSize: 15, maxWidth: '100%' }}>John Jeffrey</Text>
                                    <Text numberOfLines={2} style={{ color: 'gray', fontSize: 14, maxWidth: '100%' }}>2 months ago</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                                    {/* <StarRating
                                        disabled={false}
                                        maxStars={5}
                                        rating={3}
                                        // selectedStar={(rating) => this.onStarRatingPress(rating)}
                                        containerStyle={{ width: width / 2.8 }}
                                        starSize={22}
                                        fullStarColor={'gold'}
                                    /> */}

                                </View>
                             
          <Text style={{ color: '#2E2E37', fontSize: 16, fontWeight: 'bold',paddingHorizontal:10, marginVertical:5 }} numberOfLines={1} ellipsizeMode="tail">Visited for artery blockages</Text>

<Text style={{ color: '#82829B', fontWeight: '400' , paddingHorizontal:10}}>Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.</Text>
                        </View>


                        <TouchableOpacity onPress={()=>this.props.navigation.navigate('Reviews')}  style={{flexDirection:'row',alignItems:'center',justifyContent:'center',alignSelf:'flex-end',marginRight:10}}>
<Text style={{ color: '#2B79C3',textAlign:'right', fontSize: 14, fontWeight: 'bold', }} numberOfLines={1} ellipsizeMode="tail">VIEW ALL 103 REVIEWS </Text>
                            
<CustomIcon
                                                                       iconType="Entypo"
                                                                       name="chevron-right"
                                                                       size={24}
                                                                       color="#2B79C3"
                                                                     
                                                                      /> 

</TouchableOpacity>

<View style={{width:width,height:1,backgroundColor:'lightgray' , marginVertical:25}}></View>
<Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold',paddingHorizontal:15 }} numberOfLines={1} ellipsizeMode="tail">Clinic details</Text>

<Text style={{ color: '#60606C', fontSize: 15, fontWeight: 'bold',paddingHorizontal:15,marginTop:10 }} numberOfLines={1} ellipsizeMode="tail">Location</Text>

<Text style={{ color: 'black', fontWeight: '400' , paddingHorizontal:15}}>Fortis Hospital, Washington Ave. Manchester, Kentucky 39495</Text>


<Image style={{width: width/1.1, height: 150, marginTop:10, borderRadius: 12, alignSelf:'center' 
        
      }} source={require('../assets/mapp.jpeg')} />



<Text style={{ color: '#60606C', fontSize: 15, fontWeight: 'bold',paddingHorizontal:15,marginTop:10 }} numberOfLines={1} ellipsizeMode="tail">Timings</Text>



<ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
 


<View style={{backgroundColor:'white',marginLeft:10,marginRight:5, marginVertical:15, paddingHorizontal:15,borderRadius:8, paddingVertical:10,width:width/2.2,  borderWidth:0.5,borderColor:'lightgray'}}>
<Text style={{ color: '#60606C', fontSize: 15, fontWeight: 'bold',  }} numberOfLines={1} ellipsizeMode="tail">Monday-Friday</Text>

    <Text>09:00 AM -01:00 PM</Text>
</View>

<View style={{backgroundColor:'white',marginHorizontal:4,marginVertical:15, paddingHorizontal:15,borderRadius:8, paddingVertical:10,width:width/2.2,  borderWidth:0.5,borderColor:'lightgray'}}>
<Text style={{ color: '#60606C', fontSize: 15, fontWeight: 'bold',  }} numberOfLines={1} ellipsizeMode="tail">Saturday</Text>

    <Text>09:00 AM -01:00 PM</Text>
</View>


</ScrollView>




<TouchableOpacity   activeOpacity={0.8}
                                style={{ width:width/1.1,alignSelf:'center', flexDirection:'row',alignItems:'center', paddingVertical: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: '#EEEEF6', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 3 }}>
                               
                               
             <CustomIcon
                                                                       iconType="FontAwesome"
                                                                       name="phone"
                                                                       size={24}
                                                                       color="#60606C"
                                                                     
                                                                      />         
                                <Text style={{ color: '#60606C', fontWeight: 'bold',fontSize:16 }}>  Contact Clinic</Text>
                        
                        
                            </TouchableOpacity>




                            {/* <Text style={{ color: '#60606C', fontSize: 15, fontWeight: 'bold',paddingHorizontal:15,marginTop:10 }} numberOfLines={1} ellipsizeMode="tail">Photos</Text> */}




                            {/* <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
 


 
<Image style={{width: width/2.5, height: 120,marginLeft:10,marginRight:5, marginTop:10, borderRadius: 12, alignSelf:'center' 
        
      }} source={require('../assets/doc9.jpg')} />
 
 <Image style={{width: width/2.5, height: 120,marginLeft:10,marginRight:5, marginTop:10, borderRadius: 12, alignSelf:'center' 
        
    }} source={require('../assets/doc9.jpg')} />



<Image style={{width: width/2.5, height: 120,marginLeft:10,marginRight:5, marginTop:10, borderRadius: 12, alignSelf:'center' 
        
    }} source={require('../assets/doc9.jpg')} />

 
 </ScrollView> */}





 {/* <View style={{ flexDirection: 'row', alignItems: 'center',justifyContent:'space-between',  marginTop: 10,borderRadius:8,marginTop:20, marginBottom:100, paddingHorizontal:15,width:width/1.1,alignSelf:'center',backgroundColor:'#FFF3ED',paddingVertical:10 }}>
            <Icon name="flag" type="FontAwesome" style={{ color: "#FF8651", fontSize: 24}} />                                 


              <Text style={{ color: '#FF8651', width:'80%',  fontWeight: '600',fontSize:15 }}> Report a Problem</Text>
            <Icon name="chevron-right" type="Entypo" style={{ color: "#FF8651", fontSize: 24}} />                                 

            </View> */}

<View style={{marginBottom:100}}></View>
 

                </ScrollView>



                <View style={{ flexDirection: 'row', backgroundColor: 'white', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, position: 'absolute', bottom: 0, width: width, paddingVertical: 4 }}>
               
                    <TouchableOpacity activeOpacity={0.8} onPress={() =>this. Add_appointment()} style={{ width: width / 1.1, borderRadius: 4, height: 45, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2B79C3' }}>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Book Appointment</Text>
                    </TouchableOpacity>

                </View>



                <RBSheet
                    ref={ref => {
                        this.RBSheet = ref;
                    }}
                    height={320}
                    openDuration={250}
                    closeOnDragDown={true}
                    customStyles={{
                        container: {
                            paddingHorizontal: 20,
                            backgroundColor: '#f9f9fa',
                            borderTopLeftRadius: 40,
                            borderTopRightRadius: 40,
                        },
                        draggableIcon: {
                            backgroundColor: "lightgray",
                        },
                    }}
                >
                    <View>
                        {this.state.my_like == false ?
                            <Text style={{ fontSize: 18, color: 'black', marginTop: 30, fontWeight: 'bold', textAlign: 'center' }}>Mark as Favourites?</Text>
                            :
                            <Text style={{ fontSize: 18, color: 'black', marginTop: 30, fontWeight: 'bold', textAlign: 'center' }}>Remove from Favourites?</Text>
                        }
                        <View style={{ borderBottomWidth: 1, borderColor: 'lightgray', marginVertical: 15 }}></View>

                        <View style={{ width: width / 1.1, alignSelf: 'center', backgroundColor: 'white', paddingHorizontal: 10, paddingVertical: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', shadowOffset: { width: 1, height: 1, }, shadowOpacity: 0, shadowRadius: 1, elevation: 1 }}>
                            <ImageLoad

                                style={{ width: 90, height: 90, borderRadius: 15 }}
                                loadingStyle={{ size: 'large', color: 'blue' }}
                                source={{ uri: this.props.profile }}
                                borderRadius={15}

                                placeholderStyle={{ width: 90, height: 90, borderRadius: 15 }}

                            />

                            <View style={{ marginLeft: 13, width: '65%' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text numberOfLines={1} style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>{this.props.name1}</Text>

                                    {this.state.my_like == false ?
                                         <CustomIcon
                                        iconType="AntDesign"
                                        name="hearto"
                                        size={20}
                                        color="#FE0000"
                                      
                                       />      
                                        :

                                        <CustomIcon
                                        iconType="AntDesign"
                                        name="heart"
                                        size={20}
                                        color="#FE0000"
                                      
                                       />    
                                     }

                                </View>

                                <View style={{ borderBottomWidth: 2, borderColor: '#f8f8f9', marginVertical: 13 }}></View>

                                <Text numberOfLines={1} style={{ color: 'gray', fontSize: 13 }}>{this.props.category} | {this.props.address}</Text>

                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 7 }}>
                                     <CustomIcon
                                        iconType="FontAwesome"
                                        name="star-half-empty"
                                        size={18}
                                        color="#FE0000"
                                       />  
                                    <Text style={{ color: 'gray', fontSize: 13, marginLeft: 5 }}>{this.props.a_r} (Total Reviews {this.props.reviews})</Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
                            <TouchableOpacity onPress={() => this.RBSheet.close()} activeOpacity={0.8}
                                style={{ width: width / 2.3, paddingVertical: 13, justifyContent: 'center', alignItems: 'center', borderRadius: 100, backgroundColor: '#eef3ff', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 3 }}>
                                <Text style={{ color: '#FE0000', fontWeight: 'bold' }}>Cancel</Text>
                            </TouchableOpacity>
                            {this.state.my_like == false ?
                                <TouchableOpacity onPress={() => this.Like_Station()} activeOpacity={0.8}
                                    style={{ width: width / 2.3, paddingVertical: 13, justifyContent: 'center', alignItems: 'center', borderRadius: 100, backgroundColor: '#FE0000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 3 }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Yes, Mark</Text>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity onPress={() => this.Unlike_Station()} activeOpacity={0.8}
                                    style={{ width: width / 2.3, paddingVertical: 13, justifyContent: 'center', alignItems: 'center', borderRadius: 100, backgroundColor: '#FE0000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 3 }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Yes, Unmark</Text>
                                </TouchableOpacity>
                            }
                        </View>

                    </View>
                </RBSheet>

{/* 

                <Modal visible={this.state.visible2} transparent={true}>
                    <ImageViewer enableSwipeDown onSwipeDown={this.onSwipeDown} imageUrls={this.selectedImage} />
                </Modal>

  */}

            </View>

        )
    }
}

const styles = StyleSheet.create({

    map: {
        width: width,
        height: height / 3.5
    },
    phoneinput: {
        fontSize: 16,
        paddingLeft: 15,
        // textAlign: 'center',
        width: '100%',
        marginTop: 15
    },
    unselect: {
         alignItems:'center',justifyContent:'center',width:width/4,borderRadius:4,backgroundColor:'#f7f7fa',paddingVertical:10,marginTop:10,marginLeft:10
      },
      select: {
        alignItems:'center',justifyContent:'center',width:width/4,borderRadius:4,backgroundColor:'#00B0AD',paddingVertical:10,marginTop:10,marginLeft:10
      },
      unselect_text: {
        color: '#032644', fontWeight: 'bold'
    
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
   
      text1: {
        color: 'gray', fontSize: 15, fontWeight: '400', marginTop: 5
      },
      text: {
        color: '#00B0AD', fontSize: 15, fontWeight: '400', marginTop: 5,fontWeight:'bold'
      },
      view1: {
        paddingHorizontal: 15, paddingVertical: 7,  justifyContent: 'center', alignItems: 'center', marginLeft: 5, marginRight: 5,
      },
      view: {
        paddingHorizontal: 15, paddingVertical: 7,   justifyContent: 'center', alignItems: 'center', marginLeft: 5, marginRight: 5, borderBottomColor:'#00B0AD',borderBottomWidth:2
      }
})





export default Doctor_Appointment_Profile;