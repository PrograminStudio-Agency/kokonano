import axios from "axios";
import config from "./config";
import AsyncStorage from '@react-native-async-storage/async-storage';

const removeQuotation = (response) => {
  const responseString = response.data;
  // Find the faulty name using regular expressions
  const faultyNamesRegex = /"name":\s*"(.*?)"(?![^,])/g;
  const matches = responseString.match(faultyNamesRegex);
  var faultyNames = matches ? matches.map(match => match.match(/"name":\s*"(.*?)"(?![^,])/)[1]) : [];
  faultyNames = faultyNames.filter(faultyName => faultyName.includes(`\"`))

  if (faultyNames.length > 0) {
    let correctedResponseString = responseString;
    faultyNames.forEach(faultyName => {
      do {
        correctedResponseString = correctedResponseString.replace(faultyName, faultyName.replace(`\"`, '(inches)'));
      } while (correctedResponseString.includes(faultyName))
    });
    const correctObject = JSON.parse(correctedResponseString)
    return correctObject
  }
}

export default class BaseApiManager {
  constructor() { }

  async postNoKeys(url, parameters) {
    const token = await AsyncStorage.getItem('token');
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: parameters,
    };

    const finalURL = url;
    try {
      return await fetch(finalURL, requestOptions)
        .then(response => response.json())
        .then(responseJson => {
          return responseJson;
        });
    } catch (error) {
      throw new Error(error);
    }
  }
  async deleteNoKeys(url, parameters) {
    const token = await AsyncStorage.getItem('token');
    const requestOptions = {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: parameters,
    };

    const finalURL = url;
    try {
      return await fetch(finalURL, requestOptions)
        .then(response => response.json())
        .then(responseJson => {
          return responseJson;
        });
    } catch (error) {
      throw new Error(error);
    }
  }
  async getNoKeys(url, parameters) {
    const token = await AsyncStorage.getItem('token');
    const requestOptions = {
      headers: {
        Accept: 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    const finalURL = url;
    try {
      const response = await axios.get(finalURL, requestOptions)

      if (typeof response.data == 'string') return removeQuotation(response)
      else return response.data;
    } catch (error) {
      throw new Error(error);
    }
  }

  //returns complete axios response because we need response header X-Total-Count on Loading screen
  async getNoKeysCategories(url) {
    const token = await AsyncStorage.getItem('token');
    const requestOptions = {
      headers: {
        Accept: 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    const finalURL = url;
    try {
      const response = await axios.get(finalURL, requestOptions)
      return response;
    } catch (error) {
      throw new Error(error);
    }
  }

  async postNoKeysJson(url, parameters) {

    const token = await AsyncStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token != 'undefined' ? { 'Authorization': `Bearer ${token}` } : '')
    };

    const requestOptions = {
      // method: 'POST',
      headers,
      // body: parameters ? JSON.stringify(parameters) : null,
    };

    const finalURL = url;
    try {
      const response = await axios.post(finalURL, parameters, requestOptions)

      if (typeof response.data == 'string') return removeQuotation(response)
      else return response.data
    } catch (error) {
      throw error;
    }
  }
  async putNoKeysJson(url, parameters) {
    const token = await AsyncStorage.getItem('token');
    const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(parameters),
    };

    const finalURL = url;
    try {
      return await fetch(finalURL, requestOptions)
        .then(response => response.json())
        .then(responseJson => {
          return responseJson;
        });
    } catch (error) {

      throw new Error(error);
    }
  }

  async postJson(url, parameters) {
    const token = await AsyncStorage.getItem('token');
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: parameters,
    };

    const finalURL = url + `&consumer_key=${config.Keys.consumer_key}&consumer_secret=${config.Keys.consumer_secret}`;
    try {
      return await fetch(finalURL, requestOptions)
        .then(response => response.json())
        .then(responseJson => {
          return responseJson;
        });
    } catch (error) {

      throw new Error(error);
    }
  }
  async putJson(url, parameters) {
    const token = await AsyncStorage.getItem('token');
    const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(parameters),
    };

    const finalURL = url + `&consumer_key=${config.Keys.consumer_key}&consumer_secret=${config.Keys.consumer_secret}`;
    try {
      return await fetch(finalURL, requestOptions)
        .then(response => response.json())
        .then(responseJson => {
          return responseJson;
        });
    } catch (error) {

      throw new Error(error);
    }
  }

  async post(url, parameters) {
    const token = await AsyncStorage.getItem('token');
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: parameters,
    };

    const finalURL = url + `&consumer_key=${config.Keys.consumer_key}&consumer_secret=${config.Keys.consumer_secret}`;
    try {
      return await fetch(finalURL, requestOptions)
        .then(response => response.json())
        .then(responseJson => {
          return responseJson;
        });
    } catch (error) {

      throw new Error(error);
    }
  }
  //This method Gets Data
  async get(url) {
    const token = await AsyncStorage.getItem('token');
    const requestOptions = {
      method: 'get',
      headers: {
        Accept: 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };
    const finalURL = url;
    try {
      return await fetch(finalURL, requestOptions)
        .then(response => response.json())
        .then(responseJson => {
          return responseJson;
        });
    } catch (error) {

      throw new Error(error);
    }
  }
}
