import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useGameScore, GameDifficulty } from "@/hooks/useGameScore";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, Target, Trophy } from "lucide-react";

interface DominoPiece {
  left: number;
  right: number;
  id: number;
}

const difficultyConfig: Record<GameDifficulty, { aiDelay: number; aiMistakeRate: number; label: string; color: string }> = {
  facil: { aiDelay: 2000, aiMistakeRate: 0.4, label: 'Fácil', color: 'bg-success' },
  medio: { aiDelay: 1500, aiMistakeRate: 0.2, label: 'Médio', color: 'bg-warning text-warning-foreground' },
  dificil: { aiDelay: 1000, aiMistakeRate: 0.05, label: 'Difícil', color: 'bg-destructive' }
};

const Domino = () => {
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medio');
  const [gameStarted, setGameStarted] = useState(false);
  const [allPieces, setAllPieces] = useState<DominoPiece[]>([]);
  const [playerHand, setPlayerHand] = useState<DominoPiece[]>([]);
  const [aiHand, setAiHand] = useState<DominoPiece[]>([]);
  const [drawPile, setDrawPile] = useState<DominoPiece[]>([]);
  const [board, setBoard] = useState<DominoPiece[]>([]);
  const [leftEnd, setLeftEnd] = useState<number | null>(null);
  const [rightEnd, setRightEnd] = useState<number | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
  const [movesCount, setMovesCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const { saveScore } = useGameScore();
  const { user } = useAuth();
  const config = difficultyConfig[difficulty];

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

  useEffect(() => {
    if (gameStarted && !gameComplete) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, gameComplete, startTime]);

  useEffect(() => {
    if (gameStarted && !isPlayerTurn && !gameComplete) {
      const timeout = setTimeout(() => {
        aiPlay();
      }, config.aiDelay);
      return () => clearTimeout(timeout);
    }
  }, [isPlayerTurn, gameStarted, gameComplete]);

  const startGame = () => {
    const pieces = generatePieces();
    setAllPieces(pieces);
    setPlayerHand(pieces.slice(0, 7));
    setAiHand(pieces.slice(7, 14));
    setDrawPile(pieces.slice(14));
    setBoard([]);
    setLeftEnd(null);
    setRightEnd(null);
    setIsPlayerTurn(true);
    setStartTime(Date.now());
    setElapsedTime(0);
    setGameComplete(false);
    setWinner(null);
    setMovesCount(0);
    setGameStarted(true);
  };

  const canPlay = (piece: DominoPiece): boolean => {
    if (board.length === 0) return true;
    return piece.left === leftEnd || piece.right === leftEnd || 
           piece.left === rightEnd || piece.right === rightEnd;
  };

  const playPiece = (piece: DominoPiece, hand: DominoPiece[], setHand: (h: DominoPiece[]) => void, isPlayer: boolean) => {
    if (!canPlay(piece)) return false;

    const newHand = hand.filter(p => p.id !== piece.id);
    setHand(newHand);
    setMovesCount(m => m + 1);

    if (board.length === 0) {
      setBoard([piece]);
      setLeftEnd(piece.left);
      setRightEnd(piece.right);
    } else {
      if (piece.left === rightEnd || piece.right === rightEnd) {
        const orientedPiece = piece.left === rightEnd ? piece : { ...piece, left: piece.right, right: piece.left, id: piece.id };
        setBoard(prev => [...prev, orientedPiece]);
        setRightEnd(orientedPiece.right);
      } else {
        const orientedPiece = piece.right === leftEnd ? piece : { ...piece, left: piece.right, right: piece.left, id: piece.id };
        setBoard(prev => [orientedPiece, ...prev]);
        setLeftEnd(orientedPiece.left);
      }
    }

    if (newHand.length === 0) {
      handleGameComplete(isPlayer ? 'player' : 'ai');
    }

    return true;
  };

  const handlePlayerPlay = (piece: DominoPiece) => {
    if (!isPlayerTurn || gameComplete) return;
    
    if (playPiece(piece, playerHand, setPlayerHand, true)) {
      if (playerHand.length > 1) {
        setIsPlayerTurn(false);
      }
    }
  };

  const aiPlay = () => {
    const playablePieces = aiHand.filter(canPlay);
    
    if (playablePieces.length === 0) {
      if (drawPile.length > 0) {
        const drawnPiece = drawPile[0];
        setDrawPile(prev => prev.slice(1));
        setAiHand(prev => [...prev, drawnPiece]);
        toast.info("IA comprou uma peça");
      }
      setIsPlayerTurn(true);
      return;
    }

    let selectedPiece: DominoPiece;
    
    if (Math.random() < config.aiMistakeRate) {
      selectedPiece = playablePieces[Math.floor(Math.random() * playablePieces.length)];
    } else {
      selectedPiece = playablePieces.reduce((best, piece) => {
        const pieceValue = piece.left + piece.right;
        const bestValue = best.left + best.right;
        return pieceValue > bestValue ? piece : best;
      }, playablePieces[0]);
    }

    playPiece(selectedPiece, aiHand, setAiHand, false);
    setIsPlayerTurn(true);
  };

  const handleDraw = () => {
    if (!isPlayerTurn || drawPile.length === 0) return;
    
    const drawnPiece = drawPile[0];
    setDrawPile(prev => prev.slice(1));
    setPlayerHand(prev => [...prev, drawnPiece]);
    toast.info("Você comprou uma peça");
    
    if (!canPlay(drawnPiece)) {
      setIsPlayerTurn(false);
    }
  };

  const handleGameComplete = (gameWinner: 'player' | 'ai') => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameComplete(true);
    setWinner(gameWinner);

    const finalTime = Math.floor((Date.now() - startTime) / 1000);
    const isWin = gameWinner === 'player';
    
    if (isWin) {
      const baseScore = 500;
      const timeBonus = Math.max(0, 300 - finalTime) * 2;
      const piecesBonus = aiHand.reduce((sum, p) => sum + p.left + p.right, 0) * 10;
      const difficultyMultiplier = difficulty === 'facil' ? 1 : difficulty === 'medio' ? 1.5 : 2;
      const score = Math.floor((baseScore + timeBonus + piecesBonus) * difficultyMultiplier);

      toast.success(`Parabéns! Pontuação: ${score} pontos!`);

      if (user) {
        saveScore.mutate({
          gameId: 'domino',
          score,
          timeTaken: finalTime,
          difficulty,
          mode: 'single',
          result: 'vitoria',
          movesCount
        });
      }
    } else {
      toast.error("A IA venceu!");
      if (user) {
        saveScore.mutate({
          gameId: 'domino',
          score: 0,
          timeTaken: finalTime,
          difficulty,
          mode: 'single',
          result: 'derrota',
          movesCount
        });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderDots = (num: number) => {
    return <span className="text-lg font-bold">{num}</span>;
  };

  const hasPlayablePiece = playerHand.some(canPlay);

  if (!gameStarted) {
    return (
      <Card className="p-6 max-w-md mx-auto bg-card/90 backdrop-blur-sm">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">🁡 Dominó</h2>
            <p className="text-muted-foreground">Jogue contra a IA!</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Dificuldade da IA</p>
            <div className="flex gap-2">
              {(Object.entries(difficultyConfig) as [GameDifficulty, typeof difficultyConfig.facil][]).map(
                ([key, cfg]) => (
                  <Button
                    key={key}
                    variant={difficulty === key ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setDifficulty(key)}
                  >
                    <span className={`w-2 h-2 rounded-full ${cfg.color} mr-2`} />
                    {cfg.label}
                  </Button>
                )
              )}
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={startGame}>
            Iniciar Jogo
          </Button>
        </div>
      </Card>
    );
  }

  if (gameComplete && winner) {
    const finalTime = elapsedTime;
    const isWin = winner === 'player';
    let score = 0;
    
    if (isWin) {
      const baseScore = 500;
      const timeBonus = Math.max(0, 300 - finalTime) * 2;
      const piecesBonus = aiHand.reduce((sum, p) => sum + p.left + p.right, 0) * 10;
      const difficultyMultiplier = difficulty === 'facil' ? 1 : difficulty === 'medio' ? 1.5 : 2;
      score = Math.floor((baseScore + timeBonus + piecesBonus) * difficultyMultiplier);
    }

    return (
      <Card className="p-6 max-w-md mx-auto bg-card/90 backdrop-blur-sm">
        <div className="space-y-6 text-center">
          <Trophy className={`w-16 h-16 mx-auto ${isWin ? 'text-warning' : 'text-muted-foreground'}`} />
          <h2 className="text-2xl font-bold">{isWin ? 'Você Venceu!' : 'Você Perdeu!'}</h2>
          
          {isWin && (
            <div className="flex justify-center gap-4">
              <Badge variant="secondary" className="text-lg py-2 px-4">
                <Target className="w-4 h-4 mr-2" />
                {score} pts
              </Badge>
              <Badge variant="secondary" className="text-lg py-2 px-4">
                <Clock className="w-4 h-4 mr-2" />
                {formatTime(finalTime)}
              </Badge>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>Jogadas: {movesCount}</p>
            <p>Dificuldade: {config.label}</p>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={startGame}>
              Jogar Novamente
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setGameStarted(false)}>
              Configurações
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <Badge className={config.color}>{config.label}</Badge>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            {formatTime(elapsedTime)}
          </Badge>
          <Badge variant={isPlayerTurn ? "default" : "secondary"}>
            {isPlayerTurn ? "Sua vez" : "Vez da IA"}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setGameStarted(false)}>
            Sair
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">IA: {aiHand.length} peças</span>
          <span className="text-muted-foreground">Monte: {drawPile.length}</span>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Mesa:</h3>
        <div className="flex flex-wrap gap-1 min-h-16 p-3 bg-muted rounded-lg justify-center border border-border">
          {board.length === 0 ? (
            <span className="text-muted-foreground">Clique em uma peça para começar</span>
          ) : (
            board.map((piece) => (
              <div key={piece.id} className="flex bg-card rounded border-2 border-border">
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
        <h3 className="text-sm font-medium mb-2">Suas peças ({playerHand.length}):</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {playerHand.map((piece) => (
            <div
              key={piece.id}
              onClick={() => handlePlayerPlay(piece)}
              className={`flex bg-card rounded border-2 cursor-pointer transition-all hover:scale-105
                ${canPlay(piece) && isPlayerTurn ? 'border-primary shadow-md' : 'border-muted opacity-50'}`}
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

      {!hasPlayablePiece && isPlayerTurn && drawPile.length > 0 && (
        <Button onClick={handleDraw} variant="secondary" className="w-full mb-4">
          Comprar Peça
        </Button>
      )}

      <Button onClick={startGame} variant="outline" className="w-full">
        Reiniciar Jogo
      </Button>
    </Card>
  );
};

export default Domino;
