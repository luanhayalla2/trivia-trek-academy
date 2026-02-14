import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useGameScore, GameDifficulty } from "@/hooks/useGameScore";
import { useAuth } from "@/contexts/AuthContext";
import { useGameAchievements } from "@/hooks/useGameAchievements";
import { playScoreSound } from "@/lib/sounds";
import { Clock, Target, Trophy } from "lucide-react";

const difficultyConfig: Record<GameDifficulty, { gridSize: number; words: string[]; label: string; color: string }> = {
  facil: { 
    gridSize: 8, 
    words: ["CODE", "GAME", "PLAY"],
    label: 'Fácil', 
    color: 'bg-green-500' 
  },
  medio: { 
    gridSize: 10, 
    words: ["REACT", "CODE", "GAME", "LEARN", "STUDY"],
    label: 'Médio', 
    color: 'bg-yellow-500' 
  },
  dificil: { 
    gridSize: 12, 
    words: ["REACT", "CODE", "GAME", "LEARN", "STUDY", "PROGRAM", "LOGIC"],
    label: 'Difícil', 
    color: 'bg-red-500' 
  }
};

const WordSearch = () => {
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medio');
  const [gameStarted, setGameStarted] = useState(false);
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const { saveScore } = useGameScore();
  const { user } = useAuth();
  const { checkAndAwardAchievements } = useGameAchievements();

  const config = difficultyConfig[difficulty];
  const words = config.words;
  const gridSize = config.gridSize;

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

  const generateGrid = () => {
    const newGrid: string[][] = Array(gridSize)
      .fill(null)
      .map(() =>
        Array(gridSize)
          .fill(null)
          .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
      );

    words.forEach((word) => {
      const direction = Math.random() > 0.5 ? "horizontal" : "vertical";
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);

        if (direction === "horizontal" && col + word.length <= gridSize) {
          for (let i = 0; i < word.length; i++) {
            newGrid[row][col + i] = word[i];
          }
          placed = true;
        } else if (direction === "vertical" && row + word.length <= gridSize) {
          for (let i = 0; i < word.length; i++) {
            newGrid[row + i][col] = word[i];
          }
          placed = true;
        }
        attempts++;
      }
    });

    return newGrid;
  };

  const startGame = () => {
    setGrid(generateGrid());
    setFoundWords(new Set());
    setSelectedCells(new Set());
    setStartTime(Date.now());
    setElapsedTime(0);
    setGameComplete(false);
    setGameStarted(true);
  };

  const handleCellClick = (row: number, col: number) => {
    const cellId = `${row}-${col}`;
    const newSelected = new Set(selectedCells);

    if (newSelected.has(cellId)) {
      newSelected.delete(cellId);
    } else {
      newSelected.add(cellId);
    }

    setSelectedCells(newSelected);
    checkForWord(newSelected);
  };

  const checkForWord = (selected: Set<string>) => {
    const selectedArray = Array.from(selected).map((id) => {
      const [row, col] = id.split("-").map(Number);
      return { row, col, letter: grid[row][col] };
    });

    selectedArray.sort((a, b) => {
      if (a.row === b.row) return a.col - b.col;
      return a.row - b.row;
    });

    const word = selectedArray.map((cell) => cell.letter).join("");
    const reversedWord = word.split("").reverse().join("");

    const foundWord = words.find(w => (w === word || w === reversedWord) && !foundWords.has(w));

    if (foundWord) {
      const newFoundWords = new Set([...foundWords, foundWord]);
      setFoundWords(newFoundWords);
      setSelectedCells(new Set());
      playScoreSound();
      toast.success(`Palavra encontrada: ${foundWord}!`);

      if (newFoundWords.size === words.length) {
        handleGameComplete();
      }
    }
  };

  const handleGameComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameComplete(true);

    const finalTime = Math.floor((Date.now() - startTime) / 1000);
    const baseScore = words.length * 150;
    const timeBonus = Math.max(0, 300 - finalTime) * 3;
    const difficultyMultiplier = difficulty === 'facil' ? 1 : difficulty === 'medio' ? 1.5 : 2;
    const score = Math.floor((baseScore + timeBonus) * difficultyMultiplier);

    toast.success(`Parabéns! Pontuação: ${score} pontos!`);

    if (user) {
      saveScore.mutate({
        gameId: 'wordsearch',
        score,
        timeTaken: finalTime,
        difficulty,
        mode: 'single',
        result: 'vitoria'
      }, {
        onSuccess: () => {
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
            <h2 className="text-2xl font-bold text-foreground mb-2">🧩 Caça-Palavras</h2>
            <p className="text-muted-foreground">Encontre as palavras escondidas na grade</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Dificuldade</p>
            <div className="flex gap-2">
              {(Object.entries(difficultyConfig) as [GameDifficulty, typeof difficultyConfig.facil][]).map(
                ([key, cfg]) => (
                  <Button
                    key={key}
                    variant={difficulty === key ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setDifficulty(key)}
                  >
                    <span className={`w-2 h-2 rounded-full ${cfg.color} mr-2`} />
                    {cfg.label}
                  </Button>
                )
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {config.words.length} palavras • Grade {config.gridSize}x{config.gridSize}
            </p>
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
    const baseScore = words.length * 150;
    const timeBonus = Math.max(0, 300 - finalTime) * 3;
    const difficultyMultiplier = difficulty === 'facil' ? 1 : difficulty === 'medio' ? 1.5 : 2;
    const score = Math.floor((baseScore + timeBonus) * difficultyMultiplier);

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
            <p>Palavras encontradas: {foundWords.size}/{words.length}</p>
            <p>Dificuldade: {config.label}</p>
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
          <Badge className={config.color}>
            {config.label}
          </Badge>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              {formatTime(elapsedTime)}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => setGameStarted(false)}>
              Sair
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {words.map((word) => (
            <span
              key={word}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                foundWords.has(word)
                  ? "bg-success text-success-foreground line-through"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {word}
            </span>
          ))}
        </div>

        <div className="grid gap-1 justify-center">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1">
              {row.map((letter, colIndex) => {
                const cellId = `${rowIndex}-${colIndex}`;
                const isSelected = selectedCells.has(cellId);

                return (
                  <button
                    key={cellId}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`w-8 h-8 md:w-10 md:h-10 font-bold text-sm rounded transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground scale-110"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={startGame} variant="outline">
            Reiniciar
          </Button>
          <Button onClick={() => setSelectedCells(new Set())} variant="secondary">
            Limpar Seleção
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {foundWords.size} de {words.length} palavras encontradas
        </div>
      </div>
    </Card>
  );
};

export default WordSearch;
