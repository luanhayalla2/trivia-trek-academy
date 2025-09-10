import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { Calculator, BookOpen, Atom, Clock, Globe, Palette, Languages, Code, Music, Dumbbell, Brain, Users, Microscope, Zap, Leaf } from "lucide-react";
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
    id: "ingles",
    name: "Inglês",
    icon: Languages,
    questions: 180,
    variant: "knowledge" as const,
    description: "Vocabulário, gramática e conversação"
  },
  {
    id: "espanhol",
    name: "Espanhol", 
    icon: Languages,
    questions: 160,
    variant: "subject" as const,
    description: "Vocabulário e cultura hispânica"
  },
  {
    id: "frances",
    name: "Francês",
    icon: Languages,
    questions: 140,
    variant: "wisdom" as const,
    description: "Língua francesa e cultura"
  },
  {
    id: "fisica",
    name: "Física", 
    icon: Zap,
    questions: 200,
    variant: "knowledge" as const,
    description: "Movimento, energia e universo"
  },
  {
    id: "quimica",
    name: "Química",
    icon: Atom,
    questions: 190,
    variant: "wisdom" as const,
    description: "Elementos, reações e moléculas"
  },
  {
    id: "biologia",
    name: "Biologia",
    icon: Leaf,
    questions: 185,
    variant: "growth" as const,
    description: "Vida, células e ecossistemas"
  },
  {
    id: "historia",
    name: "História",
    icon: Clock,
    questions: 175,
    variant: "warning" as const,
    description: "Eventos e civilizações"
  },
  {
    id: "geografia",
    name: "Geografia",
    icon: Globe,
    questions: 165,
    variant: "success" as const,
    description: "Países, capitais e relevos"
  },
  {
    id: "filosofia",
    name: "Filosofia",
    icon: Brain,
    questions: 150,
    variant: "wisdom" as const,
    description: "Pensamento crítico e reflexão"
  },
  {
    id: "sociologia",
    name: "Sociologia",
    icon: Users,
    questions: 140,
    variant: "growth" as const,
    description: "Sociedade e relações humanas"
  },
  {
    id: "artes",
    name: "Artes",
    icon: Palette,
    questions: 130,
    variant: "subject" as const,
    description: "Cultura e expressões artísticas"
  },
  {
    id: "musica",
    name: "Música",
    icon: Music,
    questions: 120,
    variant: "warning" as const,
    description: "Teoria musical e história"
  },
  {
    id: "educacao-fisica",
    name: "Educação Física",
    icon: Dumbbell,
    questions: 110,
    variant: "success" as const,
    description: "Esportes, saúde e movimento"
  },
  {
    id: "informatica",
    name: "Informática",
    icon: Code,
    questions: 200,
    variant: "knowledge" as const,
    description: "Programação, algoritmos e tecnologia"
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
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