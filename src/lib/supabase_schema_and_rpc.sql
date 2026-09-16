-- ============================================================
-- SCRIPT SQL DE SUPABASE: AUTENTICACIÓN ANÓNIMA + RPC ANTI-TRAMPAS
-- Ejecutar este archivo en el Editor SQL de tu panel de Supabase
-- (https://supabase.com/dashboard/project/mklofgtmjbhvqrnnmris/sql)
-- ============================================================

-- 1. TABLA DE PERFILES DE JUGADOR
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  nickname TEXT NOT NULL DEFAULT 'Explorador',
  avatar_url TEXT DEFAULT '👨‍🚀',
  elo INTEGER NOT NULL DEFAULT 1000,
  rank_tier TEXT NOT NULL DEFAULT 'Bronce I',
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  total_duels INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  win_streak INTEGER NOT NULL DEFAULT 0,
  best_win_streak INTEGER NOT NULL DEFAULT 0,
  daily_streak INTEGER NOT NULL DEFAULT 0,
  best_daily_streak INTEGER NOT NULL DEFAULT 0,
  elo_pinpoint INTEGER DEFAULT 1000,
  elo_countries INTEGER DEFAULT 1000,
  elo_capitals INTEGER DEFAULT 1000,
  elo_flags INTEGER DEFAULT 1000,
  duels_pinpoint INTEGER DEFAULT 0,
  wins_pinpoint INTEGER DEFAULT 0,
  duels_countries INTEGER DEFAULT 0,
  wins_countries INTEGER DEFAULT 0,
  duels_capitals INTEGER DEFAULT 0,
  wins_capitals INTEGER DEFAULT 0,
  duels_flags INTEGER DEFAULT 0,
  wins_flags INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS de Perfil:
-- a) Cualquiera puede leer los perfiles (para la tabla de clasificación mundial)
CREATE POLICY "Lectura pública de perfiles" ON public.profiles
  FOR SELECT USING (true);

-- b) Los usuarios solo pueden insertar/actualizar su propio perfil
CREATE POLICY "Usuarios actualizan su propio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuarios crean su propio perfil" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. TABLA DE RESULTADOS DIARIOS
CREATE TABLE IF NOT EXISTS public.daily_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_str TEXT NOT NULL, -- YYYY-MM-DD
  score INTEGER NOT NULL,
  accuracy INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date_str)
);

ALTER TABLE public.daily_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de resultados diarios" ON public.daily_results
  FOR SELECT USING (true);

CREATE POLICY "Usuarios insertan sus propios resultados diarios" ON public.daily_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 3. FUNCIÓN RPC ANTI-TRAMPAS: CÁLCULO SEGURO DE ELO EN SERVIDOR
-- ============================================================
CREATE OR REPLACE FUNCTION public.submit_duel_result(
  p_user_id UUID,
  p_duel_mode TEXT,
  p_is_win BOOLEAN,
  p_is_draw BOOLEAN,
  p_score INTEGER,
  p_duration_seconds INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_elo INTEGER;
  v_elo_change INTEGER;
  v_new_elo INTEGER;
  v_new_wins INTEGER;
  v_new_losses INTEGER;
  v_new_draws INTEGER;
  v_new_streak INTEGER;
  v_best_streak INTEGER;
  v_rank_tier TEXT;
  v_result JSONB;
BEGIN
  -- Verificar que el usuario que llama sea el dueño de la sesión
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'No autorizado para modificar este perfil';
  END IF;

  -- Obtener ELO actual
  SELECT elo, wins, losses, draws, win_streak, best_win_streak
  INTO v_current_elo, v_new_wins, v_new_losses, v_new_draws, v_new_streak, v_best_streak
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    v_current_elo := 1000;
    v_new_wins := 0;
    v_new_losses := 0;
    v_new_draws := 0;
    v_new_streak := 0;
    v_best_streak := 0;
  END IF;

  -- Cálculo seguro de ELO en servidor
  IF p_is_win THEN
    v_elo_change := 25 + LEAST(10, p_score / 200);
    v_new_wins := v_new_wins + 1;
    v_new_streak := v_new_streak + 1;
  ELSIF p_is_draw THEN
    v_elo_change := 5;
    v_new_draws := v_new_draws + 1;
    v_new_streak := 0;
  ELSE
    v_elo_change := -18;
    v_new_losses := v_new_losses + 1;
    v_new_streak := 0;
  END IF;

  v_new_elo := GREATEST(100, v_current_elo + v_elo_change);
  v_best_streak := GREATEST(v_best_streak, v_new_streak);

  -- Determinar Rango
  IF v_new_elo >= 2200 THEN v_rank_tier := 'Diamante III';
  ELSIF v_new_elo >= 1800 THEN v_rank_tier := 'Platino I';
  ELSIF v_new_elo >= 1500 THEN v_rank_tier := 'Oro I';
  ELSIF v_new_elo >= 1200 THEN v_rank_tier := 'Plata I';
  ELSE v_rank_tier := 'Bronce I';
  END IF;

  -- Actualizar perfil en servidor
  UPDATE public.profiles
  SET 
    elo = v_new_elo,
    rank_tier = v_rank_tier,
    wins = v_new_wins,
    losses = v_new_losses,
    draws = v_new_draws,
    win_streak = v_new_streak,
    best_win_streak = v_best_streak,
    total_duels = total_duels + 1,
    updated_at = NOW()
  WHERE id = p_user_id;

  v_result := jsonb_build_object(
    'success', true,
    'new_elo', v_new_elo,
    'elo_change', v_elo_change,
    'rank_tier', v_rank_tier
  );

  RETURN v_result;
END;
$$;

-- ============================================================
-- 4. FUNCIÓN RPC: REGISTRO SEGURO DE RETO DIARIO
-- ============================================================
CREATE OR REPLACE FUNCTION public.submit_daily_result(
  p_user_id UUID,
  p_date_str TEXT,
  p_score INTEGER,
  p_accuracy INTEGER,
  p_duration_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  INSERT INTO public.daily_results (user_id, date_str, score, accuracy, duration_seconds)
  VALUES (p_user_id, p_date_str, p_score, p_accuracy, p_duration_seconds)
  ON CONFLICT (user_id, date_str) 
  DO UPDATE SET
    score = GREATEST(public.daily_results.score, EXCLUDED.score),
    accuracy = GREATEST(public.daily_results.accuracy, EXCLUDED.accuracy),
    duration_seconds = LEAST(public.daily_results.duration_seconds, EXCLUDED.duration_seconds);

  RETURN true;
END;
$$;
