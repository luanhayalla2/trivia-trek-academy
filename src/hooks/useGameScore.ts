import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type GameDifficulty = 'facil' | 'medio' | 'dificil';
export type GameMode = 'single' | 'multiplayer';
export type GameResult = 'vitoria' | 'derrota' | 'empate';

interface SaveScoreParams {
  gameId: string;
  score: number;
  timeTaken?: number;
  difficulty: GameDifficulty;
  mode: GameMode;
  result?: GameResult;
  movesCount?: number;
  combos?: number;
  accuracy?: number;
}

interface SaveMultiplayerMatchParams {
  gameId: string;
  player1Name: string;
  player2Name: string;
  winner?: 'player1' | 'player2' | null;
  player1Score?: number;
  player2Score?: number;
  movesCount?: number;
  timeTaken?: number;
}

export const useGameScore = () => {
  const { user } = useAuth();

  const saveScore = useMutation({
    mutationFn: async (params: SaveScoreParams) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('game_scores')
        .insert({
          user_id: user.id,
          game_id: params.gameId,
          score: params.score,
          time_taken: params.timeTaken,
          difficulty: params.difficulty,
          mode: params.mode,
          result: params.result,
          moves_count: params.movesCount,
          combos: params.combos,
          accuracy: params.accuracy
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  });

  const saveMultiplayerMatch = useMutation({
    mutationFn: async (params: SaveMultiplayerMatchParams) => {
      const { data, error } = await supabase
        .from('multiplayer_matches')
        .insert({
          user_id: user?.id || null,
          game_id: params.gameId,
          player1_name: params.player1Name,
          player2_name: params.player2Name,
          winner: params.winner,
          player1_score: params.player1Score,
          player2_score: params.player2Score,
          moves_count: params.movesCount,
          time_taken: params.timeTaken
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  });

  return { saveScore, saveMultiplayerMatch };
};

export const useGameRanking = (gameId?: string, difficulty?: GameDifficulty) => {
  return useQuery({
    queryKey: ['game-ranking', gameId, difficulty],
    queryFn: async () => {
      let query = supabase
        .from('game_high_scores')
        .select(`
          *,
          profiles:user_id (username, avatar_url, level)
        `)
        .order('best_score', { ascending: false })
        .limit(50);

      if (gameId) {
        query = query.eq('game_id', gameId);
      }
      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 2
  });
};

export const useUserGameHistory = (gameId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-game-history', user?.id, gameId],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('game_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (gameId) {
        query = query.eq('game_id', gameId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2
  });
};

export const useUserHighScores = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-high-scores', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('game_high_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('best_score', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2
  });
};
