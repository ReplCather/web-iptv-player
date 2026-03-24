-- Create user_sessions table for tracking user connections
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- IP & Network Info
  ip_address VARCHAR(45),
  ip_version INT,
  asn VARCHAR(100),
  isp VARCHAR(255),
  organization VARCHAR(255),
  
  -- Geolocation
  country_code VARCHAR(2),
  country_name VARCHAR(100),
  region_code VARCHAR(10),
  region_name VARCHAR(100),
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone VARCHAR(50),
  
  -- Device & Browser Info
  user_agent TEXT,
  device_type VARCHAR(50),
  device_brand VARCHAR(100),
  device_model VARCHAR(100),
  os_name VARCHAR(100),
  os_version VARCHAR(100),
  browser_name VARCHAR(100),
  browser_version VARCHAR(100),
  
  -- Screen & Display
  screen_width INT,
  screen_height INT,
  screen_color_depth INT,
  
  -- Fingerprint & Identification
  device_fingerprint VARCHAR(255),
  canvas_fingerprint VARCHAR(255),
  webgl_fingerprint VARCHAR(255),
  
  -- Connection Info
  referrer TEXT,
  language VARCHAR(10),
  accept_language VARCHAR(255),
  accept_encoding VARCHAR(255),
  connection_type VARCHAR(50),
  
  -- Timestamps
  first_visit TIMESTAMP DEFAULT now(),
  last_visit TIMESTAMP DEFAULT now(),
  session_start TIMESTAMP DEFAULT now(),
  session_end TIMESTAMP,
  
  -- Session tracking
  session_duration INT,
  page_views INT DEFAULT 1,
  
  -- Additional tracking
  is_returning_visitor BOOLEAN DEFAULT false,
  is_bot BOOLEAN DEFAULT false,
  is_vpn BOOLEAN DEFAULT false,
  is_proxy BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create user_page_views table for detailed page tracking
CREATE TABLE IF NOT EXISTS user_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  
  page_url TEXT,
  referrer_url TEXT,
  time_on_page INT,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create user_events table for detailed event tracking
CREATE TABLE IF NOT EXISTS user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  
  event_name VARCHAR(100),
  event_data JSONB,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_ip_address ON user_sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_user_sessions_device_fingerprint ON user_sessions(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_country ON user_sessions(country_code);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_returning ON user_sessions(is_returning_visitor);

CREATE INDEX IF NOT EXISTS idx_user_page_views_session_id ON user_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_user_page_views_created_at ON user_page_views(created_at);

CREATE INDEX IF NOT EXISTS idx_user_events_session_id ON user_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_events_event_name ON user_events(event_name);
CREATE INDEX IF NOT EXISTS idx_user_events_created_at ON user_events(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to allow anonymous inserts (for tracking)
CREATE POLICY "Allow anonymous inserts for sessions" ON user_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts for page views" ON user_page_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts for events" ON user_events
  FOR INSERT WITH CHECK (true);

-- Restrict SELECT to authenticated users or admin
CREATE POLICY "Allow read for authenticated users" ON user_sessions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read for authenticated users" ON user_page_views
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read for authenticated users" ON user_events
  FOR SELECT USING (auth.role() = 'authenticated');
