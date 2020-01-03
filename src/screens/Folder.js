import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TouchableHighlight, TextInput, AsyncStorage, Picker, Image, Modal } from 'react-native';
import { Container, Header, Left, Right, Icon, Footer, Button } from 'native-base';
import Swipeable from 'react-native-swipeable';
import { deleteUserDataApi,shareUserNoteAccessApi, getSharedDataInFolders, syncOfflineData } from "../networking/API"
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
import OfflineNotice from '../parts/OfflineNotice'


class Folder extends Component {
    static navigationOptions =
        {
            header: null,
        };
    constructor(props) {
        super(props);
        this.state = {
            userNotes:[],
            folderId: '',
            noteId:'',
            parentFolderId: null,
            navigationFlag: false,
            visible: false,
            visibleModalShareNoteAccess: false,
            visibleModalForReadNote: false,
            userEmailForShare: '',
            userRole: 'Reader',
            noteIdForSharing: '',
            noteTitleForReading: '',
            noteContentForReading: '',
            visibleModalShareError:false,
            visibleModalShareSuccess:false,
            disableConfirmFolderButton:false,
            screenFlag:'',
            connectionOffline:false,
            visibleModalForAccessDenied:false,
            base64Image:[],
            visibleModalForFullSizeImage:false,
            fullSizeImage:''
         };
    }
    swipeable = null;

    async componentDidMount() {
        const { navigation } = this.props;

        let folderId = JSON.stringify(navigation.getParam('folderId', 'ERROR'));
        folderId = JSON.parse(folderId)
        let screenFlag = JSON.stringify(navigation.getParam('screenFlag', 'ERROR'));
        screenFlag = JSON.parse(screenFlag)
        let userRole = JSON.stringify(navigation.getParam('userRole', 'ERROR'));
        userRole = JSON.parse(userRole)
        let asyncNotesArray = await AsyncStorage.getItem('Notes');
        let arrayAsyncUserNotes = JSON.parse(asyncNotesArray)
        let userNotesInFolder;
        if(screenFlag == 'Home'){
            userNotesInFolder = arrayAsyncUserNotes.filter(arrayAsyncUserNotes => arrayAsyncUserNotes.inFolder == folderId)
        }else {
            userNotesInFolder = await getSharedDataInFolders(folderId);
        }
        this.setState({
            folderId: folderId,
            userNotes: userNotesInFolder,
            screenFlag: screenFlag,
            userRole: userRole
        })
        if(this.swipeable != null){
            await this.swipeable.recenter()
        }
    }

    async UNSAFE_componentWillReceiveProps() {
        const { navigation } = this.props;

        let folderId = JSON.stringify(navigation.getParam('folderId', 'ERROR'));
        folderId = JSON.parse(folderId)
        let screenFlag = JSON.stringify(navigation.getParam('screenFlag', 'ERROR'));
        screenFlag = JSON.parse(screenFlag)
        let asyncNotesArray = await AsyncStorage.getItem('Notes');
        let arrayAsyncUserNotes = JSON.parse(asyncNotesArray)
        let userNotesInFolder;
        if(screenFlag == 'Home'){
            userNotesInFolder = arrayAsyncUserNotes.filter(arrayAsyncUserNotes => arrayAsyncUserNotes.inFolder == folderId)
        }else {
            userNotesInFolder = await getSharedDataInFolders(folderId);
        }
        this.setState({
            folderId: folderId,
            userNotes: userNotesInFolder,
            screenFlag: screenFlag,
        })
        if(this.swipeable != null){
            await this.swipeable.recenter()
        }
        
    }

    rightSwipeButtons(noteId, noteName, noteContent, userRole) {
        return [
            <TouchableHighlight style={styles.rightSwipeFirstContainer}>
                <Icon size={30} name="ios-trash" style={styles.rightSwipeIcons} onPress={() => this.deleteNote(noteId, userRole)} />
            </TouchableHighlight>,
            <TouchableHighlight style={styles.rightSwipeSecondContainer}>
                <Icon size={30} name="ios-document" style={styles.rightSwipeIcons} onPress={() => this.editCurrentNote(noteId, noteName, noteContent, userRole)} />
            </TouchableHighlight>,
            <TouchableHighlight style={styles.rightSwipeThirdContainer}>
                <Icon size={30} name="md-share" style={styles.rightSwipeIcons} onPress={() => this.setState({ visibleModalShareNoteAccess: true, noteIdForSharing: noteId })} />
            </TouchableHighlight>]
    }

    async deleteNote(noteId, userRole) {
        if(this.state.screenFlag == 'Home'){
        let asyncUserNotes = await AsyncStorage.getItem('Notes');
        asyncUserNotes = JSON.parse(asyncUserNotes)
        let arrayAsyncUserNotes = []
        arrayAsyncUserNotes = asyncUserNotes
        arrayAsyncUserNotes.map((item,index) => {
          if (item.localId == noteId){
             arrayAsyncUserNotes.splice(index, 1)
          }
        })
        if( this.state.connectionOffline ){
            await deleteUserDataApi(noteId)
        }
       
        await AsyncStorage.setItem('Notes', JSON.stringify(arrayAsyncUserNotes))
        this.props.navigation.navigate('FolderScreen', 'screen:ddd')
        } else if (this.state.screenFlag == 'Shared' && userRole != 'Reader'){
            await deleteUserDataApi(noteId)
            this.props.navigation.navigate('FolderScreen', 'screen:ddd')
        } else if ( this.state.screenFlag == 'Shared' && userRole == 'Reader' ){
            this.setState({
                visibleModalForAccessDenied:true
            })
        }
    }

    editCurrentNote(noteId, noteName, noteContent, userRole) {
        if (userRole == 'Reader') {
          this.setState({
            visibleModalForAccessDenied: true,
          });
        } else if ( userRole == 'Editor' ){
          this.props.navigation.navigate('EditNoteScreen', {
            currentNoteId: noteId,
            currentNoteName: noteName,
            currentNoteContent: noteContent,
            navigationFlag: 'Shared',
            inFolder:true
          });
        } else {
            this.props.navigation.navigate('EditNoteScreen', {
                currentNoteId: noteId,
                currentNoteName: noteName,
                currentNoteContent: noteContent,
                navigationFlag: 'Folder',
                inFolder:true
              });
        }
      }

    async shareNoteAccess() {
        let res = await shareUserNoteAccessApi(this.state.noteIdForSharing, this.state.userEmailForShare, this.state.userRole)
        if (res) {
            this.setState({
                visibleModalShareNoteAccess: false,
                visibleModalShareSuccess:true,
                disableConfirmFolderButton:true
            }, () => this.swipeable.recenter())
            this.props.navigation.navigate('FolderScreen', 'screen:ddddd')
        } else {
            this.setState({
                visibleModalShareNoteAccess: false,
                visibleModalShareError:true,
                disableConfirmFolderButton:true
            }, () => this.swipeable.recenter())
        }
    }

    
    async readCurrentNote(noteTitle, noteContent, noteId, userRole) {
        this.setState({
            noteTitleForReading: noteTitle,
            noteContentForReading: noteContent,
            visibleModalForReadNote: true,
            noteId: noteId,
            userRole: userRole
        })
        let photosFromAsyncStorage = await AsyncStorage.getItem(noteId)
        photosFromAsyncStorage = JSON.parse(photosFromAsyncStorage)
    
        this.setState({
            base64Image: photosFromAsyncStorage
        })
    }

    closeModalOnHardwareButtonPress(){
        this.setState({
            visibleModalForReadNote:false,
            visibleModalShareError:false,
            visibleModalShareSuccess:false,
            visibleModalShareNoteAccess:false
        })
        return this.props.navigation.navigate('FolderScreen');
    }

    closeModalAndGoToEditNoteScreen(){
        if ( this.state.screenFlag == 'Home' ){
            this.setState({visibleModalForReadNote:false})
            this.props.navigation.navigate('EditNoteScreen', {
                currentNoteId: this.state.noteId,
                currentNoteName: this.state.noteTitleForReading,
                currentNoteContent: this.state.noteContentForReading,
                noteIdForSharing:this.state.noteId,
                navigationFlag:'Folder'
            })
        } else if ( this.state.screenFlag == 'Shared' && this.state.userRole == 'Editor' ){
            this.setState({visibleModalForReadNote:false})
            this.props.navigation.navigate('EditNoteScreen', {
                currentNoteId: this.state.noteId,
                currentNoteName: this.state.noteTitleForReading,
                currentNoteContent: this.state.noteContentForReading,
                noteIdForSharing:this.state.noteId,
                navigationFlag:'Shared',
                inFolder:true
            })
        }  else if ( this.state.screenFlag == 'Shared' && this.state.userRole == 'Reader' ){
            this.setState({
                visibleModalForReadNote:false,
                visibleModalForAccessDenied:true
            })
        }
    }

    closeModalAndDeleteNote(){
        if ( this.state.screenFlag == 'Home' ){
            this.setState({visibleModalForReadNote:false})
            this.deleteNote(this.state.noteId)
        } else if ( this.state.screenFlag == 'Shared' ){
            this.setState({
                visibleModalForReadNote:false
            }, ()=> this.deleteNote( this.state.noteId, this.state.userRole ))
        }
    }

    closeModalAndShareNote(){
        this.setState({visibleModalForReadNote:false})
        this.setState({visibleModalShareNoteAccess:true})
    }

    checkUserRoleAndCreateNote(){
        if ( this.state.userRole == 'Editor' && this.state.screenFlag == 'Shared'){
            this.props.navigation.navigate('AddNoteScreen', { navigationFlag:'Folder', inFolder:this.state.folderId })
        } else if ( this.state.userRole == 'Reader' && this.state.screenFlag == 'Shared' ){
            this.setState({
                visibleModalForAccessDenied:true
            })
        } else {
            this.props.navigation.navigate('AddNoteScreen', { navigationFlag:'Folder', inFolder:this.state.folderId })
        }
    }

    getCallbackDataFromOfflineNotice = (callbackData) => {
        this.setState({
            connectionOffline:callbackData
        })
        if ( this.state.connectionOffline == true){
            this.syncAllDataWhenConnectionIsOnline()
        }
      }

      async syncAllDataWhenConnectionIsOnline(){
        let asyncLoginUserData = await AsyncStorage.getItem('asyncLoginUserData');
        asyncLoginUserData = JSON.parse(asyncLoginUserData);
        let asyncNotesArray = await AsyncStorage.getItem('Notes');
        asyncNotesArray = JSON.parse(asyncNotesArray)
        let asyncFoldersArray = await AsyncStorage.getItem('Folders');
        asyncFoldersArray = JSON.parse(asyncFoldersArray)
        if(asyncFoldersArray == null ){
            asyncFoldersArray = [];
        } else if(asyncNotesArray == null){
            asyncNotesArray = [];
        }
        let userNotesAndFolders = asyncFoldersArray.concat(asyncNotesArray)
        if ( this.state.connectionOffline == true){
            await syncOfflineData(asyncNotesArray, asyncFoldersArray)
        }
    }

    openFullSizeImage(image){
        this.setState({
            fullSizeImage:image,
            visibleModalForFullSizeImage:true
        })
    }

    render() {
        return (
            <Container >
              <OfflineNotice callbackOfflineNotice={this.getCallbackDataFromOfflineNotice} />
                <Header style={styles.header} >
                    <Left style={styles.headerLeft} >
                    <TouchableOpacity style={{ width:30 }} onPress={() => this.props.navigation.goBack()}>
                        <Icon name="ios-arrow-back" style={styles.headerLeftIcon}  />
                    </TouchableOpacity>
                    </Left>
                    <Right style={{ flexDirection: 'row' }}>
                        <Icon name="add-circle" type='MaterialIcons' style={styles.headerRightText} onPress={() => this.checkUserRoleAndCreateNote()}></Icon>
                    </Right>
                </Header>
                <ScrollView>
                {       
                    this.state.userNotes.length != 0 ?
                        <View>
                            {
                                this.state.userNotes.map(item => {
                                    if(item.inFolder == this.state.folderId){
                                        return (
                                            <Swipeable key={item.localId} onRef={ref => this.swipeable = ref} rightButtons={this.rightSwipeButtons(item.localId, item.name, item.content, item.role)} style={styles.item}>
                                                    <TouchableOpacity style={styles.noteView} onPress={() => this.readCurrentNote(item.name, item.content, item.localId, item.role)}>
                                                    <View>
                                                        <Icon name="ios-document" style={{marginTop:'70%', fontSize:40, color:'orange'}}></Icon>
                                                    </View>
                                                    <View style={{ marginLeft: 11}}>
                                                        <Text numberOfLines={1} style={styles.noteName}>{item.name}</Text>
                                                        <Text style={styles.noteDate}>{item.noteDate}</Text>
                                                        <Text numberOfLines={1} style={styles.noteContent}>{item.content}</Text>
                                                    </View>
                                                    </TouchableOpacity>
                                            </Swipeable>
                                        )
                                    }
                                })
                            }
                        </View>
                        : 
                        <TouchableOpacity style={{ alignItems: "center", marginTop: '60%'}} onPress={() => this.props.navigation.navigate('AddNoteScreen', { navigationFlag:'Folder', inFolder:this.state.folderId })}><Text style={{ fontSize: 20, fontFamily: 'OpenSans-Regular' }}>Tap to add your first note</Text></TouchableOpacity>
                    }


                </ScrollView>
                <Dialog footer={<DialogFooter>
                    <DialogButton
                        text="CLOSE"
                        onPress={() => this.setState({ visibleModalShareNoteAccess: false })}
                    />
                    <DialogButton
                        text="CONFIRM"
                        onPress={() => this.shareNoteAccess()}
                    />
                    </DialogFooter>} dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })} width={0.9} dialogTitle={<DialogTitle title="SHARE NOTE" />} visible={this.state.visibleModalShareNoteAccess} onTouchOutside={() => { this.setState({ visibleModalShareNoteAccess: false }) }}>
                    <DialogContent style={{ alignItems: 'center' }}>
                        <Icon name="md-share" style={{ color: 'orange', marginTop: 30, fontSize: 40 }} />
                        <TextInput style={{ textAlign: 'center', fontSize: 20, borderBottomWidth: 1, borderBottomColor: 'silver', width: '100%' }} placeholder="Enter user email" onChangeText={userEmailForShare => this.setState({ userEmailForShare: userEmailForShare })}></TextInput>
                        <Text style={{ fontSize: 20, marginTop: 20 }}>Select the user role</Text>
                        <Icon name="ios-contact" style={{ color: 'orange', marginTop: 10, fontSize: 40 }} />
                        <Picker
                            selectedValue={this.state.userRole}
                            style={{ height: 50, width: '100%' }}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setState({ userRole: itemValue })
                            }>
                            <Picker.Item label="Only read notes/folders" value="Reader" />
                            <Picker.Item label="Editing notes/folders" value="Editor" />
                        </Picker>
                    </DialogContent>
                </Dialog> 

                <Modal animationType="slide" transparent={true} visible={this.state.visibleModalForReadNote}>
                    <TouchableOpacity activeOpacity={1} onPressOut={()=>this.setState({visibleModalForReadNote:false})} style={{flex:1, justifyContent: 'center', alignItems: 'center', backgroundColor:'#F8F8F8'}}>
                        <TouchableOpacity activeOpacity={1} style={{ height: '90%' ,width: '100%', borderRadius:10, borderWidth: 1,borderColor: '#fff'}}>
                            <Header style = {{ height:50, borderTopRightRadius:10, borderTopLeftRadius:10, borderTopWidth: 1, borderColor: 'white', backgroundColor:'#F8F8F8' }}>
                                <Text style = {{ fontSize:35 }}>{this.state.noteTitleForReading}</Text>
                                <Icon onPress={()=>this.setState({visibleModalForReadNote:false})} name="ios-close-circle" style={{fontSize: 45, position:'absolute', right:0}}/>
                            </Header>
                            <Container>
                                <ScrollView>
                                    <View >
                                        <Text style = {{ fontSize:20, padding:10}} onPress={ () => this.closeModalAndGoToEditNoteScreen() }>{this.state.noteContentForReading}</Text>
                                            <ScrollView horizontal style={{ flexDirection:'row' }}>
                                            {
                                                this.state.base64Image.map((item) =>
                                                <TouchableOpacity onPress={ ()=> this.openFullSizeImage(item) }>        
                                                    <Image source={{ uri:'data:image/jpg;base64,' + item }} style={{ width:150, height:150 }} />
                                                </TouchableOpacity>
                                            )}
                                            </ScrollView>
                                    </View>
                                </ScrollView>
                            </Container>
                            <Footer style={{ flex:0, backgroundColor:'white' }}>
                                <Button warning bordered style={{marginRight:'5%', marginTop:5}} onPressIn={ () => this.closeModalAndGoToEditNoteScreen() }>
                                    <Icon name='ios-open' />
                                    <Text style={{paddingRight:10}}>Edit</Text>
                                </Button>
                                <Button success bordered style={{marginRight:'5%', marginTop:5}} onPressIn={ () => this.closeModalAndShareNote()}>
                                    <Icon name='share' />
                                    <Text style={{paddingRight:10}}>Share</Text>
                                </Button>
                                <Button danger bordered style={{marginRight:'5%', marginTop:5}} onPressIn={ () => this.closeModalAndDeleteNote()}>
                                    <Icon name='trash' />
                                    <Text style={{paddingRight:10}}>Delete</Text>
                                </Button>
                            </Footer>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>


                <Modal animationType="slide" transparent={true} visible={this.state.visibleModalForFullSizeImage}>
                    <TouchableOpacity activeOpacity={1} onPressOut={()=>this.setState({visibleModalForFullSizeImage:false})} style={{flex:1, justifyContent: 'center', alignItems: 'center', backgroundColor:'#F8F8F8'}}>
                        <TouchableOpacity activeOpacity={1} style={{ height: '90%' ,width: '100%', borderRadius:10, borderWidth: 1,borderColor: '#fff'}}>
                            <Header style = {{ height:50, borderTopRightRadius:10, borderTopLeftRadius:10, borderTopWidth: 1, borderColor: 'white', backgroundColor:'#F8F8F8' }}>
                                <Icon onPress={()=>this.setState({visibleModalForFullSizeImage:false})} name="ios-close-circle" style={{fontSize: 45, position:'absolute', right:0}}/>
                            </Header>
                            <Container>
                                <View>    
                                    <Image source={{ uri:'data:image/jpg;base64,' + this.state.fullSizeImage }} style={{ width:'100%', height:'100%' }} />                            
                                </View>
                            </Container>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>

                <Dialog onHardwareBackPress={()=>this.closeModalOnHardwareButtonPress()} footer={<DialogFooter>
                    <DialogButton
                        text="CLOSE"
                        onPress={() => this.setState({ visibleModalShareError: false })}
                    />
                </DialogFooter>} dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })} width={1} dialogTitle={<DialogTitle title="SHARE ERROR" />} visible={this.state.visibleModalShareError} onTouchOutside={() => { this.setState({ visibleModalShareError: false }); }}>
                    <DialogContent>
                        <View style={{ alignItems: 'center' }}><Icon name="ios-alert" style={{ color: 'red', marginTop: 20, fontSize: 50 }} /><Text style={{ fontSize: 20, fontFamily: 'OpenSans-Regular', textAlign: 'center' }}>User not found, make sure the email you entered is correct</Text></View>
                    </DialogContent>
                </Dialog>

                <Dialog onHardwareBackPress={()=>this.closeModalOnHardwareButtonPress()} footer={<DialogFooter>
                    <DialogButton
                        text="CLOSE"
                        onPress={() => this.setState({ visibleModalShareSuccess: false })}
                    />
                </DialogFooter>} dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })} width={1} dialogTitle={<DialogTitle title="SUCCESS" />} visible={this.state.visibleModalShareSuccess} onTouchOutside={() => { this.setState({ visibleModalShareSuccess: false }); }}>
                    <DialogContent>
                        <View style={{ alignItems: 'center' }}><Icon name="ios-checkmark-circle" style={{ color: 'green', marginTop: 20, fontSize: 50 }} /><Text style={{ fontSize: 20, fontFamily: 'OpenSans-Regular', textAlign: 'center' }}>Access has been successfully added for {this.state.userEmailForShare} user</Text></View>
                    </DialogContent>
                </Dialog>
                <Dialog
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

            </Container>

        )
    }
}

const styles = StyleSheet.create({
    item: { borderBottomWidth: 1, borderColor: "lightgray", width: '100%', },
    noteView: { paddingLeft: 20, paddingTop: 10, paddingBottom: 10, paddingRight: 20, flexDirection: 'row' },
    folderView: { paddingLeft: 20, paddingTop: 10, paddingBottom: 10, paddingRight: 20, flexDirection: 'row' },
    noteName: { fontSize: 20, fontFamily: 'OpenSans-SemiBold' },
    folderName: { fontSize: 20, marginLeft: 10, fontFamily: 'OpenSans-SemiBold' },
    noteContent: { fontFamily: 'OpenSans-Regular' },
    noteDate: { marginTop: 5, marginBottom: 5, fontFamily: 'OpenSans-Regular' },
    header: { backgroundColor: 'white', },
    headerLeft: { flexDirection: 'row' },
    headerLeftIcon: { color: 'orange', marginLeft: '10%', fontSize: 30 },
    headerRightText: { color: 'orange', fontSize: 35, paddingLeft: 20, paddingRight: 10 },
    leftSwipeContainer: { backgroundColor: 'white', height: '100%', justifyContent: 'center', alignItems: 'flex-end', paddingRight: 30, borderTopWidth: 0, borderColor: "lightgray", },
    leftSwipeContainerIcon: { color: 'green' },
    rightSwipeFirstContainer: { backgroundColor: 'red', height: '100%', justifyContent: 'center', paddingLeft: 30 },
    rightSwipeIcons: { color: 'white' },
    rightSwipeSecondContainer: { backgroundColor: 'orange', height: '100%', justifyContent: 'center', paddingLeft: 30 },
    searchInput: { padding: 10, borderColor: '#CCC', borderWidth: 1, paddingLeft: 50 },
    iconSearchInput: { position: 'absolute', top: 10, left: 22, color: 'orange' },
    rightSwipeThirdContainer: { backgroundColor: 'green', height: '100%', justifyContent: 'center', paddingLeft: 30 },

});

export default Folder;