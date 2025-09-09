import { GameCard } from "@/components/ui/game-card";
import { BookOpen, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card/50 border-t py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <GameCard variant="game" size="sm" className="p-2">
                <BookOpen className="h-6 w-6" />
              </GameCard>
              <div>
                <h3 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  EdGame
                </h3>
                <p className="text-sm text-muted-foreground">Aprenda jogando!</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">
              A plataforma de jogos educativos que transforma o aprendizado 
              em uma experiência divertida e eficaz para estudantes de todas as idades.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Disciplinas</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Matemática</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Português</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Ciências</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">História</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Recursos</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Ranking</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Perfil</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Estatísticas</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Suporte</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            Feito com <Heart className="h-4 w-4 text-red-500" /> pela equipe EdGame
          </p>
          <p className="text-sm mt-2">
            © 2024 EdGame. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;