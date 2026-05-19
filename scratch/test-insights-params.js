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

async function testNestedInsightsParams() {
  try {
    const actId = 'act_1211783443509987'; // Mankai 1
    console.log(`Fetching nested campaigns WITH historical insights for ${actId}...`);
    const adAccount = new AdAccount(actId);
    
    const campaigns = await adAccount.getCampaigns([
      'id',
      'name',
      'objective',
      'status',
      'effective_status',
      'insights.date_preset(last_90d){spend,impressions,clicks,reach,actions}',
      'adsets{id,name,status,effective_status,insights.date_preset(last_90d){spend,impressions,clicks,reach,actions},ads{id,name,status,effective_status,insights.date_preset(last_90d){spend,impressions,clicks,reach,actions}}}'
    ], { 
      limit: 10
    });

    console.log(`Fetched ${campaigns.length} campaigns:`);
    for (const camp of campaigns) {
      const insights = camp.insights?.data || [];
      const spend = insights[0]?.spend || 0;
      console.log(`\nCampaign: ${camp.name} (${camp.id}) [Spend: $${spend}]`);
      
      const adsets = camp.adsets?.data || [];
      for (const adset of adsets) {
        const adsetSpend = adset.insights?.data?.[0]?.spend || 0;
        console.log(`  - Ad Set: ${adset.name} (${adset.id}) [Spend: $${adsetSpend}]`);
        
        const ads = adset.ads?.data || [];
        for (const ad of ads) {
          const adSpend = ad.insights?.data?.[0]?.spend || 0;
          console.log(`    * Ad: ${ad.name} (${ad.id}) [Spend: $${adSpend}]`);
        }
      }
    }
  } catch (err) {
    console.error('Error fetching nested insights:', err);
  }
}

testNestedInsightsParams();
