
import React, { Component } from 'react';
import { StyleSheet,  Text,  View, AsyncStorage } from 'react-native';
import { Container, Item, Form, Input, Button, Label } from "native-base";
import Loader from "react-native-modal-loader";
import {authUserApi} from '../networking/API'


export default class Auth extends Component {

    constructor(props) {
        super(props);
        this.state = {
          userName: "",
          userPassword: "",
          isLoading: false,
          userToken:"",
          userId:"",
          serverResponse:"",
          asyncStorageToken: '',
        };
      }

      static navigationOptions = 
      {
          header: null,
      };

      async componentDidMount() {
        try {
            const value = await AsyncStorage.getItem('Token');
            const asyncUserLogin = await AsyncStorage.getItem('UserName')
            const asyncUserPassword = await AsyncStorage.getItem('UserPassword')
            if (value !== null) {
                this.setState({
                    isLoading:true,
                })
                const newUser = {
                    UserName: asyncUserLogin,
                    UserPassword: asyncUserPassword
                }
                try {
                    fetch('https://cb5eza7o22.execute-api.us-west-2.amazonaws.com/Prod/api/Login',
                    {
                        method: 'POST',
                        headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                },
                        body:JSON.stringify(newUser)}).then(response => response.json()).then((response)=>{
                                var serverResponse = response
                                    this.setState({
                                        isLoading:false,
                                    })
                                    this.props.navigation.navigate('HomeScreen', {serverResponse})   
                                
                            }).catch((error) => {
                                console.log('ERROR IS --------', error)
                            })
                        } 
                catch (error) {
                            console.log(error)
                        }

            }else {
               console.log("Component Did Mount Auth Screen first error") 
            }
          } catch (error) {
            console.log("Component Did Mount Auth Screen second error") 
          }
      }
      async UNSAFE_componentWillReceiveProps() {
        try {
            this.setState({ 
                userName: "",
                userPassword: ""
            })
        }
        catch (error) {
            console.log(error)
        }
    }


    async authUser(){
        this.setState({
            isLoading:true,
          })
          let res = await authUserApi(this.state.userName, this.state.userPassword);
          if (res != undefined){
            this.setState({
              isLoading:false,
          })
          this.props.navigation.navigate('HomeScreen', {res})
          }else if(!res){
                alert('Login or password is incorect!')
                await AsyncStorage.setItem('Token', '');
                await AsyncStorage.setItem('Login','');
                await AsyncStorage.setItem('Password','');
                this.setState({
                    isLoading:false,
                })
                this.props.navigation.navigate('AuthScreen','screen:ddddd')
          }
        }
    


    render() {  
    
    return (
            
        <Container style={styles.container}>
            <View style={styles.titleView}>
                <Text style={styles.title}>Just Notes</Text>
            </View>    
            <Form style={styles.form}>
                <Item floatingLabel>
                    <Label style={styles.formLabelAndInput}>Username</Label>
                    <Input 
                    autoCapitalize="none" 
                    autoCorrect={false} 
                    onChangeText={userName => this.setState({ userName })} 
                    value={this.state.userName} 
                    style={styles.formLabelAndInput}/>
                </Item>
                <Item floatingLabel>
                    <Label style={styles.formLabelAndInput}>Password</Label>
                    <Input
                    style={styles.formLabelAndInput}
                    secureTextEntry={true}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={this.state.userPassword}
                    onChangeText={userPassword => this.setState({ userPassword })}
                    />
                </Item>
            <View style={styles.buttonsView}>
                <Button full rounded success style={styles.loginButton} onPress={() => this.authUser()}> 
                    <Text style={styles.logitButtonText}>Login</Text>
                </Button>
                    <Loader loading={this.state.isLoading} color="#ff66be" />
                <Button full rounded style={styles.signInButton} onPress={() => this.props.navigation.navigate('RegistrationScreen')}> 
                    <Text style={styles.signInButtonText}>Sign Up</Text>
                </Button>
            </View>            
            </Form>
            

        </Container>
    )
  }
}


const styles = StyleSheet.create(
    {
        container: {flex: 1,justifyContent: 'center',},
        title:{fontSize:70, fontFamily:'Tangerine-Bold'},
        titleView:{alignItems:"center"},
        form:{width:'96%'},
        formLabelAndInput:{fontFamily:'TurretRoad-Regular'},
        buttonsView:{flexDirection:"row", justifyContent:"space-evenly"},
        loginButton:{marginTop: 20, width:"45%", marginLeft:15},
        logitButtonText:{color:"white", fontSize:20, fontFamily:'TurretRoad-Regular'},
        signInButton:{marginTop: 20, width:"45%", marginRight:0},
        signInButtonText:{color:"white", fontSize:20, fontFamily:'TurretRoad-Regular'},
    })




