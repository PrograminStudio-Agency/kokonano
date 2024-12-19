import React from 'react';
import {
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {Button} from '../components';
import {
  APIManager,
  strings,
  styles,
  SVG,
  validateEmail,
  validatePassword,
  validateTelephone,
} from '../config';
import {AuthContext, NetworkContext} from '../context';

const ProfileScreen = ({navigation, route}) => {
  const [state, setState] = React.useState({
    email: '',
    is_valid_email: false,
    first_name: '',
    is_valid_first_name: false,
    last_name: '',
    is_valid_last_name: false,
    telephone: '',
    is_valid_telephone: true,
    password: '',
    is_valid_password: false,
    secure_text_password: true,
    confirm_password: '',
    is_valid_confirm_password: false,
    secure_text_confirm_password: true,
  });
  const [isLoading, setLoading] = React.useState(false);
  const ref1 = React.useRef();
  const ref2 = React.useRef();
  const ref3 = React.useRef();
  const ref4 = React.useRef();
  const ref5 = React.useRef();
  const ref6 = React.useRef();
  const ref7 = React.useRef();

  const [, setUserToken] = React.useContext(AuthContext);
  const [, setConnected] = React.useContext(NetworkContext);

  const signup = async () => {
  
    if (!state.is_valid_email) {
      Alert.alert(strings['Invalid Email']);
      return;
    }
    if (!state.is_valid_first_name) {
      Alert.alert(strings['Invalid First Name']);
      return;
    }
    if (!state.is_valid_last_name) {
      Alert.alert(strings['Invalid Last Name']);
      return;
    }
    if (!state.is_valid_password) {
      Alert.alert(strings['Invalid Password']);
      return;
    }
    if (state.password !== state.confirm_password) {
      Alert.alert(strings['Passwords are not the same']);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('firstname', state.first_name);
      formData.append('lastname', state.last_name);
      formData.append('email', state.email);
      formData.append('password', state.password);
      formData.append('confirm', state.confirm_password);
      formData.append('telephone', state.telephone);
      // TODO: Fix agreement to terms and services
      formData.append('agree', 1);
      setLoading(true);
      const res = await new APIManager().userRegistration(formData);
      if (!res) throw new Error('Failed to Sign Up');
      setUserToken({
        id: res.data.customer_id,
        email: res.data.email,
        first_name: res.data.firstname,
        last_name: res.data.lastname,
        username: res.data.email,
      });
      setLoading(false);
      if (!!route?.params?.isGoBack) {
        navigation.goBack();
      } else {
        navigation.reset({index: 0, routes: [{name: 'HomeScreen'}]});
      }
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

  // const SCREEN_HEIGHT = useWindowDimensions().height;
  // React.useEffect(() => {
  //   if (true) {
  //     const showSubscription = Keyboard.addListener('keyboardDidShow', e => {
  //       setViewHeight(
  //         SCREEN_HEIGHT - e.endCoordinates.height - SCREEN_HEIGHT * 0.04 - 50,
  //       );
  //     });
  //     const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
  //       setViewHeight('100%');
  //     });

  //     return () => {
  //       showSubscription.remove();
  //       hideSubscription.remove();
  //     };
  //   }
  // }, []);

  return (
    <KeyboardAvoidingView style={{height: '100%', backgroundColor: 'white'}}>
      <ScrollView
        style={styles.flex1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingTop:15, ...styles.ph20}}>
        <View style={styles.loginInput}>
          <Text style={styles.loginInputHeading}>{strings['first_name']}</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              ref={ref1}
              onSubmitEditing={() => ref2.current.focus()}
              returnKeyType={'next'}
              onChangeText={text =>
                setState(prevState => ({
                  ...prevState,
                  first_name: text,
                  [`is_valid_first_name`]: !!text,
                }))
              }
              style={styles.textInput}
            />
          </View>
        </View>
        <View style={styles.loginInput}>
          <Text style={styles.loginInputHeading}>{strings['last_name']}</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              ref={ref2}
              onSubmitEditing={() => ref3.current.focus()}
              returnKeyType={'next'}
              onChangeText={text =>
                setState(prevState => ({
                  ...prevState,
                  last_name: text,
                  [`is_valid_last_name`]: !!text,
                }))
              }
              style={styles.textInput}
            />
          </View>
        </View>
        <View style={styles.loginInput}>
          <Text style={styles.loginInputHeading}>{strings['email']}</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              ref={ref4}
              onSubmitEditing={() => ref5.current.focus()}
              autoCapitalize="none"
              returnKeyType={'next'}
              onChangeText={text =>
                setState(prevState => ({
                  ...prevState,
                  email: text,
                  [`is_valid_email`]: validateEmail(text),
                }))
              }
              style={styles.textInput}
            />
            {state['email'] === '' ? (
              <SvgXml xml={SVG.infoIcon} />
            ) : state[`is_valid_email`] ? (
              <SvgXml xml={SVG.checkIcon} />
            ) : (
              <SvgXml xml={SVG.infoErrorIcon} />
            )}
          </View>
        </View>
        <View style={styles.loginInput}>
          <Text style={styles.loginInputHeading}>{strings['telephone']}</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              ref={ref3}
              onSubmitEditing={() => ref5.current.focus()}
              autoCapitalize="none"
              returnKeyType={'next'}
              onChangeText={text =>{
                setState(prevState => ({
                  ...prevState,
                  telephone: text,
                  [`is_valid_telephone`]: validateTelephone(text),
                }))}
              }
              style={styles.textInput}
            />
            {state['telephone'] === '' ? (
              <SvgXml xml={SVG.infoIcon} />
            ) : state[`is_valid_telephone`] ? (
              <SvgXml xml={SVG.checkIcon} />
            ) : (
              <SvgXml xml={SVG.infoErrorIcon} />
            )}
          </View>
        </View>
        <View style={styles.loginInput}>
          <Text style={styles.loginInputHeading}>{strings['password']}</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              ref={ref4}
              onSubmitEditing={() => ref6.current.focus()}
              returnKeyType={'next'}
              secureTextEntry={state[`secure_text_password`]}
              onChangeText={text =>
                setState(prevState => ({
                  ...prevState,
                  password: text,
                  [`is_valid_password`]: validatePassword(text),
                }))
              }
              style={styles.textInput}
            />
            <TouchableOpacity
              onPress={() =>
                setState(prevState => ({
                  ...prevState,
                  [`secure_text_password`]: !prevState[`secure_text_password`],
                }))
              }>
              {state[`secure_text_password`] ? (
                <SvgXml xml={SVG.eyeSlashIcon} />
              ) : (
                <SvgXml xml={SVG.eyeIcon} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.loginInput}>
          <Text style={styles.loginInputHeading}>
            {strings['confirm_password']}
          </Text>
          <View style={styles.loginTextInput}>
            <TextInput
              ref={ref5}
              onSubmitEditing={() => signup()}
              returnKeyType={'done'}
              secureTextEntry={state[`secure_text_confirm_password`]}
              onChangeText={text =>
                setState(prevState => ({
                  ...prevState,
                  confirm_password: text,
                  [`is_valid_new_password`]: validatePassword(text),
                }))
              }
              style={styles.textInput}
            />
            <TouchableOpacity
              onPress={() =>
                setState(prevState => ({
                  ...prevState,
                  [`secure_text_confirm_password`]:
                    !prevState[`secure_text_confirm_password`],
                }))
              }>
              {state[`secure_text_confirm_password`] ? (
                <SvgXml xml={SVG.eyeSlashIcon} />
              ) : (
                <SvgXml xml={SVG.eyeIcon} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Button
          text={strings['Sign_Up']}
          type={'primary'}
          buttonContainerStyle={{width: '100%'}}
          buttonTextStyle={{fontWeight: '400'}}
          onPress={() => signup()}
          isLoading={isLoading}
        />
        <TouchableOpacity
          style={styles.loginInfo}
          onPress={() => navigation.replace('SignInScreen')}>
          <Text style={styles.loginInfoText}>
            {strings['Already Have An Account?']}
            <Text style={styles.marginLeft10}> {strings['Login']}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;
