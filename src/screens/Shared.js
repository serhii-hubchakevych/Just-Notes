import React, {Component} from 'react';
import { View, Text, ScrollView, TouchableOpacity, AsyncStorage, StyleSheet, TouchableHighlight, TextInput, Image, Picker, Linking } from 'react-native';
import {Container, Header, Left, Right, Icon, Button} from 'native-base';
import Swipeable from 'react-native-swipeable';
import { editUserFolderApi, deleteUserFolderApi, deleteUserDataApi, getSharedFoldersAndNotesAPI } from '../networking/API';
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
import { Menu, MenuOptions, MenuOption, MenuTrigger, renderers } from 'react-native-popup-menu';
import HamburgerMenu from '../parts/HamburgerMenu';
import OfflineNotice from '../parts/OfflineNotice';

class Shared extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      userNotesAndFolders: [],
      currentNoteId: '',
      userToken: '',
      connectionOffline: false,
      visibleModalAddNewFolder: false,
      folderName: '',
      folderEditName: '',
      opened: false,
      currentFolderId: '',
      visibleModalEditFolderName: false,
      open: false,
      userName: '',
      visibleModalShareNoteAccess: false,
      visibleModalShareFolderAccess: false,
      userEmailForShareNote: '',
      noteIdForSharing: '',
      visibleModalForReadNote: false,
      noteTitleForReading: '',
      noteContentForReading: '',
      userRole: '',
      visibleHamburgerMenu:false,
      visibleModalForAccessDenied: false,
      disableConfirmFolderButton: true,
      customShadow: {
        backgroundColor: 'gray',
        width: '0%',
        height: '0%',
        position: 'absolute',
        right: 0,
      },
    };
  
  }
  swipeable = null;

  async componentDidMount() {
    let asyncLoginUserData = await AsyncStorage.getItem('asyncLoginUserData');
    asyncLoginUserData = JSON.parse(asyncLoginUserData);
    let el = await getSharedFoldersAndNotesAPI(asyncLoginUserData.userToken);
    let sharedUserFolders = el[0];
    let sharedUserNotes = el[1];
    if (sharedUserFolders.length == 0) {
      sharedUserFolders = [];
    } else if (sharedUserNotes.length == 0) {
      sharedUserNotes = [];
    }
    let sharedUserNotesAndFolders = sharedUserFolders.concat(sharedUserNotes);
    
    if (el !== null) {
      this.setState({
        userNotesAndFolders: sharedUserNotesAndFolders,
        userToken: asyncLoginUserData.userToken,
        userName: asyncLoginUserData.username,
      });
    } else {
      this.setState({
        userNotesAndFolders: [],
      });
    }
    console.log(this.props.navigation.state.routeName)

  }

  async UNSAFE_componentWillReceiveProps() {
    let asyncLoginUserData = await AsyncStorage.getItem('asyncLoginUserData');
    asyncLoginUserData = JSON.parse(asyncLoginUserData);
    let el = await getSharedFoldersAndNotesAPI(asyncLoginUserData.userToken);
    let sharedUserFolders = el[0];
    let sharedUserNotes = el[1];
    if (sharedUserFolders.length == 0) {
      sharedUserFolders = [];
    } else if (sharedUserNotes.length == 0) {
      sharedUserNotes = [];
    }
    let sharedUserNotesAndFolders = sharedUserFolders.concat(sharedUserNotes);
    if (el !== null) {
      this.setState({
        userNotesAndFolders: sharedUserNotesAndFolders,
        userToken: asyncLoginUserData.userToken,
        userName: asyncLoginUserData.username,
      });
    } else {
      this.setState({
        userNotesAndFolders: [],
      });
    }
  }

  async logOutAsyng() {
    await AsyncStorage.setItem('asyncLoginUserData', '');
    this.toggleClose();
    this.props.navigation.navigate('AuthScreen', 'screen:ddddd');
  }

  async deleteNote(noteId, userRole) {
    if (userRole == 'Reader') {
      this.setState({
        visibleModalForAccessDenied: true,
      });
    } else {
      this.swipeable.recenter();
      let userToken = this.state.userToken;
      let res = await deleteUserDataApi(noteId, userToken);
      if (res) {
        this.props.navigation.navigate('SharedScreen', 'screen:ddddd');
      } else {
        alert('Deleting note error');
      }
    }
  }

  async editFolderName() {
    let changeFolderName = {
      localId: this.state.currentFolderId,
      folderName: this.state.folderEditName,
    };
    let res = await editUserFolderApi(changeFolderName);
    if (res) {
      this.setState({
        visibleModalEditFolderName: false,
      });
      this.props.navigation.navigate('SharedScreen', 'screen:ddddd');
    } else {
      alert('Editing server error');
    }
  }

  async deleteFolder(folderId, userRole) {
    if (userRole == 'Reader') {
      this.setState({
        visibleModalForAccessDenied: true,
      });
    } else {
      let res = await deleteUserFolderApi(folderId);
      if (res) {
        this.setState({
          opened: false,
        });
        this.props.navigation.navigate('SharedScreen', 'screen:ddddd');
      } else {
        alert('Delete Server error');
      }
    }
  }

  async shareNoteAccess() {}

  async shareFolderAccess() {}

  rightSwipeButtons(noteId, noteName, noteContent, userRole) {
    return [
      <TouchableHighlight style={styles.rightSwipeFirstContainer}>
        <Icon
          size={30}
          name="ios-trash"
          style={styles.rightSwipeIcons}
          onPress={() => this.deleteNote(noteId, userRole)}
        />
      </TouchableHighlight>,
      <TouchableHighlight style={styles.rightSwipeSecondContainer}>
        <Icon
          size={30}
          name="ios-document"
          style={styles.rightSwipeIcons}
          onPress={() =>
            this.editCurrentNote(noteId, noteName, noteContent, userRole)
          }
        />
      </TouchableHighlight>,
      <TouchableHighlight style={styles.rightSwipeThirdContainer}>
        <Icon
          size={30}
          name="md-share"
          style={styles.rightSwipeIcons}
          onPress={() => this.shareCurrentNote(noteId, userRole)}
        />
      </TouchableHighlight>,
    ];
  }

  contextMenu(folderId, role) {
    this.setState({
      opened: true,
      currentFolderId: folderId,
      userRole: role,
    });
  }

  readCurrentNote(noteTitle, noteContent, userRole) {
    if (userRole == 'Reader' || userRole == 'Editor') {
      this.setState({
        noteTitleForReading: noteTitle,
        noteContentForReading: noteContent,
        visibleModalForReadNote: true,
      });
    } else {
      alert('Access denied');
    }
  }

  shareCurrentNote(noteId, userRole) {
    if (userRole == 'Reader' || userRole == 'Editor') {
      this.setState({
        visibleModalForAccessDenied: true,
      });
    } else {
      this.setState({
        visibleModalShareNoteAccess: true,
        noteIdForSharing: noteId,
      });
    }
  }

  editCurrentNote(noteId, noteName, noteContent, userRole) {
    if (userRole == 'Reader') {
      this.setState({
        visibleModalForAccessDenied: true,
      });
    } else {
      this.props.navigation.navigate('EditNoteScreen', {
        currentNoteId: noteId,
        currentNoteName: noteName,
        currentNoteContent: noteContent,
        navigationFlag: 'Shared',
      });
    }
  }

  editCurrentFolder() {
    if (this.state.userRole == 'Reader') {
      this.setState({
        visibleModalForAccessDenied: true,
      });
    } else {
      this.setState({opened: false, visibleModalEditFolderName: true});
    }
  }
  shareCurrentFolder() {
    let userRole = this.state.userRole;
    if (userRole == 'Reader' || userRole == 'Editor') {
      this.setState({
        visibleModalForAccessDenied: true,
      });
    } else {
      this.setState({opened: false, visibleModalShareFolderAccess: true});
    }
  }

  validateEditFolderName(folderName) {
    if (folderName != '') {
      this.setState({
        disableConfirmFolderButton: false,
        folderEditName: folderName,
      });
    } else {
      this.setState({
        disableConfirmFolderButton: true,
      });
    }
  }
  getCallbackDataFromOfflineNotice = callbackData => {
    this.setState({
      connectionOffline: callbackData,
    });
    if(this.state.connectionOffline){
      this.props.navigation.navigate('HomeScreen')
    }
  };

  getCallbackDataFromHamburgerMenu = (callbackData) => {
    this.setState({
        visibleHamburgerMenu: callbackData.visibleHamburgerMenu,
    })
}

  closeModalOnHardwareButtonPress(){
    this.setState({
        visibleModalForReadNote:false,
        visibleModalShareError:false,
        visibleModalShareSuccess:false,
        visibleModalShareNoteAccess:false
    })
    return this.props.navigation.navigate('SharedScreen');
}

DrawHamburgerMenu(){
  this.setState({
      visibleHamburgerMenu:true
  })
}

  render() {
    return (
      <Container>
        <OfflineNotice
          callbackOfflineNotice={this.getCallbackDataFromOfflineNotice}
        />
        <Header style={styles.header}>
          <Left style={styles.headerLeft}>
            <Icon name="menu" type='MaterialIcons' style={styles.headerLeftIcon} onPress={()=>this.DrawHamburgerMenu()}/>
          </Left>
          <Right style={{flexDirection: 'row'}}></Right>
        </Header>
        <ScrollView>
          {this.state.userNotesAndFolders.length != 0 ? (
            <View>
              {this.state.userNotesAndFolders.map(item => {
                if (item.folderName != null) {
                  return (
                    <TouchableOpacity
                      onPress={() =>
                        this.props.navigation.navigate('FolderScreen', {
                          folderId: item.localId,
                          screenFlag: 'Shared',
                          userRole: item.role
                        })
                      }
                      key={item.localId}
                      onLongPress={() =>
                        this.contextMenu(item.localId, item.role)
                      }
                      style={styles.item}>
                      <View style={styles.folderView}>
                        <Icon name="ios-folder" style={{color: 'orange'}} />
                        <Text numberOfLines={1} style={styles.folderName}>
                          {item.folderName}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                } else if (item.inFolder == null) {
                  return (
                    <Swipeable
                      key={item.localId}
                      onRef={ref => (this.swipeable = ref)}
                      rightButtons={this.rightSwipeButtons(
                        item.localId,
                        item.name,
                        item.content,
                        item.role
                      )}
                      style={styles.item}>
                      <TouchableOpacity
                        style={styles.noteView}
                        onPress={() =>
                          this.readCurrentNote(item.name, item.content, item.role)
                        }>
                        <View>
                          <Icon
                            name="ios-document"
                            style={{
                              marginTop: '70%',
                              fontSize: 40,
                              color: 'orange',
                            }}></Icon>
                        </View>
                        <View style={{marginLeft: 11}}>
                          <Text numberOfLines={1} style={styles.noteName}>
                            {item.name}
                          </Text>
                          <Text style={styles.noteDate}>{item.noteDate}</Text>
                          <Text numberOfLines={1} style={styles.noteContent}>
                            {item.content}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </Swipeable>
                  );
                }
              })}
            </View>
          ) : (
            <TouchableOpacity
              style={{alignItems: 'center', marginTop: '45%', height: 250}}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'OpenSans-Regular',
                  textAlign: 'center',
                }}>
                Sorry, no one has shared a folder or note with you yet. Are you
                lonely?
              </Text>
              <Image
                style={{width: '50%', height: '50%'}}
                source={{
                  uri:
                    'https://pngimage.net/wp-content/uploads/2018/06/одиночество-png-2.png',
                }}
              />
              <Button
                large
                dark
                rounded
                style={{width: '30%', marginTop: 10}}
                onPress={() => {
                  Linking.openURL('https://fernliebe.com/');
                }}>
                <Text
                  style={{
                    color: 'white',
                    paddingLeft: '30%',
                    fontSize: 23,
                    fontFamily: 'OpenSans-Regular',
                  }}>
                  Yes :(
                </Text>
              </Button>
            </TouchableOpacity>
          )}
        </ScrollView>
        {this.state.visibleHamburgerMenu ? <HamburgerMenu callBackFromHamburgerMenu={this.getCallbackDataFromHamburgerMenu} openMenu={this.state.visibleHamburgerMenu} userName={this.state.userName} navigate={this.props.navigation} connection={this.state.connectionOffline}/> : null }

        <Menu
          opened={this.state.opened}
          renderer={renderers.SlideInMenu}
          onBackdropPress={() => this.setState({opened: false})}>
          <MenuTrigger />
          <MenuOptions style={{alignItems: 'center'}}>
            <MenuOption onSelect={() => this.editCurrentFolder()}>
              <Text
                style={{
                  fontSize: 25,
                  fontFamily: 'AlegreyaSC-Regular',
                  color: 'orange',
                }}>
                Edit folder name
              </Text>
            </MenuOption>
            <MenuOption
              onSelect={() =>
                this.deleteFolder(
                  this.state.currentFolderId,
                  this.state.userRole,
                )
              }>
              <Text
                style={{
                  fontSize: 25,
                  fontFamily: 'AlegreyaSC-Regular',
                  color: 'red',
                }}>
                Delete folder
              </Text>
            </MenuOption>
            <MenuOption onSelect={() => this.shareCurrentFolder()}>
              <Text
                style={{
                  fontSize: 25,
                  fontFamily: 'AlegreyaSC-Regular',
                  color: 'green',
                }}>
                Share folder
              </Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
        <Dialog onHardwareBackPress={()=> this.closeModalOnHardwareButtonPress()}
          footer={
            <DialogFooter>
              <DialogButton
                text="CLOSE"
                onPress={() =>
                  this.setState({visibleModalForAccessDenied: false})
                }
              />
              <DialogButton
                text="GET ACCESS"
                onPress={() => alert('COMING SOON')}
              />
            </DialogFooter>
          }
          dialogAnimation={new SlideAnimation({slideFrom: 'bottom'})}
          width={0.9}
          dialogTitle={<DialogTitle title="ACCESS DENIED" />}
          visible={this.state.visibleModalForAccessDenied}
          onTouchOutside={() => {
            this.setState({visibleModalForAccessDenied: false});
          }}>
          <DialogContent style={{alignItems: 'center'}}>
            <Icon
              name="ios-alert"
              style={{color: 'red', marginTop: 20, fontSize: 50}}
            />
            <Text>
              You have no rights to manipulate this object. You can claim the
              rights by clicking the button below.
            </Text>
          </DialogContent>
        </Dialog>

        <Dialog onHardwareBackPress={()=> this.closeModalOnHardwareButtonPress()}
          footer={
            <DialogFooter>
              <DialogButton
                text="CLOSE"
                onPress={() =>
                  this.setState({visibleModalEditFolderName: false})
                }
              />
              <DialogButton
                disabled={this.state.disableConfirmFolderButton}
                text="CONFIRM"
                onPress={() => this.editFolderName()}
              />
            </DialogFooter>
          }
          dialogAnimation={new SlideAnimation({slideFrom: 'bottom'})}
          width={0.9}
          dialogTitle={<DialogTitle title="RENAME FOLDER" />}
          visible={this.state.visibleModalEditFolderName}
          onTouchOutside={() => {
            this.setState({visibleModalEditFolderName: false});
          }}>
          <DialogContent style={{alignItems: 'center'}}>
            <Icon
              name="ios-folder"
              style={{color: 'orange', marginTop: 30, fontSize: 40}}
            />
            <TextInput
              style={{
                textAlign: 'center',
                fontSize: 20,
                borderBottomWidth: 1,
                borderBottomColor: 'silver',
                width: '100%',
              }}
              placeholder="Enter your folder name"
              onChangeText={folderName =>
                this.validateEditFolderName(folderName)
              }></TextInput>
          </DialogContent>
        </Dialog>

        <Dialog onHardwareBackPress={()=> this.closeModalOnHardwareButtonPress()}
          footer={
            <DialogFooter>
              <DialogButton
                text="CLOSE"
                onPress={() =>
                  this.setState({visibleModalShareNoteAccess: false})
                }
              />
              <DialogButton
                text="CONFIRM"
                onPress={() => this.shareNoteAccess()}
              />
            </DialogFooter>
          }
          dialogAnimation={new SlideAnimation({slideFrom: 'bottom'})}
          width={0.9}
          dialogTitle={<DialogTitle title="SHARE NOTE" />}
          visible={this.state.visibleModalShareNoteAccess}
          onTouchOutside={() => {
            this.setState({visibleModalShareNoteAccess: false});
          }}>
          <DialogContent style={{alignItems: 'center'}}>
            <Icon
              name="md-share"
              style={{color: 'orange', marginTop: 30, fontSize: 40}}
            />
            <TextInput
              style={{
                textAlign: 'center',
                fontSize: 20,
                borderBottomWidth: 1,
                borderBottomColor: 'silver',
                width: '100%',
              }}
              placeholder="Enter user email"
              onChangeText={userEmailForShare =>
                this.setState({userEmailForShare: userEmailForShare})
              }></TextInput>
            <Text style={{fontSize: 20, marginTop: 20}}>
              Select the user role
            </Text>
            <Icon
              name="ios-contact"
              style={{color: 'orange', marginTop: 10, fontSize: 40}}
            />
            <Picker
              selectedValue={this.state.userRole}
              style={{height: 50, width: '100%'}}
              onValueChange={(itemValue, itemIndex) =>
                this.setState({userRole: itemValue})
              }>
              <Picker.Item label="Only read notes/folders" value="Reader" />
              <Picker.Item label="Editing notes/folders" value="Editor" />
            </Picker>
          </DialogContent>
        </Dialog>

        <Dialog onHardwareBackPress={()=> this.closeModalOnHardwareButtonPress()}
          footer={
            <DialogFooter>
              <DialogButton
                text="CLOSE"
                onPress={() =>
                  this.setState({visibleModalShareFolderAccess: false})
                }
              />
              <DialogButton
                text="CONFIRM"
                onPress={() => this.shareFolderAccess()}
              />
            </DialogFooter>
          }
          dialogAnimation={new SlideAnimation({slideFrom: 'bottom'})}
          width={0.9}
          dialogTitle={<DialogTitle title="SHARE FOLDER" />}
          visible={this.state.visibleModalShareFolderAccess}
          onTouchOutside={() => {
            this.setState({visibleModalShareFolderAccess: false});
          }}>
          <DialogContent style={{alignItems: 'center'}}>
            <Icon
              name="md-share"
              style={{color: 'orange', marginTop: 30, fontSize: 40}}
            />
            <TextInput
              style={{
                textAlign: 'center',
                fontSize: 20,
                borderBottomWidth: 1,
                borderBottomColor: 'silver',
                width: '100%',
              }}
              placeholder="Enter user email"
              onChangeText={userEmailForShare =>
                this.setState({userEmailForShare: userEmailForShare})
              }></TextInput>
            <Text style={{fontSize: 20, marginTop: 20}}>
              Select the user role
            </Text>
            <Icon
              name="ios-contact"
              style={{color: 'orange', marginTop: 10, fontSize: 40}}
            />
            <Picker
              selectedValue={this.state.userRole}
              style={{height: 50, width: '100%'}}
              onValueChange={(itemValue, itemIndex) =>
                this.setState({userRole: itemValue})
              }>
              <Picker.Item label="Only read notes/folders" value="Reader" />
              <Picker.Item label="Editing notes/folders" value="Editor" />
            </Picker>
          </DialogContent>
        </Dialog>

        <Dialog onHardwareBackPress={()=> this.closeModalOnHardwareButtonPress()}
          footer={
            <DialogFooter>
              <DialogButton
                text="CLOSE"
                onPress={() => this.setState({visibleModalForReadNote: false})}
              />
            </DialogFooter>
          }
          dialogAnimation={new SlideAnimation({slideFrom: 'bottom'})}
          width={1}
          height={0.95}
          dialogTitle={<DialogTitle title={this.state.noteTitleForReading} />}
          visible={this.state.visibleModalForReadNote}
          onTouchOutside={() => {
            this.setState({visibleModalForReadNote: false});
          }}>
          <ScrollView>
            <DialogContent>
              <Text style={{paddingTop: 10, paddingBottom: 10}}>
                {this.state.noteContentForReading}
              </Text>
            </DialogContent>
          </ScrollView>
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
  folderName: {fontSize: 20, fontFamily: 'OpenSans-SemiBold', marginLeft: 10},
  noteDate: {marginTop: 5, marginBottom: 5, fontFamily: 'OpenSans-Italic'},
  noteContent: {fontFamily: 'OpenSans-Regular'},
  header: {backgroundColor: 'white'},
  headerLeft: {flexDirection: 'row'},
  headerLeftIcon: {color: 'orange', marginLeft: '10%', fontSize: 30},
  headerRightText: {
    color: 'orange',
    fontSize: 25,
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
  animatedBox: {flex: 1, backgroundColor: 'white', padding: 10, marginTop: -10},
});

export default Shared;
