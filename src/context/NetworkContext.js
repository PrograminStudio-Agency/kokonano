import React from 'react';
import {APIManager} from '../config';

export const NetworkContext = React.createContext();

export const NetworkProvider = ({children}) => {
  const [isConnected, setConnectedOnly] = React.useState(true);

  const setConnected = (value) => {
    if(value != null && value != undefined ) {
      setConnectedOnly(!!value)
    }
  };

  const checkConnection = async () => {
    try {
      await new APIManager().getProducts('&per_page=1','popular');
      setConnectedOnly(true);
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnectedOnly(false);
      } else {
        return err;
      }
    }
  }

  return (
    <NetworkContext.Provider value={[isConnected, setConnected, checkConnection]}>
      {children}
    </NetworkContext.Provider>
  );
};
