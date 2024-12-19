import React from 'react';
import { Text, TouchableOpacity, View, Image } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { COLORS, strings, styles, SVG } from '../config';
import { CartSVGComponent } from '../config/svg';
import { CartContext } from '../context';

export const SmallButton = ({ text, onPress, icon, color }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      ...styles.smallBtnContainer,
      borderColor: !!color ? color : COLORS.dark,
    }}>
    {!!icon ? <SvgXml xml={icon} /> : null}
    <Text
      style={{
        color: !!color ? color : COLORS.dark,
        marginLeft: !!icon ? 5 : 0,
      }}>
      {text}
    </Text>
  </TouchableOpacity>
);

export const HeaderLeftBack = ({ navigation, onPress }) => (
  <TouchableOpacity
    style={{ ...styles.pv15, ...styles.ph10 }}
    onPress={onPress ? onPress : () => navigation.pop()}>
    <SvgXml xml={strings.getLanguage() === 'ar' ? SVG.backButtonFlipped : SVG.backButton} />
  </TouchableOpacity>
);

export const HeaderRightCart = ({ navigation }) => {
  const [cart] = React.useContext(CartContext);
  let cart_items = 0
  cart.forEach(item=>{
    cart_items = cart_items + item.quantity;
  })
  return (
    <View style={{ ...styles.homeHeader, marginRight: 0, paddingHorizontal: 5 }}>
      {/* <Text onPress={()=>navigation.navigate('LanguageScreen')}>Language</Text> */}
      <TouchableOpacity style={{marginTop:7}} onPress={()=>navigation.navigate('LanguageScreen')}>
      {strings.getLanguage() === 'en' ?
        <Image source={require('../assets/kuweit.png')} />
        :
        <Image source={require('../assets/uk.png')} />
      }
      </TouchableOpacity>
      <TouchableOpacity
        style={{ marginLeft: 10, paddingRight: 3 }}
        onPress={() => navigation.navigate('CartScreen')}>
        <CartSVGComponent items={!!cart ? (cart_items < 10 ? ' ' : '') + cart_items || ' 0' : ' 0'} />
      </TouchableOpacity>
    </View>
  )
};

export const HeaderLeftDrawer = ({ navigation }) => (
  <TouchableOpacity
    style={{ ...styles.pv15, ...styles.ph10 }}
    onPress={() => navigation.navigate('DrawerContent')}>
    <SvgXml xml={strings.getLanguage() === 'ar' ? SVG.drawerMenuIconFlipped : SVG.drawerMenuIcon} />
  </TouchableOpacity>
);

export const HeaderRightSort = ({ navigation }) => (
  <View style={styles.homeHeader}>
    <TouchableOpacity
      style={styles.marginLeft10}
      onPress={() => navigation.navigate('SortScreen')}>
      <SvgXml xml={SVG.filterIcon} />
    </TouchableOpacity>
  </View>
);

export const HeaderTitle = ({ navigation }) => (
  <View style={styles.headerTitleBtnContainer}>
    <SmallButton
      text={'Filter'}
      icon={SVG.filterHeader}
      onPress={() => navigation.navigate('FilterScreen')}
    />
    <SmallButton
      text={'Sort'}
      icon={SVG.sortHeader}
      onPress={() => navigation.navigate('SortScreen')}
    />
  </View>
);