import React from 'react';
import {ScrollView, TouchableOpacity, View, Text} from 'react-native';
import {strings, styles} from '../config';
import {HeaderLeftBack} from '../components';

const SortScreen = ({navigation, route}) => {
  React.useEffect(() => {}, []);
  const sortOptions = [
    {
      label: strings["Sort by default"],
      value: "",
    },
    {
      label: strings["Sort by Popularity"],
      value: {sort: "model", order: "desc"},
    },
    {
      label: strings["Sort by Average Rating"],
      value: {sort: "rating", order: "desc"},
    },
    {
      label: strings["Sort by Price Low"],
      value: {sort: "price", order: "asc"},
    },
    {
      label: strings["Sort by Price High"],
      value: {sort: "price", order: "desc"},
    },
  ];
  const goBack = (value) => {
    const screen = route?.params?.screen || 'CategoryListScreen';
    navigation.navigate('CategoryListScreen', {sort: value});
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeftBack navigation={navigation} onPress={() => goBack(undefined)} />
    });
  }, [navigation, route]);

  return (
    <View style={{backgroundColor: 'white', flex: 1}}>
      <ScrollView contentContainerStyle={{paddingHorizontal: 15, flexGrow: 1}}>
        {sortOptions.map((item, i) => (
          <TouchableOpacity
            onPress={() => goBack(item.value)}
            key={i}
            style={styles.filterItemContainer}>
            <Text style={styles.filterItemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
export default SortScreen;