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
import { SvgXml } from 'react-native-svg';
import { Button } from '../components';
import {
  strings,
  styles,
  SVG,
  validateEmail,
  validatePassword,
  APIManager,
} from '../config';
import { AuthContext, NetworkContext } from '../context';

const SignInScreen = ({ navigation, route }) => {
  const [, setConnected] = React.useContext(NetworkContext);
  const [state, setState] = React.useState({
    email: '',
    is_valid_email: false,
    password: '',
    is_valid_password: false,
    secure_text_password: true,
  });

  const ref1 = React.useRef();
  const [isLoading, setLoading] = React.useState(false);

  const [, setUserToken] = React.useContext(AuthContext);
  const login = async () => {
    if (!state.is_valid_email) {
      Alert.alert(strings['Invalid Email'])
      return;
    }
    // if (!state.is_valid_password) {
    //   Alert.alert(strings['Invalid Password'])
    //   return;
    // }
    try {
      const formData = new FormData();
      formData.append('email', state.email);
      formData.append('password', state.password);
      setLoading(true);
      const res = await new APIManager().userLogin(formData);
      if (!res.success) {
        Alert.alert(strings['Invalid Email or Password'])
        setLoading(false);
        return;
      }
      setUserToken({
        id: res.data.customer_id,
        email: res.data.email,
        first_name: res.data.firstname,
        last_name: res.data.lastname,
        username: res.data.firstname,
      })
      setLoading(false);
      if (!!route?.params?.isGoBack) {
        navigation.goBack();
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'HomeScreen' }] });
      }
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        console.error(err);
        setLoading(false);
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
        contentContainerStyle={{paddingTop:15,...styles.ph20}}>
        <View style={styles.loginInput}>
          <Text style={styles.loginInputHeading}>{strings.email}</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              autoCapitalize='none'
              onChangeText={text =>
                setState(prevState => ({
                  ...prevState,
                  email: text,
                  is_valid_email: validateEmail(text),
                }))
              }
              onSubmitEditing={() => ref1.current.focus()}
              style={styles.textInput}
            />
            {state.email === '' ? (
              <SvgXml xml={SVG.infoIcon} />
            ) : state.is_valid_email ? (
              <SvgXml xml={SVG.checkIcon} />
            ) : (
              <SvgXml xml={SVG.infoErrorIcon} />
            )}
          </View>
        </View>
        <View style={styles.loginInput}>
          <Text style={styles.loginInputHeading}>{strings.password}</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              secureTextEntry={state.secure_text_password}
              ref={ref1}
              onSubmitEditing={() => login()}
              onChangeText={text =>
                setState(prevState => ({
                  ...prevState,
                  password: text,
                  is_valid_password: validatePassword(text),
                }))
              }
              style={styles.textInput}
            />
            <TouchableOpacity
              onPress={() =>
                setState(prevState => ({
                  ...prevState,
                  secure_text_password: !prevState.secure_text_password,
                }))
              }>
              {state.secure_text_password ? (
                <SvgXml xml={SVG.eyeSlashIcon} />
              ) : (
                <SvgXml xml={SVG.eyeIcon} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.forgetInfo}
          onPress={() => navigation.navigate('ForgotPasswordScreen')}>
          <Text style={styles.loginInfoText}>
            {strings['Forgot Password?']}
          </Text>
        </TouchableOpacity>
        <View style={{ width: '100%' }}>
          <Button
            text={strings['Login']}
            type={'primary'}
            buttonTextStyle={{ fontWeight: '400' }}
            onPress={() => login()}
            isLoading={isLoading}
          />
        </View>
        <TouchableOpacity
          style={styles.loginInfo}
          onPress={() => navigation.replace('SignUpScreen')}>
          <Text style={styles.loginInfoText}>
            {strings["Don't Have An Account?"]}
            <Text style={styles.marginLeft10}> {strings['Sign_Up']}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignInScreen;
