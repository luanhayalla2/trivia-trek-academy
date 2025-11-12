import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const WordSearch = () => {
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);

  const words = ["REACT", "CODE", "GAME", "LEARN", "STUDY"];
  const gridSize = 10;

  useEffect(() => {
    generateGrid();
  }, []);

  const generateGrid = () => {
    const newGrid: string[][] = Array(gridSize)
      .fill(null)
      .map(() =>
        Array(gridSize)
          .fill(null)
          .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
      );

    words.forEach((word) => {
      const direction = Math.random() > 0.5 ? "horizontal" : "vertical";
      let placed = false;

      while (!placed) {
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);

        if (direction === "horizontal" && col + word.length <= gridSize) {
          for (let i = 0; i < word.length; i++) {
            newGrid[row][col + i] = word[i];
          }
          placed = true;
        } else if (direction === "vertical" && row + word.length <= gridSize) {
          for (let i = 0; i < word.length; i++) {
            newGrid[row + i][col] = word[i];
          }
          placed = true;
        }
      }
    });

    setGrid(newGrid);
    setFoundWords(new Set());
    setSelectedCells(new Set());
  };

  const handleCellClick = (row: number, col: number) => {
    const cellId = `${row}-${col}`;
    const newSelected = new Set(selectedCells);

    if (newSelected.has(cellId)) {
      newSelected.delete(cellId);
    } else {
      newSelected.add(cellId);
    }

    setSelectedCells(newSelected);
    checkForWord(newSelected);
  };

  const checkForWord = (selected: Set<string>) => {
    const selectedArray = Array.from(selected).map((id) => {
      const [row, col] = id.split("-").map(Number);
      return { row, col, letter: grid[row][col] };
    });

    selectedArray.sort((a, b) => {
      if (a.row === b.row) return a.col - b.col;
      return a.row - b.row;
    });

    const word = selectedArray.map((cell) => cell.letter).join("");

    if (words.includes(word) && !foundWords.has(word)) {
      setFoundWords(new Set([...foundWords, word]));
      setSelectedCells(new Set());
      toast.success(`Palavra encontrada: ${word}!`);

      if (foundWords.size + 1 === words.length) {
        toast.success("Parabéns! Você encontrou todas as palavras!");
      }
    }
  };

  return (
    <Card className="p-6 max-w-3xl mx-auto bg-card/90 backdrop-blur-sm">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            🧩 Caça-Palavras
          </h2>
          <p className="text-muted-foreground">
            Encontre as palavras escondidas na grade
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {words.map((word) => (
            <span
              key={word}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                foundWords.has(word)
                  ? "bg-success text-success-foreground line-through"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {word}
            </span>
          ))}
        </div>

        <div className="grid gap-1 justify-center">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1">
              {row.map((letter, colIndex) => {
                const cellId = `${rowIndex}-${colIndex}`;
                const isSelected = selectedCells.has(cellId);

                return (
                  <button
                    key={cellId}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`w-10 h-10 font-bold text-sm rounded transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground scale-110"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={generateGrid} variant="outline">
            Novo Jogo
          </Button>
          <Button onClick={() => setSelectedCells(new Set())} variant="secondary">
            Limpar Seleção
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {foundWords.size} de {words.length} palavras encontradas
        </div>
      </div>
    </Card>
  );
};

export default WordSearch;
