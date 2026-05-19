const fs = require('fs');
const path = require('path');
const FacebookAdsSDK = require('facebook-nodejs-business-sdk');
const { FacebookAdsApi, AdAccount } = FacebookAdsSDK;

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)$/);
      if (match) {
        let key = match[1];
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

const token = process.env.FB_ACCESS_TOKEN;
FacebookAdsApi.init(token);

async function testNested() {
  try {
    const actId = 'act_1211783443509987'; // Mankai 1
    console.log(`Fetching nested campaigns for ${actId}...`);
    const adAccount = new AdAccount(actId);
    
    const campaigns = await adAccount.getCampaigns([
      'id',
      'name',
      'objective',
      'status',
      'effective_status',
      'adsets{id,name,status,effective_status,ads{id,name,status,effective_status}}'
    ], { limit: 5 });

    console.log(`Fetched ${campaigns.length} campaigns:`);
    for (const camp of campaigns) {
      console.log(`\nCampaign: ${camp.name} (${camp.id}) [Status: ${camp.status}]`);
      const adsets = camp.adsets?.data || [];
      console.log(`  Ad Sets (${adsets.length}):`);
      for (const adset of adsets) {
        console.log(`    - Ad Set: ${adset.name} (${adset.id})`);
        const ads = adset.ads?.data || [];
        console.log(`      Ads (${ads.length}):`);
        for (const ad of ads) {
          console.log(`        * Ad: ${ad.name} (${ad.id})`);
        }
      }
    }
  } catch (err) {
    console.error('Error fetching nested data:', err);
  }
}

testNested();
