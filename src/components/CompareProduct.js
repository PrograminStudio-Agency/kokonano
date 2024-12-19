import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {strings, styles, SVG} from '../config';
import {CompareContext} from '../context';

const CompareProduct = ({navigation}) => {
  const [products, , removeAll] = React.useContext(CompareContext);

  return products.length >= 1 ? (
    <View style={styles.compareView}>
      <TouchableOpacity
        onPress={() => navigation.navigate('CompareProductScreen')}>
        <Text style={styles.compareText}>
          {products.length} {strings[`Item${products.length === 1 ? '' : 's'}`]}{' '}
          {strings[`Selected for Comparison`]}
        </Text>
      </TouchableOpacity>
      <SvgXml xml={SVG.crossIcon} onPress={() => removeAll()} />
    </View>
  ) : null;
};

export default CompareProduct;
