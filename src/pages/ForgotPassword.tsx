import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { BookOpen, ArrowLeft, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira seu email.",
        variant: "destructive",
      });
      return;
    }

    // Simulação de envio de email
    toast({
      title: "Email enviado!",
      description: "Verifique sua caixa de entrada para redefinir sua senha.",
    });
    
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-wisdom rounded-full shadow-glow">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Esqueceu sua senha?
          </h1>
          <p className="text-muted-foreground mt-2">
            {isSubmitted 
              ? "Email de recuperação enviado!" 
              : "Insira seu email para receber instruções de recuperação"
            }
          </p>
        </div>

        <Card className="p-6 shadow-elevated bg-card/80 backdrop-blur-sm border-border/50">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="bg-background/50 border-border/50 focus:border-primary"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-wisdom hover:opacity-90 transition-opacity shadow-glow"
              >
                Enviar instruções
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-gradient-growth/10 rounded-lg border border-primary/20">
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-foreground mb-2">
                  Verifique seu email
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enviamos instruções para <strong>{email}</strong>. 
                  Verifique sua caixa de entrada e spam.
                </p>
              </div>
              
              <Button 
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="w-full"
              >
                Tentar outro email
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Lembrou da senha?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </Card>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;