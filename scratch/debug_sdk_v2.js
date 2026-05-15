const FacebookAdsSDK = require('facebook-nodejs-business-sdk');
const keys = Object.keys(FacebookAdsSDK);
const userKeys = keys.filter(k => k.toLowerCase().includes('user'));
console.log('User related keys:', userKeys);
