import React, {Component} from 'react';
import {StyleSheet, Text, View, AsyncStorage, BackHandler, PermissionsAndroid, AppState} from 'react-native';
import {Container, Item, Form, Input, Button, Label, Icon} from 'native-base';
import Loader from 'react-native-modal-loader';
import {authUserApi} from '../networking/API';
import Dialog, {
  DialogContent,
  DialogTitle,
  SlideAnimation,
  DialogFooter,
  DialogButton,
} from 'react-native-popup-dialog';
import OfflineNotice from '../parts/OfflineNotice';

export default class Auth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      userPassword: '',
      isLoading: false,
      userToken: '',
      serverResponse: '',
      asyncStorageToken: '',
      visibleAuthError: false,
      connectionOffline: false,
    };
  }

  static navigationOptions = {
    header: null,
  };

  async authUser() {
    this.setState({
      isLoading: true,
    });
    let res = await authUserApi(this.state.userName, this.state.userPassword);
    if (res != undefined) {
      await AsyncStorage.setItem('Folders', JSON.stringify(res[1]))
      await AsyncStorage.setItem('Notes', JSON.stringify(res[2]))
      this.setState({
        isLoading: false,
        userName: '',
        userPassword: '',
      });
      this.props.navigation.navigate('HomeScreen');
    } else if (res == undefined) {
      await AsyncStorage.setItem('asyncLoginUserData', '');
      this.setState({
        isLoading: false,
        visibleAuthError: true,
      });
      this.props.navigation.navigate('AuthScreen', 'screen:ddddd');
    }
  }

  getCallbackDataFromOfflineNotice = callbackData => {
    this.setState({
      connectionOffline: callbackData,
    });
  };

  componentDidMount(){
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if(this.props.navigation.isFocused() == true){
          BackHandler.exitApp();
          return true
      } // works best when the goBack is async
     });
  }

  render() {
    return (
      <Container style={styles.container}>
        <View style={{position: 'absolute', top: 0, width: '100%'}}>
          <OfflineNotice
            callbackOfflineNotice={this.getCallbackDataFromOfflineNotice}
          />
        </View>
        <View style={styles.titleView}>
          <Text style={styles.title}>Just Notes</Text>
        </View>
        <Form style={styles.form}>
          <Item floatingLabel>
            <Label style={styles.formLabelAndInput}>Username</Label>
            <Input
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={userName => this.setState({userName})}
              value={this.state.userName}
              style={styles.formLabelAndInput}
            />
          </Item>
          <Item floatingLabel>
            <Label style={styles.formLabelAndInput}>Password</Label>
            <Input
              style={styles.formLabelAndInput}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              value={this.state.userPassword}
              onChangeText={userPassword => this.setState({userPassword})}
            />
          </Item>
          <View style={styles.buttonsView}>
            <Button
              full
              rounded
              success
              style={styles.loginButton}
              disabled={!this.state.connectionOffline}
              onPress={() => this.authUser()}>
              <Text style={styles.logitButtonText}>Login</Text>
            </Button>
            <Loader loading={this.state.isLoading} color="#ff66be" />
            <Button
              full
              rounded
              style={styles.signInButton}
              disabled={!this.state.connectionOffline}
              onPress={() =>
                this.props.navigation.navigate('RegistrationScreen')
              }>
              <Text style={styles.signInButtonText}>Sign Up</Text>
            </Button>
          </View>
        </Form>

        <Dialog
          footer={
            <DialogFooter>
              <DialogButton
                text="CLOSE"
                onPress={() => this.setState({visibleAuthError: false})}
              />
            </DialogFooter>
          }
          dialogAnimation={new SlideAnimation({slideFrom: 'bottom'})}
          width={1}
          dialogTitle={<DialogTitle title="AUTHENTIFICATION ERROR" />}
          visible={this.state.visibleAuthError}
          onTouchOutside={() => {
            this.setState({visibleAuthError: false});
          }}>
          <DialogContent>
            <View style={{alignItems: 'center'}}>
              <Icon
                name="ios-alert"
                style={{color: 'red', marginTop: 20, fontSize: 50}}
              />
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'OpenSans-Regular',
                  textAlign: 'center',
                }}>
                Make sure the login or password you entered is correct
              </Text>
            </View>
          </DialogContent>
        </Dialog>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center'},
  title: {fontSize: 70, fontFamily: 'Tangerine-Bold'},
  titleView: {alignItems: 'center'},
  form: {width: '96%'},
  formLabelAndInput: {fontFamily: 'OpenSans-Regular'},
  buttonsView: {flexDirection: 'row', justifyContent: 'space-evenly'},
  loginButton: {marginTop: 20, width: '45%', marginLeft: 15},
  logitButtonText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'OpenSans-Regular',
  },
  signInButton: {marginTop: 20, width: '45%', marginRight: 0},
  signInButtonText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'OpenSans-Regular',
  },
});
