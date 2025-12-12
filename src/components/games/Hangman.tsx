import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Trophy, RotateCcw } from "lucide-react";
import { useGameScore } from "@/hooks/useGameScore";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useGameAchievements } from "@/hooks/useGameAchievements";

type Difficulty = "facil" | "medio" | "dificil";

const difficultyConfig = {
  facil: { maxWrongGuesses: 8, timeLimit: 180, scoreMultiplier: 1, label: "Fácil" },
  medio: { maxWrongGuesses: 6, timeLimit: 120, scoreMultiplier: 1.5, label: "Médio" },
  dificil: { maxWrongGuesses: 4, timeLimit: 60, scoreMultiplier: 2, label: "Difícil" },
};

const Hangman = () => {
  const words = [
    { word: "COMPUTADOR", hint: "Aparelho eletrônico para processar dados" },
    { word: "EDUCACAO", hint: "Processo de ensino e aprendizagem" },
    { word: "MATEMATICA", hint: "Ciência dos números e operações" },
    { word: "GEOGRAFIA", hint: "Estudo da Terra e suas características" },
    { word: "HISTORIA", hint: "Estudo dos acontecimentos do passado" },
    { word: "BIOLOGIA", hint: "Estudo dos seres vivos" },
    { word: "QUIMICA", hint: "Estudo das substâncias e suas transformações" },
    { word: "LITERATURA", hint: "Arte da escrita e expressão verbal" },
  ];

  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);

  const { user } = useAuth();
  const { saveScore } = useGameScore();
  const { checkAndAwardAchievements } = useGameAchievements();

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    if (!gameStarted || gameStatus !== "playing") return;
    
    if (timeLeft <= 0) {
      setGameStatus("lost");
      endGame("lost");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameStarted, gameStatus]);

  useEffect(() => {
    if (!gameStarted || gameStatus !== "playing") return;
    
    const wordLetters = currentWord.word.split("");
    const allGuessed = wordLetters.every((letter) => guessedLetters.includes(letter));

    if (allGuessed) {
      const timeBonus = Math.floor(timeLeft * difficultyConfig[difficulty!].scoreMultiplier);
      const mistakeBonus = (difficultyConfig[difficulty!].maxWrongGuesses - wrongGuesses) * 50;
      const basePoints = 200 * difficultyConfig[difficulty!].scoreMultiplier;
      setScore(score + basePoints + timeBonus + mistakeBonus);
      setWordsCompleted(wordsCompleted + 1);
      setGameStatus("won");
    }
  }, [guessedLetters, currentWord, gameStatus, gameStarted]);

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setTimeLeft(difficultyConfig[selectedDifficulty].timeLimit);
    setGameStarted(true);
    setStartTime(Date.now());
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
  };

  const handleGuess = (letter: string) => {
    if (gameStatus !== "playing") return;
    if (guessedLetters.includes(letter)) return;

    setGuessedLetters([...guessedLetters, letter]);

    if (!currentWord.word.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);

      if (newWrongGuesses >= difficultyConfig[difficulty!].maxWrongGuesses) {
        setGameStatus("lost");
        endGame("lost");
      }
    }
  };

  const endGame = async (status: "won" | "lost") => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const accuracy = status === "won" ? 100 : Math.round(((currentWord.word.length - wrongGuesses) / currentWord.word.length) * 100);
    const finalScore = Math.round(score);
    
    if (user) {
      try {
        await saveScore.mutateAsync({
          gameId: "hangman",
          score: finalScore,
          difficulty: difficulty!,
          mode: "single",
          timeTaken,
          accuracy: Math.max(0, accuracy),
          movesCount: guessedLetters.length,
          result: status === "won" ? "vitoria" : "derrota",
        });
        await checkAndAwardAchievements();
        toast.success("Pontuação salva!");
      } catch (error) {
        console.error("Error saving score:", error);
      }
    }
  };

  const handleNextWord = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus("playing");
  };

  const resetGame = () => {
    setDifficulty(null);
    setGameStarted(false);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus("playing");
    setScore(0);
    setWordsCompleted(0);
  };

  const displayWord = currentWord.word
    .split("")
    .map((letter) => (guessedLetters.includes(letter) ? letter : "_"))
    .join(" ");

  const drawHangman = () => {
    const maxParts = difficultyConfig[difficulty!]?.maxWrongGuesses || 6;
    const parts = ["😟", "👕", "🦵", "🦵", "💪", "💪", "👟", "👟"];
    const visibleParts = parts.slice(0, Math.min(wrongGuesses, maxParts));
    return (
      <div className="text-4xl text-center py-4 min-h-[60px]">
        {visibleParts.join(" ")}
      </div>
    );
  };

  if (!difficulty) {
    return (
      <Card className="p-8 text-center space-y-6 bg-card/80 backdrop-blur-sm max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-foreground">Forca Educativa 🎯</h2>
        <p className="text-muted-foreground">Escolha a dificuldade:</p>
        <div className="flex flex-col gap-3">
          {(Object.keys(difficultyConfig) as Difficulty[]).map((diff) => (
            <Button
              key={diff}
              onClick={() => startGame(diff)}
              variant={diff === "facil" ? "default" : diff === "medio" ? "secondary" : "destructive"}
              size="lg"
              className="w-full"
            >
              {difficultyConfig[diff].label}
              <span className="ml-2 text-sm opacity-75">
                ({difficultyConfig[diff].maxWrongGuesses} erros, {difficultyConfig[diff].timeLimit}s)
              </span>
            </Button>
          ))}
        </div>
      </Card>
    );
  }

  if (gameStatus === "won") {
    return (
      <Card className="p-8 text-center space-y-6 bg-card/80 backdrop-blur-sm max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-success">Você Venceu! 🎉</h2>
        <div className="text-6xl">🏆</div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary/10 rounded-lg p-4">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-primary">{Math.round(score)}</p>
            <p className="text-sm text-muted-foreground">Pontos</p>
          </div>
          <div className="bg-success/10 rounded-lg p-4">
            <p className="text-2xl font-bold text-success">{wordsCompleted}</p>
            <p className="text-sm text-muted-foreground">Palavras</p>
          </div>
        </div>
        
        <p className="text-xl text-foreground">A palavra era: <strong>{currentWord.word}</strong></p>
        
        <div className="flex gap-3">
          <Button onClick={handleNextWord} size="lg" className="flex-1">
            Próxima Palavra
          </Button>
          <Button onClick={resetGame} variant="outline" size="lg" className="flex-1 gap-2">
            <RotateCcw className="h-4 w-4" />
            Reiniciar
          </Button>
        </div>
      </Card>
    );
  }

  if (gameStatus === "lost") {
    return (
      <Card className="p-8 text-center space-y-6 bg-card/80 backdrop-blur-sm max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-destructive">Game Over! 😢</h2>
        <div className="text-6xl">💀</div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary/10 rounded-lg p-4">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-primary">{Math.round(score)}</p>
            <p className="text-sm text-muted-foreground">Pontos</p>
          </div>
          <div className="bg-success/10 rounded-lg p-4">
            <p className="text-2xl font-bold text-success">{wordsCompleted}</p>
            <p className="text-sm text-muted-foreground">Palavras</p>
          </div>
        </div>
        
        <p className="text-xl text-foreground">A palavra era: <strong>{currentWord.word}</strong></p>
        
        <Button onClick={resetGame} size="lg" className="w-full gap-2">
          <RotateCcw className="h-4 w-4" />
          Tentar Novamente
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-8 space-y-6 bg-card/80 backdrop-blur-sm max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Forca Educativa 🎯</h2>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
            timeLeft <= 15 ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
          }`}>
            <Clock className="h-4 w-4" />
            <span className="font-bold">{timeLeft}s</span>
          </div>
          <div className="text-lg font-semibold text-primary">
            {Math.round(score)} pts
          </div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground italic text-center">"{currentWord.hint}"</p>

      {drawHangman()}

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Tentativas restantes: {difficultyConfig[difficulty!].maxWrongGuesses - wrongGuesses}
        </p>
        <p className="text-3xl font-mono font-bold text-foreground tracking-wider">
          {displayWord}
        </p>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {alphabet.map((letter) => {
          const isGuessed = guessedLetters.includes(letter);
          const isCorrect = currentWord.word.includes(letter);

          return (
            <Button
              key={letter}
              onClick={() => handleGuess(letter)}
              disabled={isGuessed}
              variant={isGuessed ? (isCorrect ? "success" : "destructive") : "outline"}
              className="aspect-square p-0"
            >
              {letter}
            </Button>
          );
        })}
      </div>

      <Button onClick={resetGame} variant="outline" className="w-full">
        Reiniciar Jogo
      </Button>
    </Card>
  );
};

export default Hangman;
