-- 0. Bảng Tài Khoản Quảng Cáo (Ad Accounts)
CREATE TABLE ad_accounts (
    id TEXT PRIMARY KEY, -- ID từ Facebook (ví dụ: act_12345)
    name TEXT NOT NULL,
    account_id TEXT,
    account_status INTEGER,
    currency TEXT,
    timezone_name TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Bảng Chiến Dịch (Campaigns)
CREATE TABLE campaigns (
    id TEXT PRIMARY KEY, -- ID từ Facebook
    ad_account_id TEXT REFERENCES ad_accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT,
    objective TEXT,
    buying_type TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    stop_time TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng Nhóm Quảng Cáo (Ad Sets)
CREATE TABLE ad_sets (
    id TEXT PRIMARY KEY,
    ad_account_id TEXT REFERENCES ad_accounts(id) ON DELETE CASCADE,
    campaign_id TEXT REFERENCES campaigns(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT,
    billing_event TEXT,
    optimization_goal TEXT,
    daily_budget BIGINT,
    lifetime_budget BIGINT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bảng Quảng Cáo (Ads)
CREATE TABLE ads (
    id TEXT PRIMARY KEY,
    ad_account_id TEXT REFERENCES ad_accounts(id) ON DELETE CASCADE,
    adset_id TEXT REFERENCES ad_sets(id) ON DELETE CASCADE,
    campaign_id TEXT REFERENCES campaigns(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT,
    creative_id TEXT,
    preview_shareable_link TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bảng Chỉ Số Hiệu Suất Theo Ngày (Daily Insights)
CREATE TABLE daily_insights (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    ad_account_id TEXT REFERENCES ad_accounts(id) ON DELETE CASCADE,
    ad_id TEXT REFERENCES ads(id) ON DELETE CASCADE,
    adset_id TEXT REFERENCES ad_sets(id) ON DELETE CASCADE,
    campaign_id TEXT REFERENCES campaigns(id) ON DELETE CASCADE,
    
    -- Chỉ số cốt lõi
    spend DECIMAL(12,2) DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    
    -- Kết quả (Conversations, Website Purchase...)
    results JSONB DEFAULT '{}',
    
    -- Chỉ số tính toán
    cpc DECIMAL(12,2),
    cpm DECIMAL(12,2),
    ctr DECIMAL(5,2),
    cpp DECIMAL(12,2),
    roas DECIMAL(12,2),
    
    UNIQUE(date, ad_account_id, campaign_id, adset_id, ad_id)
);

-- 5. Bảng Cảnh Báo AI (AI Alerts)
CREATE TABLE ai_alerts (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL, -- danger, warning, success, info
    title TEXT NOT NULL,
    message TEXT,
    target_id TEXT,
    ad_account_id TEXT REFERENCES ad_accounts(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
