import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, Image } from 'react-native'
import {
  APIManager,
  COLORS,
  KEYS,
  paymentMethods,
  showToast,
  strings,
  styles,
  SVG,
  validateEmail,
} from '../config';
import aesjs from 'aes-js';
import hesabeCrypt from 'hesabe-crypt';
import { Switch } from 'react-native-gesture-handler';
import RenderHtml from 'react-native-render-html';
import { Button, Separator, WhatsAppButton } from '../components';
import { parse, SvgXml } from 'react-native-svg';
import { AuthContext, NetworkContext, CartContext } from '../context';
import AddressList from '../components/AddressList';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { cos } from 'react-native-reanimated';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';


const PaymentScreen = ({ navigation, route }) => {
  const isFocused = useIsFocused();
  const [switch1, setSwitch1] = React.useState(false);
  const [switch2, setSwitch2] = React.useState(false);
  const [summary, setSummary] = useState(
    !!route?.params?.summary
      ? route.params.summary
      : {
        'Sub Total': 40,
        Discount: 0,
        Tax: 10,
        Shipping: 30,
        'Grand Total': 80,
      },
  );
  const [cart] = React.useContext(CartContext);
  const [userToken, setUserToken] = React.useContext(AuthContext);
  const [, setConnected] = React.useContext(NetworkContext);
  const [viewHeight, setViewHeight] = React.useState('100%');
  const [addresses, setAddresses] = useState();
  const [address, setAddress] = useState();
  const [methods, setMethods] = useState();
  const [isLoading, setLoading] = React.useState(true);
  const [isLoadingMethods, setLoadingMethods] = React.useState(true);
  const [loadingCheckout, setLoadingCheckout] = useState();

  const [paymentMethod, setPaymentMethod] = React.useState(0);
  const addressExist = addresses?.map(item => item.address_id).includes(address?.address_id);

  const getAddresses = async () => {
    try {
      const profile = await new APIManager().getProfile();
      const response = await new APIManager().getBillingAddress();

      const selected = response.data.addresses?.filter(item => item.address_id == response.data.address_id)[0];
      const shipping = selected ? selected : response.data.addresses[0];

      setAddresses(response.data.addresses);
      setAddress({
        firstname: shipping?.firstname,
        lastname: shipping?.lastname,
        email: shipping?.email,
        country: 'Kuwait',
        country_id: 114,
        email: profile.data.email,
        is_valid_email: validateEmail(profile.data.email),
        phone: profile.data.telephone,
        ...shipping
      });
      selectAddress({
        firstname: shipping?.firstname,
        lastname: shipping?.lastname,
        email: shipping?.email,
        country: 'Kuwait',
        country_id: 114,
        email: profile.data.email,
        is_valid_email: validateEmail(profile.data.email),
        phone: profile.data.telephone,
        ...shipping
      });
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        setLoading(false);
        console.error(err);
      }
    }
  }

  const getPaymentMethods = async () => {
    try {
      const response = await new APIManager().getPaymentMethods();
      if (response.data.payment_methods)
        selectPaymentMethod(response.data.payment_methods[0]);
      setMethods(response.data.payment_methods);
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        setLoadingMethods(false);
        console.error(err);
      }
    }
  }

  const selectAddress = async (data) => {
    try {
      setLoadingMethods(true);
      setAddress({ ...address, ...data });
      const response = await new APIManager().setBillingAddress(data.address_id);
      getPaymentMethods();
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        setLoadingMethods(false);
        console.error(err);
      }
    }
  }

  const selectPaymentMethod = async (method) => {
    try {
      setPaymentMethod(method);
      const response = await new APIManager().selectPaymentMethod(method);
      setLoadingMethods(false);
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        setLoadingMethods(false);
        console.error(err);
      }
    }
  }

  const onSwitch = async (val) => {
    if (!val)
      selectAddress(route?.params?.address);
    setSwitch2(val);
  }

  const checkout = async () => {
    try {
      setLoadingCheckout(true);
      if (paymentMethod?.id == 1 || paymentMethod?.id == 2) {
        let data = {
          amount: summary['Grand Total'],
          responseUrl: KEYS.RESPONSE_URL,
          failureUrl: KEYS.FAILURE_URL,
          merchantCode: KEYS.MERCHANT_CODE,
          paymentType: 0,
          version: "2.0",
          orderReferenceNumber: Number.parseFloat(Math.random() * 10000),
          variable1: address.email,
          variable2: null,
          variable3: null,
          variable4: null,
          variable5: null,
          name: address.firstname,
          mobile_number: address.phone ? address.phone : address.telephone,
          email: address.email,
          authorize: true
        };
        data = JSON.stringify(data);
        let key = aesjs.utils.utf8.toBytes(KEYS.MERCHANT_KEY);
        let iv = aesjs.utils.utf8.toBytes(KEYS.MERCHANT_IV);
        let payment = new hesabeCrypt(key, iv);
        const encrypted = payment.encryptAes(data); // Ecnryption
     

        let headers = { accessCode: KEYS.ACCESS_CODE };

        axios
          .post(KEYS.CHECKOUT_URL, { data: encrypted }, { headers })
          .then(response => {
            let decrypted = payment.decryptAes(response.data);
     

            showToast(
              response.data.message ||
              strings['Checkout'] + ' ' + strings['SUCCESS'],
              response.message || strings['SUCCESS'],
              'success',
            );
            
            navigation.navigate('Hesabe', {
              token: JSON.parse(decrypted).response.data,
              data: address,
              shiping: route?.params?.address,
              isShippingDifferent: switch2,
              payment_method_id: paymentMethod?.id,
              shippingMethod: route?.params?.selectedSM,
            });
            setLoadingCheckout(false);
          })
          .catch(error => {
            setLoadingCheckout(false);
            console.log(error.response.data)
            const message = error.response.data?.includes('html')
              ? 'Could not process order'
              : payment.decryptAes(error.response.data)?.message;
            showToast(
              message ||
              strings['Checkout'] + ' ' + strings['Error'],
              error.message || strings['Error'],
              'error',
            );
          });
      } else {
        setLoadingCheckout(false);
        navigation.navigate('Hesabe', {
          token: '',
          data: address,
          shiping: route?.params?.address,
          isShippingDifferent: switch2,
          payment_method_id: paymentMethod?.id,
          shippingMethod: route?.params?.selectedSM,
        });
      }
    } catch (err) {
      setLoadingMethods(false);
      setLoadingCheckout(true);
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        console.error(err);
      }
    }
  }

  useEffect(() => {
    if (isFocused) {
      setLoading(true);
      if (userToken) {
        getAddresses()
          .then(() => setLoading(false));
      } else {
        setAddress(route?.params?.address);
        getPaymentMethods()
          .then(() => setLoading(false));
      }
    }
  }, [navigation, isFocused])

  return isLoading ? (
    <View style={styles.centerContainer}>
      <ActivityIndicator size={'large'} color={COLORS.primary} />
    </View>
  ) : (
    <View style={{ height: viewHeight, backgroundColor: '#fff' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ ...styles.checkoutScrollView, flexGrow: 1 }}>
        {/* Billing Details */}
        {
          !userToken ? null : <>
            <Text style={{ ...styles.checkoutSubHeading, marginVertical: 20 }}>
              {strings['Newsletter']}
            </Text>
            <View style={styles.checkoutHiddenView}>
              <Text style={{ fontSize: 14, color: 'black' }}>
                {strings['Subscribe to Newsletter']}
              </Text>
              <Switch
                trackColor={{
                  false: COLORS.primary,
                  true: COLORS.secondary,
                }}
                thumbColor={switch1 ? COLORS.primary : COLORS.secondary}
                ios_backgroundColor="#fff"
                onValueChange={async val => {
                  await new APIManager().newsletter(val);
                  setSwitch1(val)
                }}
                value={switch1}
                style={styles.switch}
              />
            </View>
            <Text style={{ ...styles.checkoutSubHeading }}>
              {strings['billing_address']}
            </Text>
            <View style={styles.checkoutHiddenView}>
              <Text style={{ fontSize: 14, color: 'black' }}>
                {strings.Bill_To_Different_Address}
              </Text>
              <Switch
                trackColor={{
                  false: COLORS.primary,
                  true: COLORS.secondary,
                }}
                thumbColor={switch2 ? COLORS.primary : COLORS.secondary}
                ios_backgroundColor="#fff"
                onValueChange={onSwitch}
                value={switch2}
                style={styles.switch}
              />
            </View>
            {
              !switch2 ? null :
                <AddressList
                  addresses={addresses}
                  address={address}
                  setAddress={selectAddress}
                />
            }</>
        }
        {/* Payment Methods */}
        <Text style={{...styles.detailInfoHeading, marginTop:0}}>
          {strings['payment_methods']}
        </Text>
        {isLoadingMethods ? (
          <View style={styles.isLoadingMoreIndicator}>
            <ActivityIndicator size={'large'} color={COLORS.primary} />
          </View>
        ) : methods?.map((item, index) => {
          return (
            <TouchableOpacity
              style={styles.paymentCardContainer}
              key={index}
              onPress={() => selectPaymentMethod({ ...item, id: paymentMethods[index].id })}>
              <View style={styles.paymentCard}>
                <SvgXml
                  xml={
                    paymentMethod?.code === item.code
                      ? SVG.paymentSelectBullet
                      : SVG.paymentNotSelectBullet
                  }
                />
                <Text style={styles.paymentName}>{strings[paymentMethods[index].name]}</Text>
                <Image source={paymentMethods[index].image} />
              </View>
              <Text style={styles.detailShortDescText}>
                {strings[paymentMethods[index].short_description]}
              </Text>
            </TouchableOpacity>
          )
        })}
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          {

            isLoadingMethods ? null :
              ((!address || addresses?.length == 0 || !addressExist) && userToken)
                ? <Text style={{ color: 'black', textAlign: 'center', marginBottom: 20 }}>Select Address First</Text>
                :
                !paymentMethod
                  ? <Text style={{ color: 'black', textAlign: 'center', marginBottom: 20 }}>Select Payment Method First</Text>
                  :
                  <Button
                    text={strings['continue']}
                    // onPress={() => navigation.navigate('ReviewScreen', {summary: route?.params?.summary})}
                    onPress={checkout}
                    type={'primary'}
                    isLoading={isLoadingMethods || loadingCheckout}
                  />
          }
        </View>
      </ScrollView>
    </View>
  )
}

export default PaymentScreen