-- Migration: Add car_condition column to listings table
-- Run this once against your Railway PostgreSQL database
-- Date: 2026-11-08

ALTER TABLE listings
ADD COLUMN IF NOT EXISTS car_condition VARCHAR(20) DEFAULT NULL
CHECK (car_condition IN ('Brand New', 'Foreign Used', 'Local Used'));

-- Verify
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'listings' AND column_name = 'car_condition';
