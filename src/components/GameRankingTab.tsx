import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Crown, Medal, Award } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const games = [
  { id: 'all', name: 'Todos os Jogos' },
  { id: 'tictactoe', name: 'Jogo da Velha' },
  { id: 'checkers', name: 'Damas' },
  { id: 'chess', name: 'Xadrez' },
  { id: 'memory', name: 'Memória' },
  { id: 'wordsearch', name: 'Caça-Palavras' },
  { id: 'crossword', name: 'Palavras Cruzadas' },
];

const difficulties = [
  { id: 'all', name: 'Todas' },
  { id: 'facil', name: 'Fácil' },
  { id: 'medio', name: 'Médio' },
  { id: 'dificil', name: 'Difícil' },
];

export const GameRankingTab = () => {
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const { data: ranking, isLoading } = useQuery({
    queryKey: ['game-ranking', selectedGame, selectedDifficulty],
    queryFn: async () => {
      let query = supabase
        .from('game_high_scores')
        .select(`
          *,
          profiles:user_id (username, avatar_url, level)
        `)
        .order('best_score', { ascending: false })
        .limit(50);

      if (selectedGame !== 'all') {
        query = query.eq('game_id', selectedGame);
      }
      if (selectedDifficulty !== 'all') {
        query = query.eq('difficulty', selectedDifficulty);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 2
  });

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{position}</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <Select value={selectedGame} onValueChange={setSelectedGame}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecione o jogo" />
          </SelectTrigger>
          <SelectContent>
            {games.map(game => (
              <SelectItem key={game.id} value={game.id}>{game.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Dificuldade" />
          </SelectTrigger>
          <SelectContent>
            {difficulties.map(diff => (
              <SelectItem key={diff.id} value={diff.id}>{diff.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : !ranking?.length ? (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhuma pontuação registrada ainda.</p>
          <p className="text-sm">Jogue para aparecer no ranking!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ranking.map((entry: any, idx: number) => (
            <Card key={entry.id} className={`p-3 ${idx < 3 ? 'border-primary/50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 flex justify-center">{getPositionIcon(idx + 1)}</div>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={entry.profiles?.avatar_url} />
                    <AvatarFallback>{entry.profiles?.username?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{entry.profiles?.username || 'Jogador'}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.games_played} jogos • {entry.wins} vitórias
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{entry.best_score}</p>
                  <Badge variant="outline" className="text-xs">
                    {games.find(g => g.id === entry.game_id)?.name || entry.game_id}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
