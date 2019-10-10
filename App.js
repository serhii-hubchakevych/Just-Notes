import React, { Component } from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import Auth from './src/screens/Auth';
import Home from './src/screens/Home';


const AppNavigator = createStackNavigator({
  AuthScreen: { screen: Auth },
  HomeScreen: { screen: Home },
});

const NavContainer = createAppContainer(AppNavigator);


export default class App extends Component {
  static navigationOptions = 
      {
          header: null,
      };
  render() {
    return (
      <NavContainer />
    );
  }
}