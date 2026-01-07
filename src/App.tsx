import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AchievementProvider } from "./contexts/AchievementContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Subjects from "./pages/Subjects";
import Game from "./pages/Game";
import Profile from "./pages/Profile";
import Ranking from "./pages/Ranking";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import LessonFlow from "./pages/LessonFlow";
import SubjectDetail from "./pages/SubjectDetail";
import Shop from "./pages/Shop";
import Checkout from "./pages/Checkout";
import Chatbot from "./components/Chatbot";
import EducaGame from "./pages/EducaGame";
import Friends from "./pages/Friends";
import { GameInviteNotification } from "./components/GameInviteNotification";
import { GlobalAchievementNotification } from "./components/GlobalAchievementNotification";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <AchievementProvider>
              <Chatbot />
              <GameInviteNotification />
              <GlobalAchievementNotification />
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
                <Route path="/subjects/:subjectId" element={<ProtectedRoute><SubjectDetail /></ProtectedRoute>} />
                <Route path="/lesson/:subjectId/:difficulty" element={<ProtectedRoute><LessonFlow /></ProtectedRoute>} />
                <Route path="/game/:subjectId" element={<ProtectedRoute><Game /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
                <Route path="/educa-game" element={<ProtectedRoute><EducaGame /></ProtectedRoute>} />
                <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AchievementProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
