import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Chess = () => {
  const initialBoard = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
  ];

  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<'white' | 'black'>('white');

  const isWhitePiece = (piece: string) => ['♔', '♕', '♖', '♗', '♘', '♙'].includes(piece);
  const isBlackPiece = (piece: string) => ['♚', '♛', '♜', '♝', '♞', '♟'].includes(piece);

  const handleClick = (row: number, col: number) => {
    const piece = board[row][col];
    
    if (selected) {
      const [selRow, selCol] = selected;
      const selectedPiece = board[selRow][selCol];
      
      // Simple move (no validation for now)
      if (selRow !== row || selCol !== col) {
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = selectedPiece;
        newBoard[selRow][selCol] = '';
        setBoard(newBoard);
        setTurn(turn === 'white' ? 'black' : 'white');
      }
      setSelected(null);
    } else if (piece) {
      if ((turn === 'white' && isWhitePiece(piece)) || (turn === 'black' && isBlackPiece(piece))) {
        setSelected([row, col]);
      }
    }
  };

  const resetGame = () => {
    setBoard(initialBoard);
    setSelected(null);
    setTurn('white');
  };

  return (
    <Card className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">♟ Xadrez</h2>
      <p className="text-center text-muted-foreground mb-4">
        Vez: {turn === 'white' ? 'Brancas ⚪' : 'Pretas ⚫'}
      </p>
      
      <div className="grid grid-cols-8 gap-0 border-2 border-foreground/20 mx-auto w-fit">
        {board.map((row, rowIdx) =>
          row.map((cell, colIdx) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              onClick={() => handleClick(rowIdx, colIdx)}
              className={`w-10 h-10 flex items-center justify-center text-2xl cursor-pointer transition-all
                ${(rowIdx + colIdx) % 2 === 0 ? 'bg-amber-100' : 'bg-amber-700'}
                ${selected?.[0] === rowIdx && selected?.[1] === colIdx ? 'ring-2 ring-primary' : ''}
                hover:opacity-80`}
            >
              {cell}
            </div>
          ))
        )}
      </div>

      <Button onClick={resetGame} className="w-full mt-4">
        Reiniciar Jogo
      </Button>
    </Card>
  );
};

export default Chess;
