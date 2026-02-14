import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, Lock, Crown, Gem, Flame, Medal, Sparkles, Brain, Search, User, Shuffle, Gamepad2, Target, Zap, Award, Home, ArrowLeft } from "lucide-react";
import { useGameAchievements, GameAchievementDefinition } from "@/hooks/useGameAchievements";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const iconMap: Record<string, any> = {
  star: Star, target: Target, zap: Zap, trophy: Trophy, crown: Crown,
  gem: Gem, award: Award, flame: Flame, medal: Medal, sparkles: Sparkles,
  brain: Brain, search: Search, user: User, shuffle: Shuffle, gamepad: Gamepad2,
};

const categoryConfig = {
  beginner: { name: "Iniciante", description: "Conquistas para quem está começando", icon: Star, gradient: "from-emerald-500 to-green-600" },
  master: { name: "Mestre", description: "Para jogadores experientes", icon: Trophy, gradient: "from-amber-500 to-yellow-600" },
  legend: { name: "Lenda", description: "Somente os melhores alcançam", icon: Crown, gradient: "from-purple-500 to-indigo-600" },
  games: { name: "Jogos", description: "Conquistas específicas por jogo", icon: Gamepad2, gradient: "from-blue-500 to-cyan-600" },
};

const Achievements = () => {
  const navigate = useNavigate();
  const { userAchievements, gameAchievements, getAchievementProgress, gameStats, isLoading } = useGameAchievements();

  const isEarned = (id: string) => userAchievements.some(a => a.achievement_type === id);
  const totalEarned = gameAchievements.filter(a => isEarned(a.id)).length;
  const totalAchievements = gameAchievements.length;
  const overallProgress = totalAchievements > 0 ? (totalEarned / totalAchievements) * 100 : 0;

  const categories = ["beginner", "master", "legend", "games"] as const;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Galeria de Conquistas</h1>
            <p className="text-muted-foreground">Todas as suas medalhas e progresso</p>
          </div>
        </div>

        {/* Overview Card */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                <Trophy className="h-12 w-12 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-foreground">{totalEarned} / {totalAchievements} Conquistas</h2>
                <Progress value={overallProgress} className="h-3 mt-3 max-w-md" />
                <p className="text-sm text-muted-foreground mt-2">{Math.round(overallProgress)}% completado</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-card rounded-lg p-3 shadow-sm">
                  <p className="text-2xl font-bold text-foreground">{gameStats?.totalGames || 0}</p>
                  <p className="text-xs text-muted-foreground">Jogos</p>
                </div>
                <div className="bg-card rounded-lg p-3 shadow-sm">
                  <p className="text-2xl font-bold text-foreground">{gameStats?.wins || 0}</p>
                  <p className="text-xs text-muted-foreground">Vitórias</p>
                </div>
                <div className="bg-card rounded-lg p-3 shadow-sm">
                  <p className="text-2xl font-bold text-foreground">{gameStats?.perfectGames || 0}</p>
                  <p className="text-xs text-muted-foreground">Perfeitos</p>
                </div>
                <div className="bg-card rounded-lg p-3 shadow-sm">
                  <p className="text-2xl font-bold text-foreground">{gameStats?.totalScore || 0}</p>
                  <p className="text-xs text-muted-foreground">Pontos</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Category Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Todas</TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat}>{categoryConfig[cat].name}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {categories.map(cat => (
              <AchievementCategory
                key={cat}
                categoryId={cat}
                achievements={gameAchievements.filter(a => a.category === cat)}
                isEarned={isEarned}
                getProgress={getAchievementProgress}
              />
            ))}
          </TabsContent>

          {categories.map(cat => (
            <TabsContent key={cat} value={cat}>
              <AchievementCategory
                categoryId={cat}
                achievements={gameAchievements.filter(a => a.category === cat)}
                isEarned={isEarned}
                getProgress={getAchievementProgress}
              />
            </TabsContent>
          ))}
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

interface AchievementCategoryProps {
  categoryId: keyof typeof categoryConfig;
  achievements: GameAchievementDefinition[];
  isEarned: (id: string) => boolean;
  getProgress: (a: GameAchievementDefinition) => number;
}

const AchievementCategory = ({ categoryId, achievements, isEarned, getProgress }: AchievementCategoryProps) => {
  const config = categoryConfig[categoryId];
  const CategoryIcon = config.icon;
  const earned = achievements.filter(a => isEarned(a.id)).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
          <CategoryIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">{config.name}</h3>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
        <Badge variant="outline" className="ml-auto">{earned}/{achievements.length}</Badge>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement, index) => {
          const unlocked = isEarned(achievement.id);
          const progress = getProgress(achievement);
          const percent = (progress / achievement.target) * 100;
          const IconComponent = iconMap[achievement.icon] || Star;

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${
                unlocked ? 'border-amber-400/50 bg-gradient-to-br from-amber-50/10 to-yellow-50/10' : 'opacity-70'
              }`}>
                {unlocked && (
                  <div className="absolute top-2 right-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      unlocked
                        ? `bg-gradient-to-br ${config.gradient} shadow-md`
                        : 'bg-muted'
                    }`}>
                      {unlocked ? (
                        <IconComponent className="h-7 w-7 text-white" />
                      ) : (
                        <Lock className="h-7 w-7 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-foreground">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>

                      {unlocked ? (
                        <Badge className="mt-2 bg-amber-500/20 text-amber-600 border-amber-400/30">
                          <Trophy className="h-3 w-3 mr-1" /> Desbloqueado
                        </Badge>
                      ) : (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progresso</span>
                            <span className="font-semibold">{progress}/{achievement.target}</span>
                          </div>
                          <Progress value={percent} className="h-1.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
