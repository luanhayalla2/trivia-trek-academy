import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { subjects } from "@/data/subjects";

const Subjects = () => {
  // Group subjects by category
  const categories = [
    { id: "idiomas", name: "🌍 Idiomas", description: "Domine novos idiomas e culturas" },
    { id: "exatas", name: "🔬 Exatas", description: "Ciências exatas e raciocínio lógico" },
    { id: "humanas", name: "📚 Humanas", description: "Sociedade, cultura e pensamento" },
    { id: "profissionais", name: "💼 Profissionais", description: "Conhecimentos para sua carreira" },
    { id: "criativas", name: "🎨 Criativas", description: "Arte, design e expressão" },
    { id: "tecnologia", name: "⚡ Tecnologia", description: "Inovação e conhecimento aplicado" },
  ];

  const subjectsByCategory = categories.map(category => ({
    ...category,
    subjects: subjects.filter(s => s.category === category.id)
  })).filter(cat => cat.subjects.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-12">
            <Link to="/">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
            
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Todas as{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Disciplinas
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Mais de 30 disciplinas para você explorar. Escolha sua área favorita e comece sua jornada!
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map(cat => (
                  <Badge key={cat.id} variant="secondary" className="text-sm">
                    {cat.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {subjectsByCategory.map((category) => (
            <div key={category.id} className="mb-16">
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">{category.name}</h2>
                <p className="text-muted-foreground">{category.description}</p>
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
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Subjects;