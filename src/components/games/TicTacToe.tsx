import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Users, Trophy } from "lucide-react";
import { useGameScore, GameDifficulty, GameMode } from "@/hooks/useGameScore";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Cell = 'X' | 'O' | null;
type GameState = 'setup' | 'playing' | 'ended';

const TicTacToe = () => {
  const { user } = useAuth();
  const { saveScore, saveMultiplayerMatch } = useGameScore();
  
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ x: 0, o: 0, draws: 0 });
  const [gameState, setGameState] = useState<GameState>('setup');
  const [mode, setMode] = useState<GameMode>('single');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medio');
  const [player1Name, setPlayer1Name] = useState('Jogador 1');
  const [player2Name, setPlayer2Name] = useState('Jogador 2');
  const [startTime, setStartTime] = useState<number>(0);
  const [movesCount, setMovesCount] = useState(0);

  const winningLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
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

  const getEmptyCells = (squares: Cell[]): number[] => {
    return squares.map((cell, idx) => cell === null ? idx : -1).filter(idx => idx !== -1);
  };

  const minimax = (squares: Cell[], depth: number, isMaximizing: boolean, alpha: number, beta: number): number => {
    const result = calculateWinner(squares);
    if (result?.winner === 'O') return 10 - depth;
    if (result?.winner === 'X') return depth - 10;
    if (getEmptyCells(squares).length === 0) return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const idx of getEmptyCells(squares)) {
        const newSquares = [...squares];
        newSquares[idx] = 'O';
        const evalScore = minimax(newSquares, depth + 1, false, alpha, beta);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const idx of getEmptyCells(squares)) {
        const newSquares = [...squares];
        newSquares[idx] = 'X';
        const evalScore = minimax(newSquares, depth + 1, true, alpha, beta);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  };

  const getAIMove = useCallback((squares: Cell[]): number => {
    const emptyCells = getEmptyCells(squares);
    if (emptyCells.length === 0) return -1;

    if (difficulty === 'facil') {
      // 70% random, 30% best move
      if (Math.random() < 0.7) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
      }
    } else if (difficulty === 'medio') {
      // 30% random, 70% best move
      if (Math.random() < 0.3) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
      }
    }

    // Best move using minimax
    let bestMove = emptyCells[0];
    let bestScore = -Infinity;

    for (const idx of emptyCells) {
      const newSquares = [...squares];
      newSquares[idx] = 'O';
      const score = minimax(newSquares, 0, false, -Infinity, Infinity);
      if (score > bestScore) {
        bestScore = score;
        bestMove = idx;
      }
    }

    return bestMove;
  }, [difficulty]);

  const result = calculateWinner(board);
  const winner = result?.winner;
  const winningLine = result?.line || [];
  const isDraw = !winner && board.every(cell => cell !== null);

  const saveGameResult = useCallback(async (gameWinner: Cell | null) => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    if (mode === 'multiplayer') {
      try {
        await saveMultiplayerMatch.mutateAsync({
          gameId: 'tictactoe',
          player1Name,
          player2Name,
          winner: gameWinner === 'X' ? 'player1' : gameWinner === 'O' ? 'player2' : null,
          player1Score: gameWinner === 'X' ? 1 : 0,
          player2Score: gameWinner === 'O' ? 1 : 0,
          movesCount,
          timeTaken
        });
      } catch (error) {
        console.error('Error saving multiplayer match:', error);
      }
    } else if (user) {
      const playerWon = gameWinner === 'X';
      const score = playerWon ? 100 + (9 - movesCount) * 10 : isDraw ? 50 : 0;
      
      try {
        await saveScore.mutateAsync({
          gameId: 'tictactoe',
          score,
          timeTaken,
          difficulty,
          mode: 'single',
          result: playerWon ? 'vitoria' : gameWinner === 'O' ? 'derrota' : 'empate',
          movesCount
        });
        if (playerWon) {
          toast.success(`+${score} pontos!`);
        }
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
  }, [startTime, mode, player1Name, player2Name, movesCount, user, difficulty, isDraw, saveMultiplayerMatch, saveScore]);

  useEffect(() => {
    if (gameState === 'playing' && (winner || isDraw)) {
      setGameState('ended');
      saveGameResult(winner);
      
      if (winner) {
        setScores(prev => ({
          ...prev,
          [winner.toLowerCase()]: prev[winner.toLowerCase() as 'x' | 'o'] + 1
        }));
      } else if (isDraw) {
        setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      }
    }
  }, [winner, isDraw, gameState, saveGameResult]);

  useEffect(() => {
    if (gameState === 'playing' && mode === 'single' && !xIsNext && !winner && !isDraw) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board);
        if (aiMove !== -1) {
          const newBoard = [...board];
          newBoard[aiMove] = 'O';
          setBoard(newBoard);
          setXIsNext(true);
          setMovesCount(prev => prev + 1);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [xIsNext, board, mode, winner, isDraw, gameState, getAIMove]);

  const handleClick = (index: number) => {
    if (board[index] || winner || gameState !== 'playing') return;
    if (mode === 'single' && !xIsNext) return;

    const newBoard = [...board];
    newBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
    setMovesCount(prev => prev + 1);
  };

  const startGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setGameState('playing');
    setStartTime(Date.now());
    setMovesCount(0);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setMovesCount(0);
    setStartTime(Date.now());
    setGameState('playing');
  };

  const backToSetup = () => {
    setGameState('setup');
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  if (gameState === 'setup') {
    return (
      <Card className="p-6 max-w-sm mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">❌⭕ Jogo da Velha</h2>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Modo de Jogo</Label>
            <div className="flex gap-2">
              <Button
                variant={mode === 'single' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setMode('single')}
              >
                <User className="w-4 h-4 mr-2" />
                Solo vs IA
              </Button>
              <Button
                variant={mode === 'multiplayer' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setMode('multiplayer')}
              >
                <Users className="w-4 h-4 mr-2" />
                2 Jogadores
              </Button>
            </div>
          </div>

          {mode === 'multiplayer' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="player1">Jogador 1 (❌)</Label>
                <Input
                  id="player1"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="player2">Jogador 2 (⭕)</Label>
                <Input
                  id="player2"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                />
              </div>
            </div>
          )}

          {mode === 'single' && (
            <div className="space-y-3">
              <Label>Dificuldade da IA</Label>
              <div className="flex gap-2">
                <Button
                  variant={difficulty === 'facil' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setDifficulty('facil')}
                >
                  <span className="w-2 h-2 rounded-full bg-success mr-2" />
                  Fácil
                </Button>
                <Button
                  variant={difficulty === 'medio' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setDifficulty('medio')}
                >
                  <span className="w-2 h-2 rounded-full bg-warning mr-2" />
                  Médio
                </Button>
                <Button
                  variant={difficulty === 'dificil' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setDifficulty('dificil')}
                >
                  <span className="w-2 h-2 rounded-full bg-destructive mr-2" />
                  Difícil
                </Button>
              </div>
            </div>
          )}

          <Button className="w-full" size="lg" onClick={startGame}>
            Iniciar Jogo
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">❌⭕ Jogo da Velha</h2>
        {mode === 'single' && (
          <Badge className={difficulty === 'facil' ? 'bg-success' : difficulty === 'medio' ? 'bg-warning text-warning-foreground' : 'bg-destructive'}>
            {difficulty === 'facil' ? 'Fácil' : difficulty === 'medio' ? 'Médio' : 'Difícil'}
          </Badge>
        )}
      </div>

      <div className="flex justify-center gap-6 mb-4 text-sm">
        <div className="text-center">
          <p className="font-bold text-primary">❌ {mode === 'multiplayer' ? player1Name : 'Você'}</p>
          <p className="text-2xl">{scores.x}</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-muted-foreground">Empates</p>
          <p className="text-2xl">{scores.draws}</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-destructive">⭕ {mode === 'multiplayer' ? player2Name : 'IA'}</p>
          <p className="text-2xl">{scores.o}</p>
        </div>
      </div>

      {gameState === 'playing' && !winner && !isDraw && (
        <p className="text-center mb-4 font-medium">
          Vez de: {xIsNext ? `❌ ${mode === 'multiplayer' ? player1Name : 'Você'}` : `⭕ ${mode === 'multiplayer' ? player2Name : 'IA'}`}
        </p>
      )}

      {winner && (
        <div className="text-center mb-4">
          <p className="text-xl font-bold text-success flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5" />
            {winner === 'X' ? `❌ ${mode === 'multiplayer' ? player1Name : 'Você'}` : `⭕ ${mode === 'multiplayer' ? player2Name : 'IA'}`} Venceu!
          </p>
        </div>
      )}

      {isDraw && (
        <p className="text-center mb-4 text-xl font-bold text-warning">
          🤝 Empate!
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto mb-4">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            disabled={!!cell || !!winner || gameState !== 'playing' || (mode === 'single' && !xIsNext)}
            className={`w-14 h-14 text-3xl font-bold rounded-lg border-2 transition-all
              ${winningLine.includes(index) ? 'bg-success/20 border-success' : 'bg-card border-border'}
              ${!cell && !winner && gameState === 'playing' && (mode === 'multiplayer' || xIsNext) ? 'hover:bg-muted cursor-pointer' : ''}
              ${cell === 'X' ? 'text-primary' : 'text-destructive'}`}
          >
            {cell}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button onClick={resetGame} className="flex-1">
          Nova Rodada
        </Button>
        <Button onClick={backToSetup} variant="outline" className="flex-1">
          Configurações
        </Button>
      </div>
    </Card>
  );
};

export default TicTacToe;
