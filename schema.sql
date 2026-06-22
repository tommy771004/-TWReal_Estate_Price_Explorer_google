-- ==========================================================
-- 臺灣實價登錄地圖與價格探索器 - Neon PostgreSQL 資料庫結構
-- ==========================================================

-- 1. 意見回饋資料表 (feedbacks)
CREATE TABLE IF NOT EXISTS feedbacks (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,       -- 回饋類別 (例如：系統錯誤、功能建議、介面優化, 其它)
  content TEXT NOT NULL,               -- 回饋內容
  contact VARCHAR(255),                -- 聯絡方式 (選填)
  latitude DOUBLE PRECISION,           -- 緯度 (選填)
  longitude DOUBLE PRECISION,          -- 經度 (選填)
  county VARCHAR(100),                 -- 自動判定的縣市 (選填)
  district VARCHAR(100),               -- 自動判定的市轄區 (選填)
  location_method VARCHAR(50),         -- 位置獲取方式 ('gps', 'base_station', 'unknown')
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 使用者行為稽核日誌 (audit_logs)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  action_type VARCHAR(100) NOT NULL,    -- 點擊行為/功能類型 (例如：search_properties, toggle_dark_mode, toggle_favorite, export_data, clear_search)
  details TEXT,                        -- 行為詳細資訊 (例如搜尋對象、分享內容、開關狀態)
  latitude DOUBLE PRECISION,           -- 緯度 (選填)
  longitude DOUBLE PRECISION,          -- 經度 (選填)
  county VARCHAR(100),                 -- 自動判定的縣市 (選填)
  district VARCHAR(100),               -- 自動判定的市轄區 (選填)
  location_method VARCHAR(50),         -- 位置獲取區分 ('gps', 'base_station', 'unknown')
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 可客製化索引，提升稽核分析時的查詢速度
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
