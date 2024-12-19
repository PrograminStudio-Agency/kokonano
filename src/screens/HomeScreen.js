import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  ScrollView,
  Text,
  View,
  TextInput,
  ActivityIndicator,
  Image,
  TouchableOpacity
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SvgXml } from 'react-native-svg';
import { CompareProduct, FeaturedCategory, HomeSectionHeader, WhatsAppButton } from '../components';
import { HomeListProductCard } from '../components/HomeListProductCard';
import Banner from '../components/Banner';
import { FlatListSlider } from 'react-native-flatlist-slider';
import ProductImages from '../components/ProductImages';
import {
  APIManager,
  COLORS,
  sampleProduct,
  strings,
  styles,
  SVG,
} from '../config';
import { NetworkContext } from '../context';
import { getRandom } from '../config';

const getGridItems = (gridBannerItems) => {
  const grids = [];
  if (!gridBannerItems || !gridBannerItems?.length) return grids;
  gridBannerItems?.map((item, index) => (index + 1) % 2 == 0
    ? grids.push([gridBannerItems[index], gridBannerItems[index - 1]])
    : null
  )
  if ((gridBannerItems?.length + 1) % 2 != 0) {
    grids.push([gridBannerItems[gridBannerItems?.length - 1]])
  }
  return grids;
}

const HomeScreen = ({ navigation, route }) => {
  const [banners, setBanners] = React.useState([]);
  const [isLoadingBanners, setLoadingBanners] = React.useState(true);

  const [featured, setFeatured] = React.useState([]);
  const [isLoadingFeatured, setLoadingFeatured] = React.useState(true);

  const [best, setBest] = React.useState([]);
  const [isLoadingBest, setLoadingBest] = React.useState(true);

  const [popular, setPopular] = React.useState([]);
  const [isLoadingPopular, setLoadingPopular] = React.useState(true);

  const [, setConnected] = React.useContext(NetworkContext);

  const [searchText, setSearchText] = React.useState();


  // Banner Data
  const slideshowBannerItems = banners?.filter(item => item.type == 'images_banner' && item.display_mode == 'slideshow')[0]?.images;

  const gridBannerItems = banners?.filter(item => item.type == 'images_banner' && item.display_mode == 'carousel')[0]?.images

  const [grid1, grid2] = getGridItems(gridBannerItems);


  const searchProducts = text => {
    const search = !!text ? text : searchText;
    !!search
      ? navigation.navigate('SearchScreen', { searchText: search })
      : navigation.navigate('SearchScreen');
  };
  // FOund
  const fetchFeatured = async () => {
    try {
      const res = await new APIManager().getProducts(
        '/featured&limit=10', 'featured'
      );
      setFeatured(res.data[0]?.products?.filter(item => item.quantity != 0));
      setLoadingFeatured(false)
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        setLoadingFeatured(false)
        console.error(err);
      }
    }
  };
  // Found
  const fetchBest = async () => {
    try {
      const res = await new APIManager().getProducts(
        '/bestsellers&limit=10', 'best'
      );
      setBest(res.data?.filter(item => item.quantity != 0));
      setLoadingBest(false)
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        setLoadingBest(false)
        console.error(err);
      }
    }
  };
  const fetchPopular = async () => {
    try {
      const res = await new APIManager().getProducts(
        '/specials&limit=10', 'popular'
      );
      setPopular(res.data?.filter(item => item.quantity != 0 ));
      setLoadingPopular(false)
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        setLoadingPopular(false)
        console.error(err);
      }
    }
  };

  const fetchBanners = async () => {
    try {
      setLoadingBanners(true);
      const response = await new APIManager().getBanners();
      setBanners(response?.data);
      setLoadingBanners(false);
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        setLoadingBanners(false)
        console.error(err);
      }
    }
  }


  React.useEffect(() => {
    fetchFeatured()
    fetchBest()
    fetchPopular()
    fetchBanners()
  }, []);

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ ...styles.homeScrollView, flexGrow: 1 }}>
        {/* ------------------------------- Search Bar ------------------------------- */}
        <View style={styles.homeSearchBar}>
          <SvgXml
            xml={SVG.searchIcon}
            style={{ marginHorizontal: 10 }}
            onPress={() => searchProducts()}
          />
          <TextInput
            placeholder={strings['Search Your Product']}
            placeholderTextColor={COLORS.placeholder}
            style={styles.searchBarText}
            returnKeyType={'search'}
            onChangeText={text => setSearchText(text)}
            onSubmitEditing={e => {
              const value = e?.nativeEvent?.text;
              searchProducts(value);
            }}
          />
        </View>

        {/* Slideshow */}
        <Banner
          data={slideshowBannerItems}
          loading={isLoadingBanners}
          type={'slideshow'}
        />

        {/* -------------------------- Categories ScrollView ------------------------- */}
        <FeaturedCategory navigation={navigation} />

        {/* ------------------------------- Best Seller ------------------------------ */}

        {isLoadingBest ? (
          <ActivityIndicator size={'large'} color={COLORS.primary} style={{ marginTop: 25 }} />
        ) : best?.length <= 0 ? null : (<>
          <HomeSectionHeader
            heading={strings['Top Rated Products']}
            onPress={() => {
              navigation.navigate('AllProductScreen', {
                title: 'Best Sellers',
                slug: 'best',
              });
            }}
          />
          <FlatList
            data={best}
            renderItem={({ item, index }) => <HomeListProductCard item={item} key={index} navigation={navigation} />}
            keyExtractor={(item, index) => index}
            horizontal={true}
            style={{ paddingHorizontal: 10, paddingVertical: 20 }}
          />
        </>)}

        {/* Grid 1 */}
        <Banner
          data={grid1}
          loading={isLoadingBanners}
          type={'grid'}
        />

        {/* ------------------------------- Popular ------------------------------ */}

        {isLoadingPopular ? (
          <ActivityIndicator size={'large'} color={COLORS.primary} style={{ marginTop: 15 }} />
        ) : popular?.length <= 0 ? null : (<>
          <HomeSectionHeader
            heading={strings['Popular']}
            onPress={() => {
              navigation.navigate('AllProductScreen', {
                title: 'Popular',
                slug: 'popular',
              });
            }}
          />
          <FlatList
            data={popular}
            renderItem={({ item, index }) => <HomeListProductCard item={item} key={index} navigation={navigation} />}
            keyExtractor={(item, index) => index}
            horizontal={true}
            style={{ paddingHorizontal: 10, paddingVertical: 20 }}
          />
        </>)}


        {/* Grid 2 */}
        <Banner
          data={grid2}
          loading={isLoadingBanners}
          type={'grid'}
        />
        {/* ------------------------ Featured Horizontal List ------------------------ */}
        {isLoadingFeatured ? (
          <ActivityIndicator size={'large'} color={COLORS.primary} />
        ) : !featured || featured?.length <= 0 ? null : (<>
          <HomeSectionHeader
            heading={strings['Featured']}
            onPress={() => {
              navigation.navigate('AllProductScreen', {
                title: 'Featured',
                slug: 'featured',
              });
            }}
          />
          <FlatList
            data={featured}
            renderItem={({ item, index }) => <HomeListProductCard item={item} key={index} navigation={navigation} />}
            keyExtractor={(item, index) => index}
            horizontal={true}
            style={{ paddingHorizontal: 10, paddingVertical: 20 }}
          />
        </>)}
      </ScrollView>
      <WhatsAppButton />
      <CompareProduct navigation={navigation} />
    </>
  );
};

export default HomeScreen;