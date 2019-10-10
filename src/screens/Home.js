// Home.js

import React, { Component } from 'react';
import { ScrollView, StyleSheet, View, Text, AsyncStorage, } from 'react-native';
import { Container, Header, Left, Right, Icon } from 'native-base';



class Home extends Component {


    render() {  

    return (
            
        <Container >
                <Header style={{ backgroundColor: 'white'}} >
                <Left style={{ flexDirection: 'row'}}>
                    <Icon size={30} name="ios-log-out" style={{ color: 'orange', marginLeft: '10%', fontSize: 30}} onPress={() => this.props.navigation.navigate('AuthScreen')}/>
                </Left>
                <Right>
                    <Text style={{ color: 'orange',fontSize: 15 }} >Add Note</Text>
                </Right>
                </Header>
        </Container>
              
             
    )
  }
}

export default Home;