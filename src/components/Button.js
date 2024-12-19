import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {COLORS} from '../config';

const Button = ({
  text,
  buttonContainerStyle,
  buttonTextStyle,
  onPress,
  type,
  icon,
  isLoading,
}) => {
  const styles = StyleSheet.create({
    buttonContainer: {
      borderWidth: 1,
      borderColor: !!COLORS[type] ? COLORS[type] : COLORS.primary,
      backgroundColor: type === 'primary' ? COLORS.primary : 'white',
      margin: 10,
      padding: 10,
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    textStyle: {
      color:
        type === 'primary'
          ? 'white'
          : type === 'secondary'
          ? COLORS.secondary
          : COLORS.primary,
      fontWeight: '500',
      fontSize: 16,
      marginLeft: !!icon ? 10 : 0,
      textAlign: 'center',
    },
  });

  return (
    <TouchableOpacity
      style={{...styles.buttonContainer, ...buttonContainerStyle}}
      onPress={onPress}>
      {!!icon ? <SvgXml xml={icon} /> : null}
      {isLoading ? (
        <ActivityIndicator
          size={'small'}
          color={
            type === 'primary'
              ? 'white'
              : type === 'secondary'
              ? COLORS.secondary
              : COLORS.primary
          }
        />
      ) : (
        <Text style={{...styles.textStyle, ...buttonTextStyle}}>{text}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
