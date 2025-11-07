import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

type PaymentMethod = 'credit_card' | 'paypal' | 'pix' | null;

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(null);
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);

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

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    if (method === 'pix') {
      // Simular geração de QR Code Pix
      setPixQrCode('00020126580014BR.GOV.BCB.PIX0136' + Math.random().toString(36).substring(2, 15));
    }
  };

  const handlePurchase = async () => {
    if (!packageDetails || !user || !selectedPaymentMethod) {
      toast({
        title: t('checkout.error'),
        description: t('checkout.selectPaymentFirst'),
        variant: "destructive",
      });
      return;
    }

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
                  <Button 
                    variant={selectedPaymentMethod === 'credit_card' ? "default" : "outline"}
                    className="w-full justify-start h-auto py-4"
                    onClick={() => handlePaymentMethodSelect('credit_card')}
                  >
                    <CreditCard className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">{t('checkout.creditCard')}</div>
                      <div className="text-xs text-muted-foreground">{t('checkout.creditCardDesc')}</div>
                    </div>
                  </Button>

                  {selectedPaymentMethod === 'credit_card' && (
                    <Card className="p-4 space-y-4 bg-background/50">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('checkout.cardNumber')}</label>
                        <Input placeholder="1234 5678 9012 3456" maxLength={19} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('checkout.cardName')}</label>
                        <Input placeholder={t('checkout.cardNamePlaceholder')} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{t('checkout.cardExpiry')}</label>
                          <Input placeholder="MM/AA" maxLength={5} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">CVV</label>
                          <Input placeholder="123" maxLength={4} />
                        </div>
                      </div>
                    </Card>
                  )}
                  
                  <Button 
                    variant={selectedPaymentMethod === 'paypal' ? "default" : "outline"}
                    className="w-full justify-start h-auto py-4"
                    onClick={() => handlePaymentMethodSelect('paypal')}
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png" alt="PayPal" className="h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">PayPal</div>
                      <div className="text-xs text-muted-foreground">{t('checkout.paypalDesc')}</div>
                    </div>
                  </Button>

                  {selectedPaymentMethod === 'paypal' && (
                    <Card className="p-4 space-y-4 bg-background/50">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('checkout.paypalEmail')}</label>
                        <Input type="email" placeholder="seu-email@exemplo.com" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('checkout.paypalPassword')}</label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                    </Card>
                  )}

                  <Button 
                    variant={selectedPaymentMethod === 'pix' ? "default" : "outline"}
                    className="w-full justify-start h-auto py-4"
                    onClick={() => handlePaymentMethodSelect('pix')}
                  >
                    <Coins className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">Pix</div>
                      <div className="text-xs text-muted-foreground">{t('checkout.pixDesc')}</div>
                    </div>
                  </Button>

                  {selectedPaymentMethod === 'pix' && pixQrCode && (
                    <Card className="p-4 bg-background/50">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="bg-white p-4 rounded-lg">
                          <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded">
                            <p className="text-xs text-gray-500 text-center px-4">{t('checkout.pixQrCode')}</p>
                          </div>
                        </div>
                        <div className="w-full space-y-2">
                          <label className="text-sm font-medium">{t('checkout.pixCode')}</label>
                          <div className="flex gap-2">
                            <Input value={pixQrCode} readOnly className="font-mono text-xs" />
                            <Button variant="outline" size="sm" onClick={() => {
                              navigator.clipboard.writeText(pixQrCode);
                              toast({ title: t('checkout.pixCopied') });
                            }}>
                              {t('checkout.copy')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
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
