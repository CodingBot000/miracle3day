-- Exchange Rates Table Migration
-- Run this SQL to create the exchange_rates table in PostgreSQL

CREATE TABLE IF NOT EXISTS exchange_rates (
  id SERIAL PRIMARY KEY,
  currency_pair VARCHAR(10) NOT NULL UNIQUE,  -- e.g., 'KRW_USD', 'KRW_JPY'
  rate DECIMAL(20, 10) NOT NULL,              -- Exchange rate value
  source VARCHAR(20) NOT NULL DEFAULT 'fallback', -- 'api' or 'fallback'
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency_pair ON exchange_rates(currency_pair);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_updated_at ON exchange_rates(updated_at);

-- Insert initial fallback rates
INSERT INTO exchange_rates (currency_pair, rate, source, updated_at, created_at)
VALUES
  ('KRW_USD', 0.00072, 'fallback', NOW(), NOW()),
  ('KRW_JPY', 0.11, 'fallback', NOW(), NOW()),
  ('KRW_HKD', 0.0056, 'fallback', NOW(), NOW()),
  ('KRW_CNY', 0.0052, 'fallback', NOW(), NOW()),
  ('KRW_TWD', 0.023, 'fallback', NOW(), NOW())
ON CONFLICT (currency_pair) DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON exchange_rates TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE exchange_rates_id_seq TO your_app_user;
