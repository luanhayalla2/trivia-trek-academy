import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, BookOpen, Atom, Clock, Globe, Palette, ArrowLeft, Play, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const subjects = [
  {
    id: "matematica",
    name: "Matemática",
    icon: Calculator,
    questions: 250,
    color: "text-blue-600",
    description: "Números, equações e geometria",
    difficulty: "Médio",
    avgTime: "45s",
    topScore: 2450,
    topics: ["Aritmética", "Álgebra", "Geometria", "Estatística"]
  },
  {
    id: "portugues",
    name: "Português",
    icon: BookOpen,
    questions: 200,
    color: "text-green-600",
    description: "Gramática, literatura e redação",
    difficulty: "Fácil",
    avgTime: "35s",
    topScore: 1890,
    topics: ["Gramática", "Literatura", "Interpretação", "Ortografia"]
  },
  {
    id: "ciencias",
    name: "Ciências",
    icon: Atom,
    questions: 180,
    color: "text-purple-600",
    description: "Física, química e biologia",
    difficulty: "Difícil",
    avgTime: "60s",
    topScore: 3200,
    topics: ["Física", "Química", "Biologia", "Astronomia"]
  },
  {
    id: "historia",
    name: "História",
    icon: Clock,
    questions: 150,
    color: "text-orange-600",
    description: "Eventos e civilizações",
    difficulty: "Médio",
    avgTime: "50s",
    topScore: 2100,
    topics: ["Brasil", "Mundial", "Antiguidade", "Moderna"]
  },
  {
    id: "geografia",
    name: "Geografia",
    icon: Globe,
    questions: 140,
    color: "text-teal-600",
    description: "Países, capitais e relevos",
    difficulty: "Fácil",
    avgTime: "40s",
    topScore: 1750,
    topics: ["Física", "Humana", "Brasil", "Mundial"]
  },
  {
    id: "artes",
    name: "Artes",
    icon: Palette,
    questions: 120,
    color: "text-pink-600",
    description: "Cultura e expressões artísticas",
    difficulty: "Médio",
    avgTime: "45s",
    topScore: 1950,
    topics: ["Pintura", "Música", "Teatro", "Dança"]
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Fácil": return "bg-success/10 text-success border-success/20";
    case "Médio": return "bg-warning/10 text-warning border-warning/20";
    case "Difícil": return "bg-destructive/10 text-destructive border-destructive/20";
    default: return "bg-muted text-muted-foreground";
  }
};

const Subjects = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Escolha sua{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Aventura
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Selecione uma disciplina e teste seus conhecimentos com perguntas 
              desafiadoras. Cada matéria oferece uma experiência única de aprendizado!
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {subjects.map((subject) => {
            const Icon = subject.icon;
            return (
              <GameCard
                key={subject.id}
                variant="default"
                className="p-6 hover:cursor-pointer group h-full"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <Badge className={getDifficultyColor(subject.difficulty)}>
                      {subject.difficulty}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{subject.name}</h3>
                    <p className="text-muted-foreground mb-4">
                      {subject.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Perguntas</span>
                      <span className="font-semibold">{subject.questions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tempo médio</span>
                      <span className="font-semibold">{subject.avgTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        Recorde
                      </span>
                      <span className="font-semibold text-primary">{subject.topScore} pts</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Tópicos:</p>
                    <div className="flex flex-wrap gap-2">
                      {subject.topics.map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Link to={`/game/${subject.id}`}>
                    <Button variant="game" className="w-full text-lg py-6">
                      <Play className="h-5 w-5 mr-2" />
                      Jogar {subject.name}
                    </Button>
                  </Link>
                </div>
              </GameCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Subjects;