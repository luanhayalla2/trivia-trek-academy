import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trophy, Medal, Award, Crown, TrendingUp, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface RankingPlayer {
  id: string;
  name: string;
  score: number;
  games: number;
  accuracy: number;
  avatar: string;
  position: number;
  level: number;
  gems: number;
  isCurrentUser?: boolean;
}

const getPositionIcon = (position: number) => {
  switch (position) {
    case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
    case 2: return <Medal className="h-6 w-6 text-gray-400" />;
    case 3: return <Award className="h-6 w-6 text-amber-600" />;
    default: return <span className="text-xl font-bold text-muted-foreground">#{position}</span>;
  }
};

const getPositionColor = (position: number) => {
  switch (position) {
    case 1: return "bg-gradient-warning";
    case 2: return "bg-gradient-secondary";  
    case 3: return "bg-gradient-primary";
    default: return "bg-muted";
  }
};

const RankingCard = ({ player, showStats = true }: { player: RankingPlayer, showStats?: boolean }) => (
  <GameCard className={`p-4 ${player.position <= 3 ? getPositionColor(player.position) : ''} ${player.position <= 3 ? 'text-primary-foreground' : ''} ${player.isCurrentUser ? 'ring-2 ring-primary' : ''}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-12 h-12">
          {getPositionIcon(player.position)}
        </div>
        
        <Avatar className="w-10 h-10">
          <AvatarImage src={player.avatar} />
          <AvatarFallback>
            {player.name.split(' ').map((n: string) => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h3 className="font-bold flex items-center gap-2">
            {player.name}
            {player.isCurrentUser && (
              <Badge variant="secondary" className="text-xs">Você</Badge>
            )}
          </h3>
          {showStats && (
            <p className={`text-sm ${player.position <= 3 ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
              Nível {player.level} • {player.accuracy}% precisão
            </p>
          )}
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-2xl font-bold">
          {player.score.toLocaleString()}
        </div>
        <div className={`text-sm ${player.position <= 3 ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
          XP
        </div>
      </div>
    </div>
  </GameCard>
);

const Ranking = () => {
  const { user } = useAuth();
  const [globalRanking, setGlobalRanking] = useState<RankingPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserStats, setCurrentUserStats] = useState<RankingPlayer | null>(null);

  useEffect(() => {
    loadRankingData();
  }, [user]);

  const loadRankingData = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles sorted by total_xp
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('total_xp', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (profiles) {
        const ranking: RankingPlayer[] = profiles.map((profile, index) => ({
          id: profile.id,
          name: profile.username || 'Jogador',
          score: profile.total_xp || 0,
          games: profile.questions_answered || 0,
          accuracy: Math.round(profile.accuracy || 0),
          avatar: profile.avatar_url || '',
          position: index + 1,
          level: profile.level || 1,
          gems: profile.gems || 0,
          isCurrentUser: user?.id === profile.id
        }));

        setGlobalRanking(ranking);

        // Find current user stats
        const currentUser = ranking.find(p => p.isCurrentUser);
        if (currentUser) {
          setCurrentUserStats(currentUser);
        }
      }
    } catch (error) {
      console.error('Error loading ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-warning bg-clip-text text-transparent">
                Ranking
              </span>{" "}
              Global dos Jogadores
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Veja como você se compara com outros jogadores no EduGame!
            </p>
          </div>
        </div>

        {/* Current User Stats Card */}
        {currentUserStats && (
          <div className="max-w-4xl mx-auto mb-8">
            <GameCard className="p-6 bg-gradient-primary text-primary-foreground">
              <h3 className="text-lg font-bold mb-4 text-center">Suas Estatísticas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold">{currentUserStats.level}</div>
                  <div className="text-sm opacity-80">Nível</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{currentUserStats.score}</div>
                  <div className="text-sm opacity-80">XP Total</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{currentUserStats.accuracy}%</div>
                  <div className="text-sm opacity-80">Precisão</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{currentUserStats.gems}</div>
                  <div className="text-sm opacity-80">Gemas</div>
                </div>
              </div>
            </GameCard>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Ranking Global</h2>
              <p className="text-muted-foreground">Baseado na pontuação total de XP</p>
            </div>
            
            {/* Top 3 Podium */}
            {globalRanking.length >= 3 && (
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {globalRanking.slice(0, 3).map((player) => (
                  <GameCard
                    key={player.id}
                    variant={player.position === 1 ? "warning" : player.position === 2 ? "game" : "subject"}
                    className="p-6 text-center"
                  >
                    <div className="mb-4 flex justify-center">
                      {getPositionIcon(player.position)}
                    </div>
                    <Avatar className="w-16 h-16 mx-auto mb-4">
                      <AvatarImage src={player.avatar} />
                      <AvatarFallback className="text-xl">
                        {player.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg mb-1">
                      {player.name}
                      {player.isCurrentUser && <span className="text-sm ml-2">(Você)</span>}
                    </h3>
                    <p className="text-sm opacity-80 mb-2">Nível {player.level} • {player.score} XP</p>
                    <div className="text-2xl font-bold mb-2">
                      {player.accuracy}%
                    </div>
                    <p className="text-sm opacity-80">
                      Precisão
                    </p>
                  </GameCard>
                ))}
              </div>
            )}
            
            {/* Rest of ranking */}
            <div className="space-y-3">
              {globalRanking.slice(3).map((player) => (
                <RankingCard key={player.id} player={player} />
              ))}
            </div>

            {/* Call to action */}
            <GameCard className="p-8 text-center mt-8">
              <h3 className="text-2xl font-bold mb-4">Continue Aprendendo!</h3>
              <p className="text-muted-foreground mb-6">
                Responda mais perguntas, complete missões e suba no ranking global. 
                Quanto mais você joga, mais gemas e XP ganha!
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link to="/subjects">
                  <Button size="lg" className="bg-gradient-primary">
                    <Trophy className="h-5 w-5 mr-2" />
                    Jogar Agora
                  </Button>
                </Link>
              </div>
            </GameCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ranking;