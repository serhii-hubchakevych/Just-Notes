import React, {Component} from 'react';
import {Text, Container, Header, Left, Right, Icon, Button, View, Footer, } from 'native-base';
import {StyleSheet, TextInput, AsyncStorage, Image, ScrollView,   TouchableHighlight, TouchableOpacity  } from 'react-native';
import OfflineNotice from '../parts/OfflineNotice';
import { addUserDataApi } from '../networking/API';
import ImgToBase64 from 'react-native-image-base64'
import ImagePicker from 'react-native-image-crop-picker';
import AnimateLoadingButton from 'react-native-animate-loading-button';
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
 

export class AddNote extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      noteTitle: '',
      noteText: '',
      userToken: '',
      isLoading: false,
      disabledSaveButton: true,
      connectionOffline: false,
      asyncNotesArray: [],
      navigationFlag: '',
      base64Image:[],
      visibleModalForCropImage:false, 
      cropImageBase64:''
    };
  }

  validateNoteTitle(noteTitle) {
    if (noteTitle != '') {
      this.setState({
        noteTitle: noteTitle,
        disabledSaveButton: false,
      });
    } else {
      this.setState({
        disabledSaveButton: true,
      });
    }
  }

  getCallbackDataFromOfflineNotice = callbackData => {
    this.setState({
      connectionOffline: callbackData,
    });
  };

  async componentDidMount() {
    const {navigation} = this.props;
    let navigationFlag = JSON.stringify(navigation.getParam('navigationFlag', 'ERROR'));
    navigationFlag = JSON.parse(navigationFlag);
    let inFolder = JSON.stringify(navigation.getParam('inFolder', 'ERROR'));
    inFolder = JSON.parse(inFolder);
    this.setState({
        navigationFlag: navigationFlag,
        inFolder:inFolder
      });
  }


  async saveNoteInAsyncStorage() {
    this.loadingButton.showLoading(true);
    let oldAsyncNotes = await AsyncStorage.getItem('Notes');
    oldAsyncNotes = JSON.parse(oldAsyncNotes);
    if (oldAsyncNotes == null) {
      this.setState({
        asyncNotesArray: [],
      });
    } else {
      this.setState({
        asyncNotesArray: oldAsyncNotes,
      });
    }
    let asyncNotesArray = this.state.asyncNotesArray;
    let today = new Date();
    today = today.toGMTString();
    
    let noteToPushInAsyncStorage = {
      localId: Date.now().toString(),
      name: this.state.noteTitle,
      content: this.state.noteText,
      noteDate: today,
      inFolder: this.state.inFolder,
      imageArray: Date.now().toString()
    };
    await AsyncStorage.setItem(noteToPushInAsyncStorage.imageArray, JSON.stringify(this.state.base64Image))
    if( this.state.connectionOffline ){
      await addUserDataApi(noteToPushInAsyncStorage)
    }
    asyncNotesArray.push(noteToPushInAsyncStorage);
    await AsyncStorage.setItem('Notes', JSON.stringify(asyncNotesArray))
      .then(() => {
        if(this.state.navigationFlag == 'Home'){
          this.loadingButton.showLoading(false);
          this.props.navigation.navigate('HomeScreen', 'screen:ddd');
        }else{

          this.loadingButton.showLoading(false);
          this.props.navigation.navigate('FolderScreen', 'screen:ddd');
        }
      })
      .catch(err => {
        console.log('saveNoteInAsyncStorage error', err);
      });
  }

  navigationArrowAction() {
    if(this.state.navigationFlag == 'Home'){
      this.props.navigation.navigate('HomeScreen');
    }else{
      this.props.navigation.navigate('FolderScreen');
    }
  }
  loadPhotoFromPhone(){
    ImagePicker.openPicker({
      multiple: true,
      compressImageQuality:0.5,
      compressImageMaxWidth:1000,
      compressImageMaxHeight:1000
    }).then(images => {
      let base64ImageArray = this.state.base64Image;
      images.map(item => {
       ImgToBase64.getBase64String(item.path).then(base64String => {
          console.log(base64String)
          base64ImageArray.push(base64String) 
          this.setState({
            base64Image:base64ImageArray
          }) 
        }).catch(err => {
          console.log(err)
        });
      })
    })
    
  }

  deletePhotoFromAttached(base64Item){
    let arrayWithAllPhotos = this.state.base64Image
    arrayWithAllPhotos.map((item, index)=>{
      if (item == base64Item){
        arrayWithAllPhotos.splice(index, 1)
     }
    })
    this.setState({
      base64Image: arrayWithAllPhotos
    })
  }
  openImage(base64Image){
    this.setState({
      visibleModalForCropImage:true, 
      cropImageBase64:base64Image
    })
  }

  render() {
    return (
      <View style={{width:'100%', height:'100%'}}>
           <OfflineNotice callbackOfflineNotice={this.getCallbackDataFromOfflineNotice} />
          <Header style={styles.header}>
          
          <Left style={styles.headerLeft}>
            <Icon
              onPress={() => this.navigationArrowAction()}
              size={30}
              name="ios-arrow-back"
              style={styles.headerLeftIcon}
            />
          </Left>
          <Right>
              <AnimateLoadingButton
                ref={c => (this.loadingButton = c)}
              width={50}
              height={50}
              title="DONE"
              titleFontSize={16}
              titleColor="orange"
              activityIndicatorColor="orange"
              backgroundColor="rgb(255,255,255)"
              borderRadius={4}
              onPress={() => this.saveNoteInAsyncStorage()}
        />
            
          </Right>
        </Header>
        <Container>
          <TextInput
            placeholder="Notes Title"
            style={styles.noteTitleInputField}
            multiline={true}
            onChangeText={noteTitle => this.validateNoteTitle(noteTitle)}
          />
          <TextInput placeholder="Notes Content" style={styles.noteContentInputField} multiline={true} onChangeText={(noteText) => this.setState({ noteText })} />
        </Container>
        <Footer style={{height:'25%', backgroundColor:'white', borderTopWidth:1, borderColor:'#DCDCDC'}} onPress={()=>this.loadPhotoFromPhone()}>
            <View style={{width:'100%', height:'100%', alignItems:'center'}}>
            {
            this.state.base64Image.length > 0 ?
            <ScrollView horizontal>
            { 
              this.state.base64Image.map((item,index) => 
              
              this.state.base64Image.length === index + 1 ? 
                          
                          <View style={{flexDirection:'row'}}>
                         
                            <TouchableOpacity style={{position:'relative', padding:10, zIndex:0}} onPress={()=> this.openImage(item)}>
                              <Icon 
                                name="ios-close-circle" style={{position:'absolute', right:0, zIndex:1, fontSize:30}} onPress={ ()=> this.deletePhotoFromAttached(item) }/>
                              <Image source={{uri:'data:image/jpg;base64,'+item}} style={{width:150, height:150, }}></Image>  
                            </TouchableOpacity>
                            <TouchableOpacity style={{margin:10, width:150, height:150, alignItems:'center', borderWidth:1, borderColor:'#DCDCDC'}}  onPress={ ()=> this.loadPhotoFromPhone() }  >
                            <Icon style={{fontSize:70, marginTop:40}}
                                name="ios-add-circle" 
                                onPress={ ()=> this.loadPhotoFromPhone() } />
                            </TouchableOpacity>
                          </View>
                    
              :
               
                        <TouchableOpacity style={{position:'relative', padding:10, zIndex:0}} onPress={()=> this.openImage()}>
                            <Icon name="ios-close-circle" style={{position:'absolute', right:0, zIndex:1, fontSize:30}} onPress={ ()=> this.deletePhotoFromAttached(item) }/>
                            <Image source={{uri:'data:image/jpg;base64,'+item}} style={{width:150, height:150, }} ></Image>  
                        </TouchableOpacity>
            )  
          } 
          </ScrollView> : <Icon
              onPress={() => this.loadPhotoFromPhone()}
              size={30}
              name="add-to-photos" type='MaterialIcons'
              style={{position:'absolute', top:'30%', fontSize:70, color:'orange'}}
                         />
        }
           

            </View>
        </Footer>
        <Dialog onHardwareBackPress={()=> this.closeModalOnHardwareButtonPress()}
               dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })} width={1} height={1}  visible={this.state.visibleModalForCropImage} onTouchOutside={() => { this.setState({ visibleModalForCropImage: false }); }}>
                    <DialogContent>
                    <Image source={{uri:'data:image/jpg;base64,'+this.state.cropImageBase64}} style={{width:'100%', height:'90%', }}></Image>  
                    </DialogContent>
                </Dialog>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {backgroundColor: 'white',  borderBottomWidth:1, borderBottomColor:'#DCDCDC',},
  headerLeft: {flexDirection: 'row'},
  headerLeftIcon: {color: 'orange', marginLeft: '10%', fontSize: 30},
  headerLeftText: {
    color: 'orange',
    fontSize: 25,
    marginLeft: '10%',
    marginTop: 2,
    fontFamily: 'OpenSans-Regular',
  },
  headerRightText: {color: 'orange', fontFamily: 'OpenSans-SemiBold'},
  noteTitleInputField: {
    fontSize: 20,
    paddingLeft: 20,
    paddingTop: 20,
    borderColor: '#DCDCDC',
    borderBottomWidth: 1,
    fontFamily: 'OpenSans-SemiBold',
  },
  noteContentInputField: {
    fontSize: 20,
    width: '100%',
    height: '100%',
    textAlignVertical: 'top',
    paddingLeft: 20,
    paddingTop: 20,
    fontFamily: 'OpenSans-Regular',
    borderBottomWidth:1,
    borderColor:'#DCDCDC'
  },
});

export default AddNote;
