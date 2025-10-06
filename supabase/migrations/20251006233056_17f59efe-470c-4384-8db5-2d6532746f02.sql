-- Create missions table
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly')),
  target_value INTEGER NOT NULL,
  reward_gems INTEGER NOT NULL DEFAULT 0,
  reward_xp INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_missions table to track progress
CREATE TABLE IF NOT EXISTS public.user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mission_id)
);

-- Enable RLS
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;

-- Policies for missions (everyone can view)
CREATE POLICY "Anyone can view missions"
  ON public.missions
  FOR SELECT
  USING (true);

-- Policies for user_missions
CREATE POLICY "Users can view their own missions"
  ON public.user_missions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own missions"
  ON public.user_missions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own missions"
  ON public.user_missions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert default daily missions
INSERT INTO public.missions (title, description, type, target_value, reward_gems, reward_xp, icon) VALUES
  ('Responda 5 Perguntas', 'Complete 5 perguntas em qualquer disciplina', 'daily', 5, 10, 50, 'Target'),
  ('Acerte 3 Seguidas', 'Acerte 3 perguntas consecutivas', 'daily', 3, 15, 75, 'Zap'),
  ('Estude 2 Disciplinas', 'Jogue em pelo menos 2 disciplinas diferentes', 'daily', 2, 10, 50, 'BookOpen'),
  ('Conquiste 80% de Precisão', 'Mantenha 80% ou mais de precisão em 5 perguntas', 'daily', 5, 20, 100, 'Target'),
  ('Ganhe 30 Gemas', 'Acumule 30 gemas através de respostas corretas', 'daily', 30, 15, 75, 'Gem');

-- Insert default weekly missions
INSERT INTO public.missions (title, description, type, target_value, reward_gems, reward_xp, icon) VALUES
  ('Complete 30 Perguntas', 'Responda 30 perguntas durante a semana', 'weekly', 30, 50, 250, 'Trophy'),
  ('Suba 2 Níveis', 'Avance 2 níveis através do XP', 'weekly', 2, 75, 500, 'TrendingUp'),
  ('Domine 3 Disciplinas', 'Complete todas as aulas de 3 disciplinas diferentes', 'weekly', 3, 100, 750, 'Star');

-- Function to auto-assign daily missions to users
CREATE OR REPLACE FUNCTION public.assign_daily_missions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete expired daily missions
  DELETE FROM public.user_missions
  WHERE expires_at < NOW() AND completed = false;
  
  -- Assign new daily missions to all users who don't have them
  INSERT INTO public.user_missions (user_id, mission_id, expires_at)
  SELECT 
    p.id,
    m.id,
    NOW() + INTERVAL '1 day'
  FROM public.profiles p
  CROSS JOIN public.missions m
  WHERE m.type = 'daily'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_missions um
    WHERE um.user_id = p.id 
    AND um.mission_id = m.id
    AND um.expires_at > NOW()
  )
  ON CONFLICT (user_id, mission_id) DO NOTHING;
END;
$$;

-- Function to auto-assign weekly missions
CREATE OR REPLACE FUNCTION public.assign_weekly_missions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete expired weekly missions
  DELETE FROM public.user_missions
  WHERE expires_at < NOW() AND completed = false;
  
  -- Assign new weekly missions
  INSERT INTO public.user_missions (user_id, mission_id, expires_at)
  SELECT 
    p.id,
    m.id,
    NOW() + INTERVAL '7 days'
  FROM public.profiles p
  CROSS JOIN public.missions m
  WHERE m.type = 'weekly'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_missions um
    WHERE um.user_id = p.id 
    AND um.mission_id = m.id
    AND um.expires_at > NOW()
  )
  ON CONFLICT (user_id, mission_id) DO NOTHING;
END;
$$;

-- Function to check and complete missions
CREATE OR REPLACE FUNCTION public.check_mission_completion(
  p_user_id UUID,
  p_mission_id UUID
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_target INTEGER;
  v_progress INTEGER;
  v_reward_gems INTEGER;
  v_reward_xp INTEGER;
  v_completed BOOLEAN;
BEGIN
  -- Get mission details
  SELECT m.target_value, um.progress, m.reward_gems, m.reward_xp, um.completed
  INTO v_target, v_progress, v_reward_gems, v_reward_xp, v_completed
  FROM public.missions m
  JOIN public.user_missions um ON um.mission_id = m.id
  WHERE m.id = p_mission_id AND um.user_id = p_user_id;
  
  -- Check if mission is complete
  IF v_progress >= v_target AND NOT v_completed THEN
    -- Mark as completed
    UPDATE public.user_missions
    SET completed = true, completed_at = NOW()
    WHERE user_id = p_user_id AND mission_id = p_mission_id;
    
    -- Award rewards
    UPDATE public.profiles
    SET 
      gems = gems + v_reward_gems,
      xp = xp + v_reward_xp,
      total_xp = total_xp + v_reward_xp
    WHERE id = p_user_id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;