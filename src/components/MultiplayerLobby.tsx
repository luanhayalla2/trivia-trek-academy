import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, UserPlus, Gamepad2, Loader2, Send } from 'lucide-react';
import { useGameRooms, GameRoom } from '@/hooks/useGameRooms';
import { useFriendships, Friend } from '@/hooks/useFriendships';
import { useGameInvites } from '@/hooks/useGameInvites';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface MultiplayerLobbyProps {
  gameId: string;
  gameName: string;
  onRoomJoin: (room: GameRoom) => void;
  onCreateRoom: () => void;
}

export const MultiplayerLobby = ({ gameId, gameName, onRoomJoin, onCreateRoom }: MultiplayerLobbyProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { rooms, loading: roomsLoading, createRoom, joinRoom } = useGameRooms(gameId);
  const { friends, loading: friendsLoading } = useFriendships();
  const { sendInvite } = useGameInvites();
  const [selectedRoom, setSelectedRoom] = useState<GameRoom | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [sendingInvite, setSendingInvite] = useState<string | null>(null);

  const waitingRooms = rooms.filter(r => r.status === 'waiting' && r.host_id !== user?.id);
  const myRooms = rooms.filter(r => r.host_id === user?.id && r.status === 'waiting');

  const handleCreateRoom = async () => {
    setCreatingRoom(true);
    const room = await createRoom(gameId, {});
    setCreatingRoom(false);
    
    if (room) {
      setSelectedRoom(room);
      setInviteDialogOpen(true);
    }
  };

  const handleJoinRoom = async (room: GameRoom) => {
    const success = await joinRoom(room.id);
    if (success) {
      onRoomJoin(room);
    }
  };

  const handleInviteFriend = async (friend: Friend) => {
    if (!selectedRoom) return;
    
    setSendingInvite(friend.id);
    const result = await sendInvite(selectedRoom.id, friend.id);
    setSendingInvite(null);
    
    if (result.success) {
      toast({
        title: 'Convite enviado!',
        description: `${friend.username} receberá a notificação.`
      });
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Gamepad2 className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">{gameName} - Multiplayer</h2>
            <p className="text-muted-foreground">Jogue online com amigos</p>
          </div>
        </div>
        
        <Button onClick={handleCreateRoom} disabled={creatingRoom} className="gap-2">
          {creatingRoom ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          Criar Sala
        </Button>
      </div>

      {/* My waiting rooms */}
      {myRooms.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Minhas Salas
          </h3>
          <div className="space-y-2">
            {myRooms.map(room => (
              <div
                key={room.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={room.host?.avatar_url || undefined} />
                    <AvatarFallback>
                      {room.host?.username?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Sua sala</p>
                    <Badge variant="outline">Aguardando oponente</Badge>
                  </div>
                </div>
                <Dialog open={inviteDialogOpen && selectedRoom?.id === room.id} onOpenChange={(open) => {
                  setInviteDialogOpen(open);
                  if (open) setSelectedRoom(room);
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4 mr-1" />
                      Convidar Amigo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Convidar Amigo para Jogar</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[300px]">
                      {friendsLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : friends.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Você ainda não tem amigos.</p>
                          <p className="text-sm">Adicione amigos para jogar!</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {friends.map(friend => (
                            <div
                              key={friend.id}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={friend.avatar_url || undefined} />
                                  <AvatarFallback>
                                    {friend.username.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{friend.username}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Nível {friend.level}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleInviteFriend(friend)}
                                disabled={sendingInvite === friend.id}
                              >
                                {sendingInvite === friend.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-1" />
                                    Convidar
                                  </>
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available rooms from friends */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          Salas Disponíveis
        </h3>
        
        {roomsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : waitingRooms.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Gamepad2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Nenhuma sala disponível</p>
            <p className="text-sm">Crie uma sala e convide um amigo!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {waitingRooms.map(room => (
              <div
                key={room.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={room.host?.avatar_url || undefined} />
                    <AvatarFallback>
                      {room.host?.username?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{room.host?.username}</p>
                    <p className="text-sm text-muted-foreground">
                      Nível {room.host?.level || 1}
                    </p>
                  </div>
                </div>
                <Button onClick={() => handleJoinRoom(room)}>
                  Entrar
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
