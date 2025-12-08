import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Piece = 'w' | 'b' | null;

const Trilha = () => {
  // 24 positions in the Nine Men's Morris board
  const [board, setBoard] = useState<Piece[]>(Array(24).fill(null));
  const [turn, setTurn] = useState<'w' | 'b'>('w');
  const [phase, setPhase] = useState<'placing' | 'moving'>('placing');
  const [whitePieces, setWhitePieces] = useState(9);
  const [blackPieces, setBlackPieces] = useState(9);
  const [selected, setSelected] = useState<number | null>(null);

  // Adjacent positions for each spot
  const adjacent: number[][] = [
    [1, 9], [0, 2, 4], [1, 14], // outer top
    [4, 10], [1, 3, 5, 7], [4, 13], // middle top
    [7, 11], [4, 6, 8], [7, 12], // inner top
    [0, 10, 21], [3, 9, 11, 18], [6, 10, 15], // left side
    [8, 13, 17], [5, 12, 14, 20], [2, 13, 23], // right side
    [11, 16], [15, 17, 19], [12, 16], // inner bottom
    [10, 19], [16, 18, 20, 22], [13, 19], // middle bottom
    [9, 22], [19, 21, 23], [14, 22], // outer bottom
  ];

  const mills = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontal top
    [9, 10, 11], [12, 13, 14], // horizontal middle
    [15, 16, 17], [18, 19, 20], [21, 22, 23], // horizontal bottom
    [0, 9, 21], [3, 10, 18], [6, 11, 15], // vertical left
    [1, 4, 7], [16, 19, 22], // vertical middle
    [8, 12, 17], [5, 13, 20], [2, 14, 23], // vertical right
  ];

  const checkMill = (pos: number, boardState: Piece[]): boolean => {
    const piece = boardState[pos];
    if (!piece) return false;
    return mills.some(mill => 
      mill.includes(pos) && mill.every(p => boardState[p] === piece)
    );
  };

  const handleClick = (pos: number) => {
    if (phase === 'placing') {
      if (board[pos] !== null) return;
      if ((turn === 'w' && whitePieces === 0) || (turn === 'b' && blackPieces === 0)) return;

      const newBoard = [...board];
      newBoard[pos] = turn;
      setBoard(newBoard);

      if (turn === 'w') setWhitePieces(whitePieces - 1);
      else setBlackPieces(blackPieces - 1);

      // Check if all pieces placed
      if (whitePieces === 1 && turn === 'w' || blackPieces === 1 && turn === 'b') {
        if (whitePieces <= 1 && blackPieces <= 1) {
          setPhase('moving');
        }
      }

      setTurn(turn === 'w' ? 'b' : 'w');
    } else {
      // Moving phase
      if (selected === null) {
        if (board[pos] === turn) {
          setSelected(pos);
        }
      } else {
        if (board[pos] === null && adjacent[selected].includes(pos)) {
          const newBoard = [...board];
          newBoard[pos] = turn;
          newBoard[selected] = null;
          setBoard(newBoard);
          setSelected(null);
          setTurn(turn === 'w' ? 'b' : 'w');
        } else {
          setSelected(null);
        }
      }
    }
  };

  const renderPosition = (pos: number, x: number, y: number) => {
    const piece = board[pos];
    return (
      <div
        key={pos}
        onClick={() => handleClick(pos)}
        className={`absolute w-8 h-8 rounded-full border-2 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all
          ${piece === 'w' ? 'bg-white border-gray-400' : piece === 'b' ? 'bg-gray-800 border-gray-600' : 'bg-muted border-muted-foreground/30'}
          ${selected === pos ? 'ring-2 ring-primary ring-offset-2' : ''}
          hover:scale-110`}
        style={{ left: `${x}%`, top: `${y}%` }}
      />
    );
  };

  // Position coordinates (percentage)
  const positions = [
    [10, 10], [50, 10], [90, 10], // 0-2
    [20, 20], [50, 20], [80, 20], // 3-5
    [30, 30], [50, 30], [70, 30], // 6-8
    [10, 50], [20, 50], [30, 50], // 9-11
    [70, 50], [80, 50], [90, 50], // 12-14
    [30, 70], [50, 70], [70, 70], // 15-17
    [20, 80], [50, 80], [80, 80], // 18-20
    [10, 90], [50, 90], [90, 90], // 21-23
  ];

  return (
    <Card className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">⚫ Trilha (Nine Men's Morris)</h2>
      
      <p className="text-center text-muted-foreground mb-2">
        Vez: {turn === 'w' ? '⚪ Brancas' : '⚫ Pretas'} | Fase: {phase === 'placing' ? 'Colocando' : 'Movendo'}
      </p>
      
      {phase === 'placing' && (
        <p className="text-center text-sm mb-4">
          ⚪ Restantes: {whitePieces} | ⚫ Restantes: {blackPieces}
        </p>
      )}

      <div className="relative w-72 h-72 mx-auto bg-amber-100 rounded-lg border-2 border-amber-700">
        {/* Board lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {/* Outer square */}
          <rect x="10" y="10" width="80" height="80" fill="none" stroke="#92400e" strokeWidth="1" />
          {/* Middle square */}
          <rect x="20" y="20" width="60" height="60" fill="none" stroke="#92400e" strokeWidth="1" />
          {/* Inner square */}
          <rect x="30" y="30" width="40" height="40" fill="none" stroke="#92400e" strokeWidth="1" />
          {/* Cross lines */}
          <line x1="50" y1="10" x2="50" y2="30" stroke="#92400e" strokeWidth="1" />
          <line x1="50" y1="70" x2="50" y2="90" stroke="#92400e" strokeWidth="1" />
          <line x1="10" y1="50" x2="30" y2="50" stroke="#92400e" strokeWidth="1" />
          <line x1="70" y1="50" x2="90" y2="50" stroke="#92400e" strokeWidth="1" />
        </svg>
        
        {/* Positions */}
        {positions.map((coords, idx) => renderPosition(idx, coords[0], coords[1]))}
      </div>

      <Button 
        onClick={() => {
          setBoard(Array(24).fill(null));
          setTurn('w');
          setPhase('placing');
          setWhitePieces(9);
          setBlackPieces(9);
          setSelected(null);
        }} 
        className="w-full mt-4"
      >
        Reiniciar
      </Button>
    </Card>
  );
};

export default Trilha;
