import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/ui/game-card";
import { Play, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import mascot from "@/assets/mascot.png";

const Hero = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Aprenda{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Brincando
              </span>{" "}
              com o EdGame
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Transforme seus estudos em uma aventura emocionante! Jogue, aprenda e 
              conquiste conhecimento em diversas disciplinas de forma divertida e interativa.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link to="/subjects">
                <Button variant="game" size="lg" className="text-lg px-8">
                  <Play className="h-5 w-5" />
                  Começar a Jogar
                </Button>
              </Link>
              <Link to="/subjects">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Ver Disciplinas
                </Button>
              </Link>
            </div>

            <div className="flex gap-8 justify-center lg:justify-start">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5+</div>
                <div className="text-sm text-muted-foreground">Disciplinas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">Perguntas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">∞</div>
                <div className="text-sm text-muted-foreground">Diversão</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <GameCard variant="subject" className="p-8 text-center">
              <img 
                src={mascot} 
                alt="EdGame Mascot" 
                className="w-64 h-64 mx-auto mb-6 object-contain"
              />
              <div className="space-y-4">
                <GameCard className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-6 w-6 text-warning" />
                    <span className="font-semibold">Recorde: 2.450 pts</span>
                  </div>
                </GameCard>
                <GameCard className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="h-6 w-6 text-success" />
                    <span className="font-semibold">Jogadores Online: 127</span>
                  </div>
                </GameCard>
              </div>
            </GameCard>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;