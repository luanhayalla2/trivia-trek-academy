import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PlayingCard {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  numValue: number;
}

const Poker = () => {
  const suits: PlayingCard['suit'][] = ['♠', '♥', '♦', '♣'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  const createDeck = (): PlayingCard[] => {
    const deck: PlayingCard[] = [];
    suits.forEach(suit => {
      values.forEach((value, idx) => {
        deck.push({ suit, value, numValue: idx + 2 });
      });
    });
    return deck.sort(() => Math.random() - 0.5);
  };

  const [deck, setDeck] = useState(createDeck());
  const [hand, setHand] = useState<PlayingCard[]>([]);
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
  const [phase, setPhase] = useState<'deal' | 'draw' | 'result'>('deal');
  const [result, setResult] = useState('');
  const [credits, setCredits] = useState(100);

  const evaluateHand = (cards: PlayingCard[]): { name: string; payout: number } => {
    const sortedValues = cards.map(c => c.numValue).sort((a, b) => a - b);
    const suits = cards.map(c => c.suit);
    const valueCounts: { [key: number]: number } = {};
    cards.forEach(c => {
      valueCounts[c.numValue] = (valueCounts[c.numValue] || 0) + 1;
    });
    const counts = Object.values(valueCounts).sort((a, b) => b - a);

    const isFlush = suits.every(s => s === suits[0]);
    const isStraight = sortedValues.every((v, i) => i === 0 || v === sortedValues[i - 1] + 1) ||
      (sortedValues.join(',') === '2,3,4,5,14'); // Ace-low straight

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
  };

  const draw = () => {
    const newDeck = [...deck];
    const newHand = hand.map((card, idx) => {
      if (held[idx]) return card;
      return newDeck.pop()!;
    });
    setDeck(newDeck);
    setHand(newHand);
    
    const evaluation = evaluateHand(newHand);
    setResult(evaluation.name);
    if (evaluation.payout > 0) {
      setCredits(credits + evaluation.payout);
    }
    setPhase('result');
  };

  const toggleHold = (index: number) => {
    if (phase !== 'draw') return;
    const newHeld = [...held];
    newHeld[index] = !newHeld[index];
    setHeld(newHeld);
  };

  const renderCard = (card: PlayingCard, index: number) => {
    const isRed = card.suit === '♥' || card.suit === '♦';
    return (
      <div 
        key={index}
        onClick={() => toggleHold(index)}
        className={`relative w-16 h-24 bg-white rounded-lg border-2 flex flex-col items-center justify-center shadow-md cursor-pointer transition-all
          ${isRed ? 'text-red-600' : 'text-foreground'}
          ${held[index] ? 'border-primary ring-2 ring-primary -translate-y-2' : 'border-foreground/20'}
          ${phase === 'draw' ? 'hover:scale-105' : ''}`}
      >
        <span className="text-lg font-bold">{card.value}</span>
        <span className="text-2xl">{card.suit}</span>
        {held[index] && (
          <span className="absolute -top-3 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
            HOLD
          </span>
        )}
      </div>
    );
  };

  return (
    <Card className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">🃏 Video Poker</h2>
      
      <div className="text-center mb-4">
        <p className="text-2xl font-bold">💰 {credits} Créditos</p>
      </div>

      <div className="flex gap-2 justify-center min-h-28 mb-4">
        {hand.map((card, idx) => renderCard(card, idx))}
      </div>

      {phase === 'draw' && (
        <p className="text-center text-muted-foreground mb-4">
          Clique nas cartas que deseja manter
        </p>
      )}

      {result && (
        <p className={`text-center text-xl font-bold mb-4 ${evaluateHand(hand).payout > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
          {result}
        </p>
      )}

      <div className="flex gap-2">
        {phase === 'deal' && (
          <Button onClick={deal} className="flex-1" disabled={credits <= 0}>
            {credits <= 0 ? 'Sem Créditos' : 'Apostar 1 Crédito'}
          </Button>
        )}
        {phase === 'draw' && (
          <Button onClick={draw} className="flex-1">
            Trocar Cartas
          </Button>
        )}
        {phase === 'result' && (
          <Button onClick={deal} className="flex-1" disabled={credits <= 0}>
            Jogar Novamente
          </Button>
        )}
      </div>

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
