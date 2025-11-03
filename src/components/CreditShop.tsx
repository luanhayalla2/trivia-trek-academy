import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gem, Coins, Sparkles, Zap, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreditPackage {
  id: string;
  type: 'gems' | 'coins';
  amount: number;
  bonus: number;
  price: number;
  popular?: boolean;
  bestValue?: boolean;
}

const creditPackages: CreditPackage[] = [
  // Gems
  { id: "gems_1", type: "gems", amount: 50, bonus: 0, price: 4.99 },
  { id: "gems_2", type: "gems", amount: 120, bonus: 20, price: 9.99, popular: true },
  { id: "gems_3", type: "gems", amount: 250, bonus: 50, price: 19.99 },
  { id: "gems_4", type: "gems", amount: 650, bonus: 150, price: 49.99, bestValue: true },
  { id: "gems_5", type: "gems", amount: 1500, bonus: 500, price: 99.99 },
  
  // Coins
  { id: "coins_1", type: "coins", amount: 1000, bonus: 0, price: 2.99 },
  { id: "coins_2", type: "coins", amount: 2500, bonus: 500, price: 4.99, popular: true },
  { id: "coins_3", type: "coins", amount: 5000, bonus: 1000, price: 9.99 },
  { id: "coins_4", type: "coins", amount: 15000, bonus: 5000, price: 24.99, bestValue: true },
];

interface CreditShopProps {
  onPurchase?: (packageId: string) => void;
}

export const CreditShop = ({ onPurchase }: CreditShopProps) => {
  const { toast } = useToast();

  const handlePurchase = (pkg: CreditPackage) => {
    toast({
      title: "🎉 Compra simulada!",
      description: `Você compraria ${pkg.amount + pkg.bonus} ${pkg.type === 'gems' ? 'gemas' : 'moedas'} por R$ ${pkg.price.toFixed(2)}`,
    });
    
    if (onPurchase) {
      onPurchase(pkg.id);
    }
  };

  const gemsPackages = creditPackages.filter(p => p.type === 'gems');
  const coinsPackages = creditPackages.filter(p => p.type === 'coins');

  return (
    <div className="space-y-8">
      {/* Gems Section */}
      <div>
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gem className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Gemas Premium</h2>
          </div>
          <p className="text-muted-foreground">
            Compre naves especiais e desbloqueie recursos exclusivos
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {gemsPackages.map((pkg) => (
            <GameCard
              key={pkg.id}
              variant={pkg.bestValue ? "intellect" : pkg.popular ? "subject" : "default"}
              className="p-6 relative"
            >
              {pkg.bestValue && (
                <Badge className="absolute -top-2 -right-2 bg-gradient-warning">
                  <Crown className="h-3 w-3 mr-1" />
                  Melhor Valor
                </Badge>
              )}
              {pkg.popular && !pkg.bestValue && (
                <Badge className="absolute -top-2 -right-2 bg-gradient-primary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
              
              <div className="text-center mb-4">
                <Gem className="h-12 w-12 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold mb-1">
                  {pkg.amount}
                  {pkg.bonus > 0 && (
                    <span className="text-lg text-success ml-1">+{pkg.bonus}</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Gemas</div>
              </div>
              
              <Button
                onClick={() => handlePurchase(pkg)}
                className="w-full"
                variant={pkg.bestValue ? "default" : "outline"}
              >
                R$ {pkg.price.toFixed(2)}
              </Button>
            </GameCard>
          ))}
        </div>
      </div>

      {/* Coins Section */}
      <div>
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coins className="h-8 w-8 text-warning" />
            <h2 className="text-3xl font-bold">Moedas de Ouro</h2>
          </div>
          <p className="text-muted-foreground">
            Compre power-ups e itens úteis durante os jogos
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {coinsPackages.map((pkg) => (
            <GameCard
              key={pkg.id}
              variant={pkg.bestValue ? "warning" : pkg.popular ? "game" : "default"}
              className="p-6 relative"
            >
              {pkg.bestValue && (
                <Badge className="absolute -top-2 -right-2 bg-gradient-intellect">
                  <Zap className="h-3 w-3 mr-1" />
                  Melhor Oferta
                </Badge>
              )}
              {pkg.popular && !pkg.bestValue && (
                <Badge className="absolute -top-2 -right-2 bg-gradient-warning">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
              
              <div className="text-center mb-4">
                <Coins className="h-12 w-12 mx-auto mb-3 text-warning" />
                <div className="text-3xl font-bold mb-1">
                  {pkg.amount.toLocaleString()}
                  {pkg.bonus > 0 && (
                    <span className="text-lg text-success ml-1">+{pkg.bonus.toLocaleString()}</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Moedas</div>
              </div>
              
              <Button
                onClick={() => handlePurchase(pkg)}
                className="w-full"
                variant={pkg.bestValue ? "default" : "outline"}
              >
                R$ {pkg.price.toFixed(2)}
              </Button>
            </GameCard>
          ))}
        </div>
      </div>

      {/* Info Notice */}
      <GameCard className="p-6 text-center max-w-2xl mx-auto">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Nota:</strong> Este é um sistema de demonstração. Em produção, integraria-se com um gateway de pagamento real como Stripe ou PayPal.
        </p>
      </GameCard>
    </div>
  );
};
