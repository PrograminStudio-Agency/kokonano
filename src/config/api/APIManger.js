import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseApiManager from './BaseAPIManager';
import config from './config';

export default class APIManager {
  constructor() { }

  filterProduct(item) {
    const name = item.name
      .split('&#039;').join("'")
      .split('&amp;').join('&')
      .split("&quot;").join('"')
      .split("&rsquo;").join("'")
    return { ...item, name };
  }

  filteredResponse(response) {
    const data = response?.data?.map(item => this.filterProduct(item))
    return { ...response, data };
  }

  // Generate Session Token
  async sessionToken() {
    const old_token = await AsyncStorage.getItem('token');

    const parameters = {
      client_id: config.client_id,
      client_secret: config.client_secret,
      old_token,
    }
    const obj = new BaseApiManager();
    const response = await obj.postNoKeysJson(config.php + '/gettoken&grant_type=client_credentials', parameters);
    return response;
  }

  // Account
  async userLogin(parameters) {
    const obj = new BaseApiManager();
    const response = await obj.postNoKeys(config.php_rest + "/login/login", parameters);
    return response;
  }

  async userLogout() {
    const obj = new BaseApiManager();
    const response = await obj.postNoKeys(config.php_rest + "/logout/logout", {});
    return response;
  }

  async userRegistration(parameters) {
    const obj = new BaseApiManager();
    const response = await obj.postNoKeys(config.php_rest + '/register/register', parameters);
    return response;
  }

  async getProfile() {
    const obj = new BaseApiManager();
    const response = await obj.getNoKeys(config.php_rest + '/account/account');
    return response;
  }

  async updateProfile(parameters) {
    const obj = new BaseApiManager();
    const response = await obj.putNoKeysJson(config.php_rest + '/account/account', parameters);
    return response;
  }

  async forgetPassword(parameters) {
    const obj = new BaseApiManager();
    const response = await obj.postNoKeys(
      config.php_rest + '/forgotten/forgotten',
      parameters,
    );
    return response;
  }

  // Addresses
  async getAddresses() {
    const obj = new BaseApiManager();
    const response = await obj.getNoKeys(config.php_rest + '/account/address');
    return response;
  }
  async getAddress(id) {
    const obj = new BaseApiManager();
    const response = await obj.getNoKeys(config.php_rest + `/account/address&id=${id}`);
    return response;
  }
  async getCustomFields() {
    const obj = new BaseApiManager();
    const response = await obj.getNoKeys(config.php_rest + '/account/customfield');
    return response;
  }
  async addAddresses(address) {
    const obj = new BaseApiManager();
    const response = await obj.postNoKeysJson(config.php_rest + '/account/address', address);
    return response;
  }
  async updateAddresses(address, id) {
    const obj = new BaseApiManager();
    const response = await obj.putNoKeysJson(config.php_rest + `/account/address&id=${id}`, address);
    return response;
  }
  async deleteAddresses(id) {
    const obj = new BaseApiManager();
    const response = await obj.deleteNoKeys(config.php_rest + `/account/address&id=${id}`);
    return response;
  }
  async getZones(countryID) {
    const obj = new BaseApiManager();
    const response = await obj.getNoKeys(config.php + `/countries&id=${countryID}`);
    return response;
  }
  async getShippingAddress() {
    const obj = new BaseApiManager();
    const response = await obj.getNoKeys(config.php_rest + `/shipping_address/shippingaddress`);
    return response;
  }
  async getBillingAddress() {
    const obj = new BaseApiManager();
    const response = await obj.getNoKeys(config.php_rest + `/payment_address/paymentaddress`);
    return response;
  }
  async setShippingAddress(address_id) {
    const obj = new BaseApiManager();
    const response = await obj.postNoKeysJson(
      config.php_rest + '/shipping_address/shippingaddress&existing=1', { address_id }
    )
    this.setBillingAddress(address_id);
    return response;
  }
  async setBillingAddress(address_id) {
    const obj = new BaseApiManager();
    const response = await obj.postNoKeysJson(
      config.php_rest + '/payment_address/paymentaddress&existing=1', { address_id }
    )
    return response;
  }

  // guest address
  async createGuest(address) {
    const obj = new BaseApiManager();
    const response = await obj.postNoKeysJson(
      config.php_rest + '/guest/guest', address
    )
    this.setGuest(address);
    return response;
  }
  async setGuest(address) {
    const obj = new BaseApiManager();
    const response = await obj.postNoKeysJson(
      config.php_rest + '/guest_shipping/guestshipping', address
    )
    return response;
  }

  async guest(address) {
    const res1 = await this.createGuest(address);
    const res2 = await this.setGuest(address);

    return { res1, res2 };
  }

  // Catalogue

  async getBanners() {
    const obj = new BaseApiManager();
    const response = await obj.getNoKeys(config.php_rest + '/home_layout');
    return response;
  }

  async getManufacturer(id) {
    const obj = new BaseApiManager();
    const response = await obj.getNoKeys(config.php + '/manufacturers&id=' + id);
    return response;
  }

  async getAllCategories(page) {
    const obj = new BaseApiManager();
    const response = await obj.getNoKeysCategories(
      config.php + '/categories&extended=1&limit=100&page=' + page,
    );
    return response;
  }

  async getProductsByCategory(id, limit = 4, page = 1) {
    const obj = new BaseApiManager();
    const response = await obj.getNoKeys(
      config.php + `/products&category=${id}&limit=${limit}&page=${page}`,
    );
    return this.filteredResponse(response);
  }

  async getProducts(parameters) {
    const obj = new BaseApiManager();
    var route = config.php + parameters;
    const response = await obj.getNoKeys(route);

    return this.filteredResponse(response);
  }

  async getProduct(product_id) {
    const obj = new BaseApiManager();
    const response = await obj.getNoKeys(
      // config.url + '/products/' + product_id,
      config.php + '/products&id=' + product_id,
    );
    return response?.success
      ? { ...response, data: this.filterProduct(response.data) }
      : response;
  }

  async getProductReviews(id) {
    const obj = new BaseApiManager();
    const response = await obj.getNoKeys(
      // config.url + `/products/${id}/reviews`,
      config.php + `/reviews&id=${id}`,
    );
    return response;
  }

  async postProuctReview(product_id, data) {
    const obj = new BaseApiManager();
    const response = await obj.postNoKeysJson(
      config.php + `/reviews&id=${product_id}`, data
    );
    return response;
  }

  async getProductWithFilter(filter, page = 1, limit = 10) {
    const obj = new BaseApiManager();
    const filters = [...(filter?.filters ? filter?.filters : [])
    ,{
      "field": "quantity",
      "operand": "!=",
      "value": "0",
      "logical_operand": "and"
    }
    ];
    const response = await obj.postNoKeysJson(
      // config.url + `/products/custom_search/limit/${limit}/page/${page}`, filter
      config.php + `/search&limit=${limit}&page=${page}`, { ...filter, filters }
    );

    return typeof response == 'string' ? response : this.filteredResponse(response);
  }

  async joinWaitlist(email, product_id) {
    const obj = new BaseApiManager();
    const response = await obj.get(config.waitlist + '?&user_email=' + email + '&product_id=' + product_id);
    return response;
  }

  async getWishlistShareKey(user_id) {
    const share_key = await AsyncStorage.getItem("share_key");
    if (!!share_key) return typeof share_key === 'string' ? share_key : JSON.parse(share_key);

    const obj = new BaseApiManager();
    const response = await obj.get(config.apiURL + 'wishlist/get_by_user/' + user_id + '?');
    await AsyncStorage.setItem("share_key", response[0].share_key);
    return response[0].share_key;
  }

  async getWishlist() {
    const obj = new BaseApiManager();
    const response = await obj.getNoKeys(config.php_rest + '/wishlist/wishlist');
    return response;
  }

  async addWishlist(product_id) {
    const obj = new BaseApiManager();
    const response = await obj.postNoKeysJson(config.php_rest + '/wishlist/wishlist&id' + product_id);
    return response;
  }

  async removeWishlist(item) {
    const obj = new BaseApiManager();
    const response = await obj.postNoKeysJson(config.php_rest + '/wishlist/wishlist&id' + product_id);
    return response;
  }

  // Cart

  async addItemsToCart(items) {
    const obj = new BaseApiManager();
    const clearCart = await obj.deleteNoKeys(config.php_rest + '/cart/emptycart');
    const bulkAdd = await obj.postNoKeysJson(config.php_rest + '/cart/bulkcart', items);
    return bulkAdd;
  }

  async getCart(items) {
    const obj = new BaseApiManager();
    const clearCart = await obj.deleteNoKeys(config.php_rest + '/cart/emptycart');
    const bulkAdd = await obj.postNoKeysJson(config.php_rest + '/cart/bulkcart', items);
    const response = await obj.getNoKeys(config.php_rest + '/cart/cart');
    return response;
  }

  async verifyCoupon(code) {
    const obj = new BaseApiManager();
    var response = await obj.postNoKeysJson(config.php_rest + '/cart/coupon', { coupon: code });
    if (response.error.length) {
      response = await obj.postNoKeysJson(config.php_rest + '/cart/voucher', { voucher: code });
      return { ...response, message: { code: response.message, type: 'voucher' } };
    }
    return { ...response, message: { code: response.message, type: 'coupon' } };
  }

  async removeCoupon(type) {
    const obj = new BaseApiManager();
    var response;
    if (type == 'coupon') response = await obj.deleteNoKeys(config.php_rest + '/cart/coupon');
    else response = await obj.deleteNoKeys(config.php_rest + '/cart/voucher');
    return response
  }


  // Order

  async addOrder(parameters) {
    const obj = new BaseApiManager();
    const response = await obj.postJson(config.apiURL + 'orders?', parameters);
    return response;
  }

  async getOrders() {
    const obj = new BaseApiManager();
    const response = await obj.getNoKeys(config.php_rest + '/order/orders&limit=10&page=1');
    return response;
  }

  async getOrderDetail(order_id) {
    const obj = new BaseApiManager();
    const response = await obj.getNoKeys(config.php_rest + '/order/orders&id=' + order_id);
    const products = response?.data?.products?.map(item => this.filterProduct(item));
    return { ...response, data: { ...response.data, products } };
  }

  async getShippingMethods() {
    const obj = new BaseApiManager();
    const response = await obj.getNoKeys(config.php_rest + '/shipping_method/shippingmethods');
    return response;
  }
  async getPaymentMethods() {
    const obj = new BaseApiManager();
    const response = await obj.getNoKeys(config.php_rest + '/payment_method/payments');
    return response;
  }

  async selectShippingMethod(method) {
    const data = {
      shipping_method: method.quote[0].code,
    }
    const obj = new BaseApiManager();
    const response = await obj.postNoKeysJson(config.php_rest + '/shipping_method/shippingmethods', data);
    return response;
  }
  async selectPaymentMethod(method) {
    const data = {
      payment_method: method?.code,
      agree: 1,
    }
    const obj = new BaseApiManager();
    const response = await obj.postNoKeysJson(config.php_rest + '/payment_method/payments', data);
    return response;
  }

  async getOrderReview() {
    const obj = new BaseApiManager();
    const response = await obj.postNoKeysJson(config.php_rest + '/confirm/confirm');
    const products = response?.data?.products?.map(item => this.filterProduct(item));
    return { ...response, data: { ...response.data, products } };
  }
  async getPayView() {
    const obj = new BaseApiManager();
    const response = await obj.getNoKeys(config.php_rest + '/confirm/confirm&page=pay');
    return response;
  }
  async placeOrder() {
    const obj = new BaseApiManager();
    const response1 = await obj.postNoKeysJson(config.php_rest + '/confirm/confirm');
    const products = response?.data?.products?.map(item => this.filterProduct(item));

    const response = await obj.putNoKeysJson(config.php_rest + '/confirm/confirm');
    return { ...response, data: { ...response1.data, products } };
  }
  async updateOrder(order, comment) {
    const obj = new BaseApiManager();
    const data = {
      order_status_id: order.order_status_id ? order.order_status_id : 1,
      notify: 0,
      comment: comment,
    }
    const response = await obj.putNoKeysJson(config.php + `/orderhistory&id=${order.order_id}`, data);
    return response;
  }

  async getWebView(page_id) {
    const obj = new BaseApiManager();
    const response = await obj.get(config.wp + 'pages/' + page_id + '?');
    return response;
  }

  async newsletter(flag) {
    const obj = new BaseApiManager();
    const response = await obj.putNoKeysJson(config.php_rest + `/account/newsletter&subscribe=` + (flag ? 1 : 0));
    return response;
  }
}
