import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/ui/game-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Trophy, Pause, X, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Dados de exemplo das perguntas por disciplina
const questionsDB = {
  matematica: [
    {
      id: 1,
      question: "Quanto é 15 + 28?",
      options: ["43", "41", "45", "42"],
      correct: 0,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Qual é a raiz quadrada de 64?",
      options: ["6", "8", "10", "7"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "Se x + 5 = 12, qual é o valor de x?",
      options: ["7", "6", "8", "5"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "Qual é o resultado de 3² + 4²?",
      options: ["25", "24", "26", "23"],
      correct: 0,
      difficulty: "hard"
    },
    {
      id: 5,
      question: "Quanto é 144 ÷ 12?",
      options: ["11", "13", "12", "10"],
      correct: 2,
      difficulty: "easy"
    }
  ],
  portugues: [
    {
      id: 1,
      question: "Qual é o plural de 'cidadão'?",
      options: ["cidadãos", "cidadões", "cidadães", "cidadans"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 2,
      question: "Qual figura de linguagem está presente em 'Ela é uma flor'?",
      options: ["Metáfora", "Metonímia", "Hipérbole", "Ironia"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "Complete: 'Eu _____ estudando português'",
      options: ["estava", "estava", "estive", "estou"],
      correct: 3,
      difficulty: "easy"
    },
    {
      id: 4,
      question: "Qual é o sujeito da frase: 'Os alunos estudaram muito'?",
      options: ["estudaram", "muito", "Os alunos", "alunos"],
      correct: 2,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "Qual é o aumentativo de 'casa'?",
      options: ["casinha", "casarão", "casita", "casona"],
      correct: 1,
      difficulty: "easy"
    }
  ],
  ingles: [
    {
      id: 1,
      question: "What is the past tense of 'go'?",
      options: ["goed", "went", "gone", "going"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Which article goes with 'university'?",
      options: ["a", "an", "the", "no article"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "What does 'library' mean?",
      options: ["livraria", "biblioteca", "laboratório", "escritório"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 4,
      question: "Complete: 'I _____ to school every day'",
      options: ["go", "goes", "going", "gone"],
      correct: 0,
      difficulty: "easy"
    },
    {
      id: 5,
      question: "What is the opposite of 'expensive'?",
      options: ["cheap", "costly", "valuable", "precious"],
      correct: 0,
      difficulty: "medium"
    }
  ],
  espanhol: [
    {
      id: 1,
      question: "¿Cómo se dice 'book' en español?",
      options: ["libro", "libra", "libre", "librería"],
      correct: 0,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "¿Cuál es el plural de 'lápiz'?",
      options: ["lápizs", "lápices", "lápizes", "lápiz"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "Complete: 'Yo _____ español'",
      options: ["habla", "hablas", "hablo", "hablan"],
      correct: 2,
      difficulty: "easy"
    },
    {
      id: 4,
      question: "¿Qué significa 'mañana'?",
      options: ["tarde", "manhã", "noite", "meio-dia"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 5,
      question: "¿Cuál es el artículo femenino en español?",
      options: ["el", "la", "los", "las"],
      correct: 1,
      difficulty: "medium"
    }
  ],
  frances: [
    {
      id: 1,
      question: "Comment dit-on 'hello' en français?",
      options: ["au revoir", "bonjour", "bonsoir", "salut"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Quel est l'article défini masculin?",
      options: ["la", "le", "les", "des"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "Comment dit-on 'thank you'?",
      options: ["s'il vous plaît", "excusez-moi", "merci", "de rien"],
      correct: 2,
      difficulty: "easy"
    },
    {
      id: 4,
      question: "Conjuguez 'être' à la première personne: Je ____",
      options: ["es", "est", "suis", "sommes"],
      correct: 2,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "Que veut dire 'chat'?",
      options: ["cão", "gato", "pássaro", "peixe"],
      correct: 1,
      difficulty: "easy"
    }
  ],
  fisica: [
    {
      id: 1,
      question: "Qual é a unidade de força no Sistema Internacional?",
      options: ["Joule", "Newton", "Watt", "Pascal"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 2,
      question: "Qual é a velocidade da luz no vácuo?",
      options: ["300.000 km/s", "150.000 km/s", "450.000 km/s", "200.000 km/s"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "O que é aceleração?",
      options: ["Variação da posição", "Variação da velocidade", "Força aplicada", "Energia cinética"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "Qual lei da física diz que 'ação e reação'?",
      options: ["1ª Lei de Newton", "2ª Lei de Newton", "3ª Lei de Newton", "Lei da Gravidade"],
      correct: 2,
      difficulty: "hard"
    },
    {
      id: 5,
      question: "O que mede o voltímetro?",
      options: ["Corrente", "Resistência", "Tensão", "Potência"],
      correct: 2,
      difficulty: "medium"
    }
  ],
  quimica: [
    {
      id: 1,
      question: "Qual é o símbolo químico do ouro?",
      options: ["Ou", "Au", "Ag", "Or"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 2,
      question: "Quantos prótons tem o átomo de hidrogênio?",
      options: ["0", "1", "2", "3"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 3,
      question: "Qual é o pH da água pura?",
      options: ["6", "7", "8", "9"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "O que é uma ligação iônica?",
      options: ["Compartilhamento de elétrons", "Transferência de elétrons", "Atração molecular", "Repulsão de cargas"],
      correct: 1,
      difficulty: "hard"
    },
    {
      id: 5,
      question: "Qual gás é mais abundante na atmosfera?",
      options: ["Oxigênio", "Nitrogênio", "Argônio", "Dióxido de carbono"],
      correct: 1,
      difficulty: "medium"
    }
  ],
  biologia: [
    {
      id: 1,
      question: "Qual é a menor unidade da vida?",
      options: ["Átomo", "Molécula", "Célula", "Tecido"],
      correct: 2,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Onde ocorre a fotossíntese?",
      options: ["Mitocôndrias", "Cloroplastos", "Núcleo", "Ribossomos"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "Quantas câmaras tem o coração humano?",
      options: ["2", "3", "4", "5"],
      correct: 2,
      difficulty: "easy"
    },
    {
      id: 4,
      question: "O que é DNA?",
      options: ["Ácido desoxirribonucleico", "Ácido ribonucleico", "Proteína", "Carboidrato"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "Qual reino inclui as bactérias?",
      options: ["Animal", "Vegetal", "Fungi", "Monera"],
      correct: 3,
      difficulty: "hard"
    }
  ],
  historia: [
    {
      id: 1,
      question: "Em que ano o Brasil foi descoberto?",
      options: ["1498", "1500", "1502", "1499"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Quem foi o primeiro presidente do Brasil?",
      options: ["Getúlio Vargas", "Deodoro da Fonseca", "Prudente de Morais", "Campos Sales"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "Quando começou a Segunda Guerra Mundial?",
      options: ["1938", "1939", "1940", "1941"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "Qual civilização construiu Machu Picchu?",
      options: ["Asteca", "Maia", "Inca", "Olmeca"],
      correct: 2,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "Em que século aconteceu a Revolução Francesa?",
      options: ["XVII", "XVIII", "XIX", "XVI"],
      correct: 1,
      difficulty: "hard"
    }
  ],
  geografia: [
    {
      id: 1,
      question: "Qual é a capital do Brasil?",
      options: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"],
      correct: 2,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Qual é o maior país do mundo?",
      options: ["China", "Estados Unidos", "Canadá", "Rússia"],
      correct: 3,
      difficulty: "easy"
    },
    {
      id: 3,
      question: "Quantos continentes existem?",
      options: ["5", "6", "7", "8"],
      correct: 2,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "Qual é o rio mais longo do mundo?",
      options: ["Amazonas", "Nilo", "Mississippi", "Yangtzé"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "Em que hemisfério fica a maior parte do Brasil?",
      options: ["Norte", "Sul", "Leste", "Oeste"],
      correct: 1,
      difficulty: "medium"
    }
  ],
  filosofia: [
    {
      id: 1,
      question: "Quem é considerado o pai da filosofia ocidental?",
      options: ["Aristóteles", "Platão", "Sócrates", "Tales de Mileto"],
      correct: 2,
      difficulty: "medium"
    },
    {
      id: 2,
      question: "O que significa 'filosofia'?",
      options: ["Amor pela sabedoria", "Estudo da natureza", "Arte de pensar", "Ciência da vida"],
      correct: 0,
      difficulty: "easy"
    },
    {
      id: 3,
      question: "Qual filósofo escreveu 'A República'?",
      options: ["Sócrates", "Platão", "Aristóteles", "Epicuro"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "O que é ética?",
      options: ["Estudo do belo", "Estudo do conhecimento", "Estudo da moral", "Estudo da lógica"],
      correct: 2,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "Quem disse 'Penso, logo existo'?",
      options: ["Kant", "Descartes", "Hegel", "Nietzsche"],
      correct: 1,
      difficulty: "hard"
    }
  ],
  sociologia: [
    {
      id: 1,
      question: "Quem é considerado o fundador da sociologia?",
      options: ["Max Weber", "Émile Durkheim", "Auguste Comte", "Karl Marx"],
      correct: 2,
      difficulty: "medium"
    },
    {
      id: 2,
      question: "O que estuda a sociologia?",
      options: ["A sociedade", "O indivíduo", "A natureza", "A economia"],
      correct: 0,
      difficulty: "easy"
    },
    {
      id: 3,
      question: "O que é estratificação social?",
      options: ["Divisão em camadas", "União social", "Conflito social", "Mudança social"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "Qual conceito Weber associou ao capitalismo?",
      options: ["Ética protestante", "Luta de classes", "Solidariedade", "Anomia"],
      correct: 0,
      difficulty: "hard"
    },
    {
      id: 5,
      question: "O que são instituições sociais?",
      options: ["Grupos informais", "Organizações formais", "Estruturas básicas da sociedade", "Movimentos sociais"],
      correct: 2,
      difficulty: "medium"
    }
  ],
  artes: [
    {
      id: 1,
      question: "Quem pintou a Mona Lisa?",
      options: ["Michelangelo", "Leonardo da Vinci", "Rafael", "Donatello"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Qual movimento artístico Pablo Picasso ajudou a criar?",
      options: ["Impressionismo", "Cubismo", "Surrealismo", "Expressionismo"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "O que caracteriza a arte barroca?",
      options: ["Simplicidade", "Dramaticidade", "Geometria", "Abstração"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "Quem esculpiu 'O Pensador'?",
      options: ["Rodin", "Michelangelo", "Bernini", "Donatello"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "Qual é a técnica de pintura de Van Gogh?",
      options: ["Pontilhismo", "Impasto", "Aquarela", "Óleo diluído"],
      correct: 1,
      difficulty: "hard"
    }
  ],
  musica: [
    {
      id: 1,
      question: "Quantas linhas tem uma partitura tradicional?",
      options: ["4", "5", "6", "7"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Qual é a nota que fica na segunda linha da clave de sol?",
      options: ["Dó", "Ré", "Mi", "Sol"],
      correct: 2,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "Quantos tempos tem uma semibreve?",
      options: ["1", "2", "3", "4"],
      correct: 3,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "Quem compôs 'A Pequena Serenata Noturna'?",
      options: ["Bach", "Beethoven", "Mozart", "Chopin"],
      correct: 2,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "O que é um acorde?",
      options: ["Uma nota", "Duas notas", "Três ou mais notas", "Um ritmo"],
      correct: 2,
      difficulty: "easy"
    }
  ],
  "educacao-fisica": [
    {
      id: 1,
      question: "Quantos jogadores tem um time de futebol em campo?",
      options: ["10", "11", "12", "9"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Qual é a distância oficial de uma maratona?",
      options: ["40 km", "42,195 km", "45 km", "50 km"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "Em que esporte se usa uma raquete?",
      options: ["Futebol", "Basquete", "Tênis", "Natação"],
      correct: 2,
      difficulty: "easy"
    },
    {
      id: 4,
      question: "Quantas substituições são permitidas no futebol?",
      options: ["3", "5", "7", "Ilimitadas"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "Qual é a altura oficial da rede de vôlei masculino?",
      options: ["2,40m", "2,43m", "2,45m", "2,50m"],
      correct: 1,
      difficulty: "hard"
    }
  ],
  informatica: [
    {
      id: 1,
      question: "O que significa CPU?",
      options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Unit", "Computer Processing Unit"],
      correct: 0,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Qual linguagem é usada para criar páginas web?",
      options: ["Python", "HTML", "Java", "C++"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 3,
      question: "O que é um algoritmo?",
      options: ["Um programa", "Uma sequência de instruções", "Um computador", "Uma linguagem"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "Qual é a base do sistema binário?",
      options: ["8", "10", "2", "16"],
      correct: 2,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "O que significa RAM?",
      options: ["Random Access Memory", "Read Access Memory", "Rapid Access Memory", "Real Access Memory"],
      correct: 0,
      difficulty: "medium"
    }
  ]
};

const subjectNames = {
  matematica: "Matemática",
  portugues: "Português",
  ingles: "Inglês",
  espanhol: "Espanhol",
  frances: "Francês",
  fisica: "Física",
  quimica: "Química",
  biologia: "Biologia",
  historia: "História",
  geografia: "Geografia",
  filosofia: "Filosofia",
  sociologia: "Sociologia",
  artes: "Artes",
  musica: "Música",
  "educacao-fisica": "Educação Física",
  informatica: "Informática"
};

const Game = () => {
  const { subjectId } = useParams();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (subjectId && questionsDB[subjectId as keyof typeof questionsDB]) {
      setQuestions(questionsDB[subjectId as keyof typeof questionsDB]);
    }
  }, [subjectId]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !showResult && !gameOver && !isPaused) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleAnswer(-1); // Tempo esgotado
    }
  }, [timeLeft, showResult, gameOver, isPaused]);

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === questions[currentQuestion]?.correct;
    if (isCorrect) {
      const points = Math.max(100 + (timeLeft * 10), 100);
      setScore(score + points);
      toast({
        title: "Correto! 🎉",
        description: `+${points} pontos`,
      });
    } else if (answerIndex === -1) {
      toast({
        title: "Tempo esgotado! ⏰",
        description: "Tente ser mais rápido na próxima!",
      });
    } else {
      toast({
        title: "Incorreto 😔",
        description: "Continue tentando!",
        variant: "destructive",
      });
    }

    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(30);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameOver(true);
      }
    }, 2000);
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setIsPaused(false);
  };

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GameCard className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Disciplina não encontrada</h2>
          <Link to="/subjects">
            <Button variant="game">Voltar às Disciplinas</Button>
          </Link>
        </GameCard>
      </div>
    );
  }

  if (gameOver) {
    const percentage = Math.round((score / (questions.length * 400)) * 100);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <GameCard variant="subject" className="p-8 text-center max-w-md">
          <Trophy className="h-16 w-16 mx-auto mb-6 text-warning" />
          <h2 className="text-3xl font-bold mb-4">Jogo Finalizado!</h2>
          <div className="space-y-4 mb-6">
            <div className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {score}
            </div>
            <p className="text-lg text-muted-foreground">pontos finais</p>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {percentage}% de aproveitamento
            </Badge>
          </div>
          <div className="flex gap-4">
            <Button variant="game" onClick={resetGame} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Jogar Novamente
            </Button>
            <Link to="/subjects" className="flex-1">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Disciplinas
              </Button>
            </Link>
          </div>
        </GameCard>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/subjects">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {subjectNames[subjectId as keyof typeof subjectNames]}
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setIsPaused(!isPaused)}
            >
              <Pause className="h-4 w-4" />
            </Button>
            <Link to="/subjects">
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Game Info */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">
              Pergunta {currentQuestion + 1} de {questions.length}
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Pontos:</span>
              <Badge variant="secondary" className="text-lg font-bold">
                {score}
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Timer */}
        <div className="max-w-2xl mx-auto mb-8">
          <GameCard 
            variant={timeLeft > 10 ? "default" : "warning"} 
            className="p-6 text-center"
          >
            <Clock className={`h-8 w-8 mx-auto mb-2 ${timeLeft <= 5 ? 'animate-pulse' : ''}`} />
            <div className="text-3xl font-bold">
              {timeLeft}
            </div>
            <div className="text-sm text-muted-foreground">segundos</div>
            {isPaused && (
              <Badge variant="secondary" className="mt-2">
                Jogo Pausado
              </Badge>
            )}
          </GameCard>
        </div>

        {/* Question */}
        <div className="max-w-2xl mx-auto">
          <GameCard variant="subject" className="p-8 mb-8">
            <h2 className="text-2xl font-bold text-center mb-8">
              {question.question}
            </h2>
            
            <div className="grid gap-4">
              {question.options.map((option: string, index: number) => {
                let variant: "default" | "success" | "destructive" = "default";
                
                if (showResult) {
                  if (index === question.correct) {
                    variant = "success";
                  } else if (index === selectedAnswer && selectedAnswer !== question.correct) {
                    variant = "destructive";
                  }
                }
                
                return (
                  <Button
                    key={index}
                    variant={variant === "default" ? "outline" : variant}
                    className="h-16 text-lg justify-start px-6"
                    onClick={() => !showResult && !isPaused && handleAnswer(index)}
                    disabled={showResult || isPaused}
                  >
                    <span className="font-bold mr-4">
                      {String.fromCharCode(65 + index)})
                    </span>
                    {option}
                  </Button>
                );
              })}
            </div>
          </GameCard>
        </div>
      </div>
    </div>
  );
};

export default Game;