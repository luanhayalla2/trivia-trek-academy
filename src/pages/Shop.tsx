import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Rocket, Gem, Check } from "lucide-react";
import { Link } from "react-router-dom";

type ShipType = Database["public"]["Enums"]["ship_type"];

const ships = [
  {
    type: "explorador" as const,
    name: "🚀 Explorador",
    description: "Nave básica para iniciantes",
    cost: 0,
    color: "success",
    features: ["Velocidade padrão", "Design clássico", "Ideal para começar"]
  },
  {
    type: "velocista" as const,
    name: "⚡ Velocista",
    description: "Nave ultra-rápida",
    cost: 100,
    color: "warning",
    features: ["Velocidade máxima", "Resposta rápida", "Boost de tempo"]
  },
  {
    type: "erudito" as const,
    name: "📚 Erudito",
    description: "Nave do conhecimento",
    cost: 150,
    color: "intellect",
    features: ["Boost em todas matérias", "Biblioteca integrada", "XP extra"]
  },
  {
    type: "guerreiro" as const,
    name: "⚔️ Guerreiro",
    description: "Nave de combate aos desafios",
    cost: 120,
    color: "knowledge",
    features: ["Resistência extra", "Força em questões difíceis", "Escudo protetor"]
  },
  {
    type: "mistico" as const,
    name: "🔮 Místico",
    description: "Nave mágica e misteriosa",
    cost: 130,
    color: "wisdom",
    features: ["Intuição aprimorada", "Pistas especiais", "Sorte aumentada"]
  },
  {
    type: "cosmico" as const,
    name: "🌌 Cósmico",
    description: "Nave suprema do universo",
    cost: 200,
    color: "subject",
    features: ["Todos os boosts", "Design espacial", "Prestígio máximo"]
  }
];

const Shop = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [ownedShips, setOwnedShips] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();

      setProfile(profileData);

      // Load owned ships
      const { data: shipsData } = await supabase
        .from("ships")
        .select("ship_type")
        .eq("user_id", user!.id);

      if (shipsData) {
        setOwnedShips(shipsData.map(s => s.ship_type));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const buyShip = async (shipType: ShipType, cost: number) => {
    if (!user || !profile) return;

    if (profile.gems < cost) {
      toast({
        title: "Gemas insuficientes",
        description: `Você precisa de ${cost} gemas para comprar esta nave.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Deduct gems
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ gems: profile.gems - cost })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Add ship
      const { error: insertError } = await supabase
        .from("ships")
        .insert([{ user_id: user.id, ship_type: shipType }]);

      if (insertError) throw insertError;

      toast({
        title: "🎉 Nave adquirida!",
        description: "Sua nova nave foi adicionada à sua coleção.",
      });

      loadUserData();
    } catch (error) {
      console.error("Error buying ship:", error);
      toast({
        title: "Erro",
        description: "Não foi possível comprar a nave. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const activateShip = async (shipType: ShipType) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ active_ship: shipType })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Nave ativada!",
        description: "Sua nave foi equipada com sucesso.",
      });

      loadUserData();
    } catch (error) {
      console.error("Error activating ship:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Rocket className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-lg">Carregando loja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Loja de Naves
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Adquira naves especiais e melhore seu desempenho!
          </p>
          <div className="flex items-center justify-center gap-2">
            <Gem className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">{profile?.gems || 0} Gemas</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {ships.map((ship) => {
            const isOwned = ownedShips.includes(ship.type);
            const isActive = profile?.active_ship === ship.type;

            return (
              <GameCard
                key={ship.type}
                variant={ship.color as any}
                className="p-6"
              >
                <div className="text-center mb-4">
                  <div className="text-6xl mb-3">{ship.name.split(" ")[0]}</div>
                  <h3 className="text-2xl font-bold mb-2">{ship.name}</h3>
                  <p className="text-sm opacity-80 mb-4">{ship.description}</p>
                </div>

                <div className="space-y-2 mb-4">
                  {ship.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-current/20">
                  {isOwned ? (
                    isActive ? (
                      <Badge className="w-full justify-center py-2">
                        Equipada
                      </Badge>
                    ) : (
                      <Button
                        onClick={() => activateShip(ship.type)}
                        variant="secondary"
                        className="w-full"
                      >
                        Equipar
                      </Button>
                    )
                  ) : (
                    <Button
                      onClick={() => buyShip(ship.type, ship.cost)}
                      disabled={ship.cost > (profile?.gems || 0)}
                      className="w-full"
                    >
                      {ship.cost === 0 ? (
                        "Grátis"
                      ) : (
                        <>
                          <Gem className="mr-2 h-4 w-4" />
                          {ship.cost} Gemas
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </GameCard>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;