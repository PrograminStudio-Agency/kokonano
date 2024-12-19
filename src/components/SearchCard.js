import React from 'react';
import {Text, Image, TouchableOpacity, View} from 'react-native';
import {price, strings, styles} from '../config';
import { CartContext } from '../context';

const SearchCard = ({item, navigation}) => {
  const [, addCart] = React.useContext(CartContext);

  const inStock = item.quantity;
  const stockStyle = inStock != 0 ? null : {position: 'absolute'};

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('ProductDetailScreen', {product: item})
      }
      style={styles.searchCardContainer}>
      <View style={styles.searchCardImageView}>
        <Image
          source={{ uri: item.image, }}
          style={{...styles.searchCardImage, ...stockStyle}}
        />
        {/* SOLD OUT CONTAINER */}
        {
          item.quantity != 0 ? null :
          <View style={styles.productCardImage}>
            <Image source={require('../assets/out-of-stock.png')} style={{...styles.productCardImage, resizeMode: 'contain'}} />
          </View>
        }
      </View>
      <View style={styles.searchCardTextView}>
        <View>
          <Text style={{...styles.searchCardText, color: 'black'}} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.searchCardPrice}>
            {Number.parseFloat(price(item)).toFixed(2)} KWD
          </Text>
        </View>
        {
          !inStock ? null :
          <TouchableOpacity style={styles.searchCardBtn} onPress={() => addCart(item)}>
            <Text style={styles.primaryBtnText14}>{strings['Add to Cart']}</Text>
          </TouchableOpacity>
        }
      </View>
    </TouchableOpacity>
  );
};

export default SearchCard;
