import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gem, Coins, CreditCard, Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PackageDetails {
  id: string;
  type: 'gems' | 'coins';
  amount: number;
  bonus: number;
  price: number;
}

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);

  useEffect(() => {
    const pkgId = searchParams.get('package');
    const type = searchParams.get('type') as 'gems' | 'coins';
    const amount = searchParams.get('amount');
    const bonus = searchParams.get('bonus');
    const price = searchParams.get('price');

    if (pkgId && type && amount && bonus && price) {
      setPackageDetails({
        id: pkgId,
        type,
        amount: parseInt(amount),
        bonus: parseInt(bonus),
        price: parseFloat(price),
      });
    } else {
      navigate('/shop');
    }
  }, [searchParams, navigate]);

  const handlePurchase = async () => {
    if (!packageDetails || !user) return;

    setProcessing(true);

    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Buscar perfil atual
      const { data: profile } = await supabase
        .from('profiles')
        .select('gems, coins')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('Perfil não encontrado');

      // Atualizar saldo
      const totalAmount = packageDetails.amount + packageDetails.bonus;
      const updates = packageDetails.type === 'gems'
        ? { gems: (profile.gems || 0) + totalAmount }
        : { coins: (profile.coins || 0) + totalAmount };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "✨ " + t('checkout.success'),
        description: `${t('checkout.received')} ${totalAmount} ${packageDetails.type === 'gems' ? t('shop.gems') : t('shop.coins')}!`,
      });

      setTimeout(() => {
        navigate('/shop');
      }, 1500);
    } catch (error) {
      console.error('Erro na compra:', error);
      toast({
        title: t('checkout.error'),
        description: t('checkout.errorMessage'),
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!packageDetails) {
    return null;
  }

  const totalAmount = packageDetails.amount + packageDetails.bonus;
  const Icon = packageDetails.type === 'gems' ? Gem : Coins;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background/95 to-primary/5">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <Button
          variant="ghost"
          onClick={() => navigate('/shop')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-primary bg-clip-text text-transparent">
            {t('checkout.title')}
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Package Details */}
            <GameCard variant={packageDetails.type === 'gems' ? 'intellect' : 'warning'} className="p-6">
              <h2 className="text-2xl font-bold mb-6">{t('checkout.packageDetails')}</h2>
              
              <div className="flex items-center justify-center mb-6">
                <Icon className="h-24 w-24" />
              </div>

              <div className="space-y-4 text-center">
                <div>
                  <div className="text-5xl font-bold mb-2">
                    {packageDetails.amount}
                    {packageDetails.bonus > 0 && (
                      <span className="text-2xl text-success ml-2">+{packageDetails.bonus}</span>
                    )}
                  </div>
                  <div className="text-muted-foreground">
                    {packageDetails.type === 'gems' ? t('shop.gems') : t('shop.coins')}
                  </div>
                </div>

                {packageDetails.bonus > 0 && (
                  <Badge className="bg-gradient-success">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {t('checkout.bonus')}: +{packageDetails.bonus}
                  </Badge>
                )}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-background/50 backdrop-blur-sm">
                <div className="flex justify-between items-center text-lg">
                  <span>{t('checkout.total')}:</span>
                  <span className="text-2xl font-bold">R$ {packageDetails.price.toFixed(2)}</span>
                </div>
              </div>
            </GameCard>

            {/* Payment Method */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {t('checkout.paymentMethod')}
                  </CardTitle>
                  <CardDescription>{t('checkout.selectPayment')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start h-auto py-4">
                    <CreditCard className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">{t('checkout.creditCard')}</div>
                      <div className="text-xs text-muted-foreground">{t('checkout.creditCardDesc')}</div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start h-auto py-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png" alt="PayPal" className="h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">PayPal</div>
                      <div className="text-xs text-muted-foreground">{t('checkout.paypalDesc')}</div>
                    </div>
                  </Button>

                  <Button variant="outline" className="w-full justify-start h-auto py-4">
                    <Coins className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">Pix</div>
                      <div className="text-xs text-muted-foreground">{t('checkout.pixDesc')}</div>
                    </div>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>{t('checkout.securePayment')}</p>
                  </div>

                  <Button
                    onClick={handlePurchase}
                    disabled={processing}
                    className="w-full"
                    size="lg"
                  >
                    {processing ? t('checkout.processing') : `${t('checkout.confirmPurchase')} - R$ ${packageDetails.price.toFixed(2)}`}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-4">
                    💡 {t('checkout.demo')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
