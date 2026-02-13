import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useGameScore, GameDifficulty } from "@/hooks/useGameScore";
import { useAuth } from "@/contexts/AuthContext";
import { useGameAchievements } from "@/hooks/useGameAchievements";
import { Clock, Target, Trophy } from "lucide-react";

interface CardType {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const difficultyConfig: Record<GameDifficulty, { pairs: number; label: string; color: string }> = {
  facil: { pairs: 6, label: 'Fácil', color: 'bg-success' },
  medio: { pairs: 8, label: 'Médio', color: 'bg-warning text-warning-foreground' },
  dificil: { pairs: 12, label: 'Difícil', color: 'bg-destructive' }
};

const allEmojis = ["🎓", "📚", "✏️", "🧮", "🔬", "🌍", "🎨", "🎵", "⭐", "🚀", "💡", "🎯"];

const MemoryGame = () => {
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medio');
  const [gameStarted, setGameStarted] = useState(false);
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const { saveScore } = useGameScore();
  const { user } = useAuth();
  const { checkAndAwardAchievements } = useGameAchievements();

  const pairsCount = difficultyConfig[difficulty].pairs;
  const emojis = allEmojis.slice(0, pairsCount);

  useEffect(() => {
    if (gameStarted && !gameComplete) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, gameComplete, startTime]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      checkMatch();
    }
  }, [flippedCards]);

  const startGame = () => {
    const shuffledCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    setGameComplete(false);
    setGameStarted(true);
  };

  const handleCardClick = (id: number) => {
    const card = cards.find((c) => c.id === id);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length === 2) {
      return;
    }

    const newCards = cards.map((c) =>
      c.id === id ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);
    setFlippedCards([...flippedCards, id]);
  };

  const checkMatch = () => {
    setMoves(moves + 1);

    const [firstId, secondId] = flippedCards;
    const firstCard = cards.find((c) => c.id === firstId);
    const secondCard = cards.find((c) => c.id === secondId);

    if (firstCard?.value === secondCard?.value) {
      const newCards = cards.map((c) =>
        c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
      );
      setCards(newCards);
      const newMatches = matches + 1;
      setMatches(newMatches);
      toast.success("Par encontrado! 🎉");

      if (newMatches === emojis.length) {
        handleGameComplete();
      }

      setFlippedCards([]);
    } else {
      setTimeout(() => {
        const newCards = cards.map((c) =>
          c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
        );
        setCards(newCards);
        setFlippedCards([]);
      }, 1000);
    }
  };

  const handleGameComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameComplete(true);
    
    const finalTime = Math.floor((Date.now() - startTime) / 1000);
    const baseScore = pairsCount * 100;
    const timeBonus = Math.max(0, 300 - finalTime) * 2;
    const movesPenalty = Math.max(0, (moves + 1 - pairsCount) * 5);
    const score = Math.max(0, baseScore + timeBonus - movesPenalty);

    toast.success(`Parabéns! Pontuação: ${score} pontos!`);

    if (user) {
      saveScore.mutate({
        gameId: 'memory',
        score,
        timeTaken: finalTime,
        difficulty,
        mode: 'single',
        result: 'vitoria',
        movesCount: moves + 1
      }, {
        onSuccess: () => {
          // Check achievements after saving score
          checkAndAwardAchievements();
        }
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameStarted) {
    return (
      <Card className="p-6 max-w-md mx-auto bg-card/90 backdrop-blur-sm">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">🃏 Jogo da Memória</h2>
            <p className="text-muted-foreground">Encontre todos os pares de cartas</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Dificuldade</p>
            <div className="flex gap-2">
              {(Object.entries(difficultyConfig) as [GameDifficulty, typeof difficultyConfig.facil][]).map(
                ([key, config]) => (
                  <Button
                    key={key}
                    variant={difficulty === key ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setDifficulty(key)}
                  >
                    <span className={`w-2 h-2 rounded-full ${config.color} mr-2`} />
                    {config.label}
                  </Button>
                )
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">{pairsCount} pares de cartas</p>
          </div>

          <Button className="w-full" size="lg" onClick={startGame}>
            Iniciar Jogo
          </Button>
        </div>
      </Card>
    );
  }

  if (gameComplete) {
    const finalTime = elapsedTime;
    const baseScore = pairsCount * 100;
    const timeBonus = Math.max(0, 300 - finalTime) * 2;
    const movesPenalty = Math.max(0, (moves - pairsCount) * 5);
    const score = Math.max(0, baseScore + timeBonus - movesPenalty);

    return (
      <Card className="p-6 max-w-md mx-auto bg-card/90 backdrop-blur-sm">
        <div className="space-y-6 text-center">
          <Trophy className="w-16 h-16 mx-auto text-warning" />
          <h2 className="text-2xl font-bold">Parabéns!</h2>
          
          <div className="flex justify-center gap-4">
            <Badge variant="secondary" className="text-lg py-2 px-4">
              <Target className="w-4 h-4 mr-2" />
              {score} pts
            </Badge>
            <Badge variant="secondary" className="text-lg py-2 px-4">
              <Clock className="w-4 h-4 mr-2" />
              {formatTime(finalTime)}
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Jogadas: {moves}</p>
            <p>Dificuldade: {difficultyConfig[difficulty].label}</p>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={startGame}>
              Jogar Novamente
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setGameStarted(false)}>
              Configurações
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-3xl mx-auto bg-card/90 backdrop-blur-sm">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Badge className={difficultyConfig[difficulty].color}>
            {difficultyConfig[difficulty].label}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setGameStarted(false)}>
            Sair
          </Button>
        </div>

        <div className="flex justify-around text-center">
          <div>
            <p className="text-sm text-muted-foreground">Tempo</p>
            <p className="text-2xl font-bold text-primary">{formatTime(elapsedTime)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Jogadas</p>
            <p className="text-2xl font-bold text-primary">{moves}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pares</p>
            <p className="text-2xl font-bold text-success">{matches}/{pairsCount}</p>
          </div>
        </div>

        <div className={`grid gap-3 max-w-2xl mx-auto ${pairsCount <= 6 ? 'grid-cols-4' : pairsCount <= 8 ? 'grid-cols-4' : 'grid-cols-6'}`}>
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched || card.isFlipped}
              className={`aspect-square rounded-lg text-3xl font-bold transition-all duration-300 transform ${
                card.isFlipped || card.isMatched
                  ? "bg-primary text-primary-foreground scale-105"
                  : "bg-muted hover:bg-muted/80 hover:scale-105"
              } ${card.isMatched ? "opacity-50" : ""}`}
            >
              {card.isFlipped || card.isMatched ? card.value : "?"}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <Button onClick={startGame} variant="outline" className="gap-2">
            Reiniciar
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MemoryGame;
