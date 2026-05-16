-- SEALED Database Schema
-- Run: psql -U postgres -d sealed_db -f schema.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vaults table (shared spaces for groups)
CREATE TABLE IF NOT EXISTS vaults (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
    invite_code VARCHAR(20) UNIQUE,
    invite_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vault members (many-to-many relationship)
CREATE TABLE IF NOT EXISTS vault_members (
    id SERIAL PRIMARY KEY,
    vault_id INTEGER REFERENCES vaults(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- 'owner', 'member'
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vault_id, user_id)
);

-- Letters table
CREATE TABLE IF NOT EXISTS letters (
    id SERIAL PRIMARY KEY,
    vault_id INTEGER REFERENCES vaults(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL, -- Encrypted content
    
    -- Unlock conditions
    unlock_type VARCHAR(20) NOT NULL, -- 'date', 'event', 'consensus'
    unlock_date TIMESTAMP, -- For date-based unlock
    unlock_event VARCHAR(255), -- For event-based unlock description
    is_unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Votes table (for consensus-based unlocks)
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    letter_id INTEGER REFERENCES letters(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    vote VARCHAR(10) NOT NULL, -- 'yes', 'no'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(letter_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_letters_vault ON letters(vault_id);
CREATE INDEX IF NOT EXISTS idx_letters_author ON letters(author_id);
CREATE INDEX IF NOT EXISTS idx_letters_unlock ON letters(unlock_date, is_unlocked);
CREATE INDEX IF NOT EXISTS idx_vault_members_vault ON vault_members(vault_id);
CREATE INDEX IF NOT EXISTS idx_vault_members_user ON vault_members(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_letter ON votes(letter_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vaults_updated_at ON vaults;
CREATE TRIGGER update_vaults_updated_at BEFORE UPDATE ON vaults
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_letters_updated_at ON letters;
CREATE TRIGGER update_letters_updated_at BEFORE UPDATE ON letters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
