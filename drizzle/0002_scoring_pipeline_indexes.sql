-- Scoring pipeline performance: composite index on apartment_prices
-- Covers the latest_month CTE in fetch-candidates.ts which filters by
-- (trade_type, year*100+month) and groups by apt_id.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_apt_prices_trade_ym
  ON apartment_prices (trade_type, year, month, apt_id);
