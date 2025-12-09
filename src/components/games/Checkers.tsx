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

type Piece = 'r' | 'R' | 'b' | 'B' | null;
type GameState = 'setup' | 'playing' | 'ended';

const Checkers = () => {
  const { user } = useAuth();
  const { saveScore, saveMultiplayerMatch } = useGameScore();

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
  const [gameState, setGameState] = useState<GameState>('setup');
  const [mode, setMode] = useState<GameMode>('single');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medio');
  const [player1Name, setPlayer1Name] = useState('Jogador 1');
  const [player2Name, setPlayer2Name] = useState('Jogador 2');
  const [startTime, setStartTime] = useState<number>(0);
  const [movesCount, setMovesCount] = useState(0);
  const [captures, setCaptures] = useState({ r: 0, b: 0 });

  const countPieces = useCallback((boardState: Piece[][]) => {
    let red = 0, black = 0;
    for (const row of boardState) {
      for (const cell of row) {
        if (cell === 'r' || cell === 'R') red++;
        if (cell === 'b' || cell === 'B') black++;
      }
    }
    return { red, black };
  }, []);

  const getValidMoves = useCallback((boardState: Piece[][], row: number, col: number): { row: number; col: number; isCapture: boolean }[] => {
    const piece = boardState[row][col];
    if (!piece) return [];

    const moves: { row: number; col: number; isCapture: boolean }[] = [];
    const isKing = piece === 'R' || piece === 'B';
    const isRed = piece.toLowerCase() === 'r';
    const directions = isKing ? [-1, 1] : isRed ? [-1] : [1];

    for (const rowDir of directions) {
      for (const colDir of [-1, 1]) {
        const newRow = row + rowDir;
        const newCol = col + colDir;

        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          if (!boardState[newRow][newCol]) {
            moves.push({ row: newRow, col: newCol, isCapture: false });
          } else {
            const jumpRow = row + rowDir * 2;
            const jumpCol = col + colDir * 2;
            if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8) {
              const middlePiece = boardState[newRow][newCol];
              if (middlePiece && middlePiece.toLowerCase() !== piece.toLowerCase() && !boardState[jumpRow][jumpCol]) {
                moves.push({ row: jumpRow, col: jumpCol, isCapture: true });
              }
            }
          }
        }
      }
    }

    return moves;
  }, []);

  const getAllMoves = useCallback((boardState: Piece[][], player: 'r' | 'b') => {
    const allMoves: { fromRow: number; fromCol: number; toRow: number; toCol: number; isCapture: boolean }[] = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = boardState[row][col];
        if (piece && piece.toLowerCase() === player) {
          const moves = getValidMoves(boardState, row, col);
          for (const move of moves) {
            allMoves.push({ fromRow: row, fromCol: col, toRow: move.row, toCol: move.col, isCapture: move.isCapture });
          }
        }
      }
    }
    
    return allMoves;
  }, [getValidMoves]);

  const makeMove = useCallback((boardState: Piece[][], fromRow: number, fromCol: number, toRow: number, toCol: number): Piece[][] => {
    const newBoard = boardState.map(r => [...r]);
    const piece = newBoard[fromRow][fromCol];
    newBoard[toRow][toCol] = piece;
    newBoard[fromRow][fromCol] = null;

    if (Math.abs(toRow - fromRow) === 2) {
      const midRow = (fromRow + toRow) / 2;
      const midCol = (fromCol + toCol) / 2;
      newBoard[midRow][midCol] = null;
    }

    if (piece === 'r' && toRow === 0) newBoard[toRow][toCol] = 'R';
    if (piece === 'b' && toRow === 7) newBoard[toRow][toCol] = 'B';

    return newBoard;
  }, []);

  const evaluateBoard = useCallback((boardState: Piece[][]): number => {
    let score = 0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = boardState[row][col];
        if (!piece) continue;
        
        const value = (piece === 'R' || piece === 'B') ? 3 : 1;
        const positionBonus = piece.toLowerCase() === 'b' ? row * 0.1 : (7 - row) * 0.1;
        
        if (piece.toLowerCase() === 'b') {
          score += value + positionBonus;
        } else {
          score -= value + positionBonus;
        }
      }
    }
    return score;
  }, []);

  const minimax = useCallback((boardState: Piece[][], depth: number, isMaximizing: boolean, alpha: number, beta: number): number => {
    const pieces = countPieces(boardState);
    if (pieces.red === 0) return 1000 - depth;
    if (pieces.black === 0) return depth - 1000;
    if (depth === 0) return evaluateBoard(boardState);

    const moves = getAllMoves(boardState, isMaximizing ? 'b' : 'r');
    if (moves.length === 0) return isMaximizing ? -1000 : 1000;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const newBoard = makeMove(boardState, move.fromRow, move.fromCol, move.toRow, move.toCol);
        const evalScore = minimax(newBoard, depth - 1, false, alpha, beta);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const newBoard = makeMove(boardState, move.fromRow, move.fromCol, move.toRow, move.toCol);
        const evalScore = minimax(newBoard, depth - 1, true, alpha, beta);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }, [countPieces, evaluateBoard, getAllMoves, makeMove]);

  const getAIMove = useCallback(() => {
    const moves = getAllMoves(board, 'b');
    if (moves.length === 0) return null;

    const captureMoves = moves.filter(m => m.isCapture);
    const availableMoves = captureMoves.length > 0 ? captureMoves : moves;

    if (difficulty === 'facil') {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    const searchDepth = difficulty === 'medio' ? 3 : 5;
    let bestMove = availableMoves[0];
    let bestScore = -Infinity;

    for (const move of availableMoves) {
      const newBoard = makeMove(board, move.fromRow, move.fromCol, move.toRow, move.toCol);
      const score = minimax(newBoard, searchDepth - 1, false, -Infinity, Infinity);
      
      if (difficulty === 'medio' && Math.random() < 0.2) {
        continue;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }, [board, difficulty, getAllMoves, makeMove, minimax]);

  const checkGameEnd = useCallback((boardState: Piece[][]) => {
    const pieces = countPieces(boardState);
    if (pieces.red === 0) return 'b';
    if (pieces.black === 0) return 'r';
    
    const redMoves = getAllMoves(boardState, 'r');
    const blackMoves = getAllMoves(boardState, 'b');
    
    if (redMoves.length === 0) return 'b';
    if (blackMoves.length === 0) return 'r';
    
    return null;
  }, [countPieces, getAllMoves]);

  const saveGameResult = useCallback(async (winner: 'r' | 'b') => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    if (mode === 'multiplayer') {
      try {
        await saveMultiplayerMatch.mutateAsync({
          gameId: 'checkers',
          player1Name,
          player2Name,
          winner: winner === 'r' ? 'player1' : 'player2',
          player1Score: captures.b,
          player2Score: captures.r,
          movesCount,
          timeTaken
        });
      } catch (error) {
        console.error('Error saving match:', error);
      }
    } else if (user) {
      const playerWon = winner === 'r';
      const score = playerWon ? 200 + captures.b * 20 : captures.b * 10;
      
      try {
        await saveScore.mutateAsync({
          gameId: 'checkers',
          score,
          timeTaken,
          difficulty,
          mode: 'single',
          result: playerWon ? 'vitoria' : 'derrota',
          movesCount
        });
        if (playerWon) {
          toast.success(`+${score} pontos!`);
        }
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
  }, [startTime, mode, player1Name, player2Name, captures, movesCount, user, difficulty, saveMultiplayerMatch, saveScore]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const winner = checkGameEnd(board);
    if (winner) {
      setGameState('ended');
      saveGameResult(winner);
    }
  }, [board, gameState, checkGameEnd, saveGameResult]);

  useEffect(() => {
    if (gameState === 'playing' && mode === 'single' && turn === 'b') {
      const timer = setTimeout(() => {
        const aiMove = getAIMove();
        if (aiMove) {
          const isCapture = Math.abs(aiMove.toRow - aiMove.fromRow) === 2;
          const newBoard = makeMove(board, aiMove.fromRow, aiMove.fromCol, aiMove.toRow, aiMove.toCol);
          setBoard(newBoard);
          if (isCapture) {
            setCaptures(prev => ({ ...prev, b: prev.b + 1 }));
          }
          setTurn('r');
          setMovesCount(prev => prev + 1);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [turn, mode, gameState, board, getAIMove, makeMove]);

  const handleClick = (row: number, col: number) => {
    if (gameState !== 'playing') return;
    if (mode === 'single' && turn === 'b') return;

    const piece = board[row][col];

    if (selected) {
      const [selRow, selCol] = selected;
      const validMoves = getValidMoves(board, selRow, selCol);
      const targetMove = validMoves.find(m => m.row === row && m.col === col);

      if (targetMove) {
        const newBoard = makeMove(board, selRow, selCol, row, col);
        setBoard(newBoard);
        if (targetMove.isCapture) {
          setCaptures(prev => ({ ...prev, [turn]: prev[turn] + 1 }));
        }
        setTurn(turn === 'r' ? 'b' : 'r');
        setMovesCount(prev => prev + 1);
      }
      setSelected(null);
    } else if (piece && piece.toLowerCase() === turn) {
      setSelected([row, col]);
    }
  };

  const startGame = () => {
    setBoard(createInitialBoard());
    setSelected(null);
    setTurn('r');
    setGameState('playing');
    setStartTime(Date.now());
    setMovesCount(0);
    setCaptures({ r: 0, b: 0 });
  };

  const backToSetup = () => {
    setGameState('setup');
    setBoard(createInitialBoard());
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

  if (gameState === 'setup') {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">⚫ Damas</h2>

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
                <Label htmlFor="player1">Jogador 1 (🔴 Vermelho)</Label>
                <Input
                  id="player1"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="player2">Jogador 2 (⚫ Preto)</Label>
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
                  Fácil
                </Button>
                <Button
                  variant={difficulty === 'medio' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setDifficulty('medio')}
                >
                  Médio
                </Button>
                <Button
                  variant={difficulty === 'dificil' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setDifficulty('dificil')}
                >
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

  const winner = checkGameEnd(board);
  const pieces = countPieces(board);

  return (
    <Card className="p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">⚫ Damas</h2>
        {mode === 'single' && (
          <Badge className={difficulty === 'facil' ? 'bg-green-500' : difficulty === 'medio' ? 'bg-yellow-500' : 'bg-red-500'}>
            {difficulty === 'facil' ? 'Fácil' : difficulty === 'medio' ? 'Médio' : 'Difícil'}
          </Badge>
        )}
      </div>

      <div className="flex justify-between mb-4">
        <div className="text-center">
          <p className="font-bold text-red-600">🔴 {mode === 'multiplayer' ? player1Name : 'Você'}</p>
          <p className="text-sm">Peças: {pieces.red} | Capturas: {captures.r}</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-gray-800">⚫ {mode === 'multiplayer' ? player2Name : 'IA'}</p>
          <p className="text-sm">Peças: {pieces.black} | Capturas: {captures.b}</p>
        </div>
      </div>

      {gameState === 'playing' && (
        <p className="text-center text-muted-foreground mb-4">
          Vez: {turn === 'r' ? `🔴 ${mode === 'multiplayer' ? player1Name : 'Você'}` : `⚫ ${mode === 'multiplayer' ? player2Name : 'IA'}`}
        </p>
      )}

      {gameState === 'ended' && winner && (
        <div className="text-center mb-4">
          <p className="text-xl font-bold text-green-600 flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5" />
            {winner === 'r' ? `🔴 ${mode === 'multiplayer' ? player1Name : 'Você'}` : `⚫ ${mode === 'multiplayer' ? player2Name : 'IA'}`} Venceu!
          </p>
        </div>
      )}

      <div className="grid grid-cols-8 gap-0 border-2 border-foreground/20 mx-auto w-fit mb-4">
        {board.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            const isValidMove = selected && getValidMoves(board, selected[0], selected[1]).some(m => m.row === rowIdx && m.col === colIdx);
            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                onClick={() => handleClick(rowIdx, colIdx)}
                className={`w-10 h-10 flex items-center justify-center cursor-pointer transition-all
                  ${(rowIdx + colIdx) % 2 === 0 ? 'bg-amber-100' : 'bg-amber-800'}
                  ${selected?.[0] === rowIdx && selected?.[1] === colIdx ? 'ring-2 ring-primary' : ''}
                  ${isValidMove ? 'ring-2 ring-green-500' : ''}
                  hover:opacity-80`}
              >
                {renderPiece(cell)}
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={startGame} className="flex-1">
          Reiniciar
        </Button>
        <Button onClick={backToSetup} variant="outline" className="flex-1">
          Configurações
        </Button>
      </div>
    </Card>
  );
};

export default Checkers;
