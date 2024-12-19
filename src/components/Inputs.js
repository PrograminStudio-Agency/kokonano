import React from 'react';
import {TextInput, TouchableOpacity, View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {Text} from '../components';
import {strings, styles, SVG, validateEmail, validatePassword} from '../config';

export const Input = ({setState, field, ...rest}) => {
  return (
    <View style={styles.loginInput}>
      <Text style={styles.loginInputHeading}>{strings[field]}</Text>
      <View style={styles.loginTextInput}>
        <TextInput
          {...rest}
          onChangeText={text =>
            setState(prevState => ({
              ...prevState,
              [field]: text,
              [`is_valid_${field}`]: !!text,
            }))
          }
          style={styles.textInput}
        />
      </View>
    </View>
  );
};

export const EmailInput = ({state, setState, field, ...rest}) => {
  return (
    <View style={styles.loginInput}>
      <Text style={styles.loginInputHeading}>{strings[field]}</Text>
      <View style={styles.loginTextInput}>
        <TextInput
          {...rest}
          onChangeText={text =>
            setState(prevState => ({
              ...prevState,
              [field]: text,
              [`is_valid_${field}`]: validateEmail(text),
            }))
          }
          style={styles.textInput}
        />
        {state[field] === '' ? (
          <SvgXml xml={SVG.infoIcon} />
        ) : state[`is_valid_${field}`] ? (
          <SvgXml xml={SVG.checkIcon} />
        ) : (
          <SvgXml xml={SVG.infoErrorIcon} />
        )}
      </View>
    </View>
  );
};

export const PasswordInput = ({state, setState, field, ...rest}) => {
  return (
    <View style={styles.loginInput}>
      <Text style={styles.loginInputHeading}>{strings[field]}</Text>
      <View style={styles.loginTextInput}>
        <TextInput
          {...rest}
          secureTextEntry={state[`secure_text_${field}`]}
          onChangeText={text =>
            setState(prevState => ({
              ...prevState,
              [field]: text,
              [`is_valid_${field}`]: validatePassword(text),
            }))
          }
          style={styles.textInput}
        />
        <TouchableOpacity
          onPress={() =>
            setState(prevState => ({
              ...prevState,
              [`secure_text_${field}`]: !prevState[`secure_text_${field}`],
            }))
          }>
          {state[`secure_text_${field}`] ? (
            <SvgXml xml={SVG.eyeIcon} />
          ) : (
            <SvgXml xml={SVG.eyeSlashIcon} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Input;
