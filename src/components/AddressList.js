import { View, Text, Image } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import { APIManager, COLORS, SVG } from '../config'
import { AuthContext, NetworkContext, CartContext } from '../context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { parse, SvgXml } from 'react-native-svg';

const AddressList = ({ addresses, address, setAddress, setAddresses }) => {
  const navigation = useNavigation();
  const [userToken, setUserToken] = React.useContext(AuthContext);
  const array = !addresses ? [1] : [...addresses, 1];

  const onDelete = async (item) => {
    const temp = addresses?.filter((add) => add.address_id != item.address_id)
    setAddresses(temp);
    if (userToken) {
      const response = await new APIManager().deleteAddresses(item.address_id);
    } else {
      await AsyncStorage.setItem('guests', JSON.stringify(temp));
    }
  }
  const onEdit = async (item) => {
    const toEdit = (item.custom_field.address || item.custom_field.account) ? item : { ...item, custom_field: { address: item.custom_field } };
    navigation.navigate('AddressScreen', { newAddress: false, address: toEdit })
  }

  return (
    <View>
      {
        array.map((item, index) => {
          const append = typeof item == 'number';
          const selected = !append && item.address_id == address?.address_id;
          const center = append ? { justifyContent: 'center', alignItems: 'center' } : null;
          const backgroundColor = { backgroundColor: selected ? COLORS.filterSeparator : 'white' }
          const body = append ? null : { elevation: 1 }
          return (
            <TouchableOpacity
              key={index}
              style={{ ...backgroundColor, ...center, ...body, marginBottom: 10, padding: 10 }}
              activeOpacity={0.7}
              onPress={() =>
                append
                  ? navigation.navigate('AddressScreen', { newAddress: true })
                  : setAddress(item)
              }
            >
              {
                append
                  ? <Text style={{ color: 'blue', fontSize: 14 }}>Add New Address</Text>
                  :
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1, marginRight: 20 }}>
                      <Text style={{ color: 'black' }}>
                        {item.firstname ? <Text>{item.firstname} </Text> : null}
                        {item.lastname ? <Text>{item.lastname}, </Text> : null}
                        {item.address_1 ? <Text>{item.address_1.replace('__', '')}, </Text> : null}
                        {item.address_2 ? <Text>{item.address_2.replace('__', '')}, </Text> : null}
                        {/* {item.city ? <Text>{item.city}, </Text> : null} */}
                        {item.zone ? <Text>{item.zone}, </Text> : null}
                        {item.country ? <Text>{item.country}, </Text> : null}
                      </Text>
                      <Text style={{ color: COLORS.primary }}>
                        {'\n'}
                        {item.email ? <Text>{item.email} </Text> : null} {'\t\t'}
                        {item.telephone ? <Text>{item.telephone} </Text> : null}
                      </Text>
                    </View>
                    <View style={{ justifyContent: 'space-between' }}>
                      <TouchableOpacity
                        style={{ borderRadius: 3, justifyContent: 'center', alignItems: 'center', padding: 10, marginRight: -5, marginTop: -10 }}
                        onPress={() => onEdit(item)}
                      >
                        <Image source={require('../assets/pen.png')} style={{ width: 13, height: 13, resizeMode: 'contain' }} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ borderRadius: 3, justifyContent: 'center', alignItems: 'center' }}
                        activeOpacity={0.5}
                        onPress={() => onDelete(item)}
                      >
                        <SvgXml xml={SVG.deleteIcon} color={'white'} style={{ flex: 1 }} />
                      </TouchableOpacity>
                    </View>
                  </View>
              }
            </TouchableOpacity>
          )
        })
      }
    </View>
  )
}

export default AddressList