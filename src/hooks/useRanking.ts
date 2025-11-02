import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RankedPlayer {
  id: string;
  username: string;
  level: number;
  total_xp: number;
  gems: number;
  accuracy: number;
  questions_answered: number;
  current_streak: number;
  avatar_url: string | null;
  position: number;
}

export const useGlobalRanking = () => {
  return useQuery({
    queryKey: ['global-ranking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, level, total_xp, gems, accuracy, questions_answered, current_streak, avatar_url')
        .order('total_xp', { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || []).map((player, index) => ({
        ...player,
        position: index + 1
      })) as RankedPlayer[];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export const useUserRank = (userId?: string) => {
  return useQuery({
    queryKey: ['user-rank', userId],
    queryFn: async () => {
      if (!userId) return null;

      // Get user's total XP
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('total_xp')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Count how many users have more XP
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('total_xp', userProfile.total_xp);

      if (countError) throw countError;

      return (count || 0) + 1;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};
