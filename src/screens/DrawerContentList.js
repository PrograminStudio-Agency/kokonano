import React from 'react';
import {ActivityIndicator, ScrollView, View, Text} from 'react-native';
import {DrawerListItem, Separator} from '../components';
import {APIManager, COLORS, strings, styles, SVG} from '../config';
import {NetworkContext} from '../context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DrawerContent = ({navigation, route}) => {
  const [, setConnected] = React.useContext(NetworkContext);
  const [mainList, setMainList] = React.useState([]);
  const [isLoading, setLoading] = React.useState(true);

  const fetchMainList = async () => {
    try {
      const parent_id = route.params?.item?.id || 0;
      const res = JSON.parse(await AsyncStorage.getItem('categories'));
      const resFilter = res.filter(item => item.status && item.parent_id === parent_id);
      const finalList = [];
      for (let i = 0; i < resFilter.length; i++) {
        finalList.push({
          ...resFilter[i],
          hasChildren: res.filter(item => item.status && item.parent_id === resFilter[i].id).length > 0,
        });
      }
      setMainList(
        finalList.map(item => ({
          iconSVG: item.image,
          text: item.name.replace('&amp;', '&'),
          onPress: () =>
            navigation.navigate('CategoryListScreen', {item: item}),
            id: item.id
          // onArrowPress: item.hasChildren
          //   ? () => navigation.push('DrawerContentList', {item: item})
          //   : null,
        })),
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
    fetchMainList();
  }, []);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{backgroundColor: 'white'}}>
      {/* Main List */}
      {isLoading ? (
        <View style={styles.activityIndicator}>
          <ActivityIndicator size={'large'} color={COLORS.secondary} />
        </View>
      ) : mainList.length <= 0 ? (
        <View>
          <Text>{strings['No Items Found']}</Text>
        </View>
      ) : (
        mainList.map((item, index) => (
          <DrawerListItem {...item} key={index} showSeparator />
        ))
      )}
    </ScrollView>
  );
};

export default DrawerContent;
