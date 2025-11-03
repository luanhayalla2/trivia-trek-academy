import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  Calendar,
  Award,
  Star,
  BookOpen,
  Calculator,
  Atom,
  Globe,
  Palette,
  Coins,
  Gem,
  CheckCircle2,
  Zap,
  Settings,
  Map
} from "lucide-react";
import { AchievementsMap } from "@/components/AchievementsMap";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  username: string;
  level: number;
  xp: number;
  total_xp: number;
  gems: number;
  coins: number;
  accuracy: number;
  questions_answered: number;
  current_streak: number;
  best_streak: number;
  global_rank: number | null;
  active_ship: string;
  avatar_url: string | null;
  created_at: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  achievement_type: string;
  earned_at: string | null;
}

interface Mission {
  id: number;
  title: string;
  description: string;
  progress: number;
  total: number;
  reward: number;
  type: 'daily' | 'weekly';
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock missions - em produção viria do banco de dados
  const missions: Mission[] = [
    { id: 1, title: "Sequência de Fogo", description: "Acerte 10 perguntas seguidas", progress: 7, total: 10, reward: 50, type: 'daily' },
    { id: 2, title: "Explorador", description: "Jogue 5 disciplinas diferentes", progress: 3, total: 5, reward: 100, type: 'daily' },
    { id: 3, title: "Mestre da Semana", description: "Complete 20 jogos esta semana", progress: 14, total: 20, reward: 500, type: 'weekly' },
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfileData();
  }, [user, navigate]);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user?.id);

      if (achievementsError) throw achievementsError;
      setAchievements(achievementsData || []);

    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Erro ao carregar perfil",
        description: "Não foi possível carregar os dados do perfil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const xpForNextLevel = profile.level * 1000;
  const xpPercentage = (profile.xp / xpForNextLevel) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link to="/">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back')}
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                {t('common.settings')}
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('profile.title')}{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {t('profile.subtitle')}
              </span>
            </h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <GameCard variant="subject" className="p-6 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-gradient-primary">
                  {profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-2xl font-bold mb-2">{profile.username}</h2>
              <p className="text-muted-foreground mb-4">{user?.email}</p>
              
              <div className="flex justify-center items-center space-x-2 mb-4">
                <Star className="h-5 w-5 text-warning" />
                <span className="text-lg font-bold">Nível {profile.level}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>XP: {profile.xp}</span>
                  <span>{xpForNextLevel}</span>
                </div>
                <Progress value={xpPercentage} className="h-2" />
              </div>
              
              <Badge variant="secondary" className="mt-4">
                <Calendar className="h-3 w-3 mr-1" />
                Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </Badge>
            </GameCard>

            {/* Moedas e Gemas */}
            <GameCard className="p-6">
              <h3 className="text-lg font-bold mb-4">Recursos</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-warning rounded-full flex items-center justify-center">
                      <Coins className="h-5 w-5 text-warning-foreground" />
                    </div>
                    <span className="font-semibold">Moedas</span>
                  </div>
                  <span className="text-2xl font-bold text-warning">{profile.coins}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Gem className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="font-semibold">Gemas</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{profile.gems}</span>
                </div>
              </div>
              <Link to="/shop">
                <Button className="w-full mt-4" variant="default">
                  Ir para Loja
                </Button>
              </Link>
            </GameCard>

            {/* Quick Stats */}
            <GameCard className="p-6">
              <h3 className="text-lg font-bold mb-4">Estatísticas Gerais</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Perguntas Respondidas</span>
                  <span className="font-bold">{profile.questions_answered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">XP Total</span>
                  <span className="font-bold">{profile.total_xp.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precisão Média</span>
                  <span className="font-bold text-success">{profile.accuracy.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sequência Atual</span>
                  <span className="font-bold text-warning">{profile.current_streak} dias</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Melhor Sequência</span>
                  <span className="font-bold">{profile.best_streak} dias</span>
                </div>
                {profile.global_rank && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ranking Global</span>
                    <span className="font-bold text-primary">#{profile.global_rank}</span>
                  </div>
                )}
              </div>
              <Link to="/ranking">
                <Button className="w-full mt-4" variant="outline">
                  Ver Ranking Completo
                </Button>
              </Link>
            </GameCard>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="missions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="missions">
                  <Target className="h-4 w-4 mr-2" />
                  Missões
                </TabsTrigger>
                <TabsTrigger value="achievements">
                  <Trophy className="h-4 w-4 mr-2" />
                  Conquistas
                </TabsTrigger>
                <TabsTrigger value="map">
                  <Map className="h-4 w-4 mr-2" />
                  Mapa
                </TabsTrigger>
              </TabsList>

              {/* Missions Tab */}
              <TabsContent value="missions" className="mt-6">
                <h2 className="text-2xl font-bold mb-6">Missões Ativas</h2>
              <div className="grid gap-4">
                {missions.map((mission) => (
                  <GameCard key={mission.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">{mission.title}</h3>
                          <Badge variant={mission.type === 'daily' ? 'default' : 'secondary'}>
                            {mission.type === 'daily' ? 'Diária' : 'Semanal'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{mission.description}</p>
                      </div>
                      <div className="flex items-center gap-2 text-warning">
                        <Gem className="h-5 w-5" />
                        <span className="font-bold">+{mission.reward}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-semibold">{mission.progress}/{mission.total}</span>
                      </div>
                      <Progress value={(mission.progress / mission.total) * 100} className="h-2" />
                    </div>
                    {mission.progress === mission.total && (
                      <Button className="w-full mt-4" size="sm">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Resgatar Recompensa
                      </Button>
                    )}
                  </GameCard>
                ))}
              </div>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="mt-6">
                <h2 className="text-2xl font-bold mb-6">Conquistas Desbloqueadas</h2>
              {achievements.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <GameCard 
                      key={achievement.id} 
                      className="p-4 border-success"
                    >
                      <div className="flex items-start space-x-3">
                        <Award className="h-8 w-8 text-success flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-bold">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          {achievement.earned_at && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Conquistado em {new Date(achievement.earned_at).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary">
                          <Trophy className="h-3 w-3" />
                        </Badge>
                      </div>
                    </GameCard>
                  ))}
                </div>
              ) : (
                <GameCard className="p-8 text-center">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma conquista desbloqueada ainda.</p>
                  <p className="text-sm text-muted-foreground mt-2">Continue jogando para desbloquear conquistas!</p>
                </GameCard>
              )}
              </TabsContent>

              {/* Achievements Map Tab */}
              <TabsContent value="map" className="mt-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Mapa de Conquistas</h2>
                  <p className="text-muted-foreground">
                    Visualize todas as conquistas disponíveis e seu progresso
                  </p>
                </div>
                <AchievementsMap achievements={achievements} />
              </TabsContent>
            </Tabs>

            {/* Nave Ativa - Moved outside tabs */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6">Nave Ativa</h2>
              <GameCard className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Zap className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg capitalize">{profile.active_ship}</h3>
                      <p className="text-sm text-muted-foreground">Nave equipada</p>
                    </div>
                  </div>
                  <Link to="/shop">
                    <Button variant="outline">
                      Trocar Nave
                    </Button>
                  </Link>
                </div>
              </GameCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;