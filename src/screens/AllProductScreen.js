import React from 'react';
import {Text, ActivityIndicator, ScrollView, View} from 'react-native';
import {ProductCard, CompareProduct} from '../components';
import {APIManager, COLORS, sampleProduct, strings, styles} from '../config';
import {NetworkContext, WishlistContext} from '../context';

const AllProductScreen = ({navigation, route}) => {
  const [wishlist] = React.useContext(WishlistContext);
  const [, setConnected] = React.useContext(NetworkContext);
  const [products, setProducts] = React.useState([]);
  const [isLoading, setLoading] = React.useState(true);
  const title = !!route?.params?.title
    ? !!strings[route.params.title]
      ? strings[route.params.title]
      : route.params.title
    : 'All Products';
  const slug = !!route?.params?.slug ? route.params.slug : 'all_products';
  const [page, setPage] = React.useState(1);
  const [isLoadingMore, setLoadingMore] = React.useState(false);
  const limit = 20;
  const [hasMore, setMore] = React.useState(true);

  const fetchProducts = async () => {
    try {
      let params = '';
      if (slug === 'wishlist') {
        setLoading(false);
        setMore(false);
        return;
      } else if (slug === 'best') {
        params = `/bestsellers&limit=${limit}`;
      } else if (slug === 'popular') {
        params = `/specials&limit=${limit}`;
      } else if (slug === 'featured') {
        params = `/featured&limit=${limit}`;
      }
      
      const res = await new APIManager().getProducts(params);
      const data = Object.keys(res.data).length == 1 ? res.data[0].products : res.data;
      setProducts(data);
      setPage(2);
      setMore(res.data.length >= limit);
      setLoading(false);
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        console.error(err);
        setLoading(false);
      }
    }
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  React.useEffect(()=>{
    if (slug === 'wishlist') {
      setProducts(wishlist);
      return setLoading(false);
    }
  }, [wishlist])

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
        let params = '';
        if (slug === 'wishlist') {
          setLoadingMore(false);
          setMore(false);
          return;
        } else if (slug === 'best') {
          params = `/bestsellers&limit=${limit*page}`;
        } else if (slug === 'popular') {
          params = `/specials&limit=${limit*page}`;
        } else if (slug === 'featured') {
          params = `/featured&limit=${limit*page}`;
        }
        const res = await new APIManager().getProducts(params);
        const data = Object.keys(res.data).length == 1 ? res.data[0].products : res.data;
        setProducts(data);
        setPage(prevPage => prevPage + 1);
        setMore(res.data.length >= limit);
        setLoadingMore(false);
      } catch (err) {
        if (err.message.includes('Network')) {
          setConnected(false);
          return;
        } else {
          setLoadingMore(false);
          console.error(err);
        }
      }
    }
  };

  return isLoading ? (
    <View style={styles.centerContainer}>
      <ActivityIndicator size={'large'} color={COLORS.primary} />
    </View>
  ) : (
    <>
      <ScrollView
        style={styles.allProductScrollView}
        contentContainerStyle={{paddingBottom: 20}}
        onScroll={onScroll}>
        <View>
          <Text style={styles.allProductHeader}>{title}</Text>
        </View>
        <View style={{...styles.popularProductView,paddingHorizontal:10}}>
          {!products || products.length <= 0 ? (
            <Text>{strings['No Items Found']}</Text>
          ) : (
            products.map((item, index) => (
              <ProductCard item={item} navigation={navigation} key={index} />
            ))
          )}
        </View>
        {isLoadingMore ? (
          <View style={styles.isLoadingMoreIndicator}>
            <ActivityIndicator size={'large'} color={COLORS.secondary} />
          </View>
        ) : null}
        {!hasMore && products.length > 0 ? (
          <View style={styles.isLoadingMoreIndicator}>
            <Text style={{fontStyle: 'italic', color: 'black'}}>
              {strings['No More Items']}
            </Text>
          </View>
        ) : null}
      </ScrollView>
      <CompareProduct navigation={navigation} />
    </>
  );
};

export default AllProductScreen;
