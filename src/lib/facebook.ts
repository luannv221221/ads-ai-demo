// @ts-ignore
import { FacebookAdsApi } from 'facebook-nodejs-business-sdk';

const accessToken = process.env.FB_ACCESS_TOKEN;
const appSecret = process.env.FB_APP_SECRET;
const appId = process.env.NEXT_PUBLIC_FB_APP_ID;

if (accessToken) {
  FacebookAdsApi.init(accessToken);
}

export const fbApi = FacebookAdsApi;
export { appId, appSecret, accessToken };
