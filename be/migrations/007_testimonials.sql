-- Testimonials submitted from the public Testimonials page. They go live
-- as soon as they're submitted; staff can hide one from the staff portal.
-- The email is kept for staff to verify the person and never shown.

CREATE TABLE testimonials (
  id            BIGSERIAL   PRIMARY KEY,
  name          TEXT        NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 80),
  email         TEXT        NOT NULL,
  role          TEXT,
  place         TEXT,
  client_group  TEXT        NOT NULL,
  quote         TEXT        NOT NULL CHECK (length(quote) BETWEEN 20 AND 800),
  status        TEXT        NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden')),
  ip            TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX testimonials_status_idx ON testimonials (status, created_at DESC);
