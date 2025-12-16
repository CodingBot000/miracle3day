-- Search Logs Table Migration
-- Run this SQL against your PostgreSQL database

CREATE TABLE IF NOT EXISTS search_logs (
  id SERIAL PRIMARY KEY,
  query VARCHAR(255) NOT NULL,
  result_count INTEGER DEFAULT 0,
  user_id UUID,
  session_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster query lookups (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_search_logs_query ON search_logs(LOWER(query));

-- Index for time-based queries (popular searches)
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at);

-- Index for user-specific search history
CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON search_logs(user_id);
