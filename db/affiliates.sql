-- ==========================================================
-- 聯盟／合作推廣共用資料表 (affiliates)
-- 規格文件：docs/affiliate-integration-spec.md
-- 執行目標：SUP_DATABASE_URL 指向的資料庫（與本專案主資料庫 DATABASE_URL 分開）
-- ==========================================================

CREATE TABLE IF NOT EXISTS affiliates (
  project_name TEXT NOT NULL DEFAULT 'veggieprice-tw',
  id          TEXT NOT NULL,
  enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  sponsored   BOOLEAN NOT NULL DEFAULT FALSE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  cta_label   TEXT NOT NULL,
  url         TEXT NOT NULL,
  icon        TEXT,
  categories  TEXT[] NOT NULL DEFAULT ARRAY['all']::TEXT[],
  crops       TEXT[],
  priority    INTEGER NOT NULL DEFAULT 0,
  partner     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (project_name, id)
);

CREATE INDEX IF NOT EXISTS idx_affiliates_project_enabled ON affiliates(project_name, enabled);

-- ----------------------------------------------------------------
-- 本專案 (project_name = 'estate'，對應 TELEMETRY_PROJECT_KEY) 的種子資料
-- categories 沿用本站既有慣例，非 spec 範例值：
--   all / furniture / appliance / home / finance
-- ----------------------------------------------------------------

-- 1) 首頁／搜尋頁跑馬燈：從 src/components/AffiliateMarquee.tsx 遷移的既有真實聯盟連結。
--    enabled = TRUE，立即可用；categories = ['all']（跑馬燈不分類別，見 spec 4.3）。
INSERT INTO affiliates (
  project_name, id, enabled, sponsored, title, description, cta_label, url,
  icon, categories, crops, priority, partner
) VALUES
  ('estate', 'dyson',          TRUE, FALSE, 'Dyson 官方旗艦店',        '入厝清潔家電選購推薦。',       '立即前往', 'https://igamepark.biz/3RVRZ',  NULL, ARRAY['all'], NULL, 150, 'Dyson'),
  ('estate', 'momo',           TRUE, FALSE, 'momo 購物網',             '家電家具一站購足，到貨快速。', '立即前往', 'https://shopsquare.co/3RVRb',  NULL, ARRAY['all'], NULL, 140, 'momo購物'),
  ('estate', 'shopee',         TRUE, FALSE, '蝦皮購物',                '入厝生活用品高 CP 值選購。',   '立即前往', 'https://buyforfun.biz/3RVRf',  NULL, ARRAY['all'], NULL, 130, '蝦皮購物'),
  ('estate', 'yahoo-shopping', TRUE, FALSE, 'Yahoo 購物中心',          '新家用品與家電優惠選購。',     '立即前往', 'https://dreamstore.info/3RVRg', NULL, ARRAY['all'], NULL, 120, 'Yahoo購物'),
  ('estate', 'hola',           TRUE, FALSE, 'HOLA 和樂家居',           '寢具、廚房與居家布置選品。',   '立即前往', 'https://whitehippo.net/3RVRi', NULL, ARRAY['all'], NULL, 110, 'HOLA 和樂家居'),
  ('estate', 'anice',          TRUE, FALSE, 'Anice 雅妮詩居家',        '居家寢飾與布置選品推薦。',     '立即前往', 'https://igrape.net/3RVRj',     NULL, ARRAY['all'], NULL, 100, 'Anice 雅妮詩居家'),
  ('estate', 'electrolux',     TRUE, FALSE, '伊萊克斯 Electrolux',     '入厝大型家電選購推薦。',       '立即前往', 'https://buyforfun.biz/3RVRn',  NULL, ARRAY['all'], NULL, 90,  '伊萊克斯 Electrolux'),
  ('estate', 'irest',          TRUE, FALSE, '睡眠達人 irest',          '新家寢具與睡眠品質升級。',     '立即前往', 'https://dreamstore.info/3RVRp', NULL, ARRAY['all'], NULL, 80,  '睡眠達人 irest'),
  ('estate', 'pure-sleep',     TRUE, FALSE, 'Pure Sleep 純好眠',       '床墊與寢具選購推薦。',         '立即前往', 'https://onelink.one/s/BABqC',  NULL, ARRAY['all'], NULL, 70,  'Pure Sleep 純好眠'),
  ('estate', 'mr-bed',         TRUE, FALSE, 'Mr. Bed 倍得先生',        '床墊選購與睡眠健康推薦。',     '立即前往', 'https://onelink.one/s/1YEY7',  NULL, ARRAY['all'], NULL, 60,  'Mr. Bed 倍得先生'),
  ('estate', 'presto',         TRUE, FALSE, 'Presto 可易家電',         '入厝家電選購推薦。',           '立即前往', 'https://linkgo.one/s/PAeKf',   NULL, ARRAY['all'], NULL, 50,  'Presto 可易家電'),
  ('estate', 'emma-mattress',  TRUE, FALSE, 'Emma 床墊',               '新家床墊選購推薦。',           '立即前往', 'https://onelink.one/s/05gyY',  NULL, ARRAY['all'], NULL, 40,  'Emma 床墊'),
  ('estate', 'lg',             TRUE, FALSE, 'LG 樂金',                 '入厝家電選購推薦。',           '立即前往', 'https://linkgo.one/s/TqD3R',   NULL, ARRAY['all'], NULL, 30,  'LG 樂金'),
  ('estate', 'hengstyle',      TRUE, FALSE, 'hengstyle 恆隆行',        '生活家電選購推薦。',           '立即前往', 'https://linkgo.one/s/pSCr3',   NULL, ARRAY['all'], NULL, 20,  'hengstyle 恆隆行'),
  ('estate', 'lovefu',         TRUE, FALSE, 'LOVEFU 大島樂眠',         '床墊寢具選購推薦。',           '立即前往', 'https://onelink.one/s/uCk2J',  NULL, ARRAY['all'], NULL, 10,  'LOVEFU 大島樂眠')
ON CONFLICT (project_name, id) DO NOTHING;

-- 2) 分類導購版位／房貸試算候選夥伴：從 src/content/affiliatePartners.ts 遷移。
--    尚未取得真實聯盟追蹤連結，url 為待補佔位字串，enabled = FALSE（不會顯示）。
--    待取得真實連結後，於資料庫將對應列改為真實 url 並 enabled = TRUE 即可上線，無需改動程式碼或重新部署。
INSERT INTO affiliates (
  project_name, id, enabled, sponsored, title, description, cta_label, url,
  icon, categories, crops, priority, partner
) VALUES
  ('estate', 'cand-nitori',     FALSE, FALSE, '宜得利家居 NITORI',       '新家家具一次購齊，床墊、沙發、收納高 CP 值。', '立即選購',     'https://pending-affiliate-link.example.com/nitori',     'chair',           ARRAY['furniture'], NULL, 0, '宜得利家居 NITORI'),
  ('estate', 'cand-trplus',     FALSE, FALSE, '特力屋 TLW',              '裝潢五金、油漆與家具一站購足。',               '立即選購',     'https://pending-affiliate-link.example.com/trplus',     'chair',           ARRAY['furniture'], NULL, 0, '特力屋 TLW'),
  ('estate', 'cand-hola',       FALSE, FALSE, 'HOLA 特力和樂',           '寢具、廚房與居家布置選品。',                   '立即選購',     'https://pending-affiliate-link.example.com/hola',       'chair',           ARRAY['furniture'], NULL, 0, 'HOLA 特力和樂'),
  ('estate', 'cand-momo',       FALSE, FALSE, 'momo 購物網',             '大型家電、冷氣、洗衣機品項齊、到貨快。',       '立即選購',     'https://pending-affiliate-link.example.com/momo',       'kitchen',         ARRAY['appliance'], NULL, 0, 'momo 購物網'),
  ('estate', 'cand-pchome',     FALSE, FALSE, 'PChome 24h',              '3C 與小家電當日／隔日到貨。',                   '立即選購',     'https://pending-affiliate-link.example.com/pchome',     'kitchen',         ARRAY['appliance'], NULL, 0, 'PChome 24h'),
  ('estate', 'cand-tk3c',       FALSE, FALSE, '燦坤快3',                 '家電比價與門市取貨服務。',                     '立即選購',     'https://pending-affiliate-link.example.com/tk3c',       'kitchen',         ARRAY['appliance'], NULL, 0, '燦坤快3'),
  ('estate', 'cand-buy321',     FALSE, FALSE, '生活市集',                '居家清潔、收納小物高頻團購。',                 '立即選購',     'https://pending-affiliate-link.example.com/buy321',     'home',            ARRAY['home'],      NULL, 0, '生活市集'),
  ('estate', 'cand-pcone',      FALSE, FALSE, '松果購物',                '居家生活雜貨與家飾選品。',                     '立即選購',     'https://pending-affiliate-link.example.com/pcone',      'home',            ARRAY['home'],      NULL, 0, '松果購物'),
  ('estate', 'cand-loan',       FALSE, FALSE, '房貸／信貸試算與送件',     '比較各家銀行房貸利率，線上預約諮詢。',         '比較房貸方案', 'https://pending-affiliate-link.example.com/loan',       'account_balance', ARRAY['finance'],   NULL, 0, '房貸／信貸試算與送件'),
  ('estate', 'cand-creditcard', FALSE, FALSE, '信用卡線上申辦',          '首購裝潢分期、回饋信用卡比較申辦。',           '比較信用卡方案', 'https://pending-affiliate-link.example.com/creditcard', 'account_balance', ARRAY['finance'],   NULL, 0, '信用卡線上申辦')
ON CONFLICT (project_name, id) DO NOTHING;
