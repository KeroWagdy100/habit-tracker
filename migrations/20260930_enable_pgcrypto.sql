-- Adds PostgreSQL's existing bcrypt-compatible functions for hashing and
-- verifying passwords inside Neon, keeping password work out of Workers CPU.
-- This does not alter or delete any application rows.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
