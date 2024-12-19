const isSandBox = false;

// Get these URL from `https://developer.hesabe.com/` -> Environments
// Replace `https://sandbox.hesabe.com` with Test URL or Production URL.
export const CHECKOUT_URL = isSandBox
  ? "https://sandbox.hesabe.com/checkout"
  : "https://api.hesabe.com/checkout";
export const PAYMENT_URL = isSandBox
  ? "https://sandbox.hesabe.com/payment?data="
  : "https://api.hesabe.com/payment?data=";
// Get below values from Merchant Panel, Profile section
export const ACCESS_CODE = isSandBox
  ? "c333729b-d060-4b74-a49d-7686a8353481"
  : "eab4c498-c615-4f24-868e-1f170096d99a";
export const MERCHANT_KEY = isSandBox
  ? "PkW64zMe5NVdrlPVNnjo2Jy9nOb7v1Xg"
  : "1ynZVKb52E7ra0BR5128BO4qYmNz03WM";
export const MERCHANT_IV = isSandBox ? "5NVdrlPVNnjo2Jy9" : "2E7ra0BR5128BO4q";
export const MERCHANT_CODE = isSandBox ? "842217" : "4123118";
// This URL are defined by you to get the response from Payment Gateway
// export const RESPONSE_URL = "http://success.hesbstaging.com";
// export const FAILURE_URL = "http://failure.hesbstaging.com";

export const RESPONSE_URL = "https://programinstudio.com/success.php";
export const FAILURE_URL = "https://programinstudio.com/fail.php";

export default {
  CHECKOUT_URL,
  PAYMENT_URL,
  ACCESS_CODE,
  MERCHANT_KEY,
  MERCHANT_IV,
  MERCHANT_CODE,
  RESPONSE_URL,
  FAILURE_URL,
};
