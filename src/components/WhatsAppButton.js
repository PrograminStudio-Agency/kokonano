import React from 'react';
import { Text,TouchableOpacity, Linking,Alert } from "react-native";
import { SvgXml } from 'react-native-svg';
import {
    styles,
    SVG,
  } from '../config';

const WhatsAppButton = () =>{
    const sendMsg = () => {
  

        // Here we are using 91 which is India Country Code.
        // You can change country code.
        let URL = 'whatsapp://send?text=Hi, I would like to know about &phone=96550240403';
     
        Linking.openURL(URL)
          .then((data) => {
          })
          .catch(() => {
            Alert.alert('Make sure Whatsapp installed on your device');
          });
      };
    return(
        <TouchableOpacity style={styles.whatsappIcon} onPress={()=>sendMsg()}>
            <SvgXml xml={SVG.whatsapp_icon}/>
        </TouchableOpacity>
    );
};
export default WhatsAppButton;