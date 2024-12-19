import React, { useRef, useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Button } from '../components';
import {
  APIManager,
  COLORS,
  showToast,
  strings,
  styles,
  SVG,
  validateEmail,
} from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { AuthContext, NetworkContext } from '../context';

const AddressScreen = ({ navigation, route }) => {
  const routes = navigation.getState()?.routes;
  const prevRoute = routes[routes.length - 2].name;

  const [userToken, setUserToken] = React.useContext(AuthContext);
  const [, setConnected] = React.useContext(NetworkContext);
  const [newAddress, setNewAddress] = useState(route?.params?.newAddress);
  const [zone, setZone] = React.useState(route.params?.zone || 0);
  const [isLoading, setLoading] = useState();
  const [customFields, setCustomFields] = useState();
  const [areas,setAreas] = useState();

  const [billingData, setBillingData] = React.useState({
    firstname: userToken ? `${userToken.firstname}` : '',
    lastname: userToken ? `${userToken.lastname}` : '',
    email: '',
    telephone: '',
    city: '',
    zone: '',
    country: 'Kuwait',
    postcode: '',
    address_1: '___',
    address_2: '___',
    is_valid_first_name: !!(userToken ? `${userToken.first_name}` : null),
    is_valid_last_name: !!(userToken ? `${userToken.last_name}` : null),
    is_valid_address_1: false,
    is_valid_address_2: false,
    is_valid_city: false,
    is_valid_state: false,
    is_valid_postcode: false,
    is_valid_country: true,
    is_valid_telephone: false,
    is_valid_email: false,
    custom_field: {
      account: !userToken ? {} : userToken.account_custom_field
    },
    country_id: 114
  });

  const extraFields = (!customFields ? [] : customFields)
    .filter(field => !field.name.toLowerCase().includes('token'))
    .map(field => {
      const value = billingData.custom_field.account ? billingData.custom_field.account[field.custom_field_id] : '';
      return ({
        label: field.name,
        value,
        onChangeText: (text) => {
          const data = { ...billingData };
          data.custom_field.account = data.custom_field.account ? data.custom_field.account : {};
          data.custom_field.account[field.custom_field_id] = text;
          setBillingData(data)
        }
        ,
        ...(!field.required ? {} : { isValid: !!value }),
        error: `Enter ${field.name}`
      })
    })
    // console.log(refs2.length)
  const fields = [
    {
      label: `${strings['First Name']}`,
      value: billingData.firstname,
      onChangeText: (text) =>
        setBillingData(prevState => ({
          ...prevState,
          firstname: text,
          is_valid_first_name: text?.length >= 1 && text?.length <= 32,
        }))
      ,
      isValid: billingData.is_valid_first_name,
      required: true
    },
    {
      label: `${strings['Last Name']}`,
      value: billingData.lastname,
      onChangeText: (text) =>
        setBillingData(prevState => ({
          ...prevState,
          lastname: text,
          is_valid_last_name: text?.length >= 1 && text?.length <= 32,
        }))
      ,
      isValid: billingData.is_valid_last_name
    },
    (userToken ? null :
      {
        label: `${strings.email}`,
        value: billingData.email,
        onChangeText: (text) =>
          setBillingData(prevState => ({
            ...prevState,
            email: text,
            is_valid_email: validateEmail(text),
          }))
        ,
        isValid: billingData.is_valid_email,
        email: true,
      }
    ),
    (userToken ? null :
      {
        label: strings.telephone,
        value: billingData.telephone,
        onChangeText: (text) =>
          setBillingData(prevState => ({
            ...prevState,
            telephone: text,
            is_valid_telephone: text?.length <= 8 
          }))
        ,
        keyboardType: "phone-pad",
        isValid: billingData.is_valid_telephone,
        required: true,
        error: strings.phone_length_error +' and '+strings.dont_enter_code_error,
        telephone:true
      }
    ),
    {
      area: true,
      isValid: billingData.zone_id != undefined,
      label: 'Area',
    },
    {
      label: `${strings['country']}`,
      value: billingData.country,
      isValid: billingData.is_valid_country,
    },
    // {
    //   label: `${strings['Block']}`,
    //   value: billingData.address_2.replace('__', ''),
    //   onChangeText: (text) =>
    //     setBillingData(prevState => ({
    //       ...prevState,
    //       address_2: text,
    //       is_valid_address_2: (text.length >= (3 - 2) && text.length <= (128 - 2)),
    //     }))
    //   ,
    //   isValid: billingData.is_valid_address_2,
    //   // error: 'Block length should be greater than 1 and less than 126'
    //   error: 'Block length should be less than 126'
    // },
    // {
    //   label: `${strings['street_address']}`,
    //   value: billingData.address_1.replace('__', ''),
    //   onChangeText: (text) =>
    //     setBillingData(prevState => ({
    //       ...prevState,
    //       address_1: text,
    //       is_valid_address_1: text.length >= (3 - 2) && text.length <= (128 - 2),
    //     }))
    //   ,
    //   isValid: billingData.is_valid_address_1,
    //   // error: 'Street length should be greater than 1 and less than 126'
    //   error: 'Street length should be less than 126'
    // },
    // {
    //   label: 'Apartment',
    //   value: billingData.custom_field.address.apartment,
    //   onChangeText: (text) =>
    //     setBillingData(prevState => ({
    //       ...prevState,
    //       custom_field: {
    //         address: {
    //           ...prevState.custom_field.address,
    //           apartment: text
    //         }
    //       },
    //     }))
    //   ,
    // },
    // {
    //   label: strings['house_field'],
    //   value: billingData.custom_field.address.home,
    //   onChangeText: (text) =>
    //     setBillingData(prevState => ({
    //       ...prevState,
    //       custom_field: {
    //         address: {
    //           ...prevState.custom_field.address,
    //           home: text
    //         }
    //       },
    //     }))
    //   ,
    // },
    // {
    //   label: strings['floor'],
    //   value: billingData.custom_field.address.floor,
    //   onChangeText: (text) =>
    //     setBillingData(prevState => ({
    //       ...prevState,
    //       custom_field: {
    //         address: {
    //           ...prevState.custom_field.address,
    //           floor: text
    //         }
    //       },
    //     }))
    //   ,
    // },
    // {
    //   label: strings.avenue,
    //   value: billingData.custom_field.address.avenue,
    //   onChangeText: (text) =>
    //     setBillingData(prevState => ({
    //       ...prevState,
    //       custom_field: {
    //         address: {
    //           ...prevState.custom_field.address,
    //           avenue: text
    //         }
    //       },
    //     }))
    //   ,
    // },
    // {
    //   label: `Whatsapp`,
    //   value: billingData.custom_field.address.whatsapp,
    //   onChangeText: (text) =>
    //     setBillingData(prevState => ({
    //       ...prevState,
    //       custom_field: {
    //         address: {
    //           ...prevState.custom_field.address,
    //           whatsapp: text
    //         }
    //       },
    //     }))
    //   ,
    //   keyboardType: "phone-pad",
    // },
  ].filter(item => item);
  // let refs = fields.map(item => useRef());

  const getToken = async () => {
    const permission = await messaging().hasPermission();
    if (permission == 1) {
      return await messaging().getToken();
    } else {
      await messaging().requestPermission();
      return await messaging().getToken();
    }
  };

  const updateAddress = async () => {
    try {
      const deviceToken = await getToken();
      var message = '';
      [...fields, ...extraFields].map((item) => {
        if (Object.keys(item).includes('isValid') && item.isValid != true)
          message += (`\n${item.error ? item.error : `${item.label} is incorrect`}`)
      })
      if (message != '') {
        return alert(message);
      }

      let address = {
        ...billingData,
        custom_field: (
          userToken
            ? {
              address: {
                ...billingData.custom_field.account,
                "8": deviceToken,
              }
            }
            : {
              account: {
                ...billingData.custom_field.account,
                "8": deviceToken,
              }
            }
        )
      }
      setLoading(true);
      if (newAddress) {
        if (userToken) {
          let res = await new APIManager().addAddresses(address);
          await new APIManager().updateProfile({ custom_field: { account: address.custom_field.address } })
          res = await new APIManager().getProfile();
          setUserToken(res.data);
        }
        else {
          const response = await AsyncStorage.getItem('guests');
          const addresses = JSON.parse(response) ? JSON.parse(response) : [];
          addresses.push({ ...address, address_id: addresses.length ? addresses[0].address_id + 1 : 0 });
          await AsyncStorage.setItem('guests', JSON.stringify(addresses));
        }
      } else {
        if (userToken) {
          let res = await new APIManager().updateAddresses(address, address.address_id);
          await new APIManager().updateProfile({ custom_field: { account: address.custom_field.address } })
          res = await new APIManager().getProfile();
          setUserToken(res.data);
        } else {
          const response = await AsyncStorage.getItem('guests');
          const addresses = JSON.parse(response) ? JSON.parse(response) : [];
          const changed = addresses.map(add => add.address_id == billingData.address_id ? address : add);
          await AsyncStorage.setItem('guests', JSON.stringify(changed));
        }
      }
      navigation.navigate(prevRoute);
      showToast(
        strings['Addresses have been successfully updated'],
        strings['SUCCESS'],
        'success',
      );
      setLoading(false);
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        console.error(err);
      }
      showToast(strings['Error'], strings['Error'], 'error');
      setLoading(false);
    }
  };

  const fetchCustomFields = async () => {
    try {
      const res = await new APIManager().getCustomFields();
      setCustomFields(res.data);
      
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        console.error(err);
      }
      showToast(strings['Error'], strings['Error'], 'error');
    }
  }

  // const SCREEN_HEIGHT = useWindowDimensions().height;
  const [viewHeight, setViewHeight] = React.useState('100%');

  React.useEffect(() => {
    fetchCustomFields();
    if (!newAddress) {
      setBillingData({
        ...billingData,
        ...route.params?.address,
        custom_field: !userToken
          ? route.params?.address.custom_field
          : { account: route.params?.address?.custom_field?.address },
        is_valid_first_name: true,
        is_valid_last_name: true,
        is_valid_address_1: true,
        is_valid_address_2: true,
        is_valid_city: true,
        is_valid_state: true,
        is_valid_postcode: true,
        is_valid_country: true,
        is_valid_telephone: true,
        is_valid_email: true,
      });
    }
  }, []);

  React.useEffect(() => {

    const unsubscribe = navigation.addListener('focus', () => {
      // The screen is focused
      // Call any action
      if (route.params?.mode === 'billing') {
        setBillingData({
          ...billingData,
          zone: route.params?.area.name,
          city: route.params?.area.name,
          zone_id: route.params?.area.zone_id,
          is_valid_zone: !!route.params?.area.name,
        });
      } else if (route.params?.mode === 'shipping') {
        setShippingData({
          ...shippingData,
          zone: route.params?.area.name,
          city: route.params?.area.name,
          zone_id: route.params?.area.zone_id,
          is_valid_zone: !!route.params?.area.name,
        });
      } if (!!route.params?.zone) {
        setZone(route.params.zone)
      }
    });

    return unsubscribe
  }, [navigation, route]);

  return (
    <KeyboardAvoidingView style={{ height: viewHeight, backgroundColor: 'white' }} behavior={'height'}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.checkoutScrollView}>
        {/* /* ----------------------------- Billing Address ---------------------------- */}
        {
          [...fields, ...extraFields].map((item, index) => {
            return (

              <View style={{...styles.addressInput,marginBottom:20}} key={index}>
                <Text style={{...styles.loginInputHeading}}>
                  <Text>{item.label}</Text>
                  {item.isValid != undefined ? <Text style={{ color: 'red' }}>*</Text> : null}
                </Text>
                {
                  item.area
                    ?
                    <TouchableOpacity
                      style={{...styles.loginTextInput}}
                      onPress={() =>
                        navigation.navigate('AreaScreen', {
                          screen: 'AddressScreen',
                          mode: 'billing',
                        })
                      }
                      // ref={refs[index]}
                    >
                      <Text style={ styles.textInput }>{billingData.zone}</Text>
                      <SvgXml xml={SVG.arrowIconRight} />
                    </TouchableOpacity>
                    :
                    <View style={{...styles.loginTextInput}}>
                      <TextInput
                        // returnKeyType="next"
                        // onSubmitEditing={() => index + 1 != fields.length ? refs[index + 1].current.focus() : null}
                        // ref={refs[index]}
                        value={item.value}
                        editable={item.onChangeText != undefined}
                        onChangeText={item.onChangeText}
                        style={styles.textInput}
                        autoCapitalize={item.email ? 'none' : 'sentences'}
                        keyboardType={item.keyboardType}
                      />
                      
                      {
                        
                        item.email ? 
                          billingData.email === '' ? (
                            <SvgXml xml={SVG.infoIcon} />
                          ) : billingData.is_valid_email ? (
                            <SvgXml xml={SVG.checkIcon} />
                          ) : (
                            <SvgXml xml={SVG.infoErrorIcon} />
                          )
                        : item.telephone ?
                            <View style={{position:'relative'}}>
                              <Text 
                                style={{color: billingData.telephone.length <=8 ? '#ccc' : 'red'}}
                                onPress={billingData.telephone.length <=8 ? null : ()=>showToast(strings.phone_length_error, strings.dont_enter_code_error, 'error')}
                                >
                                  {billingData.telephone.length}/8
                              </Text>
                              
                            </View>  
                        : null  
                      }
                    </View>
                }
              </View>
            )
          })
        }
        <Button
          text={newAddress ? strings['submit'] : strings['Update']}
          onPress={updateAddress}
          type={'primary'}
          isLoading={isLoading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddressScreen;
