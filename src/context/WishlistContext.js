import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import {showToast, strings} from '../config';

export const WishlistContext = React.createContext();

export const WishlistProvider = ({children}) => {
  const [wishlist, setWishlistOnly] = React.useState([]);

  const addWishlist = async obj => {
    let newWishlist = [...wishlist];
    const isAdded = wishlist.findIndex(item => item.product_id === obj.product_id) !== -1;

    if (isAdded) {
      newWishlist = wishlist.filter(item => item.product_id !== obj.product_id);
    } else {
      newWishlist.push(obj);
    }

    showToast(
      isAdded
        ? strings['Product Removed From Wishlist']
        : strings['Product_Added_to_Wishlist'],
      strings['SUCCESS'],
      'success',
    );
    await AsyncStorage.setItem('wishlist', JSON.stringify(newWishlist));
    setWishlistOnly(newWishlist);
  };

  const emptyWishlist = () => {
    setWishlistOnly(null);
    AsyncStorage.removeItem('wishlist', () => {});
    showToast(strings['Wishlist Emptied'], strings['SUCCESS'], 'success');
  };

  return (
    <WishlistContext.Provider
      value={[wishlist, addWishlist, emptyWishlist, setWishlistOnly]}>
      {children}
    </WishlistContext.Provider>
  );
};
