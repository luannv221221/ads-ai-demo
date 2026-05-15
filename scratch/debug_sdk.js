const FacebookAdsSDK = require('facebook-nodejs-business-sdk');
console.log('Keys in SDK:', Object.keys(FacebookAdsSDK));
if (FacebookAdsSDK.AdUser) {
    console.log('AdUser is present');
} else {
    console.log('AdUser is MISSING at top level');
}
