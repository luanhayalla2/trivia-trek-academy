import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, X, Check, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useGameInvites, GameInvite } from '@/hooks/useGameInvites';
import { useGameRooms } from '@/hooks/useGameRooms';
import { useNavigate } from 'react-router-dom';

const gameNames: Record<string, string> = {
  chess: 'Xadrez',
  checkers: 'Damas',
  trilha: 'Trilha',
  'tic-tac-toe': 'Jogo da Velha'
};

export const GameInviteNotification = () => {
  const navigate = useNavigate();
  const { pendingInvites, acceptInvite, declineInvite } = useGameInvites();
  const { joinRoom } = useGameRooms();
  const [currentInvite, setCurrentInvite] = useState<GameInvite | null>(null);

  useEffect(() => {
    if (pendingInvites.length > 0 && !currentInvite) {
      setCurrentInvite(pendingInvites[0]);
    }
  }, [pendingInvites, currentInvite]);

  const handleAccept = async () => {
    if (!currentInvite) return;
    
    const accepted = await acceptInvite(currentInvite.id);
    if (accepted && currentInvite.room) {
      const joined = await joinRoom(currentInvite.room_id);
      if (joined) {
        navigate(`/game/${currentInvite.room.game_id}?room=${currentInvite.room_id}`);
      }
    }
    setCurrentInvite(null);
  };

  const handleDecline = async () => {
    if (!currentInvite) return;
    await declineInvite(currentInvite.id);
    setCurrentInvite(null);
  };

  return (
    <AnimatePresence>
      {currentInvite && currentInvite.sender && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed bottom-4 right-4 z-[100] pointer-events-auto"
        >
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary/80 to-primary p-1 shadow-2xl">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            
            <div className="relative bg-background rounded-lg p-4">
              <button
                onClick={handleDecline}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  initial={{ rotate: -15, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10, delay: 0.2 }}
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <Gamepad2 className="h-7 w-7 text-primary-foreground" />
                  </div>
                </motion.div>

                <div className="flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Convite para Jogar
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={currentInvite.sender.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {currentInvite.sender.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-bold">{currentInvite.sender.username}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Quer jogar {gameNames[currentInvite.room?.game_id || ''] || 'um jogo'} com você!
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleDecline}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Recusar
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={handleAccept}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Aceitar
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
