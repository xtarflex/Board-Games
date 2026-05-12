import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBestMoveOthello } from '../../utils/aiBrains.js';
import { getValidMovesOthello, applyMoveOthello, getOthelloScore } from '../../utils/gameLogic.js';
import { saveMatch } from '../../utils/persistence.js';
import ReplayHUD from '../Shared/ReplayHUD.jsx';

const Othello = ({ onWin, mode = 'PvAI', isScrubbing = false }) => {
  const getInitialBoard = () => {
    const b = Array.from({ length: 8 }, () => Array(8).fill(0));
    b[3][3] = 1;
    b[4][4] = 1;
    b[3][4] = 2;
    b[4][3] = 2;
    return b;
  };

  const [board, setBoard] = useState(getInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [validMoves, setValidMoves] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setValidMoves(getValidMovesOthello(board, currentPlayer));
    }, 0);
  }, [board, currentPlayer]);

  const handleGameOver = useCallback((finalBoard) => {
    const { p1, p2 } = getOthelloScore(finalBoard);
    let winRes = p1 > p2 ? 1 : p2 > p1 ? 2 : 'draw';
    setWinner(winRes);
    if (winRes !== 'draw' && onWin) onWin(winRes);
    saveMatch({
      gameType: 'OTH',
      winner: winRes,
      history,
      mode
    });
  }, [history, mode, onWin]);

  const makeMove = useCallback((r, c, player) => {
    const newBoard = applyMoveOthello(board, r, c, player);
    setBoard(newBoard);

    const newHistory = [...history, { player, r, c }];
    setHistory(newHistory);

    const nextPlayer = player === 1 ? 2 : 1;
    const nextValid = getValidMovesOthello(newBoard, nextPlayer);

    if (nextValid.length === 0) {
      // Next player has no moves. Can current player go again?
      const currentValid = getValidMovesOthello(newBoard, player);
      if (currentValid.length === 0) {
        // Game Over
        handleGameOver(newBoard);
      } else {
        // Current player goes again
        setCurrentPlayer(player);
      }
    } else {
      setCurrentPlayer(nextPlayer);
    }
  }, [board, history, handleGameOver]);

  const handleCellClick = useCallback((r, c) => {
    if (winner || isAiThinking) return;
    if (mode === 'PvAI' && currentPlayer !== 1) return;
    if (!validMoves.some(m => m.r === r && m.c === c)) return;

    makeMove(r, c, currentPlayer);
  }, [winner, isAiThinking, mode, currentPlayer, validMoves, makeMove]);

  useEffect(() => {
    let timer;
    if (mode === 'PvAI' && currentPlayer === 2 && !winner) {
      setTimeout(() => setIsAiThinking(true), 0);
      timer = setTimeout(() => {
        const bestMove = getBestMoveOthello(board, 2);
        if (bestMove) {
          makeMove(bestMove.r, bestMove.c, 2);
        } else {
           // Should be handled by makeMove, but fallback if AI got stuck
           handleGameOver(board);
        }
        setIsAiThinking(false);
      }, 800);
    }
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, winner, mode]);

  const handlePlayAgain = () => {
    setBoard(getInitialBoard());
    setCurrentPlayer(1);
    setWinner(null);
    setHistory([]);
    setIsAiThinking(false);
  };

  const scores = getOthelloScore(board);

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
      <div className="mb-8 text-center flex flex-col items-center gap-4">
        {winner ? (
          <h2 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">
            {winner === 'draw' ? 'DRAW!' : winner === 1 ? 'P1 WINS!' : 'P2/AI WINS!'}
          </h2>
        ) : (
          <div className="flex items-center gap-4">
            <span className={`px-4 py-2 rounded-xl font-bold transition-colors ${currentPlayer === 1 ? 'bg-indigo-600 shadow-neon-indigo' : 'text-slate-500'}`}>P1 TURN</span>
            <span className={`px-4 py-2 rounded-xl font-bold transition-colors ${currentPlayer === 2 ? 'bg-emerald-600 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]' : 'text-slate-500'}`}>
              {mode === 'PvAI' ? 'AI TURN' : 'P2 TURN'}
            </span>
          </div>
        )}

        <div className="flex gap-8 text-lg font-mono">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-indigo-500 shadow-neon-indigo"/> P1: {scores.p1}</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]"/> {mode === 'PvAI'?'AI':'P2'}: {scores.p2}</div>
        </div>
      </div>

      <div className="glass-panel p-4 md:p-8 rounded-[3rem] border border-emerald-500/20 shadow-deep relative">
        <div className="grid grid-cols-8 gap-1 md:gap-2 bg-obsidian-800 p-3 md:p-4 rounded-3xl">
          {board.map((row, r) => row.map((cell, c) => {
            const isValid = validMoves.some(m => m.r === r && m.c === c);
            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`w-8 h-8 md:w-12 md:h-12 rounded-sm md:rounded-md bg-emerald-900/30 flex items-center justify-center relative ${isValid ? 'cursor-pointer hover:bg-emerald-800/50' : ''}`}
              >
                {isValid && currentPlayer === 1 && !isAiThinking && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500/50 absolute" />
                )}

                <AnimatePresence>
                  {cell !== 0 && (
                    <motion.div
                      key={cell} // Key change triggers animation on flip
                      initial={isScrubbing ? { rotateY: 0 } : { rotateY: 180, scale: 0.8 }}
                      animate={{ rotateY: 0, scale: 1 }}
                      transition={{ duration: isScrubbing ? 0 : 0.4 }}
                      style={{ perspective: 1000 }}
                      className={`w-[85%] h-[85%] rounded-full shadow-lg ${
                        cell === 1
                          ? 'bg-indigo-500 shadow-neon-indigo'
                          : 'bg-emerald-500 shadow-[0_0_15px_-3px_rgba(16,185,129,0.6)]'
                      }`}
                    />
                  )}
                </AnimatePresence>
              </div>
            );
          }))}
        </div>
      </div>

      {winner && (
        <ReplayHUD
          history={history}
          gameTypeId="OTH"
          winnerCode={winner === 1 ? '1' : winner === 2 ? '2' : 'D'}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
};

export default Othello;
