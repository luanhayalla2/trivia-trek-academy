import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface GameInvite {
  id: string;
  room_id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  expires_at: string;
  sender?: {
    id: string;
    username: string;
    avatar_url: string | null;
    level: number;
  };
  room?: {
    id: string;
    game_id: string;
    status: string;
  };
}

export const useGameInvites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingInvites, setPendingInvites] = useState<GameInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPendingInvites = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('game_invites')
        .select('*')
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Load sender profiles and room info
      if (data && data.length > 0) {
        const senderIds = [...new Set(data.map(i => i.sender_id))];
        const roomIds = [...new Set(data.map(i => i.room_id))];

        const [{ data: profiles }, { data: rooms }] = await Promise.all([
          supabase.from('profiles').select('id, username, avatar_url, level').in('id', senderIds),
          supabase.from('game_rooms').select('id, game_id, status').in('id', roomIds)
        ]);

        const invitesWithData = data.map(invite => ({
          ...invite,
          sender: profiles?.find(p => p.id === invite.sender_id),
          room: rooms?.find(r => r.id === invite.room_id)
        }));

        setPendingInvites(invitesWithData as GameInvite[]);
      } else {
        setPendingInvites([]);
      }
    } catch (error) {
      console.error('Error loading invites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const sendInvite = async (roomId: string, receiverId: string) => {
    if (!user) return { success: false };

    try {
      const { error } = await supabase
        .from('game_invites')
        .insert({
          room_id: roomId,
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Convite enviado!',
        description: 'Aguardando resposta do amigo.'
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false };
    }
  };

  const acceptInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('game_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId);

      if (error) throw error;

      await loadPendingInvites();
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

  const declineInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('game_invites')
        .update({ status: 'declined' })
        .eq('id', inviteId);

      if (error) throw error;

      await loadPendingInvites();
      toast({ title: 'Convite recusado' });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Subscribe to new invites
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('game_invites_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_invites',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New invite:', payload);
          loadPendingInvites();
          toast({
            title: '🎮 Novo convite!',
            description: 'Você recebeu um convite para jogar.'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadPendingInvites, toast]);

  useEffect(() => {
    loadPendingInvites();
  }, [loadPendingInvites]);

  return {
    pendingInvites,
    loading,
    sendInvite,
    acceptInvite,
    declineInvite,
    refreshInvites: loadPendingInvites
  };
};
