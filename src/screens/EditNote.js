// EditNote.js

import React, {Component} from 'react';
import {Text, Container, Header, Left, Right, Icon, Footer} from 'native-base';
import {StyleSheet, TextInput, AsyncStorage, View, ScrollView, Image, TouchableOpacity} from 'react-native';
import {updateUserDataApi} from '../networking/API';
import OfflineNotice from '../parts/OfflineNotice';
import ImgToBase64 from 'react-native-image-base64'
import AnimateLoadingButton from 'react-native-animate-loading-button';

import ImagePicker from 'react-native-image-crop-picker';

export class EditNote extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      noteId: '',
      noteName: '',
      noteContent: '',
      inFolder: false,
      disabledSaveButton: false,
      connectionOffline: false,
      navigationFlag: '',
      base64Image:[]
    };
  }

  async componentDidMount() {
    const {navigation} = this.props;

    let currentNoteId = JSON.stringify(navigation.getParam('currentNoteId', 'ERROR'));
    let currentNoteName = JSON.stringify(navigation.getParam('currentNoteName', 'ERROR'));
    let currentNoteContent = JSON.stringify(navigation.getParam('currentNoteContent', 'ERROR'));
    let navigationFlag = JSON.stringify(navigation.getParam('navigationFlag', 'ERROR'));
    let inFolder = JSON.stringify(navigation.getParam('inFolder', 'ERROR'));
    currentNoteId = JSON.parse(currentNoteId);
    currentNoteName = JSON.parse(currentNoteName);
    currentNoteContent = JSON.parse(currentNoteContent);
    navigationFlag = JSON.parse(navigationFlag);
    inFolder = JSON.parse(inFolder);
    let photosFromAsyncStorage = await AsyncStorage.getItem(currentNoteId)
    photosFromAsyncStorage = JSON.parse(photosFromAsyncStorage)
 
    this.setState({
        base64Image: photosFromAsyncStorage
    })
    

    this.setState({
      noteId: currentNoteId,
      noteName: currentNoteName,
      noteContent: currentNoteContent,
      inFolder: inFolder,
      navigationFlag: navigationFlag,
    });
  }

  async updateNoteInAsyncStorage() {
    let asyncUserNotes = await AsyncStorage.getItem('Notes');
    asyncUserNotes = JSON.parse(asyncUserNotes);
    let arrayAsyncUserNotes = asyncUserNotes;
    let pushNotesToDatabase = {};
    arrayAsyncUserNotes.map(item => {
      if (item.localId == this.state.noteId) {
        item.name = this.state.noteName;
        item.content = this.state.noteContent;
         pushNotesToDatabase = {
          localId: item.localId,
          name: item.name,
          content: item.content,
          imageArray:item.imageArray
        }
      }
    });

    if( this.state.connectionOffline ){
      await updateUserDataApi(pushNotesToDatabase)
    }
    await AsyncStorage.setItem(this.state.noteId, JSON.stringify(this.state.base64Image));
    await AsyncStorage.setItem('Notes', JSON.stringify(arrayAsyncUserNotes));
    if(this.state.navigationFlag == 'Home'){
      this.loadingButton.showLoading(false);

      this.props.navigation.navigate('HomeScreen', 'screen:ddd');
    }else{
      this.loadingButton.showLoading(false);

      this.props.navigation.navigate('FolderScreen', 'screen:ddd');
    }
    
  }

  validateNoteTitle(noteName) {
    
      this.setState({
        disabledSaveButton: false,
        noteName: noteName,
      });
    
  }

  getCallbackDataFromOfflineNotice = callbackData => {
    this.setState({
      connectionOffline: callbackData,
    });
  };
  navigationArrowAction() {
    if (this.state.navigationFlag == 'Home') {
      this.props.navigation.navigate('HomeScreen');
    } else if(this.state.navigationFlag == 'Shared'){
      this.props.navigation.navigate('SharedScreen');
    } else {
      this.props.navigation.navigate('FolderScreen');
    }
  }

  async saveButtonDistributor(){
    this.loadingButton.showLoading(true);

    if(this.state.navigationFlag == 'Shared'){
      let pushNotesToDatabase = {
        name: this.state.noteName,
        content: this.state.noteContent,
        localId: this.state.noteId
      };
      await updateUserDataApi(pushNotesToDatabase)
      if ( this.state.inFolder == true ){
        this.loadingButton.showLoading(false);

        this.props.navigation.navigate('FolderScreen', 'screen:ddd');
      } else if ( this.state.inFolder == 'ERROR' ) {
        this.loadingButton.showLoading(false);

        this.props.navigation.navigate('SharedScreen', 'screen:ddd');
      }
    } else {
      this.updateNoteInAsyncStorage()
      
    }
  }
  loadPhotoFromPhone(){
    ImagePicker.openPicker({
      multiple: true,
      compressImageQuality:0,
      compressImageMaxWidth:1000,
      compressImageMaxHeight:1000

    }).then(images => {
      let base64ImageArray = this.state.base64Image;
      images.map(item => {
       ImgToBase64.getBase64String(item.path).then(base64String => {
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
              onPress={() => this.saveButtonDistributor()}
        />
           
          </Right>
        </Header>
        <Container>
          <TextInput
            placeholder="Notes Title"
            style={styles.noteTitleInputField}
            multiline={true}
            value={this.state.noteName}
            onChangeText={noteName => this.validateNoteTitle(noteName)}
          />
          <TextInput placeholder="Notes Content"  value={this.state.noteContent} style={styles.noteContentInputField} multiline={true}  onChangeText={noteContent => this.setState({noteContent})} />
        </Container>
        <Footer style={{height:'25%', backgroundColor:'white', borderTopWidth:1, borderColor:'#DCDCDC'}} onPress={()=>this.loadPhotoFromPhone()}>
            <View style={{width:'100%', height:'100%', alignItems:'center'}}>
            {
              this.state.base64Image != undefined && this.state.base64Image.length > 0 ?
            <ScrollView horizontal>
            {
              this.state.base64Image.map((item,index) => 
              
              this.state.base64Image.length === index + 1 ? 
                          
                          <View style={{flexDirection:'row'}}>
                         
                            <View style={{position:'relative', padding:10, zIndex:0}}>
                              <Icon 
                                name="ios-close-circle" style={{position:'absolute', right:0, zIndex:1, fontSize:30}} onPress={ ()=> this.deletePhotoFromAttached(item) }/>
                              <Image source={{uri:'data:image/jpg;base64,'+item}} style={{width:150, height:150, }}></Image>  
                            </View>
                            <TouchableOpacity style={{margin:10, width:150, height:150, alignItems:'center', borderWidth:1, borderColor:'#DCDCDC'}} >
                            <Icon style={{fontSize:70, marginTop:40}}
                                name="ios-add-circle" 
                                onPress={ ()=> this.loadPhotoFromPhone() } />
                            </TouchableOpacity>
                          </View>
                    
              :
               
                        <View key={item.size} style={{position:'relative', padding:10, zIndex:0}}>
                            <Icon name="ios-close-circle" style={{position:'absolute', right:0, zIndex:1, fontSize:30}} onPress={ ()=> this.deletePhotoFromAttached(item) }/>
                            <Image source={{uri:'data:image/jpg;base64,'+item}} style={{width:150, height:150, }}></Image>  
                        </View>
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {backgroundColor: 'white', borderBottomWidth:1, borderBottomColor:'#DCDCDC'},
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
    borderColor: 'gray',
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
  },
});

export default EditNote;
