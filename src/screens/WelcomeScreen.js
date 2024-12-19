import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import {Image, Text, TouchableOpacity, SafeAreaView, View} from 'react-native';
import {Button} from '../components';
import {strings, styles} from '../config';

const HomeScreen = ({navigation}) => {
  const continueNoLogin = () => {
    AsyncStorage.setItem('guest_login', JSON.stringify(true), () => {});
    navigation.replace('HomeScreen');
  };
  return (
    <SafeAreaView style={styles.welcomeContainer}>
      <View style={styles.welcomeHeadingContainer}>
        <Text style={styles.welcomeHeading}>
          {strings['Kuwait Online Shopping Store']}
        </Text>
        <Text style={styles.welcomeSubHeading}>
          {strings['Shop Top Brand']}
        </Text>
      </View>

      <View style={styles.welcomeImageContainer}>
        <Image source={require('../assets/logo-1.png')} />
      </View>
      <View style={styles.welcomeButtonsContainer}>
        <Button
          type={'primary'}
          text={strings.login}
          buttonContainerStyle={styles.shadowView}
          onPress={() => navigation.navigate('SignInScreen')}
        />
        <Button
          type={'secondary'}
          text={strings.signUp}
          onPress={() => navigation.navigate('SignUpScreen')}
        />
        <TouchableOpacity style={styles.loginInfo} onPress={continueNoLogin}>
          <Text style={styles.loginInfoText}>
            {strings['Continue as Guest']}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
