import React, { Component } from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { MenuProvider } from 'react-native-popup-menu';
import Auth from './src/screens/Auth';
import Home from './src/screens/Home';
import Registration from './src/screens/Registration';
import AddNote from './src/screens/AddNote';
import EditNote from './src/screens/EditNote';
import Folder from './src/screens/Folder';
import Shared from './src/screens/Shared';
import Preloader from './src/screens/Preloader';
import { StatusBar } from 'react-native';




const AppNavigator = createStackNavigator({
  PreloaderScreen: {screen: Preloader},
  AuthScreen: { screen: Auth },
  RegistrationScreen: {screen: Registration},
  HomeScreen: { screen: Home },
  SharedScreen: {screen: Shared},
  EditNoteScreen: {screen: EditNote},
  AddNoteScreen: {screen: AddNote},
  FolderScreen: {screen: Folder},

});

const NavContainer = createAppContainer(AppNavigator);


export default class App extends Component {



  render() {
    return (
      <MenuProvider>
      <StatusBar   
       hidden={true} />  
        <NavContainer />
      </MenuProvider>
    );
  }
}