import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  Alert,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Button, OrderCard, OrderDetailCard, Separator } from '../components';
import {
  APIManager,
  COLORS,
  paymentMethods,
  strings,
  styles,
  SVG,
  toTitleCase,
} from '../config';
import { CartContext, NetworkContext } from '../context';

const OrderDetailScreen = ({ navigation, route }) => {
  const [, setConnected] = React.useContext(NetworkContext);
  const order_id = route.params.order_id || '';
  const [isLoading, setLoading] = React.useState(true);
  const [order, setOrder] = React.useState()
  const [, , , , , , , addMultiple] = React.useContext(CartContext);
  const [line_items, setLine_items] = React.useState([
    {
      name: '',
      sku: '',
      quantity: '',
      total: '',
      product: {},
    },
  ]);
  const [summary, setSummary] = React.useState({});
  const [switch1, setSwitch1] = React.useState(false);
  const [switch2, setSwitch2] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState(paymentMethods[0]);
  const [shipping, setShipping] = React.useState();

  const confirmOrder = available => {
    addMultiple(available);
    navigation.navigate('CartScreen');
  };

  const reOrder = () => {
    try {
      // emptyCart();
      const available = [],
        unavailable = [];
      line_items.map(item => {
        if (item.product.stock_status == 'In Stock') {
          available.push({ item: item.product, quantity: item.quantity });
        } else {
          unavailable.push(item);
        }
      });
      if (unavailable.length > 0) {
        Alert.alert(
          strings['Following Items Not Available'],
          unavailable.map(item => item.product.name).join('\n'),
          [
            {
              text: 'Order Available',
              onPress: () => confirmOrder(available),
            },
            {
              text: 'Cancel',
              onPress: () => { },
            },
          ],
        );
      } else {
        confirmOrder(available);
      }
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        console.error(err);
      }
    }
  };

  const fetch = async (order) => {
    try {
      const lineItems = [];

      for (let i = 0; i < order.products?.length; i++) {
        const product = await new APIManager().getProduct( order.products[i].product_id);
        lineItems.push({
          ...order.products[i],
          product: product.data,
        });
      }
      setLine_items(lineItems);
      setPaymentMethod(
        order?.payment_method == 'Cash On Delivery' ? paymentMethods[0] :
        order?.payment_method?.toLowerCase()?.includes('knet') ? paymentMethods[2] : paymentMethods[1]
      );
      
      var temp = {};
      for (let i = 0; i < order.totals?.length; i++){
        const key = order.totals[i].title;
        const value = order.totals[i].value;
        temp = {...temp, [key]: value};
      }
      setSummary(temp);

      setLoading(false)
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        setLoading(false)
        console.error(err);
      }
    }
  };

  const fetchOrderDetail = async () => {
    try {
      const res = await new APIManager().getOrderDetail(order_id);
      setOrder(res.data);
      setShipping({
        [strings.name]: res.data.shipping_firstname + ' ' + res.data.shipping_lastname,
        [strings.Email]: res.data.email,
        [strings.Phone]: res.data.telephone,
        [strings.Area]: res.data.shipping_zone,
        [strings.Block]: res.data.shipping_address_1,
        [strings.street_address]: res.data.shipping_address_2,
        [strings.Postcode]: res.data.shipping_postcode,
        [strings.country]: res.data.shipping_country,
      })
      fetch(res.data);
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        setLoading(false);
        console.error(err);
      }
    }
  }


  React.useEffect(() => {
    async function loadData(){
      await fetchOrderDetail();
    }
    loadData();
  }, []);

  return (
    <View style={{ height: '100%', backgroundColor: 'white' }}>
      {isLoading ?
        <ActivityIndicator size={'large'} color={COLORS.primary} style={{marginTop:160}} />
        :
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{...styles.cartScrollView, flexGrow: 1}}>
          <View style={styles.cartProductView}>
            <OrderCard item={order} navigation={navigation} onPress={()=>{}} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '700', marginVertical: 10, color: 'black' }}>
            {strings.Items}
          </Text>
          {isLoading ? (
            <ActivityIndicator size={'large'} color={COLORS.primary} />
          ) : (
            line_items.map((item, index) => (
              <OrderDetailCard item={item} key={index} />
            ))
          )}

          <View style={styles.checkoutHiddenView}>
            <Text style={{ fontSize: 20, fontWeight: '700', marginVertical: 15, color: 'black'  }}>
              {strings.shipping_address}
            </Text>
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}
              onPress={() => setSwitch1(prevState => !prevState)}>
              <SvgXml xml={switch1 ? SVG.arrowIconUp : SVG.arrowIconDown} />
            </TouchableOpacity>
          </View>
          <Separator width={'100%'} />
          {switch1 ? (
            <>
              {Object.keys(shipping).map((item, index) => (
                <Text style={{ fontSize: 18, marginVertical: 5, color: 'black' }} key={index}>
                  <Text style={{ fontWeight: 'bold', color: 'black' }}>
                    {item}
                    {': '}
                  </Text>
                  {shipping[item]}
                </Text>
              ))}
              <Separator width={'100%'} />
            </>
          ) : null}

          <View style={styles.checkoutHiddenView}>
            <Text style={{ fontSize: 20, fontWeight: '700', marginVertical: 10, color: 'black' }}>
              {strings['summary']}
            </Text>
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}
              onPress={() => setSwitch2(prevState => !prevState)}>
              <SvgXml xml={switch2 ? SVG.arrowIconUp : SVG.arrowIconDown} />
            </TouchableOpacity>
          </View>

          {switch2 ? (
            <>
              {Object.keys(summary).map((item, index) => (
                <View style={styles.detailAdditionalInfoView} key={index}>
                  <Text style={styles.cartAdditionalInfoText}>
                    {toTitleCase(item.replace('_', ' '))}
                  </Text>
                  <Text style={styles.detailAdditionalInfoText2}>
                    {Number.parseFloat(summary[item]).toFixed(2)} KWD
                  </Text>
                </View>
              ))}
              <Separator width={'100%'} />
            </>
          ) : null}

          <Separator width={'100%'} />
          <Text style={{ fontSize: 20, fontWeight: '700', marginVertical: 10 }}>
            {strings['payment_method']}
          </Text>
          <View style={styles.paymentCardContainer}>
            <View style={styles.paymentCard}>
              <Text style={styles.orderDetailPaymentName}>
                {paymentMethod.name}
              </Text>
              <Image source={paymentMethod.image} />
            </View>
            <Text style={styles.detailShortDescText}>
              {paymentMethod.short_description}
            </Text>
          </View>
          <View style={{flex: 1, justifyContent: 'flex-end',}}>
            <Button
              text={strings.reorder}
              onPress={() => reOrder()}
              type={'secondary'}
            />
          </View>
        </ScrollView>
      }
    </View>
  );
};

export default OrderDetailScreen;
