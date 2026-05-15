'use server';

const FacebookAdsSDK = require('facebook-nodejs-business-sdk');
const { User, AdAccount, FacebookAdsApi } = FacebookAdsSDK;
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const initApi = () => {
  const accessToken = process.env.FB_ACCESS_TOKEN;
  if (!accessToken) throw new Error('Chưa cấu hình Access Token');
  FacebookAdsApi.init(accessToken);
};

export async function syncAllAccounts() {
  try {
    if (!isSupabaseConfigured) {
      throw new Error('Chưa cấu hình Supabase URL/Key trong .env.local');
    }

    initApi();
    const me = new User('me');
    
    const fbAccounts = await me.getAdAccounts([
      'name',
      'account_id',
      'account_status',
      'currency',
      'timezone_name'
    ]);

    const accountsData = fbAccounts.map((acc: any) => ({
      id: acc.id,
      name: acc.name,
      account_id: acc.account_id,
      account_status: acc.account_status,
      currency: acc.currency,
      timezone_name: acc.timezone_name,
      updated_at: new Date().toISOString()
    }));

    const { error: accError } = await supabase
      .from('ad_accounts')
      .upsert(accountsData, { onConflict: 'id' });

    if (accError) throw accError;

    const allInsights = [];

    for (const acc of fbAccounts) {
      if (acc.account_status !== 1) continue;

      // Lấy dữ liệu 7 ngày gần nhất để bộ lọc hoạt động tốt
      const insights = await (acc as any).getInsights([
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

      console.log(`[Sync] Fetched ${insights.length} insight rows from Meta API for account ${acc.id}.`);

      for (const entry of insights) {
        const insight = (entry as any)._data;
        
        // Gộp các chỉ số đặc thù vào mảng actions để lưu vào JSONB
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
      console.log(`[Sync] Successfully processed and saved insights for ${acc.id}.`);
    }

    if (allInsights.length > 0) {
      const { error: insError } = await supabase
        .from('daily_insights')
        .upsert(allInsights, { onConflict: 'date,ad_account_id' });
      
      if (insError) throw insError;
    }

    return { success: true, count: accountsData.length, synced: allInsights.length };
  } catch (error: any) {
    console.error('Sync Error:', error);
    return { success: false, error: error.message };
  }
}
