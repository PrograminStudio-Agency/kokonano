import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SvgXml } from 'react-native-svg';
import { Button, CartItem, Separator, WhatsAppButton } from '../components';
import {
  APIManager,
  COLORS,
  showToast,
  strings,
  styles,
  SVG,
} from '../config';
import { AuthContext, CartContext, NetworkContext } from '../context';

const CartScreen = ({ navigation }) => {
  const [cart] = React.useContext(CartContext);
  const [userToken] = React.useContext(AuthContext);
  const [, setConnected] = React.useContext(NetworkContext);

  const [isLoading, setLoading] = React.useState();
  const [summary, setSummary] = React.useState({});
  const [coupon_code, set_coupon_code] = React.useState('');
  const [cartDetails, setCartDetails] = React.useState();
  const [selected_coupons, set_selected_coupons] = React.useState([]);
  const [applying_coupons, set_applying_coupons] = React.useState(false);
  const [discount_perProduct, set_discount_perProduct] = React.useState([]);
  const [price_loader, set_price_loader] = React.useState(true);
  const scrollRef = React.useRef();
  const [couponApplicableProducts, setCouponApplicableProducts] = React.useState([])
  const [couponDeniedProducts, setCouponDeniedProducts] = React.useState([])

  const updatePrice = async (load) => {
    try{
      if (!load) setLoading(true);
      const response = await new APIManager().getCart(cart);
      setCartDetails(response.data);
      const coupon = response.data.coupon?.length ? {code: response.data.coupon, type: 'coupon'} : null;
      const voucher = response.data.voucher?.length ? {code: response.data.voucher, type: 'voucher'} : null
      set_selected_coupons([coupon, voucher].filter(item=>item));
      var temp = {};
      response.data.totals?.map((item)=>{
        const key = item.title == 'Total' ? 'Grand Total' : item.title ;
        const value = item.value;
        temp = {...temp, [key.replace('-',' ')]: value};
      })
      setSummary(temp);
      set_applying_coupons(false);
      setLoading(false);
    }catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        set_applying_coupons(false);
        setLoading(false);
        console.error(err);
      }
    }
  };

  const verifyCoupon = async () => {
    if(coupon_code==""){
      alert("Please write coupon code")
      return
    }
    try {
      set_applying_coupons(true);
      
      // check if coupon already applied
      const filtered = selected_coupons?.filter(item=>item.code.includes(coupon_code));
      if (filtered.length){
        showToast(strings.Invalid_coupon, strings['Coupon Max Amount'], 'error');
        return set_applying_coupons(false);
      }

      const res = await new APIManager().verifyCoupon(coupon_code);
      if (res.error.length){
        showToast(strings.Invalid_coupon, res.error.join('\n'), 'error');
        return set_applying_coupons(false);
      }
      showToast('Applied', 'Coupon successfully applied');
      updatePrice(true)
    } catch (err) {
      showToast(strings.Invalid_coupon, strings.Error, 'error');
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        set_applying_coupons(false);
        console.error(err);
      }
    }
  };

  const removeCoupon = async (type) => {
    try{
      const res = await new APIManager().removeCoupon(type);
      if (res.success){
        updatePrice();
        showToast('Done', strings.coupon_removed_successfully);
      }else{
        showToast(strings.Error, strings.Error, 'error');
      }
    }
    catch(err){
      showToast(strings.Invalid_coupon, strings.Error, 'error');
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        console.error(err);
      }
    }
  }

  React.useEffect(() => {
    updatePrice();
  }, [cart]);


  if (!!cart.length) {
    return (
      <>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{...styles.cartScrollView, flexGrow: 1, paddingBottom:10}}
        >

          <View style={styles.cartProductView}>
            {cart?.map((item, index) => (
              <CartItem item={item} navigation={navigation} key={index} />
            ))}
          </View>

          <Text style={styles.detailInfoHeading}>{strings['Discount Code']}</Text>
          <View style={styles.cartCodeView}>
            <TextInput
              style={styles.cartTextInp}
              value={coupon_code}
              onChangeText={text => set_coupon_code(text)}
              onSubmitEditing={() => verifyCoupon()}
            />
            <Button
              text={strings['apply']}
              type={'primary'}
              isLoading={applying_coupons}
              onPress={() => verifyCoupon()}
              buttonContainerStyle={styles.cartCodeBtn}
            />
          </View>
          {selected_coupons.length > 0 ? (
            <>
              <Separator width={'100%'} />
              <Text style={styles.detailInfoHeading}>
                {strings['Apply_Coupon']}
              </Text>
              {selected_coupons.map((item, index) => (
                <View style={styles.detailAdditionalInfoView} key={index}>
                  <View style={{ flexGrow: 1, flexDirection: 'row' }}>
                    <Text style={styles.cartAdditionalInfoText}>
                      {item.code}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeCoupon(item.type)}>
                    <SvgXml xml={SVG.crossIcon} />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          ) : null}
          <Separator width={'100%'} />
          <Text style={styles.detailInfoHeading}>{strings['summary']}</Text>
          {isLoading ? (
            <ActivityIndicator
              size={'large'}
              color={COLORS.primary}
              style={{ marginVertical: 10 }}
            />
          ) : (
            Object.keys(summary).map((item, index) => (
              <View style={styles.detailAdditionalInfoView} key={index}>
                <Text style={styles.cartAdditionalInfoText}>{strings[item] ? strings[item] : item}</Text>
                <Text style={styles.detailAdditionalInfoText2}>
                  {Number.parseFloat(summary[item]).toFixed(2)} KWD
                </Text>
              </View>
            ))
          )}
          {
            isLoading ? null : <>
            <Separator width={'100%'} />
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <Button
                type={'primary'}
                text={strings['Checkout']}
                onPress={() => navigation.navigate('ShipmentScreen', { summary })}

              />
            </View>
            </>
          }
        </ScrollView>
        <WhatsAppButton />
      </>

    );

  }
  else {

    return (
      <View style={{ ...styles.cartScrollView, height: '100%' }}>
        <Text style={{color: 'black'}}>
          {strings['No Items Found']}
        </Text>
        <WhatsAppButton />
      </View>
    );
  }


};

export default CartScreen;
