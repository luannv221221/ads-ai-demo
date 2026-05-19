const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
  console.log('Querying Supabase database ad_accounts...');
  try {
    const { data: accounts, error } = await supabase
      .from('ad_accounts')
      .select('*');
      
    if (error) {
      console.error('Supabase Error:', error);
      return;
    }
    
    console.log(`Found ${accounts.length} ad accounts in database:`);
    accounts.forEach(acc => {
      console.log(`- ${acc.name} (${acc.id}) [status: ${acc.account_status}]`);
    });
  } catch (err) {
    console.error('Execution Error:', err);
  }
}

checkDb();
