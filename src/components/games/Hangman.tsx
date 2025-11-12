import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Hangman = () => {
  const words = [
    { word: "COMPUTADOR", hint: "Aparelho eletrônico para processar dados" },
    { word: "EDUCACAO", hint: "Processo de ensino e aprendizagem" },
    { word: "MATEMATICA", hint: "Ciência dos números e operações" },
    { word: "GEOGRAFIA", hint: "Estudo da Terra e suas características" },
    { word: "HISTORIA", hint: "Estudo dos acontecimentos do passado" },
  ];

  const [currentWord, setCurrentWord] = useState(words[0]);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");

  const maxWrongGuesses = 6;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    const wordLetters = currentWord.word.split("");
    const allGuessed = wordLetters.every((letter) => guessedLetters.includes(letter));

    if (allGuessed && gameStatus === "playing") {
      setGameStatus("won");
    }
  }, [guessedLetters, currentWord, gameStatus]);

  const handleGuess = (letter: string) => {
    if (gameStatus !== "playing") return;
    if (guessedLetters.includes(letter)) return;

    setGuessedLetters([...guessedLetters, letter]);

    if (!currentWord.word.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);

      if (newWrongGuesses >= maxWrongGuesses) {
        setGameStatus("lost");
      }
    }
  };

  const resetGame = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(randomWord);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus("playing");
  };

  const displayWord = currentWord.word
    .split("")
    .map((letter) => (guessedLetters.includes(letter) ? letter : "_"))
    .join(" ");

  const drawHangman = () => {
    const parts = ["😟", "👕", "👖", "👞", "👞", "💀"];
    return (
      <div className="text-6xl text-center py-4">
        {parts.slice(0, wrongGuesses).join(" ")}
      </div>
    );
  };

  if (gameStatus === "won") {
    return (
      <Card className="p-8 text-center space-y-6 bg-card/80 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-success">Você Venceu! 🎉</h2>
        <div className="text-6xl">🏆</div>
        <p className="text-xl text-foreground">A palavra era: <strong>{currentWord.word}</strong></p>
        <Button onClick={resetGame} size="lg" className="w-full">
          Jogar Novamente
        </Button>
      </Card>
    );
  }

  if (gameStatus === "lost") {
    return (
      <Card className="p-8 text-center space-y-6 bg-card/80 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-destructive">Game Over! 😢</h2>
        <div className="text-6xl">💀</div>
        <p className="text-xl text-foreground">A palavra era: <strong>{currentWord.word}</strong></p>
        <Button onClick={resetGame} size="lg" className="w-full">
          Tentar Novamente
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-8 space-y-6 bg-card/80 backdrop-blur-sm">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Forca Educativa 🎯</h2>
        <p className="text-sm text-muted-foreground italic">"{currentWord.hint}"</p>
      </div>

      {drawHangman()}

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Tentativas restantes: {maxWrongGuesses - wrongGuesses}
        </p>
        <p className="text-3xl font-mono font-bold text-foreground tracking-wider">
          {displayWord}
        </p>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {alphabet.map((letter) => {
          const isGuessed = guessedLetters.includes(letter);
          const isCorrect = currentWord.word.includes(letter);

          return (
            <Button
              key={letter}
              onClick={() => handleGuess(letter)}
              disabled={isGuessed}
              variant={isGuessed ? (isCorrect ? "success" : "destructive") : "outline"}
              className="aspect-square p-0"
            >
              {letter}
            </Button>
          );
        })}
      </div>

      <Button onClick={resetGame} variant="outline" className="w-full">
        Nova Palavra
      </Button>
    </Card>
  );
};

export default Hangman;
