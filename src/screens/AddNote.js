import React, { Component } from 'react';
import { Text, Container, Header, Left, Right, Icon} from 'native-base'
import { StyleSheet, TextInput } from 'react-native';
import Loader from "react-native-modal-loader";
import {addUserDataApi} from '../networking/API'


export class AddNote extends Component {
  static navigationOptions = 
    {
        header: null,
    };
    
  constructor(props){
    super(props)
    this.state = {
      noteTitle:'',
      noteText: '',
      userToken:'',
      isLoading: false
    }
  }
  
  async saveNote(){
    this.setState({
      isLoading:true,
    })
    const { navigation } = this.props;
    var userToken = JSON.stringify(navigation.getParam('userToken', 'ERROR'));
    var folderId = JSON.stringify(navigation.getParam('folderId', 'ERROR'));
    var parentFolderId = JSON.stringify(navigation.getParam('parentFolderId', 'ERROR'));
    userToken = JSON.parse(userToken)
    folderId = JSON.parse(folderId)
    parentFolderId = JSON.parse(parentFolderId)
    console.log('FOLDER ADD NOTE ',folderId)
    console.log('PARENT FOLDER ADD NOTE',parentFolderId)
    let res = await addUserDataApi(userToken, this.state.noteTitle, this.state.noteText, folderId)
    if(res){
      this.setState({
        isLoading:false,
      })
      if (folderId != null)
      {
        this.props.navigation.navigate('FolderScreen', {screen:'dddddd'})
      }
      else if (parentFolderId == null && folderId == null){
        this.props.navigation.navigate('HomeScreen', {screen:'dddddd'})
      }
    }else{
      alert('Server error')
    }

    
  }

  render() {
    
    return (
          <Container >
            <Header style={styles.header}>
              <Left style={styles.headerLeft} >
                <Icon onPress={()=> this.props.navigation.navigate('HomeScreen')} size={30} name="ios-arrow-back" style={styles.headerLeftIcon} />
                <Text style={styles.headerLeftText} > Just Notes </Text>
              </Left>
              <Right>
                <Text style={styles.headerRightText} onPress={() => this.saveNote()}> Done </Text>
              </Right>
            </Header>
            <Loader loading={this.state.isLoading} color="#ff66be" />
            <TextInput placeholder="Notes Title" style={styles.noteTitleInputField} autoFocus={true} onChangeText={(noteTitle) => this.setState({noteTitle})}/>
            <TextInput placeholder="Notes Content" style={ styles.noteContentInputField} onChangeText={(noteText) => this.setState({noteText})} />
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



export default AddNote;
