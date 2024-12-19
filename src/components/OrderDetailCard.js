import React from 'react';
import {Text, Image, View} from 'react-native';
import {styles} from '../config';

const OrderDetailCard = ({item}) => {
  const price = (obj) => obj.special ? (obj.special == obj.price ? obj.price : obj.special) : obj.price;
  return (
    <View style={styles.orderDetailCardContainer}>
      <View style={{flex: 1}}>
        <Image
          source={{uri: item.product.image}}
          style={styles.searchCardImage}
        />
      </View>
      <View style={styles.orderDetailCardTextContainer}>
        <Text style={{fontSize: 18, color: 'black'}} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={styles.orderDetailCardSmallText}>
          {`SKU: ${item.product.sku}`}
        </Text>
        <Text style={styles.orderDetailCardSmallText}>
          {`${item.quantity}x ITEMS`}
        </Text>
        <Text style={styles.orderDetailCardPriceText}>
          {Number.parseFloat(price(item)).toFixed(2)} KWD
        </Text>
      </View>
    </View>
  );
};

export default OrderDetailCard;
