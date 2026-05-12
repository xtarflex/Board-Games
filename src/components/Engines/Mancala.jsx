import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBestMoveMancala } from '../../utils/aiBrains.js';
import { getInitialMancalaBoard, applyMoveMancala } from '../../utils/gameLogic.js';
import { saveMatch } from '../../utils/persistence.js';
import ReplayHUD from '../Shared/ReplayHUD.jsx';

const Mancala = ({ onWin, mode = 'PvAI', isScrubbing = false }) => {
  const [board, setBoard] = useState(getInitialMancalaBoard());
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const handleGameOver = useCallback((finalBoard) => {
    const p1Score = finalBoard[6];
    const p2Score = finalBoard[13];
    let winRes = p1Score > p2Score ? 1 : p2Score > p1Score ? 2 : 'draw';
    setWinner(winRes);
    if (winRes !== 'draw' && onWin) onWin(winRes);
    saveMatch({
      gameType: 'MAN',
      winner: winRes,
      history,
      mode
    });
  }, [history, mode, onWin]);

  const makeMove = useCallback((pitIndex, player) => {
    const { newBoard, extraTurn, isGameOver } = applyMoveMancala(board, pitIndex, player);
    setBoard(newBoard);

    const newHistory = [...history, { player, index: pitIndex }];
    setHistory(newHistory);

    if (isGameOver) {
      handleGameOver(newBoard);
    } else {
      if (!extraTurn) {
        setCurrentPlayer(player === 1 ? 2 : 1);
      }
      // If extraTurn, player stays the same
    }
  }, [board, history, handleGameOver]);

  const handlePitClick = useCallback((index) => {
    if (winner || isAiThinking) return;
    if (mode === 'PvAI' && currentPlayer !== 1) return;

    if (currentPlayer === 1 && (index < 0 || index > 5)) return;
    if (currentPlayer === 2 && (index < 7 || index > 12)) return;
    if (board[index] === 0) return;

    makeMove(index, currentPlayer);
  }, [winner, isAiThinking, mode, currentPlayer, board, makeMove]);

  useEffect(() => {
    let timer;
    if (mode === 'PvAI' && currentPlayer === 2 && !winner) {
      setTimeout(() => setIsAiThinking(true), 0);
      timer = setTimeout(() => {
        const bestMove = getBestMoveMancala(board);
        if (bestMove !== -1) {
          makeMove(bestMove, 2);
        }
        setIsAiThinking(false);
      }, 1000);
    }
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, winner, mode, board]);

  const handlePlayAgain = () => {
    setBoard(getInitialMancalaBoard());
    setCurrentPlayer(1);
    setWinner(null);
    setHistory([]);
    setIsAiThinking(false);
  };

  const renderSeeds = (count) => {
    return Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        layout
        initial={isScrubbing ? { scale: 1 } : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: isScrubbing ? 0 : 0.3 }}
        className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)] absolute"
        style={{
          top: `${50 + (Math.random() * 40 - 20)}%`,
          left: `${50 + (Math.random() * 40 - 20)}%`,
        }}
      />
    ));
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
      <div className="mb-8 text-center flex flex-col items-center gap-4">
        {winner ? (
          <h2 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">
            {winner === 'draw' ? 'DRAW!' : winner === 1 ? 'P1 WINS!' : 'P2/AI WINS!'}
          </h2>
        ) : (
          <div className="flex items-center gap-4">
            <span className={`px-4 py-2 rounded-xl font-bold transition-colors ${currentPlayer === 1 ? 'bg-indigo-600 shadow-neon-indigo' : 'text-slate-500'}`}>P1 TURN</span>
            <span className={`px-4 py-2 rounded-xl font-bold transition-colors ${currentPlayer === 2 ? 'bg-amber-600 shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)]' : 'text-slate-500'}`}>
              {mode === 'PvAI' ? 'AI TURN' : 'P2 TURN'}
            </span>
          </div>
        )}
      </div>

      <div className="glass-panel p-6 md:p-10 rounded-[4rem] border border-amber-500/20 shadow-deep w-full relative overflow-hidden">
        {/* Wood texture background hint */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900 via-obsidian-900 to-obsidian-900 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 relative z-10">

          {/* P2 Store (Left side) */}
          <div className="w-full md:w-32 h-24 md:h-64 bg-obsidian-800 rounded-[2rem] border-4 border-obsidian-900 shadow-inner relative flex items-center justify-center">
            <span className="absolute top-2 text-slate-500 text-xs font-bold uppercase">{mode === 'PvAI' ? 'AI' : 'P2'}</span>
            <div className="relative w-full h-full p-4 overflow-hidden">
               <AnimatePresence>{renderSeeds(board[13])}</AnimatePresence>
            </div>
            <span className="absolute bottom-2 text-amber-400 font-mono font-bold">{board[13]}</span>
          </div>

          {/* Pits Grid */}
          <div className="flex-1 flex flex-col gap-4">
            {/* P2 Row (Top, Right to Left) */}
            <div className="flex justify-between gap-2 md:gap-4">
              {[12, 11, 10, 9, 8, 7].map(i => (
                <div
                  key={i}
                  onClick={() => handlePitClick(i)}
                  className={`w-14 h-14 md:w-20 md:h-20 rounded-full bg-obsidian-800 border-4 border-obsidian-900 shadow-inner relative flex flex-col items-center justify-center ${
                    currentPlayer === 2 && board[i] > 0 ? 'cursor-pointer hover:border-amber-500/50' : ''
                  }`}
                >
                  <div className="relative w-full h-full overflow-hidden rounded-full">
                     <AnimatePresence>{renderSeeds(board[i])}</AnimatePresence>
                  </div>
                  <span className="absolute -top-6 text-slate-500 text-xs font-mono">{board[i]}</span>
                </div>
              ))}
            </div>

            {/* P1 Row (Bottom, Left to Right) */}
            <div className="flex justify-between gap-2 md:gap-4">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  onClick={() => handlePitClick(i)}
                  className={`w-14 h-14 md:w-20 md:h-20 rounded-full bg-obsidian-800 border-4 border-obsidian-900 shadow-inner relative flex flex-col items-center justify-center ${
                    currentPlayer === 1 && board[i] > 0 ? 'cursor-pointer hover:border-indigo-500/50' : ''
                  }`}
                >
                  <div className="relative w-full h-full overflow-hidden rounded-full">
                     <AnimatePresence>{renderSeeds(board[i])}</AnimatePresence>
                  </div>
                  <span className="absolute -bottom-6 text-slate-500 text-xs font-mono">{board[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* P1 Store (Right side) */}
          <div className="w-full md:w-32 h-24 md:h-64 bg-obsidian-800 rounded-[2rem] border-4 border-obsidian-900 shadow-inner relative flex items-center justify-center">
            <span className="absolute top-2 text-slate-500 text-xs font-bold uppercase">P1</span>
            <div className="relative w-full h-full p-4 overflow-hidden">
               <AnimatePresence>{renderSeeds(board[6])}</AnimatePresence>
            </div>
            <span className="absolute bottom-2 text-indigo-400 font-mono font-bold">{board[6]}</span>
          </div>

        </div>
      </div>

      {winner && (
        <ReplayHUD
          history={history}
          gameTypeId="MAN"
          winnerCode={winner === 1 ? '1' : winner === 2 ? '2' : 'D'}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
};

export default Mancala;
