import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Users, Trophy, Globe } from "lucide-react";
import { useGameScore, GameDifficulty, GameMode } from "@/hooks/useGameScore";
import { useAuth } from "@/contexts/AuthContext";
import { useGameRooms, GameRoom } from "@/hooks/useGameRooms";
import { toast } from "sonner";
import { MultiplayerLobby } from "@/components/MultiplayerLobby";
import { GameChat } from "@/components/GameChat";
import { useSearchParams } from "react-router-dom";

type GameState = 'setup' | 'lobby' | 'playing' | 'ended';

const Chess = () => {
  const { user } = useAuth();
  const { saveScore, saveMultiplayerMatch } = useGameScore();
  const { currentRoom, setCurrentRoom, updateGameState, endGame: endGameRoom, leaveRoom } = useGameRooms('chess');
  const [searchParams] = useSearchParams();

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
  const [isOnlineMultiplayer, setIsOnlineMultiplayer] = useState(false);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');

  const whitePieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
  const blackPieces = ['♚', '♛', '♜', '♝', '♞', '♟'];

  const isWhitePiece = (piece: string) => whitePieces.includes(piece);
  const isBlackPiece = (piece: string) => blackPieces.includes(piece);

  const pieceValues: Record<string, number> = {
    '♔': 1000, '♕': 9, '♖': 5, '♗': 3, '♘': 3, '♙': 1,
    '♚': 1000, '♛': 9, '♜': 5, '♝': 3, '♞': 3, '♟': 1,
  };

  // Check for room in URL params
  useEffect(() => {
    const roomId = searchParams.get('room');
    if (roomId && currentRoom?.id === roomId) {
      setIsOnlineMultiplayer(true);
      setPlayerColor(currentRoom.host_id === user?.id ? 'white' : 'black');
      setGameState('playing');
      setStartTime(Date.now());
      
      if (currentRoom.game_state && currentRoom.game_state.board) {
        setBoard(currentRoom.game_state.board);
        setTurn(currentRoom.game_state.turn || 'white');
        setMovesCount(currentRoom.game_state.movesCount || 0);
        setCaptures(currentRoom.game_state.captures || { white: 0, black: 0 });
      }
    }
  }, [searchParams, currentRoom, user?.id]);

  // Subscribe to online game state updates
  useEffect(() => {
    if (!isOnlineMultiplayer || !currentRoom) return;

    if (currentRoom.game_state && currentRoom.game_state.board) {
      setBoard(currentRoom.game_state.board);
      setTurn(currentRoom.game_state.turn || 'white');
      setMovesCount(currentRoom.game_state.movesCount || 0);
      setCaptures(currentRoom.game_state.captures || { white: 0, black: 0 });
      
      if (currentRoom.status === 'finished' && currentRoom.winner_id) {
        setWinner(currentRoom.winner_id === currentRoom.host_id ? 'white' : 'black');
        setGameState('ended');
      }
    }
  }, [currentRoom?.game_state, currentRoom?.status, isOnlineMultiplayer]);

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

    if (isOnlineMultiplayer && currentRoom) {
      const winnerId = gameWinner === 'white' ? currentRoom.host_id : currentRoom.guest_id;
      await endGameRoom(currentRoom.id, winnerId);
    }

    if (mode === 'multiplayer' && !isOnlineMultiplayer) {
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
    } else if (user && !isOnlineMultiplayer) {
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

    if (isOnlineMultiplayer && user) {
      const playerWon = (playerColor === 'white' && gameWinner === 'white') || 
                        (playerColor === 'black' && gameWinner === 'black');
      const score = playerWon ? 500 + (playerColor === 'white' ? captures.white : captures.black) * 50 : 100;
      
      try {
        await saveScore.mutateAsync({
          gameId: 'chess',
          score,
          timeTaken,
          difficulty: 'medio',
          mode: 'multiplayer',
          result: playerWon ? 'vitoria' : 'derrota',
          movesCount
        });
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
  };

  const handleClick = async (row: number, col: number) => {
    if (gameState !== 'playing') return;
    if (mode === 'single' && turn === 'black') return;
    if (isOnlineMultiplayer && turn !== playerColor) return;

    const piece = board[row][col];
    
    if (selected) {
      const [selRow, selCol] = selected;
      const validMoves = getValidMoves(board, selRow, selCol);
      const isValid = validMoves.some(([r, c]) => r === row && c === col);
      
      if (isValid) {
        const capturedPiece = board[row][col];
        const newBoard = makeMove(board, [selRow, selCol], [row, col]);
        const newTurn = turn === 'white' ? 'black' : 'white';
        const newCaptures = capturedPiece ? {
          ...captures,
          [turn]: captures[turn] + (pieceValues[capturedPiece] || 1)
        } : captures;
        const newMovesCount = movesCount + 1;
        
        setBoard(newBoard);
        setMovesCount(newMovesCount);
        
        if (capturedPiece) {
          setCaptures(newCaptures);
        }

        const gameWinner = checkGameEnd(newBoard);
        if (gameWinner) {
          setWinner(gameWinner);
          setGameState('ended');
          saveGameResult(gameWinner);
        } else {
          setTurn(newTurn);
          
          // Update online game state
          if (isOnlineMultiplayer && currentRoom) {
            await updateGameState(currentRoom.id, {
              board: newBoard,
              turn: newTurn,
              movesCount: newMovesCount,
              captures: newCaptures
            }, currentRoom.host_id === user?.id ? currentRoom.guest_id! : currentRoom.host_id);
          }
          
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
        if (mode === 'multiplayer' || isOnlineMultiplayer || turn === 'white') {
          if (!isOnlineMultiplayer || turn === playerColor) {
            setSelected([row, col]);
          }
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
    setIsOnlineMultiplayer(false);
  };

  const backToSetup = () => {
    setGameState('setup');
    setBoard(initialBoard);
    setWinner(null);
    setIsOnlineMultiplayer(false);
    if (currentRoom) {
      leaveRoom(currentRoom.id);
    }
  };

  const handleRoomJoin = (room: GameRoom) => {
    setCurrentRoom(room);
    setIsOnlineMultiplayer(true);
    setPlayerColor(room.host_id === user?.id ? 'white' : 'black');
    setGameState('playing');
    setStartTime(Date.now());
    setBoard(initialBoard);
    setMovesCount(0);
    setCaptures({ white: 0, black: 0 });
  };

  if (gameState === 'setup') {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">♟ Xadrez</h2>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Modo de Jogo</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={mode === 'single' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setMode('single')}
              >
                <User className="w-4 h-4 mr-2" />
                Solo
              </Button>
              <Button
                variant={mode === 'multiplayer' && !isOnlineMultiplayer ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => { setMode('multiplayer'); setIsOnlineMultiplayer(false); }}
              >
                <Users className="w-4 h-4 mr-2" />
                Local
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setGameState('lobby')}
              >
                <Globe className="w-4 h-4 mr-2" />
                Online
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

  if (gameState === 'lobby') {
    return (
      <div>
        <Button variant="ghost" onClick={backToSetup} className="mb-4">
          ← Voltar
        </Button>
        <MultiplayerLobby
          gameId="chess"
          gameName="Xadrez"
          onRoomJoin={handleRoomJoin}
          onCreateRoom={() => {}}
        />
      </div>
    );
  }

  const validMoves = selected ? getValidMoves(board, selected[0], selected[1]) : [];
  const isMyTurn = isOnlineMultiplayer ? turn === playerColor : true;

  return (
    <Card className="p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">♟ Xadrez</h2>
        {mode === 'single' && (
          <Badge className={difficulty === 'facil' ? 'bg-green-500' : difficulty === 'medio' ? 'bg-yellow-500' : 'bg-red-500'}>
            {difficulty === 'facil' ? 'Fácil' : difficulty === 'medio' ? 'Médio' : 'Difícil'}
          </Badge>
        )}
        {isOnlineMultiplayer && (
          <Badge variant="outline" className="gap-1">
            <Globe className="w-3 h-3" />
            Online
          </Badge>
        )}
      </div>

      <div className="flex justify-between mb-4">
        <div className={`text-center p-2 rounded ${playerColor === 'white' && isOnlineMultiplayer ? 'bg-primary/10' : ''}`}>
          <p className="font-bold">⚪ {isOnlineMultiplayer ? (currentRoom?.host?.username || 'Host') : mode === 'multiplayer' ? player1Name : 'Você'}</p>
          <p className="text-sm">Pontos: {captures.white}</p>
        </div>
        <div className={`text-center p-2 rounded ${playerColor === 'black' && isOnlineMultiplayer ? 'bg-primary/10' : ''}`}>
          <p className="font-bold">⚫ {isOnlineMultiplayer ? (currentRoom?.guest?.username || 'Guest') : mode === 'multiplayer' ? player2Name : 'IA'}</p>
          <p className="text-sm">Pontos: {captures.black}</p>
        </div>
      </div>

      {gameState === 'playing' && (
        <p className={`text-center mb-4 p-2 rounded ${isMyTurn ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground'}`}>
          {isMyTurn ? 'Sua vez!' : 'Aguardando oponente...'}
          {' '}({turn === 'white' ? '⚪ Brancas' : '⚫ Pretas'})
        </p>
      )}

      {gameState === 'ended' && winner && (
        <div className="text-center mb-4">
          <p className="text-xl font-bold text-green-600 flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5" />
            {isOnlineMultiplayer 
              ? (winner === playerColor ? 'Você Venceu!' : 'Você Perdeu!')
              : (winner === 'white' ? `⚪ ${mode === 'multiplayer' ? player1Name : 'Você'}` : `⚫ ${mode === 'multiplayer' ? player2Name : 'IA'}`)} Venceu!
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

      {/* Chat for online multiplayer */}
      {isOnlineMultiplayer && currentRoom && (
        <GameChat roomId={currentRoom.id} />
      )}
    </Card>
  );
};

export default Chess;
