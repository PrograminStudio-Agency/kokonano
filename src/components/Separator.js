import React from 'react';
import { View } from 'react-native';
import { styles } from '../config';

const Separator = ({ width, color, borderTopWidth }) => {
  let finalStyle = styles.separator;
  if(!!width) finalStyle = {...finalStyle, width: width}
  if(!!color) finalStyle = {...finalStyle, color: color}
  if(!!borderTopWidth) finalStyle = {...finalStyle, borderTopWidth: borderTopWidth}

  return <View style={finalStyle} />;
};

export default Separator;
