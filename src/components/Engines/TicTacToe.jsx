import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBestMoveTTT } from '../../utils/aiBrains.js';
import { checkWinTTT, checkDrawTTT } from '../../utils/gameLogic.js';
import { saveMatch } from '../../utils/persistence.js';
import ReplayHUD from '../Shared/ReplayHUD.jsx';

const TicTacToe = ({ onWin, mode = 'PvAI', isScrubbing = false }) => {
  const [board, setBoard] = useState(Array(9).fill(0));
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 = X (P1), 2 = O (P2/AI)
  const [winner, setWinner] = useState(null); // null, 1, 2, or 'draw'
  const [history, setHistory] = useState([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const makeMove = useCallback((index, player) => {
    const newBoard = [...board];
    newBoard[index] = player;
    setBoard(newBoard);

    const newHistory = [...history, { player, index }];
    setHistory(newHistory);

    if (checkWinTTT(newBoard, player)) {
      setWinner(player);
      if (onWin) onWin(player);
      saveMatch({
        gameType: 'TTT',
        winner: player,
        history: newHistory,
        mode
      });
    } else if (checkDrawTTT(newBoard)) {
      setWinner('draw');
      saveMatch({
        gameType: 'TTT',
        winner: 'draw',
        history: newHistory,
        mode
      });
    } else {
      setCurrentPlayer(player === 1 ? 2 : 1);
    }
  }, [board, history, onWin, mode]);

  const handleCellClick = useCallback((index) => {
    if (winner || board[index] !== 0 || isAiThinking || mode === 'tutorial') return;
    if (mode === 'PvAI' && currentPlayer !== 1) return;

    makeMove(index, currentPlayer);
  }, [board, winner, currentPlayer, isAiThinking, makeMove, mode]);


  // Tutorial Logic
  useEffect(() => {
    if (mode !== 'tutorial') return;

    const tutorialMoves = [
      { index: 4, player: 1 }, // Center
      { index: 0, player: 2 }, // Top Left
      { index: 2, player: 1 }, // Top Right
      { index: 6, player: 2 }, // Bottom Left
      { index: 5, player: 1 }, // Middle Right
      { index: 8, player: 2 }, // Bottom Right (block)
      { index: 3, player: 1 }, // Middle Left WIN
    ];

    let moveIndex = 0;

    const playNextMove = () => {
      if (moveIndex >= tutorialMoves.length) return;
      const move = tutorialMoves[moveIndex];

      setBoard(prev => {
         const nb = [...prev];
         nb[move.index] = move.player;
         if (checkWinTTT(nb, move.player)) {
            setWinner(move.player);
         } else {
            setCurrentPlayer(move.player === 1 ? 2 : 1);
         }
         return nb;
      });

      moveIndex++;
      if (moveIndex < tutorialMoves.length) {
         timer = setTimeout(playNextMove, 1200);
      }
    };

    let timer = setTimeout(playNextMove, 1000);
    return () => clearTimeout(timer);

  }, [mode]);

  useEffect(() => {
    let thinkingTimer;
    let moveTimer;

    if (mode === 'PvAI' && currentPlayer === 2 && !winner) {
      thinkingTimer = setTimeout(() => setIsAiThinking(true), 0);
      moveTimer = setTimeout(() => {
        const bestMove = getBestMoveTTT(board);
        if (bestMove !== -1) {
          makeMove(bestMove, 2);
        }
        setIsAiThinking(false);
      }, 500);
    }
    return () => {
      if (thinkingTimer) clearTimeout(thinkingTimer);
      if (moveTimer) clearTimeout(moveTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, winner, mode]);

  const handlePlayAgain = () => {
    setBoard(Array(9).fill(0));
    setCurrentPlayer(1);
    setWinner(null);
    setHistory([]);
    setIsAiThinking(false);
  };

  const drawX = () => (
    <svg className="w-full h-full" viewBox="0 0 100 100">
      <motion.path
        d="M 20 20 L 80 80 M 80 20 L 20 80"
        fill="transparent"
        strokeWidth="10"
        stroke="#818cf8"
        strokeLinecap="round"
        initial={isScrubbing ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: isScrubbing ? 0 : 0.4, ease: "easeInOut" }}
        className="drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]"
      />
    </svg>
  );

  const drawO = () => (
    <svg className="w-full h-full" viewBox="0 0 100 100">
      <motion.circle
        cx="50"
        cy="50"
        r="30"
        fill="transparent"
        strokeWidth="10"
        stroke="#f43f5e"
        strokeLinecap="round"
        initial={isScrubbing ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: isScrubbing ? 0 : 0.4, ease: "easeInOut" }}
        className="drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]"
      />
    </svg>
  );

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      <div className="mb-8 text-center flex flex-col items-center gap-2">
        {winner ? (
          <h2 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">
            {winner === 'draw' ? 'DRAW!' : winner === 1 ? 'P1 WINS!' : 'P2/AI WINS!'}
          </h2>
        ) : (
          <div className="flex items-center gap-4">
            {mode === 'tutorial' && <span className="absolute -top-12 px-4 py-1 rounded-full bg-amber-500 text-obsidian-900 font-black text-xs uppercase tracking-widest shadow-[0_0_15px_-3px_rgba(251,191,36,0.6)]">TUTORIAL MODE</span>}
            <span className={`px-4 py-2 rounded-xl font-bold transition-colors ${currentPlayer === 1 ? 'bg-indigo-600 shadow-neon-indigo' : 'text-slate-500'}`}>P1 (X)</span>
            <span className={`px-4 py-2 rounded-xl font-bold transition-colors ${currentPlayer === 2 ? 'bg-rose-600 shadow-neon-rose' : 'text-slate-500'}`}>
              {mode === 'PvAI' ? 'AI (O)' : 'P2 (O)'}
            </span>
          </div>
        )}
      </div>

      <div className="glass-panel p-6 md:p-12 rounded-[3rem] border border-indigo-500/20 shadow-deep relative">
        <div className="grid grid-cols-3 gap-4 bg-obsidian-900 p-4 rounded-3xl">
          {board.map((cell, i) => (
            <div
              key={i}
              onClick={() => handleCellClick(i)}
              className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-obsidian-800 border border-white/5 flex items-center justify-center cursor-pointer hover:bg-obsidian-700 transition-colors shadow-inner"
            >
              <AnimatePresence>
                {cell === 1 && drawX()}
                {cell === 2 && drawO()}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {winner && (
        <ReplayHUD
          history={history}
          gameTypeId="TTT"
          winnerCode={winner === 1 ? '1' : winner === 2 ? '2' : 'D'}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
};

export default TicTacToe;
