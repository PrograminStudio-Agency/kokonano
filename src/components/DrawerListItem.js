import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Separator } from '.';
import { COLORS, styles, validURL, strings } from '../config';
import { NetworkContext } from '../context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/api/config';


const DrawerListItem = ({
  iconSVG,
  text,
  onPress,
  id,
  hasChildren,
  navigation,
  length,
  index
}) => {
  const [, setConnected] = React.useContext(NetworkContext);
  const [isLoading, setLoading] = React.useState(true);
  const [childList, setChildList] = React.useState([])
  const [arrowDown, setArrowDown] = React.useState(false);

  const fetchChildList = async () => {
    if (childList.length != 0) {
      setChildList([])
      setArrowDown(false)
      return
    }
    try {
      const parent_id = id;
      const res = JSON.parse(await AsyncStorage.getItem('categories'));
      const resFilter = res.filter(item => item.status && item.parent_id === parent_id);
      const finalList = [];
      for (let i = 0; i < resFilter.length; i++) {
        finalList.push({
          ...resFilter[i],
          hasChildren: res.filter(item => item.status && item.parent_id === resFilter[i].id).length > 0,
        });
      }
      setChildList(
        finalList.map((item, index) => ({
          iconSVG: item.image == config.no_image ? null : item.image,
          text: item.name.replace('&amp;', '&'),
          onPress: () => navigation.navigate('CategoryListScreen', { item: item }),
          id: item.id,
          hasChildren: item.hasChildren,
          navigation: navigation,
          showSeparator: true,
          index: index
          // onArrowPress: item.hasChildren
          //   ? () => navigation.push('DrawerContentList', { item: item })
          //   : null,
        })),
      );
      setArrowDown(true)
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
  return (
    <>
      <View style={styles.drawerListItemContainer}>
        <TouchableOpacity
          style={styles.drawerListItemSVGContainer}
          onPress={onPress}>
          {!!iconSVG ? (
            <View style={styles.drawerListItemSVG}>
              {validURL(iconSVG) ? (
                <Image source={{ uri: iconSVG }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <SvgXml xml={iconSVG} />
              )}
            </View>
          ) :
            <View style={{...styles.drawerListItemSVG,marginRight:10}}>
           

            </View>
          }
          <Text style={{ fontSize: 18, marginLeft: !!iconSVG ? 10 : 0, color: 'black' }}>
            {!!strings[text]?strings[text] : text }
          </Text>
        </TouchableOpacity>
        {!!hasChildren ? (
          <TouchableOpacity style={{ backgroundColor: COLORS.primary, borderRadius: 20, justifyContent: 'center', alignItems: 'center', height: 30, width: 30 }} onPress={fetchChildList}>
            {/* <SvgXml xml={strings.getLanguage() === 'ar' ? SVG.arrowIconLeft : SVG.arrowIconRight} /> */}
            <Text style={{ fontSize: 20, color: '#fff' }}>{arrowDown ? '-' : '+'}</Text>
          </TouchableOpacity>

        ) : null}
      </View>
      <View style={{ paddingLeft: 20 }}>
        {childList.map((item, index) => <DrawerListItem {...item} key={index} length={childList.length} />)}
      </View>
      {index === length - 1 ? <Separator /> : null}
    </>
  );
};

export default DrawerListItem;
