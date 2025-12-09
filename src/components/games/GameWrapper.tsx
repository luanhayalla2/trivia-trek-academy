import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, User, Trophy, Clock, Target } from 'lucide-react';
import { GameDifficulty, GameMode } from '@/hooks/useGameScore';

interface GameWrapperProps {
  gameId: string;
  title: string;
  supportsMultiplayer?: boolean;
  supportsDifficulty?: boolean;
  children: (props: GameWrapperChildProps) => React.ReactNode;
}

export interface GameWrapperChildProps {
  mode: GameMode;
  difficulty: GameDifficulty;
  player1Name: string;
  player2Name: string;
  currentPlayer: 1 | 2;
  setCurrentPlayer: (player: 1 | 2) => void;
  gameStarted: boolean;
  onGameEnd: (result: { winner?: 1 | 2 | 'draw'; score?: number; timeTaken?: number; movesCount?: number }) => void;
}

const difficultyLabels: Record<GameDifficulty, { label: string; color: string }> = {
  facil: { label: 'Fácil', color: 'bg-green-500' },
  medio: { label: 'Médio', color: 'bg-yellow-500' },
  dificil: { label: 'Difícil', color: 'bg-red-500' }
};

export const GameWrapper: React.FC<GameWrapperProps> = ({
  gameId,
  title,
  supportsMultiplayer = false,
  supportsDifficulty = true,
  children
}) => {
  const [mode, setMode] = useState<GameMode>('single');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medio');
  const [player1Name, setPlayer1Name] = useState('Jogador 1');
  const [player2Name, setPlayer2Name] = useState('Jogador 2');
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameResult, setGameResult] = useState<{
    winner?: 1 | 2 | 'draw';
    score?: number;
    timeTaken?: number;
    movesCount?: number;
  } | null>(null);

  const handleStartGame = () => {
    setGameStarted(true);
    setGameResult(null);
    setCurrentPlayer(1);
  };

  const handleGameEnd = (result: { winner?: 1 | 2 | 'draw'; score?: number; timeTaken?: number; movesCount?: number }) => {
    setGameResult(result);
    setGameStarted(false);
  };

  const handleRestart = () => {
    setGameResult(null);
    setGameStarted(true);
    setCurrentPlayer(1);
  };

  if (!gameStarted && !gameResult) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {supportsMultiplayer && (
            <div className="space-y-3">
              <Label>Modo de Jogo</Label>
              <div className="flex gap-2">
                <Button
                  variant={mode === 'single' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setMode('single')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Solo
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
          )}

          {mode === 'multiplayer' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="player1">Nome do Jogador 1</Label>
                <Input
                  id="player1"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  placeholder="Jogador 1"
                />
              </div>
              <div>
                <Label htmlFor="player2">Nome do Jogador 2</Label>
                <Input
                  id="player2"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder="Jogador 2"
                />
              </div>
            </div>
          )}

          {supportsDifficulty && mode === 'single' && (
            <div className="space-y-3">
              <Label>Dificuldade</Label>
              <div className="flex gap-2">
                {(Object.entries(difficultyLabels) as [GameDifficulty, { label: string; color: string }][]).map(
                  ([key, { label, color }]) => (
                    <Button
                      key={key}
                      variant={difficulty === key ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setDifficulty(key)}
                    >
                      <span className={`w-2 h-2 rounded-full ${color} mr-2`} />
                      {label}
                    </Button>
                  )
                )}
              </div>
            </div>
          )}

          <Button className="w-full" size="lg" onClick={handleStartGame}>
            Iniciar Jogo
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameResult) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Fim de Jogo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === 'multiplayer' ? (
            <div className="text-center space-y-2">
              {gameResult.winner === 'draw' ? (
                <p className="text-xl font-bold">Empate!</p>
              ) : (
                <p className="text-xl font-bold">
                  {gameResult.winner === 1 ? player1Name : player2Name} venceu!
                </p>
              )}
            </div>
          ) : (
            <div className="text-center space-y-2">
              {gameResult.winner === 1 ? (
                <p className="text-xl font-bold text-green-500">Você venceu!</p>
              ) : gameResult.winner === 2 ? (
                <p className="text-xl font-bold text-red-500">Você perdeu!</p>
              ) : gameResult.winner === 'draw' ? (
                <p className="text-xl font-bold text-yellow-500">Empate!</p>
              ) : null}
            </div>
          )}

          <div className="flex justify-center gap-4 flex-wrap">
            {gameResult.score !== undefined && (
              <Badge variant="secondary" className="text-lg py-2 px-4">
                <Target className="w-4 h-4 mr-2" />
                {gameResult.score} pts
              </Badge>
            )}
            {gameResult.timeTaken !== undefined && (
              <Badge variant="secondary" className="text-lg py-2 px-4">
                <Clock className="w-4 h-4 mr-2" />
                {Math.floor(gameResult.timeTaken / 60)}:{(gameResult.timeTaken % 60).toString().padStart(2, '0')}
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleRestart}>
              Jogar Novamente
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setGameStarted(false)}>
              Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {mode === 'multiplayer' && (
            <Badge variant={currentPlayer === 1 ? 'default' : 'secondary'} className="text-sm">
              {currentPlayer === 1 ? player1Name : player2Name} está jogando
            </Badge>
          )}
          {supportsDifficulty && mode === 'single' && (
            <Badge className={difficultyLabels[difficulty].color}>
              {difficultyLabels[difficulty].label}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setGameStarted(false)}>
          Sair
        </Button>
      </div>

      {children({
        mode,
        difficulty,
        player1Name,
        player2Name,
        currentPlayer,
        setCurrentPlayer,
        gameStarted,
        onGameEnd: handleGameEnd
      })}
    </div>
  );
};
