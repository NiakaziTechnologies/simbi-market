-- Loan module v2: financial partners + seller loan applications
-- PostgreSQL. Run via: node database_migrations/run-loan-module-v2.js (DATABASE_URL required)
-- Then implement REST routes on your API server; this repo ships the admin UI + client.

-- Extensions (gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS financial_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  description TEXT,
  min_amount NUMERIC(14, 2),
  max_amount NUMERIC(14, 2),
  interest_rate NUMERIC(7, 4),
  term_months INTEGER,
  logo TEXT,
  contact_email VARCHAR(320),
  fees_and_terms_summary TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  field_definitions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  integration_config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  integration_secrets_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  api_endpoint TEXT,
  api_key TEXT,
  webhook_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT financial_partners_slug_unique UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS idx_financial_partners_active ON financial_partners (is_active);
CREATE INDEX IF NOT EXISTS idx_financial_partners_slug ON financial_partners (slug);

CREATE TABLE IF NOT EXISTS loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES financial_partners (id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'DRAFT',
  requested_amount NUMERIC(14, 2),
  approved_amount NUMERIC(14, 2),
  partner_reference_id VARCHAR(255),
  rejection_reason TEXT,
  custom_fields_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  platform_payload_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loan_applications_partner ON loan_applications (partner_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_seller ON loan_applications (seller_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications (status);
CREATE INDEX IF NOT EXISTS idx_loan_applications_created ON loan_applications (created_at DESC);

COMMENT ON TABLE financial_partners IS 'Lending partners; secrets in integration_secrets_json, never returned to clients.';
COMMENT ON TABLE loan_applications IS 'Seller loan requests; status updated by platform, partner HTTP, or webhook.';
COMMENT ON COLUMN financial_partners.field_definitions_json IS 'Array of { key, label, type, required } for seller apply form.';
COMMENT ON COLUMN financial_partners.integration_config_json IS 'Non-secret HTTP integration: baseUrl, paths, headers template, etc.';
