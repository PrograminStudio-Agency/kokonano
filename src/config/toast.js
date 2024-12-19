import Toast from 'react-native-toast-message';

export function showToast(message1, message2, type, position = 'top', onPress) {
  Toast.show({
    type: type,
    position: position,
    text1: message1,
    text2: message2 == null || undefined ? '' : message2,
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 80,
    props: {
      height: 500,
    },
    config: {},
    bottomOffset: 40,
    onShow: () => {},
    onHide: () => {},
    onPress: () => {onPress(); Toast.hide();},
  });
}
