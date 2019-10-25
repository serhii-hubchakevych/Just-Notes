// EditNote.js

import React, { Component } from 'react';
import { Text, Container, Header, Left, Right, Icon } from 'native-base'
import { StyleSheet, TextInput } from 'react-native';
import Loader from "react-native-modal-loader";
import {updateUserDataApi} from '../networking/API'


export class EditNote extends Component {
  static navigationOptions =
    {
      header: null,
    };

  constructor(props) {
    super(props)
    this.state = {
      noteId: '',
      noteName: '',
      noteContent: '',
      userToken: '',
      isLoading: false,
      inFolder: false
    }
  }

  async componentDidMount() {
    const { navigation } = this.props;
    var currentNoteId = JSON.stringify(navigation.getParam('currentNoteId', 'ERROR'))
    var currentNoteName = JSON.stringify(navigation.getParam('currentNoteName', 'ERROR'))
    var currentNoteContent = JSON.stringify(navigation.getParam('currentNoteContent', 'ERROR'))
    var currentUserToken = JSON.stringify(navigation.getParam('userToken', 'ERROR'));
    var inFolder = JSON.stringify(navigation.getParam('inFolder', 'ERROR'));
    var objId = JSON.parse(currentNoteId)
    var objName = JSON.parse(currentNoteName)
    var objContent = JSON.parse(currentNoteContent)
    var objUserToken = JSON.parse(currentUserToken)
    var inFolder = JSON.parse(inFolder)
    this.setState({
      noteId: objId,
      noteName: objName,
      noteContent: objContent,
      userToken: objUserToken,
      inFolder: inFolder
    })
  }

  async updateNote() {
    this.setState({
      isLoading:true,
    })
    let res = await updateUserDataApi(this.state.noteId, this.state.userToken, this.state.noteName, this.state.noteContent)
    if (res){
      this.setState({
        isLoading:false,
    })
      if (this.state.inFolder){
        this.props.navigation.navigate('FolderScreen','screen:ddddd')
      }
      else {
        this.props.navigation.navigate('HomeScreen','screen:ddddd')
      }
    }else{
      alert('Server error')
    }
  }

  render() {

    return (
      <Container>
        <Header style={styles.header}>
          <Left style={styles.headerLeft} >
            <Icon onPress={()=> this.props.navigation.navigate('HomeScreen','screen:ddddd')} size={30} name="ios-arrow-back" style={styles.headerLeftIcon} />
            <Text style={styles.headerLeftText} > Just Notes </Text>
          </Left>
          <Right>
            <Text style={styles.headerRightText} onPress={() => this.updateNote()}> Done </Text>
          </Right>
        </Header>
        <Loader loading={this.state.isLoading} color="#ff66be" />
        <TextInput value={this.state.noteName} multiline={true} style={styles.noteTitleInputField} autoFocus={true} onChangeText={(noteName) => this.setState({ noteName })} />
        <TextInput value={this.state.noteContent} multiline={true} style={styles.noteContentInputField} onChangeText={(noteContent) => this.setState({ noteContent })} />
      </Container>
    )
  }

};


const styles = StyleSheet.create(
  {
        header:{backgroundColor: 'white'},
        headerLeft:{flexDirection: 'row'},
        headerLeftIcon:{color: 'orange', marginLeft: '10%', fontSize: 30},
        headerLeftText:{color: 'orange', fontSize: 25, marginLeft: '10%', marginTop:2, fontFamily:'Tangerine-Bold'},
        headerRightText:{color: 'orange',fontFamily:'TurretRoad-Regular'},
        noteTitleInputField:{paddingLeft: 20,paddingTop: 20, borderColor: 'gray', borderBottomWidth:1, fontFamily:'AlegreyaSC-Regular'},
        noteContentInputField: {width: '100%',height: '100%',textAlignVertical: 'top',paddingLeft: 20,paddingTop: 20,fontFamily:'AlegreyaSC-Regular'},
  });



export default EditNote;
