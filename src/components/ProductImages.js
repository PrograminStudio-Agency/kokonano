import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions
} from 'react-native';

export default (Preview = ({
  item,
  imageKey,
  onPress,
  imgStyle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.videoContainer]}
      onPress={() => onPress(item)}
      // disabled={item.target != 'category'}
    >
      <View style={(item.target ? styles.bannerContainer : styles.imageContainer)}>
        <Image
          style={[styles.videoPreview, imgStyle]}
          source={{uri: item[imageKey]}}
        />
      </View>
    </TouchableOpacity>
  );
});
const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;
const styles = StyleSheet.create({
  videoContainer: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreview: {
    width: SCREEN_WIDTH-20,
    height:'100%',
    resizeMode: 'contain',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: SCREEN_WIDTH,
    height:SCREEN_HEIGHT/3,
  },
  bannerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: SCREEN_WIDTH,
    height:SCREEN_HEIGHT,
  },
});