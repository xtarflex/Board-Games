import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBestMoveMorris } from '../../utils/aiBrains.js';
import { getValidMovesMorris, checkWinMorris } from '../../utils/gameLogic.js';
import { saveMatch } from '../../utils/persistence.js';
import ReplayHUD from '../Shared/ReplayHUD.jsx';

const Morris = ({ onWin, mode = 'PvAI', isScrubbing = false }) => {
  const [board, setBoard] = useState(Array(9).fill(0));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [phase, setPhase] = useState('placement'); // 'placement' or 'movement'
  const [p1Pieces, setP1Pieces] = useState(3);
  const [p2Pieces, setP2Pieces] = useState(3);
  const [selectedNode, setSelectedNode] = useState(null);

  const makeMove = useCallback((startNode, endNode, player) => {
    const newBoard = [...board];
    let isPlacement = false;

    if (startNode === null) {
      // Placement phase
      newBoard[endNode] = player;
      if (player === 1) setP1Pieces(prev => prev - 1);
      else setP2Pieces(prev => prev - 1);
      isPlacement = true;
    } else {
      // Movement phase
      newBoard[startNode] = 0;
      newBoard[endNode] = player;
    }

    setBoard(newBoard);
    setSelectedNode(null);

    const newHistory = [...history, { player, start: startNode, end: endNode }];
    setHistory(newHistory);

    const winRes = checkWinMorris(newBoard);
    if (winRes) {
      setWinner(winRes);
      if (onWin) onWin(winRes);
      saveMatch({
        gameType: 'TMM',
        winner: winRes,
        history: newHistory,
        mode
      });
    } else {
      if (isPlacement && p1Pieces <= (player === 1 ? 1 : 0) && p2Pieces <= (player === 2 ? 1 : 0)) {
        setPhase('movement');
      }
      setCurrentPlayer(player === 1 ? 2 : 1);
    }
  }, [board, history, onWin, mode, p1Pieces, p2Pieces]);

  const handleNodeClick = useCallback((index) => {
    if (winner || isAiThinking) return;
    if (mode === 'PvAI' && currentPlayer !== 1) return;

    if (phase === 'placement') {
      const validMoves = getValidMovesMorris(board, phase, currentPlayer);
      if (validMoves.includes(index)) {
        makeMove(null, index, currentPlayer);
      }
    } else {
      // Movement Phase
      if (selectedNode === null) {
        // Select piece
        if (board[index] === currentPlayer) {
          const movable = getValidMovesMorris(board, phase, currentPlayer, index);
          if (movable.length > 0) setSelectedNode(index);
        }
      } else {
        // Move piece
        if (index === selectedNode) {
          setSelectedNode(null); // deselect
          return;
        }
        const validEnds = getValidMovesMorris(board, phase, currentPlayer, selectedNode);
        if (validEnds.includes(index)) {
          makeMove(selectedNode, index, currentPlayer);
        } else if (board[index] === currentPlayer) {
          // Change selection
          const movable = getValidMovesMorris(board, phase, currentPlayer, index);
          if (movable.length > 0) setSelectedNode(index);
        }
      }
    }
  }, [board, winner, isAiThinking, mode, currentPlayer, phase, selectedNode, makeMove]);

  useEffect(() => {
    let timer;
    if (mode === 'PvAI' && currentPlayer === 2 && !winner) {
      setTimeout(() => setIsAiThinking(true), 0);
      timer = setTimeout(() => {
        const move = getBestMoveMorris(board, phase);
        if (phase === 'placement' && move !== null) {
          makeMove(null, move, 2);
        } else if (phase === 'movement' && move !== null) {
          makeMove(move.start, move.end, 2);
        }
        setIsAiThinking(false);
      }, 800);
    }
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, winner, mode, phase, board]);

  const handlePlayAgain = () => {
    setBoard(Array(9).fill(0));
    setCurrentPlayer(1);
    setWinner(null);
    setHistory([]);
    setIsAiThinking(false);
    setPhase('placement');
    setP1Pieces(3);
    setP2Pieces(3);
    setSelectedNode(null);
  };

  const getPosition = (index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    return { top: `${row * 50}%`, left: `${col * 50}%` };
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
      <div className="mb-8 text-center flex flex-col items-center gap-4">
        {winner ? (
          <h2 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
            {winner === 1 ? 'P1 WINS!' : 'P2/AI WINS!'}
          </h2>
        ) : (
          <div className="flex flex-col gap-2 items-center">
             <div className="flex items-center gap-4">
              <span className={`px-4 py-2 rounded-xl font-bold transition-colors ${currentPlayer === 1 ? 'bg-indigo-600 shadow-neon-indigo' : 'text-slate-500'}`}>P1 TURN</span>
              <span className={`px-4 py-2 rounded-xl font-bold transition-colors ${currentPlayer === 2 ? 'bg-cyan-600 shadow-[0_0_20px_-5px_rgba(34,211,238,0.4)]' : 'text-slate-500'}`}>
                {mode === 'PvAI' ? 'AI TURN' : 'P2 TURN'}
              </span>
            </div>
            <span className="text-sm font-bold text-obsidian-400 uppercase tracking-widest bg-obsidian-800 px-3 py-1 rounded-full">
              PHASE: {phase}
            </span>
          </div>
        )}
      </div>

      <div className="glass-panel p-8 md:p-16 rounded-[4rem] border border-cyan-500/20 shadow-deep relative overflow-hidden flex justify-center">
        <div className="w-[280px] h-[280px] md:w-[400px] md:h-[400px] relative">
          {/* Grid Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
            <line x1="0" y1="0" x2="100" y2="0" stroke="#1e293b" strokeWidth="2" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeWidth="2" />
            <line x1="0" y1="100" x2="100" y2="100" stroke="#1e293b" strokeWidth="2" />

            <line x1="0" y1="0" x2="0" y2="100" stroke="#1e293b" strokeWidth="2" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="#1e293b" strokeWidth="2" />
            <line x1="100" y1="0" x2="100" y2="100" stroke="#1e293b" strokeWidth="2" />

            <line x1="0" y1="0" x2="100" y2="100" stroke="#1e293b" strokeWidth="2" />
            <line x1="100" y1="0" x2="0" y2="100" stroke="#1e293b" strokeWidth="2" />
          </svg>

          {/* Nodes */}
          {board.map((cell, i) => {
            const pos = getPosition(i);
            const isSelected = selectedNode === i;
            let canMoveTo = false;
            if (phase === 'movement' && selectedNode !== null) {
               const validEnds = getValidMovesMorris(board, phase, currentPlayer, selectedNode);
               if (validEnds.includes(i)) canMoveTo = true;
            } else if (phase === 'placement' && currentPlayer === 1 && !isAiThinking && cell === 0) {
               canMoveTo = true; // highlight empty nodes in placement
            }

            return (
              <div
                key={i}
                onClick={() => handleNodeClick(i)}
                className={`absolute w-8 h-8 md:w-12 md:h-12 -ml-4 -mt-4 md:-ml-6 md:-mt-6 rounded-full flex items-center justify-center cursor-pointer transition-all z-10
                  ${cell === 0 ? 'bg-obsidian-800 border-2 border-obsidian-700' : ''}
                  ${canMoveTo ? 'ring-2 ring-white/30 bg-obsidian-700 hover:scale-110' : ''}
                `}
                style={pos}
              >
                <AnimatePresence>
                  {cell !== 0 && (
                    <motion.div
                      layoutId={`piece-${cell}-${i}`}
                      initial={isScrubbing ? { scale: 1 } : { scale: 0 }}
                      animate={{ scale: isSelected ? 1.2 : 1 }}
                      transition={{ duration: isScrubbing ? 0 : 0.2 }}
                      className={`w-full h-full rounded-full border-2 ${
                        cell === 1
                          ? 'bg-indigo-500 border-indigo-300 shadow-neon-indigo'
                          : 'bg-cyan-500 border-cyan-200 shadow-[0_0_15px_-3px_rgba(34,211,238,0.6)]'
                      } ${isSelected ? 'ring-4 ring-white/50' : ''}`}
                    />
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {winner && (
        <ReplayHUD
          history={history}
          gameTypeId="TMM"
          winnerCode={winner === 1 ? '1' : winner === 2 ? '2' : 'D'}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
};

export default Morris;
