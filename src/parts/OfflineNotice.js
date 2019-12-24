import React, {PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import NetInfo from '@react-native-community/netinfo';

function MiniOfflineSign() {
  return (
    <View style={styles.offlineContainer}>
      <Text style={styles.offlineText}>No Internet Connection</Text>
    </View>
  );
}

class OfflineNotice extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: true,
    };
  }

  componentDidMount() {
    NetInfo.isConnected.addEventListener(
      'connectionChange',
      this.handleConnectivityChange,
    );
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener(
      'connectionChange',
      this.handleConnectivityChange,
    );
  }

  handleConnectivityChange = isConnected => {
    this.setState({isConnected});
  };

  render() {
    if (!this.state.isConnected) {
      if (this.props.callbackOfflineNotice != undefined) {
        this.props.callbackOfflineNotice(this.state.isConnected)
      }
      return <MiniOfflineSign />;
    } else {
      if (this.props.callbackOfflineNotice != undefined) {
        this.props.callbackOfflineNotice(true)
      }
      return null;
    }
  }
}

const styles = StyleSheet.create({
  offlineContainer: {
    backgroundColor: '#b52424',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
     width: '100%',
  },
  offlineText: {color: '#fff'},
});

export default OfflineNotice;
