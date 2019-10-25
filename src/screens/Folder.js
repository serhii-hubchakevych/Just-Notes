// Home.js

import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TouchableHighlight, TextInput, Button } from 'react-native';
import { Container, Header, Left, Right, Icon, } from 'native-base';
import Swipeable from 'react-native-swipeable';
import Loader from "react-native-modal-loader";
import { editUserFolderApi, deleteUserFolderApi, addUserFolderApi, deleteUserDataApi, getUserDataApi, getUserDataInFolder } from "../networking/API"
import Dialog, { DialogContent } from 'react-native-popup-dialog';
import { Menu, MenuOptions, MenuOption, MenuTrigger, renderers } from 'react-native-popup-menu';




class Home extends Component {

    static navigationOptions =
        {
            header: null,
        };
    constructor(props) {
        super(props);
        this.state = {
            userNotesAndFolders: ['',''],
            userToken: '',
            folderId: '',
            parentFolderId: null,
            navigationFlag: false,
            visibleModalEditFolderName: false,
            visibleModalAddNewFolder: false,
            folderName: '',
            folderEditName: '',
            opened: false,
            currentFolderId:'',
            
        };
    }
    swipeable = null;

    async componentDidMount() {
        this.setState({
            isLoading: true,
        })
        const { navigation } = this.props;
        let folderId = JSON.stringify(navigation.getParam('folderId', 'ERROR'));
        let userToken = JSON.stringify(navigation.getParam('userToken', 'ERROR'));
        folderId = JSON.parse(folderId)
        userToken = JSON.parse(userToken)
        let res = await getUserDataInFolder(userToken, folderId)
        if (res != null) {
            this.setState({
                folderId: folderId,
                userNotesAndFolders: res,
                userToken: userToken
            })
        } else {
            this.setState({
                userNotesAndFolders: []
            })
        }
    }

    async UNSAFE_componentWillReceiveProps() {
        this.swipeable.recenter()
        if (this.state.navigationFlag) {
            var res = await getUserDataInFolder(this.state.userToken, this.state.parentFolderId)
            this.swipeable.recenter()
            if (res != null) {
                this.setState({
                    userNotesAndFolders: res
                }, ()=>this.swipeable.recenter())
                res = res[res.length - 1]
                if (res.previouseParent != null) {
                    this.setState({
                        parentFolderId: res.previouseParent,
                        navigationFlag: false
                    }, ()=>this.swipeable.recenter())
                }
                
                else if (res.previouseParent == null) {
                    this.setState({
                        parentFolderId: res.previouseParent,
                        navigationFlag: false
                        
                    }, ()=>this.swipeable.recenter())
                }
            } else {
                this.setState({
                    userNotesAndFolders: []
                }, ()=>this.swipeable.recenter())
            }
        } else {
            var res = await getUserDataInFolder(this.state.userToken, this.state.folderId)
            this.swipeable.recenter()
            if (res != null) {
                this.setState({
                    userNotesAndFolders: res
                }, ()=>this.swipeable.recenter())
                res = res[res.length - 1]
                if (res.previouseParent != null) {
                    this.setState({
                        parentFolderId: res.previouseParent,
                        navigationFlag: false
                    }, ()=>this.swipeable.recenter())
                }
            } else {
                this.setState({
                    userNotesAndFolders: []
                }, ()=>this.swipeable.recenter())
            }
        }

    }

    updateFolderData(folderId) {
        this.setState({
            folderId: folderId,
        }, () => this.props.navigation.navigate('FolderScreen', 'screen:ddddd'))

    }

    navigationOnFolder() {
        if (this.state.parentFolderId == null) {
            this.props.navigation.navigate('HomeScreen')
        } else{
            this.setState({
                navigationFlag: true,
            }, () => this.props.navigation.navigate('FolderScreen', 'screen:ddddd'))
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
                    inFolder: true
                })} />
            </TouchableHighlight>]
    }


    contextMenu(folderId) {

        this.setState({
            opened: true,
            currentFolderId: folderId
        })
    }

    async createFolder() {
        this.setState({
            isLoading: true,
        })
        let userToken = this.state.userToken
        let folderName = this.state.folderName
        let folderId = this.state.folderId
        let res = await addUserFolderApi(userToken, folderName, folderId)

        if (res) {
            this.setState({
                isLoading: false,
                visibleModalAddNewFolder: false,
            })
            this.props.navigation.navigate('FolderScreen', 'screen:ddddd')
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
            this.props.navigation.navigate('FolderScreen', 'screen:ddddd')
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
            this.props.navigation.navigate('FolderScreen', 'screen:ddddd')
        } else {
            alert('Delete Server error')
        }
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
            this.props.navigation.navigate('FolderScreen', 'screen:ddddd')
        } else {
            alert('Server error')
        }
    }

    render() {
        return (
            <Container >
                <Header style={styles.header} >
                    <Left style={styles.headerLeft}>
                        <Icon name="ios-arrow-back" style={styles.headerLeftIcon} onPress={() => this.navigationOnFolder()} />
                    </Left>
                    <Right style={{ flexDirection: 'row' }}>
                        <Icon name="ios-document" style={styles.headerRightText} onPress={() => this.props.navigation.navigate('AddNoteScreen', { userToken: this.state.userToken, folderId:this.state.folderId, parentFolderId:this.state.parentFolderId })}></Icon>
                        <Icon name="ios-folder" style={styles.headerRightText} onPress={() => { this.setState({ visibleModalAddNewFolder: true }) }}></Icon>
                    </Right>
                </Header>
               
                <ScrollView>

                {
                this.state.userNotesAndFolders.length > 1 ? 
                            <View>
                    {
                        this.state.userNotesAndFolders.map(item => {
                            if (item.folderName != null) {
                                return (

                                    <TouchableOpacity key={item.id} onPress={() => this.updateFolderData(item.id)} style={styles.item} onLongPress={() => this.contextMenu(item.id)}>
                                        <View style={styles.folderView}>
                                            <Icon name="ios-folder" style={{ color: 'orange' }} />
                                            <Text numberOfLines={1} style={styles.folderName}>{item.folderName}</Text>
                                        </View>
                                    </TouchableOpacity>


                                )
                            }
                            else if (item.name != null) {
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



                        })

                    }
                    </View>
                            
                            : <Text style={{ textAlign: "center", marginTop:100 }}>Add your first note</Text>
                }

                </ScrollView>
                <Menu opened={this.state.opened} renderer={renderers.SlideInMenu} onBackdropPress={()=>this.setState({opened:false})}>
                    <MenuTrigger />
                    <MenuOptions style={{ alignItems: 'center' }}>
                        <MenuOption style={{ borderBottomWidth: 1, borderColor: "gray",  }} onSelect={() => this.setState({ opened: false, visibleModalEditFolderName: true })}>
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
                            <Button onPress={() => this.createFolder()} title="Create" />
                            <Text>   </Text>
                            <Button title="Close" onPress={() => this.setState({ visibleModalAddNewFolder: false })} />
                        </View>
                    </DialogContent>
                </Dialog>




                <Dialog visible={this.state.visibleModalEditFolderName} onTouchOutside={() => { this.setState({ visibleModalEditFolderName: false }); }}>
                    <DialogContent style={{ alignItems: 'center' }}>
                        <Icon name="ios-folder" style={{ color: 'orange', marginTop: 20 }} />
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