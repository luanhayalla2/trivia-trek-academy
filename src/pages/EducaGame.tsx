import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gamepad2, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import WordSearch from "@/components/games/WordSearch";
import Crossword from "@/components/games/Crossword";
import Anagram from "@/components/games/Anagram";
import MemoryGame from "@/components/games/MemoryGame";
import Quiz from "@/components/games/Quiz";
import MatchColumns from "@/components/games/MatchColumns";
import Hangman from "@/components/games/Hangman";
import Puzzle from "@/components/games/Puzzle";

const EducaGame = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const navigate = useNavigate();

  const games = [
    {
      id: "word-search",
      title: "Caça-Palavras",
      icon: "🧩",
      description: "Encontre palavras escondidas na grade",
      component: WordSearch,
    },
    {
      id: "crossword",
      title: "Palavras Cruzadas",
      icon: "🧠",
      description: "Preencha as palavras de acordo com as dicas",
      component: Crossword,
    },
    {
      id: "anagram",
      title: "Anagramas",
      icon: "💬",
      description: "Descubra a palavra embaralhada",
      component: Anagram,
    },
    {
      id: "memory",
      title: "Jogo da Memória",
      icon: "🃏",
      description: "Combine os pares corretos",
      component: MemoryGame,
    },
    {
      id: "quiz",
      title: "Quiz",
      icon: "❓",
      description: "Teste seus conhecimentos",
      component: Quiz,
    },
    {
      id: "match-columns",
      title: "Ligar Colunas",
      icon: "🔗",
      description: "Conecte os itens corretamente",
      component: MatchColumns,
    },
    {
      id: "hangman",
      title: "Forca Educativa",
      icon: "🎯",
      description: "Descubra a palavra antes que acabe",
      component: Hangman,
    },
    {
      id: "puzzle",
      title: "Quebra-Cabeças",
      icon: "🧩",
      description: "Organize os números em ordem",
      component: Puzzle,
    },
  ];

  const ActiveGameComponent = games.find((g) => g.id === activeGame)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-wisdom via-background to-growth">
      {/* Header */}
      <header className="bg-primary/90 backdrop-blur-sm text-primary-foreground shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gamepad2 className="w-8 h-8 animate-pulse" />
              <h1 className="text-3xl font-bold">Educa-Game</h1>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Início
            </Button>
          </div>
          <p className="text-primary-foreground/80 mt-2 text-sm">
            Jogos Educativos — Aprenda brincando!
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!activeGame ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Escolha seu Jogo
              </h2>
              <p className="text-muted-foreground">
                Selecione um dos jogos educativos abaixo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {games.map((game) => (
                <Card
                  key={game.id}
                  className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-primary bg-card/80 backdrop-blur-sm"
                  onClick={() => setActiveGame(game.id)}
                >
                  <div className="text-center space-y-3">
                    <div className="text-6xl mb-4 animate-bounce">
                      {game.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {game.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {game.description}
                    </p>
                    <Button className="w-full mt-4" variant="default">
                      Jogar Agora
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setActiveGame(null)}
              className="gap-2"
            >
              ← Voltar aos Jogos
            </Button>
            {ActiveGameComponent && <ActiveGameComponent />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-primary/90 backdrop-blur-sm text-primary-foreground py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            Educa-Game © 2025 — Aprender brincando é o melhor jeito de evoluir.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default EducaGame;
