import aesjs from 'aes-js';
import {
  View,
  ActivityIndicator,
} from "react-native";
import hesabeCrypt from 'hesabe-crypt';
import React from 'react';
import { WebView } from 'react-native-webview';
import { APIManager, KEYS, showToast, strings } from '../config';
import { AuthContext, CartContext, LanguageContext, NetworkContext } from '../context';
import messaging from '@react-native-firebase/messaging';


const HesabeWebView = ({ navigation, route }) => {
  const {
    token,
    data,
    shiping,
    isShippingDifferent,
    payment_method_id,
    shippingMethod,
  } = route.params;

  const [cart, , , , , emptyCart, ,] = React.useContext(CartContext);

  const shipping = isShippingDifferent ? shiping : data
  const [transactionId, setTransactionId] = React.useState('');
  const [, setConnected] = React.useContext(NetworkContext);
  const [flag, setFlag] = React.useState(false);

  React.useEffect(() => {
    if (token == '') {
      createOrder();
    }
  }, []);


  const createOrder = async (transactionId) => {
    try {
      const order = await new APIManager().getOrderReview();
      // const comment = shiping.custom_field.deviceToken ? `Device Token: ${shiping.custom_field.deviceToken}` : ''
      // if (transactionId) comment += `\nPayment ID: ${transactionId}`
      if (transactionId) {
        const update = await new APIManager().updateOrder(order.data, `\nPayment ID: ${transactionId}`);
      }

      const res = await new APIManager().placeOrder();
      if (!res?.success) {
        showToast(strings['Order Failed'], res?.error, 'error');
        navigation.pop();
      } else {
        emptyCart();
        navigation.navigate('ConfirmBookingScreen', { order: order.data });
      }
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      }
      console.error(err.response.data.error.join('\n'));
    }
  };

  const getToken = async () => {
    const permission = await messaging().hasPermission();
    if (permission == 1) {
      return await messaging().getToken();
    } else {
      await messaging().requestPermission();
      return 'permission_not_granted';
    }
  };

  return (
    <>
      {token !== "" && !flag ? (
        <WebView
          source={{ uri: `${KEYS.PAYMENT_URL}${token}` }}
          onNavigationStateChange={newNavState => {
            if (newNavState.url.includes("https://programinstudio.com/success.php")) {
              const encrypted_data = newNavState.url.split('=', 2);
              const data = encrypted_data[1];
              let key = aesjs.utils.utf8.toBytes(KEYS.MERCHANT_KEY);
              let iv = aesjs.utils.utf8.toBytes(KEYS.MERCHANT_IV);
              let payment = new hesabeCrypt(key, iv);
              let decrypted = JSON.parse(payment.decryptAes(data));
              setTransactionId(decrypted.response.paymentId);
              setFlag(true)
              createOrder(decrypted.response.paymentId);
            }
            else if (newNavState.navigationType == "click") {
              navigation.pop()
              return
            }
          }}
        />
      ) :
        <View style={{ height: '100%', justifyContent: 'center', backgroundColor: '#fff' }}><ActivityIndicator size={'large'} /></View>
      }
    </>
  );
};
export default HesabeWebView;
