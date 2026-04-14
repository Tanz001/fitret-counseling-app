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
  Keyboard,
  KeyboardAvoidingView,
  FlatList
} from 'react-native';
import CustomIcon from '../components/CustomIcon';
 

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;
class All_Items extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
       text1:2,
       text2:1,
       item_type:"Lost",
       users:[]
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
    this.get_users()
  };
 
  

  changebtn = async (value, val) => {
    this.setState({
        item_type: val,
    });

    if (this.state[value] == 2) {
      this.setState({
        text1: 1,
        text2: 1,
       



        [value]: 2,
      });
    } else {
      this.setState({
        text1: 1,
        text2: 1,
      

        [value]: 2,
      });
    }
 
 

    

  };




  get_users = async () => {
   

    const api = 'http://192.168.0.123:3000/tanzeel/practice/getusers';

    console.log('API URL:', api);
    

    try {
      const response = await fetch(api, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
 
        },
       });

      const responseData = await response.json();
       

      if (responseData.success == true && responseData.data != null) {
        let items = responseData.data;
 
        console.log('objectsssssssssssssssss', items);

        this.setState({
          users: items,
        });
      } else {
        this.setState({
          skalton: false,
          smoothies: [],
        });
        // Handle error in response
        alert(responseData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
     }
  };




  


  Delete_User = async val => {
    console.log('iddddddddddddddddddddddddd', val);
     

    const api = `http://192.168.0.123:3000/tanzeel/practice/user/${val}`;
 
    console.log('API URL:', api);
     

    try {
      const response = await fetch(api, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
           // "check-code": "1a9b",
        },
        // body: JSON.stringify(credentials),
      });

      const responseData = await response.json();
      console.log('Response Data:', responseData);

      if (responseData.success == true) {
 alert('user deleted!')
        // Optionally, handle successful verification (e.g., navigate to a different screen)
      } else {
        // Handle error in response
        alert(responseData.message || 'Email verification failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      this.setState({spinner: false});
    }
  };




  render() {
    return (
      <View style={{flex:1,backgroundColor:"white"}}>
        <StatusBar backgroundColor="#5B0001" barStyle="light-content" />

       <ScrollView>
       


       <View
  style={{
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    width: width,
    borderBottomColor: 'lightgray',
    borderBottomWidth: 1,
  }}>
  
  <Text style={{color: 'black', fontWeight: 'bold', fontSize: 20,}}>
    Requests
  </Text>
  <Text></Text>



</View>


          {/* <View
            style={{
              width: width / 1.1,
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 25,
            }}>
            <TouchableOpacity
              onPress={() => this.changebtn('text1', 'Lost')}
              style={
                this.state.text1 == 2 ? styles.active_btn : styles.in_active_btn
              }>
              <Text
                style={
                  this.state.text1 == 2
                    ? styles.active_text
                    : styles.in_active_text
                }>
                Lost Items
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.changebtn('text2', 'Found')}
              style={
                this.state.text2 == 2 ? styles.active_btn : styles.in_active_btn
              }>
              <Text
                style={
                  this.state.text2 == 2
                    ? styles.active_text
                    : styles.in_active_text
                }>
                  Found Items
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
             
              style={
                this.state.text3 == 2 ? styles.active_btn : styles.in_active_btn
              }>
               
               <Text
                style={
                  this.state.text3 == 2
                    ? styles.active_text
                    : styles.in_active_text
                }>
                   
              </Text>
            </TouchableOpacity>

            
          </View>

          {this.state.item_type == 'Lost' &&

            <Text
              style={{
                color: 'gray',
                fontWeight: '400',
                fontSize: 13,
                marginLeft: 25,
                marginTop: 20,
                maxWidth: '60%',
              }}>
             Lost something? Don’t worry, your belongings are just a search away!
            </Text>
          
            }

           
           {this.state.item_type == 'Found' &&
            <Text
              style={{
                color: 'gray',
                fontWeight: '400',
                fontSize: 13,
                marginLeft: 25,
                marginTop: 20,
                maxWidth: '80%',
              }}>
                Found something? Help reunite it with its owner and make someone's day!
             
            </Text>
          }



 
<View
            activeOpacity={1}
            style={{
              borderWidth: 1,
              height: 45,
              borderWidth: 1,
              borderColor: 'lightgray',
              elevation: 3,
              backgroundColor: 'white',
              width: width / 1.1,
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              marginTop: 15,
            }}>
            <TextInput
              placeholder="Search Items"
              placeholderTextColor={'black'}
              style={{
                paddingHorizontal: 15,
                width: width / 1.2,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 6,
                backgroundColor: 'white',
                borderColor: 'white',
              }}
            />

            <CustomIcon
              iconType="Feather"
              name="search"
              size={25}
              color="#5B0001"
              style={{marginRight: 10}}
            />
          </View>




          <TouchableOpacity 
activeOpacity={0.8}  style={{backgroundColor:'white',width:width/1.1, alignSelf:'center',borderRadius:8,paddingHorizontal:15,paddingVertical:10,shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,marginBottom:10,marginTop:10}}>
<View style={{flexDirection:'row',alignItems:'center',borderBottomColor:"lightgray",borderBottomWidth:1,paddingBottom:10 }}>
 

 
<View style={{marginLeft:10,width:'80%' }}>
    <View style={{flexDirection:'row',alignItems:'center' ,  justifyContent:'space-between',width:'100%' ,   }}>

        <Text allowFontScaling={false} style={{color:'#032644',fontWeight:'bold',fontSize:16}}>Tanzeel Qaiser</Text>
  
     </View>
        <Text allowFontScaling={false} style={{color:'gray',fontWeight:'500', fontSize:13}}>Wallet</Text>
   
     
    </View>
<Image style={{ width:50, height:50, borderRadius: 40}} source={require('../assets/person.webp')} />
 
     
</View>
 

<View style={{flexDirection:'row',alignItems:'center' ,marginTop:10,  justifyContent:'space-between',width:'100%' ,   }}>
        <View style={{flexDirection:'row',alignItems:'center', }}>
        <CustomIcon 
  iconType="Entypo"
  name="calendar"
  size={14}
  color="gray"
  

  
/>      

                <Text allowFontScaling={false} style={{color:'gray', fontSize:11,fontWeight:'bold'}}> 12-12-2024</Text>
             
          
        </View>
   
        <View style={{flexDirection:'row',alignItems:'center',}}>
          
                <CustomIcon 
  iconType="AntDesign"
  name="clockcircle"
  size={14}
  color="gray"
  

  
/>      

                <Text allowFontScaling={false} style={{color:'gray', fontSize:11,fontWeight:'bold'}}> 10:00 am</Text>
                    
        </View>
   
        <View style={{flexDirection:'row',alignItems:'center',}}>
                          
                <CustomIcon 
  iconType="Entypo"
  name="location"
  size={14}
  color="gray"
  

  
/>      
                             
           
                <Text allowFontScaling={false} style={{color:'gray', fontSize:11,fontWeight:'bold'}}>  CSR1</Text>
              
        </View>
   

       
    </View>


    

            <TouchableOpacity
           
              style={{
                width: width/1.2,
                alignSelf:"center",
                borderRadius: 6,
                backgroundColor: '#5B0001',
                paddingVertical: 13,
                paddingHorizontal: 10,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop:10
              }}>
              <Text
                style={{
                  color: 'white',
                  fontWeight: '600',
                  fontSize: 12,
                }}>
                View Details
              </Text>
            </TouchableOpacity>
         


</TouchableOpacity> */}


 

<FlatList
                    data={this.state.users}
               
                     
                    keyExtractor={(item, index) => index.toString()}
                    scrollEnabled={false}
                    renderItem={({ item }) => {
                      let id = item._id
                      return (
                 
<View style={{width:width/1.2,alignSelf:"center",alignItems:"center",justifyContent:"center",paddingVertical:10,borderWidth:1,backgroundColor:"pink",marginTop:10
}}>
     <Text
                style={{
                  color: 'black',
                  fontWeight: '600',
                  fontSize: 12,
                }}>
                {item.name}
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontWeight: '600',
                  fontSize: 12,
                }}>
                {item.email}
              </Text>

              <CustomIcon
    iconType="Feather"
    name="log-out"
    size={15}
    color="white"
     onPress={()=>this.Delete_User(id)}
  />

</View>

                      );
                    }}
                  />









        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
 
    in_active_btn: {
        width: '34%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 10,
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
      },
      active_btn: {
        width: '34%',
        ustifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: '#CDB071',
        borderBottomWidth: 4,
        paddingBottom: 10,
      },
      active_text: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 14,
      },
      in_active_text: {
        color: 'gray',
        fontWeight: '500',
        fontSize: 14,
      },
});

export default All_Items;
