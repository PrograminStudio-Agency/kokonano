import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import {
  APIManager,
  COLORS,
  FAR_AREAS,
  KEYS,
  paymentMethods,
  removeTags,
  showToast,
  strings,
  styles,
  SVG,
  validateEmail,
  validateNumericInputs,
} from '../config';

import AddressList from '../components/AddressList';


const ShipmentScreen = ({ navigation }) => {
  const [viewHeight, setViewHeight] = React.useState('100%');
  const [addresses, setAddresses] = useState();
  const [address, setAddress] = useState();
  const [isLoading, setLoading] = React.useState(true);

  const getAddresses = async () => {
    const profile = await new APIManager().getProfile();
    const response = await new APIManager().getAddresses();
    const shipping = response.data.addresses?.filter(item => item.default)[0];

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
  }

  const selectAddress = async (address) => {
    setAddress(address);
    const response = await new APIManager().updateAddresses({ default: 1 }, address.address_id);
  }

  useEffect(() => {
    getAddresses()
      .then(() => setLoading(false))
  }, [])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setLoading(true);
      getAddresses()
        .then(() => setLoading(false))
    });
    return unsubscribe
  }, [])

  return isLoading ? (
    <View style={styles.centerContainer}>
      <ActivityIndicator size={'large'} color={COLORS.primary} />
    </View>
  ) : (
    <View style={{ height: viewHeight, backgroundColor: '#fff' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.checkoutScrollView}>
        {/* <Text style={styles.checkoutHeading}>{strings['Address Book']}</Text> */}
        <AddressList
          addresses={addresses}
          address={address}
          setAddress={selectAddress}
          setAddresses={setAddresses}
        />
      </ScrollView>
    </View>
  )
}

export default ShipmentScreen