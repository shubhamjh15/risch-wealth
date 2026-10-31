-- Testimonials are now reviewed before they go live: new ones wait as
-- 'pending' until staff publish them, and staff are emailed each one.
-- A submission can carry a portrait (a small square JPEG, resized in the
-- browser), kept here so it lives with the rest of the data.

ALTER TABLE testimonials DROP CONSTRAINT testimonials_status_check;
ALTER TABLE testimonials ADD CONSTRAINT testimonials_status_check CHECK (status IN ('pending', 'published', 'hidden'));
ALTER TABLE testimonials ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE testimonials ADD COLUMN photo BYTEA;
