import React, { Component } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text, AsyncStorage} from 'react-native';
import {Container, Header, Icon, Footer, Button} from 'native-base';

class HamburgerMenu extends Component {

    constructor(props) {
        super(props);
    }

    closeHamburgerMenu(){
        let callbackData = {
            visibleHamburgerMenu:false,
        }
        this.props.callBackFromHamburgerMenu(callbackData)
    }

    
    async logOutAsyng() {
        await AsyncStorage.setItem('asyncLoginUserData', '');
        this.closeHamburgerMenu()
        this.props.navigate.navigate('AuthScreen')
    }

   async closeHamburgerMenuAndNavigateToHomeScreen(){
        let callbackData = {
            visibleHamburgerMenu:false,
        }
       await this.props.callBackFromHamburgerMenu(callbackData)
        this.props.navigate.navigate('HomeScreen')
    }

    async closeHamburgerMenuAndNavigateToShareScreen(){
        let callbackData = {
            visibleHamburgerMenu:false,
        }
       await this.props.callBackFromHamburgerMenu(callbackData)
        this.props.navigate.navigate('SharedScreen')
    }

    render() {
        return (
        <View style={styles.containerHamburgerMenu} openMenu={this.props.visibleHamburgerMenu}>
                <View style={styles.sideMenuContainer}>
                    <Header style={{backgroundColor:'white'}}>
                        <Icon onPress={()=>this.closeHamburgerMenu()}
                            name="ios-close"
                            style={{fontSize: 60, position:'absolute', right:0, paddingRight:20, paddingTop:0}}>
                        </Icon>
                    </Header>
                    <Container>
                        <View style={{marginTop: 20, flex: 0.5, borderRadius: 50}}>
                            <Image
                                style={{width: '100%', height: '100%', borderRadius: 50}}
                                source={{
                                uri:
                                    'https://i0.wp.com/www.winhelponline.com/blog/wp-content/uploads/2017/12/user.png?resize=256%2C256&quality=100&ssl=1',
                                }}
                            />
                        </View>
                        <View style={{marginTop: 20, alignItems: 'center', marginTop:10}}>
                            <View style={{flexDirection: 'row'}}>
                                <Icon name="ios-contact" style={{color:'orange', fontSize:30}}/>
                                <Text
                                style={{
                                    paddingLeft: 20,
                                    fontSize: 40,
                                    fontFamily: 'Tangerine-Bold',
                                }}>
                                Hi, {this.props.userName}
                                </Text>
                            </View>
                        </View>
                        <View style={{
                            flexDirection: 'row',
                            paddingTop: 50,
                            justifyContent: 'center',
                        }}>
                            <Button
                                iconLeft
                                transparent
                                onPress={()=> this.closeHamburgerMenuAndNavigateToHomeScreen()}>
                                <Icon name="home" style={{color:'orange', fontSize:40}}/>
                                <Text
                                style={{
                                    paddingLeft: 20,
                                    fontSize: 30,
                                    fontFamily: 'AlegreyaSC-Bold',
                                }}>
                                Home
                                </Text>
                            </Button>
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'center', marginTop:10}}>
                            <Button
                                disabled={!this.props.connection}
                                iconLeft
                                transparent
                                onPress={() => this.closeHamburgerMenuAndNavigateToShareScreen()}>
                                <Icon name="share" style={this.props.connection ? styles.enableIconColor : styles.disableIconColor}/>
                                <Text style={this.props.connection ? styles.enableTextStyle : styles.disableTextStyle}>
                                Shared for me
                                </Text>
                            </Button>
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'center', marginTop:10}}>
                            <Button
                                iconLeft
                                transparent
                                onPress={()=>alert('COMING SOON')}>
                                <Icon name="settings" style={{color:'orange', fontSize:40}}/>
                                <Text
                                style={{
                                    paddingLeft: 20,
                                    fontSize: 30,
                                    fontFamily: 'AlegreyaSC-Bold',
                                }}>
                                Settings
                                </Text>
                            </Button>
                        </View>
                    </Container>
                    <Footer style={{backgroundColor:'#DC143C'}}>
                        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                            <Button iconLeft transparent onPress={() => this.logOutAsyng()}>
                                <Icon name="ios-log-out" style={{fontSize:30, color:'white'}}/>
                                <Text
                                style={{
                                    paddingLeft: 20,
                                    fontSize: 30,
                                    fontFamily: 'AlegreyaSC-Bold',
                                    color:'white'

                                }}>
                                Logout
                                </Text>
                            </Button>
                        </View>
                    </Footer>
                </View>
                <TouchableOpacity style={styles.shadowHamburgerMenu} onPress={()=>this.closeHamburgerMenu()}>

                </TouchableOpacity>
        </View>
        )
    }
}

const styles = StyleSheet.create({
    
    containerHamburgerMenu:{
        width:'100%',
        position:'absolute',
        height:'100%',
    },

    sideMenuContainer: {
      width: '80%',
      height: '100%',
      backgroundColor: 'red',
      position:'absolute',
    }, 

    shadowHamburgerMenu:{
        width:'20%',
        height:'100%',
        position:'absolute',
        right:0,
        backgroundColor:'grey',
        opacity:0.7,
        zIndex:99999
    },
    enableIconColor:{
        color:'orange', fontSize:40
    },
    disableIconColor:{
        color:'grey', fontSize:40
    },
    enableTextStyle:{
        paddingLeft: 20,
        fontSize: 30,
        fontFamily: 'AlegreyaSC-Bold',
    },
    disableTextStyle:{
        paddingLeft: 20,
        fontSize: 30,
        fontFamily: 'AlegreyaSC-Bold',
        color:'grey'
    }
  });

export default HamburgerMenu;