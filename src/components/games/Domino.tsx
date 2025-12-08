import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DominoPiece {
  left: number;
  right: number;
  id: number;
}

const Domino = () => {
  const generatePieces = (): DominoPiece[] => {
    const pieces: DominoPiece[] = [];
    let id = 0;
    for (let i = 0; i <= 6; i++) {
      for (let j = i; j <= 6; j++) {
        pieces.push({ left: i, right: j, id: id++ });
      }
    }
    return pieces.sort(() => Math.random() - 0.5);
  };

  const [allPieces] = useState(generatePieces());
  const [playerHand, setPlayerHand] = useState<DominoPiece[]>(allPieces.slice(0, 7));
  const [board, setBoard] = useState<DominoPiece[]>([]);
  const [leftEnd, setLeftEnd] = useState<number | null>(null);
  const [rightEnd, setRightEnd] = useState<number | null>(null);

  const canPlay = (piece: DominoPiece): boolean => {
    if (board.length === 0) return true;
    return piece.left === leftEnd || piece.right === leftEnd || 
           piece.left === rightEnd || piece.right === rightEnd;
  };

  const playPiece = (piece: DominoPiece) => {
    if (!canPlay(piece)) return;

    const newHand = playerHand.filter(p => p.id !== piece.id);
    setPlayerHand(newHand);

    if (board.length === 0) {
      setBoard([piece]);
      setLeftEnd(piece.left);
      setRightEnd(piece.right);
    } else {
      if (piece.left === rightEnd || piece.right === rightEnd) {
        const orientedPiece = piece.left === rightEnd ? piece : { ...piece, left: piece.right, right: piece.left };
        setBoard([...board, orientedPiece]);
        setRightEnd(orientedPiece.right);
      } else {
        const orientedPiece = piece.right === leftEnd ? piece : { ...piece, left: piece.right, right: piece.left };
        setBoard([orientedPiece, ...board]);
        setLeftEnd(orientedPiece.left);
      }
    }
  };

  const renderDots = (num: number) => {
    return <span className="text-lg font-bold">{num}</span>;
  };

  const resetGame = () => {
    const newPieces = generatePieces();
    setPlayerHand(newPieces.slice(0, 7));
    setBoard([]);
    setLeftEnd(null);
    setRightEnd(null);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">🁡 Dominó</h2>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Mesa:</h3>
        <div className="flex flex-wrap gap-1 min-h-16 p-3 bg-green-800 rounded-lg justify-center">
          {board.length === 0 ? (
            <span className="text-white/60">Clique em uma peça para começar</span>
          ) : (
            board.map((piece) => (
              <div key={piece.id} className="flex bg-white rounded border-2 border-foreground/20">
                <div className="w-8 h-12 flex items-center justify-center border-r">
                  {renderDots(piece.left)}
                </div>
                <div className="w-8 h-12 flex items-center justify-center">
                  {renderDots(piece.right)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Suas peças:</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {playerHand.map((piece) => (
            <div
              key={piece.id}
              onClick={() => playPiece(piece)}
              className={`flex bg-card rounded border-2 cursor-pointer transition-all hover:scale-105
                ${canPlay(piece) ? 'border-primary shadow-md' : 'border-muted opacity-50'}`}
            >
              <div className="w-8 h-12 flex items-center justify-center border-r">
                {renderDots(piece.left)}
              </div>
              <div className="w-8 h-12 flex items-center justify-center">
                {renderDots(piece.right)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {playerHand.length === 0 && (
        <p className="text-center text-green-600 font-bold mb-4">🎉 Você venceu!</p>
      )}

      <Button onClick={resetGame} className="w-full">
        Novo Jogo
      </Button>
    </Card>
  );
};

export default Domino;
