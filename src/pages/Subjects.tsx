import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GameCard } from "@/components/ui/game-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { subjects } from "@/data/subjects";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

const Subjects = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "idiomas", name: "🌍 Idiomas", emoji: "🌍", description: t('subjects.categories.languages') },
    { id: "exatas", name: "🔬 Exatas", emoji: "🔬", description: t('subjects.categories.exact') },
    { id: "humanas", name: "📚 Humanas", emoji: "📚", description: t('subjects.categories.humanities') },
    { id: "profissionais", name: "💼 Profissionais", emoji: "💼", description: t('subjects.categories.professional') },
    { id: "criativas", name: "🎨 Criativas", emoji: "🎨", description: t('subjects.categories.creative') },
    { id: "tecnologia", name: "⚡ Tecnologia", emoji: "⚡", description: t('subjects.categories.technology') },
  ];

  const subjectsByCategory = categories.map(category => ({
    ...category,
    subjects: subjects.filter(s => s.category === category.id)
  })).filter(cat => cat.subjects.length > 0);

  const filteredSubjects = selectedCategory === "all" 
    ? subjects 
    : subjects.filter(s => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.backToHome')}
            </Button>
          </Link>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('subjects.title')}{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {t('subjects.subtitle')}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('subjects.description')}
            </p>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-8 h-auto gap-2 bg-card/50 p-2">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t('subjects.all')}
              </TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger 
                  key={cat.id} 
                  value={cat.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1"
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="hidden md:inline">{cat.name.replace(/^[^\s]+\s/, '')}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSubjects.map((subject) => {
                  const Icon = subject.icon;
                  return (
                    <GameCard
                      key={subject.id}
                      variant={subject.variant}
                      className="p-6 hover:cursor-pointer group transition-all hover:scale-105"
                    >
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-background/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform backdrop-blur-sm border border-current/10">
                          <Icon className="h-8 w-8" />
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold mb-2">{subject.name}</h3>
                          <p className="text-current/80 text-sm mb-4">
                            {subject.description}
                          </p>
                          <div className="flex justify-between items-center text-sm text-current/70 mb-4 px-2">
                            <span>{subject.questions} {t('subjects.questions')}</span>
                            <span>{t('subjects.level')}</span>
                          </div>
                        </div>

                        <Link to={`/game/${subject.id}`}>
                          <Button variant="secondary" className="w-full bg-background/20 hover:bg-background/30 backdrop-blur-sm border border-current/10">
                            {t('subjects.playNow')}
                          </Button>
                        </Link>
                      </div>
                    </GameCard>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Subjects;