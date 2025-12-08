import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Piece = 'r' | 'R' | 'b' | 'B' | null; // r=red, b=black, uppercase=king

const Checkers = () => {
  const createInitialBoard = (): Piece[][] => {
    const board: Piece[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) board[row][col] = 'b';
      }
    }
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) board[row][col] = 'r';
      }
    }
    return board;
  };

  const [board, setBoard] = useState(createInitialBoard());
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<'r' | 'b'>('r');

  const isCurrentPlayerPiece = (piece: Piece) => {
    if (!piece) return false;
    return piece.toLowerCase() === turn;
  };

  const handleClick = (row: number, col: number) => {
    const piece = board[row][col];

    if (selected) {
      const [selRow, selCol] = selected;
      const movingPiece = board[selRow][selCol];
      
      // Check if it's a valid move (simplified)
      const rowDiff = row - selRow;
      const colDiff = Math.abs(col - selCol);
      
      const isValidDirection = movingPiece === 'r' || movingPiece === 'R' ? rowDiff < 0 : rowDiff > 0;
      const isKing = movingPiece === 'R' || movingPiece === 'B';
      
      if ((isValidDirection || isKing) && colDiff === 1 && Math.abs(rowDiff) === 1 && !piece) {
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = movingPiece;
        newBoard[selRow][selCol] = null;
        
        // Crown if reaching opposite end
        if ((movingPiece === 'r' && row === 0) || (movingPiece === 'b' && row === 7)) {
          newBoard[row][col] = movingPiece.toUpperCase() as Piece;
        }
        
        setBoard(newBoard);
        setTurn(turn === 'r' ? 'b' : 'r');
      } else if (colDiff === 2 && Math.abs(rowDiff) === 2 && !piece) {
        // Capture
        const midRow = selRow + rowDiff / 2;
        const midCol = selCol + (col - selCol) / 2;
        const capturedPiece = board[midRow][midCol];
        
        if (capturedPiece && capturedPiece.toLowerCase() !== turn) {
          const newBoard = board.map(r => [...r]);
          newBoard[row][col] = movingPiece;
          newBoard[selRow][selCol] = null;
          newBoard[midRow][midCol] = null;
          
          if ((movingPiece === 'r' && row === 0) || (movingPiece === 'b' && row === 7)) {
            newBoard[row][col] = movingPiece.toUpperCase() as Piece;
          }
          
          setBoard(newBoard);
          setTurn(turn === 'r' ? 'b' : 'r');
        }
      }
      setSelected(null);
    } else if (piece && isCurrentPlayerPiece(piece)) {
      setSelected([row, col]);
    }
  };

  const renderPiece = (piece: Piece) => {
    if (!piece) return null;
    const isKing = piece === 'R' || piece === 'B';
    const color = piece.toLowerCase() === 'r' ? 'bg-red-600' : 'bg-gray-800';
    return (
      <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center shadow-lg`}>
        {isKing && <span className="text-yellow-400">👑</span>}
      </div>
    );
  };

  return (
    <Card className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">⚫ Damas</h2>
      <p className="text-center text-muted-foreground mb-4">
        Vez: {turn === 'r' ? '🔴 Vermelhas' : '⚫ Pretas'}
      </p>

      <div className="grid grid-cols-8 gap-0 border-2 border-foreground/20 mx-auto w-fit">
        {board.map((row, rowIdx) =>
          row.map((cell, colIdx) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              onClick={() => handleClick(rowIdx, colIdx)}
              className={`w-10 h-10 flex items-center justify-center cursor-pointer transition-all
                ${(rowIdx + colIdx) % 2 === 0 ? 'bg-amber-100' : 'bg-amber-800'}
                ${selected?.[0] === rowIdx && selected?.[1] === colIdx ? 'ring-2 ring-primary' : ''}
                hover:opacity-80`}
            >
              {renderPiece(cell)}
            </div>
          ))
        )}
      </div>

      <Button onClick={() => { setBoard(createInitialBoard()); setSelected(null); setTurn('r'); }} className="w-full mt-4">
        Reiniciar Jogo
      </Button>
    </Card>
  );
};

export default Checkers;
