import React, { useEffect, useState } from 'react';
import { Image, Text, View, ScrollView, Dimensions } from 'react-native';
import { Button, Separator } from '../components';
import { APIManager, capitalizeFirstLetter, COLORS, strings, styles } from '../config';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { AuthContext, NetworkContext, CartContext } from '../context';
import { showToast } from '../config';

const ReviewScreen = ({navigation, route}) => {
  const [userToken] = React.useContext(AuthContext);
  const [, setConnected] = React.useContext(NetworkContext);

  const [viewHeight, setViewHeight] = React.useState('100%');
  const [rating, setRating] = useState(1);
  const [text, setText] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [name, setName] = useState(userToken ? `${userToken.first_name} ${userToken.last_name}` : '');

  const is_text_invalid = !text || text?.length <25 || text?.length>1000;
  const is_name_invalid = !name || name?.length <3 || name?.length>25;

  const onSubmit = async () => {
    try{
      setLoading(true);
      const data = {
        name,
        rating,
        text,
      }
      
      if (is_text_invalid){
        alert('Warning: Review Text must be between 25 and 1000 characters!');
        setLoading(false);
        return;
      }
      if (is_name_invalid){
        alert('Warning: Name must be between 3 and 25 characters!');
        setLoading(false);
        return;
      }

      const {product_id} = route?.params;

      const res = await new APIManager().postProuctReview(product_id, data);
      if (res?.success){
        showToast(
           capitalizeFirstLetter(strings['SUCCESS']),
          'Review posted',
          'success',
        );
        navigation.goBack();
      }else{
        showToast(
          capitalizeFirstLetter(strings.Error),
         'Review could not be posted',
         'error',
        );
      }
      setLoading(false);
    }catch(err){
      showToast(
        capitalizeFirstLetter(strings.Error),
       'Review could not be posted',
       'error',
      );
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        console.error(err);
      }
      setLoading(false)
    }
  }

  return (
    <View style={{ height: viewHeight, backgroundColor: '#fff' }}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{...styles.checkoutScrollView, flexGrow: 1, paddingTop:0}}
      >
        {/* Rating Selector */}
        <View style={{...styles.flexRowCenter, paddingVertical: 20, borderBottomWidth: 1, borderTopWidth: 1, borderColor: COLORS.separator}}>
          <View style={{flex: 1}}>
            <Text style={{...styles.detailReviewHeading, color:COLORS.placeholder}}>{strings.rating}</Text>
          </View>
          <View style={{...styles.flexRowCenter, flex: 1.5}}>
            {
              [1,2,3,4,5].map((item, index)=>{
                const image = item <= rating ? require('../assets/star_fill.png') : require('../assets/star_empty.png');
                return (
                  <TouchableOpacity key={index} onPress={()=>{setRating(item)}} activeOpacity={0.5} style={{ width: 25, height: 25}}>
                    <Image source={image} style={{resizeMode: 'contain', width: 25, height: 25}} />
                  </TouchableOpacity>
                )
              })
            }
          </View>
        </View>

        {/* Name */}
        <View style={{marginTop: 30}}>
          <View style={{marginBottom: 10}}>
            <Text style={{...styles.detailReviewHeading, fontSize: 16, color: COLORS.loginSecureText}}>{strings['Enter Name']}</Text>
          </View>
          <View style={{flexDirection: 'column-reverse'}}>
            {/* Input */}
            <View style={{borderWidth: 1, borderColor: COLORS.separator, flex: 1}}>
              <TextInput
                style={{height:40, paddingLeft:5}}
                value={name}
                onChangeText={(value) => setName(value)}
              />
            </View>
            {/* Word Counter */}
            <View style={{position: 'absolute', alignSelf: 'flex-end', backgroundColor: 'white', margin:5, right: 2}}>
              <Text>
                <Text style={{color: is_name_invalid ? COLORS.status.Failed : COLORS.status.Completed}} >{name?.length}</Text>
                <Text>/25</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Review Text */}
        <View style={{flex: 1, marginTop: 20}}>
          <View style={{marginBottom: 10}}>
            <Text style={{...styles.detailReviewHeading, fontSize: 16, color: COLORS.loginSecureText}}>{strings['Write Your Review']}</Text>
          </View>
          <View style={{flex: 1, flexDirection: 'column-reverse'}}>
            {/* Input */}
            <View style={{borderWidth: 1, borderColor: COLORS.separator, flex: 1}}>
              <TextInput
                style={{flex: 1, textAlignVertical: 'top', paddingHorizontal:10, paddingTop:15}}
                multiline={true}
                value={text}
                onChangeText={(value) => setText(value)}
                onSubmitEditing={onSubmit}
                placeholder={'Write your review here...'}
                placeholderTextColor={'black'}
              />
            </View>
            {/* Word Counter */}
            <View style={{position: 'absolute', alignSelf: 'flex-end', backgroundColor: 'white', margin:5, right: 2}}>
              <Text>
                <Text style={{color: is_text_invalid ? COLORS.status.Failed : COLORS.status.Completed}} >{text?.length}</Text>
                <Text>/1000</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <View style={{flex: 1, justifyContent: 'flex-end',}}>
          <Button
            text={strings.submit}
            type={'primary'}
            isLoading={isLoading}
            onPress={onSubmit}
          />
        </View>
      </ScrollView>
    </View>
  )
}

export default ReviewScreen