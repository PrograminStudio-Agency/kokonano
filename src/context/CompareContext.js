import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { I18nManager, Alert } from "react-native";
import { showToast, strings } from "../config";
import RNRestart from 'react-native-restart';

export const CompareContext = React.createContext();

export const CompareProvider = ({children}) => {

  const [products, setProducts] = React.useState([]);

  
  const removeAll = () => setProducts([]);

  const setProduct = (product, navigation) => {
    if(products.findIndex( item => item.product_id === product.product_id) !== -1) {
      setProducts(prevProducts => prevProducts.filter( item => item.product_id !== product.product_id));
      showToast('Product Removed for Comparison', strings['SUCCESS'], 'success');
      return;
    } else if (products.length >= 2) {
      Alert.alert('Products Limit Reached', '2 Products Already Selected for Comparison')
      return;
    } 
 
    setProducts(prevProducts => [...prevProducts, product]);
    showToast('Product Selected for Comparison', strings['SUCCESS'], 'success');

    if(products.length >= 1 && !!navigation) {
      navigation.navigate('CompareProductScreen')
    }
  }

  return (
    <CompareContext.Provider value={[products, setProduct, removeAll]}>
      {children}
    </CompareContext.Provider>
  );
};
