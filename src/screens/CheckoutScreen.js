import React from 'react';
import {
  Image,
  TouchableOpacity,
  ScrollView,
  Text,
  View,
  TextInput,
  ActivityIndicator,
  Alert,
  Keyboard
} from 'react-native';
import { Switch } from 'react-native-gesture-handler';
import {  SvgXml } from 'react-native-svg';
import { Button, Separator, WhatsAppButton } from '../components';
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
import { AuthContext, NetworkContext, CartContext } from '../context';
import hesabeCrypt from 'hesabe-crypt';
import aesjs from 'aes-js';
import axios from 'axios';

const CheckoutScreen = ({ navigation, route }) => {
  const [, setConnected] = React.useContext(NetworkContext);
  const [cart] = React.useContext(CartContext);
  const [isLoading, setLoading] = React.useState(true);
  const [isLoadingSummary, setLoadingSummary] = React.useState(true);
  const [isLoadingCheckout, setLoadingCheckout] = React.useState(false);
  const [isLoadingMethods, setLoadingMethods] = React.useState(true);
  const [userToken, setUserToken] = React.useContext(AuthContext);

  const [billingData, setBillingData] = React.useState({
    firstname: '',
    lastname: '',
    phone: '',
    email: '',
    country: 'Kuwait',
    zone: '',
    custom_field: {
      whatsapp: '',
      block: '',
      street: '',
      avenue: '',
      home: '',
      floor: '',
      flat: '',
      province: ''
    }
  });
  const billingFNRef = React.useRef();
  const billingLNRef = React.useRef();
  const billingEmailRef = React.useRef();
  const billingPhoneRef = React.useRef();
  const billingWTPRef = React.useRef();
  const billingBlockRef = React.useRef();
  const billingStreetRef = React.useRef();
  const billingAvenueRef = React.useRef();
  const billingHomeRef = React.useRef();
  const billingFlatRef = React.useRef();
  const billingFloorRef = React.useRef();
  const billingAreaRef= React.useRef();
  const billingProvinceRef= React.useRef();
  const orderNotesRef= React.useRef();



  const shippingRef = React.useRef();
  const shippingRef1 = React.useRef();
  const shippingRef2 = React.useRef();
  const shippingRef3 = React.useRef();
  const shippingRef4 = React.useRef();
  const shippingRef5 = React.useRef();
  const shippingRef6 = React.useRef();
  const shippingRef7 = React.useRef();

  const [shippingData, setShippingData] = React.useState({
    firstname: '',
    lastname: '',
    address_1: '',
    address_2: '',
    city: '',
    zone: '',
    postcode: '',
    country: 'Kuwait',
  });
  const [switch1, setSwitch1] = React.useState(false);
  const [switch2, setSwitch2] = React.useState(false);
  const validateData = () => {
    if (billingData.firstname == '' || billingData.firstname == null || billingData.firstname == undefined) {
      alert('First Name Missing')
      return false
    }
    else if (billingData.phone == '' || billingData.phone == null || billingData.phone == undefined || billingData.phone.length < 5) {
      alert('Invalid Phone')
    }
    else if (!validateEmail(billingData.email)) {
      alert('Invalid Email')
      return false
    }
    else if (billingData.region == '' || billingData.region == null || billingData.region == undefined) {
      alert('Please select Area')
    }
    else
      return true

  };

  const [summary, setSummary] = React.useState(
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
  const [paymentMethod, setPaymentMethod] = React.useState(0);
  const [shippingMethods, setShippingMethods] = React.useState([]);
  const [selectedSM, setSelectedSM] = React.useState({
    title: '',
    instanceId: '',
    method_id: '',
    method_title: '',
    cost: 0,
    minAmount: '',
  });

  const calculateSummary = async () => {
    try {
      let ship = !isNaN(Number.parseFloat(selectedSM?.settings?.cost?.value))
        ? Number.parseFloat(selectedSM?.settings?.cost?.value)
        : 0;
      setSummary(prevSummary => ({
        ...prevSummary,
        Shipping: ship,
        'Grand Total': route.params.summary['Grand Total'] + ship,
      }));
      setLoadingSummary(false);
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        setLoadingSummary(false);
        console.error(err);
      }
    }
  };
  const checkout = async () => {
    try {
      setLoadingCheckout(true);

      if (!validateData()) {
        setLoadingCheckout(false);
        return;
      }

      if (switch2 && !validateData()) {
        Alert.alert('Invalid Shipping Details');
        setLoadingCheckout(false);
        return;
      }

      if (paymentMethod == 1 || paymentMethod == 2) {
        let data = {
          amount: summary['Grand Total'],
          responseUrl: KEYS.RESPONSE_URL,
          failureUrl: KEYS.FAILURE_URL,
          merchantCode: KEYS.MERCHANT_CODE,
          paymentType: paymentMethod,
          version: "2.0",
          orderReferenceNumber: Number.parseFloat(Math.random() * 10000),
          variable1: billingData.email,
          variable2: null,
          variable3: null,
          variable4: null,
          variable5: null,
          name: billingData.firstname,
          mobile_number: billingData.phone,
          email: billingData.email,
        };
        data = JSON.stringify(data);
        let key = aesjs.utils.utf8.toBytes(KEYS.MERCHANT_KEY);
        let iv = aesjs.utils.utf8.toBytes(KEYS.MERCHANT_IV);
        let payment = new hesabeCrypt(key, iv);
        const encrypted = payment.encryptAes(data); // Ecnryption

        let headers = { accessCode: KEYS.ACCESS_CODE };
        axios
          .post(KEYS.CHECKOUT_URL, { data: encrypted }, { headers: headers })
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
              data: billingData,
              shiping: shippingData,
              isShippingDifferent: switch2,
              payment_method_id: paymentMethod,
              shippingMethod: selectedSM,
            });
            setLoadingCheckout(false);
          })
          .catch(error => {
            showToast(
              error.response.data.message ||
              strings['Checkout'] + ' ' + strings['Error'],
              error.message || strings['Error'],
              'error',
            );
            setLoadingCheckout(false);
          });
      } else {
        setLoadingCheckout(false);
        navigation.navigate('Hesabe', {
          token: '',
          data: billingData,
          shiping: shippingData,
          isShippingDifferent: switch2,
          payment_method_id: paymentMethod,
          shippingMethod: selectedSM,
        });
      }
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        console.error(err);
      }
      setLoadingCheckout(false);
    }
  };
  const getShippingMethods = async () => {
    try {
      const res = await new APIManager().getShippingMethods(1);
      const array = res.data?.shipping_methods;
      setShippingMethods(array)
      setSelectedSM(array[0]);
      // let far_area = FAR_AREAS.some(area => area === route.params?.area)


      // if (far_area) {
      //   let array = res.filter(method => (method.title == 'Flat rate Far Area' || method.title == 'Local pickup'))
      //   setShippingMethods(array)
      //   setSelectedSM(array[0]);
      // }

      // else if (parseFloat(route.params.summary['Sub Total']) >= 10) {
      //   let array = res.filter(method => (method.method_id != 'flat_rate'))
      //   setShippingMethods(array)
      //   setSelectedSM(array[0]);
      // }
      // else {
      //   // let array = []
      //   // res.forEach(method => {
      //   //   if (method.method_id != 'free_shipping' || method.title != 'Flat rate Far Area') {
      //   //     array.push[method]
      //   //   }

      //   // })
      //   // // let array = [res[1], res[3]]
      //   setShippingMethods([res[1], res[3]])
      //   setSelectedSM(res[1]);
      // }

    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        console.error(err);
      }
    }
  };

  const getProfile = async () => {
    try {
      if (!userToken) {
        setLoading(false);
        return;
      }
      const profile = await new APIManager().getProfile();
      let res = await new APIManager().getBillingAddress();
      const billing = res.data.addresses?.filter(item=>item.address_id == res.data.address_id)[0];

      setBillingData({
        firstname: billing?.firstname,
        lastname: billing?.lastname,
        email: billing?.email,
        country: 'Kuwait',
        country_id: 114,
        email: profile.data.email,
        is_valid_email: validateEmail(profile.data.email),
        phone: profile.data.telephone,
        ...billing
      });

      res = await new APIManager().getShippingAddress();
      const shipping = res.data.addresses?.filter(item=>item.address_id == res.data.address_id)[0];

      setShippingData({
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
      setLoading(false);
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        setLoading(false);
        console.error(err);
      }
    }
  };

  const toCart = async () => {
    const response = await new APIManager().addItemsToCart(cart);
  }

  // const SCREEN_HEIGHT = useWindowDimensions().height;
  const [viewHeight, setViewHeight] = React.useState('100%');
  React.useEffect(() => {
    getProfile();
  }, []);

  React.useEffect(() => {
    calculateSummary();
  }, [selectedSM]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // The screen is focused
      // Call any action
      if (route.params?.mode === 'billing') {
        setBillingData({
          ...billingData,
          zone: route.params?.area.name,
          zone_id: route.params?.area.zone_id,
          is_valid_zone: !!route.params?.area.name,
        });
      } else if (route.params?.mode === 'shipping') {
        setShippingData({
          ...shippingData,
          zone: route.params?.area.name,
          zone_id: route.params?.area.zone_id,
          is_valid_zone: !!route.params?.area.name,
        });
      }
    });
    toCart()
    .then(()=>{

      getShippingMethods().finally(() => setLoadingMethods(false));
    })
    return unsubscribe;
  }, [navigation, route]);

  return isLoading ? (
    <View style={styles.centerContainer}>
      <ActivityIndicator size={'large'} color={COLORS.primary} />
    </View>
  ) : (
    <View style={{ height: viewHeight, backgroundColor: '#fff' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.checkoutScrollView}>
        {/* /* ----------------------------- Billing Address ---------------------------- */}
        <Text style={styles.checkoutSubHeading}>
          {strings['billing_address']}
        </Text>
        {/* First Name */}
        <View style={styles.addressInput}>
          <Text style={styles.loginInputHeading}>{strings['First Name']}*</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              returnKeyType="next"
              onSubmitEditing={() => billingLNRef.current.focus()}
              ref={billingFNRef}
              value={billingData.firstname}
              onChangeText={text =>
                setBillingData(prevState => ({
                  ...prevState,
                  firstname: text,
                }))
              }
              style={styles.textInput}
            />
          </View>
        </View>
        {/* Last Name */}
        <View style={styles.addressInput}>
          <Text style={styles.loginInputHeading}>{strings['Last Name']}</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              returnKeyType="next"
              onSubmitEditing={() => billingPhoneRef.current.focus()}
              ref={billingLNRef}
              value={billingData.lastname}
              onChangeText={text =>
                setBillingData(prevState => ({
                  ...prevState,
                  lastname: text,
                }))
              }
              style={styles.textInput}
            />
          </View>
        </View>
        {/* Phone */}
        <View style={styles.addressInput}>
          <Text style={styles.loginInputHeading}>{strings.phone}*</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              returnKeyType="next"
              onSubmitEditing={() => billingWTPRef.current.focus()}
              ref={billingPhoneRef}
              value={billingData.phone}
              keyboardType="phone-pad"
              onChangeText={text =>
                setBillingData(prevState => ({
                  ...prevState,
                  phone: text,
                }))
              }
              style={styles.textInput}
            />
          </View>
        </View>
        {/* Email */}
        <View style={styles.addressInput}>
          <Text style={styles.loginInputHeading}>{strings.email}*</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              returnKeyType="next"
              onSubmitEditing={() =>Keyboard.dismiss()}
              ref={billingEmailRef}
              value={billingData.email}
              autoCapitalize="none"
              onChangeText={text =>
                setBillingData(prevState => ({
                  ...prevState,
                  email: text,
                }))
              }
              style={styles.textInput}
            />
          </View>
        </View>
        {/* Country */}
        <View style={styles.addressInput}>
          <Text style={styles.loginInputHeading}>{strings['country']}</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              returnKeyType="next"
              onSubmitEditing={() => billingAreaRef.current.focus()}
              editable={false}
              value={billingData.country}
              style={styles.textInput}
            />
          </View>
        </View>
        {/* Area */}
        <View style={styles.addressInput}>
          <Text style={styles.loginInputHeading}>{strings['Area']}*</Text>
          <TouchableOpacity
            style={styles.loginTextInput}
            ref = {billingAreaRef}
            onPress={() =>
              navigation.navigate('AreaScreen', {
                screen: 'CheckoutScreen',
                mode: 'billing',
              })
            }>
            <Text style={{ ...styles.textInput }}>{billingData.zone}</Text>
          </TouchableOpacity>
        </View>
        {/* Whatsapp */}
        <View style={styles.addressInput}>
          <Text style={styles.loginInputHeading}>Whatsapp</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              returnKeyType="next"
              onSubmitEditing={() => billingEmailRef.current.focus()}
              ref={billingWTPRef}
              value={billingData.custom_field.whatsapp}
              keyboardType="phone-pad"
              onChangeText={text =>
                setBillingData(prevState => ({
                  ...prevState,
                  custom_field: {
                    ...prevState.custom_field,
                    whatsapp: text
                  },
                }))
              }
              style={styles.textInput}
            />
          </View>
        </View>
        {/* Block */}
        <View style={styles.addressInput}>
          <Text style={styles.loginInputHeading}>{strings['Block']}</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              returnKeyType="next"
              onSubmitEditing={() => billingStreetRef.current.focus()}
              ref={billingBlockRef}
              value={billingData.custom_field.block}
              onChangeText={text =>
                setBillingData(prevState => ({
                  ...prevState,
                  custom_field: {
                    ...prevState.custom_field,
                    block: text
                  },
                }))
              }
              style={{...styles.textInput,paddingVertical:0}}
            />
          </View>
        </View>
        {/* Street */}
        <View style={styles.addressInput}>
          <Text style={styles.loginInputHeading}>
            {strings['street_address']}
          </Text>
          <View style={styles.loginTextInput}>
            <TextInput
              returnKeyType="next"
              onSubmitEditing={() => billingAvenueRef.current.focus()}
              ref={billingStreetRef}
              value={billingData.custom_field.street}
              onChangeText={text =>
                setBillingData(prevState => ({
                  ...prevState,
                  custom_field: {
                    ...prevState.custom_field,
                    street: text
                  },
                }))
              }
              style={styles.textInput}
            />
          </View>
        </View>
        {/* City */}
        <View style={styles.addressInput}>
          <Text style={styles.loginInputHeading}>{strings['avenue']}</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              returnKeyType="next"
              onSubmitEditing={() => billingHomeRef.current.focus()}
              ref={billingAvenueRef}
              value={billingData.custom_field.avenue}
              onChangeText={text =>
                setBillingData(prevState => ({
                  ...prevState,
                  custom_field: {
                    ...prevState.custom_field,
                    avenue: text
                  },
                }))
              }
              style={styles.textInput}
            />
          </View>
        </View>
        {/* Buliding/House */}
        <View style={styles.addressInput}>
          <Text style={styles.loginInputHeading}>{strings['house_field']}</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              returnKeyType="next"
              onSubmitEditing={() => billingFloorRef.current.focus()}
              ref={billingHomeRef}
              value={billingData.custom_field.home}
              onChangeText={text =>
                setBillingData(prevState => ({
                  ...prevState,
                  custom_field: {
                    ...prevState.custom_field,
                    home: text
                  },
                }))
              }
              style={styles.textInput}
            />
          </View>
        </View>
        {/* Floor */}
        <View style={styles.addressInput}>
          <Text style={styles.loginInputHeading}>{strings['floor']}</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              returnKeyType="next"
              onSubmitEditing={() => billingFlatRef.current.focus()}
              ref={billingFloorRef}
              value={billingData.custom_field.floor}
              onChangeText={text =>
                setBillingData(prevState => ({
                  ...prevState,
                  custom_field: {
                    ...prevState.custom_field,
                    floor: text
                  },
                }))
              }
              style={styles.textInput}
            />
          </View>
        </View>
        {/* Flat */}
        <View style={styles.addressInput}>
          <Text style={styles.loginInputHeading}>{strings['flat']}</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              returnKeyType="next"
              onSubmitEditing={() => billingProvinceRef.current.focus()}
              ref={billingFlatRef}
              value={billingData.custom_field.flat}
              onChangeText={text =>
                setBillingData(prevState => ({
                  ...prevState,
                  custom_field: {
                    ...prevState.custom_field,
                    flat: text
                  },
                }))
              }
              style={styles.textInput}
            />
          </View>
        </View>
        {/* Flat */}
        <View style={styles.addressInput}>
          <Text style={styles.loginInputHeading}>{''}</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              returnKeyType="next"
              onSubmitEditing={() => orderNotesRef.current.focus()}
              ref={billingProvinceRef}
              value={billingData.custom_field.province}
              onChangeText={text =>
                setBillingData(prevState => ({
                  ...prevState,
                  custom_field: {
                    ...prevState.custom_field,
                    province: text
                  },
                }))
              }
              style={styles.textInput}
            />
          </View>
        </View>

        {/* /* ----------------------------- Newsletter ---------------------------- */}
        <Text style={{ ...styles.checkoutSubHeading, marginVertical: 20 }}>
          {strings['Newsletter']}
        </Text>
        <View style={styles.checkoutHiddenView}>
          <Text style={{ fontSize: 14 }}>
            {strings['Subscribe to Newsletter']}
          </Text>
          <Switch
            trackColor={{
              false: COLORS.primary,
              true: COLORS.secondary,
            }}
            thumbColor={switch1 ? COLORS.primary : COLORS.secondary}
            ios_backgroundColor="#fff"
            onValueChange={val => setSwitch1(val)}
            value={switch1}
            style={styles.switch}
          />
        </View>
        <Separator width={'100%'} />

        {/* /* ----------------------------- Shipping Address ---------------------------- */}
        <Text style={{ ...styles.checkoutSubHeading, marginVertical: 20 }}>
          {strings['shipping_address']}
        </Text>
        <View style={styles.checkoutHiddenView}>
          <Text style={{ fontSize: 14 }}>
            {strings.Ship_To_Different_Address}
          </Text>
          <Switch
            trackColor={{
              false: COLORS.primary,
              true: COLORS.secondary,
            }}
            thumbColor={switch2 ? COLORS.primary : COLORS.secondary}
            ios_backgroundColor="#fff"
            onValueChange={val => setSwitch2(val)}
            value={switch2}
            style={styles.switch}
          />
        </View>
        {switch2 ? (
          <>
            {/* First Name */}
            <View style={styles.addressInput}>
              <Text style={styles.loginInputHeading}>
                {strings['First Name']}
              </Text>
              <View style={styles.loginTextInput}>
                <TextInput
                  returnKeyType="next"
                  ref={shippingRef}
                  onSubmitEditing={() => shippingRef1.current.focus()}
                  value={shippingData.firstname}
                  onChangeText={text =>
                    setShippingData(prevState => ({
                      ...prevState,
                      firstname: text,
                    }))
                  }
                  style={styles.textInput}
                />
              </View>
            </View>
            {/* Last Name */}
            <View style={styles.addressInput}>
              <Text style={styles.loginInputHeading}>
                {strings['Last Name']}
              </Text>
              <View style={styles.loginTextInput}>
                <TextInput
                  returnKeyType="next"
                  onSubmitEditing={() => shippingRef2.current.focus()}
                  ref={shippingRef1}
                  value={shippingData.lastname}
                  onChangeText={text =>
                    setShippingData(prevState => ({
                      ...prevState,
                      lastname: text,
                    }))
                  }
                  style={styles.textInput}
                />
              </View>
            </View>
            {/* Block */}
            <View style={styles.addressInput}>
              <Text style={styles.loginInputHeading}>{strings['Block']}</Text>
              <View style={styles.loginTextInput}>
                <TextInput
                  returnKeyType="next"
                  onSubmitEditing={() => shippingRef3.current.focus()}
                  ref={shippingRef2}
                  value={shippingData.address_1}
                  onChangeText={text =>
                    setShippingData(prevState => ({
                      ...prevState,
                      address_1: text,
                    }))
                  }
                  style={styles.textInput}
                />
              </View>
            </View>
            {/* Street */}
            <View style={styles.addressInput}>
              <Text style={styles.loginInputHeading}>
                {strings['street_address']}
              </Text>
              <View style={styles.loginTextInput}>
                <TextInput
                  returnKeyType="next"
                  onSubmitEditing={() => shippingRef4.current.focus()}
                  ref={shippingRef3}
                  value={shippingData.address_2}
                  onChangeText={text =>
                    setShippingData(prevState => ({
                      ...prevState,
                      address_2: text,
                    }))
                  }
                  style={styles.textInput}
                />
              </View>
            </View>
            {/* City */}
            <View style={styles.addressInput}>
              <Text style={styles.loginInputHeading}>{strings['city']}</Text>
              <View style={styles.loginTextInput}>
                <TextInput
                  returnKeyType="next"
                  onSubmitEditing={() => Keyboard.dismiss()}
                  ref={shippingRef4}
                  value={shippingData.city}
                  onChangeText={text =>
                    setShippingData(prevState => ({
                      ...prevState,
                      city: text,
                    }))
                  }
                  style={styles.textInput}
                />
              </View>
            </View>
            {/* Area */}
            <View style={styles.addressInput}>
              <Text style={styles.loginInputHeading}>{strings['Area']}</Text>
              <TouchableOpacity
                style={styles.loginTextInput}
                ref={shippingRef5}
                onPress={() => {
                  navigation.navigate('AreaScreen', {
                    screen: 'CheckoutScreen',
                    mode: 'shipping',
                  });
                }}>
                <Text style={{ ...styles.textInput }}>{shippingData.zone}</Text>
              </TouchableOpacity>
            </View>
            {/* Post Code */}
            <View style={styles.addressInput}>
              <Text style={styles.loginInputHeading}>
                {strings['Postcode']}
              </Text>
              <View style={styles.loginTextInput}>
                <TextInput
                  returnKeyType="next"
                  onSubmitEditing={() => orderNotesRef.current.focus()}
                  ref={shippingRef6}
                  value={shippingData.postcode}
                  onChangeText={text =>
                    setShippingData(prevState => ({
                      ...prevState,
                      postcode: text,
                    }))
                  }
                  style={styles.textInput}
                />
              </View>
            </View>
            {/* Country */}
            <View style={styles.addressInput}>
              <Text style={styles.loginInputHeading}>{strings['country']}</Text>
              <View style={styles.loginTextInput}>
                <TextInput
                  returnKeyType="next"
                  onSubmitEditing={() => orderNotesRef.current.focus()}
                  ref={shippingRef7}
                  editable={false}
                  value={shippingData.country}
                  onChangeText={text =>
                    setShippingData(prevState => ({
                      ...prevState,
                      country: text,
                    }))
                  }
                  style={styles.textInput}
                />
              </View>
            </View>
          </>
        ) : null}
        <Separator width={'100%'} />
        <View style={styles.checkoutOrderNotes}>
          <Text style={styles.loginInputHeading}>
            {strings['Order notes (Optional)']}
          </Text>
          <View style={styles.loginTextInput}>
            <TextInput
              style={styles.checkoutOrderNotesInput}
              returnKeyType="done"
              onSubmitEditing={()=>Keyboard.dismiss()}
              ref={orderNotesRef}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              onChangeText={text =>
                setBillingData(prevState => ({
                  ...prevState,
                  order_notes: text,
                }))
              }
            />
          </View>
        </View>
        <Separator width={'100%'} />
        <Text style={styles.detailInfoHeading}>{strings['summary']}</Text>
        {isLoadingSummary ? (
          <View style={styles.isLoadingMoreIndicator}>
            <ActivityIndicator size={'large'} color={COLORS.primary} />
          </View>
        ) : (
          Object.keys(summary).map((item, index) => (
            <View style={styles.detailAdditionalInfoView} key={index}>
              <Text style={styles.cartAdditionalInfoText}>{strings[item]}</Text>
              <Text style={styles.detailAdditionalInfoText2}>
                {Number.parseFloat(summary[item]).toFixed(2)} KWD
              </Text>
            </View>
          ))
        )}
        <Separator width={'100%'} />
        {/* /* ----------------------------- Payment Methods ---------------------------- */}
        <Text style={styles.detailInfoHeading}>
          {strings['payment_methods']}
        </Text>
        {paymentMethods.map((item, index) => (
          <TouchableOpacity
            style={styles.paymentCardContainer}
            key={index}
            onPress={() => setPaymentMethod(item.id)}>
            <View style={styles.paymentCard}>
              <SvgXml
                xml={
                  paymentMethod === item.id
                    ? SVG.paymentSelectBullet
                    : SVG.paymentNotSelectBullet
                }
              />
              <Text style={styles.paymentName}>{strings[item.name]}</Text>
              <Image source={item.image} />
            </View>
            <Text style={styles.detailShortDescText}>
              {strings[item.short_description]}
            </Text>
          </TouchableOpacity>
        ))}
        {/* <Separator width={'100%'} /> */}
        {/* /* ----------------------------- Shipping Methods ---------------------------- */}
        <Text style={styles.detailInfoHeading}>
          {strings['shipping_method']}
        </Text>
        {isLoadingMethods ? (
          <View style={styles.isLoadingMoreIndicator}>
            <ActivityIndicator size={'large'} color={COLORS.primary} />
          </View>
        ) : (
          shippingMethods.map((item, index) => (
            <TouchableOpacity
              style={styles.paymentCardContainer}
              key={index}
              onPress={() => setSelectedSM(item)}>
              <View style={[styles.paymentCard]}>
                <SvgXml
                  xml={
                    selectedSM.id === item.id
                      ? SVG.paymentSelectBullet
                      : SVG.paymentNotSelectBullet
                  }
                />
                <Text style={styles.paymentName}>{strings[item.title]}</Text>
                {/* <Text style={[styles.paymentName, { flexGrow: 0 }]}>
                  {!isNaN(Number.parseFloat(item?.settings?.cost?.value))
                    ? Number.parseFloat(item?.settings?.cost?.value).toFixed(
                      2,
                    ) + 'KWD'
                    : null}
                </Text> */}
              </View>
              <Text style={styles.detailShortDescText}>
                {!isNaN(Number.parseFloat(item?.settings?.cost?.value))
                  ? strings['New Total: '] +
                  ((Number.parseFloat(route.params.summary['Grand Total']) +
                    Number.parseFloat(item?.settings?.cost?.value))).toFixed(2)
                  : null}
              </Text>
            </TouchableOpacity>
          ))
        )}
        {/* <Separator width={'100%'} /> */}
        <Text style={styles.paymentShortDesc}>
          {strings.Your_Personal_data}{' '}
          <Text style={styles.paymentPolicy}>
            {strings['Privacy Policy']}
            {'.'}
          </Text>
        </Text>
        {!isLoadingCheckout ?
          <Button
            text={strings['Place Order']}
            onPress={() => checkout()}
            type={'primary'}
            isLoading={isLoadingCheckout}
          />
          :
          <Button
            text={''}
            onPress={() => { }}
            type={'primary'}
            isLoading={isLoadingCheckout}
          />
        }
      </ScrollView>
      <WhatsAppButton />
    </View>
  );
};

export default CheckoutScreen;
