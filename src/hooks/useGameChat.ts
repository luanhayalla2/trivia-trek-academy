import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface GameMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export const useGameChat = (roomId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GameMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    if (!roomId || !user) return;

    try {
      const { data, error } = await supabase
        .from('game_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Load sender profiles
      if (data && data.length > 0) {
        const senderIds = [...new Set(data.map(m => m.sender_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', senderIds);

        const messagesWithSenders = data.map(msg => ({
          ...msg,
          sender: profiles?.find(p => p.id === msg.sender_id)
        }));

        setMessages(messagesWithSenders as GameMessage[]);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId, user]);

  const sendMessage = async (message: string) => {
    if (!user || !roomId || !message.trim()) return false;

    try {
      const { error } = await supabase
        .from('game_messages')
        .insert({
          room_id: roomId,
          sender_id: user.id,
          message: message.trim()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  // Subscribe to new messages
  useEffect(() => {
    if (!roomId || !user) return;

    const channel = supabase
      .channel(`game_messages_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          const newMsg = payload.new as any;
          
          // Load sender profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', newMsg.sender_id)
            .single();

          const messageWithSender: GameMessage = {
            ...newMsg,
            sender: profile
          };

          setMessages(prev => [...prev, messageWithSender]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, user]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    loading,
    sendMessage,
    refreshMessages: loadMessages
  };
};
