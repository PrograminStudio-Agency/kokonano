import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {Alert} from 'react-native';
import {showToast, strings} from '../config';
import { navigate } from '../RootNavigation';

export const CartContext = React.createContext();

export const CartProvider = ({children, navigationRef}) => {
  const [cart, setCartOnly] = React.useState([]);
  const onPress = () => navigationRef.current?.navigate('CartScreen');

  const addMultiple = items => {
    const out_of_stock = [],
      already_added = [],
      too_much_quantity = [],
      to_add = [];

    items.map(({item, quantity}) => {
      if (item.quantity < 1) {
        out_of_stock.push(item);
        return;
      } else if (cart?.findIndex(obj => obj.id === item.id) !== -1) {
        already_added.push(item);
        return;
      } else if (item.quantity < quantity) {
        too_much_quantity.push(item);
        return;
      }
      to_add.push({...item, quantity: quantity});
    });

    if (to_add?.length > 0) {
      const newCart = [...cart, ...to_add];
      AsyncStorage.setItem('cart', JSON.stringify(newCart), () => {});
      setCartOnly(newCart);
      showToast(
        strings['PRODUCT_ADDED_TO_CART'],
        strings['SUCCESS'],
        'success','top',onPress
      );
    }

    let alertMessage = ``;
    if (out_of_stock.length > 0) {
      alertMessage +=
        `Following Items are Out Of Stock\n` +
        out_of_stock.map(item => item.name).join('\n');
    }
    if (already_added.length > 0) {
      alertMessage +=
        `Following Items are Already Added\n` +
        already_added.map(item => item.name).join('\n');
    }
    if (too_much_quantity.length > 0) {
      alertMessage +=
        `Following Items Don't Have Enough Stock Available\n` +
        too_much_quantity.map(item => item.name).join('\n');
    }

    if (
      out_of_stock.length > 0 ||
      already_added.length > 0 ||
      too_much_quantity.length > 0
    ) {
      Alert.alert(strings['Failed to Add Items in Cart'], alertMessage);
    }
  };

  const addCart = (item, quantity) => {
    if (item.quantity < 1) {
      Alert.alert(strings['Out Of Stock']);
      return;
    } else if (cart?.findIndex(obj => obj.product_id === item.product_id) !== -1) {
      incrementCart(item)
      return;
    } else if (item.quantity < quantity) {
      Alert.alert(strings['Not Enough Stock Available']);
      return;
    }
    const newCart = [...cart, {...item, quantity: quantity || 1}];
    AsyncStorage.setItem('cart', JSON.stringify(newCart), () => {}); 
    setCartOnly(newCart);
    showToast(strings['PRODUCT_ADDED_TO_CART'], strings['SUCCESS'], 'success','top',onPress);
    
  };

  const removeCart = item => {
    const newCart = cart?.filter(obj => obj.product_id !== item.product_id);
    AsyncStorage.setItem('cart', JSON.stringify(newCart), () => {});
    setCartOnly(newCart);
    showToast(
      strings['Product Removed From Cart'],
      strings['SUCCESS'],
      'success','top',onPress
    );
  };

  const incrementCart = item => {
    var flag = false;
    const newCart = cart?.map(obj => {
      if (obj.product_id === item.product_id) {
        if (obj.quantity + 1 > item.quantity) {
          flag = true;
          Alert.alert(strings['No More Items']);
        } else {
          return {...obj, quantity: obj.quantity + 1};
        }
      }
      return obj;
    });
    if (flag) return;
    AsyncStorage.setItem('cart', JSON.stringify(newCart), () => {});
    setCartOnly(newCart);
    showToast(strings['PRODUCT_ADDED_TO_CART'], strings['SUCCESS'], 'success','top',onPress);
  };

  const decrementCart = item => {
    var flag = false;
    const newCart = cart?.map(obj => {
      if (obj.product_id === item.product_id) {
        if (obj.quantity - 1 <= 0) {
          flag = true;
          Alert.alert(strings['Product Quantity Cannot be Reduced']);
        } else {
          return {...obj, quantity: obj.quantity - 1};
        }
      }
      return obj;
    });

    if (flag) return;
    AsyncStorage.setItem('cart', JSON.stringify(newCart), () => {});
    setCartOnly(newCart);
  };

  const emptyCart = () => {
    setCartOnly([]);
    AsyncStorage.setItem('cart', JSON.stringify([]), () => {});
    showToast(strings['Cart Emptied'], strings['SUCCESS'], 'success','top',onPress);
  };

  return (
    <CartContext.Provider
      value={[
        cart,
        addCart,
        removeCart,
        incrementCart,
        decrementCart,
        emptyCart,
        setCartOnly,
        addMultiple,
      ]}>
      {children}
    </CartContext.Provider>
  );
};
