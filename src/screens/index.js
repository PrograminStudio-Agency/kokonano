import React from 'react';
// import { View, Text } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {
  // Button,
  HeaderLeftBack,
  HeaderLeftDrawer,
  HeaderRightCart,
  TestScreen,
} from '../components';
import {capitalizeFirstLetter, strings, styles, SVG} from '../config';
import AddressScreen from './AddressScreen';
import AddressListScreen from './AddressListScreen';
import AllProductScreen from './AllProductScreen';
import AreaScreen from './AreaScreen';
import CartScreen from './CartScreen';
import CategoryListScreen from './CategoryListScreen';
import CheckoutScreen from './CheckoutScreen';
import PaymentScreen from './PaymentScreen';
import ShipmentScreen from './ShipmentScreen';
import ReviewScreen from './ReviewScreen';
import CompareProductScreen from './CompareProductScreen';
import ConfirmBookingScreen from './ConfirmBookingScreen';
import DrawerContent from './DrawerContent';
import DrawerContentList from './DrawerContentList';
import FilterScreen from './FilterScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import HesabeWebView from './HesabeWebView';
import HomeScreen from './HomeScreen';
import LanguageScreen from './LanguageScreen';
import LoadingScreen from './LoadingScreen';
import OrderDetailScreen from './OrderDetailScreen';
import OrdersScreen from './OrdersScreen';
import ProductDetailScreen from './ProductDetailScreen';
import ProductImagesScreen from './ProductImagesScreen';
import ProfileScreen from './ProfileScreen';
import SearchScreen from './SearchScreen';
import SignInScreen from './SignInScreen';
import SignUpScreen from './SignUpScreen';
import SortScreen from './SortScreen';
import WebViewScreen from './WebViewScreen';
import WelcomeScreen from './WelcomeScreen';
import NotConnectedScreen from './NotConnectedScreen';

import {NetworkContext} from '../context';
import { SvgXml } from 'react-native-svg';
import { Image ,View} from 'react-native';

const Stack = createStackNavigator();
/* ------------------------------- Main Stack ------------------------------- */
// export default () => {
const Screens = React.forwardRef((props, ref) => {

  const [isConnected] = React.useContext(NetworkContext);

  return isConnected ? (
    <NavigationContainer ref={ref}>
      <Stack.Navigator
        initialRouteName="LoadingScreen"
        screenOptions={({navigation}) => ({
          headerLeft: () => <HeaderLeftBack navigation={navigation} />,
          headerRight: () => <HeaderRightCart navigation={navigation} />,
          // headerTitle: ()=> <Image  resizeMode='contain' source={require('../assets/logo-1.png')} />,
          headerTitleAlign:'center'
        })}>
        <Stack.Screen
          name="LoadingScreen"
          component={LoadingScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="WelcomeScreen"
          component={WelcomeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={({navigation}) => ({
            headerLeft: () => <HeaderLeftDrawer navigation={navigation} />,
            headerTitle:()=> <Image  resizeMode='contain' source={require('../assets/logo-1.png')} />,
            headerTitleAlign:'left'
          })}
        />
        <Stack.Screen
          name="DrawerContent"
          component={DrawerContent}
          options={{
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            headerRight: null,
            headerTitle:()=> <Image  resizeMode='contain' source={require('../assets/logo-1.png')} />,
          }}
        />
        <Stack.Screen
          name="DrawerContentList"
          component={DrawerContentList}
          options={{
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            headerRight: null,
          }}
        />
        {/* <Stack.Screen name="Test" component={TestScreen} /> */}
        <Stack.Screen
          name="SignInScreen"
          component={SignInScreen}
          options={{
            headerRight: null,
            headerTitle: strings.Login
          }}
        />
        <Stack.Screen
          name="ForgotPasswordScreen"
          component={ForgotPasswordScreen}
          options={{
            headerRight: null,
            headerTitle:strings['Forgot Password']
          }}
        />
        <Stack.Screen
          name="SignUpScreen"
          component={SignUpScreen}
          options={{
            headerRight: null,
            headerTitle:strings.signUp
          }}
        />
        <Stack.Screen name="AllProductScreen" component={AllProductScreen} options={{
            headerTitleAlign: 'left',
            headerTitle:()=> <Image  resizeMode='contain' source={require('../assets/logo-1.png')} />,
          }} />
        <Stack.Screen
          name="CategoryListScreen"
          component={CategoryListScreen}
          options={{
            headerTitleAlign: 'left',
          }}
        />
        <Stack.Screen name="SearchScreen" component={SearchScreen} options={{
            headerTitleAlign: 'left',
            headerTitle:strings.search
          }}/>
        <Stack.Screen
          name="FilterScreen"
          component={FilterScreen}
          options={{
            headerRight: null,
            headerTitle:strings['Filter By']
          }}
        />
        <Stack.Screen
          name="SortScreen"
          component={SortScreen}
          options={{
            headerRight: null,
            headerTitle:strings['Sort by']
          }}
        />
        <Stack.Screen
          name="ProductDetailScreen"
          component={ProductDetailScreen}
          options={{
            headerTitleAlign: 'left',
            headerTitle:()=> <Image  resizeMode='contain' source={require('../assets/logo-1.png')} />
          }}
        />
         <Stack.Screen
          name="ProductImagesScreen"
          component={ProductImagesScreen}
          options={{
            headerRight: null,
          }}
        />
        <Stack.Screen
          name="CartScreen"
          component={CartScreen}
          options={{
            headerRight: null,
            headerTitle:strings.cart
          }}
        />
        <Stack.Screen
          name="CheckoutScreen"
          component={CheckoutScreen}
          options={{
            headerRight: null,
          }}
        />
        <Stack.Screen
          name="ConfirmBookingScreen"
          component={ConfirmBookingScreen}
          options={{
            headerRight: null,
            headerLeft:null,
            headerTitle:()=> <Image  resizeMode='contain' source={require('../assets/logo-1.png')} />
          }}
        />
        <Stack.Screen name="OrdersScreen" component={OrdersScreen} options={{
            headerTitleAlign: 'left',
            headerTitle:strings['My_Orders']
          }} />
        <Stack.Screen name="OrderDetailScreen" component={OrderDetailScreen} options={{
            headerTitleAlign: 'left',
            headerTitle:strings['Order Detail']
          }}/>
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{headerTitle:strings.profile}} />
        <Stack.Screen
          name="CompareProductScreen"
          component={CompareProductScreen}
        />
        <Stack.Screen name="AddressScreen" component={AddressScreen} options={{
          headerTitle:strings['address']
        }}/>
        <Stack.Screen name="AddressListScreen" component={AddressListScreen} options={{
          headerTitle:strings['Address Book']
        }} />
        <Stack.Screen name="LanguageScreen" component={LanguageScreen} options={{
          headerTitle:strings['Set Language']
        }}/>
        <Stack.Screen
          options={({
            route: {
              params: {title},
            },
          }) => ({
            headerTitle: title,
            title,
            headerTitleAlign: 'center',
          })}
          name={'WebViewScreen'}
          component={WebViewScreen}
        />
        <Stack.Screen name="AreaScreen" component={AreaScreen}  options={{
            headerRight: null,
            headerTitle:strings['Select Area']
          }}/>
        <Stack.Screen
          options={{headerShown: true,headerRight:null,headerTitleAlign:'center', 
          headerTitle:()=> <Image  resizeMode='contain' source={require('../assets/logo-1.png')} />
        }}
          name={'Hesabe'}
          component={HesabeWebView}
        />
        <Stack.Screen
          name="ShipmentScreen"
          component={ShipmentScreen}
          options={{
            headerRight: null,
            headerTitle: capitalizeFirstLetter(strings.shiping) 
          }}
        />
        <Stack.Screen
          name="PaymentScreen"
          component={PaymentScreen}
          options={{
            headerRight: null,
            headerTitle:strings['Secure Checkout']
          }}
        />
        <Stack.Screen
          name="ReviewScreen"
          component={ReviewScreen}
          options={{
            headerRight: null,
            headerTitle:strings['Add Review']
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  ) : (
    <NotConnectedScreen />
  );
});

export default Screens;
