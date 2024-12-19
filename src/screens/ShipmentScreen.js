import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import {
  APIManager,
  capitalizeFirstLetter,
  COLORS,
  strings,
  styles,
  SVG,
  validateEmail,
} from '../config';
import { Button, Separator } from '../components';
import { parse, SvgXml } from 'react-native-svg';
import { AuthContext, NetworkContext, CartContext } from '../context';
import AddressList from '../components/AddressList';
import { TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';


const ShipmentScreen = ({ navigation, route }) => {
  const isFocused = useIsFocused();

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
  const [, setConnected] = React.useContext(NetworkContext);
  const [userToken, setUserToken] = React.useContext(AuthContext);
  const [viewHeight, setViewHeight] = React.useState('100%');
  const [addresses, setAddresses] = useState();
  const [address, setAddress] = useState();
  const [methods, setMethods] = useState();
  const [isLoading, setLoading] = React.useState(true);
  const [isLoadingMethods, setLoadingMethods] = React.useState(true);
  const [selectedSM, setSelectedSM] = useState();
  const [guest, setGuest] = useState();

  const addressExist = addresses?.map(item => item.address_id).includes(address?.address_id);


  const newShipping = {
    ...route?.params?.summary,
    'Shipping': selectedSM?.quote[0].cost,
    'Grand Total': route?.params?.summary['Grand Total'] + selectedSM?.quote[0].cost
  }

  const getAddresses = async () => {
    try {
      if (userToken) {
        const profile = await new APIManager().getProfile();
        const response = await new APIManager().getShippingAddress();
        if (response.data.length <= 0) {
          setAddresses([]);
          setAddress(undefined);
          return;
        }
        const withEmail = item => { return { ...item, email: profile.data.email, telephone: profile.data.telephone } }

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
      }
      else {
        // Addresses
        const addresses = await AsyncStorage.getItem('guests');
        const temp = JSON.parse(addresses);
        setAddresses(temp);
        if (temp?.length) selectAddress(temp[0]);
        else setLoadingMethods(false);
      }
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

  const getShippingMethods = async () => {
    try {
      const response = await new APIManager().getShippingMethods();
      if (response.data.shipping_methods)
        selectShippingMethod(response.data.shipping_methods[0]);
      setMethods(response.data.shipping_methods);
      setLoadingMethods(false)
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
      if (userToken) {
        await new APIManager().setShippingAddress(data.address_id);
        getShippingMethods();

        await new APIManager().updateProfile({ custom_field: { account: data.custom_field }, address: data.address_id })
        const res = await new APIManager().getProfile();
        setUserToken(res.data);
      }
      else if (data) {
        const res = await new APIManager().guest({ ...data, telephone: data.telephone });
        getShippingMethods();
      }
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

  const selectShippingMethod = async (method) => {
    try {
      const response = await new APIManager().selectShippingMethod(method);
      if (!response.success)
        setSelectedSM(undefined);
      else
        setSelectedSM(method);
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

  const onPress = () => {
    if (!address) return alert('Select Address');
    navigation.navigate('PaymentScreen', {
      summary: newShipping,
      address,
      selectedSM,
    })
  }

  useEffect(() => {
    if (isFocused) {
      setLoading(true);
      setLoadingMethods(true);
      setAddress(undefined);
      getAddresses()
        .then(() => setLoading(false))
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
        <Text style={styles.checkoutSubHeading}> {strings['shipping_address']} </Text>
        <AddressList
          addresses={addresses}
          address={address}
          setAddress={selectAddress}
          setAddresses={setAddresses}
        />
        <Separator />
        {/* Shipping Methods */}
        <Text style={styles.detailInfoHeading}>
          {strings['shipping_method']}
        </Text>
        {isLoadingMethods ? (
          <View style={styles.isLoadingMoreIndicator}>
            <ActivityIndicator size={'large'} color={COLORS.primary} />
          </View>
        ) :
          methods?.map((item, index) => {
            const cost = item.quote[0].cost;
            return (
              <TouchableOpacity
                key={index}
                style={styles.paymentCardContainer}
                onPress={() => selectShippingMethod(item)}
              >
                <View style={[styles.paymentCard]}>
                  <SvgXml
                    xml={
                      selectedSM?.id === item.id
                        ? SVG.paymentSelectBullet
                        : SVG.paymentNotSelectBullet
                    }
                  />
                  <Text style={styles.paymentName}>{item.title}{'  '}{Number.parseFloat(cost).toFixed(2)} KD</Text>
                </View>
                <Text style={styles.detailShortDescText}>
                  {!isNaN(Number.parseFloat(cost))
                    ? strings['New Total: '] + (Number.parseFloat(route.params.summary['Grand Total'] + cost).toFixed(2)) + ' KD'
                    : null}
                </Text>
              </TouchableOpacity>
            )
          })
        }
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          {
            isLoadingMethods ? null :
              !address || !addresses || addresses?.length == 0 || !addressExist
                ? <Text style={{ color: 'black', textAlign: 'center', marginBottom: 20 }}>Select Address First</Text>
                :
                !selectedSM
                  ? <Text style={{ color: 'black', textAlign: 'center', marginBottom: 20 }}>Select Shipment Method First</Text>
                  :
                  <Button
                    text={strings['continue']}
                    onPress={onPress}
                    type={'primary'}
                    isLoading={isLoadingMethods}
                  />
          }
        </View>
      </ScrollView>
    </View>
  )
}

export default ShipmentScreen