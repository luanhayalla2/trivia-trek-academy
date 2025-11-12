import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shuffle } from "lucide-react";

const Puzzle = () => {
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);

  const puzzleSize = 3; // 3x3 puzzle
  const totalTiles = puzzleSize * puzzleSize;

  useEffect(() => {
    initializePuzzle();
  }, []);

  useEffect(() => {
    checkCompletion();
  }, [tiles]);

  const initializePuzzle = () => {
    const numbers = Array.from({ length: totalTiles - 1 }, (_, i) => i + 1);
    numbers.push(0); // 0 representa o espaço vazio
    
    // Embaralhar
    const shuffled = shuffleArray([...numbers]);
    setTiles(shuffled);
    setMoves(0);
    setCompleted(false);
  };

  const shuffleArray = (array: number[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Garantir que o puzzle é solucionável
    return isSolvable(arr) ? arr : shuffleArray(array);
  };

  const isSolvable = (arr: number[]) => {
    let inversions = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] && arr[j] && arr[i] > arr[j]) {
          inversions++;
        }
      }
    }
    return inversions % 2 === 0;
  };

  const checkCompletion = () => {
    if (tiles.length === 0) return;
    
    const isCorrect = tiles.every((tile, index) => {
      if (index === tiles.length - 1) return tile === 0;
      return tile === index + 1;
    });
    
    if (isCorrect && moves > 0) {
      setCompleted(true);
    }
  };

  const getEmptyIndex = () => tiles.indexOf(0);

  const canMove = (index: number) => {
    const emptyIndex = getEmptyIndex();
    const emptyRow = Math.floor(emptyIndex / puzzleSize);
    const emptyCol = emptyIndex % puzzleSize;
    const tileRow = Math.floor(index / puzzleSize);
    const tileCol = index % puzzleSize;

    return (
      (emptyRow === tileRow && Math.abs(emptyCol - tileCol) === 1) ||
      (emptyCol === tileCol && Math.abs(emptyRow - tileRow) === 1)
    );
  };

  const moveTile = (index: number) => {
    if (!canMove(index) || completed) return;

    const emptyIndex = getEmptyIndex();
    const newTiles = [...tiles];
    [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
    
    setTiles(newTiles);
    setMoves(moves + 1);
  };

  if (completed) {
    return (
      <Card className="p-8 text-center space-y-6 bg-card/80 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-foreground">Parabéns! 🎉</h2>
        <div className="text-6xl">🧩</div>
        <p className="text-xl text-muted-foreground">
          Você completou o quebra-cabeça em <strong>{moves}</strong> movimentos!
        </p>
        <Button onClick={initializePuzzle} size="lg" className="w-full gap-2">
          <Shuffle className="w-5 h-5" />
          Novo Jogo
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-8 space-y-6 bg-card/80 backdrop-blur-sm">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Quebra-Cabeças 🧩</h2>
        <p className="text-muted-foreground">
          Organize os números em ordem crescente
        </p>
        <p className="text-lg font-semibold text-primary">
          Movimentos: {moves}
        </p>
      </div>

      <div
        className="grid gap-2 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${puzzleSize}, minmax(0, 1fr))`,
          maxWidth: "300px",
        }}
      >
        {tiles.map((tile, index) => (
          <button
            key={index}
            onClick={() => moveTile(index)}
            disabled={tile === 0}
            className={`
              aspect-square rounded-lg text-2xl font-bold transition-all duration-200
              ${tile === 0 
                ? "bg-muted/20 cursor-default" 
                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 cursor-pointer shadow-md"
              }
              ${canMove(index) && tile !== 0 ? "ring-2 ring-primary/50" : ""}
            `}
          >
            {tile !== 0 && tile}
          </button>
        ))}
      </div>

      <Button onClick={initializePuzzle} variant="outline" className="w-full gap-2">
        <Shuffle className="w-5 h-5" />
        Embaralhar
      </Button>
    </Card>
  );
};

export default Puzzle;
