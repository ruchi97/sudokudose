import './index.css';

import { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

const initialBoard = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],

  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],

  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const solution = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],

  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],

  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

const App = () => {
  const [board, setBoard] = useState<number[][]>(
    initialBoard.map((row) => [...row])
  );

  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [history, setHistory] = useState<number[][][]>([]);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(
    null
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (started && !completed) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [started, completed]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(
      2,
      '0'
    )}`;
  };

  const isConflict = (
    board: number[][],
    row: number,
    col: number,
    value: number
  ) => {
    if (value === 0) return false;

    const targetRow = board[row];
    if (!targetRow) return false;

    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && targetRow[c] === value) {
        return true;
      }
    }

    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && board[r]?.[col] === value) {
        return true;
      }
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (r !== row && c !== col && board[r]?.[c] === value) {
          return true;
        }
      }
    }

    return false;
  };

  const checkCompleted = (newBoard: number[][]) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (newBoard[row]?.[col] !== solution[row]?.[col]) {
          return false;
        }
      }
    }

    return true;
  };

  const handleChange = (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    if (initialBoard[rowIndex]?.[colIndex] !== 0) return;

    if (!started) {
      setStarted(true);
    }

    if (value !== '' && !/^[1-9]$/.test(value)) {
      return;
    }

    const updatedBoard = board.map((row) => [...row]);

    const targetRow = updatedBoard[rowIndex];
    if (!targetRow) return;

    targetRow[colIndex] = value === '' ? 0 : Number(value);

    setHistory((prev) => [...prev, board.map((row) => [...row])]);
    setBoard(updatedBoard);

    if (checkCompleted(updatedBoard)) {
      setCompleted(true);
    }
  };

  const undoMove = () => {
    if (history.length === 0) return;

    const previousBoard = history[history.length - 1]!;

    setHistory((prev) => prev.slice(0, -1));
    setBoard(previousBoard.map((row) => [...row]));
    setCompleted(false);
  };

  const resetGame = () => {
    setBoard(initialBoard.map((row) => [...row]));
    setStarted(false);
    setCompleted(false);
    setSeconds(0);
    setHistory([]);
    setSelected(null);
  };

  const statusMessage = useMemo(() => {
    if (completed) {
      return `🎉 Completed in ${formatTime(seconds)}!`;
    }

    return started
      ? 'Fill the board without duplicate numbers'
      : 'Make your first move to start the timer';
  }, [completed, seconds, started]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
        Sudoku
      </h1>

      <div className="text-lg font-medium mb-2 text-orange-600">
        ⏱ Time: {formatTime(seconds)}
      </div>

      <div className="mb-6 text-gray-700 dark:text-gray-300">
        {statusMessage}
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={undoMove}
          disabled={history.length === 0 || completed}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
        >
          ↩ Undo
        </button>

        <button
          onClick={resetGame}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
        >
          Reset Game
        </button>
      </div>

      <div className="grid grid-cols-9 aspect-square w-full max-w-[min(90vw,480px)] border-4 border-black bg-white">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isFixed = initialBoard[rowIndex]?.[colIndex] !== 0;

            const hasConflict = isConflict(
              board,
              rowIndex,
              colIndex,
              cell
            );

            const isSelected =
              selected?.row === rowIndex && selected?.col === colIndex;

            const inSameRow = selected?.row === rowIndex;
            const inSameCol = selected?.col === colIndex;
            const inSameBox =
              selected != null &&
              Math.floor(selected.row / 3) === Math.floor(rowIndex / 3) &&
              Math.floor(selected.col / 3) === Math.floor(colIndex / 3);

            const isHighlighted =
              !isSelected && (inSameRow || inSameCol || inSameBox);

            const background = isFixed
              ? isSelected
                ? 'bg-orange-200 text-black font-bold'
                : isHighlighted
                ? 'bg-orange-50 text-black font-bold'
                : 'bg-gray-200 text-black font-bold'
              : hasConflict
              ? 'bg-red-200 text-red-900'
              : isSelected
              ? 'bg-orange-200 text-black'
              : isHighlighted
              ? 'bg-orange-50 text-black'
              : 'bg-white text-black';

            return (
              <input
                key={`${rowIndex}-${colIndex}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={cell === 0 ? '' : cell}
                onChange={(e) =>
                  handleChange(rowIndex, colIndex, e.target.value)
                }
                onFocus={() => setSelected({ row: rowIndex, col: colIndex })}
                disabled={completed || isFixed}
                className={`
                  aspect-square w-full min-w-0 text-center text-lg sm:text-xl
                  border border-gray-400 box-border
                  focus:outline-none
                  transition-colors
                  ${background}
                  ${
                    colIndex % 3 === 2 && colIndex !== 8
                      ? 'border-r-4 border-r-black'
                      : ''
                  }
                  ${
                    rowIndex % 3 === 2 && rowIndex !== 8
                      ? 'border-b-4 border-b-black'
                      : ''
                  }
                `}
              />
            );
          })
        )}
      </div>

      <div className="mt-4 text-sm text-red-600 font-medium">
        Red cells contain duplicate numbers in a row, column, or box.
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);