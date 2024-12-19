import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  Platform,
  View,
  Image,
  StyleSheet
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { FlatListSlider } from 'react-native-flatlist-slider';
import { SvgXml } from 'react-native-svg';
import { Button, ProductCard, Separator, SVGwithCircle } from '../components';
import ProductImages from '../components/ProductImages';
import {
  APIManager,
  COLORS,
  dateFormat,
  removeTags,
  showToast,
  strings,
  styles,
  SVG,
  tConv24,
  validateEmail,
  price
} from '../config';
import {
  AuthContext,
  CartContext,
  CompareContext,
  NetworkContext,
  WishlistContext,
} from '../context';
import { SafeAreaView } from 'react-native-safe-area-context';

const SizeCard = ({ label, onPress, selected, index }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      ...styles.detailSizeCard,
      backgroundColor: !!selected ? COLORS.secondary : COLORS.lightGray,
      marginLeft: index === 0 ? 0 : 5,
    }}>
    <Text style={{ color: !!selected ? 'white' : COLORS.dark }}>{label}</Text>
  </TouchableOpacity>
);

const ColorCard = ({ label, onPress, selected, index }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      ...styles.detailColorCard,
      padding: !!selected ? 4 : 0,
      marginLeft: index === 0 ? 0 : 5,
    }}>
    <View
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 3,
        backgroundColor: !!label ? label : 'white',
      }}
    />
  </TouchableOpacity>
);

const ProductDetailScreen = ({ navigation, route }) => {
  const [, setConnected] = React.useContext(NetworkContext);
  const [isLoading, setLoading] = React.useState(true);
  const [reviews, setReviews] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [isLoadingMore, setLoadingMore] = React.useState(false);
  const limit = 20;
  const [hasMore, setMore] = React.useState(true);

  const [userToken] = React.useContext(AuthContext);
  const [, addCart] = React.useContext(CartContext);
  const [products, setProduct] = React.useContext(CompareContext);
  const [wishlist, addWishlist] = React.useContext(WishlistContext);

  const [selectedSize, setSize] = React.useState('');
  const [selectedColor, setColor] = React.useState('');
  const [quantity, setQuantity] = React.useState(1);
  const [text, setText] = React.useState('');
  const [product, setMainProduct] = React.useState(route?.params?.product || {});
  const [viewMore, setViewMore] = React.useState('');
  const { width } = useWindowDimensions();


  const [waitlistModal, setWaitlistModal] = React.useState(false);
  const [relatedProducts, setRelatedProducts] = React.useState();
  const [rpLoader, setRPLoader] = React.useState(true) //rp= related products
  const [productLoader, setProductLoader] = React.useState(true) //rp= related products
  const [variations, setVariations] = React.useState([]);
  
  const fetchCompleteProduct = async () => {
    try {
      setLoading(true);
      const res = await new APIManager().getProduct(product.product_id);
      if (!res.success){
        return Alert.alert('Product not found', '', [
          {
            text: 'Go Back',
            onPress: () => {
              navigation.goBack();
              setLoading(false);
            }
          }
        ],{cancelable: false})
      }
      setMainProduct(res.data);
      setReviews(res.data.reviews.review_total == 0 ? [] : res.data.reviews.reviews);
      // setReviews(res.data.reviews.reviews);
      setProductLoader(false);
      setLoading(false);
      return res.data.category;
    } catch (err) {
      if (err.message.includes('Network')) {
        setConnected(false);
        return;
      } else {
        setLoading(false);
        console.error(err);
      }
    }
  }

  const fetchRelatedProducts = async (category) => {
    const option = {
      filters: [
          {
              field: "category",
              value: `${category[0].id}`,
              operand: "=",
              logical_operand: "AND"
          },
      ],
    }
    try {
      const res = await new APIManager().getProductWithFilter(option, 1, 4);
      setRelatedProducts(res.data);
      setRPLoader(false);
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
    fetchCompleteProduct()
    .then((category)=>{
      fetchRelatedProducts(category)
    })
  }, []);

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const onScroll = async ({ nativeEvent }) => {
    if (isCloseToBottom(nativeEvent) && !isLoadingMore && hasMore) {
      setLoadingMore(true);
      try {
        const res = await new APIManager().getProductReviews(
          product?.id + `&page=${page}`,
        );
        setReviews(prevReviews => [...prevReviews, ...res]);
        setPage(prevPage => prevPage + 1);
        setMore(res.length >= limit);
        setLoadingMore(false);
      } catch (err) {
        if (err.message.includes('Network')) {
          setConnected(false);
          return;
        } else {
          // console.error(err);
          setLoadingMore(false);
        }
      }
    }
  };

  const joinWaitlist = async text => {
    if (!validateEmail(text)) {
      showToast(
        strings['Invalid Email'],
        strings['Enter Valid Email'],
        'error',
      );
      return;
    }
    // const res = await new APIManager().joinWaitlist(text, product?.id);
      showToast(strings['Subscribed'], strings['SUCCESS'], 'success');
  };

  const onJoinWaitlist = () => {
    if (!!userToken) {
      joinWaitlist(userToken.email);
    } else if (Platform.OS === 'ios') {
      Alert.prompt(
        strings['Join Waitlist'],
        strings[
        'Enter Your Email to Recieve Notification When Product Arrives'
        ],
        text => {
          joinWaitlist(text);
        },
        'plain-text',
      );
    } else {
      setWaitlistModal(true);
    }
  };

  const androidJoinWaitlist = () => {
    setWaitlistModal(false);
    joinWaitlist(text);
  };

  const image = { image: product.thumb ? product.thumb : product.image };
  const images =
    product.images && product.images.length 
    ? [image, ...product.images?.map(img => ({ image: img }))]
    : [image];

  
  
    return (
      // loading from banner
      !product?.name ? <View style={{flex: 1, justifyContent: 'center', backgroundColor: 'white'}}>
        <ActivityIndicator size={30}/>
      </View> :
    <>
      <Modal
        visible={waitlistModal}
        transparent
        onRequestClose={() => setWaitlistModal(false)}>
        <TouchableOpacity
          onPress={() => setWaitlistModal(false)}
          activeOpacity={0.4}
          style={styles.waitListModalContainer}>
          <View style={styles.waitlistHeader}>
            <Text style={styles.waitlistHeaderText}>
              {strings['Join Waitlist']}
            </Text>
            <Text style={styles.waitlistSubHeaderText}>
              {
                strings[
                'Enter Your Email to Recieve Notification When Product Arrives'
                ]
              }
            </Text>
            <TextInput
              style={styles.waitlistTextInput}
              placeholderTextColor={'gray'}
              placeholder={strings['Email address']}
              value={text}
              onChangeText={text => setText(text)}
              onSubmitEditing={() => androidJoinWaitlist()}
            />
            <View style={styles.waitlistBtnContainer}>
              <Button
                type={'secondary'}
                text={strings['Cancel']}
                onPress={() => setWaitlistModal(false)}
                buttonContainerStyle={{ width: '43%' }}
              />
              <Button
                type={'primary'}
                text={strings.submit}
                onPress={() => androidJoinWaitlist()}
                buttonContainerStyle={{ width: '43%' }}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      <ScrollView
        style={styles.productDetailScrollView}>
        {/* onScroll={onScroll}> */}
        <View>
          <View>
            {
              isLoading ? <View style={{width: "100%", height: 240, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator size={30} /></View>:
              <FlatListSlider
              data={images}
              component={<ProductImages />}
              loop={false}
              // autoscroll={false}
              timer={9000}
              onPress={() => navigation.navigate('ProductImagesScreen', { images: images?.map(img => ({ source: { uri: img.image }, caption: product.name })) })}
              indicatorActiveColor={COLORS.primary}
              indicatorInActiveColor={'#ccc'}
              indicatorActiveWidth={30}
              animation
            />
            }
          </View>
          {/* SOLD OUT CONTAINER */}
          {
            product.quantity != 0 ? null :
            <View style={{...styles.productCardImage, position: 'absolute'}}>
              <Image source={require('../assets/out-of-stock.png')} style={{...styles.productCardStock, resizeMode: 'contain'}} />
            </View>
          }
        </View>
        <Text style={styles.detailName}>{product.name}</Text>
        <View style={styles.detailPriceView}>
          <View style={{ justifyContent: 'center' }}>
            {!isNaN(Number.parseFloat(product.special)) &&
              price(product) !== product.price ? (
              <Text style={styles.detailRegularPrice}>
                {Number.parseFloat(product.price).toFixed(2)} KWD
              </Text>
            ) : null}
            <Text style={styles.detailPrice}>
              {Number.parseFloat(price(product)).toFixed(2)} KWD
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <SVGwithCircle
              xml={
                products.findIndex(obj => product.product_id === obj.product_id) === -1
                  ? SVG.compareIconWhiteSelected
                  : SVG.compareIconWhite
              }
              bgColor={
                products.findIndex(obj => product.product_id === obj.product_id) === -1
                  ? 'white'
                  : COLORS.secondary
              }
              onPress={() => setProduct(product, navigation)}
              size={30}
            />
            {userToken ? (
              <SVGwithCircle
                xml={
                  wishlist.findIndex(obj => obj.id === product.id) !== -1
                    ? SVG.heartSlider
                    : SVG.heartSliderSelected
                }
                onPress={() => addWishlist(product)}
                bgColor={COLORS.secondary}
                size={30}
              />
            ) : null}
          </View>
        </View>

        {(product.variations?.length !== 0 && !!product.attributes) ? product.attributes.map((attr, indexMain) => {
          if (attr.name === 'Size') {
            return (
              <View key={indexMain}>
                <Separator width={'100%'} />
                <Text style={styles.detailInfoHeading}>
                  {strings['Select Size']}
                </Text>
                <ScrollView horizontal style={{ marginBottom: 15 }}>
                  {attr.options.map((item, index) => (
                    <SizeCard
                      key={index}
                      label={item}
                      selected={selectedSize === product.variations[index]}
                      onPress={() => {
                        let array = variations.filter(variation => (variation.name != 'Size'))
                        array.push({ name: "Size", variation_id: product.variations[index] })
                        setVariations(array)
                        setSize(product.variations[index])
                      }}
                    />
                  ))}
                </ScrollView>
              </View>
            );
          } else if (attr.name === 'Color') {
            return (
              <View key={indexMain}>
                <Separator width={'100%'} />
                <Text style={styles.detailInfoHeading}>
                  {strings['Select Color']}
                </Text>
                <ScrollView horizontal style={{ marginBottom: 15 }}>
                  {attr.options.map((item, index) => (
                    <ColorCard
                      key={index}
                      label={item}
                      selected={selectedColor === product.variations[index]}
                      onPress={() => {
                        let array = variations.filter(variation => (variation.name != 'Color'))
                        array.push({ name: "Color", variation_id: product.variations[index] })
                        setVariations(array)
                        setColor(product.variations[index])
                      }
                      }
                    />
                  ))}
                </ScrollView>

              </View>
            );
          } else null;
        }) : null}
        {!!product.description ? (
          <>
            <TouchableOpacity onPress={() => {
              viewMore === 'desc' ? setViewMore('') : setViewMore('desc')
            }} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ ...styles.detailInfoHeading, marginBottom: 0, marginTop: 0 }}>
                {strings['Description']}
              </Text>
              <SvgXml xml={viewMore === 'desc' ? SVG.arrowIconUp : SVG.arrowIconDown} />
            </TouchableOpacity>
            {viewMore === 'desc' ?
              <Text style={{...styles.detailShortDescText, color: 'black', margin:0,marginBottom:10}}>
                <RenderHtml
                  contentWidth={width}
                  source={{html: product.description}}
                  tagsStyles={Styles}
                />
                {/* {removeTags(product.description)} */}
              </Text>
              : null}
            <Separator width={'100%'} />
          </>
        ) : null}

        {/* <Text style={styles.detailInfoHeading}>
        {strings['Additional Information']}
      </Text>
      {Object.keys(product.meta_dat).map((item, index) => (
        <View style={styles.detailAdditionalInfoView} key={index}>
          <Text style={styles.detailAdditionalInfoText}>{item}</Text>
          <Text style={styles.detailAdditionalInfoText2}>
            {product.meta_dat[item]}
          </Text>
        </View>
      ))}
      <Separator width={'100%'} /> */}

        <View style={styles.detailReviewContainer}>
          <View style={styles.detailReviewSubContainer}>
            <Text style={styles.detailReviewHeading}>{strings['Reviews']}</Text>
            <View style={styles.detailRatingView}>
              <Text style={styles.detailFont14White}>
                {product.rating}
              </Text>
              <SvgXml xml={SVG.starIconWhite} />
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ReviewScreen', {product_id: product.product_id})}>
            <Text style={styles.detailReviewHeading2}>
              {strings['Add Review']}
            </Text>
          </TouchableOpacity>
        </View>
        <Separator width={'100%'} />
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size={'large'} color={COLORS.primary} />
          </View>
        ) : reviews.length <= 0 ? (
          // <View style={styles.isLoadingMoreIndicator}>
          //   <Text style={{ fontStyle: 'italic' }}>
          //     {strings['No Reviews Found']}
          //   </Text>
          // </View>
          null
        ) : (
          reviews.map((item, index) => {
            return (
            <View style={{ marginVertical: 10 }} key={index}>
              <View style={styles.detailReviewContainer2}>
                <Text style={{ fontSize: 18, color: 'black' }}>
                  {`Review by:`} {item.author}
                </Text>
                <View style={styles.detailReviewRatingContainer}>
                  <Text style={{...styles.detailReviewRating, color: 'white'}}>{item.rating}</Text>
                  <SvgXml xml={SVG.starIconWhite} />
                </View>
              </View>
              <Text style={{...styles.detailReview, color: 'black'}}>{ removeTags(item.text)}</Text>
              <Text style={{...styles.detailReviewDate, color: 'black'}}> {item.date_added} </Text>
            </View>
          )
          }
          ))
        }
        <View style={{  marginBottom: 20 }}>
          <Text style={{ ...styles.detailInfoHeading, marginBottom: 0 }}>
            {strings['related_products']}
          </Text>

          {rpLoader ? (
            <ActivityIndicator size={'large'} color={COLORS.primary} />
          ) : (
            <View style={{ ...styles.popularProductView, justifyContent: 'space-between' }}>
              {relatedProducts.map((item, index) => (
                <ProductCard item={item} key={index} navigation={navigation} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      <SafeAreaView style={{
        backgroundColor: '#fff',
        shadowColor: '#a3a3a3',
        shadowOffset: {
          width: 4,
          height: -2,
        },
        shadowOpacity: 0.32,
        shadowRadius: 3,
        paddingTop: Platform.OS === 'ios' ? -30: - 15,
        elevation: 5,
      }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // position: 'absolute',
        // bottom: 10,
        width: '100%',
        backgroundColor: '#fff',
        zIndex: 10,
        padding: 15,
        paddingTop: 0,


      }}>
        <View style={{ ...styles.detailQuantityBtn }}>
          <Text style={styles.detailQuantityText}>{quantity}</Text>
          <View style={{ justifyContent: 'space-between', height: '70%' }}>
            <TouchableOpacity style={{ padding: 5 }} onPress={() => setQuantity(quantity + 1)}>
              <SvgXml xml={SVG.arrowIconUp} />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 5 }} onPress={() => setQuantity(prevQuantity =>
              prevQuantity <= 1 ? 1 : prevQuantity - 1,
            )}>
              <SvgXml xml={SVG.arrowIconDown} />
            </TouchableOpacity>
          </View>
        </View>
        <Button
          type={'secondary'}
          text={
            product.quantity == 0
              ? strings['Join Waitlist']
              : strings['Add_to_cart']
          }
          onPress={() => {
            if (product.quantity == 0) {
              onJoinWaitlist()
            }
            else {
              addCart(product, quantity)
            }
          }}
          buttonContainerStyle={{ width: product.quantity <= 0 ? "75%" : '35%', margin: 0 }}
          buttonTextStyle={{ fontSize: 12 }}
        />
        {product.quantity != 0 ?
          <Button
            type={'primary'}
            text={strings.buyNow}
            onPress={() => {
              addCart(product, quantity)
              navigation.navigate('CartScreen')
            }}
            buttonContainerStyle={{ width: "35%", margin: 0 }}
            buttonTextStyle={{ fontSize: 12 }}
          />
          : null}
      </View>
    </SafeAreaView>
    </>
  );
};

const Styles = StyleSheet.create({
  text: {
    color: 'black', // make links coloured pink
  },
});


export default ProductDetailScreen;
