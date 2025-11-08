import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { subjects } from "@/data/subjects";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/ui/game-card";
import { ArrowLeft, Sparkles, BookOpen, Video } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Lesson {
  id: string;
  title: string;
  content: string;
  video_url: string | null;
  difficulty: string;
  order_index: number;
}

const difficultyConfig: Record<string, { label: string; color: string; emoji: string }> = {
  facil: { label: "Fácil", color: "success", emoji: "🌱" },
  medio: { label: "Médio", color: "warning", emoji: "🌿" },
  dificil: { label: "Difícil", color: "intellect", emoji: "🎯" },
  avancado: { label: "Avançado", color: "knowledge", emoji: "🚀" },
};

const SubjectDetail = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const subject = subjects.find(s => s.id === subjectId);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLessons = async () => {
      if (!subjectId) return;
      
      try {
        const { data, error } = await supabase
          .from("lessons")
          .select("*")
          .eq("subject_id", subjectId)
          .order("order_index");

        if (error) throw error;
        setLessons(data || []);
      } catch (error) {
        console.error("Error loading lessons:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLessons();
  }, [subjectId]);

  if (!subject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Disciplina não encontrada</h2>
          <Button onClick={() => navigate("/subjects")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar às Disciplinas
          </Button>
        </div>
      </div>
    );
  }

  const Icon = subject.icon;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/subjects")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="max-w-4xl mx-auto">
          <GameCard variant={subject.variant} className="p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Icon className="h-16 w-16" />
              <div>
                <h1 className="text-4xl font-bold mb-2">{subject.name}</h1>
                <p className="text-lg opacity-90">{subject.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-background/20 rounded-lg p-4">
              <Sparkles className="h-6 w-6" />
              <span className="text-lg font-semibold">
                {subject.questions} perguntas disponíveis
              </span>
            </div>
          </GameCard>

          <h2 className="text-2xl font-bold mb-4">Aulas Disponíveis</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <Sparkles className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Carregando aulas...</p>
            </div>
          ) : lessons.length === 0 ? (
            <GameCard className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg text-muted-foreground">
                Nenhuma aula disponível ainda para esta disciplina.
              </p>
            </GameCard>
          ) : (
            <div className="grid gap-4">
              {lessons.map((lesson, index) => {
                const config = difficultyConfig[lesson.difficulty] || difficultyConfig.medio;
                return (
                  <Link
                    key={lesson.id}
                    to={`/lesson/${lesson.id}`}
                  >
                    <GameCard
                      variant={config.color as any}
                      className="p-6 hover:scale-[1.02] transition-transform cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{config.emoji}</span>
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-background/20">
                              {config.label}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold mb-2">
                            Aula {index + 1}: {lesson.title}
                          </h3>
                          <p className="text-sm opacity-80 line-clamp-2">
                            {lesson.content.substring(0, 150)}...
                          </p>
                          {lesson.video_url && (
                            <div className="flex items-center gap-2 mt-2 text-sm">
                              <Video className="h-4 w-4" />
                              <span>Inclui vídeo explicativo</span>
                            </div>
                          )}
                        </div>
                        <Button variant="secondary" size="sm">
                          Estudar
                        </Button>
                      </div>
                    </GameCard>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SubjectDetail;