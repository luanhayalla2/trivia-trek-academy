import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Clock, Trophy, RotateCcw, Lightbulb, SkipForward } from "lucide-react";
import { useGameScore } from "@/hooks/useGameScore";
import { useAuth } from "@/contexts/AuthContext";
import { useGameAchievements } from "@/hooks/useGameAchievements";

type Difficulty = "facil" | "medio" | "dificil";

const difficultyConfig = {
  facil: { timeLimit: 120, wordsToSolve: 5, scoreMultiplier: 1, label: "Fácil" },
  medio: { timeLimit: 90, wordsToSolve: 7, scoreMultiplier: 1.5, label: "Médio" },
  dificil: { timeLimit: 60, wordsToSolve: 10, scoreMultiplier: 2, label: "Difícil" },
};

const Anagram = () => {
  const allWords = [
    "EDUCAÇÃO", "APRENDER", "CONHECIMENTO", "ESTUDO", "SABEDORIA",
    "INTELIGÊNCIA", "MATEMÁTICA", "CIÊNCIA", "HISTÓRIA", "PORTUGUÊS",
    "GEOGRAFIA", "BIOLOGIA", "FÍSICA", "QUÍMICA", "LITERATURA",
  ];

  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentWord, setCurrentWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [usedWords, setUsedWords] = useState<string[]>([]);

  const { user } = useAuth();
  const { saveScore } = useGameScore();
  const { checkAndAwardAchievements } = useGameAchievements();

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    if (timeLeft <= 0) {
      endGame();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameStarted, gameOver]);

  const scrambleWord = (word: string) => {
    const array = word.split("");
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    const scrambled = array.join("");
    return scrambled === word ? scrambleWord(word) : scrambled;
  };

  const generateNewWord = () => {
    const availableWords = allWords.filter(w => !usedWords.includes(w));
    if (availableWords.length === 0) {
      endGame();
      return;
    }
    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    setCurrentWord(randomWord);
    setScrambledWord(scrambleWord(randomWord));
    setUserAnswer("");
  };

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setTimeLeft(difficultyConfig[selectedDifficulty].timeLimit);
    setGameStarted(true);
    setStartTime(Date.now());
    setUsedWords([]);
    generateNewWord();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userAnswer.toUpperCase() === currentWord) {
      const timeBonus = Math.floor(timeLeft * 0.5);
      const basePoints = 100 * difficultyConfig[difficulty!].scoreMultiplier;
      setScore(score + basePoints + timeBonus);
      setWordsCompleted(wordsCompleted + 1);
      setUsedWords([...usedWords, currentWord]);
      
      toast.success("Parabéns! Você acertou! 🎉");
      
      if (wordsCompleted + 1 >= difficultyConfig[difficulty!].wordsToSolve) {
        endGame();
      } else {
        generateNewWord();
      }
    } else {
      toast.error("Ops! Tente novamente!");
      setUserAnswer("");
    }
  };

  const handleHint = () => {
    const penalty = 20 * difficultyConfig[difficulty!].scoreMultiplier;
    setScore(Math.max(0, score - penalty));
    toast.info(`Dica: A palavra começa com "${currentWord[0]}" e termina com "${currentWord[currentWord.length - 1]}"`);
  };

  const handleSkip = () => {
    setUsedWords([...usedWords, currentWord]);
    generateNewWord();
    toast.info("Palavra pulada!");
  };

  const endGame = async () => {
    setGameOver(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const targetWords = difficultyConfig[difficulty!].wordsToSolve;
    const accuracy = Math.round((wordsCompleted / targetWords) * 100);
    const finalScore = Math.round(score);
    
    if (user) {
      try {
        await saveScore.mutateAsync({
          gameId: "anagram",
          score: finalScore,
          difficulty: difficulty!,
          mode: "single",
          timeTaken,
          accuracy,
          movesCount: wordsCompleted,
          result: wordsCompleted >= targetWords ? "vitoria" : "derrota",
        });
        await checkAndAwardAchievements();
        toast.success("Pontuação salva!");
      } catch (error) {
        console.error("Error saving score:", error);
      }
    }
  };

  const resetGame = () => {
    setDifficulty(null);
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setWordsCompleted(0);
    setUsedWords([]);
    setUserAnswer("");
  };

  if (!difficulty) {
    return (
      <Card className="p-8 text-center space-y-6 bg-card/80 backdrop-blur-sm max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-foreground">💬 Jogo de Anagramas</h2>
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
                ({difficultyConfig[diff].wordsToSolve} palavras, {difficultyConfig[diff].timeLimit}s)
              </span>
            </Button>
          ))}
        </div>
      </Card>
    );
  }

  if (gameOver) {
    const targetWords = difficultyConfig[difficulty!].wordsToSolve;
    const accuracy = Math.round((wordsCompleted / targetWords) * 100);
    const won = wordsCompleted >= targetWords;
    
    return (
      <Card className="p-8 text-center space-y-6 bg-card/80 backdrop-blur-sm max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-foreground">
          {won ? "Parabéns! 🎉" : "Fim de Jogo!"}
        </h2>
        
        <div className="text-6xl">{won ? "🏆" : accuracy >= 50 ? "👏" : "💪"}</div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary/10 rounded-lg p-4">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-primary">{Math.round(score)}</p>
            <p className="text-sm text-muted-foreground">Pontos</p>
          </div>
          <div className="bg-success/10 rounded-lg p-4">
            <p className="text-2xl font-bold text-success">{wordsCompleted}/{targetWords}</p>
            <p className="text-sm text-muted-foreground">Palavras</p>
          </div>
        </div>
        
        <Button onClick={resetGame} size="lg" className="w-full gap-2">
          <RotateCcw className="h-4 w-4" />
          Jogar Novamente
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto bg-card/90 backdrop-blur-sm">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">💬 Anagramas</h2>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              timeLeft <= 10 ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
            }`}>
              <Clock className="h-4 w-4" />
              <span className="font-bold">{timeLeft}s</span>
            </div>
            <div className="text-lg font-semibold text-primary">
              {Math.round(score)} pts
            </div>
          </div>
        </div>

        <div className="flex justify-around text-center">
          <div>
            <p className="text-sm text-muted-foreground">Palavras</p>
            <p className="text-2xl font-bold text-primary">
              {wordsCompleted}/{difficultyConfig[difficulty!].wordsToSolve}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-8 rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-4">Letras embaralhadas:</p>
          <div className="text-4xl font-bold tracking-widest text-foreground mb-2">
            {scrambledWord.split("").map((letter, index) => (
              <span
                key={index}
                className="inline-block animate-bounce mx-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Digite a palavra correta..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="text-center text-xl font-semibold uppercase"
            autoFocus
          />

          <div className="flex gap-3 justify-center">
            <Button type="submit" className="gap-2" disabled={!userAnswer}>
              Verificar
            </Button>
            <Button type="button" variant="outline" onClick={handleHint} className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Dica (-20pts)
            </Button>
            <Button type="button" variant="secondary" onClick={handleSkip} className="gap-2">
              <SkipForward className="h-4 w-4" />
              Pular
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default Anagram;
