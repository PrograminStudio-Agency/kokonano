import React from 'react';
import {TouchableOpacity, Text, View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {SVG, styles} from '../config';

const DrawerListHeader = ({heading, state, setState}) => {
  return (
    <TouchableOpacity
      onPress={() => setState(prevState => !prevState)}
      style={styles.drawerListHeaderContainer}>
      <Text style={styles.drawerListHeaderText}>{heading}</Text>
      <View style={{padding: 10}}>
        <SvgXml xml={!!state ? SVG.arrowIconUp : SVG.arrowIconDown} />
      </View>
    </TouchableOpacity>
  );
};

export default DrawerListHeader;
