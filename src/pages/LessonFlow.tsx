import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/ui/game-card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Sparkles, Trophy } from "lucide-react";
import { subjects } from "@/data/subjects";

type Difficulty = "facil" | "medio" | "dificil" | "avancado";

interface Lesson {
  id: string;
  title: string;
  content: string;
  difficulty: Difficulty;
}

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  time_limit: number;
  difficulty: Difficulty;
}

const difficultyConfig = {
  facil: { gems: 5, xp: 10, label: "🌱 Fácil", color: "success" },
  medio: { gems: 10, xp: 20, label: "🌿 Médio", color: "warning" },
  dificil: { gems: 20, xp: 40, label: "🎯 Difícil", color: "intellect" },
  avancado: { gems: 30, xp: 60, label: "🚀 Avançado", color: "knowledge" },
};

const LessonFlow = () => {
  const { subjectId, difficulty } = useParams<{ subjectId: string; difficulty: Difficulty }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showLesson, setShowLesson] = useState(true);
  const [loading, setLoading] = useState(true);

  const subject = subjects.find(s => s.id === subjectId);
  const diffConfig = difficultyConfig[difficulty as Difficulty];

  useEffect(() => {
    loadLessonAndQuestion();
  }, [subjectId, difficulty]);

  useEffect(() => {
    if (!showLesson && timeLeft > 0 && !showExplanation) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0 && !showExplanation) {
      handleAnswer(null);
    }
  }, [timeLeft, showLesson, showExplanation]);

  const loadLessonAndQuestion = async () => {
    try {
      // Load lesson
      const { data: lessonData } = await supabase
        .from("lessons")
        .select("*")
        .eq("subject_id", subjectId)
        .eq("difficulty", difficulty)
        .order("order_index")
        .limit(1)
        .single();

      if (lessonData) {
        setLesson(lessonData);
        
        // Load question for this lesson
        const { data: questionData } = await supabase
          .from("questions")
          .select("*")
          .eq("lesson_id", lessonData.id)
          .limit(1)
          .single();

        if (questionData) {
          setQuestion({
            ...questionData,
            options: questionData.options as unknown as string[]
          });
          setTimeLeft(questionData.time_limit);
        }
      }
    } catch (error) {
      console.error("Error loading lesson:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a aula. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answerIndex: number | null) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    const isCorrect = answerIndex === question?.correct_answer;
    
    // Update user progress
    if (user && lesson) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        const newGems = profile.gems + (isCorrect ? diffConfig.gems : 0);
        const newXp = profile.xp + (isCorrect ? diffConfig.xp : 0);
        const newStreak = isCorrect ? profile.current_streak + 1 : 0;

        await supabase
          .from("profiles")
          .update({
            gems: newGems,
            xp: newXp,
            total_xp: profile.total_xp + (isCorrect ? diffConfig.xp : 0),
            current_streak: newStreak,
            best_streak: Math.max(profile.best_streak, newStreak),
            questions_answered: profile.questions_answered + 1,
          })
          .eq("id", user.id);

        // Save progress
        await supabase
          .from("user_progress")
          .upsert({
            user_id: user.id,
            lesson_id: lesson.id,
            completed: isCorrect,
            score: isCorrect ? 100 : 0,
            time_taken: question!.time_limit - timeLeft,
            completed_at: new Date().toISOString(),
          });
      }
    }

    toast({
      title: isCorrect ? "🎉 Correto!" : "❌ Incorreto",
      description: isCorrect 
        ? `+${diffConfig.gems} gemas, +${diffConfig.xp} XP`
        : "Tente novamente em outra aula!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-lg">Carregando aula...</p>
        </div>
      </div>
    );
  }

  if (!lesson || !question) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <GameCard className="max-w-md text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Aula não encontrada</h2>
          <p className="text-muted-foreground mb-6">
            Ainda não há conteúdo disponível para esta disciplina e dificuldade.
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </GameCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        {showLesson ? (
          <GameCard variant={diffConfig.color as any} className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
              <p className="text-lg opacity-90">{diffConfig.label}</p>
            </div>

            <div className="bg-background/20 rounded-lg p-6 mb-8">
              <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {lesson.content}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowLesson(false)}
              className="w-full"
              size="lg"
            >
              Fazer Pergunta
            </Button>
          </GameCard>
        ) : (
          <GameCard variant={diffConfig.color as any} className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{subject?.name}</h2>
              <div className="flex items-center gap-2 text-lg font-bold">
                <Clock className="h-5 w-5" />
                {timeLeft}s
              </div>
            </div>

            <Progress
              value={(timeLeft / question.time_limit) * 100}
              className="mb-6"
            />

            <div className="bg-background/20 rounded-lg p-6 mb-6">
              <p className="text-xl font-semibold mb-6">{question.question_text}</p>

              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !showExplanation && handleAnswer(index)}
                    disabled={showExplanation}
                    className={`w-full p-4 rounded-lg text-left transition-all ${
                      showExplanation
                        ? index === question.correct_answer
                          ? "bg-green-500/20 border-2 border-green-500"
                          : index === selectedAnswer
                          ? "bg-red-500/20 border-2 border-red-500"
                          : "bg-background/40"
                        : "bg-background/40 hover:bg-background/60 hover:scale-105"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {showExplanation && (
              <div className="bg-background/20 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Explicação
                </h3>
                <p className="leading-relaxed">{question.explanation}</p>
              </div>
            )}

            {showExplanation && (
              <div className="flex gap-4">
                <Button
                  onClick={() => navigate(`/subjects/${subjectId}`)}
                  className="flex-1"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Concluir
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="secondary"
                  className="flex-1"
                >
                  Próxima Aula
                </Button>
              </div>
            )}
          </GameCard>
        )}
      </div>
    </div>
  );
};

export default LessonFlow;