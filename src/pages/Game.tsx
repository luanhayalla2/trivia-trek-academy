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
  ],
  alemao: [
    {
      id: 1,
      question: "Como se diz 'hello' em alemão?",
      options: ["Guten Tag", "Auf Wiedersehen", "Danke", "Bitte"],
      correct: 0,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Qual é o artigo definido masculino?",
      options: ["die", "der", "das", "den"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "Como se diz 'obrigado'?",
      options: ["Bitte", "Entschuldigung", "Danke", "Tschüss"],
      correct: 2,
      difficulty: "easy"
    },
    {
      id: 4,
      question: "Complete: Ich _____ Deutsch",
      options: ["spreche", "sprichst", "spricht", "sprechen"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "O que significa 'Haus'?",
      options: ["Carro", "Casa", "Escola", "Trabalho"],
      correct: 1,
      difficulty: "easy"
    }
  ],
  italiano: [
    {
      id: 1,
      question: "Come si dice 'buongiorno'?",
      options: ["Boa tarde", "Bom dia", "Boa noite", "Tchau"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Qual è l'articolo femminile?",
      options: ["il", "lo", "la", "gli"],
      correct: 2,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "Complete: Io _____ italiano",
      options: ["parla", "parli", "parlo", "parlano"],
      correct: 2,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "Che cosa significa 'grazie'?",
      options: ["Por favor", "Obrigado", "Desculpe", "De nada"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 5,
      question: "Come si dice 'acqua'?",
      options: ["Água", "Vinho", "Leite", "Café"],
      correct: 0,
      difficulty: "easy"
    }
  ],
  japones: [
    {
      id: 1,
      question: "Como se diz 'olá' em japonês?",
      options: ["Sayonara", "Konnichiwa", "Arigato", "Sumimasen"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Quantos sistemas de escrita tem o japonês?",
      options: ["1", "2", "3", "4"],
      correct: 2,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "O que significa 'arigato'?",
      options: ["Olá", "Tchau", "Obrigado", "Desculpe"],
      correct: 2,
      difficulty: "easy"
    },
    {
      id: 4,
      question: "Qual sistema é usado para palavras estrangeiras?",
      options: ["Hiragana", "Katakana", "Kanji", "Romaji"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "Como se diz 'sim'?",
      options: ["Ie", "Hai", "Domo", "Mata"],
      correct: 1,
      difficulty: "easy"
    }
  ],
  chines: [
    {
      id: 1,
      question: "Como se diz 'olá' em mandarim?",
      options: ["Nǐ hǎo", "Xièxiè", "Zàijiàn", "Duìbuqǐ"],
      correct: 0,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Quantos tons tem o mandarim?",
      options: ["3", "4", "5", "6"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "O que significa 'xièxiè'?",
      options: ["Olá", "Tchau", "Obrigado", "Desculpe"],
      correct: 2,
      difficulty: "easy"
    },
    {
      id: 4,
      question: "Como se diz 'água'?",
      options: ["Shuǐ", "Chá", "Niú", "Mǐ"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "Qual é o caractere para 'pessoa'?",
      options: ["人", "水", "火", "土"],
      correct: 0,
      difficulty: "medium"
    }
  ],
  russo: [
    {
      id: 1,
      question: "Como se diz 'olá' em russo?",
      options: ["Привет", "Спасибо", "Пока", "Извините"],
      correct: 0,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Quantas letras tem o alfabeto cirílico?",
      options: ["30", "33", "35", "28"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "O que significa 'спасибо'?",
      options: ["Olá", "Obrigado", "Tchau", "Desculpe"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 4,
      question: "Como se diz 'sim'?",
      options: ["Нет", "Да", "Может", "Хорошо"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 5,
      question: "Qual é a capital da Rússia?",
      options: ["Москва", "Петербург", "Киев", "Минск"],
      correct: 0,
      difficulty: "medium"
    }
  ],
  arabe: [
    {
      id: 1,
      question: "Como se diz 'paz' em árabe?",
      options: ["السلام", "شكرا", "مرحبا", "وداعا"],
      correct: 0,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Em que direção se escreve árabe?",
      options: ["Esquerda para direita", "Direita para esquerda", "Cima para baixo", "Baixo para cima"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 3,
      question: "O que significa 'شكرا'?",
      options: ["Olá", "Obrigado", "Tchau", "Desculpe"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 4,
      question: "Quantas letras tem o alfabeto árabe?",
      options: ["26", "28", "30", "32"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "Como se diz 'água'?",
      options: ["ماء", "نار", "هواء", "تراب"],
      correct: 0,
      difficulty: "medium"
    }
  ],
  psicologia: [
    {
      id: 1,
      question: "Quem é considerado o pai da psicanálise?",
      options: ["Carl Jung", "Sigmund Freud", "B.F. Skinner", "Jean Piaget"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "O que estuda a psicologia cognitiva?",
      options: ["Comportamento", "Processos mentais", "Emoções", "Personalidade"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "O que é o inconsciente segundo Freud?",
      options: ["Memória perdida", "Parte da mente fora da consciência", "Instinto", "Reflexo"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "Quantos estágios tem o desenvolvimento cognitivo de Piaget?",
      options: ["3", "4", "5", "6"],
      correct: 1,
      difficulty: "hard"
    },
    {
      id: 5,
      question: "O que é behaviorismo?",
      options: ["Estudo da consciência", "Estudo do comportamento", "Estudo da personalidade", "Estudo das emoções"],
      correct: 1,
      difficulty: "medium"
    }
  ],
  economia: [
    {
      id: 1,
      question: "O que é PIB?",
      options: ["Produto Interno Bruto", "Produto Internacional Básico", "Programa de Investimento Básico", "Plano Interno de Base"],
      correct: 0,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "O que acontece com o preço quando a demanda aumenta?",
      options: ["Diminui", "Aumenta", "Fica igual", "Varia aleatoriamente"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "O que é inflação?",
      options: ["Queda nos preços", "Aumento geral nos preços", "Estabilidade econômica", "Crescimento do PIB"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 4,
      question: "Quem criou a teoria da 'mão invisível'?",
      options: ["Karl Marx", "Adam Smith", "John Keynes", "Milton Friedman"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "O que é taxa de juros?",
      options: ["Custo do dinheiro", "Preço das ações", "Valor da moeda", "Índice de inflação"],
      correct: 0,
      difficulty: "medium"
    }
  ],
  direito: [
    {
      id: 1,
      question: "Qual é a lei máxima do país?",
      options: ["Código Civil", "Constituição", "Código Penal", "CLT"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Quantos poderes tem o Estado brasileiro?",
      options: ["2", "3", "4", "5"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 3,
      question: "O que é habeas corpus?",
      options: ["Direito de propriedade", "Garantia de liberdade", "Direito de voto", "Liberdade de expressão"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "Qual princípio diz que 'ninguém é obrigado a fazer prova contra si'?",
      options: ["Contraditório", "Ampla defesa", "Não autoincriminação", "Presunção de inocência"],
      correct: 2,
      difficulty: "hard"
    },
    {
      id: 5,
      question: "O que são direitos fundamentais?",
      options: ["Direitos básicos da pessoa", "Leis específicas", "Normas administrativas", "Regulamentos"],
      correct: 0,
      difficulty: "medium"
    }
  ],
  medicina: [
    {
      id: 1,
      question: "Qual é o osso mais longo do corpo humano?",
      options: ["Tíbia", "Fêmur", "Úmero", "Rádio"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Quantas câmaras tem o coração?",
      options: ["2", "3", "4", "5"],
      correct: 2,
      difficulty: "easy"
    },
    {
      id: 3,
      question: "O que é hipertensão?",
      options: ["Pressão alta", "Pressão baixa", "Arritmia", "Insuficiência"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "Qual órgão produz insulina?",
      options: ["Fígado", "Pâncreas", "Rim", "Estômago"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "O que é anatomia?",
      options: ["Estudo das funções", "Estudo da estrutura", "Estudo das doenças", "Estudo dos medicamentos"],
      correct: 1,
      difficulty: "easy"
    }
  ],
  engenharia: [
    {
      id: 1,
      question: "O que é resistência de materiais?",
      options: ["Dureza", "Capacidade de suportar esforços", "Peso", "Densidade"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 2,
      question: "Qual é a unidade de pressão no SI?",
      options: ["Newton", "Pascal", "Joule", "Watt"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "O que é momento fletor?",
      options: ["Força de torção", "Esforço de flexão", "Compressão", "Tração"],
      correct: 1,
      difficulty: "hard"
    },
    {
      id: 4,
      question: "Qual material é mais usado na construção civil?",
      options: ["Aço", "Madeira", "Concreto", "Alumínio"],
      correct: 2,
      difficulty: "easy"
    },
    {
      id: 5,
      question: "O que é CAD?",
      options: ["Computer Aided Design", "Computer Analysis Data", "Control And Design", "Calculate And Draw"],
      correct: 0,
      difficulty: "medium"
    }
  ],
  arquitetura: [
    {
      id: 1,
      question: "Quem projetou Brasília?",
      options: ["Oscar Niemeyer", "Lúcio Costa", "Paulo Mendes da Rocha", "Ruy Ohtake"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 2,
      question: "O que é planta baixa?",
      options: ["Vista aérea", "Corte horizontal", "Elevação", "Perspectiva"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 3,
      question: "Qual movimento arquitetônico Le Corbusier representou?",
      options: ["Barroco", "Modernismo", "Gótico", "Renascimento"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "O que é sustentabilidade na arquitetura?",
      options: ["Beleza estética", "Eficiência energética", "Baixo custo", "Rapidez na construção"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "O que são pilotis?",
      options: ["Colunas de sustentação", "Janelas grandes", "Telhados planos", "Paredes curvas"],
      correct: 0,
      difficulty: "hard"
    }
  ],
  literatura: [
    {
      id: 1,
      question: "Quem escreveu 'Dom Casmurro'?",
      options: ["José de Alencar", "Machado de Assis", "Clarice Lispector", "Guimarães Rosa"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Qual movimento literário caracteriza o século XIX?",
      options: ["Romantismo", "Barroco", "Modernismo", "Classicismo"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "O que é um soneto?",
      options: ["Poema de 12 versos", "Poema de 14 versos", "Prosa poética", "Teatro em versos"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "Quem escreveu 'O Cortiço'?",
      options: ["Aluísio Azevedo", "Raul Pompéia", "Adolfo Caminha", "Júlio Ribeiro"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "O que é narrador onisciente?",
      options: ["Que participa da história", "Que sabe tudo", "Que conta em primeira pessoa", "Que é personagem"],
      correct: 1,
      difficulty: "medium"
    }
  ],
  astronomia: [
    {
      id: 1,
      question: "Qual é o planeta mais próximo do Sol?",
      options: ["Vênus", "Terra", "Mercúrio", "Marte"],
      correct: 2,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "Quantas luas tem Júpiter?",
      options: ["Mais de 70", "12", "4", "1"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "O que é uma supernova?",
      options: ["Nascimento de estrela", "Explosão de estrela", "Planeta gigante", "Buraco negro"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "Qual é a estrela mais próxima da Terra?",
      options: ["Próxima Centauri", "Sol", "Sirius", "Vega"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 5,
      question: "O que é Via Láctea?",
      options: ["Constelação", "Nossa galáxia", "Nebulosa", "Aglomerado"],
      correct: 1,
      difficulty: "easy"
    }
  ],
  geologia: [
    {
      id: 1,
      question: "O que são rochas ígneas?",
      options: ["Formadas por pressão", "Formadas por calor", "Formadas por sedimentação", "Formadas por erosão"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 2,
      question: "Qual é o mineral mais duro?",
      options: ["Quartzo", "Diamante", "Topázio", "Safira"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 3,
      question: "O que causa os terremotos?",
      options: ["Movimento das placas tectônicas", "Erosão", "Vulcões", "Marés"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "Quantos tipos básicos de rochas existem?",
      options: ["2", "3", "4", "5"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "O que é intemperismo?",
      options: ["Formação de rochas", "Decomposição de rochas", "Cristalização", "Sedimentação"],
      correct: 1,
      difficulty: "hard"
    }
  ],
  estatistica: [
    {
      id: 1,
      question: "O que é média aritmética?",
      options: ["Valor central", "Soma dividida pelo número de elementos", "Valor mais frequente", "Diferença entre maior e menor"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "O que é desvio padrão?",
      options: ["Medida de dispersão", "Medida central", "Valor máximo", "Valor mínimo"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "Em uma distribuição normal, quantos % estão a 1 desvio da média?",
      options: ["50%", "68%", "95%", "99%"],
      correct: 1,
      difficulty: "hard"
    },
    {
      id: 4,
      question: "O que é probabilidade?",
      options: ["Certeza de ocorrência", "Chance de ocorrência", "Número de eventos", "Frequência absoluta"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 5,
      question: "Qual é a probabilidade de sair cara em uma moeda?",
      options: ["0.25", "0.5", "0.75", "1"],
      correct: 1,
      difficulty: "easy"
    }
  ],
  "ciencias-ambientais": [
    {
      id: 1,
      question: "O que é sustentabilidade?",
      options: ["Crescimento econômico", "Desenvolvimento que não compromete o futuro", "Preservação total", "Industrialização"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "O que causa o efeito estufa?",
      options: ["Gases na atmosfera", "Desmatamento", "Poluição da água", "Erosão do solo"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "O que é biodiversidade?",
      options: ["Variedade de vida", "Clima tropical", "Solo fértil", "Água limpa"],
      correct: 0,
      difficulty: "easy"
    },
    {
      id: 4,
      question: "Qual gás é o principal responsável pelo aquecimento global?",
      options: ["Oxigênio", "Nitrogênio", "Dióxido de carbono", "Ozônio"],
      correct: 2,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "O que é reciclagem?",
      options: ["Reaproveitamento de materiais", "Queima de lixo", "Descarte adequado", "Redução de consumo"],
      correct: 0,
      difficulty: "easy"
    }
  ],
  administracao: [
    {
      id: 1,
      question: "O que são as funções administrativas básicas?",
      options: ["Comprar, vender, lucrar", "Planejar, organizar, dirigir, controlar", "Produzir, distribuir, consumir", "Criar, inovar, competir"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 2,
      question: "O que é liderança?",
      options: ["Dar ordens", "Influenciar pessoas para objetivos", "Ser chefe", "Tomar decisões"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "O que é marketing?",
      options: ["Vendas", "Propaganda", "Satisfação do cliente", "Preço baixo"],
      correct: 2,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "O que é organograma?",
      options: ["Gráfico de vendas", "Estrutura organizacional", "Fluxo de caixa", "Plano de negócios"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 5,
      question: "O que é planejamento estratégico?",
      options: ["Plano diário", "Visão de longo prazo", "Orçamento mensal", "Relatório de vendas"],
      correct: 1,
      difficulty: "medium"
    }
  ],
  fotografia: [
    {
      id: 1,
      question: "O que é abertura do diafragma?",
      options: ["Velocidade da foto", "Quantidade de luz", "Foco da imagem", "Cor da foto"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 2,
      question: "O que significa ISO em fotografia?",
      options: ["Sensibilidade à luz", "Tamanho da foto", "Qualidade da lente", "Tipo de câmera"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "O que é regra dos terços?",
      options: ["Técnica de composição", "Tipo de lente", "Modo de foco", "Configuração de cor"],
      correct: 0,
      difficulty: "easy"
    },
    {
      id: 4,
      question: "O que é profundidade de campo?",
      options: ["Brilho da foto", "Área em foco", "Tamanho da imagem", "Velocidade de captura"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "Para que serve o tripé?",
      options: ["Aumentar zoom", "Estabilizar câmera", "Melhorar cor", "Reduzir ruído"],
      correct: 1,
      difficulty: "easy"
    }
  ],
  teatro: [
    {
      id: 1,
      question: "O que é dramaturgia?",
      options: ["Arte de representar", "Arte de escrever peças", "Arte de dirigir", "Arte de cenografia"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 2,
      question: "Quantos atos tem uma peça clássica?",
      options: ["2", "3", "4", "5"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "O que é monólogo?",
      options: ["Fala de dois personagens", "Fala de um personagem", "Música de fundo", "Mudança de cenário"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 4,
      question: "Quem foi Shakespeare?",
      options: ["Ator inglês", "Dramaturgo inglês", "Diretor francês", "Crítico alemão"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 5,
      question: "O que é catarse no teatro?",
      options: ["Purificação emocional", "Mudança de ato", "Entrada de personagem", "Final da peça"],
      correct: 0,
      difficulty: "hard"
    }
  ],
  "design-grafico": [
    {
      id: 1,
      question: "O que são cores primárias?",
      options: ["Vermelho, verde, azul", "Vermelho, amarelo, azul", "Preto, branco, cinza", "Rosa, roxo, laranja"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "O que é tipografia?",
      options: ["Arte das cores", "Arte das fontes", "Arte das formas", "Arte das imagens"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 3,
      question: "O que significa RGB?",
      options: ["Red Green Blue", "Real Good Basic", "Rapid Graphics Base", "Rich Graphic Bold"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "O que é hierarquia visual?",
      options: ["Ordem de importância", "Paleta de cores", "Tipo de fonte", "Tamanho da imagem"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "Para que serve o espaço em branco?",
      options: ["Economizar tinta", "Criar respiração visual", "Reduzir custos", "Facilitar impressão"],
      correct: 1,
      difficulty: "medium"
    }
  ],
  "game-design": [
    {
      id: 1,
      question: "O que é gameplay?",
      options: ["História do jogo", "Mecânicas de jogo", "Gráficos do jogo", "Som do jogo"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "O que é level design?",
      options: ["Design de personagens", "Design de fases", "Design de interface", "Design de áudio"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 3,
      question: "O que são mecânicas de jogo?",
      options: ["Gráficos 3D", "Regras e sistemas", "Trilha sonora", "História narrativa"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "O que é balanceamento?",
      options: ["Ajustar dificuldade", "Criar gráficos", "Compor música", "Escrever história"],
      correct: 0,
      difficulty: "medium"
    },
    {
      id: 5,
      question: "O que é prototipagem?",
      options: ["Versão final", "Versão de teste", "Marketing do jogo", "Venda do jogo"],
      correct: 1,
      difficulty: "easy"
    }
  ],
  turismo: [
    {
      id: 1,
      question: "O que é turismo sustentável?",
      options: ["Turismo barato", "Turismo que preserva o ambiente", "Turismo de luxo", "Turismo nacional"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 2,
      question: "O que é alta temporada?",
      options: ["Período de menor movimento", "Período de maior movimento", "Período de chuvas", "Período de frio"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 3,
      question: "O que é ecoturismo?",
      options: ["Turismo urbano", "Turismo na natureza", "Turismo histórico", "Turismo gastronômico"],
      correct: 1,
      difficulty: "medium"
    },
    {
      id: 4,
      question: "O que faz um guia de turismo?",
      options: ["Vende passagens", "Conduz e informa turistas", "Administra hotéis", "Cozinha pratos típicos"],
      correct: 1,
      difficulty: "easy"
    },
    {
      id: 5,
      question: "O que é patrimônio cultural?",
      options: ["Bens naturais", "Bens históricos e culturais", "Hotéis antigos", "Restaurantes típicos"],
      correct: 1,
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
  alemao: "Alemão",
  italiano: "Italiano",
  japones: "Japonês",
  chines: "Chinês",
  russo: "Russo",
  arabe: "Árabe",
  fisica: "Física",
  quimica: "Química",
  biologia: "Biologia",
  historia: "História",
  geografia: "Geografia",
  filosofia: "Filosofia",
  sociologia: "Sociologia",
  psicologia: "Psicologia",
  economia: "Economia",
  direito: "Direito",
  medicina: "Medicina",
  engenharia: "Engenharia",
  arquitetura: "Arquitetura",
  literatura: "Literatura",
  astronomia: "Astronomia",
  geologia: "Geologia",
  estatistica: "Estatística",
  "ciencias-ambientais": "Ciências Ambientais",
  "educacao-fisica": "Educação Física",
  administracao: "Administração",
  artes: "Artes",
  fotografia: "Fotografia",
  musica: "Música",
  teatro: "Teatro",
  "design-grafico": "Design Gráfico",
  "game-design": "Game Design",
  turismo: "Turismo",
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