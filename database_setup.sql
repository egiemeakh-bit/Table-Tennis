-- Supabase Database Setup für Table Tennis Liquid
-- Führe diese SQL-Befehle in deinem Supabase SQL Editor aus

-- Erstelle die 'games' Tabelle
CREATE TABLE IF NOT EXISTS games (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    p1_name TEXT NOT NULL DEFAULT 'Spieler 1',
    p2_name TEXT NOT NULL DEFAULT 'Spieler 2',
    p1_scores JSONB NOT NULL DEFAULT '[0, 0, 0, 0]',
    p2_scores JSONB NOT NULL DEFAULT '[0, 0, 0, 0]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Erstelle Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);

-- Aktiviere Row Level Security (optional, je nach Bedarf)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Erlaube öffentlichen Zugriff (anpassen je nach Sicherheitsanforderungen)
CREATE POLICY "Allow public access" ON games
    FOR ALL
    USING (true)
    WITH CHECK (true);
