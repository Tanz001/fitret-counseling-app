import React, { Component } from 'react';
import { View, ImageBackground, PermissionsAndroid, StyleSheet, Modal, Image, Dimensions, DeviceEventEmitter, Clipboard, AppState, TextInput, Text, ScrollView, BackHandler, TouchableOpacity, AsyncStorage, Platform } from 'react-native';
 import Connection from "../connection";
import ImageLoad from 'react-native-image-placeholder';
import { connect } from "react-redux";
import CustomIcon from '../components/CustomIcon';
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import RBSheet from "react-native-raw-bottom-sheet";
import * as ImagePicker from "react-native-image-picker";
 import { Open, Web } from 'react-native-openanything';
import ImageViewer from 'react-native-image-zoom-viewer';
import DocumentPicker, { types } from 'react-native-document-picker';
import moment from 'moment';
 

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

DeviceEventEmitter.addListener('Proximity', function (data) {
  // --- do something with events
  console.log("dataaaaaaa => ", data)
});

class Chatroom extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      data1: [],
      spinner: false,
      appState: AppState.currentState,
      data1: [],
      id: '',
      receiver_id: '',

      message: '',
      existingchat: [],
      check: false,
      name: '',
      text: "Send",
      checkid: true,
      status: false,
      display_name: '',
      imageSource1: null,
      test: [],
      chatid: '',
      chat_iiid: 0,
      user_iid: '',
      chat_name: '',
      chat_image: '',
      skalton: false,
      sender_image: null,
      visible: false,
      copymessage: '',
      spinner2: false,

    }
    // this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }
  componentWillMount() {
    // BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }
  componentWillUnmount() {
    // BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    // AppState.removeEventListener('change', this._handleAppStateChange);
  }



  // _handleAppStateChange = async (nextAppState) => {
  //   if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
  //     console.log('Apphgg has come to the foreground!')
  //     let user = await AsyncStorage.getItem('customer');
  //     if (user != null) {
  //       let parsed = JSON.parse(user);
  //       let id = parsed[0].id;
  //       let role = parsed[0].role;
  //       let uploaddata = new FormData();
  //       uploaddata.append('receiver_id', id);
  //       let api = Connection + 'rest_apis.php?action=check_call';
  //       console.log(api)
  //       fetch(api, {
  //         method: 'POST',
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //           "otherHeader": "foo",
  //         },
  //         body: uploaddata,
  //       })
  //         .then((response) => response.json())
  //         .then((response) => {
  //           console.log("umerrrererererererererererer", response.response);
  //           let hasRecord = response.response;
  //           if (hasRecord == "fail") {
  //           }
  //           else {
  //             let api = Connection + 'rest_apis.php?action=call_status_change';
  //             console.log(api)
  //             fetch(api, {
  //               method: 'POST',
  //               headers: {
  //                 "Content-Type": "multipart/form-data",
  //                 "otherHeader": "foo",
  //               },
  //               body: uploaddata,
  //             })
  //               .then((response) => response.json())
  //               .then((response) => {
  //                 console.log("Calling status  ", response.response);
  //               })
  //             console.log("calllllllll22222222222222")
  //             let receiver_name = hasRecord[0].sender_name
  //             let receiver_image = hasRecord[0].sender_image
  //             let type = hasRecord[0].type
  //             if (receiver_image != null) {
  //               receiver_image = Connection + 'images/' + receiver_image
  //             }
  //             let room = hasRecord[0].room
  //             console.log("calllllllll", room)
  //             if (type == "audio") {
              
  //               this.props.navigation.navigate('pick_audio_call',{receiver: receiver_name, receiver_image: receiver_image, room: room})
  //             }
  //             else {
  //                this.props.navigation.navigate('pick_video_call',{receiver: receiver_name, receiver_image: receiver_image, room: room})
  //             }
  //           }
  //           //let len = hasRecord
  //         })
  //         .catch((error) => {
  //           console.error(error);
  //         })
  //     }

  //   }
  //   else {
  //     console.log("hamzaaagagagagagagagagag")
  //   }
  //   this.setState({ appState: nextAppState });
  // }



  // onButtonPress = () => {
  //   BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  //   // then navigate
  //   navigate('NewScreen');
  // }
  // handleBackButtonClick() {
  
  //   this.props.navigation.pop()
  //   return true;
  // }



  notification = async () => {

    let to = this.props.fcm_token;
    fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'key= AAAAUd3TRyo:APA91bG5J5r0nYRLiBsOtaCGLLbdfIyQUhoDaV8OyN4NVyR3JB0o8kXDg2S8igwTXQHZxPonJgDYeBVO2Fuf3hvisKRg5c1RbSS40_KU6LuyKaxlIfKFMYQBBnhQ9nXnjIiMJLDqHz-U'//cloud server key
      },
      body: JSON.stringify({
        "to": to,
        "priority": "high",
        "notification": {
          "title": "Neurolife",
          "body": this.state.name + " is messaged you",
          "sound": 'default',
          "icon": "myicon",

        }
      }
      )
    }).then(res => res.json())
      .then(resjson => console.log("test", resjson))
      .catch(err => console.log("error =>", err))
  }

  call_for_check = async () => {
    let user = await AsyncStorage.getItem('customer');
    if (user != null) {
      let parsed = JSON.parse(user);
      let id = parsed[0].id;
      let uploaddata = new FormData();
      uploaddata.append('receiver_id', id);
      let api = Connection + 'rest_apis.php?action=check_call';
      console.log(api)
      fetch(api, {
        method: 'POST',
        headers: {
          "Content-Type": "multipart/form-data",
          "otherHeader": "foo",
        },
        body: uploaddata,
      })
        .then((response) => response.json())
        .then((response) => {
          console.log(response.response);
          let hasRecord = response.response;
          if (hasRecord == "fail") {
          }
          else {
            let api = Connection + 'rest_apis.php?action=call_status_change';
            console.log(api)
            fetch(api, {
              method: 'POST',
              headers: {
                "Content-Type": "multipart/form-data",
                "otherHeader": "foo",
              },
              body: uploaddata,
            })
              .then((response) => response.json())
              .then((response) => {
                console.log("Calling status  ", response.response);
              })
            console.log("calllllllll22222222222222")
            let receiver_name = hasRecord[0].sender_name
            let receiver_image = hasRecord[0].sender_image
            let type = hasRecord[0].type
            if (receiver_image != null) {
              receiver_image = Connection + 'images/' + receiver_image
            }
            let room = hasRecord[0].room
            console.log("calllllllll", room)
            if (type == "audio") {
               this.props.navigation.navigate('pick_audio_call',{receiver: receiver_name, receiver_image: receiver_image, room: room})
            }
            else {
               this.props.navigation.navigate('pick_call',{receiver: receiver_name, receiver_image: receiver_image, room: room})

            }
          }
          //let len = hasRecord
        })
        .catch((error) => {
          console.error(error);
        })
    }
  }


  notification_1 = async () => {

    let to = this.props.fcm_token;
    fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'key= AAAAUd3TRyo:APA91bG5J5r0nYRLiBsOtaCGLLbdfIyQUhoDaV8OyN4NVyR3JB0o8kXDg2S8igwTXQHZxPonJgDYeBVO2Fuf3hvisKRg5c1RbSS40_KU6LuyKaxlIfKFMYQBBnhQ9nXnjIiMJLDqHz-U'//cloud server key
      },
      body: JSON.stringify({
        "to": to,
        "priority": "high",
        "notification": {
          "title": "Neurolife",
          "body": this.state.name + " is completed your chat session.",
          "sound": 'default',
          "icon": "myicon",

        }
      }
      )
    }).then(res => res.json())
      .then(resjson => console.log("test", resjson))
      .catch(err => console.log("error =>", err))
  }



  handleDocumentSelection = async () => {

    let response = await DocumentPicker.pick({
      presentationStyle: 'fullScreen',
    })
    let pdf_file_type_2 = response[0].type

    if (pdf_file_type_2 == undefined) {
      alert("This file is not pdf.");
    }
    else {
      let pdf_file_size = response[0].size
      let type_name1 = response[0].name
      let type_name2 = type_name1.split(".pdf")
      let type_name = type_name2[0]



      let pdf_file_type_1 = pdf_file_type_2.split("/")
      let pdf_file_type = pdf_file_type_1[1]

      if (pdf_file_type == "pdf") {
        if (pdf_file_size <= 1000000) {
          let pdf_file = response[0].uri

          this.setState({ filepathforchat: pdf_file, type_name: type_name })
          this.send_first_message('file')
          this.RBSheet1.close()
          this.setState({ spinner: true })
        } else {
          alert("File must be less than 1mb");
        }
      }
      else {

        alert("This file is not pdf.");
      }
    }
    this.RBSheet1.close()

  }



  OpenRbsheet = (message) => {

    this.setState({
      copymessage: message
    })
    this.RBSheet2.open()
  };


  copyToClipboard = () => {
    Clipboard.setString(this.state.copymessage);
    this.RBSheet2.close()
  };


  onClickImage = async (item) => {
    this.selectedImage = [
      {
        url: item,
        props: {
          source: item
        },
      },
    ];
    this.setState({
      visible: true
    })
  }

  onSwipeDown = () => {
    this.setState({
      visible: false
    })
  }

  componentDidMount = async () => {

    // AppState.addEventListener('change', this._handleAppStateChange);
    // let user = await AsyncStorage.getItem('customer');
    // let parsed = JSON.parse(user);
    // let id = parsed[0].id;
    // let role = parsed[0].role;
    // let name = parsed[0].name;
    // let profile1 = parsed[0].profile;
    // let receiver_id = this.props.receiver_id;
    // let chat_name = this.props.chat_name
    // let path = this.props.path

    // this.setState({
    //   id: id,
    //   receiver_id: receiver_id,
    //   chat_name: chat_name,
    //   path: path,
    //   name: name,
    //   sender_image: profile1,
    //   role: role,

    // })

    // if (this.state.chat_iiid) {
    //   this.getexistingchat1();
    // }
    // else {
    //   this.getchatid();
    // }
    // this.timer = setInterval(() => this.getexistingchat(), 3000)

  }


  getchatid() {
    this.setState({
      spinner1: true
    })
    if (this.props.disable == 'false') {
      var api = Connection + 'rest_apis.php?action=get_existing_chat';

    } else {
      var api = Connection + 'rest_apis.php?action=get_existing_chat_true';

    }


    fetch(api, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: `sender_id=${this.state.id}&receiver_id=${this.state.receiver_id}`,

    })
      .then((response) => response.json())
      .then((json) => {
        let resjson = json.response
        console.log("chat is => ", resjson)
        this.setState({
          spinner1: false
        })

        if (json.response == "fail") {
          this.setState({
            checkid: false
          })

        }
        else {
          console.log("chat id ", Object.keys(resjson))
          let id = resjson[0].id
          console.log("chat id ", id)

          this.setState({

            chat_iiid: id,
            checkid: true


          })

          this.getexistingchat1()


        }


      })
      .catch((error) => {
        console.error(error);
      })


  }


  getexistingchat() {

    if (this.props.disable == 'false') {
      var api = Connection + 'rest_apis.php?action=get_chat_messages_by_id';

    } else {
      var api = Connection + 'rest_apis.php?action=get_chat_messages_by_id_true';

    }



    fetch(api, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: `chat_iiid=${this.state.chat_iiid}`,
    })
      .then((response) => response.json())
      .then((json) => {

        let response = json.response

        if (json.response == "fail") {
          this.setState({
            checkid: false
          })
        }
        else {
          this.setState({
            test: response,

            existingchat: response,
            checkid: true,
            skalton: false

          })

        }


        this.setState({

          skalton: false
        })


      })
      .catch((error) => {
        console.error(error);
      })


  }



  getexistingchat1() {

    if (this.props.disable == 'false') {
      var api = Connection + 'rest_apis.php?action=get_chat_messages_by_id';

    } else {
      var api = Connection + 'rest_apis.php?action=get_chat_messages_by_id_true';

    }
    console.log("check email ", api)

    fetch(api, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: `chat_iiid=${this.state.chat_iiid}`,
    })
      .then((response) => response.json())
      .then((json) => {

        let response = json.response
        console.log("chat record", response);
        if (json.response == "fail") {
          this.setState({
            checkid: false
          })
        }
        else {
          this.setState({
            test: response,
            existingchat: response,
            checkid: true,
            text: "Send",
          })
        }

        this.setState({
          spinner1: false
        })

      })
      .catch((error) => {
        console.error(error);
      })


  }




  uploadimage1 = async () => {
    ImagePicker.launchImageLibrary({ noData: true, mediaType: 'photo', allowsEditing: true, quality: 0.7 }, (response) => {
      // console.log('response =', response);
      if (response.didCancel) {
        console.log('user cancelled  image picker');
      } else if (response.error) {
        console.log('imagepicker error : ', response.error);
      } else if (response.customButton) {
        console.log('user tapped  custom button : ', response.customButton);
      } else {
        console.log("outdoor image ", response)


        let text = response.assets[0].uri
        let fileSize = response.assets[0].fileSize
        if (fileSize <= 1000000) {

          this.setState({ imageSource1: text, })

          this.send_first_message('image')

          this.setState({ spinner: true })
        } else {
          alert("Image size must be less than 1mb");
        }
      }
      this.RBSheet1.close()

    });


  }


  Open_Image = (val) => {
    Open(val)
  }

  open_file = (val) => {
    Web(val)
  }





  send_first_message = (text) => {


    let aa = moment(new Date()).format("YYYY-MM-DD hh:mm A");
    let split = aa.split(' ')
    let time = split[1]
    let am_pm = split[2]
    let final_time = time + "" + am_pm
    let newImage = null
    let type = null
    let type_name = "type_name"



    if (text == "text") {
      if (this.state.message == "") {
        alert("Do not send empty message");

      }
      else {


        if (this.state.checkid == true) {
          this.setState({
            text: "Sending.."
          })
          let uploaddata = new FormData();

          let chatid1 = this.state.chat_iiid

          uploaddata.append('chat_id', chatid1);
          uploaddata.append('sender_id', this.state.id);
          uploaddata.append('receiver_id', this.state.receiver_id);
          uploaddata.append('message', this.state.message);
          uploaddata.append('time', final_time);

          let api = Connection + 'rest_apis.php?action=send_new_message';

          fetch(api, {
            method: 'POST',
            headers: {
              "Content-Type": "multipart/form-data",
              "otherHeader": "foo",
            },
            body: uploaddata,
          })
            .then((response) => response.json())
            .then((json) => {

              if (json.response == "fail") {

                alert(this.props.network_Fail)

              }
              else {


                this.notification()
                this.setState({
                  message: '',
                  text: "Send",

                })
              }
            })
            .catch((error) => {
              console.error(error);
            })
        }

        else {

          this.setState({
            text: "Sending.."
          })


          let uploaddata = new FormData();

          uploaddata.append('sender_id', this.state.id);
          uploaddata.append('receiver_id', this.state.receiver_id);
          uploaddata.append('message', this.state.message);
          uploaddata.append('time', final_time);

          let api = Connection + 'rest_apis.php?action=send_first_new_message';

          fetch(api, {
            method: 'POST',
            headers: {
              "Content-Type": "multipart/form-data",
              "otherHeader": "foo",
            },
            body: uploaddata,
          })
            .then((response) => response.json())
            .then((response) => {

              if (response.response == "fail") {

                alert(this.props.network_Fail)

              }
              else {


                this.notification()
                this.setState({
                  message: '',
                  text: "Send",
                  checkid: true,

                  chat_iiid: response.response
                })

              }
            })
            .catch((error) => {
              console.error(error);
            })


        }


      }
    } else {

      if (text == "image") {
        newImage = {
          uri: this.state.imageSource1,
          name: "my_photo.jpg",
          type: "image/jpg",
        };
        type = "image"
      } else if (text == "file") {

        newImage = {
          uri: this.state.filepathforchat,
          name: "my_file.pdf",
          type: "file/pdf",
        };
        type = "file"
        type_name = this.state.type_name



      }

      if (this.state.checkid == true) {
        this.setState({
          text: "Sending.."
        })
        let uploaddata = new FormData();

        let chatid1 = this.state.chat_iiid

        uploaddata.append('chat_id', chatid1);
        uploaddata.append('sender_id', this.state.id);
        uploaddata.append('receiver_id', this.state.receiver_id);
        uploaddata.append("image", newImage);
        uploaddata.append("type", type);
        uploaddata.append("type_name", type_name);
        uploaddata.append('time', final_time);

        let api = Connection + 'rest_apis.php?action=send_new_message_with_image';


        fetch(api, {
          method: 'POST',
          headers: {
            "Content-Type": "multipart/form-data",
            "otherHeader": "foo",
          },
          body: uploaddata,
        })
          .then((response) => response.json())
          .then((json) => {

            if (json.response == "fail") {


              alert(this.props.network_Fail)
            }
            else {


              this.notification()
              this.setState({
                message: '',
                text: "Send",
                spinner: false,
              })


            }
          })
          .catch((error) => {
            console.error(error);
          })
      }

      else {


        if (text == "image") {
          newImage = {
            uri: this.state.imageSource1,
            name: "my_photo.jpg",
            type: "image/jpg",
          };
          type = "image"
        } else if (text == "file") {

          newImage = {
            uri: this.state.filepathforchat,
            name: "my_file.pdf",
            type: "file/pdf",
          };
          type = "file"
          type_name = this.state.type_name

        }


        this.setState({
          text: "Sending.."
        })


        let uploaddata = new FormData();

        uploaddata.append('sender_id', this.state.id);
        uploaddata.append('receiver_id', this.state.receiver_id);
        uploaddata.append("image", newImage);
        uploaddata.append("type", type);
        uploaddata.append("type_name", type_name);
        uploaddata.append('time', final_time);
        let api = Connection + 'rest_apis.php?action=send_first_new_message_with_image';

        fetch(api, {
          method: 'POST',
          headers: {
            "Content-Type": "multipart/form-data",
            "otherHeader": "foo",
          },
          body: uploaddata,
        })
          .then((response) => response.json())
          .then((response) => {

            if (response.response == "fail") {

              alert(this.props.network_Fail)

            }
            else {


              this.notification()
              this.setState({
                message: '',
                text: "Send",
                checkid: true,
                chat_iiid: response.response,
                spinner: false,
              })




            }
          })
          .catch((error) => {
            console.error(error);
          })


      }

    }
  }



  uploadfile = async () => {

    FilePickerManager.showFilePicker(null, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled file picker');
      }
      else if (response.error) {
        console.log('FilePickerManager Error: ', response.error);
      }
      else {

        let fileName = response.fileName
        let filepath = response.path
        let fileuri = response.uri


        console.log('JJJJJJJJJJJJJJJJJJJJJJJJ', fileName)


        this.setState({
          filepath: filepath,
          fileName: fileName,
          fileuri: fileuri,

        });
        setTimeout(() => {

          this.send_first_message('file')
        }, 1000)
      }
      this.RBSheet1.close()

    })
  };





  uploadimage_Camera_1 = async () => {
    ImagePicker.launchCamera({ noData: true, mediaType: 'photo', allowsEditing: true, quality: 0.7 }, (response) => {
      // console.log('response =', response);
      if (response.didCancel) {
        console.log('user cancelled  image picker');
      } else if (response.error) {
        console.log('imagepicker error : ', response.error);
      } else if (response.customButton) {
        console.log('user tapped  custom button : ', response.customButton);
      } else {
        console.log("outdoor image ", response.assets[0].uri)

        let text = response.assets[0].uri
        let fileSize = response.assets[0].fileSize
        console.log("outdoor image1111111111 ", fileSize)

        if (fileSize <= 1000000) {
          console.log("outdoor image1111111111 ", text)

          this.setState({ imageSource1: text, })

          this.send_first_message('image')

          this.setState({ spinner: true })
        } else {
          alert("Image size must be 1mb");
        }
      }
      this.RBSheet1.close()



    });


  }


  requestCameraPermission_1 = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "App Camera Permission",
          message: "App needs access to your camera ",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Camera permission given");
        this.uploadimage_Camera_1();
      } else {
        console.log("Camera permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };


  Check_PlatForm = () => {
    if (Platform.OS === "ios") {
      this.uploadimage_Camera_1();
      console.log("Platform Ios")
    }
    else {
      this.requestCameraPermission_1();
      console.log("Platform Android")
    }
  }


  handleDelete = () => {
    this.setState({
      visible: false,
    });
  };




  opendialogue = () => {
    this.setState({
      visible: true,
    });
  };


  createtable1 = () => {
    let table = []

    let record = this.state.existingchat
    let len = record.length

    if (record != 'fail') {
      for (let i = 0; i < len; i++) {
        let message = record[i].message
        let sender_id = record[i].sender_id
        let time = record[i].time
        let splitmessage = message.split(".")

        if (splitmessage[1] != "jpg" && splitmessage[1] != "pdf") {
          table.push(<View>
            {
              <View>
                {sender_id != this.state.id ? <View >
                  <View style={{ maxWidth:'80%',paddingHorizontal:15,marginTop:20}}>

 

<View style={{flexDirection:'row', }}>
              <Image style={{width:30,height:30,borderRadius:100,alignSelf:'flex-end',marginRight:10,marginBottom:10}} source={require('../assets/doctorr.jpg')} />
              <View style={{ maxWidth: '80%'}}>
              <View style={{backgroundColor:'#FE0000',marginTop:10, borderTopRightRadius:10,borderTopLeftRadius:10,borderBottomRightRadius:10,paddingVertical:13,paddingHorizontal:13}}>
                 <Text style={{color:'white'}}>?</Text>
              </View>
              <Text style={{color:'gray',fontSize:10, fontWeight:'bold' }}>{time}</Text>

              </View>
           
              </View>
            
         </View>
                </View> :
                  <View>
                   <TouchableOpacity onPress={()=>this.RBSheet2.open(message)} activeOpacity={0.8}  style={{alignItems:'flex-end',paddingHorizontal:15,marginTop:15}}>
                <View style={{backgroundColor:'lightgray',borderTopLeftRadius:10,borderBottomLeftRadius:10,borderBottomRightRadius:10,paddingVertical:13,paddingHorizontal:13,maxWidth: '80%'}}>
                    <Text style={{color:'black',fontWeight:'bold'}}>{message}</Text>
                </View>
                <Text style={{color:'gray',fontSize:10, fontWeight:'bold',marginTop:5}}>{time}</Text>
                </TouchableOpacity>
                  </View>
                }
              </View>

            }
          </View>
          )
        }
        else if (splitmessage[1] == "jpg") {
          let finalimage = Connection + 'Chat_Images/' + message;


          table.push(<View>
            {
              <View>
                {sender_id != this.state.id ? <View >
                  <View style={{ maxWidth: '70%', alignSelf: 'flex-start', borderRadius: 15, padding: 2, backgroundColor: "white", marginLeft: 10, marginTop: 10, width: width / 2.3 }}>
                    <TouchableOpacity onPress={() => this.onClickImage(finalimage)} ><ImageLoad
                      style={{ width: "100%", height: 150, borderRadius: 8, borderColor: "#FE0000", borderWidth: 2 }}
                      loadingStyle={{ size: 'large', color: 'black' }}
                      source={{ uri: finalimage }}
                      placeholderSource={require('../assets/doctorr.jpg')}
                      placeholderStyle={{ width: "95%", height: 140, borderRadius: 8 }}
                      borderRadius={8}
                      borderColor="black"
                      borderWidth={5}
                    />
                    </TouchableOpacity>
                  </View>
                  <Text style={{ textAlign: 'left', marginLeft: 15, marginTop: 3, color: "#a4a2c4", fontSize: 10 }}>{time}</Text>

                </View> :
                  <View>
                    <View style={{ maxWidth: '70%', alignSelf: 'flex-end', borderRadius: 15, padding: 2, backgroundColor: "#684994", marginRight: 10, marginTop: 10, width: width / 2.3 }}>
                      <TouchableOpacity onPress={() => this.onClickImage(finalimage)} ><ImageLoad
                        style={{ width: "100%", height: 150, borderRadius: 8, borderColor: "#FE0000", borderWidth: 2 }}
                        loadingStyle={{ size: 'large', color: 'black' }}
                        source={{ uri: finalimage }}
                        placeholderSource={require('../assets/doctorr.jpg')}
                        placeholderStyle={{ width: "95%", height: 140, borderRadius: 8 }}
                        borderRadius={8}
                        borderColor="black"
                        borderWidth={5}
                      /></TouchableOpacity>
                    </View>
                    <Text style={{ textAlign: 'right', marginRight: 15, marginTop: 3, color: "#a4a2c4", fontSize: 10 }}>{time}</Text>


                  </View>
                }
              </View>

            }
          </View>
          )
        } else if (splitmessage[1] == "pdf") {
          let finalimage = Connection + 'Chat_Images/' + message;


          table.push(<View>
            {
              <View>
                {sender_id != this.state.id ? <View >
                  <View style={{ maxWidth: '70%', alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "lightgray", marginLeft: 10, marginTop: 10 }}>
                    <TouchableOpacity onPress={() => this.open_file(finalimage)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '70%' }}>
 
  <CustomIcon
                                                                      iconType="FontAwesome5"
                                                                      name="file-pdf"
                                                                      size={30}
                                                                      color="#595788"
                                                                    
                                                                     />

                      <Text style={{ color: '#595788', maxWidth: '100%', marginLeft: 15 }}>{message}</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={{ textAlign: 'left', marginLeft: 15, marginTop: 3, color: "#a4a2c4", fontSize: 10 }}>{time}</Text>

                </View> :
                  <View>
                    <View style={{ maxWidth: '70%', alignSelf: 'flex-end', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "#FE0000", marginRight: 10, marginTop: 10 }}>
                      <TouchableOpacity onPress={() => this.open_file(finalimage)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '70%' }}>
                         <CustomIcon
                                                                      iconType="FontAwesome5"
                                                                      name="file-pdf"
                                                                      size={30}
                                                                      color="white"
                                                                    
                                                                     />
                        <Text style={{ color: 'white', maxWidth: '100%', marginLeft: 15 }}>{message}</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={{ textAlign: 'right', marginRight: 15, marginTop: 3, color: "#a4a2c4", fontSize: 10 }}>{time}</Text>


                  </View>
                }
              </View>

            }
          </View>
          )
        }
      }
      return table
    }
    else {
      let img = []
      img.push(<View style={{ flex: 1, justifyContent: 'center' }} >
        {
          <View>

          </View>
        }</View>)
      return img
    }
  }




  complete_session = () => {




    this.setState({ spinner2: true, })

    let uploaddata = new FormData();

    let chatid1 = this.state.chat_iiid



    uploaddata.append('chat_id', chatid1);

    uploaddata.append("doctor_id", this.state.id);
    uploaddata.append("user_id", this.props.receiver_id);




    let api = Connection + "rest_apis.php?action=complete_session";
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

        if (response.response == "fail") {
          this.setState({
            spinner2: false,
          });
          alert(this.props.Please_try_again_later);
        } else {
          this.setState({
            spinner2: false,
          });
          this.notification_1()

            this.props.navigation.navigate('Doctor_Tab_Screen')

        }
      })
      .catch((error) => {
        console.error(error);
      });

  };



  render() {



    return (

      <>

        <View style={{ flex: 1 }}>

        <View style={{ paddingHorizontal: 15, paddingVertical: 8, backgroundColor: "white",    }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <CustomIcon
                                                          iconType="MaterialCommunityIcons"
                                                          name="keyboard-backspace"
                                                          size={28}
                                                          color="black"
                                                          onPress={() => this.props.navigation.pop()}
                                                       
                                                         />           

<Image  style={styles.image} source={require('../assets/doctorr.jpg')} />

              <View style={this.state.role == 'doctor' ? { width: '70%', paddingHorizontal: 10 } : { width: '70%', paddingHorizontal: 10 }}>
                <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 15 }}>Dr. Jane Fernandes Dcosta</Text>
                <Text numberOfLines={1} style={{ color: 'gray', maxWidth: '100%',fontSize:10  }}>Last active at 12:34 PM</Text>
              </View>

              {/* {this.state.role == 'doctor' && this.props.disable == 'false' && */}

                <TouchableOpacity  >

                       <CustomIcon
                                                                            iconType="Entypo"
                                                                            name="dots-three-vertical"
                                                                            size={22}
                                                                            color="black"
                                                                            style={{marginLeft: 10, marginRight: 5}}
                                                                          
                                                                           />
                </TouchableOpacity>
              {/* } */}
            </View>

          </View>

          {this.state.skalton == true ?

            <SkeletonPlaceholder>
              <View
                style={{
                  width: "30%",

                  height: 55,
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  marginTop: 10,
                  marginLeft: 15,
                  backgroundColor: 'white'
                }}
              ></View>

              <View
                style={{
                  width: "60%",

                  height: 55,
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  marginTop: 10,
                  marginLeft: 15,
                  backgroundColor: 'white'
                }}
              ></View>

              <View
                style={{
                  width: "60%",

                  height: 55,
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  marginTop: 10,
                  marginLeft: 15,
                  backgroundColor: 'white'
                }}
              ></View>



              <View
                style={{
                  width: "30%",
                  alignSelf: "flex-end",
                  height: 55,
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  marginTop: 10,
                  backgroundColor: "white",
                  flexDirection: 'row',
                  marginRight: 15
                }}
              ></View>
              <View
                style={{
                  width: "60%",
                  alignSelf: "flex-end",
                  height: 55,
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  marginTop: 10,
                  backgroundColor: "white",
                  flexDirection: 'row',
                  marginRight: 15
                }}
              ></View>
              <View
                style={{
                  width: "60%",
                  alignSelf: "flex-end",
                  height: 55,
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  marginTop: 10,
                  backgroundColor: "white",
                  flexDirection: 'row',
                  marginRight: 15
                }}
              ></View>
              <View
                style={{
                  width: "30%",

                  height: 55,
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  marginTop: 10,
                  marginLeft: 15,
                  backgroundColor: 'white'
                }}
              ></View>

              <View
                style={{
                  width: "60%",
                  alignSelf: "flex-end",
                  height: 55,
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  marginTop: 10,
                  backgroundColor: "white",
                  flexDirection: 'row',
                  marginRight: 15
                }}
              ></View>


              <View
                style={{
                  width: "60%",

                  height: 55,
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  marginTop: 10,
                  marginLeft: 15,
                  backgroundColor: 'white'
                }}
              ></View>

              <View
                style={{
                  width: "30%",

                  height: 55,
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  marginTop: 10,
                  marginLeft: 15,
                  backgroundColor: 'white'
                }}
              ></View>

              <View
                style={{
                  width: "60%",
                  alignSelf: "flex-end",
                  height: 55,
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  marginTop: 10,
                  backgroundColor: "white",
                  flexDirection: 'row',
                  marginRight: 15
                }}
              ></View>

              <View
                style={{
                  width: "60%",
                  alignSelf: "flex-end",
                  height: 55,
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  marginTop: 10,
                  backgroundColor: "white",
                  flexDirection: 'row',
                  marginRight: 15
                }}
              ></View>

              <View
                style={{
                  width: "30%",

                  height: 55,
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  marginTop: 10,
                  marginLeft: 15,
                  backgroundColor: 'white'
                }}
              ></View>


            </SkeletonPlaceholder>

            :

            <ScrollView ref={ref => { this.scrollView = ref }}
              onContentSizeChange={() => this.scrollView.scrollToEnd({ animated: true })} style={{ marginBottom: 85 }}>
 
 <TouchableOpacity activeOpacity={0.8}  style={{alignItems:'flex-end',paddingHorizontal:15,marginTop:15}}>
                <View style={{backgroundColor:'#2B79C3',borderTopLeftRadius:18,borderBottomLeftRadius:18,borderTopRightRadius:18,paddingBottom:5, paddingTop:13,paddingHorizontal:13,maxWidth: '80%'}}>
                    <Text style={{color:'white',fontWeight:'bold'}}>Hello doctor</Text>
                <Text style={{color:'lightgray',fontSize:10, fontWeight:'bold',marginTop:5,textAlign:'right'}}>10:00 PM</Text>

                </View>
                </TouchableOpacity>  


                <TouchableOpacity activeOpacity={0.8}  style={{alignItems:'flex-end',paddingHorizontal:15,marginTop:15}}>
                <View style={{backgroundColor:'#2B79C3',borderTopLeftRadius:18,borderBottomLeftRadius:18,borderTopRightRadius:18,paddingBottom:5, paddingTop:13,paddingHorizontal:13,maxWidth: '80%'}}>
                    <Text style={{color:'white',fontWeight:'bold'}}>My body pain is getting worse. I am having a lot of trouble working. What should I do?</Text>
                <Text style={{color:'lightgray',fontSize:10, fontWeight:'bold',marginTop:5,textAlign:'right'}}>10:00 PM</Text>

                </View>
                </TouchableOpacity>  

 <View style={{ maxWidth:'80%',paddingHorizontal:15,marginTop:20}}>

 

<View style={{flexDirection:'row', }}>
              {/* <Image style={{width:30,height:30,borderRadius:100,alignSelf:'flex-end',marginRight:10,marginBottom:10}} source={require('../assets/doctor-11.jpg')} /> */}
              <View style={{ maxWidth: '80%'}}>
              <View style={{backgroundColor:'#EEEEF6',marginTop:10, borderTopRightRadius:18,borderTopLeftRadius:18,borderBottomRightRadius:18,paddingBottom:5, paddingTop:13,paddingHorizontal:13}}>
                 <Text style={{color:'black'}}>Hello John, you can take the painkiller I prescribed. That will help you for sure.</Text>
              <Text style={{color:'gray',fontSize:10, fontWeight:'bold',  }}>09:34 PM</Text>

              </View>

              </View>
           
              </View>



            
         </View>
 
         <TouchableOpacity activeOpacity={0.8}  style={{alignItems:'flex-end',paddingHorizontal:15,marginTop:15}}>
                <View style={{backgroundColor:'#2B79C3',borderTopLeftRadius:18,borderBottomLeftRadius:18,borderTopRightRadius:18,paddingBottom:5, paddingTop:13,paddingHorizontal:13,maxWidth: '80%'}}>
                    <Text style={{color:'white',fontWeight:'bold'}}>Thanks doctor</Text>
                <Text style={{color:'lightgray',fontSize:10, fontWeight:'bold',marginTop:5,textAlign:'right'}}>10:00 PM</Text>

                </View>
                </TouchableOpacity>  
       
              {/* {this.createtable1()} */}

            </ScrollView>
          }


        </View>
 




        <RBSheet
          ref={ref => {
            this.RBSheet2 = ref;
          }}
          height={70}
          openDuration={100}
          customStyles={{
            container: {
              paddingHorizontal: 20,
              paddingVertical: 20

            }
          }}
        >
          <View>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => this.copyToClipboard()} >
               <CustomIcon
                                                                            iconType="AntDesign"
                                                                            name="copy1"
                                                                            size={25}
                                                                            color="black"
                                                                         
                                                                           />
              <Text style={{ fontSize: 20, color: 'black', marginLeft: 5 }}>Copy to Clipboard</Text>
            </TouchableOpacity>
          </View>
        </RBSheet>


        <Modal visible={this.state.visible} transparent={true}>
          <ImageViewer
            enableSwipeDown
            onSwipeDown={this.onSwipeDown}


            imageUrls={this.selectedImage} />
        </Modal>


        <RBSheet
          ref={ref => {
            this.RBSheet6 = ref;
          }}
          closeOnDragDown={true}
          height={200}
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
            <Text style={{ fontSize: 18, color: 'red', marginTop: 5, textAlign: 'center', fontWeight: 'bold' }}>Complete Session</Text>

            <View style={{ width: '100%', backgroundColor: 'lightgray', height: 1, marginVertical: 15 }}></View>
            <Text style={{ fontSize: 14, color: 'gray', textAlign: 'center', fontWeight: 'bold', paddingHorizontal: 30 }}>Are you want to sure complete this session?</Text>
            {/* <Text style={{ fontSize: 14, color: 'gray', marginTop: 10, textAlign: 'center', fontWeight: 'bold', paddingHorizontal: 30 }}>{this.props.Only_funds_will_return_your_accouont}</Text> */}

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 }}>
              <TouchableOpacity onPress={() => this.RBSheet6.close()} activeOpacity={0.8}
                style={{ width: width / 2.3, paddingVertical: 13, justifyContent: 'center', alignItems: 'center', borderRadius: 100, backgroundColor: '#eef3ff', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 3 }}>
                <Text style={{ color: '#FE0000', fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => this.complete_session()} activeOpacity={0.8}
                style={{ width: width / 2.3, paddingVertical: 13, justifyContent: 'center', alignItems: 'center', borderRadius: 100, backgroundColor: '#FE0000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 3 }}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Yes, Complete</Text>
              </TouchableOpacity>
            </View>


          </View>
        </RBSheet>




        
        <RBSheet
          ref={ref => {
            this.RBSheet1 = ref;
          }}
          height={230}
          openDuration={200}
          customStyles={{
            container: {
              paddingHorizontal: 20
            }
          }}
        >
          <View>
            <Text style={{ fontSize: 18, color: 'black', marginTop: 20, fontWeight: 'bold' }}>Choose an action</Text>

            <View style={{ flexDirection: 'row', marginTop: 30, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 13, width: '100%' }}>


              <TouchableOpacity onPress={() => this.uploadimage1()} activeOpacity={0.6}>
                <View style={{ flexDirection: 'column', marginLeft: 10, justifyContent: 'center', alignItems: 'center' }}>
                   <CustomIcon
                                                                            iconType="Entypo"
                                                                            name="images"
                                                                            size={30}
                                                                            color="#FE0000"
                                                                         
                                                                           />
                  <Text style={{ fontSize: 16, color: 'black', fontWeight: 'bold', }}>Gallery</Text>
                </View>
              </TouchableOpacity>



              <TouchableOpacity onPress={() => this.Check_PlatForm()} activeOpacity={0.6}>
                <View style={{ flexDirection: 'column', marginLeft: 40, justifyContent: 'center', alignItems: 'center' }}>
                   <CustomIcon
                                                                            iconType="Entypo"
                                                                            name="camera"
                                                                            size={30}
                                                                            color="#FE0000"
                                                                         
                                                                           />
                  <Text style={{ fontSize: 16, color: 'black', fontWeight: 'bold', }}>Camera</Text>
                </View>
              </TouchableOpacity>


              <TouchableOpacity onPress={() => this.handleDocumentSelection()} activeOpacity={0.6}>
                <View style={{ flexDirection: 'column', marginLeft: 40, justifyContent: 'center', alignItems: 'center' }}>
                  
                  <CustomIcon
                                                                            iconType="FontAwesome5"
                                                                            name="file-pdf"
                                                                            size={30}
                                                                            color="#FE0000"
                                                                         
                                                                           />
                  <Text style={{ fontSize: 16, color: 'black', fontWeight: 'bold', }}>PDF</Text>
                </View>
              </TouchableOpacity>


            </View>

          </View>
        </RBSheet>




       
          <View style={{ position: 'absolute', bottom: 0, width: width }}>
            <View style={{ justifyContent: 'center', alignItems: 'center', width: width }}>
              {this.state.spinner == true &&
                <DotIndicator color='#FE0000' />
              }
            </View>

            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, borderTopWidth: 1, borderColor: 'lightgray', paddingVertical: 13, backgroundColor: 'white' }}>
              <View style={{ alignItems: 'center',width:'100%' }}>
                <TextInput value={this.state.message} style={{ width: '100%', height: 45, borderRadius: 48, paddingLeft: 10, backgroundColor: '#EEEEF6', color: 'black' }} placeholder="Write Message" placeholderTextColor='gray' underlineColorAndroid="transparent" onChangeText={(message) => this.setState({ message })} />
          
                <CustomIcon
                                                                            iconType="MaterialCommunityIcons"
                                                                            name="send"
                                                                            size={18}
                                                                            color="#2B79C3"
                                                                            style={{position: 'absolute',right: 15, top: 12}}
                                                                         onPress={()=>this.RBSheet1.open()}
                                                                           />


<CustomIcon
                                                                            iconType="FontAwesome"
                                                                            name="file"
                                                                            size={18}
                                                                            color="#2B79C3"
                                                                            style={{position: 'absolute', right: 45, top: 12}}
                                                                         onPress={()=>this.RBSheet1.open()}
                                                                           />
              </View>
          
              {/* <Icon onPress={() => { this.send_first_message("text") }} name="ios-send" type="Ionicons" style={{ color: "#FE0000", fontSize: 28 }} /> */}
            </View>
          </View>
    
   
      </>

    )
  }

}




const styles = StyleSheet.create({
  HeaderView: {
    backgroundColor: 'white',
    height: 62,
    borderBottomWidth: 0.5,
    borderBottomColor: 'lightgray'

  },

  ImageAvater: {
    width: 40,
    height: 40,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FE0000'


  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 100,
    // borderWidth: 2,
    // borderColor: '#FE0000'
  },

  inpu: {
    backgroundColor: '#f1f1f1',
    borderWidth: 1,
    borderColor: 'gray',
    width: '95%',
    borderRadius: 32,
    paddingLeft: 52,
    color: 'black',
    alignSelf: 'center'
  },


  mess: {
    maxWidth: '80%',
    backgroundColor: 'lightgray',

    marginTop: 14,
    marginHorizontal: 8,
    alignSelf: 'flex-start',
    padding: 8,
    minWidth: '30%',

    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,


  },
  messL: {
    maxWidth: '80%',
    backgroundColor: '#FE0000',
    marginTop: 14,
    marginHorizontal: 8,
    alignSelf: 'flex-end',
    padding: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,

    minWidth: '30%',

    borderTopRightRadius: 8,
    borderBottomEndRadius: 22,
    borderBottomLeftRadius: 22

  },




  Line: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 20,
    width: width,
    backgroundColor: 'white',
    height: 62,
    borderBottomWidth: 0.5,
    borderBottomColor: 'lightgray',
    paddingLeft: 10



  },
  LineView: {

    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',




  },
})





export default Chatroom;