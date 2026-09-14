CREATE TABLE IF NOT EXISTS fursa_users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT,
  service TEXT NOT NULL CHECK (service IN ('chat', 'mikopo', 'ajira')),
  activation_fee INTEGER NOT NULL CHECK (activation_fee IN (12000, 15000, 20000)),
  activated BOOLEAN NOT NULL DEFAULT FALSE,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_requests (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES fursa_users(id) ON DELETE CASCADE,
  customer_reference TEXT NOT NULL UNIQUE,
  zonmpay_reference TEXT,
  service TEXT NOT NULL CHECK (service IN ('chat', 'mikopo', 'ajira')),
  service_label TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount IN (12000, 15000, 20000)),
  payer_phone TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'CUSTOMER_REPORTED',
  admin_status TEXT NOT NULL DEFAULT 'pending' CHECK (admin_status IN ('pending', 'approved', 'rejected')),
  customer_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  customer_confirmed_at TIMESTAMPTZ,
  provider_response JSONB,
  failure_reason TEXT,
  admin_note TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS payment_requests_user_id_idx ON payment_requests(user_id);
CREATE INDEX IF NOT EXISTS payment_requests_status_idx ON payment_requests(payment_status, admin_status);
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY,
  payment_id UUID REFERENCES payment_requests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
