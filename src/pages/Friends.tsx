import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FriendsPanel from '@/components/FriendsPanel';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const Friends = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">Amigos</h1>
            </div>

            <FriendsPanel />
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Friends;
