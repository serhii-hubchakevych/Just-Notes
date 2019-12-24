import React, {Component} from 'react';
import {StyleSheet, AsyncStorage, View} from 'react-native';
import {Container} from 'native-base';
import Loader from 'react-native-modal-loader';
import OfflineNotice from '../parts/OfflineNotice';

export default class Auth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      connectionOffline:false
    };
  }

  static navigationOptions = {
    header: null,
  };

  async componentDidMount() {
    try {
      let asyncLoginUserData = await AsyncStorage.getItem('asyncLoginUserData');
      asyncLoginUserData = JSON.parse(asyncLoginUserData);
      console.log(asyncLoginUserData)
      if (asyncLoginUserData !== null) {
            this.setState({
              isLoading: false,
            });
            this.props.navigation.navigate('HomeScreen');
      } else {
        this.setState({
          isLoading: false,
        });
        await AsyncStorage.setItem('asyncLoginUserData', '');
        this.props.navigation.navigate('AuthScreen');
      }
    } catch (error) {
      console.log('Preloader component did mount error', error);
    }
  }

  
   
  getCallbackDataFromOfflineNotice = (callbackData) => {
    this.setState({
        connectionOffline:callbackData
    })
  }

  render() {
    return (
      <Container style={styles.container}>
        <View style={{position:'absolute', top:0, width:'100%'}}><OfflineNotice callbackOfflineNotice={this.getCallbackDataFromOfflineNotice} /></View>
        <Loader loading={this.state.isLoading} color="#ff66be" />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center'},
});
