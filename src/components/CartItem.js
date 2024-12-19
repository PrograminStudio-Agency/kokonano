import React from 'react';
import { Text, Image, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { price, styles, SVG } from '../config';
import { CartContext } from '../context';

const CartItem = ({ item, navigation }) => {
  const [, , removeCart, incrementCart, decrementCart] =
    React.useContext(CartContext);
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('ProductDetailScreen', { product: item })
      }
      style={styles.cartItemContainer}>
      <View style={styles.searchCardImageView}>
        <Image
          source={{
            uri: item.thumb ? item.thumb : item.image,
          }}
          style={styles.searchCardImage}
        />
      </View>
      <View style={styles.searchCardTextView}>
        <View>
          <View style={styles.cartItemTextContainer}>
            <Text style={styles.cartItemNameText} numberOfLines={2}>
              {item.name}
            </Text>
            <TouchableOpacity onPress={() => removeCart(item)} style={{paddingHorizontal:10,paddingTop:4}}>
              <SvgXml xml={SVG.crossIcon} />
            </TouchableOpacity>
          </View>
          <Text style={styles.cartItemPriceText}>
            {Number.parseFloat(price(item)).toFixed(2)} KWD
          </Text>
        </View>
        <View style={styles.cartItemQuantityContainer}>
          <Text
            onPress={() => {
              item.quantity <= 1 ? null : decrementCart(item);
            }}
            style={styles.cartItemQuantityText}>
            -
          </Text>
          <Text style={styles.cartItemQuantityText}>{item.quantity}</Text>
          <Text
            onPress={() => {
              incrementCart(item);
            }}
            style={styles.cartItemQuantityText}>
            +
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CartItem;
