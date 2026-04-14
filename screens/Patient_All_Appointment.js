
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
    Pressable,
    Dimensions,
    BackHandler,
    FlatList
 
} from 'react-native';
import CustomIcon from '../components/CustomIcon';
 import Connection from "../connection";
 import ImageLoad from 'react-native-image-placeholder';
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import RBSheet from "react-native-raw-bottom-sheet";
import AsyncStorage from '@react-native-async-storage/async-storage';

  const width = Dimensions.get('screen').width
const height = Dimensions.get('screen').height

class Patient_All_Appointment extends React.Component {

    constructor(props) {

        super(props)

        this.state = {

            text1: 1,
            text2: 1,
            text3: 1,
            //   text4:1,
            check_design: 'pending',

           
            text4: 1,
            text5: 1,
            text6: 1,
            text7: 1,
            text8: 1,
            text9: 1,
            text10: 1,
            text0:2,

            visible: false,
            data1: [],
            skalton: false,
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
        if (this.props.user == true) {
             this.props.navigation.pop()

        }
        else {
            BackHandler.exitApp();

        }
        return true;
    }


    changebtn(value, val) {
        this.setState({
            check_design: val,

        })

        if (this.state[value] == 2) {



            this.setState({
                text1: 1,
                text2: 1,
                text3: 1,
                text0: 1,



                [value]: 2,


            })
        }
        else {
            this.setState({
                text1: 1,
                text2: 1,
                text3: 1,
                text0: 1,

                [value]: 2,
              



            })

        }
        setTimeout(() => {
            this.get_appointments_user()

        }, 100);
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
            "hardwareBackPress",
            this.backAction
        );
       
        let user = await AsyncStorage.getItem('user');

        console.log("userrrrrrrrr", user);
        let parsed = JSON.parse(user);
        let first_name = parsed[0].first_name;
        let last_name = parsed[0].last_name;
        let id = parsed[0].id;
        let address = parsed[0].address;
        let email = parsed[0].email;
        let phone_number = parsed[0].phonenumber;
        let gender = parsed[0].gender;
        let role = parsed[0].role;
        let profile = parsed[0].profile;
    
        if(profile!=null){
    
          let user_profile = Connection + 'images/' + profile;
          console.log("profileeeeeeeee",user_profile)
          this.setState({user_profile:user_profile})
        }else{
          this.setState({user_profile:profile})
    
        }
    
    
    
      
    
        this.setState({
          first_name: first_name,
          last_name:last_name,
          user_id: id,
          phone_number: phone_number,
          email: email,
          address: address,
          gender:gender,
          role:role,
           
    
    
        })


this.get_appointments_user()

    }





    get_appointments_user = () => {

        let uploaddata = new FormData();
  
        this.setState({
            skalton: true
        })
        console.log("user_id", this.state.user_id)
        console.log("status", this.state.check_design)
  
  
        uploaddata.append("user_id", this.state.user_id);
        uploaddata.append("status", this.state.check_design);
  
        let api = Connection + "apis.php?action=DisplayAllAppointmentsUser";
        console.log("pass => ", api);
        fetch(api, {
            method: "POST",
            headers: {
                "Content-Type": "multipart/form-data",   
                otherHeader: "foo",
            },
            body: uploaddata,
  
        })
            .then((response) => response.json())
            .then((response) => {
  
                let record4 = response.response  
                console.log('responseeeeeeeeeeeeeeeeeeeee',response.response)
                if (record4 != 'fail') {
  
                    this.setState({
                        data1: record4,
                        skalton: false
                    })
  
  
                } else {
                    this.setState({
                        data1: "",
                        skalton: false,
                    })
  
                }
            })
            .catch((error) => {
                console.error(error);
            });
  
    };
  
  
  
   

toast=()=>{
    Toast.show('You already submitted review for this appointment.')
}



  

    next = () => {
        this.RBSheet1.close()
         this.props.navigation.navigate('cancel_appointment')
    }
    dd = () => {
        // this.get_appointments_user()
    }

 


    render() {


        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
<StatusBar backgroundColor="white" barStyle="light-content" />

 
           
                <View style={{ paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', paddingBottom: 13, shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, backgroundColor: 'white' }}>
                <View style={{width:'100%', flexDirection: "row", justifyContent: 'space-between', alignItems: "center", paddingHorizontal: 15,  backgroundColor: "white",    }}>
            {/* <Icon onPress={() => { Actions.pop() }} name="keyboard-backspace" type="MaterialCommunityIcons" style={{ color: "black", fontSize: 28 }} /> */}
            <Text allowFontScaling={false} style={{ color: '#2B79C3', fontSize: 22, fontWeight: 'bold' }}>Appointments</Text>

            {/* <Icon   name="search" type="FontAwesome" style={{ color: "#FAB915", fontSize: 24 }} /> */}
            <Image style={{width:70,height:70,   }} resizeMode="contain" source={require('../assets/indigo.png')}/>





          </View>

                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>



                        <View style={{ paddingHorizontal: 10, borderRadius: 10, alignSelf: 'center', height: 50, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 5 }}>

                            <TouchableOpacity style={{ width: width / 4, justifyContent: 'center', alignItems: 'center' }} onPress={() => this.changebtn("text0", 'pending')}  >
                                <View style={(this.state.text0 == 1 ? styles.in_active_button : styles.active_button)}>
                                    <Text style={(this.state.text0 == 1 ? styles.in_active_text : styles.active_text)}>Pending</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ width: width / 4, justifyContent: 'center', alignItems: 'center' }} onPress={() => this.changebtn("text1", 'active')}  >
                                <View style={(this.state.text1 == 1 ? styles.in_active_button : styles.active_button)}>
                                    <Text style={(this.state.text1 == 1 ? styles.in_active_text : styles.active_text)}>Upcoming</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ width: width / 4, justifyContent: 'center', alignItems: 'center' }} onPress={() => this.changebtn("text2", 'complete')}  >
                                <View style={(this.state.text2 == 1 ? styles.in_active_button : styles.active_button)}>
                                    <Text style={(this.state.text2 == 1 ? styles.in_active_text : styles.active_text)}>Completed</Text>
                                </View>
                            </TouchableOpacity>


                            <TouchableOpacity style={{ width: width / 4, justifyContent: 'center', alignItems: 'center' }} onPress={() => this.changebtn("text3", 'cancel')}  >
                                <View style={(this.state.text3 == 1 ? styles.in_active_button : styles.active_button)}>
                                    <Text style={(this.state.text3 == 1 ? styles.in_active_text : styles.active_text)}>Cancelled</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                </View>





            




              

                    <ScrollView >


<ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>

<View style={{backgroundColor:'#EEEEF6',flexDirection:'row',alignItems:'center', marginHorizontal:4,marginVertical:15,marginLeft:10, paddingHorizontal:15,borderRadius:60,alignItems:'center',paddingVertical:10, justifyContent:'center',borderWidth:0.5,borderColor:'lightgray'}}>
 <CustomIcon
                                        iconType="FontAwesome"
                                         name="filter"
                                         size={16}
                                         style={{marginRight:10}}
                                         color="gray" 
                                        
                                              />

    <Text>Filters</Text>
</View>


<View style={{backgroundColor:'white',marginHorizontal:4,marginVertical:15, paddingHorizontal:15,borderRadius:60,alignItems:'center',paddingVertical:10, justifyContent:'center',borderWidth:0.5,borderColor:'lightgray'}}>

    <Text>In-Clinic</Text>
</View>


<View style={{backgroundColor:'white',marginHorizontal:4,marginVertical:15, paddingHorizontal:15,borderRadius:60,alignItems:'center',paddingVertical:10, justifyContent:'center',borderWidth:0.5,borderColor:'lightgray'}}>

    <Text>Video Consult</Text>
</View>


<View style={{backgroundColor:'white',marginHorizontal:4,marginVertical:15, paddingHorizontal:15,borderRadius:60,alignItems:'center',paddingVertical:10, justifyContent:'center',borderWidth:0.5,borderColor:'lightgray'}}>

    <Text>For-Myself</Text>
</View>

</ScrollView>






















                       









<View>


{this.state.skalton == true ?


<SkeletonPlaceholder>

    <View
        style={{
            width: "90%",
            alignSelf: "center",
            height: 150,
            borderRadius: 5,
            paddingVertical: 10,
            paddingHorizontal: 20,
            marginTop: 15,
            backgroundColor: "white",
        }}
    ></View>


    <View
        style={{
            width: "90%",
            alignSelf: "center",
            height: 150,
            borderRadius: 5,
            paddingVertical: 10,
            paddingHorizontal: 20,
            marginTop: 15,
            backgroundColor: "white",
        }}
    ></View>



    <View
        style={{
            width: "90%",
            alignSelf: "center",
            height: 150,
            borderRadius: 5,
            paddingVertical: 10,
            paddingHorizontal: 20,
            marginTop: 15,
            backgroundColor: "white",
        }}
    ></View>

<View
        style={{
            width: "90%",
            alignSelf: "center",
            height: 150,
            borderRadius: 5,
            paddingVertical: 10,
            paddingHorizontal: 20,
            marginTop: 15,
            backgroundColor: "white",
        }}
    ></View>
    <View
        style={{
            width: "90%",
            alignSelf: "center",
            height: 150,
            borderRadius: 5,
            paddingVertical: 10,
            paddingHorizontal: 20,
            marginTop: 15,
            backgroundColor: "white",
        }}
    ></View>
    <View
        style={{
            width: "90%",
            alignSelf: "center",
            height: 150,
            borderRadius: 5,
            paddingVertical: 10,
            paddingHorizontal: 20,
            marginTop: 15,
            backgroundColor: "white",
        }}
    ></View>



</SkeletonPlaceholder>


:

<View>

{this.state.data1==""?

<View style={{marginTop:120,width:width/1.2,alignSelf:"center",alignItems:"center"}}>
<Text allowFontScaling={false} style={{color:'#032644',fontWeight:'500',fontSize:16}}>You don't have any appointment.</Text>

    </View>
    :
<View>

<FlatList
  data={this.state.data1}
  keyExtractor={(item, index) => index.toString()}
  renderItem={({ item }) => {
   
   let image = item.doctor_profile
   let doctor_profile = Connection + 'images/' + image
let id = item.id
let appointment_day = item.appointment_day
let appointment_date = item.appointment_date
let appointment_time = item.appointment_time
let doctor_name = item.doctor_name 
let status = item.status 
let category = item.category
let user_name = item.user_name
let doctor_address = item.doctor_address
let payment_method = item.payment_method
let fee = item.fee
let appointment_for = item.appointment_for
let appointment_reason = item.appointment_reason








 
 

const profileImage = doctor_profile && doctor_profile !== 'null' && doctor_profile !== 'undefined'
? { uri: doctor_profile }
: require('../assets/empty.png');
 

    return (

      
       
      <View> 
                        
                        {this.state.check_design=='pending'&&




<TouchableOpacity activeOpacity={0.8}  

// onPress={() => Actions.Doctor_Appointment_Profile({type_1:'',  day_1:this.state.day_1, provider:false, tax_percentage:tax_percentage,language:language,stripe_key:stripe_key, app: app, fcm_token: fcm_token, s_key: s_key, paypal: paypal, access: access, name1: name, profile: profile, category: category, doctor_id: doctor_id, experience: experience, fee: fee, address: address, lat: lat, lng: lng, total_review: total_review, a_r: a_r, license_number: license_number, degree: degree, c_name: c_name, appointment: appointment,email:email })} 

              style={{ width: width / 1.1, alignSelf: 'center', backgroundColor: 'white', borderRadius: 8, flexDirection: 'row', paddingVertical: 15, paddingHorizontal: 10, shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, marginTop: 15,marginBottom:10  }}>
           
             <View>
            
 


                  
<ImageLoad
    style={{ width: 70, height: 70,alignSelf:"center"}}
    
       loadingStyle={{size: 'large', color: 'blue'}}
       source={profileImage}
       borderRadius={40}
       placeholderStyle={{  width: 70, height: 70,alignSelf:"center"}}
    
     />    

 
 
        
          </View>  
              <View style={{ marginLeft: 10, width: '77%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: 10 }}>
                  <View>
                  <View style={{flexDirection:'row',alignItems:'center',marginTop:5}}>
              
             <CustomIcon
                                        iconType="AntDesign"
                                         name="questioncircle"
                                         size={16}
                                          color="orange" 
                                        
                                              />

             <Text style={{color:'orange', fontSize:12,fontWeight:'bold'}}>   {appointment_date} {appointment_time} (Pending) </Text>
          
            
                 
     </View>
                    <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold', }} numberOfLines={1} ellipsizeMode="tail">Dr.{doctor_name}</Text>
                    <Text style={{ color: 'black', fontSize: 14, fontWeight: '400' }}> {category}</Text>
                    <Text style={{ color: 'black', fontSize: 14, fontWeight: '400' }}> Booked for {appointment_for}</Text>

                

 
                  </View>
           

                </View>
                <TouchableOpacity onPress={()=>this.props.navigation.navigate('patient_site_appointment_detai',{
doctor_name:doctor_name,
profileImage:profileImage,
appointment_id:id,
fee:fee,
appointment_date:appointment_date,
appointment_day:appointment_day,
appointment_for:appointment_for,
appointment_time:appointment_time,
appointment_reason:appointment_reason,
user_name:user_name,
payment_method:payment_method,
doctor_address:doctor_address

                })} style={{paddingHorizontal:10,marginTop:5, paddingVertical:8,backgroundColor:'#2B79C3',alignItems:'center',justifyContent:'center',borderRadius:6}}>
<Text style={{color:'white'}}>View Details</Text>
          </TouchableOpacity>

              </View>
            </TouchableOpacity>




    }























{this.state.check_design=='active'&&

<View>


<TouchableOpacity activeOpacity={0.8}  

// onPress={() => Actions.Doctor_Appointment_Profile({type_1:'',  day_1:this.state.day_1, provider:false, tax_percentage:tax_percentage,language:language,stripe_key:stripe_key, app: app, fcm_token: fcm_token, s_key: s_key, paypal: paypal, access: access, name1: name, profile: profile, category: category, doctor_id: doctor_id, experience: experience, fee: fee, address: address, lat: lat, lng: lng, total_review: total_review, a_r: a_r, license_number: license_number, degree: degree, c_name: c_name, appointment: appointment,email:email })} 

              style={{ width: width / 1.1, alignSelf: 'center', backgroundColor: 'white', borderRadius: 8, flexDirection: 'row', paddingVertical: 15, paddingHorizontal: 10, shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, marginTop: 15,marginBottom:10  }}>
           
             <View>
             <ImageLoad
    style={{ width: 70, height: 70,alignSelf:"center"}}
    
       loadingStyle={{size: 'large', color: 'blue'}}
       source={profileImage}
       borderRadius={40}
       placeholderStyle={{  width: 70, height: 70,alignSelf:"center"}}
    
     />    

 
        
          </View>  
              <View style={{ marginLeft: 10, width: '77%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: 10 }}>
                  <View>
                  <View style={{flexDirection:'row',alignItems:'center',marginTop:5}}>
              
             <CustomIcon
                                        iconType="MaterialCommunityIcons"
                                         name="calendar-clock"
                                         size={16}
                                          color="#2B79C3" 
                                        
                                              />
             <Text style={{color:'#2B79C3', fontSize:12,fontWeight:'bold'}}> {appointment_date} {appointment_time}</Text>
          
            
                 
     </View>
                    <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold', }} numberOfLines={1} ellipsizeMode="tail">Dr. {doctor_name}</Text>
                    <Text style={{ color: 'black', fontSize: 14, fontWeight: '400' }}> {category}</Text>
                    <Text style={{ color: 'black', fontSize: 14, fontWeight: '400' }}> Booked for {appointment_for}</Text>

                

 
                  </View>
           

                </View>
                <TouchableOpacity activeOpacity={0.8} onPress={()=>this.props.navigation.navigate('patient_site_appointment_detai')}
                style={{paddingHorizontal:10,marginTop:5, paddingVertical:8,backgroundColor:'#2B79C3',alignItems:'center',justifyContent:'center',borderRadius:6}}>
<Text style={{color:'white'}}>View Details</Text>
          </TouchableOpacity>

              </View>
            </TouchableOpacity>





 

            </View>
    }
 
 





 {this.state.check_design=='complete'&&

<View>


<TouchableOpacity activeOpacity={0.8}  

// onPress={() => Actions.Doctor_Appointment_Profile({type_1:'',  day_1:this.state.day_1, provider:false, tax_percentage:tax_percentage,language:language,stripe_key:stripe_key, app: app, fcm_token: fcm_token, s_key: s_key, paypal: paypal, access: access, name1: name, profile: profile, category: category, doctor_id: doctor_id, experience: experience, fee: fee, address: address, lat: lat, lng: lng, total_review: total_review, a_r: a_r, license_number: license_number, degree: degree, c_name: c_name, appointment: appointment,email:email })} 

              style={{ width: width / 1.1, alignSelf: 'center', backgroundColor: 'white', borderRadius: 8, flexDirection: 'row', paddingVertical: 15, paddingHorizontal: 10, shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, marginTop: 15,marginBottom:10  }}>
           
             <View>
            
             <ImageLoad
    style={{ width: 70, height: 70,alignSelf:"center"}}
    
       loadingStyle={{size: 'large', color: 'blue'}}
       source={profileImage}
       borderRadius={40}
       placeholderStyle={{  width: 70, height: 70,alignSelf:"center"}}
    
     />    
 
 
        
          </View>  
              <View style={{ marginLeft: 10, width: '77%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: 10 }}>
                  <View>
                  <View style={{flexDirection:'row',alignItems:'center',marginTop:5}}>
              
             <CustomIcon
                                        iconType="FontAwesome5"
                                         name="calendar-check"
                                         size={16}
                                          color="#2B79C3" 
                                        
                                              />
             <Text style={{color:'#2B79C3', fontSize:12,fontWeight:'bold'}}> {appointment_date} {appointment_time}</Text>
          
            
                 
     </View>
                    <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold', }} numberOfLines={1} ellipsizeMode="tail">Dr. {doctor_name}</Text>
                    <Text style={{ color: 'black', fontSize: 14, fontWeight: '400' }}> {category}</Text>
                    <Text style={{ color: 'black', fontSize: 14, fontWeight: '400' }}> Booked for {appointment_for}</Text>

                

 
                  </View>
           

                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10,width:'100%' }}>
                            <TouchableOpacity   activeOpacity={0.8}
                                style={{ width: '47%', paddingVertical: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: '#F7F2FC', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 3 }}>
                                <Text style={{ color: '#2B79C3', fontWeight: 'bold' }}>View Reports</Text>
                            </TouchableOpacity>
                          
                                <TouchableOpacity  activeOpacity={0.8}
                                    style={{ width: '47%', paddingVertical: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: '#2B79C3', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 3 }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Book Again</Text>
                                </TouchableOpacity>
                     
                        </View>
                <View style={{paddingHorizontal:10, marginTop:10, paddingVertical:8,backgroundColor:'#EBF7ED',alignItems:'center',justifyContent:'space-between',borderRadius:6,flexDirection:'row'}}>
 
                <CustomIcon
                                        iconType="FontAwesome"
                                         name="star"
                                         size={16}
                                          color="#077D55" 
                                        
                                              />
<Text style={{color:'#077D55'}}>Submit a Review</Text>

 
<CustomIcon
                                        iconType="Entypo"
                                         name="cross"
                                         size={16}
                                          color="#077D55" 
                                        
                                              />
          </View>

              </View>
            </TouchableOpacity>






 

            </View>
    }
 





 {this.state.check_design=='cancel'&&




<TouchableOpacity activeOpacity={0.8}  

// onPress={() => Actions.Doctor_Appointment_Profile({type_1:'',  day_1:this.state.day_1, provider:false, tax_percentage:tax_percentage,language:language,stripe_key:stripe_key, app: app, fcm_token: fcm_token, s_key: s_key, paypal: paypal, access: access, name1: name, profile: profile, category: category, doctor_id: doctor_id, experience: experience, fee: fee, address: address, lat: lat, lng: lng, total_review: total_review, a_r: a_r, license_number: license_number, degree: degree, c_name: c_name, appointment: appointment,email:email })} 

              style={{ width: width / 1.1, alignSelf: 'center', backgroundColor: 'white', borderRadius: 8, flexDirection: 'row', paddingVertical: 15, paddingHorizontal: 10, shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, marginTop: 15,marginBottom:10  }}>
           
             <View>
             <ImageLoad
    style={{ width: 70, height: 70,alignSelf:"center"}}
    
       loadingStyle={{size: 'large', color: 'blue'}}
       source={profileImage}
       borderRadius={40}
       placeholderStyle={{  width: 70, height: 70,alignSelf:"center"}}
    
     />    
 
 
        
          </View>  
              <View style={{ marginLeft: 10, width: '77%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: 10 }}>
                  <View>
                  <View style={{flexDirection:'row',alignItems:'center',marginTop:5}}>
              <CustomIcon
                                        iconType="FontAwesome5"
                                         name="calendar-times"
                                         size={16}
                                          color="red" 
                                        
                                              />

             <Text style={{color:'red', fontSize:12,fontWeight:'bold'}}>  {appointment_date} {appointment_time}  </Text>
          
            
                 
     </View>
                    <Text style={{ color: 'black', fontSize: 16, fontWeight: 'bold',textDecorationLine: 'line-through', textDecorationStyle: 'solid' }} numberOfLines={1} ellipsizeMode="tail">Dr. {doctor_name}</Text>
                    <Text style={{ color: 'black', fontSize: 14, fontWeight: '400',textDecorationLine: 'line-through', textDecorationStyle: 'solid' }}> {category}</Text>
                    <Text style={{ color: 'black', fontSize: 14, fontWeight: '400',textDecorationLine: 'line-through', textDecorationStyle: 'solid' }}> Booked for {appointment_for}</Text>

                

 
                  </View>
           

                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10,width:'100%' }}>
                            <TouchableOpacity activeOpacity={0.8} onPress={()=>this.props.navigation.navigate('patient_site_appointment_detai')}
                                style={{ width: '47%', paddingVertical: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: '#F7F2FC', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 3 }}>
                                <Text style={{ color: '#159AB3', fontWeight: 'bold' }}>View details</Text>
                            </TouchableOpacity  >
                          
                                <TouchableOpacity  activeOpacity={0.8}
                                    style={{ width: '47%', paddingVertical: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: '#159AB3', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 3 }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Book Again</Text>
                                </TouchableOpacity>
                     
                        </View>

              </View>
            </TouchableOpacity>




    }

     


  </View>

     

    );
  }}
/>
</View>
    }
    </View>

}

</View>







 
                    </ScrollView>
                 



                <RBSheet
                    ref={ref => {
                        this.RBSheet1 = ref;
                    }}
                    closeOnDragDown={true}
                    height={220}
                    openDuration={270}
                    customStyles={{
                        container: {
                            paddingHorizontal: 20,
                            borderTopLeftRadius: 40,
                            borderTopRightRadius: 40,
                        },
                        draggableIcon: {
                            backgroundColor: "lightgray",
                        },
                    }}

                >
                    <View>
                        <Text style={{ fontSize: 18, color: 'red', marginTop: 5, textAlign: 'center', fontWeight: 'bold' }}>Cancel Appointment!</Text>

                        <View style={{ width: '100%', backgroundColor: 'lightgray', height: 1, marginVertical: 15 }}></View>
                        <Text style={{ fontSize: 14, color: 'gray', textAlign: 'center', fontWeight: 'bold', paddingHorizontal: 30 }}>Are you sure you want to cancel your appointment?</Text>
                        {/* <Text style={{ fontSize: 14, color: 'gray', marginTop: 10, textAlign: 'center', fontWeight: 'bold', paddingHorizontal: 30 }}>{this.props.Only_funds_will_return_your_accouont}</Text> */}

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 }}>
                            <TouchableOpacity onPress={() => this.RBSheet1.close()} activeOpacity={0.8}
                                style={{ width: width / 2.3, paddingVertical: 13, justifyContent: 'center', alignItems: 'center', borderRadius: 100, backgroundColor: '#eef3ff', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 3 }}>
                                <Text style={{ color: '#2B79C3', fontWeight: 'bold' }}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => this.next()} activeOpacity={0.8}
                                style={{ width: width / 2.3, paddingVertical: 13, justifyContent: 'center', alignItems: 'center', borderRadius: 100, backgroundColor: '#2B79C3', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 3 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Yes Cancel</Text>
                            </TouchableOpacity>
                        </View>


                    </View>
                </RBSheet>


            </View>

        )
    }
}

const styles = StyleSheet.create({

    active_button: {
        width: '98%',
        height: 45,
        borderBottomColor: '#2B79C3',
        borderBottomWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',

    },

    in_active_button: {
        width: '98%',
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },

    active_text: {
        color: '#2B79C3',
        fontSize: 14,
        fontWeight: 'bold'
    },

    in_active_text: {
        color: 'black',
        fontSize: 14,
        fontWeight: 'bold'


    },
    text1: {
        color: 'black', fontSize: 12, fontWeight: '400', marginTop: 5,
      },
      text: {
        color: 'white', fontSize: 12, fontWeight: '400', marginTop: 5
      },
      view1: {
        width:65, height:80, borderRadius: 8, justifyContent: 'center', alignItems: 'center',  backgroundColor:'white'
      },
      view: {
        width:65 ,height:80, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2B79C3'
      }

})




export default Patient_All_Appointment;