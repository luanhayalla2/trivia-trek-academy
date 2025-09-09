import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/ui/game-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Trophy, Pause, X, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Dados de exemplo das perguntas por disciplina
const questionsDB = {
  matematica: [
    {
      id: 1,
      question: "Qual é o resultado de 15 × 8?",
      options: ["120", "140", "110", "130"],
      correct: 0,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Se x + 5 = 12, qual é o valor de x?",
      options: ["7", "17", "8", "6"],
      correct: 0,
      difficulty: "easy"
    },
    {
      id: 3,
      question: "Qual é a área de um quadrado com lado de 6 cm?",
      options: ["24 cm²", "36 cm²", "30 cm²", "42 cm²"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "Qual é o valor de √144?",
      options: ["11", "12", "13", "14"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 5,
      question: "Em um triângulo retângulo, se os catetos medem 3 e 4, qual é a hipotenusa?",
      options: ["5", "6", "7", "8"],
      correct: 0,
      difficulty: "medium"
    }
  ],
  portugues: [
    {
      id: 1,
      question: "Qual é o plural de 'cidadão'?",
      options: ["cidadões", "cidadãos", "cidadans", "cidadãoes"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Que figura de linguagem está presente em 'Seus olhos são duas estrelas'?",
      options: ["Metáfora", "Metonímia", "Hipérbole", "Ironia"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "Qual é a função sintática de 'muito' em 'João estava muito cansado'?",
      options: ["Adjunto adnominal", "Advérbio de intensidade", "Predicativo", "Objeto direto"],
      correct: 1,
      difficulty: "medium"
    }
  ],
  ciencias: [
    {
      id: 1,
      question: "Qual é a fórmula química da água?",
      options: ["H2O", "CO2", "NaCl", "O2"],
      correct: 0,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Qual organela é responsável pela respiração celular?",
      options: ["Núcleo", "Mitocôndria", "Ribossomo", "Lisossomo"],
      correct: 1,
      difficulty: "medium"
    }
  ]
};

const subjectNames = {
  matematica: "Matemática",
  portugues: "Português",
  ciencias: "Ciências",
  historia: "História",
  geografia: "Geografia",
  artes: "Artes"
};

const Game = () => {
  const { subjectId } = useParams();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (subjectId && questionsDB[subjectId as keyof typeof questionsDB]) {
      setQuestions(questionsDB[subjectId as keyof typeof questionsDB]);
    }
  }, [subjectId]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !showResult && !gameOver && !isPaused) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleAnswer(-1); // Tempo esgotado
    }
  }, [timeLeft, showResult, gameOver, isPaused]);

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === questions[currentQuestion]?.correct;
    if (isCorrect) {
      const points = Math.max(100 + (timeLeft * 10), 100);
      setScore(score + points);
      toast({
        title: "Correto! 🎉",
        description: `+${points} pontos`,
      });
    } else if (answerIndex === -1) {
      toast({
        title: "Tempo esgotado! ⏰",
        description: "Tente ser mais rápido na próxima!",
      });
    } else {
      toast({
        title: "Incorreto 😔",
        description: "Continue tentando!",
        variant: "destructive",
      });
    }

    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(30);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameOver(true);
      }
    }, 2000);
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setIsPaused(false);
  };

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GameCard className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Disciplina não encontrada</h2>
          <Link to="/subjects">
            <Button variant="game">Voltar às Disciplinas</Button>
          </Link>
        </GameCard>
      </div>
    );
  }

  if (gameOver) {
    const percentage = Math.round((score / (questions.length * 400)) * 100);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GameCard variant="subject" className="p-8 text-center max-w-md">
          <Trophy className="h-16 w-16 mx-auto mb-6 text-warning" />
          <h2 className="text-3xl font-bold mb-4">Jogo Finalizado!</h2>
          <div className="space-y-4 mb-6">
            <div className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {score}
            </div>
            <p className="text-lg text-muted-foreground">pontos finais</p>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {percentage}% de aproveitamento
            </Badge>
          </div>
          <div className="flex gap-4">
            <Button variant="game" onClick={resetGame} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Jogar Novamente
            </Button>
            <Link to="/subjects" className="flex-1">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Disciplinas
              </Button>
            </Link>
          </div>
        </GameCard>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/subjects">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {subjectNames[subjectId as keyof typeof subjectNames]}
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setIsPaused(!isPaused)}
            >
              <Pause className="h-4 w-4" />
            </Button>
            <Link to="/subjects">
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Game Info */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">
              Pergunta {currentQuestion + 1} de {questions.length}
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Pontos:</span>
              <Badge variant="secondary" className="text-lg font-bold">
                {score}
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Timer */}
        <div className="max-w-2xl mx-auto mb-8">
          <GameCard 
            variant={timeLeft > 10 ? "default" : "warning"} 
            className="p-6 text-center"
          >
            <Clock className={`h-8 w-8 mx-auto mb-2 ${timeLeft <= 5 ? 'animate-pulse' : ''}`} />
            <div className="text-3xl font-bold">
              {timeLeft}
            </div>
            <div className="text-sm text-muted-foreground">segundos</div>
            {isPaused && (
              <Badge variant="secondary" className="mt-2">
                Jogo Pausado
              </Badge>
            )}
          </GameCard>
        </div>

        {/* Question */}
        <div className="max-w-2xl mx-auto">
          <GameCard variant="subject" className="p-8 mb-8">
            <h2 className="text-2xl font-bold text-center mb-8">
              {question.question}
            </h2>
            
            <div className="grid gap-4">
              {question.options.map((option: string, index: number) => {
                let variant: "default" | "success" | "destructive" = "default";
                
                if (showResult) {
                  if (index === question.correct) {
                    variant = "success";
                  } else if (index === selectedAnswer && selectedAnswer !== question.correct) {
                    variant = "destructive";
                  }
                }
                
                return (
                  <Button
                    key={index}
                    variant={variant === "default" ? "outline" : variant}
                    className="h-16 text-lg justify-start px-6"
                    onClick={() => !showResult && !isPaused && handleAnswer(index)}
                    disabled={showResult || isPaused}
                  >
                    <span className="font-bold mr-4">
                      {String.fromCharCode(65 + index)})
                    </span>
                    {option}
                  </Button>
                );
              })}
            </div>
          </GameCard>
        </div>
      </div>
    </div>
  );
};

export default Game;