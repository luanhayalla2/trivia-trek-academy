import { useParams, useNavigate, Link } from "react-router-dom";
import { subjects } from "@/data/subjects";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/ui/game-card";
import { ArrowLeft, Lock, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const difficultyLevels = [
  { id: "facil", label: "🌱 Fácil", desc: "Conceitos básicos", color: "success" },
  { id: "medio", label: "🌿 Médio", desc: "Aplicação prática", color: "warning" },
  { id: "dificil", label: "🎯 Difícil", desc: "Desafios complexos", color: "intellect" },
  { id: "avancado", label: "🚀 Avançado", desc: "Nível especialista", color: "knowledge" },
];

const SubjectDetail = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const subject = subjects.find(s => s.id === subjectId);

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

          <h2 className="text-2xl font-bold mb-4">Escolha o Nível de Dificuldade</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {difficultyLevels.map((level) => (
              <Link
                key={level.id}
                to={`/lesson/${subjectId}/${level.id}`}
              >
                <GameCard
                  variant={level.color as any}
                  className="p-6 hover:scale-105 transition-transform cursor-pointer h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{level.label}</h3>
                      <p className="text-sm opacity-80">{level.desc}</p>
                    </div>
                    {level.id === "avancado" && (
                      <Lock className="h-5 w-5 opacity-50" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-semibold">Recompensas:</span>
                      <div className="flex gap-2 mt-1">
                        <span>💎 {level.id === "facil" ? "5" : level.id === "medio" ? "10" : level.id === "dificil" ? "20" : "30"}</span>
                        <span>⭐ {level.id === "facil" ? "10" : level.id === "medio" ? "20" : level.id === "dificil" ? "40" : "60"} XP</span>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">
                      Iniciar
                    </Button>
                  </div>
                </GameCard>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SubjectDetail;