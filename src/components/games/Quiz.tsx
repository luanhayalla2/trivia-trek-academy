import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

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

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    
    setTimeout(() => {
      if (index === questions[currentQuestion].correct) {
        setScore(score + 1);
      }

      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  if (showResult) {
    return (
      <Card className="p-8 text-center space-y-6 bg-card/80 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-foreground">Quiz Concluído! 🎉</h2>
        <p className="text-2xl text-muted-foreground">
          Você acertou <span className="text-primary font-bold">{score}</span> de {questions.length} perguntas
        </p>
        <div className="text-6xl">
          {score === questions.length ? "🏆" : score >= questions.length / 2 ? "👏" : "💪"}
        </div>
        <Button onClick={resetQuiz} size="lg" className="w-full">
          Jogar Novamente
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-8 space-y-6 bg-card/80 backdrop-blur-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">
          Pergunta {currentQuestion + 1} de {questions.length}
        </h2>
        <div className="text-lg font-semibold text-primary">
          Pontos: {score}
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
