export const validateEmail = email => {
  return RegExp('[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}').test(email);
};

// TODO: Fix Validation of Telephone
export const validateTelephone = telephone => {
  return (`${telephone}`.length >= 3 && `${telephone}`.length <= 32);
};

export const validatePassword = password => {
  return /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*.-_])[\w!@#$%^&*.-_]{8,}$/.test(
    password,
  );
};

export const validateNumericInputs = (phone) => {
  return !!/^[0-9]+$/.test(phone) || phone === ''
}

export const toTitleCase = (str) => {
  const split = str.split(' ');
  let final = '';
  split.map(item => final += item[0].toUpperCase() + item.substring(1).toLocaleLowerCase() + ' ')
  return final
}

export function tConv24(time24) {
  var ts = time24;
  var H = +ts.substr(0, 2);
  var h = (H % 12) || 12;
  h = (h < 10) ? ("0" + h) : h;  // leading 0 at the left for 1 digit hours
  var ampm = H < 12 ? " AM" : " PM";
  ts = h + ts.substr(2, 3) + ampm;
  return ts;
};
export function dateFormat(date) {
  var mydate = new Date(date);
  var month = ["Jan", "Feb", "March", "April", "May", "June",
      "July", "Aug", "Sep", "Oct", "Nov", "Dec"][mydate.getMonth()];
  var str = mydate.getDate() + ' ' + month + ', ' + mydate.getFullYear();
  return str
}

export const removeTags = (str) => {
  const regex = /(<([^>]+)>)/ig;
  const noTags = str?.replace(regex, '')
  return noTags?.replace('&nbsp;', ' ');
}

export const validURL = str => {
  var pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ); // fragment locator
  return !!pattern.test(str);
};

export function calculateDiscount(sale_price, reg_price) {
  let s = parseFloat(sale_price);
  let r = parseFloat(reg_price);
  return Math.floor(((r - s) / r) * 100);
}

export const calculateDealTimeLeft = (date_on_sale_to_gmt) => {
  let difference = +new Date(date_on_sale_to_gmt) - +new Date();
  if (difference > 0) {
    return true
  }
  return false;
};

export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const filterProduct = (item) => {
  const name = item.name
    .split('&#039;').join("'")
    .split('&amp;').join('&')
    .split("&quot;").join('"')
    .split("&rsquo;").join("'")
  return {...item, name};
}

export function getRandom(arr, n) {
  if (!arr) return undefined;
  var result = new Array(n),
      len = arr?.length,
      taken = new Array(len);
  if (n > len)
      throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}


export const price = (obj) => obj.special ? (obj.special == obj.price ? obj.price : obj.special) : obj.price