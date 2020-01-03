import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, AsyncStorage, StyleSheet, TextInput, Picker, BackHandler, Modal, Image } from 'react-native';
import { Container, Header, Left, Right, Icon, Button, Footer } from 'native-base';
import { editUserFolderApi, addUserFolderApi, deleteUserDataApi, syncOfflineData, shareUserNoteAccessApi, shareUserFolderAccessApi,  } from "../networking/API"
import Swipeable from 'react-native-swipeable';
import SearchInput, { createFilter } from 'react-native-search-filter';
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
import OfflineNotice from '../parts/OfflineNotice'
import SlideInMenu from '../parts/SlideInMenu';
import HamburgerMenu from '../parts/HamburgerMenu';



const KEYS_TO_FILTERS = ['name', 'content', 'folderName'];


class Home extends Component {


    static navigationOptions =
        {
            header: null,
        };
    constructor(props) {
        super(props);
           this.state = {
            userNotes: [],
            userFolders: [],
            userNotesAndFolders: [],
            currentNoteId: '',
            userToken: '',
            searchTerm: '',
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
            visibleModalForReadNote: false,
            userEmailForShare: '',
            connectionOffline:false,
            userRole: 'Reader',
            visibleHamburgerMenu:false,
            noteIdForSharing: '',
            noteTitleForReading: '',
            noteContentForReading: '',
            visibleModalShareError:false,
            visibleModalShareSuccess:false,
            disableConfirmFolderButton:true,
            itemSearch: { borderBottomWidth: 1, borderColor: "lightgray", display:'none' },
            clearScreenText:'Tap to add your first note',
            noteId:'',
            base64Image:[],
            visibleModalForFullSizeImage: false, 
            fullSizeImage:''
        };
    }
    swipeable = null;

    searchUpdated(term) {

        if(term == ''){
            this.setState({ searchTerm: term, itemSearch: { borderBottomWidth: 1, borderColor: "lightgray", display:'none', }, clearScreenText:'Tap to add your first note' })
        }else{
            this.setState({ searchTerm: term, itemSearch: { borderBottomWidth: 1, borderColor: "lightgray", display:'flex' }, clearScreenText:'Nothing found' })
        }
    }

    async componentDidMount() {
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
        if(this.swipeable != null){
            await this.swipeable.recenter()
        }
        this.setState({
          userToken: asyncLoginUserData.userToken,
          userName: asyncLoginUserData.username,
          userNotes: asyncNotesArray,
          userFolders: asyncFoldersArray,
          userNotesAndFolders: userNotesAndFolders
        });
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if(this.props.navigation.isFocused() == true){
                BackHandler.exitApp();
                return true
            } // works best when the goBack is async
           });
        
      }
      componentWillUnmount() {
        this.backHandler.remove()
      }
    
      async UNSAFE_componentWillReceiveProps() {
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
        if(this.swipeable != null){
            await this.swipeable.recenter()
        }
        this.setState({
          userToken: asyncLoginUserData.userToken,
          userName: asyncLoginUserData.username,
          userNotes: asyncNotesArray,
          userFolders: asyncFoldersArray,
          userNotesAndFolders: userNotesAndFolders
        });
       
      }

      

     
    async deleteNote(noteId) {
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
        await AsyncStorage.removeItem(noteId)
        this.setState({
            visibleModalForReadNote:false
        })
        this.props.navigation.navigate('HomeScreen', 'screen:ddd')
    }

    async createFolder() {
        let oldAsyncFolders = await AsyncStorage.getItem('Folders');
        oldAsyncFolders = JSON.parse(oldAsyncFolders);
        if (oldAsyncFolders == null) {
        this.setState({
            userFolders: [],
        });
        } else {
        this.setState({
            userFolders: oldAsyncFolders,
        });
        }
        let asyncFoldersArray = this.state.userFolders;
        let today = new Date();
        today = today.toGMTString();
        let folderToPushInAsyncStorage = {
            localId: Date.now().toString(),
            folderName: this.state.folderName,
            folderDate: today,
        };
        asyncFoldersArray.push(folderToPushInAsyncStorage);
        if( this.state.connectionOffline ){
            await addUserFolderApi(folderToPushInAsyncStorage)
        }
        await AsyncStorage.setItem('Folders', JSON.stringify(asyncFoldersArray))
        .then(() => {
            this.setState({
                visibleModalAddNewFolder:false,
                disableConfirmFolderButton:true,
                folderEditName: '',
            }, ()=> this.props.navigation.navigate('HomeScreen', {screen: 'ddddddd'}))
            
        })
        .catch(err => {
            console.log('saveNoteInAsyncStorage error', err);
        });
    }

    async editFolderName() {
        let asyncUserFolders = await AsyncStorage.getItem('Folders');
        asyncUserFolders = JSON.parse(asyncUserFolders);
        let arrayAsyncUserFolders = [];
        let pushFolderNameToDatabase = {};
        arrayAsyncUserFolders = asyncUserFolders;
        arrayAsyncUserFolders.map(item => {
        if (item.localId == this.state.currentFolderId) {
            item.folderName = this.state.folderEditName;
            pushFolderNameToDatabase = {
                localId: item.localId,
                folderName: item.folderName
            }        
        }
        });
        if( this.state.connectionOffline ){
            await editUserFolderApi(pushFolderNameToDatabase);
        }
        await AsyncStorage.setItem('Folders', JSON.stringify(arrayAsyncUserFolders));
        this.setState({
            visibleModalEditFolderName:false,
            disableConfirmFolderButton:false,
            folderEditName: '',
        }, ()=> this.props.navigation.navigate('HomeScreen', 'screen:ddd'))
        
    }

    async shareNoteAccess() {
        let res = await shareUserNoteAccessApi(this.state.noteIdForSharing, this.state.userEmailForShare, this.state.userRole)
        if (res) {
            this.setState({
                isLoading: false,
                visibleModalShareNoteAccess: false,
                visibleModalShareSuccess:true,
                disableConfirmFolderButton:true
            }, () => this.swipeable.recenter())
            this.props.navigation.navigate('HomeScreen', 'screen:ddddd')
        } else {
            this.setState({
                isLoading: false,
                visibleModalShareNoteAccess: false,
                visibleModalShareError:true,
                disableConfirmFolderButton:true
            }, () => this.swipeable.recenter())
        }
        
    }

    async shareFolderAccess() {
        let res = await shareUserFolderAccessApi(this.state.currentFolderId, this.state.userEmailForShare, this.state.userRole)
        if (res) {
            this.setState({
                isLoading: false,
                visibleModalShareFolderAccess: false,
                visibleModalShareSuccess:true,
                disableConfirmFolderButton:true
            }, () => this.swipeable.recenter())
            this.props.navigation.navigate('HomeScreen', 'screen:ddddd')
        } else {
            this.setState({
                isLoading: false,
                visibleModalShareFolderAccess: false,
                visibleModalShareError:true,
                disableConfirmFolderButton:true
            }, () => this.swipeable.recenter())
        }
    }

    rightSwipeButtons(noteId, noteName, noteContent) {
        return [
            <TouchableOpacity style={styles.rightSwipeFirstContainer} onPress={() => this.deleteNote(noteId)}>
                <Icon size={30} name="ios-trash" style={styles.rightSwipeIcons} />
            </TouchableOpacity>,
            <TouchableOpacity style={styles.rightSwipeSecondContainer} onPress={() => this.props.navigation.navigate('EditNoteScreen', {
                currentNoteId: noteId,
                currentNoteName: noteName,
                currentNoteContent: noteContent,
                navigationFlag:'Home',
                inFolder: null
            })} >
                <Icon size={30} name="ios-document" style={styles.rightSwipeIcons}  />
            </TouchableOpacity>,
            <TouchableOpacity disabled={!this.state.connectionOffline} style={styles.rightSwipeThirdContainer} onPress={() => this.setState({ visibleModalShareNoteAccess: true, noteIdForSharing: noteId })}>
                <Icon active={this.state.connectionOffline} size={30} name="md-share" style={styles.rightSwipeIcons}  />
            </TouchableOpacity>]
    }

    closeModalAndGoToEditNoteScreen(){
        this.props.navigation.navigate('EditNoteScreen', {
            currentNoteId: this.state.noteId,
            currentNoteName: this.state.noteTitleForReading,
            currentNoteContent: this.state.noteContentForReading,
            navigationFlag:'Home',
            inFolder: null
        })
        this.setState({
            visibleModalForReadNote:false
        })
    }

    async readCurrentNote(noteTitle, noteContent, noteId) {
       
        this.setState({
            noteTitleForReading: noteTitle,
            noteContentForReading: noteContent,
            visibleModalForReadNote: true,
            noteIdForSharing:noteId,
            noteId:noteId
        })
        let photosFromAsyncStorage = await AsyncStorage.getItem(noteId)
        photosFromAsyncStorage = JSON.parse(photosFromAsyncStorage)
    
        this.setState({
            base64Image: photosFromAsyncStorage
        })
    }

    validateFolderName(inputText){
        if(inputText != ''){
            this.setState({
                disableConfirmFolderButton:false,
                folderName: inputText
            })
        }else{
            this.setState({
                disableConfirmFolderButton:true
            })
        }
    }

    validateEditFolderName(inputText){
        if(inputText != ''){
            this.setState({
                disableConfirmFolderButton:false,
                folderEditName: inputText
            })
        }else{
            this.setState({
                disableConfirmFolderButton:true
            })
        }
    }

    validateShare(inputText){
        if(inputText != ''){
            this.setState({
                disableConfirmFolderButton:false,
                userEmailForShare: inputText
            })
        }else{
            this.setState({
                disableConfirmFolderButton:true
            })
        }
    }
    closeModalOnHardwareButtonPress(){
        this.setState({
            visibleModalForReadNote:false,
            visibleModalShareError:false,
            visibleModalShareSuccess:false,
            visibleModalShareNoteAccess:false
        })
        return this.props.navigation.navigate('HomeScreen');
    }

    contextMenu(folderId) {
        this.setState({
            opened: true,
            currentFolderId: folderId
        })
    }
    

    getCallbackDataFromSlideInMenu = (callbackData) => {
        this.setState({
            opened: callbackData.opened,
            visibleModalEditFolderName: callbackData.visibleModalEditFolderName,
            visibleModalShareFolderAccess: callbackData.visibleModalShareFolderAccess
        })
        this.props.navigation.navigate('HomeScreen', 'screen:ddddd')    
    }

    getCallbackDataFromHamburgerMenu = (callbackData) => {
        this.setState({
            visibleHamburgerMenu: callbackData.visibleHamburgerMenu,
        })
    }

    getCallbackDataFromOfflineNotice = (callbackData) => {
        this.setState({
            connectionOffline:callbackData
        })
        if ( !this.state.connectionOffline ){
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
        if ( this.state.connectionOffline == true && userNotesAndFolders.length > 0){
            await syncOfflineData(asyncNotesArray, asyncFoldersArray)
        }
    }

    DrawHamburgerMenu(){
        this.setState({
            visibleHamburgerMenu:true
        })
    }

    openFullSizeImage(image){
        this.setState({
            fullSizeImage:image,
            visibleModalForFullSizeImage:true
        })
    }

    render() {
        let userNotesAndFolders = this.state.userNotesAndFolders;
        const filteredUserData = userNotesAndFolders.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS))
        
        return (

            <Container>
                <OfflineNotice callbackOfflineNotice={this.getCallbackDataFromOfflineNotice} />
                <Header style={styles.header} >
                    <Left style={styles.headerLeft}>
                        <Icon name="menu" type='MaterialIcons' style={styles.headerLeftIcon} onPress={()=>this.DrawHamburgerMenu()}/>
                    </Left>
                    <Right style={{ flexDirection: 'row' }}>
                        <Icon name="add-circle" type='MaterialIcons' style={styles.headerRightText} onPress={() => this.props.navigation.navigate('AddNoteScreen', { navigationFlag:'Home', inFolder:null })}></Icon>
                        <Icon name="create-new-folder" type='MaterialIcons' style={styles.headerRightText} onPress={() => { this.setState({ visibleModalAddNewFolder: true }) }}></Icon>
                    </Right>
                </Header>
                
                <View>
                    <Icon size={30} name="ios-search" style={styles.iconSearchInput} />
                    <SearchInput clearIconViewStyles={{ position: 'absolute', top: 12, right: 22 }} clearIcon={this.state.searchTerm !== '' && <Icon name="ios-close" />} style={styles.searchInput} onChangeText={(term) => { this.searchUpdated(term) }} placeholder=" " />
                </View>
               
                <ScrollView>
                {       
                
                    filteredUserData[0] != null ?
                            <View>
                                {
                                    filteredUserData.map(item => {
                                        if (item.folderName != null) {
                                            return (
                                                <TouchableOpacity onPress={() => this.props.navigation.navigate('FolderScreen', { folderId: item.localId, screenFlag:'Home' })} key={item.localId} onLongPress={() => this.contextMenu(item.localId)} style={styles.item}>
                                                    <View style={styles.folderView} >
                                                        <Icon name="ios-folder" style={{ color: 'orange' }} />
                                                        <Text numberOfLines={1} style={styles.folderName}>{item.folderName}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            )
                                        }else if(item.inFolder == null){
                                            return (
                                                <Swipeable key={item.localId} onRef={ref => this.swipeable = ref} rightButtons={this.rightSwipeButtons(item.localId, item.name, item.content)} style={styles.item}>
                                                        <TouchableOpacity style={styles.noteView} onPress={() => this.readCurrentNote(item.name, item.content, item.localId)}>
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
                                        }else{
                                            return (
                                                <Swipeable key={item.localId} onRef={ref => this.swipeable = ref} rightButtons={this.rightSwipeButtons(item.localId, item.name, item.content)} style={this.state.itemSearch}>
                                                        <TouchableOpacity style={styles.noteView} onPress={() => this.readCurrentNote(item.name, item.content, item.localId)}>
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

                    : <TouchableOpacity style={{ alignItems: "center", marginTop: '60%' }} onPress={() => this.props.navigation.navigate('AddNoteScreen', { navigationFlag:'Home', inFolder:null })}><Text style={{ fontSize: 20, fontFamily: 'OpenSans-Regular' }}>{this.state.clearScreenText}</Text></TouchableOpacity>
                }
                </ScrollView>

                <SlideInMenu callBackFromSlideInMenu={this.getCallbackDataFromSlideInMenu} openMenu={this.state.opened} folderId={this.state.currentFolderId} connection={this.state.connectionOffline}/>
                {this.state.visibleHamburgerMenu ? <HamburgerMenu callBackFromHamburgerMenu={this.getCallbackDataFromHamburgerMenu} openMenu={this.state.visibleHamburgerMenu} userName={this.state.userName} navigate={this.props.navigation} connection={this.state.connectionOffline}/> : null }
                <Dialog onHardwareBackPress={()=> this.closeModalOnHardwareButtonPress()} footer={<DialogFooter>
                    <DialogButton
                        text="CLOSE"
                        onPress={() => this.setState({ visibleModalAddNewFolder: false })}
                    />
                    <DialogButton
                        disabled={this.state.disableConfirmFolderButton}
                        text="CONFIRM"
                        onPress={() => this.createFolder()}
                    />
                </DialogFooter>} dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })} width={0.9} dialogTitle={<DialogTitle title="CREATE FOLDER" />} visible={this.state.visibleModalAddNewFolder} onTouchOutside={() => { this.setState({ visibleModalAddNewFolder: false }); }} >
                    <DialogContent style={{ alignItems: 'center' }} >
                        <Icon name="ios-folder" style={{ color: 'orange', marginTop: 30, fontSize: 40 }} />
                        <TextInput style={{ textAlign: 'center', fontSize: 20, borderBottomWidth: 1, borderBottomColor: 'silver', width: '100%' }} placeholder="Enter your folder name" onChangeText={folderName => this.validateFolderName(folderName)}></TextInput>
                    </DialogContent>
                </Dialog>

                <Dialog onHardwareBackPress={()=> this.closeModalOnHardwareButtonPress()} footer={<DialogFooter>
                    <DialogButton
                        text="CLOSE"
                        onPress={() => this.setState({ visibleModalEditFolderName: false })}
                    />
                    <DialogButton
                        disabled={this.state.disableConfirmFolderButton}
                        text="CONFIRM"
                        onPress={() => this.editFolderName()}
                    />
                </DialogFooter>} dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })} width={0.9} dialogTitle={<DialogTitle title="RENAME FOLDER" />} visible={this.state.visibleModalEditFolderName} onTouchOutside={() => { this.setState({ visibleModalEditFolderName: false }); }}>
                    <DialogContent style={{ alignItems: 'center' }}>
                        <Icon name="ios-folder" style={{ color: 'orange', marginTop: 30, fontSize: 40 }} />
                        <TextInput  style={{ textAlign: 'center', fontSize: 20, borderBottomWidth: 1, borderBottomColor: 'silver', width: '100%' }} placeholder="Enter your folder name" onChangeText={editFolderName => this.validateEditFolderName(editFolderName)}></TextInput>
                    </DialogContent>
                </Dialog>

                <Dialog onHardwareBackPress={()=> this.closeModalOnHardwareButtonPress()} footer={<DialogFooter>
                    <DialogButton
                        text="CLOSE"
                        onPress={() => this.setState({ visibleModalShareNoteAccess: false })}
                    />
                    <DialogButton
                        disabled={this.state.disableConfirmFolderButton}
                        text="CONFIRM"
                        onPress={() => this.shareNoteAccess()}
                    />
                </DialogFooter>} dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })} width={0.9} dialogTitle={<DialogTitle title="SHARE NOTE" />} visible={this.state.visibleModalShareNoteAccess} onTouchOutside={() => { this.setState({ visibleModalShareNoteAccess: false }) }}>
                    <DialogContent style={{ alignItems: 'center' }}>
                        <Icon name="md-share" style={{ color: 'orange', marginTop: 30, fontSize: 40 }} />
                        <TextInput style={{ textAlign: 'center', fontSize: 20, borderBottomWidth: 1, borderBottomColor: 'silver', width: '100%' }} placeholder="Enter user email" onChangeText={userEmailForShare => this.validateShare(userEmailForShare)}></TextInput>
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

                <Dialog onHardwareBackPress={()=> this.closeModalOnHardwareButtonPress()} footer={<DialogFooter>
                    <DialogButton
                        text="CLOSE"
                        onPress={() => this.setState({ visibleModalShareFolderAccess: false })}
                    />
                    <DialogButton
                        disabled={this.state.disableConfirmFolderButton}
                        text="CONFIRM"
                        onPress={() => this.shareFolderAccess()}
                    />
                </DialogFooter>} dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })} width={0.9} dialogTitle={<DialogTitle title="SHARE FOLDER" />} visible={this.state.visibleModalShareFolderAccess} onTouchOutside={() => { this.setState({ visibleModalShareFolderAccess: false }) }}>
                    <DialogContent style={{ alignItems: 'center' }}>
                        <Icon name="md-share" style={{ color: 'orange', marginTop: 30, fontSize: 40 }} />
                        <TextInput style={{ textAlign: 'center', fontSize: 20, borderBottomWidth: 1, borderBottomColor: 'silver', width: '100%' }} placeholder="Enter user email" onChangeText={userEmailForShare => this.validateShare(userEmailForShare)}></TextInput>
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
                                <Button success bordered style={{marginRight:'5%',  marginTop:5}} onPressIn={ () => this.setState({ visibleModalForReadNote:false, visibleModalShareNoteAccess:true})}>
                                    <Icon name='share' />
                                    <Text style={{paddingRight:10}}>Share</Text>
                                </Button>
                                <Button danger bordered style={{marginRight:'5%',  marginTop:5}} onPressIn={ () => this.deleteNote(this.state.noteId) }>
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




                <Dialog onHardwareBackPress={()=> this.closeModalOnHardwareButtonPress()} footer={<DialogFooter>
                    <DialogButton
                        text="CLOSE"
                        onPress={() => this.setState({ visibleModalShareError: false })}
                    />
                </DialogFooter>} dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })} width={1} dialogTitle={<DialogTitle title="SHARE ERROR" />} visible={this.state.visibleModalShareError} onTouchOutside={() => { this.setState({ visibleModalShareError: false }); }}>
                    <DialogContent>
                        <View style={{ alignItems: 'center' }}><Icon name="ios-alert" style={{ color: 'red', marginTop: 20, fontSize: 50 }} /><Text style={{ fontSize: 20, fontFamily: 'OpenSans-Regular', textAlign: 'center' }}>User not found, make sure the email you entered is correct</Text></View>
                    </DialogContent>
                </Dialog>

                <Dialog onHardwareBackPress={()=> this.closeModalOnHardwareButtonPress()} footer={<DialogFooter>  
                    <DialogButton
                        text="CLOSE"
                        onPress={() => this.setState({ visibleModalShareSuccess: false })}
                    />
                </DialogFooter>} dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })} width={1} dialogTitle={<DialogTitle title="SUCCESS" />} visible={this.state.visibleModalShareSuccess} onTouchOutside={() => { this.setState({ visibleModalShareSuccess: false }); }}>
                    <DialogContent>
                        <View style={{ alignItems: 'center' }}><Icon name="ios-checkmark-circle" style={{ color: 'green', marginTop: 20, fontSize: 50 }} /><Text style={{ fontSize: 20, fontFamily: 'OpenSans-Regular', textAlign: 'center' }}>Access has been successfully added for {this.state.userEmailForShare} user</Text></View>
                    </DialogContent>
                </Dialog>
            </Container>


        )
    }
}

const styles = StyleSheet.create({
    item: { borderBottomWidth: 1, borderColor: "lightgray", width: '100%', },
    noteView: { paddingLeft: 20, paddingTop: 5, paddingBottom: 10, paddingRight: 20, flexDirection:'row' },
    folderView: { paddingLeft: 20, paddingTop: 10, paddingBottom: 10, paddingRight: 20, flexDirection: 'row' },
    noteName: { fontSize: 20, fontFamily: 'OpenSans-SemiBold',  },
    folderName: { fontSize: 20, marginLeft: 10, fontFamily: 'OpenSans-SemiBold' },
    noteDate: { marginTop: 5, marginBottom: 5, fontFamily: 'OpenSans-Italic' },
    noteContent: { fontFamily: 'OpenSans-Regular' },
    header: { backgroundColor: 'white', },
    headerLeft: { flexDirection: 'row' },
    headerLeftIcon: { color: 'orange', marginLeft: '10%', fontSize: 35 },
    headerRightText: { color: 'orange', fontSize: 35, paddingLeft: 20, paddingRight: 10 },
    leftSwipeContainerIcon: { color: 'green' },
    rightSwipeFirstContainer: { backgroundColor: 'red', height: '100%', justifyContent: 'center', paddingLeft: 30 },
    rightSwipeIcons: { color: 'white' },
    rightSwipeSecondContainer: { backgroundColor: 'orange', height: '100%', justifyContent: 'center', paddingLeft: 30 },
    rightSwipeThirdContainer: { backgroundColor: 'green', height: '100%', justifyContent: 'center', paddingLeft: 30 },
    searchInput: { padding: 10, borderColor: '#CCC', borderWidth: 1, paddingLeft: 50 },
    iconSearchInput: { position: 'absolute', top: 10, left: 22, color: 'orange' },
});

export default Home;