-- Hydra Database Initialization Script

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS hydra_analytics;
CREATE SCHEMA IF NOT EXISTS hydra_tracking;
CREATE SCHEMA IF NOT EXISTS hydra_config;

-- Create tables for click tracking
CREATE TABLE IF NOT EXISTS hydra_tracking.clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    user_agent TEXT,
    ip_address INET,
    referer TEXT,
    target_url TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Create tables for analytics
CREATE TABLE IF NOT EXISTS hydra_analytics.page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_path VARCHAR(500) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    user_agent TEXT,
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_seconds INTEGER,
    metadata JSONB
);

-- Create configuration tables
CREATE TABLE IF NOT EXISTS hydra_config.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    config JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clicks_timestamp ON hydra_tracking.clicks(timestamp);
CREATE INDEX IF NOT EXISTS idx_clicks_session ON hydra_tracking.clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_pageviews_timestamp ON hydra_analytics.page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_pageviews_path ON hydra_analytics.page_views(page_path);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA hydra_analytics TO hydra_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA hydra_tracking TO hydra_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA hydra_config TO hydra_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA hydra_analytics TO hydra_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA hydra_tracking TO hydra_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA hydra_config TO hydra_user;