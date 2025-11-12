import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface CardType {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryGame = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);

  const emojis = ["🎓", "📚", "✏️", "🧮", "🔬", "🌍", "🎨", "🎵"];

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (flippedCards.length === 2) {
      checkMatch();
    }
  }, [flippedCards]);

  const initializeGame = () => {
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
  };

  const handleCardClick = (id: number) => {
    const card = cards.find((c) => c.id === id);
    if (
      !card ||
      card.isFlipped ||
      card.isMatched ||
      flippedCards.length === 2
    ) {
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
      setMatches(matches + 1);
      toast.success("Par encontrado! 🎉");

      if (matches + 1 === emojis.length) {
        setTimeout(() => {
          toast.success(`Parabéns! Você completou em ${moves + 1} jogadas!`);
        }, 500);
      }

      setFlippedCards([]);
    } else {
      setTimeout(() => {
        const newCards = cards.map((c) =>
          c.id === firstId || c.id === secondId
            ? { ...c, isFlipped: false }
            : c
        );
        setCards(newCards);
        setFlippedCards([]);
      }, 1000);
    }
  };

  return (
    <Card className="p-6 max-w-3xl mx-auto bg-card/90 backdrop-blur-sm">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            🃏 Jogo da Memória
          </h2>
          <p className="text-muted-foreground">
            Encontre todos os pares de cartas
          </p>
        </div>

        <div className="flex justify-around text-center">
          <div>
            <p className="text-sm text-muted-foreground">Jogadas</p>
            <p className="text-3xl font-bold text-primary">{moves}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pares</p>
            <p className="text-3xl font-bold text-success">
              {matches}/{emojis.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched || card.isFlipped}
              className={`aspect-square rounded-lg text-4xl font-bold transition-all duration-300 transform ${
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
          <Button onClick={initializeGame} variant="outline" className="gap-2">
            Novo Jogo
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MemoryGame;
