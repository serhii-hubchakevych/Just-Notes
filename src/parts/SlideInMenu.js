import React, { Component } from 'react';
import { Text, StyleSheet, AsyncStorage } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger, renderers } from 'react-native-popup-menu';
import { deleteUserFolderApi } from "../networking/API"


class SlideInMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visibleModalShareFolderAccess: false,
            visibleModalEditFolderName: false,
            opened: false,
        };
    }

    async deleteFolder() {
        let asyncUserFolders = await AsyncStorage.getItem('Folders');
        asyncUserFolders = JSON.parse(asyncUserFolders)
        let asyncUserNotes = await AsyncStorage.getItem('Notes');
        asyncUserNotes = JSON.parse(asyncUserNotes)
        let arrayAsyncUserFolders = []
        arrayAsyncUserFolders = asyncUserFolders
        arrayAsyncUserFolders.map((item,index) => {
          if (item.localId == this.props.folderId){
            arrayAsyncUserFolders.splice(index, 1)
          }
        })
          asyncUserNotes.map((item,index) => {
            if (item.inFolder == this.props.folderId){
                asyncUserNotes.splice(index, 1)
                AsyncStorage.removeItem(item.imageArray)
            }
        })
        await AsyncStorage.setItem('Folders', JSON.stringify(arrayAsyncUserFolders))
        await AsyncStorage.setItem('Notes', JSON.stringify(asyncUserNotes))
        if(this.props.connection){
            await deleteUserFolderApi(this.props.folderId)

        }
        let callbackData = {
            opened: this.state.opened,
            visibleModalEditFolderName: this.state.visibleModalEditFolderName,
            visibleModalShareFolderAccess: this.state.visibleModalShareFolderAccess
        }
        this.props.callBackFromSlideInMenu(callbackData)
        this.setState({ opened: false, visibleModalEditFolderName: false, visibleModalShareFolderAccess:false })
    }

    async closeSlideInMenu(){
        await this.setState({ opened: false, visibleModalEditFolderName: false, visibleModalShareFolderAccess:false })
        let callbackData = {
            opened: this.state.opened,
            visibleModalEditFolderName: this.state.visibleModalEditFolderName,
            visibleModalShareFolderAccess: this.state.visibleModalShareFolderAccess
        }
        this.props.callBackFromSlideInMenu(callbackData)
        this.setState({ opened: false, visibleModalEditFolderName: false, visibleModalShareFolderAccess:false })
    }

    async editFolderNameSlideInMenu(){
        await this.setState({ opened: false, visibleModalEditFolderName: true, visibleModalShareFolderAccess:false })
        let callbackData = {
            opened: this.state.opened,
            visibleModalEditFolderName: this.state.visibleModalEditFolderName,
            visibleModalShareFolderAccess: this.state.visibleModalShareFolderAccess
        }
       
        this.props.callBackFromSlideInMenu(callbackData)
        this.setState({ opened: false, visibleModalEditFolderName: false, visibleModalShareFolderAccess:false })
    }

    async shareFolderAccessSlideInMenu(){
        await this.setState({ opened: false, visibleModalShareFolderAccess: true, visibleModalEditFolderName: false })
        let callbackData = {
            opened: this.state.opened,
            visibleModalEditFolderName: this.state.visibleModalEditFolderName,
            visibleModalShareFolderAccess: this.state.visibleModalShareFolderAccess
        }
        this.props.callBackFromSlideInMenu(callbackData)
        this.setState({ opened: false, visibleModalEditFolderName: false, visibleModalShareFolderAccess:false })
    }

    render() {
        return (
            
            <Menu opened={this.props.openMenu} renderer={renderers.SlideInMenu} onBackdropPress={() => this.closeSlideInMenu()}>
                <MenuTrigger />
                <MenuOptions style={{ alignItems: 'center' }}>
                    <MenuOption onSelect={() => this.editFolderNameSlideInMenu()}>
                        <Text style={{ fontSize: 25, fontFamily: 'AlegreyaSC-Regular', color: 'orange', }}>Edit folder name</Text>
                    </MenuOption>
                    <MenuOption onSelect={() => this.deleteFolder()}>
                        <Text style={{ fontSize: 25, fontFamily: 'AlegreyaSC-Regular', color: 'red' }} >Delete folder</Text>
                    </MenuOption>
                    <MenuOption onSelect={() => this.shareFolderAccessSlideInMenu()}>
                        <Text style={{ fontSize: 25, fontFamily: 'AlegreyaSC-Regular', color: 'green' }} >Share folder</Text>
                    </MenuOption>
                </MenuOptions>
            </Menu>
        )
    }
}

const styles = StyleSheet.create({
    offlineContainer: {
        backgroundColor: '#b52424',
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    offlineText: { color: '#fff' }
});

export default SlideInMenu;