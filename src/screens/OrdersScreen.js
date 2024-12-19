import React from 'react';
import {ActivityIndicator, Text, ScrollView, View} from 'react-native';
import {OrderCard} from '../components';
import {APIManager, COLORS, sampleOrder, strings, styles} from '../config';
import {AuthContext, NetworkContext} from '../context';

const OrdersScreen = ({navigation, route}) => {
  const [, setConnected] = React.useContext(NetworkContext);
  const [isLoading, setLoading] = React.useState([]);
  const [orders, setOrders] = React.useState([]);

  const [userToken] = React.useContext(AuthContext);

  const fetchOrder = async () => {
    try {
      const res = await new APIManager().getOrders();
      setOrders(res.data);
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

  React.useEffect(() => {
    fetchOrder();
  }, []);

  return (
    <View style={{height: '100%', backgroundColor: 'white'}}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cartScrollView}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size={'large'} color={COLORS.primary} />
          </View>
        ) : orders.length <= 0 ? (
          <View>
            <Text style={{fontStyle: 'italic', marginVertical: 10}}>
              {strings['No Items Found']}
            </Text>
          </View>
        ) : (
          <View style={styles.cartProductView}>
            {orders.map((item, index) => (
              <OrderCard item={item} navigation={navigation} key={index} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default OrdersScreen;
