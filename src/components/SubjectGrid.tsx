import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { subjects } from "@/data/subjects";

const SubjectGrid = () => {
  // Group subjects by category
  const categories = [
    { id: "idiomas", name: "🌍 Idiomas", emoji: "🌍" },
    { id: "exatas", name: "🔬 Exatas", emoji: "🔬" },
    { id: "humanas", name: "📚 Humanas", emoji: "📚" },
    { id: "profissionais", name: "💼 Profissionais", emoji: "💼" },
    { id: "criativas", name: "🎨 Criativas", emoji: "🎨" },
    { id: "tecnologia", name: "⚡ Tecnologia", emoji: "⚡" },
  ];

  const subjectsByCategory = categories.map(category => ({
    ...category,
    subjects: subjects.filter(s => s.category === category.id).slice(0, 4)
  })).filter(cat => cat.subjects.length > 0);

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explore o{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Universo do Conhecimento
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Mais de 30 disciplinas organizadas em 6 categorias. Escolha sua jornada de aprendizado!
          </p>
        </div>

        {subjectsByCategory.map((category) => (
          <div key={category.id} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-2xl font-bold">{category.name}</h3>
              <Link to="/subjects">
                <Button variant="ghost" size="sm">
                  Ver todas →
                </Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {category.subjects.map((subject) => {
                const Icon = subject.icon;
                return (
                  <GameCard
                    key={subject.id}
                    variant={subject.variant}
                    className="p-6 hover:cursor-pointer group"
                  >
                    <div className="text-center space-y-4">
                      <div className="mx-auto w-16 h-16 bg-background/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform backdrop-blur-sm">
                        <Icon className="h-8 w-8" />
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold mb-2">{subject.name}</h3>
                        <p className="text-current/80 text-sm mb-4">
                          {subject.description}
                        </p>
                        <div className="flex justify-between items-center text-sm text-current/70 mb-4">
                          <span>{subject.questions} perguntas</span>
                          <span>Nível: Médio</span>
                        </div>
                      </div>

                      <Link to={`/subjects/${subject.id}`}>
                        <Button variant="secondary" className="w-full bg-background/20 hover:bg-background/30 backdrop-blur-sm">
                          Explorar Níveis
                        </Button>
                      </Link>
                    </div>
                  </GameCard>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SubjectGrid;