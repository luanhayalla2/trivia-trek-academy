-- Fix security warnings by setting search_path on functions

-- Update assign_daily_missions function
CREATE OR REPLACE FUNCTION public.assign_daily_missions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_missions
  WHERE expires_at < NOW() AND completed = false;
  
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

-- Update assign_weekly_missions function
CREATE OR REPLACE FUNCTION public.assign_weekly_missions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_missions
  WHERE expires_at < NOW() AND completed = false;
  
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

-- Update check_mission_completion function
CREATE OR REPLACE FUNCTION public.check_mission_completion(
  p_user_id UUID,
  p_mission_id UUID
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target INTEGER;
  v_progress INTEGER;
  v_reward_gems INTEGER;
  v_reward_xp INTEGER;
  v_completed BOOLEAN;
BEGIN
  SELECT m.target_value, um.progress, m.reward_gems, m.reward_xp, um.completed
  INTO v_target, v_progress, v_reward_gems, v_reward_xp, v_completed
  FROM public.missions m
  JOIN public.user_missions um ON um.mission_id = m.id
  WHERE m.id = p_mission_id AND um.user_id = p_user_id;
  
  IF v_progress >= v_target AND NOT v_completed THEN
    UPDATE public.user_missions
    SET completed = true, completed_at = NOW()
    WHERE user_id = p_user_id AND mission_id = p_mission_id;
    
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