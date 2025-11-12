import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const MatchColumns = () => {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState(false);

  const pairs = [
    { left: "Brasil", right: "Brasília" },
    { left: "França", right: "Paris" },
    { left: "Japão", right: "Tóquio" },
    { left: "Itália", right: "Roma" },
    { left: "Canadá", right: "Ottawa" },
  ];

  const leftItems = pairs.map((p, i) => ({ id: i, text: p.left }));
  const rightItems = pairs
    .map((p, i) => ({ id: i, text: p.right }))
    .sort(() => Math.random() - 0.5);

  const handleLeftClick = (id: number) => {
    if (matches[id] !== undefined) return;
    setSelectedLeft(id);
  };

  const handleRightClick = (id: number) => {
    if (selectedLeft === null) return;
    if (Object.values(matches).includes(id)) return;

    const newMatches = { ...matches, [selectedLeft]: id };
    setMatches(newMatches);
    setSelectedLeft(null);

    if (Object.keys(newMatches).length === pairs.length) {
      const allCorrect = Object.entries(newMatches).every(
        ([left, right]) => parseInt(left) === right
      );
      if (allCorrect) {
        setCompleted(true);
      }
    }
  };

  const resetGame = () => {
    setMatches({});
    setSelectedLeft(null);
    setCompleted(false);
  };

  if (completed) {
    return (
      <Card className="p-8 text-center space-y-6 bg-card/80 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-foreground">Parabéns! 🎉</h2>
        <div className="text-6xl">🏆</div>
        <p className="text-xl text-muted-foreground">
          Você conectou todas as colunas corretamente!
        </p>
        <Button onClick={resetGame} size="lg" className="w-full">
          Jogar Novamente
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-8 space-y-6 bg-card/80 backdrop-blur-sm">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Ligar as Colunas 🔗
        </h2>
        <p className="text-muted-foreground">
          Conecte cada país com sua capital
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Coluna Esquerda */}
        <div className="space-y-3">
          <h3 className="font-semibold text-center text-foreground">Países</h3>
          {leftItems.map((item) => {
            const isMatched = matches[item.id] !== undefined;
            const isSelected = selectedLeft === item.id;

            return (
              <Button
                key={item.id}
                onClick={() => handleLeftClick(item.id)}
                variant={isSelected ? "default" : "outline"}
                className="w-full justify-start gap-2"
                disabled={isMatched}
              >
                {isMatched && <CheckCircle className="w-4 h-4 text-success" />}
                {item.text}
              </Button>
            );
          })}
        </div>

        {/* Coluna Direita */}
        <div className="space-y-3">
          <h3 className="font-semibold text-center text-foreground">Capitais</h3>
          {rightItems.map((item) => {
            const isMatched = Object.values(matches).includes(item.id);
            const isCorrectMatch = matches[item.id] === item.id;

            return (
              <Button
                key={item.id}
                onClick={() => handleRightClick(item.id)}
                variant={isMatched && isCorrectMatch ? "success" : "outline"}
                className="w-full justify-start gap-2"
                disabled={isMatched}
              >
                {isMatched && <CheckCircle className="w-4 h-4" />}
                {item.text}
              </Button>
            );
          })}
        </div>
      </div>

      <Button onClick={resetGame} variant="outline" className="w-full">
        Reiniciar
      </Button>
    </Card>
  );
};

export default MatchColumns;
