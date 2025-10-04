import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Eye, EyeOff, User, GraduationCap, Target, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Register = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Personal Data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Step 2: Education Level
  const [educationLevel, setEducationLevel] = useState("");
  
  // Step 3: Leveling Quiz
  const [quizAnswers, setQuizAnswers] = useState({
    mathKnowledge: "",
    studyFrequency: "",
    mainGoal: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const validateStep1 = () => {
    if (!name || name.length < 2) {
      toast({
        title: "Nome inválido",
        description: "Por favor, insira um nome com pelo menos 2 caracteres.",
        variant: "destructive",
      });
      return false;
    }

    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira seu email.",
        variant: "destructive",
      });
      return false;
    }

    if (!birthDate) {
      toast({
        title: "Data de nascimento obrigatória",
        description: "Por favor, insira sua data de nascimento.",
        variant: "destructive",
      });
      return false;
    }

    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    if (age < 6) {
      toast({
        title: "Idade mínima não atingida",
        description: "É necessário ter pelo menos 6 anos para se cadastrar.",
        variant: "destructive",
      });
      return false;
    }

    if (!password || password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "As senhas digitadas não são iguais.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!educationLevel) {
      toast({
        title: "Selecione seu nível de escolaridade",
        description: "Por favor, escolha uma opção.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!quizAnswers.mathKnowledge || !quizAnswers.studyFrequency || !quizAnswers.mainGoal) {
      toast({
        title: "Complete o quiz",
        description: "Por favor, responda todas as perguntas.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const calculateQuizScore = () => {
    let score = 0;
    
    // Math knowledge: 0-3 points
    const mathScores: Record<string, number> = {
      basic: 0,
      intermediate: 1,
      advanced: 2,
      expert: 3,
    };
    score += mathScores[quizAnswers.mathKnowledge] || 0;
    
    // Study frequency: 0-3 points
    const frequencyScores: Record<string, number> = {
      rarely: 0,
      monthly: 1,
      weekly: 2,
      daily: 3,
    };
    score += frequencyScores[quizAnswers.studyFrequency] || 0;
    
    // Main goal: 0-3 points
    const goalScores: Record<string, number> = {
      reinforcement: 1,
      exam: 2,
      continuous: 3,
      fun: 0,
    };
    score += goalScores[quizAnswers.mainGoal] || 0;
    
    return score;
  };

  const calculateRecommendedLevel = (score: number) => {
    if (score <= 3) return "iniciante";
    if (score <= 6) return "intermediario";
    return "avancado";
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep3()) return;

    setLoading(true);

    try {
      const quizScore = calculateQuizScore();
      const recommendedLevel = calculateRecommendedLevel(quizScore);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: name,
            birth_date: birthDate,
            education_level: educationLevel,
            quiz_score: quizScore,
            recommended_level: recommendedLevel,
          },
        },
      });

      if (authError) {
        toast({
          title: "Erro ao criar conta",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      // Profile will be automatically created by the trigger
      // Additional data is stored in user metadata

      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo ao EdGame! Seu nível recomendado: ${recommendedLevel}`,
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao criar sua conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-growth rounded-full shadow-green-glow">
              {step === 1 && <User className="h-8 w-8 text-white" />}
              {step === 2 && <GraduationCap className="h-8 w-8 text-white" />}
              {step === 3 && <Target className="h-8 w-8 text-white" />}
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Criar Conta - Etapa {step} de 3
          </h1>
          <p className="text-muted-foreground mt-2">
            {step === 1 && "Preencha seus dados pessoais"}
            {step === 2 && "Selecione seu nível de escolaridade"}
            {step === 3 && "Complete o quiz de nivelamento"}
          </p>
          
          {/* Progress bar */}
          <div className="mt-4 max-w-md mx-auto">
            <div className="flex gap-2">
              <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-gradient-knowledge' : 'bg-muted'}`} />
              <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-gradient-knowledge' : 'bg-muted'}`} />
              <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-gradient-knowledge' : 'bg-muted'}`} />
            </div>
          </div>
        </div>

        <Card className="p-6 shadow-elevated bg-card/80 backdrop-blur-sm border-border/50">
          {/* Step 1: Personal Data */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Nome completo *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="bg-background/50 border-border/50 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email *
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

              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-foreground">
                  Data de nascimento *
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Senha *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="bg-background/50 border-border/50 focus:border-primary pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirmar senha *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua senha"
                    className="bg-background/50 border-border/50 focus:border-primary pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                onClick={handleNextStep}
                className="w-full bg-gradient-growth hover:opacity-90 transition-opacity shadow-green-glow"
              >
                Próxima Etapa <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Education Level */}
          {step === 2 && (
            <div className="space-y-6">
              <RadioGroup value={educationLevel} onValueChange={setEducationLevel}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="fundamental" id="fundamental" />
                    <Label htmlFor="fundamental" className="flex-1 cursor-pointer">
                      <div className="font-medium">📚 Ensino Fundamental</div>
                      <div className="text-sm text-muted-foreground">1º ao 9º ano</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="medio" id="medio" />
                    <Label htmlFor="medio" className="flex-1 cursor-pointer">
                      <div className="font-medium">🎓 Ensino Médio</div>
                      <div className="text-sm text-muted-foreground">1º ao 3º ano</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="superior" id="superior" />
                    <Label htmlFor="superior" className="flex-1 cursor-pointer">
                      <div className="font-medium">🏛️ Ensino Superior</div>
                      <div className="text-sm text-muted-foreground">Graduação</div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="pos" id="pos" />
                    <Label htmlFor="pos" className="flex-1 cursor-pointer">
                      <div className="font-medium">🎯 Pós-Graduação</div>
                      <div className="text-sm text-muted-foreground">Especialização, Mestrado, Doutorado</div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button 
                  onClick={handleNextStep}
                  className="flex-1 bg-gradient-growth hover:opacity-90 transition-opacity shadow-green-glow"
                >
                  Próxima Etapa <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Leveling Quiz */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    1. Como você classificaria seu conhecimento em matemática?
                  </Label>
                  <RadioGroup 
                    value={quizAnswers.mathKnowledge} 
                    onValueChange={(value) => setQuizAnswers({...quizAnswers, mathKnowledge: value})}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="basic" id="math-basic" />
                        <Label htmlFor="math-basic" className="flex-1 cursor-pointer">Básico</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="intermediate" id="math-intermediate" />
                        <Label htmlFor="math-intermediate" className="flex-1 cursor-pointer">Intermediário</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="advanced" id="math-advanced" />
                        <Label htmlFor="math-advanced" className="flex-1 cursor-pointer">Avançado</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="expert" id="math-expert" />
                        <Label htmlFor="math-expert" className="flex-1 cursor-pointer">Especialista</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block">
                    2. Com que frequência você estuda?
                  </Label>
                  <RadioGroup 
                    value={quizAnswers.studyFrequency} 
                    onValueChange={(value) => setQuizAnswers({...quizAnswers, studyFrequency: value})}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="rarely" id="freq-rarely" />
                        <Label htmlFor="freq-rarely" className="flex-1 cursor-pointer">Raramente</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="monthly" id="freq-monthly" />
                        <Label htmlFor="freq-monthly" className="flex-1 cursor-pointer">Algumas vezes por mês</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="weekly" id="freq-weekly" />
                        <Label htmlFor="freq-weekly" className="flex-1 cursor-pointer">Semanalmente</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="daily" id="freq-daily" />
                        <Label htmlFor="freq-daily" className="flex-1 cursor-pointer">Diariamente</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block">
                    3. Qual seu objetivo principal no EdGame?
                  </Label>
                  <RadioGroup 
                    value={quizAnswers.mainGoal} 
                    onValueChange={(value) => setQuizAnswers({...quizAnswers, mainGoal: value})}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="reinforcement" id="goal-reinforcement" />
                        <Label htmlFor="goal-reinforcement" className="flex-1 cursor-pointer">Reforço escolar</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="exam" id="goal-exam" />
                        <Label htmlFor="goal-exam" className="flex-1 cursor-pointer">Preparação para vestibular</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="continuous" id="goal-continuous" />
                        <Label htmlFor="goal-continuous" className="flex-1 cursor-pointer">Aprendizado contínuo</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="fun" id="goal-fun" />
                        <Label htmlFor="goal-fun" className="flex-1 cursor-pointer">Diversão educativa</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="button"
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-growth hover:opacity-90 transition-opacity shadow-green-glow"
                >
                  {loading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </div>
            </form>
          )}
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
