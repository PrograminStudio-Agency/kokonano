import React from 'react';
import {Image, ScrollView, Text, View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {Button, Separator} from '../components';
import {filterProduct, removeTags, strings, styles, SVG} from '../config';
import {CompareContext} from '../context';

const CompareProductScreen = ({navigation}) => {
  const [products, setProduct] = React.useContext(CompareContext);
  const compare_keys = ['sku', 'description'];
  const price = (obj) => obj.special ? (obj.special == obj.price ? obj.price : obj.special) : obj.price

  const CompareCard = ({item}) => (
    <View style={styles.compareCard}>
      <SvgXml
        xml={SVG.crossIcon}
        onPress={() => setProduct(item)}
        style={{position: 'absolute', right: 10, top: 20, zIndex: 3}}
      />
      <Image source={{uri: item.thumb ? item.thumb : item.image}} style={styles.compareImage} />
      <Text style={styles.comparePrice}>
        {Number.parseFloat(price(item)).toFixed(2)} KWD
      </Text>
      <Text style={styles.compareName} numberOfLines={2}>
        { filterProduct(item).name}
      </Text>
      <Button
        text={strings['View Product']}
        type={'primary'}
        buttonContainerStyle={styles.compareBtn}
        onPress={() =>
          navigation.navigate('ProductDetailScreen', {product: item})
        }
      />
    </View>
  );

  const AddItem = ({navigation}) => (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Button
        text={'Add Item'}
        type={'primary'}
        onPress={() => navigation.goBack()}
      />
    </View>
  );

  return (
    <ScrollView style={styles.allProductScrollView}>
      <View style={styles.compareCardContainer}>
        {!!products[0] ? (
          <CompareCard item={products[0]} />
        ) : (
          <AddItem navigation={navigation} />
        )}
        {!!products[1] ? (
          <CompareCard item={products[1]} />
        ) : (
          <AddItem navigation={navigation} />
        )}
      </View>
      {compare_keys.map((key, index) => (
        <View key={index}>
          <Separator />
          <Text style={styles.compareHeading}>
            {!!strings[key] ? strings[key] : key}
          </Text>
          <View style={styles.compareTextContainer}>
            <Text style={styles.compareTextLeft}>
              {products.length >= 1 ? removeTags(products[0][key]) : 'N/A'}
            </Text>
            <Text style={styles.compareTextRight}>
              {products.length === 2 ? removeTags(products[1][key]) : 'N/A'}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default CompareProductScreen;
