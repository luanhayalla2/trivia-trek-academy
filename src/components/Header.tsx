import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/ui/game-card";
import { BookOpen, Trophy, User } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
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
                EdGame
              </h1>
              <p className="text-sm text-muted-foreground">Aprenda jogando!</p>
            </div>
          </div>
          
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-foreground hover:text-primary transition-colors">
                Início
              </Link>
              <Link to="/subjects" className="text-foreground hover:text-primary transition-colors">
                Disciplinas
              </Link>
              <Link to="/ranking" className="text-foreground hover:text-primary transition-colors">
                Ranking
              </Link>
              <Link to="/settings" className="text-foreground hover:text-primary transition-colors">
                Configurações
              </Link>
            </nav>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Trophy className="h-4 w-4" />
              </Button>
              <Link to="/profile">
                <Button variant="game" size="sm">
                  <User className="h-4 w-4" />
                  Perfil
                </Button>
              </Link>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;