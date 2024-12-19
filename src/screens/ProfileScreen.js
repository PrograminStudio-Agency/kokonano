import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {Button} from '../components';
import {
  APIManager,
  COLORS,
  showToast,
  strings,
  styles,
  SVG,
  validateEmail,
  validatePassword,
} from '../config';
import {AuthContext, NetworkContext} from '../context';

const ProfileScreen = ({navigation, route}) => {
  const [, setConnected] = React.useContext(NetworkContext);
  const [state, setState] = React.useState({
    email: '',
    is_valid_email: false,
    first_name: '',
    is_valid_first_name: false,
    last_name: '',
    is_valid_last_name: false,
    password: '',
    is_valid_password: false,
    secure_text_password: true,
    new_password: '',
    is_valid_new_password: false,
    secure_text_new_password: true,
    confirm_password: '',
    is_valid_confirm_password: false,
    secure_text_confirm_password: true,
  });
  const [isLoading, setLoading] = React.useState(true);
  const ref1 = React.useRef();
  const ref2 = React.useRef();
  const ref3 = React.useRef();
  const ref4 = React.useRef();
  const ref5 = React.useRef();
  const ref6 = React.useRef();
  const ref7 = React.useRef();

  const [userToken, setUserToken] = React.useContext(AuthContext);

  const updateProfile = async () => {
    try {
      const formData = new FormData();

      if (!state.is_valid_email)
       formData.append('email', state.email);

      if (!state.is_valid_first_name)
        formData.append('first_name', state.first_name);

      if (!state.is_valid_last_name)
        formData.append('last_name', state.last_name);

      if (
        !state.is_valid_new_password &&
        state.new_password === state.confirm_password
      )
        {}


      const data={
        firstname:state.first_name,
        lastname:state.last_name,
        password:state.new_password,
        email: state.email,
      }

      const res = await new APIManager().updateProfile(data);
      setUserToken(res);
      showToast(strings['Account Details have been updated successfully'], strings['SUCCESS'], 'success');
      navigation.goBack();
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        console.error(err);
      }
    }
  };

  const getProfile = async () => {
    try {
      const res = await new APIManager().getProfile();
      setState(prevState => ({
        ...prevState,
        email: res.data.email,
        first_name: res.data.firstname,
        last_name: res.data.lastname,
        is_valid_email: validateEmail(res.data.email)
      }));
      setLoading(false);
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
  const [viewHeight, setViewHeight] = React.useState('100%');
  React.useEffect(() => {
    getProfile();
  }, []);

  return isLoading ? (
    <View style={styles.centerContainer}>
      <ActivityIndicator size={'large'} color={COLORS.primary} />
    </View>
  ) : (
    <View style={{height: viewHeight, backgroundColor: 'white'}}>
      <ScrollView
        style={styles.flex1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{...styles.ph20, flexGrow: 1, paddingTop:15}}>
        <View style={styles.loginInput}>
          <Text style={styles.loginInputHeading}>{strings['first_name']}</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              value={state.first_name}
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
              value={state.last_name}
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
              value={state.email}
              ref={ref4}
              onSubmitEditing={() => ref5.current.focus()}
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
          <Text style={styles.loginInputHeading}>{strings['password']}</Text>
          <View style={styles.loginTextInput}>
            <TextInput
              value={state.password}
              ref={ref5}
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
                <SvgXml xml={SVG.eyeIcon} />
              ) : (
                <SvgXml xml={SVG.eyeSlashIcon} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.loginInput}>
          <Text style={styles.loginInputHeading}>
            {strings['new_password']}
          </Text>
          <View style={styles.loginTextInput}>
            <TextInput
              value={state.new_password}
              ref={ref6}
              onSubmitEditing={() => ref7.current.focus()}
              returnKeyType={'next'}
              secureTextEntry={state[`secure_text_new_password`]}
              onChangeText={text =>
                setState(prevState => ({
                  ...prevState,
                  new_password: text,
                  [`is_valid_password`]: validatePassword(text),
                }))
              }
              style={styles.textInput}
            />
            <TouchableOpacity
              onPress={() =>
                setState(prevState => ({
                  ...prevState,
                  [`secure_text_password`]:
                    !prevState[`secure_text_new_password`],
                }))
              }>
              {state[`secure_text_new_password`] ? (
                <SvgXml xml={SVG.eyeIcon} />
              ) : (
                <SvgXml xml={SVG.eyeSlashIcon} />
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
              value={state.confirm_password}
              ref={ref7}
              onSubmitEditing={() => updateProfile()}
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
                <SvgXml xml={SVG.eyeIcon} />
              ) : (
                <SvgXml xml={SVG.eyeSlashIcon} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={{flex: 1, justifyContent: 'flex-end',}}>
          <Button
            text={strings['Update_Profile']}
            type={'primary'}
            buttonContainerStyle={{width: '100%'}}
            buttonTextStyle={{fontWeight: '400'}}
            onPress={() => updateProfile()}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
