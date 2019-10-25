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

const AppNavigator = createStackNavigator({
  AuthScreen: { screen: Auth },
  HomeScreen: { screen: Home },
  RegistrationScreen: {screen: Registration},
  EditNoteScreen: {screen: EditNote},
  AddNoteScreen: {screen: AddNote},
  FolderScreen: {screen: Folder}
});

const NavContainer = createAppContainer(AppNavigator);


export default class App extends Component {

  render() {
    return (
      <MenuProvider>
        <NavContainer />
      </MenuProvider>
    );
  }
}