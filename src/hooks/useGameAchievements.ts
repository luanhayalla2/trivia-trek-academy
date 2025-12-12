import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface GameAchievementDefinition {
  id: string;
  title: string;
  description: string;
  type: "games_played" | "wins" | "perfect_games" | "streak" | "score" | "time";
  target: number;
  icon: string;
  category: "beginner" | "master" | "legend" | "games";
}

export const gameAchievements: GameAchievementDefinition[] = [
  // Beginner achievements
  { id: "first_game", title: "Primeira Partida", description: "Complete seu primeiro jogo", type: "games_played", target: 1, icon: "star", category: "beginner" },
  { id: "first_win", title: "Primeira Vitória", description: "Vença seu primeiro jogo", type: "wins", target: 1, icon: "target", category: "beginner" },
  { id: "10_games", title: "Explorador", description: "Complete 10 jogos", type: "games_played", target: 10, icon: "zap", category: "beginner" },
  { id: "25_games", title: "Jogador Dedicado", description: "Complete 25 jogos", type: "games_played", target: 25, icon: "gamepad", category: "beginner" },
  
  // Master achievements
  { id: "50_games", title: "Veterano", description: "Complete 50 jogos", type: "games_played", target: 50, icon: "trophy", category: "master" },
  { id: "100_games", title: "Centenário", description: "Complete 100 jogos", type: "games_played", target: 100, icon: "crown", category: "master" },
  { id: "10_wins", title: "Vencedor", description: "Vença 10 jogos", type: "wins", target: 10, icon: "medal", category: "master" },
  { id: "perfect_5", title: "Perfeição", description: "5 jogos perfeitos", type: "perfect_games", target: 5, icon: "sparkles", category: "master" },
  { id: "perfect_10", title: "Mestre Perfeito", description: "10 jogos perfeitos", type: "perfect_games", target: 10, icon: "gem", category: "master" },
  
  // Legend achievements
  { id: "200_games", title: "Lenda", description: "Complete 200 jogos", type: "games_played", target: 200, icon: "flame", category: "legend" },
  { id: "50_wins", title: "Campeão", description: "Vença 50 jogos", type: "wins", target: 50, icon: "trophy", category: "legend" },
  { id: "score_1000", title: "Pontuador", description: "Acumule 1000 pontos totais", type: "score", target: 1000, icon: "star", category: "legend" },
  { id: "score_5000", title: "Mestre Pontuador", description: "Acumule 5000 pontos totais", type: "score", target: 5000, icon: "crown", category: "legend" },
  { id: "score_10000", title: "Lenda Pontuadora", description: "Acumule 10000 pontos totais", type: "score", target: 10000, icon: "gem", category: "legend" },
  
  // Game-specific achievements
  { id: "quiz_master", title: "Mestre do Quiz", description: "10 jogos perfeitos no Quiz", type: "perfect_games", target: 10, icon: "brain", category: "games" },
  { id: "memory_master", title: "Memória de Elefante", description: "10 jogos perfeitos na Memória", type: "perfect_games", target: 10, icon: "brain", category: "games" },
  { id: "word_hunter", title: "Caçador de Palavras", description: "Encontre 100 palavras", type: "score", target: 100, icon: "search", category: "games" },
  { id: "hangman_pro", title: "Mestre da Forca", description: "Vença 20 jogos de Forca", type: "wins", target: 20, icon: "user", category: "games" },
  { id: "anagram_expert", title: "Expert em Anagramas", description: "Resolva 50 anagramas", type: "wins", target: 50, icon: "shuffle", category: "games" },
];

export const useGameAchievements = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: userAchievements = [], isLoading } = useQuery({
    queryKey: ["user-achievements", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: gameStats } = useQuery({
    queryKey: ["game-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data: scores, error } = await supabase
        .from("game_scores")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      const totalGames = scores?.length || 0;
      const wins = scores?.filter(s => s.result === "vitoria").length || 0;
      const perfectGames = scores?.filter(s => s.accuracy === 100).length || 0;
      const totalScore = scores?.reduce((acc, s) => acc + (s.score || 0), 0) || 0;
      
      return { totalGames, wins, perfectGames, totalScore };
    },
    enabled: !!user,
  });

  const awardAchievement = useMutation({
    mutationFn: async (achievementDef: GameAchievementDefinition) => {
      if (!user) throw new Error("User not authenticated");
      
      // Check if already earned
      const existing = userAchievements.find(a => a.achievement_type === achievementDef.id);
      if (existing) return null;
      
      const { data, error } = await supabase
        .from("achievements")
        .insert({
          user_id: user.id,
          achievement_type: achievementDef.id,
          title: achievementDef.title,
          description: achievementDef.description,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, achievement) => {
      if (data) {
        toast.success(`🏆 Conquista Desbloqueada: ${achievement.title}!`);
        queryClient.invalidateQueries({ queryKey: ["user-achievements"] });
      }
    },
  });

  const checkAndAwardAchievements = async () => {
    if (!user || !gameStats) return;
    
    for (const achievement of gameAchievements) {
      const alreadyEarned = userAchievements.some(a => a.achievement_type === achievement.id);
      if (alreadyEarned) continue;
      
      let earned = false;
      
      switch (achievement.type) {
        case "games_played":
          earned = gameStats.totalGames >= achievement.target;
          break;
        case "wins":
          earned = gameStats.wins >= achievement.target;
          break;
        case "perfect_games":
          earned = gameStats.perfectGames >= achievement.target;
          break;
        case "score":
          earned = gameStats.totalScore >= achievement.target;
          break;
      }
      
      if (earned) {
        await awardAchievement.mutateAsync(achievement);
      }
    }
  };

  const getAchievementProgress = (achievement: GameAchievementDefinition) => {
    if (!gameStats) return 0;
    
    switch (achievement.type) {
      case "games_played":
        return Math.min(gameStats.totalGames, achievement.target);
      case "wins":
        return Math.min(gameStats.wins, achievement.target);
      case "perfect_games":
        return Math.min(gameStats.perfectGames, achievement.target);
      case "score":
        return Math.min(gameStats.totalScore, achievement.target);
      default:
        return 0;
    }
  };

  return {
    userAchievements,
    gameStats,
    isLoading,
    checkAndAwardAchievements,
    getAchievementProgress,
    gameAchievements,
  };
};
