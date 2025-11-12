import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Anagram = () => {
  const words = [
    "EDUCAÇÃO",
    "APRENDER",
    "CONHECIMENTO",
    "ESTUDO",
    "SABEDORIA",
    "INTELIGÊNCIA",
    "MATEMÁTICA",
    "CIÊNCIA",
    "HISTÓRIA",
    "PORTUGUÊS",
  ];

  const [currentWord, setCurrentWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    generateNewWord();
  }, []);

  const scrambleWord = (word: string) => {
    const array = word.split("");
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join("");
  };

  const generateNewWord = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setScrambledWord(scrambleWord(randomWord));
    setUserAnswer("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempts(attempts + 1);

    if (userAnswer.toUpperCase() === currentWord) {
      setScore(score + 1);
      toast.success("Parabéns! Você acertou! 🎉");
      setTimeout(generateNewWord, 1500);
    } else {
      toast.error("Ops! Tente novamente!");
      setUserAnswer("");
    }
  };

  const handleHint = () => {
    toast.info(`Dica: A palavra começa com "${currentWord[0]}"`);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto bg-card/90 backdrop-blur-sm">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            💬 Jogo de Anagramas
          </h2>
          <p className="text-muted-foreground">
            Descubra a palavra correta a partir das letras embaralhadas
          </p>
        </div>

        <div className="flex justify-around text-center">
          <div>
            <p className="text-sm text-muted-foreground">Pontuação</p>
            <p className="text-3xl font-bold text-primary">{score}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tentativas</p>
            <p className="text-3xl font-bold text-muted-foreground">
              {attempts}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-8 rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Letras embaralhadas:
          </p>
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
          <div>
            <Input
              type="text"
              placeholder="Digite a palavra correta..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="text-center text-xl font-semibold uppercase"
              autoFocus
            />
          </div>

          <div className="flex gap-3 justify-center">
            <Button type="submit" className="gap-2" disabled={!userAnswer}>
              Verificar
            </Button>
            <Button type="button" variant="outline" onClick={handleHint}>
              Dica
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={generateNewWord}
            >
              Pular
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          {score > 0 && (
            <p>
              Taxa de acerto:{" "}
              {Math.round((score / attempts) * 100)}%
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Anagram;
