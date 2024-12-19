import React from 'react';
import { Text, View } from 'react-native';
import { strings, styles } from '../config';
import { SmallButton } from './HeaderButtons';

const HomeSectionHeader = ({heading, onPress}) => {
  return (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderHeading}>{heading}</Text>
      <SmallButton text={strings['See All']} onPress={onPress} />
    </View>
  );
};

export default HomeSectionHeader;

