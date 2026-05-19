const fs = require('fs');
const path = require('path');

// Read env.local or env manually
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Error: Supabase environment variables not configured.');
  console.log('supabaseUrl:', supabaseUrl);
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
  try {
    const { data: accounts, error: accErr } = await supabase.from('ad_accounts').select('id, name');
    console.log(`\n=== AD ACCOUNTS (${accounts?.length || 0}) ===`);
    console.log(accounts);

    const { data: campaigns, error: campErr } = await supabase.from('campaigns').select('id, name, status, ad_account_id');
    console.log(`\n=== CAMPAIGNS (${campaigns?.length || 0}) ===`);
    console.log(campaigns?.slice(0, 10));

    const { data: insights, error: insErr } = await supabase.from('daily_insights').select('id, date, ad_account_id, campaign_id, spend').limit(5);
    console.log(`\n=== DAILY INSIGHTS (${insights?.length || 0}) ===`);
    console.log(insights);

  } catch (err) {
    console.error('Error running check:', err);
  }
}

checkDb();
