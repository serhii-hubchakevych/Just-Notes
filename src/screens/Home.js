// Home.js

import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, AsyncStorage, StyleSheet, TouchableHighlight, TextInput, Button } from 'react-native';
import { Container, Header, Left, Right, Icon, } from 'native-base';
import Swipeable from 'react-native-swipeable';
import Loader from "react-native-modal-loader";
import { editUserFolderApi, deleteUserFolderApi, addUserFolderApi, deleteUserDataApi, getUserDataApi } from "../networking/API"
import SearchInput, { createFilter } from 'react-native-search-filter';
import Dialog, { DialogContent } from 'react-native-popup-dialog';
import { Menu, MenuOptions, MenuOption, MenuTrigger, renderers } from 'react-native-popup-menu';


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
            currentNoteId: '',
            isLoading: false,
            currentDay: '',
            currentTime: '',
            userToken: '',
            searchTerm: '',
            visibleModalAddNewFolder: false,
            folderName: '',
            folderEditName:'',
            opened: false,
            currentFolderId: '',
            visibleModalEditFolderName:false
        };

        
    }
    swipeable = null;
    

    searchUpdated(term) {
        this.setState({ searchTerm: term })
    }


        
   

    async componentDidMount() {
        this.setState({
            isLoading: true,
        })
        // this.swipeable.recenter()
        const { navigation } = this.props;
        var serverDataResponse = JSON.stringify(navigation.getParam('res', 'ERROR'));
        var userToken = JSON.parse(serverDataResponse);
        let el = await getUserDataApi(userToken)
        console.log(userToken)
        console.log(el)
        if (el !== null) {
            this.setState({
                userNotes: el,
                userToken: userToken,
                isLoading: false
            })
        } else {
            this.setState({
                userNotes: []
            })
        }
    }

    async UNSAFE_componentWillReceiveProps() {
        this.setState({
            isLoading: true,
        })
        
        const { navigation } = this.props;
        var serverDataResponse = JSON.stringify(navigation.getParam('res', 'ERROR'));
        var userToken = JSON.parse(serverDataResponse);
        this.swipeable.recenter()
        let el = await getUserDataApi(userToken)
        this.swipeable.recenter()
        if (el !== null) {
            this.setState({
                userNotes: el,
                userToken: userToken,
                isLoading: false
            }, ()=>this.swipeable.recenter())
            
        } else {
            this.setState({
                userNotes: []
            })
        }
    }

    async logOutAsyng() {
        await AsyncStorage.setItem('Token', '');
        await AsyncStorage.setItem('Login', '');
        await AsyncStorage.setItem('Password', '');
        this.props.navigation.navigate('AuthScreen', 'screen:ddddd')
    }



    async deleteNote(noteId) {
        
        this.setState({
            isLoading: true,
        })
        this.swipeable.recenter()
        let userToken = this.state.userToken
        let res = await deleteUserDataApi(noteId, userToken)
        this.setState({
            isLoading: false,
        })
        if (res) {
            this.props.navigation.navigate('HomeScreen', 'screen:ddddd')
        } else {
            alert('Server error')
        }
    }

    async createFolder() {
        this.setState({
            isLoading: true,
        })
        let userToken = this.state.userToken
        let folderName = this.state.folderName
        let res = await addUserFolderApi(userToken, folderName)

        if (res) {
            this.setState({
                isLoading: false,
                visibleModalAddNewFolder: false,
            })
            this.props.navigation.navigate('HomeScreen', 'screen:ddddd')
        } else {
            alert('Add Server error')
        }
    }

    async editFolderName() {
        this.setState({
            isLoading: true,
        })
        let userToken = this.state.userToken
        let folderName = this.state.folderEditName
        let folderId = this.state.currentFolderId
        let res = await editUserFolderApi(userToken, folderName, folderId)

        if (res) {
            this.setState({
                isLoading: false,
                visibleModalEditFolderName: false,
            })
            this.props.navigation.navigate('HomeScreen', 'screen:ddddd')
        } else {
            alert('Edit Server error')
            this.setState({
                isLoading: false,
            })
        }
    }

    async deleteFolder(folderId) {
        this.setState({
            isLoading: true,
        })
        let userToken = this.state.userToken
        let res = await deleteUserFolderApi(userToken, folderId)
        console.log('Folder result', res)
        if (res) {
            this.setState({
                isLoading: false,
                opened: false
            })
            this.props.navigation.navigate('HomeScreen', 'screen:ddddd')
        } else {
            alert('Delete Server error')
        }
    }




    rightSwipeButtons(noteId, noteName, noteContent) {
        return [
            <TouchableHighlight style={styles.rightSwipeFirstContainer}>
                <Icon size={30} name="ios-trash" style={styles.rightSwipeIcons} onPress={() => this.deleteNote(noteId)} />
            </TouchableHighlight>,
            <TouchableHighlight style={styles.rightSwipeSecondContainer}>
                <Icon size={30} name="ios-document" style={styles.rightSwipeIcons} onPress={() => this.props.navigation.navigate('EditNoteScreen', {
                    currentNoteId: noteId,
                    currentNoteName: noteName,
                    currentNoteContent: noteContent,
                    userToken: this.state.userToken,
                    inFolder: false
                })} />
            </TouchableHighlight>]
    }

    // leftSwipeButtons() {
    //     return [<TouchableHighlight style={styles.leftSwipeContainer}>
    //         <Icon size={30} name="md-arrow-dropup-circle" style={styles.leftSwipeContainerIcon} />
    //     </TouchableHighlight>]
    // }

    contextMenu(folderId) {

        this.setState({
            opened: true,
            currentFolderId: folderId
        })
    }


    render() {
        var dataArray = this.state.userNotes;
        const filteredUserData = dataArray.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS))
        return (
            <Container >
                <Header style={styles.header} >
                    <Left style={styles.headerLeft}>
                        <Icon name="ios-log-out" style={styles.headerLeftIcon} onPress={() => this.logOutAsyng()} />
                    </Left>
                    <Right style={{ flexDirection: 'row' }}>
                        <Icon name="ios-document" style={styles.headerRightText} onPress={() => this.props.navigation.navigate('AddNoteScreen', { userToken: this.state.userToken, folderId:null, parentFolderId:null })}></Icon>
                        <Icon name="ios-folder" style={styles.headerRightText} onPress={() => { this.setState({ visibleModalAddNewFolder: true }) }}></Icon>
                    </Right>
                </Header>
                <Loader loading={this.state.isLoading} color="#ff66be" />
                <View>
                    <Icon size={30} name="ios-search" style={styles.iconSearchInput} />
                    <SearchInput clearIconViewStyles={{ position: 'absolute', top: 12, right: 22 }} clearIcon={this.state.searchTerm !== '' && <Icon name="ios-close" />} style={styles.searchInput} onChangeText={(term) => { this.searchUpdated(term) }} placeholder=" " />
                </View>

                <ScrollView >

                    {filteredUserData.map(item => {
                        if (item.folderName != null && item.parentFolderId == null) {
                            return (

                                <TouchableOpacity onPress={()=> this.props.navigation.navigate('FolderScreen',{ folderId:item.id, userToken:this.state.userToken})} key={item.id} onLongPress={() => this.contextMenu(item.id)} style={styles.item}>
                                    <View style={styles.folderView} >
                                        <Icon name="ios-folder" style={{ color: 'orange' }} />
                                        <Text numberOfLines={1} style={styles.folderName}>{item.folderName}</Text>
                                    </View>
                                </TouchableOpacity>


                            )

                        }
                        else if (item.name != null && item.folderId == null) {
                            return (
                                <Swipeable onRef={ref => this.swipeable = ref} rightButtons={this.rightSwipeButtons(item.id, item.name, item.content)} style={styles.item} key={item.id}>
                                    <View style={styles.noteView}>
                                        <Text numberOfLines={1} style={styles.noteName}>{item.name}</Text>
                                        <Text style={styles.noteContent} >{item.noteDate.substring(0, 10)} {item.noteDate.substring(11, 19)}</Text>
                                        <Text numberOfLines={2} style={styles.noteContent}>{item.content}</Text>
                                    </View>
                                </Swipeable>


                            )
                        }
                    })}

                </ScrollView>
                <Menu opened={this.state.opened} renderer={renderers.SlideInMenu} onBackdropPress={()=>this.setState({opened:false})}>
                    <MenuTrigger />
                    <MenuOptions style={{ alignItems: 'center'}}>
                        <MenuOption style={{ borderBottomWidth: 1, borderColor: "gray",  }} onSelect={() => this.setState({opened:false, visibleModalEditFolderName:true })}>
                            <Text style={{ fontSize: 25, fontFamily: 'AlegreyaSC-Regular', color:'orange',  }}>Edit folder name</Text>
                        </MenuOption>
                        <MenuOption onSelect={() => this.deleteFolder(this.state.currentFolderId)}>
                            <Text style={{ fontSize: 25, fontFamily: 'AlegreyaSC-Regular', color:'red'  }} >Delete folder</Text>
                        </MenuOption>
                    </MenuOptions>
                </Menu>
                <Dialog visible={this.state.visibleModalAddNewFolder} onTouchOutside={() => { this.setState({ visibleModalAddNewFolder: false }); }}>
                    <DialogContent style={{ alignItems: 'center' }}>
                        <Icon size={1} name="ios-folder" style={{ color: 'orange', marginTop: 20 }} />
                        <TextInput style={{ textAlign: 'center' }} placeholder="Folder name" onChangeText={folderName => this.setState({ folderName: folderName })}></TextInput>
                        <View style={{ flexDirection: 'row' }}>
                            <Button title="Create" onPress={() => this.createFolder()} />
                            <Text>   </Text>
                            <Button title="Close" onPress={() => this.setState({ visibleModalAddNewFolder: false })} />
                        </View>
                    </DialogContent>
                </Dialog>
                <Dialog visible={this.state.visibleModalEditFolderName} onTouchOutside={() => { this.setState({ visibleModalEditFolderName: false }); }}>
                    <DialogContent style={{ alignItems: 'center' }}>
                        <Icon size={1} name="ios-folder" style={{ color: 'orange', marginTop: 20 }} />
                        <TextInput style={{ textAlign: 'center' }} placeholder="Edit folder name" onChangeText={folderEditName => this.setState({ folderEditName: folderEditName })}></TextInput>
                        <View style={{ flexDirection: 'row' }}>
                            <Button title="Edit" onPress={() => this.editFolderName()} />
                            <Text>   </Text>
                            <Button title="Close" onPress={() => this.setState({ visibleModalEditFolderName: false })} />
                        </View>
                    </DialogContent>
                </Dialog>
            </Container>

        )
    }
}

const styles = StyleSheet.create({
    item: { borderBottomWidth: 1, borderColor: "lightgray", width: '100%', },
    noteView: { paddingLeft: 20, paddingTop: 10, paddingBottom: 10, paddingRight: 20, },
    folderView: { paddingLeft: 20, paddingTop: 10, paddingBottom: 10, paddingRight: 20, flexDirection: 'row' },
    noteName: { fontSize: 25, fontFamily: 'AlegreyaSC-Bold' },
    folderName: { fontSize: 20, fontFamily: 'AlegreyaSC-Bold', marginLeft: 10 },
    noteContent: { fontFamily: 'AlegreyaSC-Regular' },
    header: { backgroundColor: 'white', },
    headerLeft: { flexDirection: 'row' },
    headerLeftIcon: { color: 'orange', marginLeft: '10%', fontSize: 30 },
    headerRightText: { color: 'orange', fontSize: 25, paddingLeft: 20, paddingRight:10 },
    leftSwipeContainer: { backgroundColor: 'white', height: '100%', justifyContent: 'center', alignItems: 'flex-end', paddingRight: 30, borderTopWidth: 0, borderColor: "lightgray", },
    leftSwipeContainerIcon: { color: 'green' },
    rightSwipeFirstContainer: { backgroundColor: 'red', height: '100%', justifyContent: 'center', paddingLeft: 30 },
    rightSwipeIcons: { color: 'white' },
    rightSwipeSecondContainer: { backgroundColor: 'orange', height: '100%', justifyContent: 'center', paddingLeft: 30 },
    searchInput: { padding: 10, borderColor: '#CCC', borderWidth: 1, paddingLeft: 50 },
    iconSearchInput: { position: 'absolute', top: 10, left: 22, color: 'orange' },

});

export default Home;