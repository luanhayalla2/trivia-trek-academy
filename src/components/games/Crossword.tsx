import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useGameScore } from "@/hooks/useGameScore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Trophy } from "lucide-react";

interface Clue {
  number: number;
  question: string;
  answer: string;
  row: number;
  col: number;
  direction: "across" | "down";
}

const cluesByDifficulty: Record<string, Clue[]> = {
  facil: [
    { number: 1, question: "1 + 1 = ?", answer: "DOIS", row: 0, col: 0, direction: "across" },
    { number: 2, question: "Cor do céu", answer: "AZUL", row: 2, col: 0, direction: "across" },
    { number: 3, question: "Animal que late", answer: "CAO", row: 0, col: 0, direction: "down" },
  ],
  medio: [
    { number: 1, question: "Matéria que estuda números", answer: "MATEMATICA", row: 0, col: 0, direction: "across" },
    { number: 2, question: "Processo de adquirir conhecimento", answer: "APRENDER", row: 2, col: 2, direction: "across" },
    { number: 3, question: "Idioma brasileiro", answer: "PORTUGUES", row: 4, col: 0, direction: "across" },
    { number: 4, question: "Estudo dos seres vivos", answer: "BIOLOGIA", row: 0, col: 0, direction: "down" },
  ],
  dificil: [
    { number: 1, question: "Força que atrai objetos para a Terra", answer: "GRAVIDADE", row: 0, col: 0, direction: "across" },
    { number: 2, question: "Processo celular de divisão", answer: "MITOSE", row: 2, col: 2, direction: "across" },
    { number: 3, question: "Teoria de Darwin", answer: "EVOLUCAO", row: 4, col: 0, direction: "across" },
    { number: 4, question: "Estudo do universo", answer: "ASTRONOMIA", row: 0, col: 0, direction: "down" },
    { number: 5, question: "Elemento químico H2O", answer: "AGUA", row: 6, col: 3, direction: "across" },
  ],
};

const Crossword = () => {
  const { user } = useAuth();
  const { saveScore } = useGameScore();
  const [difficulty, setDifficulty] = useState<'facil' | 'medio' | 'dificil'>('medio');
  const [clues, setClues] = useState<Clue[]>(cluesByDifficulty.medio);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [correctAnswers, setCorrectAnswers] = useState<Set<number>>(new Set());
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameOver) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  const startGame = () => {
    setClues(cluesByDifficulty[difficulty]);
    setAnswers({});
    setCorrectAnswers(new Set());
    setTimer(0);
    setGameStarted(true);
    setGameOver(false);
  };

  const handleInputChange = (clueNumber: number, value: string) => {
    setAnswers({ ...answers, [clueNumber]: value.toUpperCase() });
  };

  const checkAnswer = (clue: Clue) => {
    const userAnswer = answers[clue.number]?.trim();
    if (userAnswer === clue.answer) {
      const newCorrect = new Set([...correctAnswers, clue.number]);
      setCorrectAnswers(newCorrect);
      toast.success(`Resposta ${clue.number} correta! 🎉`);

      if (newCorrect.size === clues.length) {
        endGame(newCorrect.size);
      }
    } else {
      toast.error("Resposta incorreta. Tente novamente!");
    }
  };

  const endGame = async (wordsCompleted: number) => {
    setGameOver(true);
    const difficultyMultiplier = difficulty === 'facil' ? 1 : difficulty === 'medio' ? 1.5 : 2;
    const timeBonus = Math.max(0, 300 - timer);
    const score = Math.round((wordsCompleted * 100 * difficultyMultiplier) + timeBonus);

    if (user) {
      saveScore.mutateAsync({
        gameId: 'crossword',
        score,
        timeTaken: timer,
        difficulty,
        mode: 'single',
        result: 'vitoria',
        accuracy: (wordsCompleted / clues.length) * 100,
      });
    }
    toast.success(`Parabéns! Pontuação: ${score}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameStarted) {
    return (
      <Card className="p-8 max-w-md mx-auto text-center space-y-6">
        <h2 className="text-2xl font-bold">🧠 Palavras Cruzadas</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Dificuldade</label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="facil">Fácil</SelectItem>
                <SelectItem value="medio">Médio</SelectItem>
                <SelectItem value="dificil">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={startGame} size="lg" className="w-full">Iniciar Jogo</Button>
        </div>
      </Card>
    );
  }

  if (gameOver) {
    const difficultyMultiplier = difficulty === 'facil' ? 1 : difficulty === 'medio' ? 1.5 : 2;
    const timeBonus = Math.max(0, 300 - timer);
    const score = Math.round((correctAnswers.size * 100 * difficultyMultiplier) + timeBonus);

    return (
      <Card className="p-8 text-center space-y-6">
        <h2 className="text-3xl font-bold">Parabéns! 🎉</h2>
        <div className="text-6xl">🧠</div>
        <div className="space-y-2">
          <p className="text-xl">Palavras: {correctAnswers.size}/{clues.length}</p>
          <p className="text-xl">Tempo: {formatTime(timer)}</p>
          <p className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6" /> {score} pontos
          </p>
        </div>
        <Button onClick={startGame} size="lg" className="w-full">Jogar Novamente</Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-4xl mx-auto bg-card/90 backdrop-blur-sm">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">🧠 Palavras Cruzadas</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm bg-muted px-3 py-1 rounded-full capitalize">{difficulty}</span>
            <span className="flex items-center gap-1 text-lg font-mono">
              <Clock className="w-4 h-4" /> {formatTime(timer)}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Dicas</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Horizontal →</h4>
                {clues.filter((c) => c.direction === "across").map((clue) => (
                  <div key={clue.number} className={`p-3 rounded-lg mb-2 ${correctAnswers.has(clue.number) ? "bg-success/20" : "bg-muted"}`}>
                    <p className="text-sm font-semibold">{clue.number}. {clue.question}</p>
                    <p className="text-xs text-muted-foreground">({clue.answer.length} letras)</p>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Vertical ↓</h4>
                {clues.filter((c) => c.direction === "down").map((clue) => (
                  <div key={clue.number} className={`p-3 rounded-lg mb-2 ${correctAnswers.has(clue.number) ? "bg-success/20" : "bg-muted"}`}>
                    <p className="text-sm font-semibold">{clue.number}. {clue.question}</p>
                    <p className="text-xs text-muted-foreground">({clue.answer.length} letras)</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">Respostas</h3>
            <div className="space-y-3">
              {clues.map((clue) => (
                <div key={clue.number} className="space-y-2">
                  <label className="text-sm font-medium">
                    {clue.number}. ({clue.direction === "across" ? "→" : "↓"})
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder={`${clue.answer.length} letras...`}
                      value={answers[clue.number] || ""}
                      onChange={(e) => handleInputChange(clue.number, e.target.value)}
                      maxLength={clue.answer.length}
                      disabled={correctAnswers.has(clue.number)}
                      className={`uppercase ${correctAnswers.has(clue.number) ? "bg-success/20" : ""}`}
                    />
                    <Button onClick={() => checkAnswer(clue)} disabled={!answers[clue.number] || correctAnswers.has(clue.number)} size="sm">
                      {correctAnswers.has(clue.number) ? "✓" : "OK"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {correctAnswers.size} de {clues.length} palavras
            </div>
          </div>
        </div>

        <Button onClick={startGame} variant="outline" className="w-full">Reiniciar</Button>
      </div>
    </Card>
  );
};

export default Crossword;
