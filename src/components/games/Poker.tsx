import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGameScore } from "@/hooks/useGameScore";
import { toast } from "sonner";

interface PlayingCard {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  numValue: number;
}

const Poker = () => {
  const { user } = useAuth();
  const { saveScore } = useGameScore();
  const suits: PlayingCard['suit'][] = ['♠', '♥', '♦', '♣'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  const [difficulty, setDifficulty] = useState<'facil' | 'medio' | 'dificil'>('medio');
  const [gameStarted, setGameStarted] = useState(false);
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [hand, setHand] = useState<PlayingCard[]>([]);
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
  const [phase, setPhase] = useState<'deal' | 'draw' | 'result'>('deal');
  const [result, setResult] = useState('');
  const [credits, setCredits] = useState(100);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [handsPlayed, setHandsPlayed] = useState(0);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && credits > 0) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, credits]);

  const createDeck = (): PlayingCard[] => {
    const deck: PlayingCard[] = [];
    suits.forEach(suit => {
      values.forEach((value, idx) => {
        deck.push({ suit, value, numValue: idx + 2 });
      });
    });
    return deck.sort(() => Math.random() - 0.5);
  };

  const startGame = () => {
    const startingCredits = difficulty === 'facil' ? 150 : difficulty === 'medio' ? 100 : 75;
    setCredits(startingCredits);
    setDeck(createDeck());
    setHand([]);
    setHeld([false, false, false, false, false]);
    setPhase('deal');
    setResult('');
    setTotalWinnings(0);
    setHandsPlayed(0);
    setTimer(0);
    setGameStarted(true);
  };

  const evaluateHand = (cards: PlayingCard[]): { name: string; payout: number } => {
    const sortedValues = cards.map(c => c.numValue).sort((a, b) => a - b);
    const cardSuits = cards.map(c => c.suit);
    const valueCounts: { [key: number]: number } = {};
    cards.forEach(c => { valueCounts[c.numValue] = (valueCounts[c.numValue] || 0) + 1; });
    const counts = Object.values(valueCounts).sort((a, b) => b - a);

    const isFlush = cardSuits.every(s => s === cardSuits[0]);
    const isStraight = sortedValues.every((v, i) => i === 0 || v === sortedValues[i - 1] + 1) ||
      (sortedValues.join(',') === '2,3,4,5,14');

    if (isFlush && isStraight && sortedValues[4] === 14) return { name: '🎰 Royal Flush!', payout: 250 };
    if (isFlush && isStraight) return { name: '🌟 Straight Flush!', payout: 50 };
    if (counts[0] === 4) return { name: '💎 Quadra!', payout: 25 };
    if (counts[0] === 3 && counts[1] === 2) return { name: '🏠 Full House!', payout: 9 };
    if (isFlush) return { name: '♠️ Flush!', payout: 6 };
    if (isStraight) return { name: '📏 Sequência!', payout: 4 };
    if (counts[0] === 3) return { name: '🔥 Trinca!', payout: 3 };
    if (counts[0] === 2 && counts[1] === 2) return { name: '✌️ Dois Pares!', payout: 2 };
    if (counts[0] === 2) {
      const pairValue = parseInt(Object.keys(valueCounts).find(k => valueCounts[parseInt(k)] === 2) || '0');
      if (pairValue >= 11) return { name: '👑 Par Alto!', payout: 1 };
    }
    return { name: 'Sem mão', payout: 0 };
  };

  const deal = () => {
    if (credits <= 0) return;
    const newDeck = createDeck();
    const newHand = newDeck.splice(0, 5);
    setDeck(newDeck);
    setHand(newHand);
    setHeld([false, false, false, false, false]);
    setPhase('draw');
    setResult('');
    setCredits(credits - 1);
    setHandsPlayed(h => h + 1);
  };

  const draw = () => {
    const newDeck = [...deck];
    const newHand = hand.map((card, idx) => held[idx] ? card : newDeck.pop()!);
    setDeck(newDeck);
    setHand(newHand);
    
    const evaluation = evaluateHand(newHand);
    setResult(evaluation.name);
    if (evaluation.payout > 0) {
      setCredits(credits + evaluation.payout);
      setTotalWinnings(w => w + evaluation.payout);
    }
    setPhase('result');
  };

  const toggleHold = (index: number) => {
    if (phase !== 'draw') return;
    const newHeld = [...held];
    newHeld[index] = !newHeld[index];
    setHeld(newHeld);
  };

  const endSession = async () => {
    if (user && handsPlayed > 0) {
      const difficultyMultiplier = difficulty === 'facil' ? 1 : difficulty === 'medio' ? 1.5 : 2;
      const score = Math.round((totalWinnings * 10 + credits) * difficultyMultiplier);
      saveScore.mutateAsync({
        gameId: 'poker',
        score: Math.max(0, score),
        timeTaken: timer,
        difficulty,
        mode: 'single',
        result: credits > 0 ? 'vitoria' : 'derrota',
        movesCount: handsPlayed,
      });
      toast.success(`Sessão salva! Pontuação: ${Math.max(0, score)}`);
    }
    setGameStarted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderCard = (card: PlayingCard, index: number) => {
    const isRed = card.suit === '♥' || card.suit === '♦';
    return (
      <div 
        key={index}
        onClick={() => toggleHold(index)}
        className={`relative w-16 h-24 bg-card rounded-lg border-2 flex flex-col items-center justify-center shadow-md cursor-pointer transition-all
          ${isRed ? 'text-destructive' : 'text-card-foreground'}
          ${held[index] ? 'border-primary ring-2 ring-primary -translate-y-2' : 'border-border'}
          ${phase === 'draw' ? 'hover:scale-105' : ''}`}
      >
        <span className="text-lg font-bold">{card.value}</span>
        <span className="text-2xl">{card.suit}</span>
        {held[index] && (
          <span className="absolute -top-3 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">HOLD</span>
        )}
      </div>
    );
  };

  if (!gameStarted) {
    return (
      <Card className="p-8 max-w-md mx-auto text-center space-y-6">
        <h2 className="text-2xl font-bold">🃏 Video Poker</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Dificuldade</label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="facil">Fácil (150 créditos)</SelectItem>
                <SelectItem value="medio">Médio (100 créditos)</SelectItem>
                <SelectItem value="dificil">Difícil (75 créditos)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={startGame} size="lg" className="w-full">Iniciar Jogo</Button>
        </div>
      </Card>
    );
  }

  if (credits <= 0) {
    const difficultyMultiplier = difficulty === 'facil' ? 1 : difficulty === 'medio' ? 1.5 : 2;
    const score = Math.round(totalWinnings * 10 * difficultyMultiplier);

    return (
      <Card className="p-8 text-center space-y-6">
        <h2 className="text-3xl font-bold">Fim de Jogo!</h2>
        <div className="text-6xl">🃏</div>
        <div className="space-y-2">
          <p className="text-xl">Mãos jogadas: {handsPlayed}</p>
          <p className="text-xl">Ganhos totais: {totalWinnings}</p>
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
        <h2 className="text-2xl font-bold">🃏 Video Poker</h2>
        <span className="flex items-center gap-1 text-lg font-mono">
          <Clock className="w-4 h-4" /> {formatTime(timer)}
        </span>
      </div>
      
      <div className="text-center mb-4">
        <p className="text-2xl font-bold">💰 {credits} Créditos</p>
        <p className="text-sm text-muted-foreground">Ganhos: {totalWinnings} | Mãos: {handsPlayed}</p>
      </div>

      <div className="flex gap-2 justify-center min-h-28 mb-4">
        {hand.map((card, idx) => renderCard(card, idx))}
      </div>

      {phase === 'draw' && (
        <p className="text-center text-muted-foreground mb-4">Clique nas cartas que deseja manter</p>
      )}

      {result && (
        <p className={`text-center text-xl font-bold mb-4 ${evaluateHand(hand).payout > 0 ? 'text-success' : 'text-muted-foreground'}`}>
          {result}
        </p>
      )}

      <div className="flex gap-2">
        {phase === 'deal' && <Button onClick={deal} className="flex-1">Apostar 1 Crédito</Button>}
        {phase === 'draw' && <Button onClick={draw} className="flex-1">Trocar Cartas</Button>}
        {phase === 'result' && <Button onClick={deal} className="flex-1">Jogar Novamente</Button>}
      </div>

      <Button onClick={endSession} variant="outline" className="w-full mt-4">Encerrar e Salvar</Button>

      <div className="mt-4 text-xs text-muted-foreground">
        <p className="font-medium mb-1">Pagamentos:</p>
        <div className="grid grid-cols-2 gap-1">
          <span>Royal Flush: 250x</span>
          <span>Straight Flush: 50x</span>
          <span>Quadra: 25x</span>
          <span>Full House: 9x</span>
          <span>Flush: 6x</span>
          <span>Sequência: 4x</span>
          <span>Trinca: 3x</span>
          <span>Dois Pares: 2x</span>
          <span>Par Alto (J+): 1x</span>
        </div>
      </div>
    </Card>
  );
};

export default Poker;
