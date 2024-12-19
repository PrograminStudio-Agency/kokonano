import React from 'react';
import { ActivityIndicator, ScrollView, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { ProductCard, SmallButton, WhatsAppButton } from '../components';
import { APIManager, COLORS, strings, styles, SVG, CARD_COLORS } from '../config';
import { NetworkContext } from '../context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { filterProduct } from '../config';

const CategoryCard = ({ item, color, navigation }) => {
  return (
    <TouchableOpacity
      style={{ ...styles.categoryCardContainer, width: 100, height: 50, ...color }}
      onPress={() => navigation.push('CategoryListScreen', { item: item })}>
      <Text style={styles.categoryCardText}>
        {filterProduct(item).name}
      </Text>
    </TouchableOpacity>
  );
};

const CategoryListScreen = ({ navigation, route }) => {
  const [, setConnected] = React.useContext(NetworkContext);
  const [products, setProducts] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [isLoading, setLoading] = React.useState(true);
  const [maxPrice, setMaxPrice] = React.useState(1000);
  const [isLoadingMore, setLoadingMore] = React.useState(false);
  const limit = 20;
  const [hasMore, setMore] = React.useState(true);

  var item = !!route?.params?.item
    ? route.params.item
    : { id: 0, name: 'All Products' };

  const [children, setChildren] = React.useState([]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleBtnContainer}>
          <SmallButton
            text={strings['filter']}
            icon={SVG.filterHeader}
            onPress={() => {
              let params = { maxPrice: maxPrice };
              if (!!route.params?.states)
                params.states = { ...route.params.states };
              navigation.navigate('FilterScreen', params);
            }}
          />
          <SmallButton
            text={strings['sort']}
            icon={SVG.sortHeader}
            onPress={() =>
              navigation.navigate('SortScreen', { screen: 'CategoryListScreen' })
            }
          />
        </View>
      ),
      headerTitleAlign: 'center',
    });
  }, [navigation, route]);


  const fetchMaxPrice = async () => {
    try {
      const option = {
        sort: "price",
        order: "desc",
        filters: [
          {
            field: route?.params?.item?.manufacturer ? "manufacturer" : "category",
            value: `${item.id}`,
            operand: "="
          }
        ]
      }
      const res = await new APIManager().getProductWithFilter(option, 1, 1);
      const price = (obj) => obj.special ? (obj.special == obj.price ? obj.price : obj.special) : obj.price
      const max = Math.ceil(Number.parseFloat(price(res.data[0])));
      setMaxPrice(max);
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        console.error(err);
      }
    }
  };

  const fetchProducts = async () => {
    const sort = (!!route.params?.sort) ? route.params.sort : {};
    const filters = (!!route.params?.filters) ? route.params.filters : [];

    const option = {
      filters: [
        ...filters,
        {
          field: route?.params?.item?.manufacturer ? "manufacturer" : "category",
          value: `${item.id}`,
          operand: "=",
          logical_operand: "AND"
        },
      ],
      ...sort,
    }

    try {
      const res = await new APIManager().getProductWithFilter(option, 1, limit);

      if (!item.name) {
        if (item.manufacturer) {
          const response = await new APIManager().getManufacturer(item.id);
          navigation.setParams({ item: { id: item.id, name: response.data.name, manufacturer: true } })
        }
        else {
          const categories = JSON.parse(await AsyncStorage.getItem('categories'));
          const category = categories?.filter(cat => cat.id == item.id)[0];
          navigation.setParams({ item: { id: item.id, name: category.name } });
        }
      }
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
        console.log(err.message)
      }
    }
  };

  const fetchChildCategories = async () => {
    if (route?.params?.item?.manufacturer) return setChildren([]);
    try {
      const categories = JSON.parse(await AsyncStorage.getItem('categories'));
      const child = categories?.filter(cat => cat.status && cat.parent_id === item.id);
      setChildren(child);
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        console.error(err);
      }
    }
  };

  const refresh = () => {
    setLoading(true);
    fetchProducts();
    fetchMaxPrice();
  };

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if(route.params?.comingFrom == 'applyBtn' && (route.params?.filters || route.params?.sort)){
        refresh();
      }
    });
    fetchChildCategories();
    fetchMaxPrice();
    fetchProducts();
    return unsubscribe;
  }, [navigation, route]);

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const onScroll = async ({ nativeEvent }) => {
    if (isCloseToBottom(nativeEvent) && !isLoadingMore && hasMore) {
      setLoadingMore(true);

      const sort = (!!route.params?.sort) ? route.params.sort : {};
      const filters = (!!route.params?.filters) ? route.params.filters : [];

      const option = {
        filters: [
          ...filters,
          {
            field: route?.params?.item?.manufacturer ? "manufacturer" : "category",
            value: `${item.id}`,
            operand: "=",
            logical_operand: "AND"
          },
        ],
        ...sort,
      }

      try {
        const res = await new APIManager().getProductWithFilter(option, page, limit);
        setProducts(prevProducts => [...prevProducts, ...res.data]);
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
        contentContainerStyle={{ paddingBottom: 20 }}
        onScroll={onScroll}
        scrollEventThrottle={1}
        >
        {/* Heading */}
        <View>
          <Text style={styles.allProductHeader}>
            {!!strings[(item?.name?.replace('&amp;', '&'))] ? strings[(item?.name?.replace('&amp;', '&'))] : (item?.name?.replace('&amp;', '&'))}
          </Text>
        </View>
        {/* Child Categories */}
        {
          !children ? null :
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.shadowView}
            >
              {
                children?.map((child, index) => (
                  <CategoryCard
                    item={child}
                    key={index}
                    navigation={navigation}
                    color={CARD_COLORS[index % 2]}
                  />
                ))
              }
            </ScrollView>
        }
        {/* Products */}
        <View style={{ marginHorizontal: 10 }}>
          <View style={styles.popularProductView}>
            {products.length <= 0 ? (
              <View
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 20,
                }}>
                <Text>{strings['No Items Found']}</Text>
              </View>
            ) : (
              products.map((item, index) => (
                <ProductCard item={item} key={index} navigation={navigation} />
              ))
            )}
          </View>
        </View>
        {/* Extra Loading */}
        {isLoadingMore ? (
          <View style={styles.isLoadingMoreIndicator}>
            <ActivityIndicator size={'large'} color={COLORS.secondary} />
          </View>
        ) : null}
        {/* Message */}
        {!hasMore && products.length > 0 ? (
          <View style={styles.isLoadingMoreIndicator}>
            <Text>{strings['No More Items']}</Text>
          </View>
        ) : null}
      </ScrollView>
      <WhatsAppButton />
    </>
  );
};

export default CategoryListScreen;
