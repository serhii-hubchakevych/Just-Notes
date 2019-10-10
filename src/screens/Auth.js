
import React, { Component } from 'react';
import { StyleSheet,  Text,  View } from 'react-native';
import { Container, Item, Form, Input, Button, Label } from "native-base";
import firebase from '../parts/Firebase';


export default class Auth extends Component {

    constructor(props) {
        super(props);
        this.state = {
          email: "",
          password: "",
          loginStatus: false,
        };
      }

      static navigationOptions = 
      {
          header: null,
      };

      SignUp = (email, password) => {
          console.log(this.state.password.length)
        try {
          firebase
              .auth()
              .createUserWithEmailAndPassword(email, password)
              .then(user => { 
                    alert('SUCCESS').then(this.props.navigation.navigate('HomeScreen'))
               }).catch((err) => {
                if(this.state.email.length == 0){
                    alert('Password can`t be is empty')
                }else if(this.state.password.length == 0){
                    alert('Password can`t be is empty')
                }else if(this.state.password.length>0 && this.state.password.length <6){
                    alert('You password is too short (min 6 symbol)')
                }
               });
        } catch (error) {
          console.log(error.toString(error));
        }
      };
      
    Login = (email, password) => {
        try {
          firebase
             .auth()
             .signInWithEmailAndPassword(email, password)
             .then(res => {
                this.setState({
                    loginStatus: true
                })
                // console.log(this.state.loginStatus)
                this.props.navigation.navigate('HomeScreen')
          }).catch((err) => {
                if(this.state.email.length == 0){
                    alert('Email can`t be is empty')
                }
                else if(this.state.password.length == 0){
                    alert('Password can`t be is empty')
                }else if(this.state.password.length>6 && this.state.email.length>5){
                    alert('Password or login is incorect')
                }else if(this.state.password.length>0 && this.state.password.length <6){
                    alert('You password is too short (min 6 symbol)')
                }

               });
    } catch (error) {
          console.log(error.toString(error));
        }
      };
    
    // validate (text, type)
    // {
    //     let userEmail = ""
    //     userEmail = text
    //     if(type=='username')
    //     {
    //         let result = userEmail.indexOf("@")
    //         if (result > 0)
    //         {
    //             this.setState({
    //                 validation: true,
    //                 email: userEmail
    //             })
    //         }else
    //         {
    //             this.setState({
    //                 validation: true,
    //                 email: userEmail
    //             })
    //         }
    //     }
    // }


      render() {  
    
    return (
            
        <Container style={styles.container}>
            <View style={{ alignItems:"center"}}>
                <Text style={{ fontSize:40, fontWeight:"bold", fontFamily:'Tangerine' }}>Just Notes</Text>
            </View>
                
            <Form style={{width:'96%'}}>
            <Item floatingLabel>
                <Label>Email</Label>
                <Input autoCapitalize="none" autoCorrect={false} onChangeText={email => this.setState({ email })}/>
            </Item>
            <Item floatingLabel>
                <Label>Password</Label>
                <Input
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
                // onTouchEnd={(text) => validate(text, 'username')}
                onChangeText={password => this.setState({ password })}
                />
            </Item>
            <View style={{flexDirection:"row", justifyContent:"space-evenly"}}>
            <Button full rounded success style={{marginTop: 20, width:"45%", marginLeft:15}} onPress={() => this.Login(this.state.email, this.state.password)} >
                <Text style={{color:"white", fontSize:20}}>Login</Text>
            </Button>
            <Button full rounded style={{ marginTop: 20, width:"45%", marginRight:0}} onPress={() => this.SignUp(this.state.email, this.state.password)} > 
                <Text style={{color:"white", fontSize:20,}}>Sign Up</Text>
            </Button>
            </View>
            
            </Form>
            

        </Container>
    )
  }
}


const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
            justifyContent: 'center',
          }
    })




