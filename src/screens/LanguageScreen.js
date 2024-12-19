import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {strings, styles} from '../config';
import {LanguageContext} from '../context';

const LanguageScreen = () => {
  const [, setLanguage] = React.useContext(LanguageContext);

  const LanguageItem = ({text, onPress}) => (
    <TouchableOpacity onPress={onPress} style={styles.languageItemContainer}>
      <Text style={{color: 'black', textAlign: 'left'}}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.languageScreenContainer}>
      <LanguageItem text={'عربي'} onPress={() => setLanguage('ar')} />
      <LanguageItem text={'English'} onPress={() => setLanguage('en')} />
    </View>
  );
};

export default LanguageScreen;
