import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Users, Trophy } from "lucide-react";
import { useGameScore, GameDifficulty, GameMode } from "@/hooks/useGameScore";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type GameState = 'setup' | 'playing' | 'ended';

const Chess = () => {
  const { user } = useAuth();
  const { saveScore, saveMultiplayerMatch } = useGameScore();

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
  const [gameState, setGameState] = useState<GameState>('setup');
  const [mode, setMode] = useState<GameMode>('single');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medio');
  const [player1Name, setPlayer1Name] = useState('Jogador 1');
  const [player2Name, setPlayer2Name] = useState('Jogador 2');
  const [startTime, setStartTime] = useState<number>(0);
  const [movesCount, setMovesCount] = useState(0);
  const [captures, setCaptures] = useState({ white: 0, black: 0 });
  const [winner, setWinner] = useState<'white' | 'black' | null>(null);

  const whitePieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
  const blackPieces = ['♚', '♛', '♜', '♝', '♞', '♟'];

  const isWhitePiece = (piece: string) => whitePieces.includes(piece);
  const isBlackPiece = (piece: string) => blackPieces.includes(piece);

  const pieceValues: Record<string, number> = {
    '♔': 1000, '♕': 9, '♖': 5, '♗': 3, '♘': 3, '♙': 1,
    '♚': 1000, '♛': 9, '♜': 5, '♝': 3, '♞': 3, '♟': 1,
  };

  const getValidMoves = useCallback((boardState: string[][], row: number, col: number): [number, number][] => {
    const piece = boardState[row][col];
    if (!piece) return [];

    const moves: [number, number][] = [];
    const isWhite = isWhitePiece(piece);

    const addMove = (r: number, c: number) => {
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const target = boardState[r][c];
        if (!target || (isWhite ? isBlackPiece(target) : isWhitePiece(target))) {
          moves.push([r, c]);
          return !target;
        }
      }
      return false;
    };

    if (piece === '♙' || piece === '♟') {
      const dir = piece === '♙' ? -1 : 1;
      const startRow = piece === '♙' ? 6 : 1;
      
      if (!boardState[row + dir]?.[col]) {
        moves.push([row + dir, col]);
        if (row === startRow && !boardState[row + dir * 2]?.[col]) {
          moves.push([row + dir * 2, col]);
        }
      }
      
      for (const dc of [-1, 1]) {
        const target = boardState[row + dir]?.[col + dc];
        if (target && (isWhite ? isBlackPiece(target) : isWhitePiece(target))) {
          moves.push([row + dir, col + dc]);
        }
      }
    }

    if (piece === '♘' || piece === '♞') {
      const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
      for (const [dr, dc] of knightMoves) {
        addMove(row + dr, col + dc);
      }
    }

    if (piece === '♗' || piece === '♝' || piece === '♕' || piece === '♛') {
      for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        for (let i = 1; i < 8; i++) {
          if (!addMove(row + dr * i, col + dc * i)) break;
          if (boardState[row + dr * i]?.[col + dc * i]) break;
        }
      }
    }

    if (piece === '♖' || piece === '♜' || piece === '♕' || piece === '♛') {
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        for (let i = 1; i < 8; i++) {
          if (!addMove(row + dr * i, col + dc * i)) break;
          if (boardState[row + dr * i]?.[col + dc * i]) break;
        }
      }
    }

    if (piece === '♔' || piece === '♚') {
      for (const dr of [-1, 0, 1]) {
        for (const dc of [-1, 0, 1]) {
          if (dr !== 0 || dc !== 0) addMove(row + dr, col + dc);
        }
      }
    }

    return moves;
  }, []);

  const getAllMoves = useCallback((boardState: string[][], isWhiteTurn: boolean) => {
    const allMoves: { from: [number, number]; to: [number, number] }[] = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = boardState[row][col];
        if (piece && (isWhiteTurn ? isWhitePiece(piece) : isBlackPiece(piece))) {
          const moves = getValidMoves(boardState, row, col);
          for (const [toRow, toCol] of moves) {
            allMoves.push({ from: [row, col], to: [toRow, toCol] });
          }
        }
      }
    }
    
    return allMoves;
  }, [getValidMoves]);

  const evaluateBoard = useCallback((boardState: string[][]): number => {
    let score = 0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = boardState[row][col];
        if (!piece) continue;
        const value = pieceValues[piece] || 0;
        score += isBlackPiece(piece) ? value : -value;
      }
    }
    return score;
  }, [pieceValues]);

  const makeMove = useCallback((boardState: string[][], from: [number, number], to: [number, number]): string[][] => {
    const newBoard = boardState.map(r => [...r]);
    const piece = newBoard[from[0]][from[1]];
    newBoard[to[0]][to[1]] = piece;
    newBoard[from[0]][from[1]] = '';
    
    if (piece === '♙' && to[0] === 0) newBoard[to[0]][to[1]] = '♕';
    if (piece === '♟' && to[0] === 7) newBoard[to[0]][to[1]] = '♛';
    
    return newBoard;
  }, []);

  const getAIMove = useCallback(() => {
    const moves = getAllMoves(board, false);
    if (moves.length === 0) return null;

    if (difficulty === 'facil') {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (const move of moves) {
      const newBoard = makeMove(board, move.from, move.to);
      let score = evaluateBoard(newBoard);
      
      if (difficulty === 'dificil') {
        const opponentMoves = getAllMoves(newBoard, true);
        for (const oppMove of opponentMoves.slice(0, 5)) {
          const futureBoard = makeMove(newBoard, oppMove.from, oppMove.to);
          score = Math.min(score, evaluateBoard(futureBoard));
        }
      }
      
      if (difficulty === 'medio' && Math.random() < 0.15) continue;
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }, [board, difficulty, getAllMoves, makeMove, evaluateBoard]);

  const checkGameEnd = useCallback((boardState: string[][]) => {
    let whiteKing = false, blackKing = false;
    for (const row of boardState) {
      for (const cell of row) {
        if (cell === '♔') whiteKing = true;
        if (cell === '♚') blackKing = true;
      }
    }
    if (!whiteKing) return 'black';
    if (!blackKing) return 'white';
    return null;
  }, []);

  const saveGameResult = async (gameWinner: 'white' | 'black') => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    if (mode === 'multiplayer') {
      try {
        await saveMultiplayerMatch.mutateAsync({
          gameId: 'chess',
          player1Name,
          player2Name,
          winner: gameWinner === 'white' ? 'player1' : 'player2',
          player1Score: captures.white,
          player2Score: captures.black,
          movesCount,
          timeTaken
        });
      } catch (error) {
        console.error('Error saving match:', error);
      }
    } else if (user) {
      const playerWon = gameWinner === 'white';
      const score = playerWon ? 500 + captures.white * 50 : captures.white * 25;
      
      try {
        await saveScore.mutateAsync({
          gameId: 'chess',
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
  };

  const handleClick = (row: number, col: number) => {
    if (gameState !== 'playing') return;
    if (mode === 'single' && turn === 'black') return;

    const piece = board[row][col];
    
    if (selected) {
      const [selRow, selCol] = selected;
      const validMoves = getValidMoves(board, selRow, selCol);
      const isValid = validMoves.some(([r, c]) => r === row && c === col);
      
      if (isValid) {
        const capturedPiece = board[row][col];
        const newBoard = makeMove(board, [selRow, selCol], [row, col]);
        setBoard(newBoard);
        
        if (capturedPiece) {
          setCaptures(prev => ({
            ...prev,
            [turn]: prev[turn] + (pieceValues[capturedPiece] || 1)
          }));
        }
        
        setMovesCount(prev => prev + 1);

        const gameWinner = checkGameEnd(newBoard);
        if (gameWinner) {
          setWinner(gameWinner);
          setGameState('ended');
          saveGameResult(gameWinner);
        } else {
          setTurn(turn === 'white' ? 'black' : 'white');
          
          if (mode === 'single') {
            setTimeout(() => {
              const aiMove = getAIMove();
              if (aiMove) {
                const capturedByAI = board[aiMove.to[0]][aiMove.to[1]];
                const aiBoard = makeMove(newBoard, aiMove.from, aiMove.to);
                setBoard(aiBoard);
                
                if (capturedByAI) {
                  setCaptures(prev => ({
                    ...prev,
                    black: prev.black + (pieceValues[capturedByAI] || 1)
                  }));
                }
                
                setMovesCount(prev => prev + 1);
                
                const aiWinner = checkGameEnd(aiBoard);
                if (aiWinner) {
                  setWinner(aiWinner);
                  setGameState('ended');
                  saveGameResult(aiWinner);
                } else {
                  setTurn('white');
                }
              }
            }, 500);
          }
        }
      }
      setSelected(null);
    } else if (piece) {
      if ((turn === 'white' && isWhitePiece(piece)) || (turn === 'black' && isBlackPiece(piece))) {
        if (mode === 'multiplayer' || turn === 'white') {
          setSelected([row, col]);
        }
      }
    }
  };

  const startGame = () => {
    setBoard(initialBoard);
    setSelected(null);
    setTurn('white');
    setGameState('playing');
    setStartTime(Date.now());
    setMovesCount(0);
    setCaptures({ white: 0, black: 0 });
    setWinner(null);
  };

  const backToSetup = () => {
    setGameState('setup');
    setBoard(initialBoard);
    setWinner(null);
  };

  if (gameState === 'setup') {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">♟ Xadrez</h2>

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
                <Label htmlFor="player1">Jogador 1 (⚪ Brancas)</Label>
                <Input
                  id="player1"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="player2">Jogador 2 (⚫ Pretas)</Label>
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

  const validMoves = selected ? getValidMoves(board, selected[0], selected[1]) : [];

  return (
    <Card className="p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">♟ Xadrez</h2>
        {mode === 'single' && (
          <Badge className={difficulty === 'facil' ? 'bg-green-500' : difficulty === 'medio' ? 'bg-yellow-500' : 'bg-red-500'}>
            {difficulty === 'facil' ? 'Fácil' : difficulty === 'medio' ? 'Médio' : 'Difícil'}
          </Badge>
        )}
      </div>

      <div className="flex justify-between mb-4">
        <div className="text-center">
          <p className="font-bold">⚪ {mode === 'multiplayer' ? player1Name : 'Você'}</p>
          <p className="text-sm">Pontos: {captures.white}</p>
        </div>
        <div className="text-center">
          <p className="font-bold">⚫ {mode === 'multiplayer' ? player2Name : 'IA'}</p>
          <p className="text-sm">Pontos: {captures.black}</p>
        </div>
      </div>

      {gameState === 'playing' && (
        <p className="text-center text-muted-foreground mb-4">
          Vez: {turn === 'white' ? `⚪ ${mode === 'multiplayer' ? player1Name : 'Você'}` : `⚫ ${mode === 'multiplayer' ? player2Name : 'IA'}`}
        </p>
      )}

      {gameState === 'ended' && winner && (
        <div className="text-center mb-4">
          <p className="text-xl font-bold text-green-600 flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5" />
            {winner === 'white' ? `⚪ ${mode === 'multiplayer' ? player1Name : 'Você'}` : `⚫ ${mode === 'multiplayer' ? player2Name : 'IA'}`} Venceu!
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-8 gap-0 border-2 border-foreground/20 mx-auto w-fit mb-4">
        {board.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            const isValidMove = validMoves.some(([r, c]) => r === rowIdx && c === colIdx);
            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                onClick={() => handleClick(rowIdx, colIdx)}
                className={`w-10 h-10 flex items-center justify-center text-2xl cursor-pointer transition-all
                  ${(rowIdx + colIdx) % 2 === 0 ? 'bg-amber-100' : 'bg-amber-700'}
                  ${selected?.[0] === rowIdx && selected?.[1] === colIdx ? 'ring-2 ring-primary' : ''}
                  ${isValidMove ? 'ring-2 ring-green-500' : ''}
                  hover:opacity-80`}
              >
                {cell}
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

export default Chess;
