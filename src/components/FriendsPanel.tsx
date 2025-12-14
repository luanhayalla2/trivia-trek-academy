import { useState } from 'react';
import { useFriendships, Friend, FriendRequest } from '@/hooks/useFriendships';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Search, 
  Check, 
  X, 
  Gamepad2,
  Clock,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface FriendsPanelProps {
  onInviteToGame?: (friendId: string) => void;
  showGameInvite?: boolean;
}

const FriendsPanel = ({ onInviteToGame, showGameInvite }: FriendsPanelProps) => {
  const { user } = useAuth();
  const {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    searchUsers
  } = useFriendships();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setSearching(true);
    const results = await searchUsers(searchQuery);
    
    // Filter out existing friends and pending requests
    const friendIds = friends.map(f => f.id);
    const sentIds = sentRequests.map(r => r.addressee_id);
    const pendingIds = pendingRequests.map(r => r.requester_id);
    
    const filtered = results.filter(r => 
      !friendIds.includes(r.id) && 
      !sentIds.includes(r.id) && 
      !pendingIds.includes(r.id)
    );
    
    setSearchResults(filtered);
    setSearching(false);
  };

  if (!user) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center text-muted-foreground">
          Faça login para ver seus amigos
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Amigos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Amigos</span>
              {friends.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                  {friends.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Pedidos</span>
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 justify-center">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Adicionar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-4 space-y-2">
            {friends.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Você ainda não tem amigos. Adicione alguns!
              </p>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={friend.avatar_url || undefined} />
                      <AvatarFallback>
                        {friend.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{friend.username}</p>
                      <p className="text-xs text-muted-foreground">
                        Nível {friend.level}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {showGameInvite && onInviteToGame && (
                      <Button
                        size="sm"
                        onClick={() => onInviteToGame(friend.id)}
                        className="gap-1"
                      >
                        <Gamepad2 className="h-4 w-4" />
                        Convidar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFriend(friend.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-4 space-y-4">
            {pendingRequests.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Pedidos recebidos
                </h4>
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={request.requester?.avatar_url || undefined} />
                        <AvatarFallback>
                          {request.requester?.username?.slice(0, 2).toUpperCase() || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.requester?.username}</p>
                        <p className="text-xs text-muted-foreground">
                          Nível {request.requester?.level}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => acceptFriendRequest(request.id)}
                        className="gap-1"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => rejectFriendRequest(request.id)}
                        className="text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sentRequests.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Pedidos enviados
                </h4>
                {sentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Aguardando resposta...</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pendingRequests.length === 0 && sentRequests.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Nenhum pedido de amizade
              </p>
            )}
          </TabsContent>

          <TabsContent value="add" className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por nome de usuário..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={result.avatar_url || undefined} />
                        <AvatarFallback>
                          {result.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{result.username}</p>
                        <p className="text-xs text-muted-foreground">
                          Nível {result.level}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => sendFriendRequest(result.id)}
                      className="gap-1"
                    >
                      <UserPlus className="h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
              <p className="text-center text-muted-foreground py-4">
                Nenhum usuário encontrado
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FriendsPanel;
