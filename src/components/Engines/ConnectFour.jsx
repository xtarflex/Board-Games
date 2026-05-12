import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBestMoveC4 } from '../../utils/aiBrains.js';
import { checkWinC4, checkDrawC4 } from '../../utils/gameLogic.js';
import { saveMatch } from '../../utils/persistence.js';
import ReplayHUD from '../Shared/ReplayHUD.jsx';

const ROWS = 6;
const COLS = 7;

const createEmptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const ConnectFour = ({ onWin, mode = 'PvAI', isScrubbing = false }) => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 = P1, 2 = AI/P2
  const [winner, setWinner] = useState(null); // null, 1, 2, or 'draw'
  const [history, setHistory] = useState([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Helper to find the lowest empty row in a column
  const getLowestEmptyRow = (currentBoard, colIndex) => {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (currentBoard[r][colIndex] === 0) return r;
    }
    return -1;
  };

  const makeMove = useCallback((rowIndex, colIndex, player) => {
    const newBoard = board.map(row => [...row]);
    newBoard[rowIndex][colIndex] = player;
    setBoard(newBoard);

    const newHistory = [...history, { player, row: rowIndex, col: colIndex }];
    setHistory(newHistory);

    if (checkWinC4(newBoard, player)) {
      setWinner(player);
      if (onWin) onWin(player);
      saveMatch({
        gameType: 'C4',
        winner: player,
        history: newHistory,
        mode
      });
    } else if (checkDrawC4(newBoard)) {
      setWinner('draw');
      saveMatch({
        gameType: 'C4',
        winner: 'draw',
        history: newHistory,
        mode
      });
    } else {
      setCurrentPlayer(player === 1 ? 2 : 1);
    }
  }, [board, history, onWin, mode]);

  const handleColumnClick = useCallback((colIndex) => {
    if (winner || isAiThinking) return;
    if (mode === 'PvAI' && currentPlayer !== 1) return; // Prevent clicking during AI turn

    const rowIndex = getLowestEmptyRow(board, colIndex);
    if (rowIndex === -1) return; // Column full

    makeMove(rowIndex, colIndex, currentPlayer);
  }, [board, winner, currentPlayer, isAiThinking, makeMove, mode]);

  // AI Turn Logic
  useEffect(() => {
    let thinkingTimer;
    let moveTimer;

    if (mode === 'PvAI' && currentPlayer === 2 && !winner) {
      thinkingTimer = setTimeout(() => {
        setIsAiThinking(true);
      }, 0);

      moveTimer = setTimeout(() => {
        const bestCol = getBestMoveC4(board);
        if (bestCol !== null) {
          const rowIndex = getLowestEmptyRow(board, bestCol);
          makeMove(rowIndex, bestCol, 2);
        }
        setIsAiThinking(false);
      }, 600);
    }
    return () => {
      if (thinkingTimer) clearTimeout(thinkingTimer);
      if (moveTimer) clearTimeout(moveTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, winner, mode]);

  const handlePlayAgain = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(1);
    setWinner(null);
    setHistory([]);
    setIsAiThinking(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="mb-8 text-center flex flex-col items-center gap-2">
        {winner ? (
          <h2 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">
            {winner === 'draw' ? 'DRAW!' : winner === 1 ? 'P1 WINS!' : 'P2/AI WINS!'}
          </h2>
        ) : (
          <div className="flex items-center gap-4">
            <span className={`px-4 py-2 rounded-xl font-bold transition-colors ${currentPlayer === 1 ? 'bg-indigo-600 shadow-neon-indigo' : 'text-slate-500'}`}>P1 TURN</span>
            <span className={`px-4 py-2 rounded-xl font-bold transition-colors ${currentPlayer === 2 ? 'bg-rose-600 shadow-neon-rose' : 'text-slate-500'}`}>
              {mode === 'PvAI' ? 'AI TURN' : 'P2 TURN'}
            </span>
          </div>
        )}
      </div>

      <div className="glass-panel p-4 md:p-8 rounded-[3rem] border border-indigo-500/20 shadow-deep relative">
        <div className="grid grid-cols-7 gap-2 md:gap-4 bg-obsidian-800 p-4 rounded-3xl">
          {Array.from({ length: COLS }).map((_, colIndex) => (
            <div
              key={`col-${colIndex}`}
              className="flex flex-col gap-2 md:gap-4 cursor-pointer group"
              onClick={() => handleColumnClick(colIndex)}
            >
              {/* Hover indicator */}
              <div className="h-4 w-full rounded-full bg-transparent group-hover:bg-indigo-500/20 transition-colors" />

              {board.map((row, rowIndex) => {
                const cellValue = board[rowIndex][colIndex];
                return (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-obsidian-900 border-4 border-obsidian-900 overflow-hidden relative"
                  >
                    <AnimatePresence>
                      {cellValue !== 0 && (
                        <motion.div
                          initial={{ y: isScrubbing ? 0 : -300, opacity: isScrubbing ? 1 : 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            duration: isScrubbing ? 0 : undefined
                          }}
                          className={`absolute inset-0 rounded-full ${
                            cellValue === 1
                              ? 'bg-indigo-500 shadow-[inset_0_0_20px_rgba(255,255,255,0.3)] shadow-neon-indigo'
                              : 'bg-rose-500 shadow-[inset_0_0_20px_rgba(255,255,255,0.3)] shadow-neon-rose'
                          }`}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {winner && (
        <ReplayHUD
          history={history}
          gameTypeId="C4"
          winnerCode={winner === 1 ? '1' : winner === 2 ? '2' : 'D'}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
};

export default ConnectFour;
