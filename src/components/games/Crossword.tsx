import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Clue {
  number: number;
  question: string;
  answer: string;
  row: number;
  col: number;
  direction: "across" | "down";
}

const Crossword = () => {
  const clues: Clue[] = [
    {
      number: 1,
      question: "Matéria que estuda números e cálculos",
      answer: "MATEMATICA",
      row: 0,
      col: 0,
      direction: "across",
    },
    {
      number: 2,
      question: "Processo de adquirir conhecimento",
      answer: "APRENDER",
      row: 2,
      col: 2,
      direction: "across",
    },
    {
      number: 3,
      question: "Idioma que estudamos na escola",
      answer: "PORTUGUES",
      row: 4,
      col: 0,
      direction: "across",
    },
    {
      number: 4,
      question: "Estudo dos seres vivos",
      answer: "BIOLOGIA",
      row: 0,
      col: 0,
      direction: "down",
    },
  ];

  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [correctAnswers, setCorrectAnswers] = useState<Set<number>>(new Set());

  const handleInputChange = (clueNumber: number, value: string) => {
    setAnswers({ ...answers, [clueNumber]: value.toUpperCase() });
  };

  const checkAnswer = (clue: Clue) => {
    const userAnswer = answers[clue.number]?.trim();
    if (userAnswer === clue.answer) {
      setCorrectAnswers(new Set([...correctAnswers, clue.number]));
      toast.success(`Resposta ${clue.number} correta! 🎉`);

      if (correctAnswers.size + 1 === clues.length) {
        toast.success("Parabéns! Você completou todas as palavras!");
      }
    } else {
      toast.error("Resposta incorreta. Tente novamente!");
    }
  };

  const resetGame = () => {
    setAnswers({});
    setCorrectAnswers(new Set());
    toast.info("Jogo reiniciado!");
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto bg-card/90 backdrop-blur-sm">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            🧠 Palavras Cruzadas
          </h2>
          <p className="text-muted-foreground">
            Preencha as palavras de acordo com as dicas
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Clues Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Dicas</h3>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                  Horizontal →
                </h4>
                {clues
                  .filter((c) => c.direction === "across")
                  .map((clue) => (
                    <div
                      key={clue.number}
                      className={`p-3 rounded-lg mb-2 ${
                        correctAnswers.has(clue.number)
                          ? "bg-success/20 border-success"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {clue.number}. {clue.question}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ({clue.answer.length} letras)
                      </p>
                    </div>
                  ))}
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                  Vertical ↓
                </h4>
                {clues
                  .filter((c) => c.direction === "down")
                  .map((clue) => (
                    <div
                      key={clue.number}
                      className={`p-3 rounded-lg mb-2 ${
                        correctAnswers.has(clue.number)
                          ? "bg-success/20 border-success"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {clue.number}. {clue.question}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ({clue.answer.length} letras)
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Answers Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground">Respostas</h3>
            <div className="space-y-3">
              {clues.map((clue) => (
                <div key={clue.number} className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {clue.number}. ({clue.direction === "across" ? "→" : "↓"})
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder={`${clue.answer.length} letras...`}
                      value={answers[clue.number] || ""}
                      onChange={(e) =>
                        handleInputChange(clue.number, e.target.value)
                      }
                      maxLength={clue.answer.length}
                      disabled={correctAnswers.has(clue.number)}
                      className={`uppercase ${
                        correctAnswers.has(clue.number)
                          ? "bg-success/20 border-success"
                          : ""
                      }`}
                    />
                    <Button
                      onClick={() => checkAnswer(clue)}
                      disabled={
                        !answers[clue.number] ||
                        correctAnswers.has(clue.number)
                      }
                      size="sm"
                    >
                      {correctAnswers.has(clue.number) ? "✓" : "Verificar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button onClick={resetGame} variant="outline" className="w-full">
                Reiniciar Jogo
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              {correctAnswers.size} de {clues.length} palavras corretas
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Crossword;
