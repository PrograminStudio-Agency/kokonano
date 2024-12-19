import React from 'react';
import {
  ActivityIndicator,
  Image,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import {HomeSectionHeader} from '../components';
import {CARD_COLORS, COLORS, strings, styles} from '../config';
import {NetworkContext} from '../context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CategoryCard = ({item, color, navigation}) => {
  return (
    <TouchableOpacity
      style={styles.categoryCardContainer}
      onPress={() => navigation.navigate('CategoryListScreen', {item: item})}>
      <View style={{...styles.categoryCardTextContainer, ...color, }}>
        <Text style={styles.categoryCardText}>
          {item.name.replace('&amp;', '&')}
        </Text>
      </View>
      <Image
        source={{
          uri: !!item?.image
            ? item.image
            : 'https://media-exp1.licdn.com/dms/image/C4E1BAQGpoD6OAi9CCA/company-background_10000/0/1550767306745?e=2159024400&v=beta&t=YJr-oOpX595bAZaJ1CAb3Oknf_LYL035ATFDcdCbrbk',
        }}
        resizeMode='contain'
        style={styles.categoryCardImage}
      />
    </TouchableOpacity>
  );
};

const FeaturedCategory = ({navigation}) => {
  const [categoriesData, setCategoriesData] = React.useState([]);
  const [isLoading, setLoading] = React.useState(true);
  const [, setConnected] = React.useContext(NetworkContext);
  
  const fetchCategories = async () => {
    try {
      const res = JSON.parse(await AsyncStorage.getItem('categories'));
      setCategoriesData(
        res.filter(item => item.status && item.parent_id === 0),
      );
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
    fetchCategories();
  }, []);

  return (
    <>
      <HomeSectionHeader
        heading={strings['Featured Categories']}
        onPress={() => {
          navigation.navigate('DrawerContentList');
        }}
      />
      {isLoading ? (
        <ActivityIndicator size={'small'} color={COLORS.primary} />
      ) : categoriesData?.length <= 0 ? (
        <View>
          <Text>{strings['No Items Found']}</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.shadowView}>
          {categoriesData.map((item, index) => (
            <CategoryCard
              item={item}
              key={index}
              navigation={navigation}
              color={CARD_COLORS[index % 2]}
            />
          ))}
        </ScrollView>
      )}
    </>
  );
};

export default FeaturedCategory;
