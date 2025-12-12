import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGameScore } from "@/hooks/useGameScore";
import { toast } from "sonner";

const Ludo = () => {
  const { user } = useAuth();
  const { saveScore } = useGameScore();
  const [difficulty, setDifficulty] = useState<'facil' | 'medio' | 'dificil'>('medio');
  const [dice, setDice] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [positions, setPositions] = useState([0, 0, 0, 0]);
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [turns, setTurns] = useState(0);
  const [winner, setWinner] = useState(-1);

  const players = [
    { name: 'Você', color: 'bg-blue-500', emoji: '🔵' },
    { name: 'Bot 1', color: 'bg-red-500', emoji: '🔴' },
    { name: 'Bot 2', color: 'bg-green-500', emoji: '🟢' },
    { name: 'Bot 3', color: 'bg-yellow-500', emoji: '🟡' },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && winner < 0) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, winner]);

  useEffect(() => {
    if (gameStarted && currentPlayer > 0 && winner < 0) {
      const delay = difficulty === 'facil' ? 1500 : difficulty === 'medio' ? 1000 : 500;
      const timeout = setTimeout(() => botPlay(), delay);
      return () => clearTimeout(timeout);
    }
  }, [currentPlayer, gameStarted, winner]);

  const startGame = () => {
    setPositions([0, 0, 0, 0]);
    setCurrentPlayer(0);
    setDice(1);
    setTurns(0);
    setTimer(0);
    setWinner(-1);
    setGameStarted(true);
  };

  const rollDice = () => {
    if (currentPlayer !== 0) return;
    performRoll(0);
  };

  const botPlay = () => {
    if (winner >= 0) return;
    performRoll(currentPlayer);
  };

  const performRoll = (player: number) => {
    setIsRolling(true);
    let rolls = 0;
    const interval = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls >= 10) {
        clearInterval(interval);
        let finalDice = Math.floor(Math.random() * 6) + 1;

        // AI adjustment based on difficulty
        if (player > 0) {
          if (difficulty === 'facil' && finalDice > 4) finalDice = Math.floor(Math.random() * 4) + 1;
          if (difficulty === 'dificil' && finalDice < 3) finalDice = Math.floor(Math.random() * 4) + 3;
        }

        setDice(finalDice);
        setIsRolling(false);
        
        const newPositions = [...positions];
        newPositions[player] = Math.min(newPositions[player] + finalDice, 56);
        setPositions(newPositions);
        setTurns(t => t + 1);
        
        if (newPositions[player] >= 56) {
          setWinner(player);
          handleGameEnd(player, newPositions);
          return;
        }
        
        if (finalDice !== 6) {
          setCurrentPlayer((player + 1) % 4);
        }
      }
    }, 100);
  };

  const handleGameEnd = async (winnerIdx: number, finalPositions: number[]) => {
    if (!user) return;
    
    const isPlayerWin = winnerIdx === 0;
    const difficultyMultiplier = difficulty === 'facil' ? 1 : difficulty === 'medio' ? 1.5 : 2;
    const positionBonus = finalPositions[0] * 10;
    const timeBonus = Math.max(0, 300 - timer);
    const winBonus = isPlayerWin ? 500 : 0;
    const score = Math.round((positionBonus + timeBonus + winBonus) * difficultyMultiplier);

    saveScore.mutateAsync({
      gameId: 'ludo',
      score: Math.max(0, score),
      timeTaken: timer,
      difficulty,
      mode: 'single',
      result: isPlayerWin ? 'vitoria' : 'derrota',
      movesCount: turns,
    });
    
    toast.success(isPlayerWin ? `Você venceu! Pontuação: ${score}` : `Fim de jogo! Pontuação: ${score}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  if (!gameStarted) {
    return (
      <Card className="p-8 max-w-md mx-auto text-center space-y-6">
        <h2 className="text-2xl font-bold">🎲 Ludo</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Dificuldade da IA</label>
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

  if (winner >= 0) {
    const isPlayerWin = winner === 0;
    const difficultyMultiplier = difficulty === 'facil' ? 1 : difficulty === 'medio' ? 1.5 : 2;
    const positionBonus = positions[0] * 10;
    const timeBonus = Math.max(0, 300 - timer);
    const winBonus = isPlayerWin ? 500 : 0;
    const score = Math.round((positionBonus + timeBonus + winBonus) * difficultyMultiplier);

    return (
      <Card className="p-8 text-center space-y-6">
        <h2 className="text-3xl font-bold">{isPlayerWin ? 'Você Venceu! 🎉' : `${players[winner].name} Venceu!`}</h2>
        <div className="text-6xl">{players[winner].emoji}</div>
        <div className="space-y-2">
          <p className="text-xl">Turnos: {turns}</p>
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
    <Card className="p-6 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">🎲 Ludo</h2>
        <span className="flex items-center gap-1 text-lg font-mono">
          <Clock className="w-4 h-4" /> {formatTime(timer)}
        </span>
      </div>
      
      <div className="text-center mb-6">
        <p className="text-muted-foreground mb-2">
          Vez de: {players[currentPlayer].emoji} {players[currentPlayer].name}
        </p>
        <div className={`text-6xl mb-4 ${isRolling ? 'animate-bounce' : ''}`}>
          {diceEmojis[dice - 1]}
        </div>
        <Button 
          onClick={rollDice} 
          disabled={isRolling || currentPlayer !== 0} 
          size="lg"
        >
          {isRolling ? 'Rolando...' : currentPlayer === 0 ? 'Jogar Dado' : 'Aguarde...'}
        </Button>
        {dice === 6 && !isRolling && currentPlayer === 0 && (
          <p className="text-green-600 font-medium mt-2">🎉 Tirou 6! Jogue novamente!</p>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-center">Progresso:</h3>
        {players.map((player, idx) => (
          <div key={idx} className={`flex items-center gap-3 ${currentPlayer === idx ? 'bg-muted/50 rounded-lg p-2' : ''}`}>
            <span className="text-xl">{player.emoji}</span>
            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${player.color} transition-all duration-500`}
                style={{ width: `${(positions[idx] / 56) * 100}%` }}
              />
            </div>
            <span className="text-sm w-12 text-right">{positions[idx]}/56</span>
          </div>
        ))}
      </div>

      <Button onClick={startGame} variant="outline" className="w-full mt-4">Reiniciar</Button>
    </Card>
  );
};

export default Ludo;
