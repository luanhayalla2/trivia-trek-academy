import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PlayingCard {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  numValue: number;
}

const CardGame = () => {
  const suits: PlayingCard['suit'][] = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const createDeck = (): PlayingCard[] => {
    const deck: PlayingCard[] = [];
    suits.forEach(suit => {
      values.forEach((value, idx) => {
        deck.push({ suit, value, numValue: idx + 1 });
      });
    });
    return deck.sort(() => Math.random() - 0.5);
  };

  const [deck, setDeck] = useState(createDeck());
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealer' | 'ended'>('betting');
  const [message, setMessage] = useState('Clique em "Distribuir" para começar');

  const getHandValue = (hand: PlayingCard[]): number => {
    let value = 0;
    let aces = 0;
    hand.forEach(card => {
      if (card.value === 'A') {
        aces++;
        value += 11;
      } else if (['J', 'Q', 'K'].includes(card.value)) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    });
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }
    return value;
  };

  const deal = () => {
    const newDeck = createDeck();
    const pHand = [newDeck.pop()!, newDeck.pop()!];
    const dHand = [newDeck.pop()!, newDeck.pop()!];
    setDeck(newDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setGameState('playing');
    setMessage('Sua vez! Pedir carta ou parar?');
  };

  const hit = () => {
    const card = deck.pop()!;
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    setDeck([...deck]);
    
    if (getHandValue(newHand) > 21) {
      setGameState('ended');
      setMessage('💥 Estourou! Você perdeu.');
    }
  };

  const stand = () => {
    setGameState('dealer');
    let dHand = [...dealerHand];
    let newDeck = [...deck];
    
    while (getHandValue(dHand) < 17) {
      dHand.push(newDeck.pop()!);
    }
    
    setDealerHand(dHand);
    setDeck(newDeck);
    
    const playerValue = getHandValue(playerHand);
    const dealerValue = getHandValue(dHand);
    
    if (dealerValue > 21) {
      setMessage('🎉 Dealer estourou! Você venceu!');
    } else if (playerValue > dealerValue) {
      setMessage('🎉 Você venceu!');
    } else if (playerValue < dealerValue) {
      setMessage('😢 Dealer venceu.');
    } else {
      setMessage('🤝 Empate!');
    }
    setGameState('ended');
  };

  const renderCard = (card: PlayingCard, hidden = false) => {
    const isRed = card.suit === '♥' || card.suit === '♦';
    if (hidden) {
      return (
        <div className="w-16 h-24 bg-blue-600 rounded-lg border-2 border-white flex items-center justify-center">
          <span className="text-white text-2xl">?</span>
        </div>
      );
    }
    return (
      <div className={`w-16 h-24 bg-white rounded-lg border-2 border-foreground/20 flex flex-col items-center justify-center shadow-md ${isRed ? 'text-red-600' : 'text-foreground'}`}>
        <span className="text-lg font-bold">{card.value}</span>
        <span className="text-2xl">{card.suit}</span>
      </div>
    );
  };

  return (
    <Card className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">🃏 Blackjack (21)</h2>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Dealer ({gameState === 'playing' ? '?' : getHandValue(dealerHand)})</h3>
        <div className="flex gap-2 justify-center min-h-28">
          {dealerHand.map((card, idx) => (
            <div key={idx}>
              {renderCard(card, gameState === 'playing' && idx === 1)}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Você ({getHandValue(playerHand)})</h3>
        <div className="flex gap-2 justify-center min-h-28 flex-wrap">
          {playerHand.map((card, idx) => (
            <div key={idx}>{renderCard(card)}</div>
          ))}
        </div>
      </div>

      <p className="text-center font-medium mb-4">{message}</p>

      <div className="flex gap-2">
        {gameState === 'betting' && (
          <Button onClick={deal} className="flex-1">Distribuir</Button>
        )}
        {gameState === 'playing' && (
          <>
            <Button onClick={hit} className="flex-1">Pedir Carta</Button>
            <Button onClick={stand} variant="secondary" className="flex-1">Parar</Button>
          </>
        )}
        {gameState === 'ended' && (
          <Button onClick={deal} className="flex-1">Jogar Novamente</Button>
        )}
      </div>
    </Card>
  );
};

export default CardGame;
