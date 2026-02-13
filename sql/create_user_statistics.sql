-- =============================================
-- Tabla: user_statistics
-- Descripción: Contadores dinámicos de actividad por usuario
-- =============================================

CREATE TABLE IF NOT EXISTS user_statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Contadores principales
    profile_views     INTEGER DEFAULT 0,
    matches_count     INTEGER DEFAULT 0,
    swipes_given      INTEGER DEFAULT 0,
    swipes_received   INTEGER DEFAULT 0,
    messages_sent     INTEGER DEFAULT 0,
    messages_received INTEGER DEFAULT 0,
    
    -- Métricas calculadas
    avg_response_time_minutes REAL DEFAULT 0,
    
    -- Datos del gráfico semanal (últimos 7 días)
    -- Formato: [{"date":"2026-02-12","views":5,"matches":1,"swipes":3}, ...]
    daily_activity JSONB DEFAULT '[]',
    
    -- Timestamps
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_stats UNIQUE(user_id)
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);

-- Row Level Security
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Users can read own stats" ON user_statistics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_statistics
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_statistics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Función: Incrementar un contador atómicamente
-- Uso: SELECT increment_stat('user-uuid', 'matches_count');
-- =============================================
CREATE OR REPLACE FUNCTION increment_stat(p_user_id UUID, p_field TEXT)
RETURNS void AS $$
BEGIN
    -- Upsert: crear fila si no existe, incrementar si existe
    INSERT INTO user_statistics (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    EXECUTE format(
        'UPDATE user_statistics SET %I = %I + 1, updated_at = NOW(), last_activity_at = NOW() WHERE user_id = $1',
        p_field, p_field
    ) USING p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
