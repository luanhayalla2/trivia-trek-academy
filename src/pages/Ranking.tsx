import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Trophy, Medal, Award, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobalRanking, useUserRank } from "@/hooks/useRanking";

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

const RankingCard = ({ player, isCurrentUser = false }: { player: any, isCurrentUser?: boolean }) => (
  <GameCard className={`p-4 ${player.position <= 3 ? getPositionColor(player.position) : ''} ${player.position <= 3 ? 'text-primary-foreground' : ''} ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-12 h-12">
          {getPositionIcon(player.position)}
        </div>
        
        <Avatar className="w-10 h-10">
          <AvatarImage src={player.avatar_url || undefined} />
          <AvatarFallback>
            {player.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h3 className="font-bold">
            {player.username}
            {isCurrentUser && <span className="ml-2 text-sm">(Você)</span>}
          </h3>
          <p className={`text-sm ${player.position <= 3 ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
            Nível {player.level} • {player.questions_answered} perguntas
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-2xl font-bold">
          {player.total_xp.toLocaleString()}
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
  const { data: ranking, isLoading } = useGlobalRanking();
  const { data: userRank } = useUserRank(user?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando ranking...</p>
        </div>
      </div>
    );
  }

  const topThree = ranking?.slice(0, 3) || [];
  const restOfRanking = ranking?.slice(3) || [];

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
              Global
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Veja os melhores jogadores e compare seu desempenho com outros estudantes!
            </p>
            {userRank && (
              <Badge variant="secondary" className="mt-4">
                Sua posição: #{userRank}
              </Badge>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Ranking Geral</h2>
              <p className="text-muted-foreground">Baseado no XP total acumulado</p>
            </div>
            
            {/* Pódio */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {topThree.map((player) => {
                const isCurrentUser = player.id === user?.id;
                return (
                  <GameCard
                    key={player.id}
                    variant={player.position === 1 ? "warning" : player.position === 2 ? "game" : "subject"}
                    className={`p-6 text-center ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}
                  >
                    <div className="mb-4">
                      {getPositionIcon(player.position)}
                    </div>
                    <Avatar className="w-16 h-16 mx-auto mb-4">
                      <AvatarImage src={player.avatar_url || undefined} />
                      <AvatarFallback className="text-xl">
                        {player.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg mb-2">
                      {player.username}
                      {isCurrentUser && <span className="block text-sm">(Você)</span>}
                    </h3>
                    <div className="text-2xl font-bold mb-2">
                      {player.total_xp.toLocaleString()} XP
                    </div>
                    <p className="text-sm opacity-80">
                      Nível {player.level} • {player.accuracy.toFixed(1)}% precisão
                    </p>
                  </GameCard>
                );
              })}
            </div>
            
            {/* Restante do ranking */}
            <div className="space-y-3">
              {restOfRanking.map((player) => (
                <RankingCard 
                  key={player.id} 
                  player={player}
                  isCurrentUser={player.id === user?.id}
                />
              ))}
            </div>

            {ranking && ranking.length === 0 && (
              <GameCard className="p-8 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Ainda não há jogadores no ranking.</p>
                <p className="text-sm text-muted-foreground mt-2">Seja o primeiro a jogar!</p>
              </GameCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ranking;
