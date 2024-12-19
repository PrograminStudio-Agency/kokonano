import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Alert,
} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {Button} from '../components';
import {APIManager, strings, styles, SVG, validateEmail} from '../config';
import { NetworkContext } from '../context';

const ForgotPasswordScreen = ({navigation}) => {
  const [, setConnected] = React.useContext(NetworkContext);
  const [state, setState] = React.useState({
    email: '',
    isValidEmail: false,
  });
  const [isLoading, setLoading] = React.useState(false);

  const forget = async () => {
    try {
      setLoading(true);
      if(!state.isValidEmail) {
        Alert.alert(strings['Invalid Email']);
        return;
      }
      await new APIManager().forgetPassword({email: state.email});
      setLoading(false);
      navigation.goBack();
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        setLoading(false);
        console.error(err);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingViewStyle}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.flex1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingTop:15, ...styles.ph20}}>
        <View style={styles.loginInput}>
          <Text style={styles.loginInputHeading}>{strings.email}</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              onSubmitEditing={() => forget()}
              onChangeText={text =>
                setState(prevState => ({
                  ...prevState,
                  email: text,
                  isValidEmail: validateEmail(text),
                }))
              }
              style={styles.textInput}
            />
            {state.email === '' ? (
              <SvgXml xml={SVG.infoIcon} />
            ) : state.isValidEmail ? (
              <SvgXml xml={SVG.checkIcon} />
            ) : (
              <SvgXml xml={SVG.infoErrorIcon} />
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.forgetInfo} onPress={() => navigation.goBack()}>
          <Text style={styles.loginInfoText}>{strings['Login']}</Text>
        </TouchableOpacity>
        <View style={{width: '100%'}}>
          <Button
            text={strings['submit']}
            type={'primary'}
            buttonTextStyle={{fontWeight: '400'}}
            onPress={() => forget()}
            isLoading={isLoading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;
