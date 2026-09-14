-- ==========================================================
-- GEOSTRIKE / GEOMUNDI - ESQUEMA DE BASE DE DATOS SUPABASE
-- Copia y pega este script en el SQL Editor de tu panel de Supabase
-- ==========================================================

-- 1. TABLA DE PERFILES DE JUGADOR (Sincronizada con Google Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  nickname TEXT,
  avatar_url TEXT,
  elo INTEGER DEFAULT 1200,
  rank_tier TEXT DEFAULT 'iron',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_duels INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  win_streak INTEGER DEFAULT 0,
  best_win_streak INTEGER DEFAULT 0,
  daily_streak INTEGER DEFAULT 0,
  best_daily_streak INTEGER DEFAULT 0,
  -- Calificaciones ELO por Minijuego
  elo_pinpoint INTEGER DEFAULT 1200,
  elo_countries INTEGER DEFAULT 1200,
  elo_capitals INTEGER DEFAULT 1200,
  elo_flags INTEGER DEFAULT 1200,
  -- Desgloses de duelos y victorias por modo
  duels_pinpoint INTEGER DEFAULT 0,
  wins_pinpoint INTEGER DEFAULT 0,
  duels_countries INTEGER DEFAULT 0,
  wins_countries INTEGER DEFAULT 0,
  duels_capitals INTEGER DEFAULT 0,
  wins_capitals INTEGER DEFAULT 0,
  duels_flags INTEGER DEFAULT 0,
  wins_flags INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los perfiles son públicos para ver rankings" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden insertar su propio perfil" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 2. TRIGGER AUTOMÁTICO: Crear perfil al iniciar sesión con Google
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nickname, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'GeoStriker'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. TABLA DE INTENTOS Y PUNTUACIONES DEL RETO DIARIO (Wordle)
CREATE TABLE IF NOT EXISTS public.daily_challenge_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_date DATE NOT NULL,
  solved BOOLEAN DEFAULT false NOT NULL,
  attempts_count INTEGER DEFAULT 0 NOT NULL,
  time_seconds INTEGER DEFAULT 0 NOT NULL,
  guesses JSONB DEFAULT '[]'::jsonb NOT NULL,
  score INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, challenge_date)
);

ALTER TABLE public.daily_challenge_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clasificaciones diarias son públicas" 
  ON public.daily_challenge_attempts FOR SELECT 
  USING (true);

CREATE POLICY "Los usuarios pueden insertar sus propios intentos diarios" 
  ON public.daily_challenge_attempts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios intentos diarios" 
  ON public.daily_challenge_attempts FOR UPDATE 
  USING (auth.uid() = user_id);

-- 4. TABLA DE LOGROS DESBLOQUEADOS
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los logros son públicos" 
  ON public.user_achievements FOR SELECT 
  USING (true);

CREATE POLICY "Los usuarios pueden registrar sus propios logros" 
  ON public.user_achievements FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 5. TABLA DE PARTIDAS Y RÉCORDS (Historial global)
CREATE TABLE IF NOT EXISTS public.game_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  game_mode TEXT NOT NULL,
  continent TEXT DEFAULT 'World' NOT NULL,
  score INTEGER DEFAULT 0 NOT NULL,
  accuracy_pct NUMERIC(5,2) DEFAULT 0 NOT NULL,
  streak INTEGER DEFAULT 0 NOT NULL,
  time_seconds INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.game_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Las partidas son públicas para rankings" 
  ON public.game_records FOR SELECT 
  USING (true);

CREATE POLICY "Los usuarios pueden registrar sus partidas" 
  ON public.game_records FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 6. TABLA DE DOMINIO DE PAÍSES (Aciertos y fallos por mapa)
CREATE TABLE IF NOT EXISTS public.country_mastery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  cca3 TEXT NOT NULL,
  correct_count INTEGER DEFAULT 0 NOT NULL,
  wrong_count INTEGER DEFAULT 0 NOT NULL,
  last_played TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, cca3)
);

ALTER TABLE public.country_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "El dominio de países es público para comparativas" 
  ON public.country_mastery FOR SELECT 
  USING (true);

CREATE POLICY "Los usuarios pueden modificar su dominio" 
  ON public.country_mastery FOR ALL 
  USING (auth.uid() = user_id);

-- 6.1 TABLA DE RÉCORDS PERSONALES POR MAPA / CONTINENTE
CREATE TABLE IF NOT EXISTS public.personal_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  game_mode TEXT NOT NULL,
  continent TEXT NOT NULL,
  correct_count INTEGER NOT NULL,
  total_countries INTEGER NOT NULL,
  accuracy_pct NUMERIC(5,2) NOT NULL,
  time_seconds INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, game_mode, continent)
);

ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Records personales son públicos" 
  ON public.personal_records FOR SELECT 
  USING (true);

CREATE POLICY "Los usuarios pueden insertar sus propios records" 
  ON public.personal_records FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios records" 
  ON public.personal_records FOR UPDATE 
  USING (auth.uid() = user_id);

-- 8. TABLA DE DESAFÍOS ASÍNCRONOS MULTIJUGADOR (Partidas grabadas de la comunidad)
CREATE TABLE IF NOT EXISTS public.community_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  creator_name TEXT NOT NULL,
  creator_avatar TEXT,
  creator_elo INTEGER DEFAULT 1200 NOT NULL,
  mode TEXT NOT NULL, -- 'pinpoint', 'countries', 'capitals', 'flags'
  score INTEGER NOT NULL,
  total_time_ms INTEGER NOT NULL,
  questions JSONB NOT NULL,
  round_results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Estado y resolución asíncrona del desafío
  status TEXT DEFAULT 'open' NOT NULL, -- 'open', 'in_progress', 'completed'
  room_code TEXT,
  challenger_id UUID REFERENCES public.profiles(id),
  challenger_name TEXT,
  challenger_avatar TEXT,
  challenger_elo INTEGER,
  challenger_score INTEGER,
  challenger_time_ms INTEGER,
  winner TEXT, -- 'creator', 'challenger', 'tie'
  elo_change INTEGER,
  resolved_at TIMESTAMPTZ,
  creator_notified BOOLEAN DEFAULT false
);

ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Desafios son publicos para todos" ON public.community_challenges;
CREATE POLICY "Desafios son publicos para todos" 
  ON public.community_challenges FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Usuarios pueden publicar sus desafios" ON public.community_challenges;
CREATE POLICY "Usuarios pueden publicar sus desafios" 
  ON public.community_challenges FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar desafios para resolverlos" ON public.community_challenges;
CREATE POLICY "Usuarios pueden actualizar desafios para resolverlos" 
  ON public.community_challenges FOR UPDATE 
  USING (true);


-- ==========================================================
-- VISTAS DE CLASIFICACIÓN (RANKINGS LISTOS PARA CONSUMIR)
-- ==========================================================

-- Ranking de Elo global
CREATE OR REPLACE VIEW public.leaderboard_elo AS
SELECT 
  id,
  nickname,
  avatar_url,
  elo,
  rank_tier,
  level,
  xp,
  wins,
  losses,
  total_duels,
  RANK() OVER (ORDER BY elo DESC) as rank_position
FROM public.profiles
WHERE total_duels > 0
ORDER BY elo DESC;

-- Ranking del Reto Diario de Hoy
CREATE OR REPLACE VIEW public.leaderboard_daily_today AS
SELECT 
  d.id as attempt_id,
  d.user_id,
  p.nickname,
  p.avatar_url,
  d.challenge_date,
  d.solved,
  d.attempts_count,
  d.time_seconds,
  d.score,
  RANK() OVER (
    ORDER BY 
      d.solved DESC,
      d.attempts_count ASC,
      d.time_seconds ASC
  ) as rank_position
FROM public.daily_challenge_attempts d
JOIN public.profiles p ON d.user_id = p.id
WHERE d.challenge_date = CURRENT_DATE AND d.solved = true
ORDER BY rank_position ASC;

-- Ranking de ELO Puntería Geográfica (pinpoint)
CREATE OR REPLACE VIEW public.leaderboard_elo_pinpoint AS
SELECT 
  id, nickname, avatar_url, elo_pinpoint as elo, rank_tier, level, xp,
  wins_pinpoint as wins, (duels_pinpoint - wins_pinpoint) as losses, duels_pinpoint as total_duels,
  RANK() OVER (ORDER BY elo_pinpoint DESC) as rank_position
FROM public.profiles
WHERE duels_pinpoint > 0
ORDER BY elo_pinpoint DESC;

-- Ranking de ELO Países en Mapa (countries)
CREATE OR REPLACE VIEW public.leaderboard_elo_countries AS
SELECT 
  id, nickname, avatar_url, elo_countries as elo, rank_tier, level, xp,
  wins_countries as wins, (duels_countries - wins_countries) as losses, duels_countries as total_duels,
  RANK() OVER (ORDER BY elo_countries DESC) as rank_position
FROM public.profiles
WHERE duels_countries > 0
ORDER BY elo_countries DESC;

-- Ranking de ELO Capitales Mundiales (capitals)
CREATE OR REPLACE VIEW public.leaderboard_elo_capitals AS
SELECT 
  id, nickname, avatar_url, elo_capitals as elo, rank_tier, level, xp,
  wins_capitals as wins, (duels_capitals - wins_capitals) as losses, duels_capitals as total_duels,
  RANK() OVER (ORDER BY elo_capitals DESC) as rank_position
FROM public.profiles
WHERE duels_capitals > 0
ORDER BY elo_capitals DESC;

-- Ranking de ELO Banderas del Mundo (flags)
CREATE OR REPLACE VIEW public.leaderboard_elo_flags AS
SELECT 
  id, nickname, avatar_url, elo_flags as elo, rank_tier, level, xp,
  wins_flags as wins, (duels_flags - wins_flags) as losses, duels_flags as total_duels,
  RANK() OVER (ORDER BY elo_flags DESC) as rank_position
FROM public.profiles
WHERE duels_flags > 0
ORDER BY elo_flags DESC;

-- ==========================================================
-- SCRIPT DE MIGRACIÓN PARA PROYECTOS YA EXISTENTES EN SUPABASE
-- (Si ya creaste la tabla 'profiles' anteriormente, ejecuta esto en el SQL Editor)
-- ==========================================================
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS elo_pinpoint INTEGER DEFAULT 1200;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS elo_countries INTEGER DEFAULT 1200;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS elo_capitals INTEGER DEFAULT 1200;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS elo_flags INTEGER DEFAULT 1200;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS duels_pinpoint INTEGER DEFAULT 0;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wins_pinpoint INTEGER DEFAULT 0;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS duels_countries INTEGER DEFAULT 0;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wins_countries INTEGER DEFAULT 0;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS duels_capitals INTEGER DEFAULT 0;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wins_capitals INTEGER DEFAULT 0;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wins_flags INTEGER DEFAULT 0;
--
-- Columnas para desafíos asíncronos y exclusividad (community_challenges):
-- ALTER TABLE public.community_challenges ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
-- ALTER TABLE public.community_challenges ADD COLUMN IF NOT EXISTS room_code TEXT;
-- ALTER TABLE public.community_challenges ADD COLUMN IF NOT EXISTS challenger_id UUID REFERENCES public.profiles(id);
-- ALTER TABLE public.community_challenges ADD COLUMN IF NOT EXISTS challenger_name TEXT;
-- ALTER TABLE public.community_challenges ADD COLUMN IF NOT EXISTS challenger_avatar TEXT;
-- ALTER TABLE public.community_challenges ADD COLUMN IF NOT EXISTS challenger_elo INTEGER;
-- ALTER TABLE public.community_challenges ADD COLUMN IF NOT EXISTS challenger_score INTEGER;
-- ALTER TABLE public.community_challenges ADD COLUMN IF NOT EXISTS challenger_time_ms INTEGER;
-- ALTER TABLE public.community_challenges ADD COLUMN IF NOT EXISTS winner TEXT;
-- ALTER TABLE public.community_challenges ADD COLUMN IF NOT EXISTS elo_change INTEGER;
-- ALTER TABLE public.community_challenges ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
-- ALTER TABLE public.community_challenges ADD COLUMN IF NOT EXISTS creator_notified BOOLEAN DEFAULT false;
-- DROP POLICY IF EXISTS "Usuarios pueden actualizar desafios para resolverlos" ON public.community_challenges;
-- CREATE POLICY "Usuarios pueden actualizar desafios para resolverlos" ON public.community_challenges FOR UPDATE USING (true);


