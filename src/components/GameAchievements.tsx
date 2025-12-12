import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GameCard } from "@/components/ui/game-card";
import { Trophy, Lock, Star, Target, Zap, Crown, Gem, Award, Flame, Medal, Sparkles, Brain, Search, User, Shuffle, Gamepad2 } from "lucide-react";
import { useGameAchievements, GameAchievementDefinition } from "@/hooks/useGameAchievements";

const iconMap: Record<string, any> = {
  star: Star,
  target: Target,
  zap: Zap,
  trophy: Trophy,
  crown: Crown,
  gem: Gem,
  award: Award,
  flame: Flame,
  medal: Medal,
  sparkles: Sparkles,
  brain: Brain,
  search: Search,
  user: User,
  shuffle: Shuffle,
  gamepad: Gamepad2,
};

const categoryConfig = {
  beginner: { name: "Iniciante", icon: Star, color: "success" },
  master: { name: "Mestre", icon: Trophy, color: "warning" },
  legend: { name: "Lenda", icon: Crown, color: "intellect" },
  games: { name: "Jogos", icon: Gamepad2, color: "primary" },
};

interface GameAchievementsProps {
  compact?: boolean;
}

export const GameAchievements = ({ compact = false }: GameAchievementsProps) => {
  const { userAchievements, gameAchievements, getAchievementProgress, isLoading } = useGameAchievements();

  const isAchievementEarned = (achievementId: string) => {
    return userAchievements.some(a => a.achievement_type === achievementId);
  };

  const categories = ["beginner", "master", "legend", "games"] as const;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {gameAchievements.map((achievement) => {
          const earned = isAchievementEarned(achievement.id);
          const IconComponent = iconMap[achievement.icon] || Star;
          
          return (
            <div
              key={achievement.id}
              className={`relative aspect-square rounded-lg border-2 ${
                earned 
                  ? 'bg-gradient-success border-success' 
                  : 'bg-muted border-muted-foreground/20'
              } flex flex-col items-center justify-center p-2 transition-all hover:scale-105`}
              title={achievement.description}
            >
              {earned ? (
                <>
                  <IconComponent className="h-6 w-6 text-success-foreground mb-1" />
                  <span className="text-xs font-bold text-success-foreground text-center line-clamp-1">
                    {achievement.title}
                  </span>
                </>
              ) : (
                <>
                  <Lock className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground text-center line-clamp-1">
                    Bloqueado
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categories.map((categoryId) => {
        const config = categoryConfig[categoryId];
        const CategoryIcon = config.icon;
        const categoryAchievements = gameAchievements.filter(a => a.category === categoryId);
        const earnedCount = categoryAchievements.filter(a => isAchievementEarned(a.id)).length;
        const totalCount = categoryAchievements.length;
        
        if (categoryAchievements.length === 0) return null;
        
        return (
          <div key={categoryId}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CategoryIcon className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold">{config.name}</h3>
                <Badge variant="outline">
                  {earnedCount}/{totalCount}
                </Badge>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAchievements.map((achievement) => {
                const earned = isAchievementEarned(achievement.id);
                const IconComponent = iconMap[achievement.icon] || Star;
                const progress = getAchievementProgress(achievement);
                const progressPercent = (progress / achievement.target) * 100;
                
                return (
                  <GameCard
                    key={achievement.id}
                    variant={earned ? config.color as any : "default"}
                    className={`p-4 ${!earned && 'opacity-60'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        earned ? 'bg-white/20' : 'bg-muted'
                      }`}>
                        {earned ? (
                          <IconComponent className="h-6 w-6" />
                        ) : (
                          <Lock className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold mb-1">{achievement.title}</h4>
                        <p className={`text-sm ${earned ? 'opacity-90' : 'text-muted-foreground'}`}>
                          {achievement.description}
                        </p>
                        
                        {!earned && (
                          <div className="mt-3 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Progresso</span>
                              <span className="font-semibold">
                                {progress}/{achievement.target}
                              </span>
                            </div>
                            <Progress value={progressPercent} className="h-1.5" />
                          </div>
                        )}
                        
                        {earned && (
                          <Badge variant="secondary" className="mt-2">
                            <Trophy className="h-3 w-3 mr-1" />
                            Desbloqueado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </GameCard>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
