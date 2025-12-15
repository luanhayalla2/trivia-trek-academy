-- Create game_invites table for friend invitations to games
CREATE TABLE public.game_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '5 minutes')
);

-- Enable RLS
ALTER TABLE public.game_invites ENABLE ROW LEVEL SECURITY;

-- RLS policies for game_invites
CREATE POLICY "Users can view invites they're part of"
ON public.game_invites FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create invites"
ON public.game_invites FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update invites they received"
ON public.game_invites FOR UPDATE
USING (auth.uid() = receiver_id);

CREATE POLICY "Senders can delete their invites"
ON public.game_invites FOR DELETE
USING (auth.uid() = sender_id);

-- Create game_messages table for in-game chat
CREATE TABLE public.game_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for game_messages (only players in the room can see/send messages)
CREATE POLICY "Players can view messages in their rooms"
ON public.game_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.game_rooms 
    WHERE id = room_id 
    AND (host_id = auth.uid() OR guest_id = auth.uid())
  )
);

CREATE POLICY "Players can send messages in their rooms"
ON public.game_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.game_rooms 
    WHERE id = room_id 
    AND (host_id = auth.uid() OR guest_id = auth.uid())
  )
);

-- Enable realtime for game_invites and game_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_invites;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_messages;