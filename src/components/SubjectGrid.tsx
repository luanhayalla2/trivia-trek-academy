import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { Calculator, BookOpen, Atom, Clock, Globe, Palette } from "lucide-react";

const subjects = [
  {
    id: 1,
    name: "Matemática",
    icon: Calculator,
    questions: 250,
    color: "text-blue-600",
    description: "Números, equações e geometria"
  },
  {
    id: 2,
    name: "Português",
    icon: BookOpen,
    questions: 200,
    color: "text-green-600",
    description: "Gramática, literatura e redação"
  },
  {
    id: 3,
    name: "Ciências",
    icon: Atom,
    questions: 180,
    color: "text-purple-600",
    description: "Física, química e biologia"
  },
  {
    id: 4,
    name: "História",
    icon: Clock,
    questions: 150,
    color: "text-orange-600",
    description: "Eventos e civilizações"
  },
  {
    id: 5,
    name: "Geografia",
    icon: Globe,
    questions: 140,
    color: "text-teal-600",
    description: "Países, capitais e relevos"
  },
  {
    id: 6,
    name: "Artes",
    icon: Palette,
    questions: 120,
    color: "text-pink-600",
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
                variant="default"
                className="p-6 hover:cursor-pointer group"
              >
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-2">{subject.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {subject.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                      <span>{subject.questions} perguntas</span>
                      <span>Nível: Médio</span>
                    </div>
                  </div>

                  <Button variant="game" className="w-full">
                    Jogar Agora
                  </Button>
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