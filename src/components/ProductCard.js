import React from 'react';
import { Text, Image, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { COLORS, styles, SVG } from '../config';
import {
  AuthContext,
  CartContext,
  CompareContext,
  WishlistContext,
} from '../context';

export const SVGwithCircle = ({ xml, onPress, bgColor, size }) => (
  <TouchableOpacity
    style={{
      ...styles.productCardSVG,
      ...styles.shadowView,
      backgroundColor: !!bgColor ? bgColor : 'white',
      width: !!size ? size : 20,
      height: !!size ? size : 20,
      borderRadius: !!size ? size : 20,
    }}
    onPress={onPress}>
    <SvgXml xml={xml} />
  </TouchableOpacity>
);

export const ProductCard = ({ item, navigation }) => {
  const [userToken] = React.useContext(AuthContext);
  const [, addCart] = React.useContext(CartContext);
  const [wishlist, addWishlist] = React.useContext(WishlistContext);
  const [products, setProduct] = React.useContext(CompareContext);

  const inStock = item.quantity ;
  const stockStyle = inStock != 0  ? null : {position: 'absolute'};
  const image_source = !!item?.thumb
      ? { uri: item.thumb }
      : !!item?.image 
        ? { uri: item.image } 
        : require('../assets/image_placeholder.png');
  const price = (obj) => obj.special ? (obj.special == obj.price ? obj.price : obj.special) : obj.price;
  return (
    <View
      style={{
        ...styles.productCardView,
        // ...styles.shadowView,
      }}>
      <View style={styles.productCardSVGView}>
        <SVGwithCircle
          xml={
            products.findIndex(obj => item.product_id === obj.product_id) === -1
              ? SVG.compareIcon
              : SVG.compareSelected
          }
          bgColor={
            products.findIndex(obj => item.product_id === obj.product_id) === -1
              ? 'white'
              : COLORS.secondary
          }
          onPress={() => setProduct(item, navigation)}
        />
        {userToken ? (
          <SVGwithCircle
            xml={
              wishlist.findIndex(obj => obj.product_id === item.product_id) !== -1
                ? SVG.heartCardSelected
                : SVG.heartCard
            }
            onPress={() => addWishlist(item)}
          />
        ) : null}
      </View>
      <TouchableOpacity
        style={styles.productCardImageView}
        onPress={() =>
          navigation.push('ProductDetailScreen', { product: item })
        }>
        <Image source={image_source} style={{...styles.productCardImage, ...stockStyle}} />
        {/* SOLD OUT CONTAINER */}
        {
          item.quantity != 0 ? null :
          <View style={styles.productCardImage}>
            <Image source={require('../assets/out-of-stock.png')} style={{...styles.productCardImage, resizeMode: 'contain'}} />
          </View>
        }
      </TouchableOpacity>
      <View style={styles.productCardInfoView}>
        <Text
          style={{
            textAlign: 'left',
            color:
              isNaN(Number.parseFloat(item.special)) ||
                item.special == item.price || item.special == 0
                ? 'white'
                : COLORS.placeholder,
            textDecorationLine: 'line-through',
          }}>
          {Number.parseFloat(item.price).toFixed(2)} KWD
        </Text>

        <TouchableOpacity
          onPress={() =>
            navigation.push('ProductDetailScreen', { product: item })
          }
          style={styles.flexRowCenter}>
          <Text style={styles.productCardPrice}>
            {Number.parseFloat(price(item)).toFixed(2)} KWD
          </Text>
          <View style={styles.flexRowHeight}>
            <SvgXml xml={SVG.starIcon} />
            <Text style={styles.productCardRating}>{item.average_rating}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.productCardInfoViewContainer}>
          <Text
            onPress={() =>
              navigation.push('ProductDetailScreen', { product: item })
            } style={styles.productCardName} numberOfLines={2}>
            {item.name}
          </Text>
          {
            !inStock ? null :
            <TouchableOpacity
              style={styles.productCardShoppingBag}
              onPress={() => addCart(item)}>
              <SvgXml xml={SVG.shoppingBag} />
            </TouchableOpacity>
          }
        </View>
      </View>
    </View>
  );
};
