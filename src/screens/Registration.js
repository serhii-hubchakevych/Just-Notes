
import React, { Component } from 'react';
import { StyleSheet,  Text,  View, ScrollView } from 'react-native';
import { Container, Item, Form, Input, Button, Label, Header, Left, Right, Icon } from "native-base";
import {registerUserApi} from '../networking/API';
import Loader from "react-native-modal-loader";


export default class Auth extends Component {

    constructor(props) {
        super(props);
        this.state = {
          userName: "",
          userPassword: "",
          userFirstName:"",
          userLastName:"",
          userPhoneNumber:"",
          userEmail:"",
          isLoading: false
        };
      }

      static navigationOptions = 
      {
          header: null,
      };

      async regUser(){
        this.setState({
          isLoading:true,
        })
        let res = await registerUserApi(this.state.userName, this.state.userPassword, this.state.userFirstName, this.state.userLastName,this.state.userPhoneNumber, this.state.userEmail);
        if (res){
          this.setState({
            isLoading:false,
        })
            this.props.navigation.navigate('AuthScreen')
        }else{
            alert('Server is not response!')
        }
      }

      render() {  
    
    return (
        
        <Container style={styles.container}>
            <Header style={styles.headerStyle} >
                <Left style={{ flexDirection: 'row'}}>
                    <Icon size={30} name="ios-log-out" style={styles.iconLogout} onPress={() => this.props.navigation.navigate('AuthScreen')}/>
                </Left>
                <Right>
                </Right>
                </Header>
            <View style={styles.viewTitle}>
                <Text style={styles.title}>Registration</Text>
            </View> 
            <ScrollView> 
            <Form style={styles.form}>
                <Item floatingLabel>
                    <Label style={styles.fontsItem}>Username</Label>
                    <Input style={styles.fontsItem}
                    autoCapitalize="none" 
                    autoCorrect={false} 
                    onChangeText={userName => this.setState({ userName })}/>
                </Item>
                <Item floatingLabel>
                    <Label style={styles.fontsItem}>Password</Label>
                    <Input
                    secureTextEntry={true}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={userPassword => this.setState({ userPassword })}
                    
                    />
                </Item>
                <Item floatingLabel>
                    <Label style={styles.fontsItem}>First Name</Label>
                    <Input
        
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={userFirstName => this.setState({ userFirstName })}
                    style={styles.fontsItem}
                    />
                </Item>
                <Item floatingLabel>
                    <Label style={styles.fontsItem}>Last Name</Label>
                    <Input
                    style={styles.fontsItem}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={userLastName => this.setState({ userLastName })}
                    />
                </Item>
                <Item floatingLabel>
                    <Label style={styles.fontsItem}>Phone Number</Label>
                    <Input
                    style={styles.fontsItem}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={userPhoneNumber => this.setState({ userPhoneNumber })}
                    />
                </Item>
                <Item floatingLabel>
                    <Label style={styles.fontsItem}>Email</Label>
                    <Input
                    style={styles.fontsItem}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={userEmail => this.setState({ userEmail })}
                    />
                </Item>
            <Loader loading={this.state.isLoading} color="#ff66be" />
            <View style={{flexDirection:"row", justifyContent:"space-evenly"}}>
            <Button full rounded style={{ marginTop: 20, width:"45%", marginRight:0}} onPress={() => this.regUser()}> 
                <Text style={{color:"white", fontSize:20, fontFamily:'TurretRoad-Regular'}}>Sign In</Text>
            </Button>
            </View>    
            </Form>
            </ScrollView>
         </Container>
    )
  }
}


const styles = StyleSheet.create(
    {
        container: {flex: 1,},
        fontsItem:{fontFamily:'TurretRoad-Regular' },
        title:{fontSize:70, fontFamily:'Tangerine-Bold', marginBottom:-20, marginTop:20},
        form:{width:'96%'},
        viewTitle:{alignItems:"center"},
        iconLogout:{color: 'orange', marginLeft: '10%', fontSize: 30},
        headerStyle:{backgroundColor: 'white'}
    })




