const fs = require('fs');
const path = require('path');

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

// Now import the ts-node/register to run TypeScript or just mock the sync code directly
const FacebookAdsSDK = require('facebook-nodejs-business-sdk');
const { User, AdAccount, FacebookAdsApi } = FacebookAdsSDK;
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const token = process.env.FB_ACCESS_TOKEN;
FacebookAdsApi.init(token);

async function runSync() {
  try {
    console.log('Starting sync of ad accounts...');
    const me = new User('me');
    
    const fbAccounts = await me.getAdAccounts([
      'name',
      'account_id',
      'account_status',
      'currency',
      'timezone_name'
    ]);

    const accountsData = fbAccounts.map((acc) => ({
      id: acc.id,
      name: acc.name,
      account_id: acc.account_id,
      account_status: acc.account_status,
      currency: acc.currency,
      timezone_name: acc.timezone_name,
      updated_at: new Date().toISOString()
    }));

    console.log(`Upserting ${accountsData.length} accounts...`);
    const { error: accError } = await supabase
      .from('ad_accounts')
      .upsert(accountsData, { onConflict: 'id' });

    if (accError) throw accError;
    console.log('Ad accounts saved successfully.');

    const allInsights = [];

    for (const acc of fbAccounts) {
      if (acc.account_status !== 1) continue;
      
      console.log(`Fetching 90 days insights for active account: ${acc.name} (${acc.id})...`);
      try {
        const insights = await acc.getInsights([
          'spend',
          'impressions',
          'clicks',
          'reach',
          'actions',
          'outbound_clicks'
        ], {
          date_preset: 'last_90d',
          time_increment: 1
        });

        console.log(`Fetched ${insights.length} insight rows.`);

        for (const entry of insights) {
          const insight = entry._data;
          const actions = [...(insight.actions || [])];
          
          if (insight.outbound_clicks) {
            const outboundValue = insight.outbound_clicks[0]?.value || 0;
            actions.push({ action_type: 'outbound_click', value: outboundValue });
          }

          allInsights.push({
            date: insight.date_start,
            ad_account_id: acc.id,
            spend: parseFloat(insight.spend || 0),
            impressions: parseInt(insight.impressions || 0),
            clicks: parseInt(insight.clicks || 0),
            reach: parseInt(insight.reach || 0),
            results: JSON.stringify(actions),
          });
        }
      } catch (err) {
        console.error(`Error fetching insights for ${acc.name}:`, err.message);
      }
    }

    if (allInsights.length > 0) {
      console.log(`Upserting ${allInsights.length} total insight rows to Supabase...`);
      const { error: insError } = await supabase
        .from('daily_insights')
        .upsert(allInsights, { onConflict: 'date,ad_account_id' });
      
      if (insError) throw insError;
      console.log('Daily insights synced successfully!');
    } else {
      console.log('No daily insights found to sync.');
    }
  } catch (error) {
    console.error('Global Sync Error:', error);
  }
}

runSync();
