import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Trophy, Zap } from "lucide-react";

const GamePreview = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Como{" "}
            <span className="bg-gradient-success bg-clip-text text-transparent">
              Funciona
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Uma experiência de aprendizado completa com pontuação, 
            tempo limite e feedback instantâneo!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Tempo Desafiador</h3>
                <p className="text-muted-foreground">
                  Cada pergunta tem um tempo limite que testa sua agilidade mental 
                  e conhecimento instantâneo.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-success rounded-full flex items-center justify-center flex-shrink-0">
                <Trophy className="h-6 w-6 text-success-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Sistema de Pontuação</h3>
                <p className="text-muted-foreground">
                  Ganhe pontos por respostas corretas e rápidas. Bata seus recordes 
                  e compare com outros jogadores!
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-warning rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-warning-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Feedback Instantâneo</h3>
                <p className="text-muted-foreground">
                  Receba feedback visual e sonoro imediato para cada resposta, 
                  aprendendo com seus erros e acertos.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <GameCard variant="subject" className="p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Pergunta 3 de 10</span>
                  <span className="text-sm text-muted-foreground">Pontos: 1.250</span>
                </div>
                <Progress value={30} className="h-2" />
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-warning rounded-full mx-auto mb-4">
                  <Clock className="h-6 w-6 text-warning-foreground animate-pulse" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">15</div>
                  <div className="text-sm text-muted-foreground">segundos</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">
                  Qual é o resultado de 15 × 8?
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-12">A) 120</Button>
                  <Button variant="outline" className="h-12">B) 140</Button>
                  <Button variant="outline" className="h-12">C) 110</Button>
                  <Button variant="outline" className="h-12">D) 130</Button>
                </div>
              </div>
            </GameCard>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GamePreview;