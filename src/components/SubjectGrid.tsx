import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { Calculator, BookOpen, Atom, Clock, Globe, Palette } from "lucide-react";
import { Link } from "react-router-dom";

const subjects = [
  {
    id: "matematica",
    name: "Matemática",
    icon: Calculator,
    questions: 250,
    variant: "knowledge" as const,
    description: "Números, equações e geometria"
  },
  {
    id: "portugues", 
    name: "Português",
    icon: BookOpen,
    questions: 200,
    variant: "growth" as const,
    description: "Gramática, literatura e redação"
  },
  {
    id: "ciencias",
    name: "Ciências", 
    icon: Atom,
    questions: 180,
    variant: "wisdom" as const,
    description: "Física, química e biologia"
  },
  {
    id: "historia",
    name: "História",
    icon: Clock,
    questions: 150,
    variant: "warning" as const,
    description: "Eventos e civilizações"
  },
  {
    id: "geografia",
    name: "Geografia",
    icon: Globe,
    questions: 140,
    variant: "success" as const,
    description: "Países, capitais e relevos"
  },
  {
    id: "artes",
    name: "Artes",
    icon: Palette,
    questions: 120,
    variant: "subject" as const,
    description: "Cultura e expressões artísticas"
  }
];

const SubjectGrid = () => {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Escolha sua{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Disciplina
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore diferentes áreas do conhecimento e teste seus conhecimentos 
            com perguntas desafiadoras e divertidas!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {subjects.map((subject) => {
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

                  <Link to={`/game/${subject.id}`}>
                    <Button variant="secondary" className="w-full bg-background/20 hover:bg-background/30 backdrop-blur-sm">
                      Jogar Agora
                    </Button>
                  </Link>
                </div>
              </GameCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SubjectGrid;