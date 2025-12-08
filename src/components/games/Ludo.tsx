import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Ludo = () => {
  const [dice, setDice] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [positions, setPositions] = useState([0, 0, 0, 0]); // 4 players

  const players = [
    { name: 'Vermelho', color: 'bg-red-500', emoji: '🔴' },
    { name: 'Azul', color: 'bg-blue-500', emoji: '🔵' },
    { name: 'Verde', color: 'bg-green-500', emoji: '🟢' },
    { name: 'Amarelo', color: 'bg-yellow-500', emoji: '🟡' },
  ];

  const rollDice = () => {
    setIsRolling(true);
    let rolls = 0;
    const interval = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls >= 10) {
        clearInterval(interval);
        const finalDice = Math.floor(Math.random() * 6) + 1;
        setDice(finalDice);
        setIsRolling(false);
        
        // Move current player
        const newPositions = [...positions];
        newPositions[currentPlayer] = Math.min(newPositions[currentPlayer] + finalDice, 56);
        setPositions(newPositions);
        
        // Check for win
        if (newPositions[currentPlayer] >= 56) {
          return;
        }
        
        // Next player (unless rolled 6)
        if (finalDice !== 6) {
          setCurrentPlayer((currentPlayer + 1) % 4);
        }
      }
    }, 100);
  };

  const resetGame = () => {
    setPositions([0, 0, 0, 0]);
    setCurrentPlayer(0);
    setDice(1);
  };

  const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  const winner = positions.findIndex(p => p >= 56);

  return (
    <Card className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">🎲 Ludo</h2>
      
      {winner >= 0 ? (
        <div className="text-center mb-6">
          <p className="text-2xl font-bold text-green-600 mb-2">
            🎉 {players[winner].emoji} {players[winner].name} Venceu!
          </p>
          <Button onClick={resetGame}>Jogar Novamente</Button>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <p className="text-muted-foreground mb-2">
              Vez de: {players[currentPlayer].emoji} {players[currentPlayer].name}
            </p>
            <div className={`text-6xl mb-4 ${isRolling ? 'animate-bounce' : ''}`}>
              {diceEmojis[dice - 1]}
            </div>
            <Button onClick={rollDice} disabled={isRolling} size="lg">
              {isRolling ? 'Rolando...' : 'Jogar Dado'}
            </Button>
            {dice === 6 && !isRolling && (
              <p className="text-green-600 font-medium mt-2">🎉 Tirou 6! Jogue novamente!</p>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-center">Progresso:</h3>
            {players.map((player, idx) => (
              <div key={idx} className="flex items-center gap-3">
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
        </>
      )}

      <Button onClick={resetGame} variant="outline" className="w-full mt-4">
        Reiniciar
      </Button>
    </Card>
  );
};

export default Ludo;
