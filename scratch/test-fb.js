const fs = require('fs');
const path = require('path');
const FacebookAdsSDK = require('facebook-nodejs-business-sdk');
const { FacebookAdsApi, User, AdAccount } = FacebookAdsSDK;

// Load env
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
if (!token) {
  console.log('Error: FB_ACCESS_TOKEN not set.');
  process.exit(1);
}

FacebookAdsApi.init(token);

async function testFb() {
  try {
    const me = new User('me');
    const accounts = await me.getAdAccounts([
      'id',
      'name',
      'account_status'
    ]);

    console.log(`\nFound ${accounts.length} Ad Accounts:`);
    for (const acc of accounts) {
      console.log(`- ${acc.name} (${acc.id}) [Status: ${acc.account_status}]`);
      
      // Let's query campaigns for the first active account
      if (acc.account_status === 1) {
        console.log(`\nFetching campaigns for active account: ${acc.name}...`);
        const adAccountObj = new AdAccount(acc.id);
        const campaigns = await adAccountObj.getCampaigns([
          'id',
          'name',
          'objective',
          'status',
          'effective_status'
        ], { limit: 10 });
        
        console.log(`Found ${campaigns.length} campaigns:`);
        for (const camp of campaigns) {
          console.log(`  * ${camp.name} (${camp.id}) [Objective: ${camp.objective}]`);
        }
      }
    }
  } catch (err) {
    console.error('Error querying Meta API:', err);
  }
}

testFb();
