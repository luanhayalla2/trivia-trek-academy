import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Clock, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGameScore } from "@/hooks/useGameScore";
import { toast } from "sonner";

const pairsByDifficulty = {
  facil: [
    { left: "Brasil", right: "Brasília" },
    { left: "França", right: "Paris" },
    { left: "Japão", right: "Tóquio" },
  ],
  medio: [
    { left: "Brasil", right: "Brasília" },
    { left: "França", right: "Paris" },
    { left: "Japão", right: "Tóquio" },
    { left: "Itália", right: "Roma" },
    { left: "Canadá", right: "Ottawa" },
  ],
  dificil: [
    { left: "Brasil", right: "Brasília" },
    { left: "França", right: "Paris" },
    { left: "Japão", right: "Tóquio" },
    { left: "Itália", right: "Roma" },
    { left: "Canadá", right: "Ottawa" },
    { left: "Austrália", right: "Camberra" },
    { left: "Alemanha", right: "Berlim" },
  ],
};

const MatchColumns = () => {
  const { user } = useAuth();
  const { saveScore } = useGameScore();
  const [difficulty, setDifficulty] = useState<'facil' | 'medio' | 'dificil'>('medio');
  const [pairs, setPairs] = useState(pairsByDifficulty.medio);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [errors, setErrors] = useState(0);
  const [shuffledRight, setShuffledRight] = useState<{ id: number; text: string }[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !completed) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, completed]);

  const startGame = () => {
    const newPairs = pairsByDifficulty[difficulty];
    setPairs(newPairs);
    setShuffledRight(newPairs.map((p, i) => ({ id: i, text: p.right })).sort(() => Math.random() - 0.5));
    setMatches({});
    setSelectedLeft(null);
    setCompleted(false);
    setTimer(0);
    setErrors(0);
    setGameStarted(true);
  };

  const handleLeftClick = (id: number) => {
    if (matches[id] !== undefined) return;
    setSelectedLeft(id);
  };

  const handleRightClick = async (id: number) => {
    if (selectedLeft === null) return;
    if (Object.values(matches).includes(id)) return;

    if (selectedLeft === id) {
      const newMatches = { ...matches, [selectedLeft]: id };
      setMatches(newMatches);
      setSelectedLeft(null);

      if (Object.keys(newMatches).length === pairs.length) {
        setCompleted(true);
        const difficultyMultiplier = difficulty === 'facil' ? 1 : difficulty === 'medio' ? 1.5 : 2;
        const timeBonus = Math.max(0, 120 - timer);
        const errorPenalty = errors * 10;
        const score = Math.round((pairs.length * 100 * difficultyMultiplier) + timeBonus - errorPenalty);

        if (user) {
          saveScore.mutateAsync({
            gameId: 'match-columns',
            score: Math.max(0, score),
            timeTaken: timer,
            difficulty,
            mode: 'single',
            result: 'vitoria',
            accuracy: ((pairs.length - errors) / pairs.length) * 100,
          });
        }
        toast.success(`Parabéns! Pontuação: ${Math.max(0, score)}`);
      }
    } else {
      setErrors(e => e + 1);
      toast.error("Conexão incorreta!");
      setSelectedLeft(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameStarted) {
    return (
      <Card className="p-8 max-w-md mx-auto text-center space-y-6">
        <h2 className="text-2xl font-bold">🔗 Ligar as Colunas</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Dificuldade</label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="facil">Fácil (3 pares)</SelectItem>
                <SelectItem value="medio">Médio (5 pares)</SelectItem>
                <SelectItem value="dificil">Difícil (7 pares)</SelectItem>
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
    const timeBonus = Math.max(0, 120 - timer);
    const errorPenalty = errors * 10;
    const score = Math.round((pairs.length * 100 * difficultyMultiplier) + timeBonus - errorPenalty);

    return (
      <Card className="p-8 text-center space-y-6">
        <h2 className="text-3xl font-bold">Parabéns! 🎉</h2>
        <div className="text-6xl">🏆</div>
        <div className="space-y-2">
          <p className="text-xl">Tempo: {formatTime(timer)}</p>
          <p className="text-xl">Erros: {errors}</p>
          <p className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6" /> {Math.max(0, score)} pontos
          </p>
        </div>
        <Button onClick={startGame} size="lg" className="w-full">Jogar Novamente</Button>
      </Card>
    );
  }

  const leftItems = pairs.map((p, i) => ({ id: i, text: p.left }));

  return (
    <Card className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">🔗 Ligar as Colunas</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm bg-muted px-3 py-1 rounded-full capitalize">{difficulty}</span>
          <span className="flex items-center gap-1 text-lg font-mono">
            <Clock className="w-4 h-4" /> {formatTime(timer)}
          </span>
        </div>
      </div>

      <p className="text-center text-muted-foreground">Conecte cada país com sua capital</p>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-center">Países</h3>
          {leftItems.map((item) => {
            const isMatched = matches[item.id] !== undefined;
            const isSelected = selectedLeft === item.id;
            return (
              <Button
                key={item.id}
                onClick={() => handleLeftClick(item.id)}
                variant={isSelected ? "default" : "outline"}
                className="w-full justify-start gap-2"
                disabled={isMatched}
              >
                {isMatched && <CheckCircle className="w-4 h-4 text-green-500" />}
                {item.text}
              </Button>
            );
          })}
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-center">Capitais</h3>
          {shuffledRight.map((item) => {
            const isMatched = Object.values(matches).includes(item.id);
            return (
              <Button
                key={item.id}
                onClick={() => handleRightClick(item.id)}
                variant={isMatched ? "secondary" : "outline"}
                className="w-full justify-start gap-2"
                disabled={isMatched}
              >
                {isMatched && <CheckCircle className="w-4 h-4 text-green-500" />}
                {item.text}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        {Object.keys(matches).length} de {pairs.length} conexões | Erros: {errors}
      </div>

      <Button onClick={startGame} variant="outline" className="w-full">Reiniciar</Button>
    </Card>
  );
};

export default MatchColumns;
