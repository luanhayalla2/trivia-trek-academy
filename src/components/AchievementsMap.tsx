import { GameCard } from "@/components/ui/game-card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Lock, Star, Target, Zap, Crown, Gem, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  achievement_type: string;
  earned_at: string | null;
  icon?: any;
  category?: string;
  progress?: number;
  total?: number;
}

interface AchievementsMapProps {
  achievements: Achievement[];
  compact?: boolean;
}

const achievementCategories = [
  {
    id: "beginner",
    name: "Iniciante",
    icon: Star,
    color: "success",
    achievements: [
      { id: "first_game", title: "Primeira Partida", description: "Complete seu primeiro jogo", icon: Star, progress: 1, total: 1 },
      { id: "first_win", title: "Primeira Vitória", description: "Acerte todas as perguntas", icon: Target, progress: 0, total: 1 },
      { id: "10_games", title: "Explorador", description: "Complete 10 jogos", icon: Zap, progress: 5, total: 10 },
    ]
  },
  {
    id: "master",
    name: "Mestre",
    icon: Trophy,
    color: "warning",
    achievements: [
      { id: "50_games", title: "Veterano", description: "Complete 50 jogos", icon: Trophy, progress: 23, total: 50 },
      { id: "perfect_score", title: "Perfeição", description: "10 jogos perfeitos", icon: Crown, progress: 3, total: 10 },
      { id: "streak_7", title: "Sequência de 7", description: "Jogue 7 dias seguidos", icon: Zap, progress: 4, total: 7 },
    ]
  },
  {
    id: "legend",
    name: "Lenda",
    icon: Crown,
    color: "intellect",
    achievements: [
      { id: "top_10", title: "Top 10", description: "Alcance o top 10 global", icon: Crown, progress: 0, total: 1 },
      { id: "1000_questions", title: "Sábio", description: "Responda 1000 perguntas", icon: Award, progress: 456, total: 1000 },
      { id: "all_subjects", title: "Polímata", description: "Complete todas as disciplinas", icon: Gem, progress: 6, total: 12 },
    ]
  },
];

export const AchievementsMap = ({ achievements, compact = false }: AchievementsMapProps) => {
  const isAchievementEarned = (achievementId: string) => {
    return achievements.some(a => a.achievement_type === achievementId);
  };

  if (compact) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {achievementCategories.flatMap(category => 
          category.achievements.map(achievement => {
            const earned = isAchievementEarned(achievement.id);
            const IconComponent = achievement.icon;
            
            return (
              <div
                key={achievement.id}
                className={`relative aspect-square rounded-lg border-2 ${
                  earned 
                    ? 'bg-gradient-success border-success' 
                    : 'bg-muted border-muted-foreground/20'
                } flex flex-col items-center justify-center p-2 transition-all hover:scale-105`}
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
          })
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {achievementCategories.map((category) => {
        const CategoryIcon = category.icon;
        const earnedCount = category.achievements.filter(a => isAchievementEarned(a.id)).length;
        const totalCount = category.achievements.length;
        
        return (
          <div key={category.id}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CategoryIcon className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold">{category.name}</h3>
                <Badge variant="outline">
                  {earnedCount}/{totalCount}
                </Badge>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.achievements.map((achievement) => {
                const earned = isAchievementEarned(achievement.id);
                const IconComponent = achievement.icon;
                const progressPercent = achievement.progress && achievement.total 
                  ? (achievement.progress / achievement.total) * 100 
                  : 0;
                
                return (
                  <GameCard
                    key={achievement.id}
                    variant={earned ? category.color as any : "default"}
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
                        
                        {!earned && achievement.progress !== undefined && achievement.total && (
                          <div className="mt-3 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Progresso</span>
                              <span className="font-semibold">
                                {achievement.progress}/{achievement.total}
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
