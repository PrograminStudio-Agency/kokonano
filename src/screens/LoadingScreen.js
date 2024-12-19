import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { ActivityIndicator, Image, SafeAreaView, Text, View, I18nManager } from 'react-native';
import { APIManager, COLORS, strings, styles } from '../config';
import { AuthContext, CartContext, LanguageContext, NetworkContext, WishlistContext } from '../context';
import RNRestart from 'react-native-restart';

const LoadingScreen = ({ navigation }) => {
  const [, setConnected] = React.useContext(NetworkContext);
  const [userToken, setUserToken, , setToken] = React.useContext(AuthContext);
  const [, , , , , , setCartOnly] = React.useContext(CartContext);
  const [, , , setWishlistOnly] = React.useContext(WishlistContext);
  const [, , setLanguageOnly] = React.useContext(LanguageContext);

  const setWishlist = async () => {
    const wishlist_stored = await AsyncStorage.getItem('wishlist');
    if (!!wishlist_stored) {
      setWishlistOnly(JSON.parse(wishlist_stored));
    } else {
      setWishlistOnly([])
    }
  };

  const navigate = async () => {
    try {
      const res = await new APIManager().getProfile();
      setUserToken(res?.data);
      await setWishlist();
      navigation.replace('HomeScreen');
    } catch (err) {
      try {
        const guest_login = await AsyncStorage.getItem('guest_login');
        if (!!guest_login) navigation.replace('HomeScreen');
        else navigation.replace('WelcomeScreen');
      } catch (error) {
        navigation.replace('WelcomeScreen');
        console.error(err);
      }
    }
  };

  const setCart = async () => {
    const cart_stored = await AsyncStorage.getItem('cart');
    if (!!cart_stored) {
      setCartOnly(JSON.parse(cart_stored));
    } else {
      setCartOnly([])
    }
  };

  const setLanguage = async () => {
    try {
      const language_stored = await AsyncStorage.getItem('language');

      if (language_stored === 'ar' && !I18nManager.isRTL) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);
        RNRestart.Restart();
      } else if (language_stored === 'en' && I18nManager.isRTL) {
        I18nManager.allowRTL(false);
        I18nManager.forceRTL(false);
        RNRestart.Restart();
      } else if (language_stored) {
        setLanguageOnly(language_stored);
        strings.setLanguage(language_stored);
      } else {
        setLanguageOnly('en');
        strings.setLanguage('en');
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchCategories = async () => {
    // await AsyncStorage.removeItem('categories');
    // return
    const categories = await AsyncStorage.getItem('categories');
    let stored_categories_count = !!categories ? (JSON.parse(categories).length) : 0;
    try {
      let page = 1;
      let categories_array = [];
      const res = await new APIManager().getAllCategories(page);
      if(res.headers["x-total-count"] - 1  == stored_categories_count){
        return
      } 
      categories_array = res.data.data;

      let total_pages = Math.ceil(res.headers["x-total-count"] / 100);
      while (page < total_pages) {
        page += 1;
        const res = await new APIManager().getAllCategories(page);
        categories_array = [...categories_array, ...res.data.data];
      }
      await AsyncStorage.setItem('categories', JSON.stringify(categories_array))
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        console.error(err);
      }
    }
  }

  const generateToken = async () => {
    const response = await new APIManager().sessionToken();
    setToken(response.data.access_token);
  }

  React.useEffect(() => {
    async function fetchData() {
      await generateToken();
      await fetchCategories();
      await setLanguage()
      setCart();
      navigate();
    }
    fetchData();
  }, []);

  return (
    <SafeAreaView style={styles.welcomeContainer}>
      <View style={styles.welcomeHeadingContainer}>
        <Text style={styles.welcomeHeading}>
          {strings['Kuwait Online Shopping Store']}
        </Text>
        <Text style={styles.welcomeSubHeading}>
          {strings['Shop Top Brand']}
        </Text>
      </View>
      <View style={styles.welcomeImageContainer}>
        <Image source={require('../assets/logo-1.png')} />
      </View>
      <View style={styles.welcomeButtonsContainer}>
        <ActivityIndicator size={'large'} color={COLORS.primary} />
      </View>
    </SafeAreaView>
  );
};

export default LoadingScreen;
