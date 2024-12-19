import React from 'react';
import {Text} from 'react-native';

export default ({style, ...rest}) => {
  const defaultStyle = {
    color: '#000',
    textAlign: 'left',
  };

  return <Text style={{...defaultStyle, ...style}} {...rest} />;
};
