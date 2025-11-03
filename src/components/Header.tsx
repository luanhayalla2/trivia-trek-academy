import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/ui/game-card";
import { BookOpen, Trophy, User, Store, Gem } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [gems, setGems] = useState(0);

  useEffect(() => {
    if (user) {
      loadGems();
    }
  }, [user]);

  const loadGems = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("gems")
      .eq("id", user.id)
      .single();

    if (data) {
      setGems(data.gems);
    }
  };

  return (
    <header className="w-full border-b bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GameCard variant="game" size="sm" className="p-2">
              <BookOpen className="h-6 w-6" />
            </GameCard>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {t('header.title')}
              </h1>
              <p className="text-sm text-muted-foreground">{t('header.subtitle')}</p>
            </div>
          </div>
          
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-foreground hover:text-primary transition-colors">
                {t('header.home')}
              </Link>
              <Link to="/subjects" className="text-foreground hover:text-primary transition-colors">
                {t('header.subjects')}
              </Link>
              <Link to="/shop" className="text-foreground hover:text-primary transition-colors">
                {t('header.shop')}
              </Link>
              <Link to="/ranking" className="text-foreground hover:text-primary transition-colors">
                {t('header.ranking')}
              </Link>
              <Link to="/about" className="text-foreground hover:text-primary transition-colors">
                {t('header.about')}
              </Link>
            </nav>

            <div className="flex items-center space-x-2">
              <LanguageSelector />
              {user ? (
                <>
                  <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                    <Gem className="h-4 w-4 text-primary" />
                    <span className="font-bold">{gems}</span>
                  </div>
                  <Link to="/profile">
                    <Button variant="ghost" size="icon">
                      <User className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={signOut}>
                    {t('header.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline" size="sm" className="border-primary/50">
                      {t('header.login')}
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="sm" className="bg-gradient-knowledge shadow-glow">
                      <User className="h-4 w-4 mr-1" />
                      {t('header.register')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;