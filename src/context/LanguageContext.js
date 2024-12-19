import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { I18nManager } from "react-native";
import { strings } from "../config";
import RNRestart from 'react-native-restart';

export const LanguageContext = React.createContext();

export const LanguageProvider = ({children}) => {
  const [language, setLanguageOnly] = React.useState(strings.getLanguage());

  const setLanguage = async (value) => {
    const result = value === 'ar' ? 'ar' : 'en';

    await AsyncStorage.setItem('language', result);
    strings.setLanguage(result);
    setLanguageOnly(result);
    if (result === 'ar') {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
      RNRestart.Restart();
    } else {
      I18nManager.allowRTL(false);
      I18nManager.forceRTL(false);
      RNRestart.Restart();
    }
  };

  return (
    <LanguageContext.Provider value={[language, setLanguage, setLanguageOnly]}>
      {children}
    </LanguageContext.Provider>
  );
};
