import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Friend {
  id: string;
  username: string;
  avatar_url: string | null;
  level: number;
  status: 'online' | 'offline' | 'in_game';
}

export interface FriendRequest {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  created_at: string;
  requester?: {
    id: string;
    username: string;
    avatar_url: string | null;
    level: number;
  };
  addressee?: {
    id: string;
    username: string;
    avatar_url: string | null;
    level: number;
  };
}

export const useFriendships = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFriendships = async () => {
    if (!user) return;
    
    try {
      // Load accepted friendships
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;

      // Get friend IDs
      const friendIds = friendships?.map(f => 
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      ) || [];

      // Load friend profiles
      if (friendIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, level')
          .in('id', friendIds);

        if (profilesError) throw profilesError;

        setFriends(profiles?.map(p => ({
          ...p,
          status: 'offline' as const
        })) || []);
      } else {
        setFriends([]);
      }

      // Load pending requests (received)
      const { data: pending, error: pendingError } = await supabase
        .from('friendships')
        .select('*')
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Get requester profiles for pending requests
      if (pending && pending.length > 0) {
        const requesterIds = pending.map(p => p.requester_id);
        const { data: requesterProfiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, level')
          .in('id', requesterIds);

        const pendingWithProfiles = pending.map(p => ({
          ...p,
          requester: requesterProfiles?.find(rp => rp.id === p.requester_id)
        }));
        setPendingRequests(pendingWithProfiles as FriendRequest[]);
      } else {
        setPendingRequests([]);
      }

      // Load sent requests
      const { data: sent, error: sentError } = await supabase
        .from('friendships')
        .select('*')
        .eq('requester_id', user.id)
        .eq('status', 'pending');

      if (sentError) throw sentError;
      setSentRequests(sent as FriendRequest[] || []);

    } catch (error) {
      console.error('Error loading friendships:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (addresseeId: string) => {
    if (!user) return { success: false };

    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: addresseeId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Solicitação enviada!',
        description: 'Aguardando resposta do jogador.'
      });

      await loadFriendships();
      return { success: true };
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível enviar a solicitação.',
        variant: 'destructive'
      });
      return { success: false };
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: 'Amizade aceita!',
        description: 'Vocês agora são amigos e podem jogar juntos.'
      });

      await loadFriendships();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const rejectFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'rejected' })
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: 'Solicitação recusada'
      });

      await loadFriendships();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${user.id})`);

      if (error) throw error;

      toast({
        title: 'Amigo removido'
      });

      await loadFriendships();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const searchUsers = async (query: string) => {
    if (!user || query.length < 2) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, level')
        .neq('id', user.id)
        .ilike('username', `%${query}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  useEffect(() => {
    loadFriendships();
  }, [user]);

  return {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    searchUsers,
    refreshFriendships: loadFriendships
  };
};
