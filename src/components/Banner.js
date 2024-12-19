import { View, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { styles, COLORS, APIManager } from '../config'

import ProductImages from './ProductImages'
import { FlatListSlider } from 'react-native-flatlist-slider'
import { useNavigation } from '@react-navigation/native'

const Banner = ({data, loading, type}) => {
  const navigation = useNavigation();

  const gridStyle = type == 'grid' && data?.length ? {
    borderWidth: 1,
    borderColor: COLORS.gray,
  } : null

  const onGridItem = async (item) => {
    switch(item.target){
      case 'category':{
        navigation.navigate('CategoryListScreen', { item: { id: item.target_id } })
        break;
      }
      case 'product':{
        navigation.push('ProductDetailScreen', { product: {id: item.target_id, product_id: item.target_id} })
        break;
      }
      case 'manufacturer':{
        navigation.navigate('CategoryListScreen', { item: { id: item.target_id, manufacturer: true } })
        break;
      }
    }
  }

  return (
    loading 
    ? <View style={{...styles.homeBannersContainer, width: "100%", backgroundColor: COLORS.lightGray}} /> 
    : (!data || data?.length < 1) ? null :
    <View style={[styles.homeBannersContainer]}>
      {
        type == 'slideshow' ?
        <FlatListSlider
          data={data}
          component={<ProductImages imgStyle={{width: "100%"}}/>}
          loop={false}
          timer={9000}
          onPress={onGridItem}
          indicatorActiveColor={COLORS.primary}
          indicatorInActiveColor={'#ccc'}
          indicatorActiveWidth={30}
          animation
        /> : <>
        {
          ! data?.length ? null :
          <TouchableOpacity 
            style={{...styles.homeBannerView,  paddingHorizontal:5}} 
            onPress={() => onGridItem(data[0])} 
            >
            <Image
              source={{uri: data[0].image}}
              style={styles.homeBannerImage}
            />
          </TouchableOpacity>
        }
        {
          data?.length < 2 ? null :
          <TouchableOpacity 
            style={{...styles.homeBannerView, paddingHorizontal:5}}
            onPress={() => onGridItem(data[1])} 
          >
            <Image
              source={{uri: data[1].image}}
              style={styles.homeBannerImage}
            />
          </TouchableOpacity>
        }
        </>
      }
    </View>
  )
}

export default Banner