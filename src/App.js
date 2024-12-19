import React from 'react';
import { StatusBar, Alert } from 'react-native';
import 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';

import {
  AuthProvider,
  CartProvider,
  CompareProvider,
  LanguageProvider,
  NetworkProvider,
  WishlistProvider
} from './context';
import Screens from './screens';

const App = () => {
  let fcmUnsubscribe = null;
  const navigationRef = React.createRef();

  React.useEffect(() => {
    messaging()
      .requestPermission()
      .then(authStatus => {
        if (authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
          fcmUnsubscribe = messaging().onMessage(async remoteMessage => {

            processNotification(remoteMessage, false);
          });

          messaging()
            .onNotificationOpenedApp(async remoteMessage => {
              processNotification(remoteMessage, true);
              // navigationService.navigate(`${remoteMessage.data.screen_name}`, { oid: remoteMessage.data.order_id })
            });


          messaging()
            .getInitialNotification()
            .then(remoteMessage => {
              if (remoteMessage) {
                setTimeout(() => {
                  processNotification(remoteMessage, true);
                }, 800);

                // navigationService.navigate(`${remoteMessage.data.screen_name}`, { oid: remoteMessage.data.order_id })
              }
            })

        }
      })
      .catch(error => {
      })
  }, [])

  const forwardToOrderDetail = (data) => {
      navigationRef.current?.navigate('OrderDetailScreen', { order_id: data.order_id })
  }

  const processNotification = (remoteMessage, fromBackground) => {

    let title = '', body = '';
    if (!!remoteMessage) {
      if (remoteMessage.notification) {
        title = remoteMessage.notification.title
        body = remoteMessage.notification.body
      }
      if (!!remoteMessage.data) {
        if (fromBackground) {
          forwardToOrderDetail(remoteMessage.data)
        }
        if (!fromBackground) {
          Alert.alert(
            title,
            body,
            [
              {
                text: "View",
                onPress: () => forwardToOrderDetail(remoteMessage.data)
              },
              {
                text: 'Cancel',
                onPress: () => { },
                style: 'cancel'
              }
            ]
          );
        }
      }
    }
  }
  return (
    <NetworkProvider>
      <AuthProvider>
        <LanguageProvider>
          <CartProvider navigationRef={navigationRef} >
            <WishlistProvider>
              <CompareProvider>
                <StatusBar
                  barStyle="dark-content"
                  backgroundColor="transparent"
                  translucent
                />
                <Screens ref={navigationRef}/>
                <Toast />
              </CompareProvider>
            </WishlistProvider>
          </CartProvider>
        </LanguageProvider>
      </AuthProvider>
    </NetworkProvider>
  );
};

export default App;
