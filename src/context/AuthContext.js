import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import {Alert} from 'react-native';

export const AuthContext = React.createContext();

export const AuthProvider = ({children}) => {
  const [userToken, setUserTokenOnly] = React.useState(null);
  const [token, setTokenOnly] = React.useState(null);

  const setToken = token => {
    AsyncStorage.setItem('token', `${token}`, () => {});
    setTokenOnly(token);
  };
  const setUserToken = user => {
    AsyncStorage.setItem('userToken', JSON.stringify(user), () => {});
    setUserTokenOnly(user);
  };

  const signOut = () => {
    if (userToken === null) {
      Alert.alert('Not Logged in', 'Login Before You Can Logout');
      return;
    }

    setUserTokenOnly(null);
    AsyncStorage.removeItem('userToken', () => {});
    // AsyncStorage.removeItem('guest_login', () => {});
  };

  return (
    <AuthContext.Provider value={[userToken, setUserToken, signOut, setToken, token]}>
      {children}
    </AuthContext.Provider>
  );
};
