import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Cell = 'X' | 'O' | null;

const TicTacToe = () => {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ x: 0, o: 0, draws: 0 });

  const winningLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6], // diagonals
  ];

  const calculateWinner = (squares: Cell[]): { winner: Cell; line: number[] } | null => {
    for (const line of winningLines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line };
      }
    }
    return null;
  };

  const result = calculateWinner(board);
  const winner = result?.winner;
  const winningLine = result?.line || [];
  const isDraw = !winner && board.every(cell => cell !== null);

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);

    const newResult = calculateWinner(newBoard);
    if (newResult?.winner) {
      setScores(prev => ({
        ...prev,
        [newResult.winner!.toLowerCase()]: prev[newResult.winner!.toLowerCase() as 'x' | 'o'] + 1
      }));
    } else if (newBoard.every(cell => cell !== null)) {
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  const resetScores = () => {
    setScores({ x: 0, o: 0, draws: 0 });
    resetGame();
  };

  return (
    <Card className="p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">❌⭕ Jogo da Velha</h2>

      <div className="flex justify-center gap-6 mb-4 text-sm">
        <div className="text-center">
          <p className="font-bold text-blue-600">❌ X</p>
          <p className="text-2xl">{scores.x}</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-muted-foreground">Empates</p>
          <p className="text-2xl">{scores.draws}</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-red-600">⭕ O</p>
          <p className="text-2xl">{scores.o}</p>
        </div>
      </div>

      {!winner && !isDraw && (
        <p className="text-center mb-4 font-medium">
          Vez de: {xIsNext ? '❌ X' : '⭕ O'}
        </p>
      )}

      {winner && (
        <p className="text-center mb-4 text-xl font-bold text-green-600">
          🎉 {winner === 'X' ? '❌' : '⭕'} {winner} Venceu!
        </p>
      )}

      {isDraw && (
        <p className="text-center mb-4 text-xl font-bold text-amber-600">
          🤝 Empate!
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto mb-4">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            disabled={!!cell || !!winner}
            className={`w-14 h-14 text-3xl font-bold rounded-lg border-2 transition-all
              ${winningLine.includes(index) ? 'bg-green-100 border-green-500' : 'bg-card border-border'}
              ${!cell && !winner ? 'hover:bg-muted cursor-pointer' : ''}
              ${cell === 'X' ? 'text-blue-600' : 'text-red-600'}`}
          >
            {cell}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button onClick={resetGame} className="flex-1">
          Nova Rodada
        </Button>
        <Button onClick={resetScores} variant="outline" className="flex-1">
          Zerar Placar
        </Button>
      </div>
    </Card>
  );
};

export default TicTacToe;
