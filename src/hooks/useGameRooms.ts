import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface GameRoom {
  id: string;
  game_id: string;
  host_id: string;
  guest_id: string | null;
  status: 'waiting' | 'playing' | 'finished';
  game_state: Record<string, any>;
  current_turn: string | null;
  winner_id: string | null;
  created_at: string;
  updated_at: string;
  host?: {
    id: string;
    username: string;
    avatar_url: string | null;
    level: number;
  };
  guest?: {
    id: string;
    username: string;
    avatar_url: string | null;
    level: number;
  };
}

export const useGameRooms = (gameId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRooms = useCallback(async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('game_rooms')
        .select('*')
        .or(`host_id.eq.${user.id},guest_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (gameId) {
        query = query.eq('game_id', gameId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Load host and guest profiles
      const hostIds = [...new Set(data?.map(r => r.host_id) || [])];
      const guestIds = [...new Set(data?.filter(r => r.guest_id).map(r => r.guest_id!) || [])];
      const allIds = [...new Set([...hostIds, ...guestIds])];

      if (allIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, level')
          .in('id', allIds);

        const roomsWithProfiles = data?.map(room => ({
          ...room,
          host: profiles?.find(p => p.id === room.host_id),
          guest: room.guest_id ? profiles?.find(p => p.id === room.guest_id) : undefined
        })) || [];

        setRooms(roomsWithProfiles as GameRoom[]);
      } else {
        setRooms(data as GameRoom[] || []);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  }, [user, gameId]);

  const createRoom = async (gameId: string, initialState?: Record<string, any>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('game_rooms')
        .insert({
          game_id: gameId,
          host_id: user.id,
          status: 'waiting',
          game_state: initialState || {},
          current_turn: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Sala criada!',
        description: 'Convide um amigo para jogar.'
      });

      await loadRooms();
      return data as GameRoom;
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('game_rooms')
        .update({
          guest_id: user.id,
          status: 'playing'
        })
        .eq('id', roomId)
        .eq('status', 'waiting')
        .select()
        .single();

      if (error) throw error;

      // Load profiles for the room
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, level')
        .in('id', [data.host_id, user.id]);

      const roomWithProfiles: GameRoom = {
        ...data,
        host: profiles?.find(p => p.id === data.host_id),
        guest: profiles?.find(p => p.id === user.id)
      };

      toast({
        title: 'Entrou na sala!',
        description: 'O jogo vai começar.'
      });

      setCurrentRoom(roomWithProfiles);
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }
  };

  const updateGameState = async (roomId: string, gameState: Record<string, any>, nextTurn?: string) => {
    try {
      const updateData: Record<string, any> = { game_state: gameState };
      if (nextTurn) {
        updateData.current_turn = nextTurn;
      }

      const { error } = await supabase
        .from('game_rooms')
        .update(updateData)
        .eq('id', roomId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating game state:', error);
      return false;
    }
  };

  const endGame = async (roomId: string, winnerId: string | null) => {
    try {
      const { error } = await supabase
        .from('game_rooms')
        .update({
          status: 'finished',
          winner_id: winnerId
        })
        .eq('id', roomId);

      if (error) throw error;

      toast({
        title: winnerId ? 'Jogo finalizado!' : 'Empate!',
        description: winnerId === user?.id ? 'Você venceu!' : winnerId ? 'Você perdeu!' : 'Ninguém venceu dessa vez.'
      });

      return true;
    } catch (error) {
      console.error('Error ending game:', error);
      return false;
    }
  };

  const leaveRoom = async (roomId: string) => {
    if (!user) return;

    try {
      const room = rooms.find(r => r.id === roomId) || currentRoom;
      if (!room) return;

      if (room.host_id === user.id) {
        // Host leaves - delete the room
        await supabase.from('game_rooms').delete().eq('id', roomId);
      } else {
        // Guest leaves
        await supabase
          .from('game_rooms')
          .update({ guest_id: null, status: 'waiting' })
          .eq('id', roomId);
      }

      setCurrentRoom(null);
      await loadRooms();
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  // Subscribe to room changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('game_rooms_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rooms'
        },
        async (payload) => {
          console.log('Room update:', payload);
          loadRooms();
          
          // Update current room if it's the one that changed
          if (currentRoom && payload.new && (payload.new as any).id === currentRoom.id) {
            const updatedRoom = payload.new as any;
            
            // Load profiles if needed
            if (updatedRoom.guest_id && !currentRoom.guest) {
              const { data: profiles } = await supabase
                .from('profiles')
                .select('id, username, avatar_url, level')
                .in('id', [updatedRoom.host_id, updatedRoom.guest_id].filter(Boolean));

              setCurrentRoom({
                ...updatedRoom,
                status: updatedRoom.status as GameRoom['status'],
                host: profiles?.find(p => p.id === updatedRoom.host_id),
                guest: updatedRoom.guest_id ? profiles?.find(p => p.id === updatedRoom.guest_id) : undefined
              });
            } else {
              setCurrentRoom({
                ...updatedRoom,
                status: updatedRoom.status as GameRoom['status'],
                host: currentRoom.host,
                guest: currentRoom.guest
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentRoom, loadRooms]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  return {
    rooms,
    currentRoom,
    setCurrentRoom,
    loading,
    createRoom,
    joinRoom,
    updateGameState,
    endGame,
    leaveRoom,
    refreshRooms: loadRooms
  };
};
