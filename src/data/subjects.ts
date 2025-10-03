import { Calculator, BookOpen, Atom, Clock, Globe, Palette, Languages, Code, Music, Brain, Users, Zap, Leaf, Heart, DollarSign, Scale, Building, PenTool, Star, Mountain, TrendingUp, TreePine, Activity, Briefcase, Stethoscope, Wrench, Camera, Gamepad2, Plane, Drama } from "lucide-react";

export const subjects = [
  // 🌍 IDIOMAS
  {
    id: "portugues",
    name: "Português",
    icon: BookOpen,
    questions: 200,
    variant: "growth" as const,
    description: "Gramática, literatura e redação",
    category: "idiomas"
  },
  {
    id: "ingles",
    name: "Inglês",
    icon: Languages,
    questions: 180,
    variant: "knowledge" as const,
    description: "Vocabulário, gramática e conversação",
    category: "idiomas"
  },
  {
    id: "espanhol",
    name: "Espanhol",
    icon: Languages,
    questions: 160,
    variant: "intellect" as const,
    description: "Vocabulário e cultura hispânica",
    category: "idiomas"
  },
  {
    id: "frances",
    name: "Francês",
    icon: Languages,
    questions: 140,
    variant: "wisdom" as const,
    description: "Língua francesa e cultura",
    category: "idiomas"
  },
  {
    id: "alemao",
    name: "Alemão",
    icon: Languages,
    questions: 135,
    variant: "knowledge" as const,
    description: "Gramática alemã e cultura",
    category: "idiomas"
  },
  {
    id: "italiano",
    name: "Italiano",
    icon: Languages,
    questions: 130,
    variant: "purity" as const,
    description: "Lingua italiana e tradições",
    category: "idiomas"
  },
  {
    id: "japones",
    name: "Japonês",
    icon: Languages,
    questions: 125,
    variant: "wisdom" as const,
    description: "Kanji, hiragana e cultura",
    category: "idiomas"
  },
  {
    id: "chines",
    name: "Chinês",
    icon: Languages,
    questions: 120,
    variant: "knowledge" as const,
    description: "Mandarim e ideogramas",
    category: "idiomas"
  },
  {
    id: "russo",
    name: "Russo",
    icon: Languages,
    questions: 115,
    variant: "growth" as const,
    description: "Cirílico e cultura russa",
    category: "idiomas"
  },
  {
    id: "arabe",
    name: "Árabe",
    icon: Languages,
    questions: 110,
    variant: "wisdom" as const,
    description: "Escrita árabe e cultura",
    category: "idiomas"
  },

  // 🔬 EXATAS
  {
    id: "matematica",
    name: "Matemática",
    icon: Calculator,
    questions: 250,
    variant: "knowledge" as const,
    description: "Números, equações e geometria",
    category: "exatas"
  },
  {
    id: "fisica",
    name: "Física",
    icon: Zap,
    questions: 200,
    variant: "knowledge" as const,
    description: "Movimento, energia e universo",
    category: "exatas"
  },
  {
    id: "quimica",
    name: "Química",
    icon: Atom,
    questions: 190,
    variant: "wisdom" as const,
    description: "Elementos, reações e moléculas",
    category: "exatas"
  },
  {
    id: "estatistica",
    name: "Estatística",
    icon: TrendingUp,
    questions: 140,
    variant: "knowledge" as const,
    description: "Dados, probabilidade e análise",
    category: "exatas"
  },
  {
    id: "astronomia",
    name: "Astronomia",
    icon: Star,
    questions: 135,
    variant: "knowledge" as const,
    description: "Planetas, estrelas e galáxias",
    category: "exatas"
  },
  {
    id: "geologia",
    name: "Geologia",
    icon: Mountain,
    questions: 125,
    variant: "growth" as const,
    description: "Rochas, minerais e Terra",
    category: "exatas"
  },

  // 📚 HUMANAS
  {
    id: "historia",
    name: "História",
    icon: Clock,
    questions: 175,
    variant: "intellect" as const,
    description: "Eventos e civilizações",
    category: "humanas"
  },
  {
    id: "geografia",
    name: "Geografia",
    icon: Globe,
    questions: 165,
    variant: "growth" as const,
    description: "Países, capitais e relevos",
    category: "humanas"
  },
  {
    id: "filosofia",
    name: "Filosofia",
    icon: Brain,
    questions: 150,
    variant: "wisdom" as const,
    description: "Pensamento crítico e reflexão",
    category: "humanas"
  },
  {
    id: "sociologia",
    name: "Sociologia",
    icon: Users,
    questions: 140,
    variant: "growth" as const,
    description: "Sociedade e relações humanas",
    category: "humanas"
  },
  {
    id: "psicologia",
    name: "Psicologia",
    icon: Heart,
    questions: 145,
    variant: "wisdom" as const,
    description: "Mente humana e comportamento",
    category: "humanas"
  },
  {
    id: "literatura",
    name: "Literatura",
    icon: PenTool,
    questions: 165,
    variant: "wisdom" as const,
    description: "Obras clássicas e autores",
    category: "humanas"
  },

  // 💼 PROFISSIONAIS
  {
    id: "economia",
    name: "Economia",
    icon: DollarSign,
    questions: 160,
    variant: "intellect" as const,
    description: "Mercados, finanças e negócios",
    category: "profissionais"
  },
  {
    id: "direito",
    name: "Direito",
    icon: Scale,
    questions: 170,
    variant: "knowledge" as const,
    description: "Leis, justiça e constituição",
    category: "profissionais"
  },
  {
    id: "medicina",
    name: "Medicina",
    icon: Stethoscope,
    questions: 220,
    variant: "growth" as const,
    description: "Anatomia, fisiologia e saúde",
    category: "profissionais"
  },
  {
    id: "engenharia",
    name: "Engenharia",
    icon: Wrench,
    questions: 195,
    variant: "knowledge" as const,
    description: "Cálculos, estruturas e projetos",
    category: "profissionais"
  },
  {
    id: "arquitetura",
    name: "Arquitetura",
    icon: Building,
    questions: 155,
    variant: "purity" as const,
    description: "Desenho, urbanismo e design",
    category: "profissionais"
  },
  {
    id: "administracao",
    name: "Administração",
    icon: Briefcase,
    questions: 150,
    variant: "intellect" as const,
    description: "Gestão, liderança e negócios",
    category: "profissionais"
  },

  // 🎨 CRIATIVAS
  {
    id: "artes",
    name: "Artes",
    icon: Palette,
    questions: 130,
    variant: "purity" as const,
    description: "Cultura e expressões artísticas",
    category: "criativas"
  },
  {
    id: "musica",
    name: "Música",
    icon: Music,
    questions: 120,
    variant: "intellect" as const,
    description: "Teoria musical e história",
    category: "criativas"
  },
  {
    id: "teatro",
    name: "Teatro",
    icon: Drama,
    questions: 100,
    variant: "purity" as const,
    description: "Performance e dramaturgia",
    category: "criativas"
  },
  {
    id: "fotografia",
    name: "Fotografia",
    icon: Camera,
    questions: 105,
    variant: "growth" as const,
    description: "Técnicas e composição visual",
    category: "criativas"
  },
  {
    id: "design-grafico",
    name: "Design Gráfico",
    icon: PenTool,
    questions: 115,
    variant: "knowledge" as const,
    description: "Criação visual e comunicação",
    category: "criativas"
  },
  {
    id: "design-jogos",
    name: "Design de Jogos",
    icon: Gamepad2,
    questions: 125,
    variant: "wisdom" as const,
    description: "Criação e mecânicas de jogos",
    category: "criativas"
  },

  // ⚡ TECNOLOGIA
  {
    id: "informatica",
    name: "Informática",
    icon: Code,
    questions: 200,
    variant: "knowledge" as const,
    description: "Programação, algoritmos e tecnologia",
    category: "tecnologia"
  },
  {
    id: "ciencias-ambientais",
    name: "Ciências Ambientais",
    icon: TreePine,
    questions: 130,
    variant: "growth" as const,
    description: "Sustentabilidade e ecologia",
    category: "tecnologia"
  },
  {
    id: "educacao-fisica",
    name: "Educação Física",
    icon: Activity,
    questions: 110,
    variant: "growth" as const,
    description: "Esportes, saúde e movimento",
    category: "tecnologia"
  },
  {
    id: "turismo",
    name: "Turismo",
    icon: Plane,
    questions: 95,
    variant: "growth" as const,
    description: "Destinos e hospitalidade",
    category: "tecnologia"
  }
];