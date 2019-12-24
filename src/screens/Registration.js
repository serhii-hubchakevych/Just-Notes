
import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, Image} from 'react-native';
import { Container, Item, Form, Input, Button, Label, Header, Left, Right, Icon } from "native-base";
import { registerUserApi } from '../networking/API';
import Loader from "react-native-modal-loader";
import Dialog, { DialogContent, DialogTitle, SlideAnimation, DialogFooter, DialogButton } from 'react-native-popup-dialog';
import { openInbox } from 'react-native-email-link'

const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export default class Auth extends Component {

    constructor(props) {
        super(props);
        this.state = {
            flagUsername: false,
            flagPassword: false,
            flagEmail: false,
            userName: "",
            userPassword: "",
            userFirstName: "",
            userLastName: "",
            userPhoneNumber: "",
            userEmail: "",
            isLoading: false,
            visibleModalThankYouPage: false,
            visibleModalErrorMessage: false,
            inputSuccessUserName: '',
            inputErrorUserName: '',
            iconNameUserName: '',
            iconColorUserName: '',
            errorMesageUserName: {
                color: 'red',
                paddingLeft: '5%',
                display: 'none'
            },
            inputSuccessPassword: '',
            inputErrorPassword: '',
            iconNamePassword: '',
            iconColorPassword: '',
            errorMesagePassword: {
                color: 'red',
                paddingLeft: '5%',
                display: 'none'
            },
            inputSuccessEmail: '',
            inputErrorEmail: '',
            iconNameEmail: '',
            iconColorEmail: '',
            errorMesageEmail: {
                color: 'red',
                paddingLeft: '5%',
                display: 'none'
            },
            disabledRegButton:true,
        };
    }

    static navigationOptions =
        {
            header: null,
        };

    async regUser() {
        let flagUsername = this.state.flagUsername
        let flagPassword = this.state.flagPassword
        let flagEmail = this.state.flagEmail
        if (flagUsername == true && flagPassword == true && flagEmail == true) {
            this.setState({
                visibleModalThankYouPage: true,
            })
           await registerUserApi(this.state.userName, this.state.userPassword, this.state.userFirstName, this.state.userLastName, this.state.userPhoneNumber, this.state.userEmail)
        } else {
            this.setState({
                visibleModalErrorMessage: true,
            })
        }


    }

    validationUserLogin(inputText) {
        if (inputText.length < 6) {
            this.setState({
                inputSuccessUserName: false,
                inputErrorUserName: true,
                
                iconNameUserName: 'ios-close',
                iconColorUserName: 'red',
                errorMesageUserName: {
                    color: 'red',
                    paddingLeft: '5%',
                    display: 'flex'
                },
                flagUsername: false,
            })
        } else {
            this.setState({
                inputSuccessUserName: true,
                inputErrorUserName: false,
                iconNameUserName: 'ios-checkmark-circle',
                iconColorUserName: 'green',
                errorMesageUserName: {
                    display: 'none',
                },
                flagUsername: true,
                userName:inputText,
            })
        }
    }

    validationUserPassword(inputText) {
        if (inputText.length < 8) {
            this.setState({
                inputSuccessPassword: false,
                inputErrorPassword: true,
                iconNamePassword: 'ios-close',
                iconColorPassword: 'red',
                errorMesagePassword: {
                    color: 'red',
                    paddingLeft: '5%',
                    display: 'flex'
                },
                flagPassword: false,
            })
        } else {
            this.setState({
                inputSuccessPassword: true,
                inputErrorPassword: false,
                iconNamePassword: 'ios-checkmark-circle',
                iconColorPassword: 'green',
                errorMesagePassword: {
                    display: 'none'
                },
                flagPassword: true,
                userPassword:inputText,
            })
        }
    }

    validationUserEmail(inputText) {
        if (reg.test(inputText) === true && inputText.length > 6) {
            this.setState({
                inputSuccessEmail: true,
                inputErrorEmail: false,
                userEmail:inputText,
                iconNameEmail: 'ios-checkmark-circle',
                iconColorEmail: 'green',
                errorMesageEmail: {
                    display: 'none'
                },
                flagEmail: true,
                disabledRegButton:false,
            })

        } else {
            this.setState({
                inputSuccessEmail: false,
                inputErrorEmail: true,
                iconNameEmail: 'ios-close',
                iconColorEmail: 'red',
                errorMesageEmail: {
                    color: 'red',
                    paddingLeft: '5%',
                    display: 'flex'
                },
                flagEmail: false,


            })
        }
    }

    openInboxMailClient(){
        this.setState({
            visibleModalThankYouPage:false
        })
        this.props.navigation.navigate('AuthScreen','screen:ddddd')
        openInbox()
        
    }

    render() {

        return (

            <Container style={styles.container}>
                <Header style={styles.headerStyle} >
                    <Left style={{ flexDirection: 'row' }}>
                        <Icon size={30} name="ios-log-out" style={styles.iconLogout} onPress={() => this.props.navigation.navigate('AuthScreen')} />
                    </Left>
                    <Right>
                    </Right>
                </Header>
                <View style={styles.viewTitle}>
                    <Text style={styles.title}>Registration</Text>
                </View>
                <ScrollView>
                    <Form style={styles.form}>

                        <Item floatingLabel
                            success={this.state.inputSuccessUserName ? true : false}
                            error={this.state.inputErrorUserName ? true : false}>
                            <Label style={styles.fontsItem}>Your username *</Label>
                            <Input
                                maxLength={15}
                                autoCorrect={false}
                                onChangeText={userName => this.validationUserLogin(userName)} />
                            <Icon name={this.state.iconNameUserName} style={this.state.iconColorUserName} />
                        </Item>
                        <Text style={this.state.errorMesageUserName}>Login must be more than 6 symbol</Text>
                        <Item floatingLabel
                            success={this.state.inputSuccessPassword ? true : false}
                            error={this.state.inputErrorPassword ? true : false}>
                            <Label style={styles.fontsItem}>Your password *</Label>
                            <Input
                                maxLength={15}
                                autoCorrect={false}
                                secureTextEntry={true}
                                onChangeText={userPassword => this.validationUserPassword(userPassword)} />
                            <Icon name={this.state.iconNamePassword} style={this.state.iconColorPassword} />

                        </Item>
                        <Text style={this.state.errorMesagePassword}>Password must be more than 8 symbol</Text>
                        <Item floatingLabel>
                            <Label style={styles.fontsItem}>First Name</Label>
                            <Input
                                maxLength={15}
                                autoCapitalize="none"
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
                        <Item floatingLabel
                            success={this.state.inputSuccessEmail ? true : false}
                            error={this.state.inputErrorEmail ? true : false}>
                            <Label style={styles.fontsItem}>Your email *</Label>
                            <Input
                                maxLength={25}
                                autoCorrect={false}
                                onChangeText={userEmail => this.validationUserEmail(userEmail)} />
                            <Icon name={this.state.iconNameEmail} style={this.state.iconColorEmail} />

                        </Item>
                        <Text style={this.state.errorMesageEmail}>Incorrect email</Text>
                        <Loader loading={this.state.isLoading} color="#ff66be" />
                        <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
                            <Button full rounded style={{ marginTop: 20, width: "45%", marginRight: 0 }} disabled={this.state.disabledRegButton} onPress={() => this.regUser()}>
                                <Text style={{ color: "white", fontSize: 20, fontFamily: 'OpenSans-Regular' }}>Registration</Text>
                            </Button>
                        </View>
                    </Form>
                </ScrollView>
                <Dialog footer={<DialogFooter>

                    <DialogButton
                        text="CLOSE"
                        onPress={() => this.setState({ visibleModalThankYouPage: false })}
                    />
                    <DialogButton
                        text="CHECK EMAIL"
                        onPress={() => this.openInboxMailClient()}
                    />
                </DialogFooter>} dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })} width={1} height={0.55} dialogTitle={<DialogTitle title="THANK YOU" />} visible={this.state.visibleModalThankYouPage} onTouchOutside={() => { this.setState({ visibleModalThankYouPage: false }); }}>

                    <DialogContent>
                        <Text>Thank you for registering, we have sent you an email confirming your account.</Text>
                        <Text>Best regards, Team Just Notes</Text>
                        <Image
                            style={{ width: '100%', height: '60%', marginTop: 40, marginBottom: -40 }}
                            source={{ uri: 'https://hatvanikszse.hu/wp-content/uploads/2019/07/thank-you-from-christian-vision-alliance.jpg' }}
                        />
                    </DialogContent>

                </Dialog>

                <Dialog footer={<DialogFooter>

                    <DialogButton
                        text="CLOSE"
                        onPress={() => this.setState({ visibleModalErrorMessage: false })}
                    />
                </DialogFooter>} dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })} width={1} dialogTitle={<DialogTitle title="REGISTRATION ERROR" />} visible={this.state.visibleModalErrorMessage} onTouchOutside={() => { this.setState({ visibleModalErrorMessage: false }); }}>

                    <DialogContent>
                        {

                            this.state.flagUsername == false ? <View style={{ alignItems: 'center' }}><Icon name="ios-alert" style={{ color: 'red', marginTop: 20, fontSize: 50 }} /><Text style={{fontSize:20,  fontFamily: 'OpenSans-Regular', textAlign:'center'}}>Make sure you enter the Username field correctly</Text></View>
                            :  this.state.flagPassword == false ? <View style={{ alignItems: 'center' }}><Icon name="ios-alert" style={{ color: 'red', marginTop: 20, fontSize: 50 }} /><Text style={{fontSize:20,  fontFamily: 'OpenSans-Regular', textAlign:'center'}}>Make sure you enter the Password field correctly</Text></View>
                            : <View style={{ alignItems: 'center' }}><Icon name="ios-alert" style={{ color: 'red', marginTop: 20, fontSize: 50 }} /><Text style={{fontSize:20,  fontFamily: 'OpenSans-Regular', textAlign:'center'}}>Make sure you enter the Email field correctly</Text></View>
                        }
                    </DialogContent>

                </Dialog>
            </Container>




        )
    }
}


const styles = StyleSheet.create(
    {
        container: { flex: 1, },
        fontsItem: { fontFamily: 'OpenSans-Regular' },
        title: { fontSize: 70, fontFamily: 'Tangerine-Bold', marginBottom: -20, marginTop: 20 },
        form: { width: '96%' },
        viewTitle: { alignItems: "center" },
        iconLogout: { color: 'orange', marginLeft: '10%', fontSize: 30 },
        headerStyle: { backgroundColor: 'white' }
    })




