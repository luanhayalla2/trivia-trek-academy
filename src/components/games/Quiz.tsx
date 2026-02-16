import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, Trophy, RotateCcw } from "lucide-react";
import { useGameScore } from "@/hooks/useGameScore";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useGameAchievements } from "@/hooks/useGameAchievements";
import { playScoreSound, playErrorSound } from "@/lib/sounds";

type Difficulty = "facil" | "medio" | "dificil";

const difficultyConfig = {
  facil: { timePerQuestion: 30, scoreMultiplier: 1, label: "Fácil" },
  medio: { timePerQuestion: 20, scoreMultiplier: 1.5, label: "Médio" },
  dificil: { timePerQuestion: 15, scoreMultiplier: 2, label: "Difícil" },
};

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const { user } = useAuth();
  const { saveScore } = useGameScore();
  const { checkAndAwardAchievements } = useGameAchievements();

  const questions = [
    {
      question: "Qual é a capital do Brasil?",
      options: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"],
      correct: 2,
    },
    {
      question: "Quantos continentes existem no mundo?",
      options: ["5", "6", "7", "8"],
      correct: 2,
    },
    {
      question: "Qual é o maior planeta do sistema solar?",
      options: ["Terra", "Marte", "Júpiter", "Saturno"],
      correct: 2,
    },
    {
      question: "Quem descobriu o Brasil?",
      options: ["Cristóvão Colombo", "Pedro Álvares Cabral", "Vasco da Gama", "Américo Vespúcio"],
      correct: 1,
    },
    {
      question: "Qual é o resultado de 7 x 8?",
      options: ["54", "56", "58", "60"],
      correct: 1,
    },
  ];

  useEffect(() => {
    if (!gameStarted || showResult || selectedAnswer !== null) return;
    
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameStarted, showResult, selectedAnswer]);

  const handleTimeout = () => {
    setSelectedAnswer(-1);
    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setTimeLeft(difficultyConfig[difficulty!].timePerQuestion);
      } else {
        endGame();
      }
    }, 1000);
  };

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setTimeLeft(difficultyConfig[selectedDifficulty].timePerQuestion);
    setGameStarted(true);
    setStartTime(Date.now());
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    const isCorrect = index === questions[currentQuestion].correct;
    
    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft * difficultyConfig[difficulty!].scoreMultiplier);
      const basePoints = 100 * difficultyConfig[difficulty!].scoreMultiplier;
      setScore(score + basePoints + timeBonus);
      setCorrectAnswers(correctAnswers + 1);
      playScoreSound();
    } else {
      playErrorSound();
    }

    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setTimeLeft(difficultyConfig[difficulty!].timePerQuestion);
      } else {
        endGame();
      }
    }, 1000);
  };

  const endGame = async () => {
    setShowResult(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const accuracy = Math.round((correctAnswers / questions.length) * 100);
    const finalScore = Math.round(score);
    
    if (user) {
      try {
        await saveScore.mutateAsync({
          gameId: "quiz",
          score: finalScore,
          difficulty: difficulty!,
          mode: "single",
          timeTaken,
          accuracy,
          movesCount: questions.length,
          result: correctAnswers === questions.length ? "vitoria" : correctAnswers > questions.length / 2 ? "vitoria" : "derrota",
        });
        await checkAndAwardAchievements();
        toast.success("Pontuação salva!");
      } catch (error) {
        console.error("Error saving score:", error);
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setDifficulty(null);
    setGameStarted(false);
    setCorrectAnswers(0);
  };

  if (!difficulty) {
    return (
      <Card className="p-8 text-center space-y-6 bg-card/80 backdrop-blur-sm max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-foreground">Quiz de Conhecimentos 🎯</h2>
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
                ({difficultyConfig[diff].timePerQuestion}s por pergunta)
              </span>
            </Button>
          ))}
        </div>
      </Card>
    );
  }

  if (showResult) {
    const accuracy = Math.round((correctAnswers / questions.length) * 100);
    
    return (
      <Card className="p-8 text-center space-y-6 bg-card/80 backdrop-blur-sm max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-foreground">Quiz Concluído! 🎉</h2>
        
        <div className="space-y-4">
          <div className="text-6xl">
            {accuracy === 100 ? "🏆" : accuracy >= 70 ? "🎖️" : accuracy >= 50 ? "👏" : "💪"}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-primary/10 rounded-lg p-4">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-primary">{Math.round(score)}</p>
              <p className="text-sm text-muted-foreground">Pontos</p>
            </div>
            <div className="bg-success/10 rounded-lg p-4">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold text-success">{accuracy}%</p>
              <p className="text-sm text-muted-foreground">Precisão</p>
            </div>
          </div>
          
          <p className="text-lg text-muted-foreground">
            Você acertou <span className="text-primary font-bold">{correctAnswers}</span> de {questions.length} perguntas
          </p>
        </div>
        
        <Button onClick={resetQuiz} size="lg" className="w-full gap-2">
          <RotateCcw className="h-4 w-4" />
          Jogar Novamente
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-8 space-y-6 bg-card/80 backdrop-blur-sm max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">
          Pergunta {currentQuestion + 1} de {questions.length}
        </h2>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
            timeLeft <= 5 ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
          }`}>
            <Clock className="h-4 w-4" />
            <span className="font-bold">{timeLeft}s</span>
          </div>
          <div className="text-lg font-semibold text-primary">
            {Math.round(score)} pts
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <p className="text-xl font-semibold text-foreground text-center py-4">
          {questions[currentQuestion].question}
        </p>

        <div className="grid gap-3">
          {questions[currentQuestion].options.map((option, index) => {
            const isCorrect = index === questions[currentQuestion].correct;
            const isSelected = selectedAnswer === index;
            const showFeedback = selectedAnswer !== null;

            return (
              <Button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                variant={
                  showFeedback && isSelected
                    ? isCorrect
                      ? "success"
                      : "destructive"
                    : showFeedback && isCorrect
                    ? "success"
                    : "outline"
                }
                className="w-full text-lg py-6 justify-start gap-3"
              >
                {showFeedback && isSelected && (
                  isCorrect ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )
                )}
                {option}
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default Quiz;
