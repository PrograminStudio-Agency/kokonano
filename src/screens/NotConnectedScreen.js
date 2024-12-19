import React from 'react';
import {SafeAreaView, Text} from 'react-native';
import {Button} from '../components';
import {strings} from '../config';
import {NetworkContext} from '../context';

const NotConnectedScreen = () => {
  const [isConnected, , checkConnection] = React.useContext(NetworkContext);
  const [isLoading, setLoading] = React.useState(false);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}>
      <Text>You are Not Connected</Text>
      <Button
        type="secondary"
        text={strings['Retry']}
        isLoading={isLoading}
        onPress={() => {
          setLoading(true);
          checkConnection().then(() =>
            !isConnected ? setLoading(false) : null,
          );
        }}
      />
    </SafeAreaView>
  );
};

export default NotConnectedScreen;
