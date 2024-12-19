import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {FeaturedCategory, SearchCard} from '../components';
import {
  COLORS,
  sampleProduct,
  strings,
  styles,
  SVG,
  APIManager,
} from '../config';
import {NetworkContext} from '../context';

const SearchScreen = ({navigation, route}) => {
  const [, setConnected] = React.useContext(NetworkContext);
  const [products, setProducts] = React.useState([]);
  const [isLoading, setLoading] = React.useState(true);
  const [searchText, setSearchText] = React.useState(
    route?.params?.searchText || '',
  );
  const [page, setPage] = React.useState(1);
  const [isLoadingMore, setLoadingMore] = React.useState(false);
  const limit = 20;
  const [hasMore, setMore] = React.useState(true);

  const searchProducts = async query => {
    try {
      const search = !!query ? query : searchText;
      if (!search) {
        setProducts([]);
        return;
      }
      const filter = {
        filters:[
          {
            field:"name",
            operand:"like",
            value:searchText.toLowerCase()
          }
        ]
      };
      const res = await new APIManager().getProductWithFilter(filter,1,limit);
      setProducts(res.data);
      setPage(2);
      setMore(res.data.length >= limit);
      setLoading(false);
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        setLoading(false);
        console.error(err);
      }
    }
  };

  React.useEffect(() => {
    searchProducts();
  }, []);

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const onScroll = async ({nativeEvent}) => {
    if (isCloseToBottom(nativeEvent) && !isLoadingMore && hasMore) {
      setLoadingMore(true);
      try {
        const filter = {
          filters:[
            {
              field:"name",
              operand:"like",
              value:searchText
            }
          ]
        };
        const res = await new APIManager().getProductWithFilter(filter, page, limit);
        setProducts(prevProducts => [...prevProducts, ...res.data]);
        setPage(prevPage => prevPage + 1);
        setMore(res.data.length >= limit);
        setLoadingMore(false);
      } catch (err) {
        if (err.message.includes('Network')) {
          setConnected(false);
          return;
        } else {
          console.error(err);
          setLoadingMore(false);
        }
      }
    }
  };

  return (
    <SafeAreaView style={{backgroundColor: 'white', height: '100%'}}>
      <ScrollView
        onScroll={onScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.homeScrollView}>
        {/* ------------------------------- Search Bar ------------------------------- */}
        <View style={styles.homeSearchBar}>
          <SvgXml
            xml={SVG.searchIcon}
            style={{marginHorizontal: 10}}
            onPress={() => {
              setLoading(true);
              searchProducts().finally(() => setLoading(false));
            }}
          />
          <TextInput
            placeholder={strings['Search Your Product']}
            placeholderTextColor={COLORS.placeholder}
            style={styles.searchBarText}
            returnKeyType={'search'}
            value={searchText}
            onChangeText={text => setSearchText(text)}
            onSubmitEditing={e => {
              const value = e?.nativeEvent?.text;
              setLoading(true);
              searchProducts(value).finally(() => setLoading(false));
            }}
          />
        </View>
        <FeaturedCategory navigation={navigation} />
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size={'large'} color={COLORS.primary} />
          </View>
        ) : products.length <= 0 ? (
          <View>
            <Text style={{fontStyle: 'italic', marginVertical: 10}}>
              {strings['No Items Found']}
            </Text>
          </View>
        ) : (
          <View style={styles.searchProductView}>
            {products.map((item, index) => (
              <SearchCard item={item} key={index} navigation={navigation} />
            ))}
          </View>
        )}
        {isLoadingMore ? (
          <View style={styles.isLoadingMoreIndicator}>
            <ActivityIndicator size={'large'} color={COLORS.secondary} />
          </View>
        ) : null}
        {!hasMore && products.length > 0 ? (
          <View style={styles.isLoadingMoreIndicator}>
            <Text style={{fontStyle: 'italic'}}>
              {strings['No More Items']}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SearchScreen;
