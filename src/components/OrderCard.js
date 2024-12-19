import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {
  COLORS,
  styles,
} from '../config';

const OrderCard = ({item, navigation, onPress}) => {
  const product_count = typeof item?.products == 'number' ? item?.products : item?.products.length;
  const status = item.status ? item.status : item.histories[item.histories?.length-1]?.status;
  return (
    <TouchableOpacity onPress={onPress ? onPress : ()=> navigation.navigate('OrderDetailScreen', {order_id: item.order_id})} style={styles.oderCardContainer}>
      <View>
        <Text style={{fontSize: 18, color: 'black'}}>
          {'Order No. #'}
          {item.order_id}
        </Text>
        <Text style={styles.orderCardDate}>
          {item.date_added}
        </Text>
        <View
          style={[
            styles.orderCardStatus,
            {backgroundColor: COLORS['status'][status]},
          ]}>
          <Text
            style={{
              color: 'white',
            }}>
            {status?.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={{alignItems: 'flex-end'}}>
        <Text style={{fontSize: 18, color: 'black'}}>{`${product_count}x ITEM${
          product_count === 1 ? '' : 'S'
        }`}</Text>
        <Text style={styles.orderCardPrice}>
          {Number.parseFloat(item.total).toFixed(2)} KWD
        </Text>
        
      </View>
    </TouchableOpacity>
  );
};

export default OrderCard;
