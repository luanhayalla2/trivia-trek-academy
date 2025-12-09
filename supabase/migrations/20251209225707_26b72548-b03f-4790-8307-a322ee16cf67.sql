-- Create enum for game difficulty
CREATE TYPE public.game_difficulty AS ENUM ('facil', 'medio', 'dificil');

-- Create enum for game mode
CREATE TYPE public.game_mode AS ENUM ('single', 'multiplayer');

-- Create enum for game result
CREATE TYPE public.game_result AS ENUM ('vitoria', 'derrota', 'empate');

-- Create table for game scores
CREATE TABLE public.game_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  time_taken INTEGER, -- in seconds
  difficulty game_difficulty NOT NULL DEFAULT 'medio',
  mode game_mode NOT NULL DEFAULT 'single',
  result game_result,
  moves_count INTEGER,
  combos INTEGER DEFAULT 0,
  accuracy NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for game high scores (best per game/difficulty)
CREATE TABLE public.game_high_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_id TEXT NOT NULL,
  difficulty game_difficulty NOT NULL DEFAULT 'medio',
  best_score INTEGER NOT NULL DEFAULT 0,
  best_time INTEGER,
  games_played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, game_id, difficulty)
);

-- Create table for multiplayer matches
CREATE TABLE public.multiplayer_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  player1_name TEXT NOT NULL,
  player2_name TEXT NOT NULL,
  winner TEXT, -- 'player1', 'player2', or null for draw
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  moves_count INTEGER,
  time_taken INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_high_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multiplayer_matches ENABLE ROW LEVEL SECURITY;

-- RLS policies for game_scores
CREATE POLICY "Users can view all scores for ranking"
ON public.game_scores FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own scores"
ON public.game_scores FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS policies for game_high_scores
CREATE POLICY "Users can view all high scores"
ON public.game_high_scores FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own high scores"
ON public.game_high_scores FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own high scores"
ON public.game_high_scores FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for multiplayer_matches
CREATE POLICY "Users can view all matches"
ON public.multiplayer_matches FOR SELECT
USING (true);

CREATE POLICY "Users can insert matches"
ON public.multiplayer_matches FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Function to update high scores
CREATE OR REPLACE FUNCTION public.update_game_high_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.game_high_scores (user_id, game_id, difficulty, best_score, best_time, games_played, wins, losses, draws)
  VALUES (
    NEW.user_id,
    NEW.game_id,
    NEW.difficulty,
    NEW.score,
    NEW.time_taken,
    1,
    CASE WHEN NEW.result = 'vitoria' THEN 1 ELSE 0 END,
    CASE WHEN NEW.result = 'derrota' THEN 1 ELSE 0 END,
    CASE WHEN NEW.result = 'empate' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, game_id, difficulty) DO UPDATE SET
    best_score = GREATEST(game_high_scores.best_score, NEW.score),
    best_time = CASE 
      WHEN game_high_scores.best_time IS NULL THEN NEW.time_taken
      WHEN NEW.time_taken IS NULL THEN game_high_scores.best_time
      ELSE LEAST(game_high_scores.best_time, NEW.time_taken)
    END,
    games_played = game_high_scores.games_played + 1,
    wins = game_high_scores.wins + CASE WHEN NEW.result = 'vitoria' THEN 1 ELSE 0 END,
    losses = game_high_scores.losses + CASE WHEN NEW.result = 'derrota' THEN 1 ELSE 0 END,
    draws = game_high_scores.draws + CASE WHEN NEW.result = 'empate' THEN 1 ELSE 0 END,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-update high scores
CREATE TRIGGER on_game_score_insert
AFTER INSERT ON public.game_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_game_high_score();