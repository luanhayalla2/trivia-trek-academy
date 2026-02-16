import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shuffle, Clock, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGameScore } from "@/hooks/useGameScore";
import { toast } from "sonner";
import { playClickSound, playWinSound } from "@/lib/sounds";

const Puzzle = () => {
  const { user } = useAuth();
  const { saveScore } = useGameScore();
  const [difficulty, setDifficulty] = useState<'facil' | 'medio' | 'dificil'>('medio');
  const [puzzleSize, setPuzzleSize] = useState(3);
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(0);

  const totalTiles = puzzleSize * puzzleSize;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !completed) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, completed]);

  useEffect(() => {
    if (tiles.length > 0) checkCompletion();
  }, [tiles]);

  const startGame = () => {
    const size = difficulty === 'facil' ? 3 : difficulty === 'medio' ? 4 : 5;
    setPuzzleSize(size);
    const total = size * size;
    const numbers = Array.from({ length: total - 1 }, (_, i) => i + 1);
    numbers.push(0);
    const shuffled = shuffleArray([...numbers], size);
    setTiles(shuffled);
    setMoves(0);
    setTimer(0);
    setCompleted(false);
    setGameStarted(true);
  };

  const shuffleArray = (array: number[], size: number): number[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return isSolvable(arr, size) ? arr : shuffleArray(array, size);
  };

  const isSolvable = (arr: number[], size: number) => {
    let inversions = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] && arr[j] && arr[i] > arr[j]) inversions++;
      }
    }
    if (size % 2 === 1) return inversions % 2 === 0;
    const emptyRow = Math.floor(arr.indexOf(0) / size);
    return (inversions + emptyRow) % 2 === 1;
  };

  const checkCompletion = async () => {
    if (tiles.length === 0) return;
    const isCorrect = tiles.every((tile, index) => {
      if (index === tiles.length - 1) return tile === 0;
      return tile === index + 1;
    });
    if (isCorrect && moves > 0) {
      setCompleted(true);
      const difficultyMultiplier = difficulty === 'facil' ? 1 : difficulty === 'medio' ? 1.5 : 2;
      const moveBonus = Math.max(0, 200 - moves * 2);
      const timeBonus = Math.max(0, 300 - timer);
      const score = Math.round((1000 * difficultyMultiplier) + moveBonus + timeBonus);

      if (user) {
        saveScore.mutateAsync({
          gameId: 'puzzle',
          score,
          timeTaken: timer,
          difficulty,
          mode: 'single',
          result: 'vitoria',
          movesCount: moves,
        });
      }
      playWinSound();
      toast.success(`Parabéns! Pontuação: ${score}`);
    }
  };

  const getEmptyIndex = () => tiles.indexOf(0);

  const canMove = (index: number) => {
    const emptyIndex = getEmptyIndex();
    const emptyRow = Math.floor(emptyIndex / puzzleSize);
    const emptyCol = emptyIndex % puzzleSize;
    const tileRow = Math.floor(index / puzzleSize);
    const tileCol = index % puzzleSize;
    return (emptyRow === tileRow && Math.abs(emptyCol - tileCol) === 1) ||
           (emptyCol === tileCol && Math.abs(emptyRow - tileRow) === 1);
  };

  const moveTile = (index: number) => {
    if (!canMove(index) || completed) return;
    const emptyIndex = getEmptyIndex();
    const newTiles = [...tiles];
    [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
    setTiles(newTiles);
    setMoves(moves + 1);
    playClickSound();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameStarted) {
    return (
      <Card className="p-8 max-w-md mx-auto text-center space-y-6">
        <h2 className="text-2xl font-bold">🧩 Quebra-Cabeças</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Dificuldade</label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="facil">Fácil (3x3)</SelectItem>
                <SelectItem value="medio">Médio (4x4)</SelectItem>
                <SelectItem value="dificil">Difícil (5x5)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={startGame} size="lg" className="w-full">Iniciar Jogo</Button>
        </div>
      </Card>
    );
  }

  if (completed) {
    const difficultyMultiplier = difficulty === 'facil' ? 1 : difficulty === 'medio' ? 1.5 : 2;
    const moveBonus = Math.max(0, 200 - moves * 2);
    const timeBonus = Math.max(0, 300 - timer);
    const score = Math.round((1000 * difficultyMultiplier) + moveBonus + timeBonus);

    return (
      <Card className="p-8 text-center space-y-6">
        <h2 className="text-3xl font-bold">Parabéns! 🎉</h2>
        <div className="text-6xl">🧩</div>
        <div className="space-y-2">
          <p className="text-xl">Movimentos: {moves}</p>
          <p className="text-xl">Tempo: {formatTime(timer)}</p>
          <p className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6" /> {score} pontos
          </p>
        </div>
        <Button onClick={startGame} size="lg" className="w-full gap-2">
          <Shuffle className="w-5 h-5" /> Novo Jogo
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">🧩 Quebra-Cabeças</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm bg-muted px-3 py-1 rounded-full">{puzzleSize}x{puzzleSize}</span>
          <span className="flex items-center gap-1 text-lg font-mono">
            <Clock className="w-4 h-4" /> {formatTime(timer)}
          </span>
        </div>
      </div>

      <p className="text-center text-lg font-semibold text-primary">Movimentos: {moves}</p>

      <div className="grid gap-2 mx-auto" style={{ gridTemplateColumns: `repeat(${puzzleSize}, minmax(0, 1fr))`, maxWidth: `${puzzleSize * 70}px` }}>
        {tiles.map((tile, index) => (
          <button
            key={index}
            onClick={() => moveTile(index)}
            disabled={tile === 0}
            className={`aspect-square rounded-lg text-xl font-bold transition-all duration-200
              ${tile === 0 ? "bg-muted/20 cursor-default" : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 cursor-pointer shadow-md"}
              ${canMove(index) && tile !== 0 ? "ring-2 ring-primary/50" : ""}`}
          >
            {tile !== 0 && tile}
          </button>
        ))}
      </div>

      <Button onClick={startGame} variant="outline" className="w-full gap-2">
        <Shuffle className="w-5 h-5" /> Reiniciar
      </Button>
    </Card>
  );
};

export default Puzzle;
