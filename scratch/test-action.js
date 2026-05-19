const fs = require('fs');
const path = require('path');

// Manual env parsing
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = val;
    }
  });
}

async function testAction() {
  console.log('Testing getRealCampaignsData action...');
  const accessToken = process.env.FB_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('FB_ACCESS_TOKEN is missing in .env.local!');
    return;
  }

  const activeAccount = { id: 'act_1145991459997754', name: 'Mankai3' };
  console.log(`Using active account: ${activeAccount.name} (${activeAccount.id})`);

  const FacebookAdsSDK = require('facebook-nodejs-business-sdk');
  const { FacebookAdsApi, AdAccount } = FacebookAdsSDK;
  FacebookAdsApi.init(accessToken);

  const adAccount = new AdAccount(activeAccount.id);
  console.log('Querying Facebook Campaigns structural tree...');
  
  try {
    const campaigns = await adAccount.getCampaigns([
      'id',
      'name',
      'objective',
      'status',
      'effective_status',
      'insights.date_preset(last_90d){spend,impressions,clicks,reach,actions}',
      'adsets{id,name,status,effective_status,insights.date_preset(last_90d){spend,impressions,clicks,reach,actions},ads{id,name,status,effective_status,insights.date_preset(last_90d){spend,impressions,clicks,reach,actions}}}'
    ], {
      limit: 3
    });

    console.log(`Successfully fetched ${campaigns.length} campaigns!`);
    for (const c of campaigns) {
      const cData = c._data;
      console.log(`\n- Campaign: ${cData.name} (${cData.id}) [${cData.objective}]`);
      const cInsights = cData.insights?.data?.[0] || { spend: 0 };
      console.log(`  Spend: $${cInsights.spend || 0}`);
      
      const adsets = cData.adsets?.data || [];
      console.log(`  Ad Sets (${adsets.length}):`);
      for (const as of adsets.slice(0, 2)) {
        console.log(`    * Ad Set: ${as.name} (${as.id})`);
        const ads = as.ads?.data || [];
        console.log(`      Ads (${ads.length}):`);
        for (const ad of ads.slice(0, 2)) {
          console.log(`        - Ad: ${ad.name} (${ad.id})`);
        }
      }
    }
    console.log('\n✅ Dynamic action fetch completed successfully!');
  } catch (err) {
    console.error('API Error:', err);
  }
}

testAction();
