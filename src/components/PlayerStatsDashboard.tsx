import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Target, TrendingUp, Gamepad2, Loader2 } from 'lucide-react';

interface GameStats {
  game_id: string;
  games_played: number;
  wins: number;
  losses: number;
  draws: number;
  best_score: number;
  win_rate: number;
}

interface DailyProgress {
  date: string;
  games: number;
  wins: number;
  xp: number;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

const GAME_NAMES: Record<string, string> = {
  chess: 'Xadrez',
  checkers: 'Damas',
  tictactoe: 'Jogo da Velha',
  trilha: 'Trilha',
  memory: 'Memória',
  puzzle: 'Quebra-Cabeças',
  wordsearch: 'Caça-Palavras',
  crossword: 'Palavras Cruzadas',
  anagram: 'Anagrama',
  hangman: 'Forca',
  quiz: 'Quiz',
  domino: 'Dominó',
  ludo: 'Ludo',
  poker: 'Poker',
  cardgame: 'Jogo de Cartas',
  matchcolumns: 'Ligar Colunas'
};

const PlayerStatsDashboard = () => {
  const { user } = useAuth();
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({
    totalGames: 0,
    totalWins: 0,
    avgWinRate: 0,
    bestScore: 0
  });

  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      try {
        // Load high scores by game
        const { data: highScores, error: hsError } = await supabase
          .from('game_high_scores')
          .select('*')
          .eq('user_id', user.id);

        if (hsError) throw hsError;

        const stats: GameStats[] = (highScores || []).map(hs => ({
          game_id: hs.game_id,
          games_played: hs.games_played,
          wins: hs.wins,
          losses: hs.losses,
          draws: hs.draws,
          best_score: hs.best_score,
          win_rate: hs.games_played > 0 ? Math.round((hs.wins / hs.games_played) * 100) : 0
        }));

        setGameStats(stats);

        // Calculate totals
        const totals = stats.reduce((acc, s) => ({
          totalGames: acc.totalGames + s.games_played,
          totalWins: acc.totalWins + s.wins,
          avgWinRate: 0,
          bestScore: Math.max(acc.bestScore, s.best_score)
        }), { totalGames: 0, totalWins: 0, avgWinRate: 0, bestScore: 0 });

        totals.avgWinRate = totals.totalGames > 0 
          ? Math.round((totals.totalWins / totals.totalGames) * 100) 
          : 0;

        setTotalStats(totals);

        // Load daily progress (last 7 days)
        const { data: scores, error: scoresError } = await supabase
          .from('game_scores')
          .select('created_at, result, score')
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: true });

        if (scoresError) throw scoresError;

        // Group by day
        const dailyMap = new Map<string, DailyProgress>();
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
          const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short' });
          dailyMap.set(dateStr, { date: dateStr, games: 0, wins: 0, xp: 0 });
        }

        scores?.forEach(score => {
          const dateStr = new Date(score.created_at).toLocaleDateString('pt-BR', { weekday: 'short' });
          const day = dailyMap.get(dateStr);
          if (day) {
            day.games++;
            if (score.result === 'vitoria') day.wins++;
            day.xp += score.score || 0;
          }
        });

        setDailyProgress(Array.from(dailyMap.values()));

      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pieData = gameStats.slice(0, 5).map(stat => ({
    name: GAME_NAMES[stat.game_id] || stat.game_id,
    value: stat.games_played
  }));

  const barData = gameStats.map(stat => ({
    name: GAME_NAMES[stat.game_id] || stat.game_id,
    vitórias: stat.wins,
    derrotas: stat.losses,
    empates: stat.draws
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Gamepad2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Jogos</p>
              <p className="text-2xl font-bold">{totalStats.totalGames}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/10">
              <Trophy className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vitórias</p>
              <p className="text-2xl font-bold">{totalStats.totalWins}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-500/10">
              <Target className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Vitória</p>
              <p className="text-2xl font-bold">{totalStats.avgWinRate}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-500/10">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Melhor Pontuação</p>
              <p className="text-2xl font-bold">{totalStats.bestScore}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progress">Progresso Diário</TabsTrigger>
          <TabsTrigger value="games">Por Jogo</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Progresso dos Últimos 7 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyProgress}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="games" 
                      name="Jogos"
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="wins" 
                      name="Vitórias"
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-2))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Desempenho por Jogo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="vitórias" fill="hsl(var(--chart-2))" stackId="a" />
                    <Bar dataKey="derrotas" fill="hsl(var(--chart-4))" stackId="a" />
                    <Bar dataKey="empates" fill="hsl(var(--chart-3))" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Jogos Mais Jogados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlayerStatsDashboard;
