import MultiSlider from '@ptomasroos/react-native-multi-slider';
import React from 'react';
import {Text, TouchableOpacity, useWindowDimensions, View} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {SvgXml} from 'react-native-svg';
import {Button, Separator, HeaderLeftBack} from '../components';

import {COLORS, strings, styles, SVG} from '../config';

const FilterScreen = ({navigation, route}) => {

  const [onSale, setOnSale] = React.useState(
    !!route?.params?.states?.sale ? route.params.states.sale : null,
  );
  const maxPrice = !!route?.params?.maxPrice ? route.params.maxPrice : 10000;
  
  const prev_values = route.params?.states?.values;
  const [values, setValues] = React.useState(!!route?.params?.states?.values ? route.params.states.values : [0, maxPrice]);

  const onGoBack = (comingFrom) => {
    if (route.params?.states && (values[0] == prev_values[0] && values[1] == prev_values[1])){
      navigation.navigate('CategoryListScreen', {
        filters: undefined,
        states: {sale: onSale, values: values},
        comingFrom: comingFrom
      });
      return;
    }

    const filters = [];
    if (values[0] !== 0) {
      filters.push({
        field: "price",
        operand: ">=",
        value: `${values[0]}`,
        logical_operand: "and"
      })
    }

    if (values[1] !== maxPrice) {
      filters.push({
        field: "price",
        operand: "<=",
        value: `${values[1]}`,
        logical_operand: "and"
      })
    }

    // if (onSale !== null) {
    //   filters += `&on_sale=${onSale}`;
    // }
    navigation.navigate('CategoryListScreen', {
      filters: filters,
      states: {sale: onSale, values: values},
      comingFrom: comingFrom
    });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeftBack navigation={navigation} onPress={()=>onGoBack('backBtn')} />
    });
  }, [navigation, route, values]);

  return (
    <ScrollView contentContainerStyle={{flexGrow: 1}}>
      <View style={{...styles.filterScreenContainer, flex: 1}}>
        <Separator
          width={'100%'}
          color={COLORS.filterSeparator}
          borderTopWidth={0.5}
        />
        <Text style={styles.filterText}>{strings['price']}</Text>
        <View style={styles.filterSliderContainer}>
          <Text style={styles.filterSliderText}>{values[0]} KWD</Text>
          <MultiSlider
            values={values}
            onValuesChange={newValues => setValues(newValues)}
            min={0}
            max={maxPrice}
            step={1}
            markerStyle={{backgroundColor: COLORS.secondary}}
            trackStyle={{backgroundColor: COLORS.secondaryLowOpacity}}
            selectedStyle={{backgroundColor: COLORS.secondary}}
            sliderLength={useWindowDimensions().width * 0.4}
            snapped
          />
          <Text style={styles.filterSliderText}>{values[1]} KWD</Text>
        </View>
        <Separator
          width={'100%'}
          color={COLORS.filterSeparator}
          borderTopWidth={0.5}
        />
        <Text style={styles.filterText}>{strings['Sale']}</Text>
        <Separator
          width={'100%'}
          color={COLORS.filterSeparator}
          borderTopWidth={0.5}
        />
        <TouchableOpacity
          onPress={() => (onSale ? setOnSale(null) : setOnSale(true))}
          style={styles.filterItemContainer}>
          <Text style={styles.filterItemText}>{strings['Yes']}</Text>
          <SvgXml xml={onSale ? SVG.selectBullet : SVG.notSelectBullet} />
        </TouchableOpacity>
        <Separator
          width={'100%'}
          color={COLORS.filterSeparator}
          borderTopWidth={0.5}
        />
        <TouchableOpacity
          onPress={() => (onSale === false ? setOnSale(null) : setOnSale(false))}
          style={styles.filterItemContainer}>
          <Text style={styles.filterItemText}>{strings['No']}</Text>
          <SvgXml
            xml={onSale === false ? SVG.selectBullet : SVG.notSelectBullet}
          />
        </TouchableOpacity>
        <View style={{flex: 1, justifyContent: 'flex-end',}}>
          <Button
            text={strings['apply']}
            onPress={() => onGoBack('applyBtn')}
            type="secondary"
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default FilterScreen;
