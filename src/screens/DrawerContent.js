import React from 'react';
import {
  Image,
  Text,
  ScrollView,
  View,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import {
  Button,
  DrawerListHeader,
  DrawerListItem,
  Separator,
} from '../components';
import { APIManager, COLORS, strings, styles, SVG, showToast } from '../config';
import { AuthContext, LanguageContext, NetworkContext } from '../context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/api/config';
import { TouchableOpacity } from 'react-native-gesture-handler';

const DrawerContent = ({ navigation }) => {
  const [, setConnected] = React.useContext(NetworkContext);
  const [userToken, , signOut] = React.useContext(AuthContext);
  const [language] = React.useContext(LanguageContext);

  const [mainList, setMainList] = React.useState([]);
  const [isLoading, setLoading] = React.useState(true);
  const [isLogout, setLogout] = React.useState(false);
  const [isDeleteing, setIsDeleteing] = React.useState(false);

  const [accountList] = React.useState([
    {
      iconSVG: SVG.accountInfoIcon,
      text: strings['Account Information'],
      onPress: () => navigation.navigate('ProfileScreen'),
      onArrowPress: () => navigation.navigate('ProfileScreen'),
    },
    {
      iconSVG: SVG.heartIcon,
      text: strings['WishList'],
      onPress: () =>
        navigation.navigate('AllProductScreen', {
          title: 'Wishlist',
          slug: 'wishlist',
        }),
      onArrowPress: () =>
        navigation.navigate('AllProductScreen', {
          title: 'Wishlist',
          slug: 'wishlist',
        }),
    },
    {
      iconSVG: SVG.bookIcon,
      text: strings['Orders'],
      onPress: () => navigation.navigate('OrdersScreen'),
      onArrowPress: () => navigation.navigate('OrdersScreen'),
    },
    {
      iconSVG: SVG.compareIconWhite,
      text: strings['Compare Products'],
      onPress: () => navigation.navigate('CompareProductScreen'),
      onArrowPress: () => navigation.navigate('CompareProductScreen'),
    },
    {
      iconSVG: SVG.addressBookIcon,
      text: strings['Address Book'],
      onPress: () => navigation.navigate('AddressListScreen'),
      onArrowPress: () => navigation.navigate('AddressListScreen'),
    },
    {
      iconSVG: SVG.addressBookIcon,
      text: strings['Delete My Account'],
      onPress: () => deleteAccount(),
      onArrowPress: () => deleteAccount(),
    },
  ]);
  const [showAccount, setShowAccount] = React.useState(false);

  const [preferencesList] = React.useState([
    {
      text: language === 'ar' ? 'اللغة - عربي' : 'Language - English',
      onPress: () => navigation.navigate('LanguageScreen'),
      onArrowPress: () => navigation.navigate('LanguageScreen'),
    },
    // {
    //   text: strings['Currency - $ US Dollar'],
    //   onPress: () => navigation.navigate('TestScreen'),
    //   onArrowPress: () => navigation.navigate('TestScreen'),
    // },
    // {
    //   text: strings['Settings'],
    //   onPress: () => navigation.navigate('TestScreen'),
    //   onArrowPress: () => navigation.navigate('TestScreen'),
    // },
  ]);
  const [showPreferences, setShowPreferences] = React.useState(false);

  const [otherList] = React.useState([
    {
      text: strings['Privacy Policy'],
      onPress: () =>
        navigation.navigate('WebViewScreen', {
          title: strings['Privacy Policy'],
          id: 3954,
          url: 'https://kokonano.com/privacy/'
        }),
    },
    {
      text: strings['About Us'],
      onPress: () =>
        navigation.navigate('WebViewScreen', {
          title: strings['About Us'],
          id: 4005800,
          url: 'https://kokonano.com/about-kokonano'
        }),
    },
    {
      text: strings['Return Policy'],
      onPress: () =>
        navigation.navigate('WebViewScreen', {
          title: strings['Return Policy'],
          id: 4015907,
          url: 'https://kokonano.com/terms'
        }),
    },
    {
      text: strings['Delivery Policy'],
      onPress: () =>
        navigation.navigate('WebViewScreen', {
          title: strings['Delivery Policy'],
          id: 4064300,
          url: 'https://kokonano.com/delivery'
        }),
    },
    {
      text: strings['Chat on WhatsApp'],
      onPress: () => {
        const url = 'whatsapp://send?phone=96550240403';
        Linking.openURL(url)
          .then(() => { })
          .catch(() => {
            Alert.alert('Make sure WhatsApp installed on your device'); //<---Error
          });
      },
      // iconSVG: SVG.drawerWhatsApp,
    },
    {
      text: strings['Contact Us'],
      onPress: () =>
        navigation.navigate('WebViewScreen', {
          title: strings['Contact Us'],
          id: 4064300,
          url: 'https://kokonano.com/information-contact'
        }),
    },
  ]);
  const [showOtherList, setShowOtherList] = React.useState(false);

  const deleteAccount =  () => {
    Alert.alert(
      strings['Delete Account'],
      strings['Delete_confirm'],
      [
        {
          text: strings.Yes,
          onPress: async() => {
            setIsDeleteing(true);
             await logout();
             Alert.alert(
              strings['ACCOUNT_DELETED'],
              strings['deleted_account_recovery'],)
            setIsDeleteing(false);
          },
          style:'destructive'
        },
        {
          text: strings.Cancel,
          onPress: () => { },
          style: 'cancel'
        }
      ]
    );
    
  }
  const logout = async () => {
    setLogout(true);
    if (!!userToken) {
      try{
        const response = await new APIManager().userLogout();
        if (!response.success){
          alert('Unable to logout');
          return;
        }
        signOut();
        navigation.pop();
      }catch (err) {
        if (err.message.includes('Network')) {
          setConnected(false);
          return;
        } else {
          setLogout(false);
          console.error(err);
        }
      }
    } else {
      navigation.navigate('SignInScreen', { isGoBack: true });
    }
    setLogout(false);
  };

  const fetchMainList = async () => {
    try {
      const res = JSON.parse(await AsyncStorage.getItem('categories'));
      const resFilter = res.filter(item => item.status && item.parent_id === 0);
      setMainList(
        resFilter.map((item,index) => ({
          iconSVG: item.image == config.no_image ? null : item.image,
          text: item.name.replace('&amp;', '&'),
          onPress: () => navigation.replace('CategoryListScreen', { item: item }),
          id: item.id,
          hasChildren: true,
          navigation: navigation,
          index:index
          // onArrowPress: () => navigation.navigate('DrawerContentList', { item: item }),
        })),
      );
      setLoading(false)
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

  React.useEffect(() => {
    fetchMainList();
  }, []);
  return (
    isDeleteing? <ActivityIndicator size={'large'} color={COLORS.secondary} style={{height:'100%'}} />:
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: 'white'}}>
      {/* Profile Container */}
      {
        !userToken ? null :
        <TouchableOpacity style={styles.drawerProfileContainer} onPress={() => navigation.navigate('ProfileScreen')}>
          <View>
            <Image
              source={
                !!userToken?.avatar_url
                  ? { uri: userToken?.avatar_url }
                  : require('../assets/person_image_placeholder.jpg')
              }
              style={styles.drawerProfileImage}
            />
          </View>
          <View style={styles.drawerProfileInfoContainer}>
            <Text style={{ fontSize: 18, textAlign: 'left', color: 'black' }} numberOfLines={1}>
              {userToken?.firstname ? userToken?.firstname : userToken?.first_name } {userToken?.lastname ? userToken?.lastname : userToken?.last_name }
            </Text>
            <Text style={{ fontSize: 14, textAlign: 'left', color: 'black' }} numberOfLines={1}>
              {userToken?.email}
            </Text>
          </View>
        </TouchableOpacity>
      }
      {/* Separator */}
      <Separator />
      {/* Main List */}
      <Text style={{...styles.drawerListHeaderText,marginLeft:10,marginVertical:10}}>{strings.Categories}</Text>
      {isLoading ? (
        <View style={styles.activityIndicator}>
          <ActivityIndicator size={'large'} color={COLORS.secondary} />
        </View>
      ) : mainList.length <= 0 ? (
        <View>
          <Text>{strings['No Items Found']}</Text>
        </View>
      ) : (
        mainList.map((item, index) => <DrawerListItem {...item} key={index} length={mainList.length}/>)
      )}
      {/* Separator */}
      <Separator />
      {userToken ? (
        <>
          {/* Account List */}
          <DrawerListHeader
            heading={strings['account']}
            state={showAccount}
            setState={setShowAccount}
          />
          <View
            style={{
              display: showAccount ? 'flex' : 'none',
            }}>
            {accountList.map((item, index) => (
              <DrawerListItem {...item} key={index} />
            ))}
          </View>
          {/* Separator */}
          <Separator />
        </>
      ) : null}
      {/* Preferences */}
      <DrawerListHeader
        heading={strings['Preferences']}
        state={showPreferences}
        setState={setShowPreferences}
      />
      <View
        style={{
          display: showPreferences ? 'flex' : 'none',
        }}>
        {preferencesList.map((item, index, list) => (
          <DrawerListItem
            {...item}
            showSeparator={index !== list.length - 1}
            key={index}
          />
        ))}
      </View>
      {/* Separator */}
      <Separator />
      {/* Others */}
      <DrawerListHeader
        heading={strings['Others']}
        state={showOtherList}
        setState={setShowOtherList}
      />
      <View
        style={{
          display: showOtherList ? 'flex' : 'none',
        }}>
        {otherList.map((item, index, list) => (
          <DrawerListItem
            {...item}
            showSeparator={index !== list.length - 1}
            key={index}
          />
        ))}
      </View>
      
      {/* Logout Button */}
      {
        <Button
          type={'secondary'}
          text={!!userToken ? strings['Logout'] : strings['Login']}
          onPress={logout}
          isLoading={isLogout}
        />
        
      }
      {/* Empty view for Padding Bottom, ScrollView was not appying padding */}
      <View style={{marginBottom:25}}></View> 
    </ScrollView>
    
  );
};

export default DrawerContent;
