const fs = require('fs');
const path = require('path');
const FacebookAdsSDK = require('facebook-nodejs-business-sdk');
const { FacebookAdsApi, User, AdAccount } = FacebookAdsSDK;

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

async function findSpend() {
  try {
    const me = new User('me');
    const accounts = await me.getAdAccounts([
      'id',
      'name',
      'account_status'
    ]);

    for (const acc of accounts) {
      if (acc.account_status !== 1) continue;
      console.log(`Checking account: ${acc.name} (${acc.id})...`);
      const adAccount = new AdAccount(acc.id);
      
      const insights = await adAccount.getInsights([
        'campaign_id',
        'campaign_name',
        'spend',
        'impressions',
        'clicks'
      ], {
        date_preset: 'last_90d',
        level: 'campaign',
        limit: 10
      });
      
      if (insights.length > 0) {
        console.log(`  -> Found ${insights.length} campaigns with spend in the last 90 days!`);
        for (const ins of insights) {
          console.log(`     * ${ins.campaign_name}: Spend = ${ins.spend}, Impressions = ${ins.impressions}`);
        }
      } else {
        console.log(`  -> No spend in the last 90 days.`);
      }
    }
  } catch (err) {
    console.error('Error scanning accounts:', err);
  }
}

findSpend();
