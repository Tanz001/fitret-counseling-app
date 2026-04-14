import React, {Component} from 'react';
 
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  BackHandler,
  PermissionsAndroid,
  Linking,
  Platform,
} from 'react-native';
 
import CustomIcon from '../components/CustomIcon';
const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

class User_Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      image1: null,
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
      <View style={{flex:1,backgroundColor:"white"}}>
      
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            backgroundColor: 'white',
            paddingVertical: 15,
            borderBottomWidth:1,
            borderBottomColor:"lightgray"
          }}>
 
          <Text
            allowFontScaling={false}
            style={{color: 'black', fontSize: 20, fontWeight: 'bold'}}>
            Profile
          </Text>
        </View>

        <View
          style={{
            width: width,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 15,
            backgroundColor: 'white',
                  borderBottomWidth:1,
            borderBottomColor:"lightgray"
          }}>
         
            <Image
              style={{
                width: 100,
                height: 130,
                borderRadius: 10,
                marginLeft: 15,
              }}
              source={require('../assets/person.webp')}
            />
         

          <View style={{width: '65%', height: 120}}>
            <Text
              allowFontScaling={false}
              style={{color: 'black', fontSize: 23, fontWeight: 'bold'}}
              numberOfLines={1}>
             Ahmad Ali
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                color: '#a6a6a6',
                fontSize: 13,
                marginTop: 5,
                fontWeight: '600',
              }}
              numberOfLines={1}>
            +92323456576
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                color: '#a6a6a6',
                fontSize: 13,
                marginTop: 5,
                fontWeight: '600',
              }}
              numberOfLines={1}>
            Narowal, Pakistan
            </Text>

            <TouchableOpacity
             
              style={{
                width: 120,
                paddingVertical: 8,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                backgroundColor: '#5B0001',
                marginTop: 5,
              }}>
              <Text
                allowFontScaling={false}
                style={{color: 'white', fontSize: 13, fontWeight: '600'}}
                numberOfLines={1}>
                Change profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView>
         
       
          <TouchableOpacity   activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderColor: 'lightgray', width: width / 1.1, alignSelf: 'center', paddingHorizontal: 5 ,justifyContent:"space-between"}}>
 
          <View style={{width:30,height:30,backgroundColor:'#CDB071',alignItems:'center',justifyContent:'center',borderRadius:4}}>

           <CustomIcon

              iconType="Fontisto"
              name="person"
              size={15}
              color="white"
               
            />
           </View>
           
            <Text allowFontScaling={false} style={{ color: 'black', fontSize: 16,fontFamily:'DMSans-Bold', width:"80%" }}>Edit Profile</Text>
    
<CustomIcon
              iconType="Entypo"
              name="chevron-right"
              size={25}
              color="gray"
               
            />
           
          </TouchableOpacity>


 

<TouchableOpacity   activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderColor: 'lightgray', width: width / 1.1, alignSelf: 'center', paddingHorizontal: 5 ,justifyContent:"space-between"}}>
 
<View style={{width:30,height:30,backgroundColor:'#CDB071',alignItems:'center',justifyContent:'center',borderRadius:4}}>

 <CustomIcon
    iconType="AntDesign"
    name="calendar"
    size={15}
    color="white"
     
  />
  </View>
 
 
  <Text allowFontScaling={false} style={{ color: 'black', fontSize: 16,fontFamily:'DMSans-Bold', width:"80%" }}>My Requests</Text>


<CustomIcon
    iconType="Entypo"
    name="chevron-right"
    size={25}
    color="gray"
     
  />
 
</TouchableOpacity>


<TouchableOpacity   activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderColor: 'lightgray', width: width / 1.1, alignSelf: 'center', paddingHorizontal: 5 ,justifyContent:"space-between"}}>
 
<View style={{width:30,height:30,backgroundColor:'#CDB071',alignItems:'center',justifyContent:'center',borderRadius:4}}>

 <CustomIcon
    iconType="FontAwesome5"
    name="clipboard-list"
    size={15}
    color="white"
     
  />
  </View>
 
 
  <Text allowFontScaling={false} style={{ color: 'black', fontSize: 16,fontFamily:'DMSans-Bold', width:"80%" }}>Terms & Policies</Text>

<CustomIcon
    iconType="Entypo"
    name="chevron-right"
    size={25}
    color="gray"
     
  />
 
</TouchableOpacity>





<TouchableOpacity   activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderColor: 'lightgray', width: width / 1.1, alignSelf: 'center', paddingHorizontal: 5 ,justifyContent:"space-between"}}>
 
<View style={{width:30,height:30,backgroundColor:'#CDB071',alignItems:'center',justifyContent:'center',borderRadius:4}}>

 <CustomIcon
    iconType="Feather"
    name="help-circle"
    size={15}
    color="white"
     
  />
 </View>
 
  <Text allowFontScaling={false} style={{ color: 'black', fontSize: 16,fontFamily:'DMSans-Bold', width:"80%" }}>Help and Support</Text>

<CustomIcon
    iconType="Entypo"
    name="chevron-right"
    size={25}
    color="gray"
     
  />
 
</TouchableOpacity>




<TouchableOpacity   activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderColor: 'lightgray', width: width / 1.1, alignSelf: 'center', paddingHorizontal: 5 ,justifyContent:"space-between"}}>
 
<View style={{width:30,height:30,backgroundColor:'#CDB071',alignItems:'center',justifyContent:'center',borderRadius:4}}>

 <CustomIcon
    iconType="Feather"
    name="log-out"
    size={15}
    color="white"
     
  />
 </View>
 
  <Text allowFontScaling={false} style={{ color: 'black', fontSize: 16,fontFamily:'DMSans-Bold', width:"80%" }}>Logout</Text>

<CustomIcon
    iconType="Entypo"
    name="chevron-right"
    size={25}
    color="gray"
     
  />
 
</TouchableOpacity>




        </ScrollView>

     
      </View>
    );
  }
}

export default User_Profile;
