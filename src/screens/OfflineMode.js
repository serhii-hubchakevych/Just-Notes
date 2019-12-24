// Home.js

import React, {Component} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  AsyncStorage,
  StyleSheet,
  Image,
  TouchableHighlight
} from 'react-native';
import {Container, Header, Left, Right, Button, Icon} from 'native-base';
import MenuDrawer from 'react-native-side-drawer';
import Swipeable from 'react-native-swipeable';
import OfflineNotice from '../parts/OfflineNotice';
import { syncOfflineNotesApi } from "../networking/API";
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';

class OfflineMode extends Component {
  static navigationOptions = {
    header: null,
  };
  constructor(props) {
    super(props);
    this.state = {
      userNotes: [],
      currentNoteId: '',
      isLoading: false,
      userToken: '',
      visibleConfirmDeleteModal:false,
      opened: false,
      currentFolderId: '',
      openLeftNavigationMenu: false,
      userName: '',
      visibleModalForReadNote: false,
      connectionOffline: false,
      noteIdForSharing: '',
      noteTitleForReading: '',
      noteContentForReading: '',
      customShadow: {
        backgroundColor: 'gray',
        width: '0%',
        height: '0%',
        position: 'absolute',
        right: 0,
        opacity: 0.7,
      },
      clearScreenText: 'Tap to add your first note',
    };
  }
  swipeable = null;

  toggleOpen = () => {
    this.setState({
      openLeftNavigationMenu: !this.state.openLeftNavigationMenu,
      customShadow: {
        backgroundColor: 'gray',
        width: '30%',
        height: '100%',
        position: 'absolute',
        right: 0,
        opacity: 0.7,
      },
    });
  };

  toggleClose = () => {
    this.setState({
      openLeftNavigationMenu: !this.state.openLeftNavigationMenu,
      customShadow: {
        backgroundColor: 'gray',
        width: '0%',
        height: '0%',
        position: 'absolute',
        right: 0,
      },
    });
  };

  closeLeftMenuAndNavToSharedScreen() {
    this.setState({
      openLeftNavigationMenu: false,
      customShadow: {
        backgroundColor: 'gray',
        width: '0%',
        height: '0%',
        position: 'absolute',
        right: 0,
      },
    });

    this.props.navigation.navigate('SharedScreen', {
      userToken: this.state.userToken,
      userName:this.state.userName
    });
  }

  closeLeftMenuAndNavToHomeScreen() {
    this.setState({
      openLeftNavigationMenu: false,
      customShadow: {
        backgroundColor: 'gray',
        width: '0%',
        height: '0%',
        position: 'absolute',
        right: 0,
      },
    });
    this.props.navigation.navigate('HomeScreen', 'screen:dddd');
  }

  closeLeftMenuAndNavToOfflineModeScreen() {
    this.setState({
      openLeftNavigationMenu: false,
      customShadow: {
        backgroundColor: 'gray',
        width: '0%',
        height: '0%',
        position: 'absolute',
        right: 0,
      },
    });
    this.props.navigation.navigate('OfflineModeScreen');
  }

  drawerContent = () => {
    return (
      <View style={styles.animatedBox}>
        <TouchableOpacity onPress={this.toggleClose}>
          <View style={{height: 20, alignItems: 'flex-end'}}>
            <Icon
              name="ios-close"
              style={{fontSize: 40}}
              onPress={this.toggleClose}></Icon>
          </View>
        </TouchableOpacity>
        <View style={{marginTop: 20, flex: 0.3, borderRadius: 50}}>
          <Image
            style={{width: '100%', height: '100%', borderRadius: 50}}
            source={{
              uri:
                'https://i0.wp.com/www.winhelponline.com/blog/wp-content/uploads/2017/12/user.png?resize=256%2C256&quality=100&ssl=1',
            }}
          />
        </View>
        <View style={{paddingTop: 20, alignItems: 'center'}}>
          <View style={{flexDirection: 'row'}}>
            <Icon name="ios-contact" />
            <Text
              style={{
                paddingLeft: 20,
                fontSize: 30,
                fontFamily: 'Tangerine-Bold',
              }}>
              Hi, {this.state.userName}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            paddingTop: 50,
            justifyContent: 'center',
          }}>
          <Button
            iconLeft
            transparent
            disabled={!this.state.connectionOffline}
            onPress={() => this.closeLeftMenuAndNavToHomeScreen()}>
            <Icon name="home" />
            <Text
              style={{
                paddingLeft: 20,
                fontSize: 20,
                fontFamily: 'AlegreyaSC-Bold',
              }}>
              Home
            </Text>
          </Button>
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <Button
            disabled={!this.state.connectionOffline}
            iconLeft
            transparent
            onPress={() => this.closeLeftMenuAndNavToSharedScreen()}>
            <Icon name="share" />
            <Text
              style={{
                paddingLeft: 20,
                fontSize: 20,
                fontFamily: 'AlegreyaSC-Bold',
              }}>
              Shared for me
            </Text>
          </Button>
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <Button
            iconLeft
            transparent
            onPress={() => this.closeLeftMenuAndNavToOfflineModeScreen()}>
            <Icon name="signal-wifi-off" type="MaterialIcons" />
            <Text
              style={{
                paddingLeft: 20,
                fontSize: 20,
                fontFamily: 'AlegreyaSC-Bold',
              }}>
              Offline mode
            </Text>
          </Button>
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <Button iconLeft transparent onPress={() => this.logOutAsyng()}>
            <Icon name="ios-log-out" />
            <Text
              style={{
                paddingLeft: 20,
                fontSize: 20,
                fontFamily: 'AlegreyaSC-Bold',
              }}>
              Logout
            </Text>
          </Button>
        </View>
      </View>
    );
  };

  async componentDidMount() {
    let asyncLoginUserData = await AsyncStorage.getItem('asyncLoginUserData');
    asyncLoginUserData = JSON.parse(asyncLoginUserData);
    let asyncNotesArray = await AsyncStorage.getItem('Notes');
    asyncNotesArray = JSON.parse(asyncNotesArray)
    this.setState({
      userToken: asyncLoginUserData.userToken,
      userName: asyncLoginUserData.username,
      userNotes: asyncNotesArray
    });
  }

  async UNSAFE_componentWillReceiveProps() {
    let asyncLoginUserData = await AsyncStorage.getItem('asyncLoginUserData');
    asyncLoginUserData = JSON.parse(asyncLoginUserData);
    let asyncNotesArray = await AsyncStorage.getItem('Notes');
    asyncNotesArray = JSON.parse(asyncNotesArray)
    this.setState({
      userToken: asyncLoginUserData.userToken,
      userName: asyncLoginUserData.username,
      userNotes: asyncNotesArray
    });
  }

  async logOutAsyng() {
    await AsyncStorage.setItem('asyncLoginUserData', '');
    this.toggleClose();
    this.props.navigation.navigate('AuthScreen', 'screen:ddddd');
  }

  getCallbackDataFromOfflineNotice = callbackData => {
    this.setState({
      connectionOffline: callbackData,
    });
  };

  async deleteAsyncNote(noteId){
    let asyncUserNotes = await AsyncStorage.getItem('Notes');
    asyncUserNotes = JSON.parse(asyncUserNotes)
    let arrayAsyncUserNotes = []
    arrayAsyncUserNotes = asyncUserNotes
    arrayAsyncUserNotes.map((item,index) => {
      if (item.Id == noteId){
         arrayAsyncUserNotes.splice(index, 1)
      }
    })
    await AsyncStorage.setItem('Notes', JSON.stringify(arrayAsyncUserNotes))
    this.props.navigation.navigate('OfflineModeScreen', 'screen:ddd')
  }

  async editAsyncNote(noteId, noteName, noteContent){
    this.props.navigation.navigate('EditNoteScreen', {
      currentNoteId: noteId,
      currentNoteName: noteName,
      currentNoteContent: noteContent,
      userToken: this.state.userToken,
      inFolder: false,
      offlineMode:true,
  })
  }

  async syncUserNotes(){
    let response = await syncOfflineNotesApi(this.state.userToken)
    if(response == true){
     this.setState({
        visibleConfirmDeleteModal:true
      })
    }else{
      alert('Nothing to sync!')
    }

  }

  async clearAsynUserNotes(){
    await AsyncStorage.setItem('Notes', '')
    this.props.navigation.navigate('OfflineModeScreen', 'ass')
  }

  rightSwipeButtons(noteId, noteName, noteContent) {
    return [
        <TouchableHighlight style={styles.rightSwipeFirstContainer}>
            <Icon size={30} name="ios-trash" style={styles.rightSwipeIcons} onPress={()=> this.deleteAsyncNote(noteId)}/>
        </TouchableHighlight>,
        <TouchableHighlight style={styles.rightSwipeSecondContainer}>
            <Icon size={30} name="ios-document" style={styles.rightSwipeIcons} onPress={()=> this.editAsyncNote(noteId, noteName, noteContent)}  />
        </TouchableHighlight>]
}

  render() {
    return (
      <Container>
        <MenuDrawer
          open={this.state.openLeftNavigationMenu}
          drawerContent={this.drawerContent()}
          drawerPercentage={70}
          animationTime={20}
          overlay={true}
          opacity={1}></MenuDrawer>
        <OfflineNotice
          callbackOfflineNotice={this.getCallbackDataFromOfflineNotice}
        />
        <Header style={styles.header}>
          <Left style={styles.headerLeft}>
            <Icon
              name="menu"
              type="MaterialIcons"
              style={styles.headerLeftIcon}
              onPress={this.toggleOpen}
            />
          </Left>
          <Right style={{flexDirection: 'row'}}>
            <Button iconLeft transparent onPress={()=> this.props.navigation.navigate('AddNoteScreen', {offlineMode:true})}>
              <Icon name="add-circle"
              type="MaterialIcons" style={{color:'orange', fontSize:30}}/>
            </Button>
            <Button disabled={!this.state.connectionOffline} iconLeft transparent onPress={()=> this.syncUserNotes()}>
              <Icon name="sync"
              type="MaterialIcons" style={{color:'orange', fontSize:30}}/>
            </Button>
          </Right>
        </Header>
        <ScrollView>
        {
                        this.state.userNotes != null ?
                            <View>
                                {
                                    this.state.userNotes.map(item => {                          
                                            return (
                                                <Swipeable key={item.Id} onRef={ref => this.swipeable = ref} rightButtons={this.rightSwipeButtons(item.Id, item.Name, item.Content)} style={styles.item}>
                                                    <TouchableOpacity style={styles.noteView}>
                                                    <View>
                                                        <Icon name="ios-document" style={{marginTop:'70%', fontSize:40, color:'orange'}}></Icon>
                                                    </View>
                                                    <View style={{ marginLeft: 11}}>
                                                        <Text numberOfLines={1} style={styles.noteName}>{item.Name}</Text>
                                                        <Text style={styles.noteDate}>{item.NoteDate}</Text>
                                                        <Text numberOfLines={1} style={styles.noteContent}>{item.Content}</Text>
                                                    </View>
                                                    </TouchableOpacity>
                                                </Swipeable>


                                            )
                                    })

                                }
                            </View>

                            : <TouchableOpacity style={{ alignItems: "center", marginTop: '60%' }} onPress={() => this.props.navigation.navigate('AddNoteScreen', {offlineMode:true})}><Text style={{ fontSize: 20, fontFamily: 'OpenSans-Regular' }}>{this.state.clearScreenText}</Text></TouchableOpacity>
                    }


        </ScrollView>
        <TouchableOpacity
          onPress={() => this.toggleClose()}
          style={this.state.customShadow}></TouchableOpacity>

          <Dialog footer={<DialogFooter>
                    <DialogButton
                        text="NO, THANKS"
                        onPress={() => this.setState({ visibleConfirmDeleteModal: false })}
                    />
                    <DialogButton
                        text="YES"
                        onPress={() => this.clearAsynUserNotes()}
                    />
                </DialogFooter>} dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })} width={0.9} dialogTitle={<DialogTitle title="SUCCESS SYNC" />} visible={this.state.visibleConfirmDeleteModal} onTouchOutside={() => { this.setState({ visibleConfirmDeleteModal: false }); }} >
                    <DialogContent style={{ alignItems: 'center' }} >
                        <Icon name="md-sync" style={{ color: 'green', marginTop: 30, fontSize: 40 }} />
                        <Text style={{textAlign:'center'}}>Your notes have been successfully added to the database. Would you like to clear offline notes?</Text>
                    </DialogContent>
                </Dialog>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  item: {borderBottomWidth: 1, borderColor: 'lightgray', width: '100%'},
  noteView: {
    paddingLeft: 20,
    paddingTop: 5,
    paddingBottom: 10,
    paddingRight: 20,
    flexDirection: 'row',
  },
  folderView: {
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 20,
    flexDirection: 'row',
  },
  noteName: {fontSize: 20, fontFamily: 'OpenSans-SemiBold'},
  folderName: {fontSize: 20, marginLeft: 10, fontFamily: 'OpenSans-SemiBold'},
  noteDate: {marginTop: 5, marginBottom: 5, fontFamily: 'OpenSans-Italic'},
  noteContent: {fontFamily: 'OpenSans-Regular'},
  header: {backgroundColor: 'white'},
  headerLeft: {flexDirection: 'row'},
  headerLeftIcon: {color: 'orange', marginLeft: '10%', fontSize: 35},
  headerRightText: {
    color: 'orange',
    fontSize: 35,
    paddingLeft: 20,
    paddingRight: 10,
  },
  leftSwipeContainerIcon: {color: 'green'},
  rightSwipeFirstContainer: {
    backgroundColor: 'red',
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 30,
  },
  rightSwipeIcons: {color: 'white'},
  rightSwipeSecondContainer: {
    backgroundColor: 'orange',
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 30,
  },
  rightSwipeThirdContainer: {
    backgroundColor: 'green',
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 30,
  },
  searchInput: {
    padding: 10,
    borderColor: '#CCC',
    borderWidth: 1,
    paddingLeft: 50,
  },
  iconSearchInput: {position: 'absolute', top: 10, left: 22, color: 'orange'},
  animatedBox: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    marginTop: -10,
    zIndex: 9,
  },
});

export default OfflineMode;
