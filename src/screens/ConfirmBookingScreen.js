import React from 'react';
import { Image, Text, View, ScrollView } from 'react-native';
import { Button } from '../components';
import { strings, styles } from '../config';

const ConfirmBookingScreen = ({ navigation, route }) => {
  const order = route.params.order;
  let cart_items = 0;
  order?.products?.forEach(item => {
    cart_items = cart_items + item.quantity
  })
  React.useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        if (e.data.action.type === "GO_BACK") {
          // Prevent default behavior of leaving the screen
          e.preventDefault();
        }

      }),
    [navigation]
  );
  

  return (
    <ScrollView contentContainerStyle={{flexGrow: 1}}>
      <View style={{ ...styles.confirmContainer, justifyContent: 'space-evenly', minHeight: '100%' }}>
        <Image source={require('../assets/like.png')} />
        <Text style={styles.confirmHeading}>{strings['Confirmation']}</Text>
        <Text style={styles.confirmThanks}>
          {strings['Your Order Has Been Placed']}
        </Text>
        <View style={styles.productsTableView}>
          <View style={styles.productRowView}>
            <Text style={{...styles.productNameColumn, color: 'black'}}>Product</Text>
            <View style={styles.qtyColumn}>
              <Text style={{color: 'black'}}>Qty</Text>
            </View>
            <View style={styles.totalsColumn}>
              <Text style={{color: 'black'}}>Total</Text>
            </View>
          </View>
          {order?.products?.map((item, index) => {
            return (
              <View key={index} style={styles.productRowView}>
                <Text style={{...styles.productNameColumn, color: 'black'}}>{item.name}</Text>
                <View style={styles.qtyColumn}>
                  <Text style={{color: 'black'}} >{item.quantity}</Text>
                </View>
                <View style={styles.totalsColumn}>
                  <Text style={{color: 'black'}} >{parseFloat(item.total.split('KD')[0]).toFixed(2)} KD</Text>
                </View>
              </View>
            );
          })}
          {
            order?.totals?.map((total, index)=>{
              return (
                <View style={{ ...styles.productRowView, borderBottomWidth: 0 }} key={index}>
                  <Text style={{ ...styles.productNameColumn, fontWeight: '900', color: 'black'  }}>{total.title}</Text>
                    <View style={styles.qtyColumn}>
                      {total.title != 'Total' ? null : <Text style={{ fontWeight: '900', color: 'black' }}>{cart_items}</Text>}
                    </View>
                  <View style={styles.totalsColumn}>
                    <Text style={{ fontWeight: '900', color: 'black' }}>{parseFloat(total.text.split('KD')[0]).toFixed(2)} KD</Text>
                  </View>
                </View>
              )
            })
          }
          
        </View>
        <Text style={styles.confirmOrderId}>
          {strings['Your Order Is']} #{order.order_id}
        </Text>
        <Text style={styles.confirmThanksLong}>
          {strings['thank_you_for_purchase']}
        </Text>
        <Button
          text={strings['Continue Shopping']}
          type={'secondary'}
          buttonContainerStyle={styles.confirmBtn}
          onPress={() =>
            navigation.reset({ index: 0, routes: [{ name: 'HomeScreen' }] })
          }
        />
      </View>
    </ScrollView>
  );
};

export default ConfirmBookingScreen;

