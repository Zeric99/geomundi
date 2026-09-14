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

-- 7. TABLA DE DUELOS 1v1 MULTIJUGADOR
CREATE TABLE IF NOT EXISTS public.duel_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  player2_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rival_name TEXT,
  mode TEXT DEFAULT 'countries' NOT NULL,
  player1_score INTEGER DEFAULT 0 NOT NULL,
  player2_score INTEGER DEFAULT 0 NOT NULL,
  winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  elo_change_p1 INTEGER DEFAULT 0 NOT NULL,
  elo_change_p2 INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.duel_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los duelos son públicos" 
  ON public.duel_matches FOR SELECT 
  USING (true);

CREATE POLICY "Usuarios autenticados pueden registrar duelos" 
  ON public.duel_matches FOR INSERT 
  WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);

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
