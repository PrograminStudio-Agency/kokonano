import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Separator } from '../components';
import { APIManager, COLORS, strings, styles, SVG } from '../config';

const AreaScreen = ({ navigation, route }) => {
  const [isLoading, setLoading] = React.useState(true);
  const [areas, setAreas] = React.useState();
  const [searchText, setSearchText] = React.useState('');

  const fetchAreas = async () => {
    const response = await new APIManager().getZones(114);
    setAreas(response.data.zone);
  };

  const onGoBack = area => {
    const screen = route?.params?.screen || 'CheckoutScreen';
    navigation.navigate('AddressScreen', {
      area: area,
      // zone: zone,
      mode: route?.params?.mode,
    });
  };

  React.useEffect(() => {
    fetchAreas().finally(() => setLoading(false));
  }, []);

  return isLoading ? (
    <View style={styles.centerContainer}>
      <ActivityIndicator size={'large'} color={COLORS.primary} />
    </View>
  ) : (
    <View style={{ ...styles.areaContainer, paddingBottom: 30 }}>
      {/* ------------------------------- Search Bar ------------------------------- */}
      <View style={{ ...styles.homeSearchBar, width: '100%' }}>
        <SvgXml xml={SVG.searchIcon} style={{ marginHorizontal: 10 }} />
        <TextInput
          placeholder={strings['Search Your Area']}
          placeholderTextColor={COLORS.placeholder}
          style={{...styles.searchBarText}}
          returnKeyType={'search'}
          onChangeText={text => {
              setSearchText(text)
            }
          }
          autoCorrect={false}
        />
      </View>
      <FlatList
        data={areas.filter(area=>(area.name.toLowerCase()).includes(searchText.toLowerCase()))}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            key={index}
            onPress={() => onGoBack(item)}
            style={{ borderBottomWidth: 1, paddingVertical:10, borderColor:'#ccc' }}
          >
            <Text style={styles.filterItemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index}
        showsVerticalScrollIndicator={true}
        ListEmptyComponent={() => (
          <View style={styles.isLoadingMoreIndicator}>
            <Text style={{ fontStyle: 'italic' }}>
              {strings['No Items Found']}
            </Text>
          </View>
        )}
      />
    </View>
  );
};
export default AreaScreen;