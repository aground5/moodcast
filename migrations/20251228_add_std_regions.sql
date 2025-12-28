-- Migration: Add standardized English region columns to mood_votes
-- Date: 2025-12-28
-- Description: Adds region_std_lv0, region_std_lv1, and region_std_lv2 columns to store 
--              standardized English names for consistent aggregation across languages.

ALTER TABLE mood_votes ADD COLUMN IF NOT EXISTS region_std_lv0 TEXT;
ALTER TABLE mood_votes ADD COLUMN IF NOT EXISTS region_std_lv1 TEXT;
ALTER TABLE mood_votes ADD COLUMN IF NOT EXISTS region_std_lv2 TEXT;

COMMENT ON COLUMN mood_votes.region_std_lv0 IS 'Standardized Country Name (English)';
COMMENT ON COLUMN mood_votes.region_std_lv1 IS 'Standardized City/State Name (English)';
COMMENT ON COLUMN mood_votes.region_std_lv2 IS 'Standardized District/Local Name (English)';
