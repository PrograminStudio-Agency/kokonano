import React from 'react';
import {ActivityIndicator, Alert, View} from 'react-native';
import {WebView} from 'react-native-webview';
import {APIManager, COLORS} from '../config';
import {NetworkContext} from '../context';
import axios from 'axios';

const WebViewScreen = ({
  navigation,
  route: {
    params: {id}, params
  },
}) => {
  const [, setConnected] = React.useContext(NetworkContext);
  const [loader, set_loader] = React.useState(true);
  const [html, set_html] = React.useState('<h1>Hello! World</h1>');

  const fetchHTML = async () => {
    try {
      if (!params.url){
        const res = await new APIManager().getWebView(id);
        set_html(res.content.rendered);
      }
      else{
        const res = await axios.get(params.url)
        set_html(res.data);
      }
      set_loader(false);
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        Alert.alert(
          err?.message || strings['Error'],
          err?.response?.data?.message || strings['Error'],
          [
            {
              text: strings['Go Back'],
              onPress: () => navigation.goBack(),
              style: 'default',
            },
            {
              text: strings['Cancel'],
              onPress: () => {},
              style: 'cancel',
            },
          ],
        );
        set_loader(false);
        console.error(err);
      }
    }
  };

  React.useEffect(() => {
    fetchHTML();
  }, []);

  return (
    <>
      {loader ? (
        <View
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size={'large'} color={COLORS.primary} />
        </View>
      ) : (
        <WebView source={{html: html}} contentMode={'mobile'} textZoom={200} />
      )}
    </>
  );
};

export default WebViewScreen;
