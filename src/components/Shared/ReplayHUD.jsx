import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Download, CheckCircle2, Loader2, Play } from 'lucide-react';
import { renderGameToVideo } from '../../utils/ffmpegService.js';
import { serializeGame } from '../../utils/gameSecurity.js';
import { exportNerdFile } from '../../utils/fileSystem.js';

// --- Renderer for Connect 4 ---
const renderConnect4Frame = (ctx, history, stepIndex, width, height) => {
  const ROWS = 6;
  const COLS = 7;

  const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  for (let i = 0; i <= stepIndex; i++) {
    const move = history[i];
    if (!move) continue;
    board[move.row][move.col] = move.player;
  }

  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, width, height);

  const padding = 50;
  const boardWidth = width - padding * 2;
  const boardHeight = height - padding * 2 - 100;
  const cellWidth = boardWidth / COLS;
  const cellHeight = boardHeight / ROWS;
  const radius = Math.min(cellWidth, cellHeight) / 2 - 10;

  const startX = padding;
  const startY = padding + 100;

  ctx.fillStyle = '#818cf8';
  ctx.font = 'bold 60px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CONNECT FOUR REPLAY', width / 2, 80);

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(startX - 20, startY - 20, boardWidth + 40, boardHeight + 40, 20);
  ctx.fill();

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cx = startX + c * cellWidth + cellWidth / 2;
      const cy = startY + r * cellHeight + cellHeight / 2;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#020617';
      ctx.fill();

      const cellValue = board[r][c];
      if (cellValue !== 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
        if (cellValue === 1) {
          ctx.fillStyle = '#818cf8';
          ctx.fill();
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#c7d2fe';
          ctx.stroke();
        } else if (cellValue === 2) {
          ctx.fillStyle = '#f43f5e';
          ctx.fill();
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#fecdd3';
          ctx.stroke();
        }
      }
    }
  }
};

// --- Renderer for Tic Tac Toe ---
const renderTicTacToeFrame = (ctx, history, stepIndex, width, height) => {
  const board = Array(9).fill(0);
  for (let i = 0; i <= stepIndex; i++) {
    const move = history[i];
    if (!move) continue;
    board[move.index] = move.player;
  }

  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#f43f5e';
  ctx.font = 'bold 60px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('TIC TAC TOE REPLAY', width / 2, 80);

  const size = 600;
  const startX = (width - size) / 2;
  const startY = (height - size) / 2 + 50;
  const cellSize = size / 3;

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(startX - 20, startY - 20, size + 40, size + 40, 20);
  ctx.fill();

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(startX + cellSize, startY);
  ctx.lineTo(startX + cellSize, startY + size);
  ctx.moveTo(startX + cellSize * 2, startY);
  ctx.lineTo(startX + cellSize * 2, startY + size);
  ctx.moveTo(startX, startY + cellSize);
  ctx.lineTo(startX + size, startY + cellSize);
  ctx.moveTo(startX, startY + cellSize * 2);
  ctx.lineTo(startX + size, startY + cellSize * 2);
  ctx.stroke();

  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const cx = startX + col * cellSize + cellSize / 2;
    const cy = startY + row * cellSize + cellSize / 2;
    const padding = 30;

    const cellValue = board[i];
    if (cellValue === 1) { // X
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - cellSize/2 + padding, cy - cellSize/2 + padding);
      ctx.lineTo(cx + cellSize/2 - padding, cy + cellSize/2 - padding);
      ctx.moveTo(cx + cellSize/2 - padding, cy - cellSize/2 + padding);
      ctx.lineTo(cx - cellSize/2 + padding, cy + cellSize/2 - padding);
      ctx.stroke();
    } else if (cellValue === 2) { // O
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.arc(cx, cy, cellSize/2 - padding, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
};

const renderOthelloFrame = (ctx, history, stepIndex, width, height) => {
  const board = Array.from({ length: 8 }, () => Array(8).fill(0));
  board[3][3] = 1;
  board[4][4] = 1;
  board[3][4] = 2;
  board[4][3] = 2;

  const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

  for (let i = 0; i <= stepIndex; i++) {
    const move = history[i];
    if (!move) continue;
    const { r, c, player } = move;
    board[r][c] = player;
    const opponent = player === 1 ? 2 : 1;

    for (let [dr, dc] of dirs) {
      let nr = r + dr, nc = c + dc;
      let flipped = [];
      while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === opponent) {
        flipped.push({r: nr, c: nc});
        nr += dr;
        nc += dc;
      }
      if (flipped.length > 0 && nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === player) {
        for (let cell of flipped) {
          board[cell.r][cell.c] = player;
        }
      }
    }
  }

  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 60px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('OTHELLO REPLAY', width / 2, 80);

  const padding = 50;
  const size = Math.min(width, height) - padding * 2 - 100;
  const startX = (width - size) / 2;
  const startY = (height - size) / 2 + 50;
  const cellSize = size / 8;

  ctx.fillStyle = '#064e3b'; // emerald-900/30
  ctx.fillRect(startX - 10, startY - 10, size + 20, size + 20);

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cx = startX + c * cellSize + cellSize / 2;
      const cy = startY + r * cellSize + cellSize / 2;

      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2;
      ctx.strokeRect(startX + c * cellSize, startY + r * cellSize, cellSize, cellSize);

      const cellValue = board[r][c];
      if (cellValue !== 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, cellSize/2 - 8, 0, Math.PI * 2);
        if (cellValue === 1) {
          ctx.fillStyle = '#6366f1'; // indigo-500
          ctx.fill();
        } else if (cellValue === 2) {
          ctx.fillStyle = '#10b981'; // emerald-500
          ctx.fill();
        }
      }
    }
  }
};

// Add to ReplayHUD.jsx for Mancala
const renderMancalaFrame = (ctx, history, stepIndex, width, height) => {
  const board = [4,4,4,4,4,4,0,4,4,4,4,4,4,0];

  // Re-implement basic applyMove for replay to keep it self-contained
  for (let i = 0; i <= stepIndex; i++) {
    const move = history[i];
    if (!move) continue;
    const player = move.player;
    let pitIndex = move.index;

    let seeds = board[pitIndex];
    board[pitIndex] = 0;
    let currentPit = pitIndex;

    while (seeds > 0) {
      currentPit = (currentPit + 1) % 14;
      if ((player === 1 && currentPit === 13) || (player === 2 && currentPit === 6)) {
        continue;
      }
      board[currentPit]++;
      seeds--;
    }

    if (board[currentPit] === 1) {
      if (player === 1 && currentPit >= 0 && currentPit <= 5) {
        const opp = 12 - currentPit;
        if (board[opp] > 0) { board[6] += board[currentPit] + board[opp]; board[currentPit] = 0; board[opp] = 0; }
      } else if (player === 2 && currentPit >= 7 && currentPit <= 12) {
        const opp = 12 - currentPit;
        if (board[opp] > 0) { board[13] += board[currentPit] + board[opp]; board[currentPit] = 0; board[opp] = 0; }
      }
    }

    // Check end condition just in case we need to sweep (only really on last frame)
    if (i === history.length - 1) {
       const p1E = board.slice(0,6).every(s=>s===0);
       const p2E = board.slice(7,13).every(s=>s===0);
       if(p1E || p2E) {
         for(let k=0; k<6; k++){board[6]+=board[k]; board[k]=0;}
         for(let k=7; k<13; k++){board[13]+=board[k]; board[k]=0;}
       }
    }
  }

  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#fbbf24'; // amber-400
  ctx.font = 'bold 60px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('MANCALA REPLAY', width / 2, 100);

  const startX = 100;
  const startY = height / 2 - 150;
  const boardWidth = width - 200;
  const storeWidth = 120;
  const pitSize = (boardWidth - storeWidth * 2 - 50) / 6;

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(startX, startY, boardWidth, 300, 40);
  ctx.fill();

  const drawStore = (x, label, count, color) => {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(x, startY + 20, storeWidth, 260, 30);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.font = 'bold 40px monospace';
    ctx.fillText(count, x + storeWidth/2, startY + 150);
    ctx.font = '20px monospace';
    ctx.fillText(label, x + storeWidth/2, startY + 50);
  };

  const drawPit = (x, y, count) => {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x, y, pitSize/2 - 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 30px monospace';
    ctx.fillText(count, x, y + 10);
  };

  drawStore(startX + 20, 'P2', board[13], '#f43f5e');
  drawStore(startX + boardWidth - storeWidth - 20, 'P1', board[6], '#818cf8');

  const pitStartX = startX + storeWidth + 25 + pitSize/2;

  // P2 Row (Top)
  const p2Pits = [12, 11, 10, 9, 8, 7];
  for(let i=0; i<6; i++) {
    drawPit(pitStartX + i * pitSize, startY + 80, board[p2Pits[i]]);
  }

  // P1 Row (Bottom)
  for(let i=0; i<6; i++) {
    drawPit(pitStartX + i * pitSize, startY + 220, board[i]);
  }
};

// Add to ReplayHUD.jsx for Three Men's Morris
const renderMorrisFrame = (ctx, history, stepIndex, width, height) => {
  const board = Array(9).fill(0);

  for (let i = 0; i <= stepIndex; i++) {
    const move = history[i];
    if (!move) continue;
    if (move.start === null || move.start === undefined) {
      board[move.end] = move.player;
    } else {
      board[move.start] = 0;
      board[move.end] = move.player;
    }
  }

  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#22d3ee'; // cyan-400
  ctx.font = 'bold 60px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('THREE MEN\'S MORRIS REPLAY', width / 2, 80);

  const padding = 150;
  const size = Math.min(width, height) - padding * 2;
  const startX = (width - size) / 2;
  const startY = (height - size) / 2 + 50;

  // Draw lines
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 10;

  ctx.beginPath();
  // Horizontal
  ctx.moveTo(startX, startY); ctx.lineTo(startX + size, startY);
  ctx.moveTo(startX, startY + size/2); ctx.lineTo(startX + size, startY + size/2);
  ctx.moveTo(startX, startY + size); ctx.lineTo(startX + size, startY + size);
  // Vertical
  ctx.moveTo(startX, startY); ctx.lineTo(startX, startY + size);
  ctx.moveTo(startX + size/2, startY); ctx.lineTo(startX + size/2, startY + size);
  ctx.moveTo(startX + size, startY); ctx.lineTo(startX + size, startY + size);
  // Diagonal
  ctx.moveTo(startX, startY); ctx.lineTo(startX + size, startY + size);
  ctx.moveTo(startX + size, startY); ctx.lineTo(startX, startY + size);
  ctx.stroke();

  // Draw nodes
  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const cx = startX + col * (size/2);
    const cy = startY + row * (size/2);

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.stroke();

    const cellValue = board[i];
    if (cellValue !== 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, 25, 0, Math.PI * 2);
      if (cellValue === 1) {
        ctx.fillStyle = '#6366f1';
        ctx.fill();
      } else if (cellValue === 2) {
        ctx.fillStyle = '#22d3ee';
        ctx.fill();
      }
    }
  }
};

const ReplayHUD = ({ history, gameTypeId, winnerCode, onPlayAgain, onScrub }) => {
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isExportingNerd, setIsExportingNerd] = useState(false);
  const [scrubIndex, setScrubIndex] = useState(history.length - 1);

  const handleScrub = (e) => {
    const val = parseInt(e.target.value, 10);
    setScrubIndex(val);
    if (onScrub) onScrub(val);
  };

  const handleExportVideo = async () => {
    setIsExportingVideo(true);
    try {
      let renderFn;
      if (gameTypeId === 'C4') renderFn = renderConnect4Frame;
      else if (gameTypeId === 'TTT') renderFn = renderTicTacToeFrame;
      else if (gameTypeId === 'OTH') renderFn = renderOthelloFrame;
      else if (gameTypeId === 'MAN') renderFn = renderMancalaFrame;
      else if (gameTypeId === 'TMM') renderFn = renderMorrisFrame;
      else throw new Error("Render function not implemented for game: " + gameTypeId);

      const blob = await renderGameToVideo(history, renderFn, 1080, 1080, 30);
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = `nerdhub-${gameTypeId}-replay-${Date.now()}.mp4`;
      a.click();
    } catch (error) {
      console.error("Video export failed:", error);
      alert("Video export failed: " + error.message);
    } finally {
      setIsExportingVideo(false);
    }
  };

  const handleExportNerdFile = async () => {
    setIsExportingNerd(true);
    try {
      const serializedHistory = history.map(move => ({
        index: move.index !== undefined ? move.index : move.col !== undefined ? move.col : move.r !== undefined ? (move.r * 8 + move.c) : (move.end + (move.start ? move.start*10 : 0)) // TTT, C4, OTH, TMM
      }));

      const dataStr = serializeGame(gameTypeId, '1', winnerCode, serializedHistory);
      await exportNerdFile(dataStr, `${gameTypeId}-match-${Date.now()}.nerd`);
    } catch (error) {
      console.error("Nerd file export failed:", error);
    } finally {
      setIsExportingNerd(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 glass-panel border border-indigo-500/20 rounded-2xl p-6 w-full max-w-xl mx-auto flex flex-col items-center shadow-deep"
    >
      <h3 className="text-xl font-bold mb-6 text-slate-200">MATCH ARCHIVE & REPLAY</h3>

      <div className="w-full mb-8">
        <div className="flex justify-between text-xs text-slate-400 font-mono mb-2">
          <span>Start</span>
          <span>Turn {scrubIndex + 1}/{history.length}</span>
          <span>End</span>
        </div>
        <input
          type="range"
          min="0"
          max={history.length - 1}
          value={scrubIndex}
          onChange={handleScrub}
          className="w-full h-2 bg-obsidian-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <button
          onClick={handleExportVideo}
          disabled={isExportingVideo || videoUrl !== null}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 rounded-xl font-bold transition-all shadow-neon-indigo"
        >
          {isExportingVideo ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Rendering...</>
          ) : videoUrl ? (
            <><CheckCircle2 className="w-5 h-5" /> MP4 Saved</>
          ) : (
            <><Video className="w-5 h-5" /> Export MP4</>
          )}
        </button>

        <button
          onClick={handleExportNerdFile}
          disabled={isExportingNerd}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-obsidian-700 hover:bg-obsidian-800 border border-indigo-500/30 rounded-xl font-bold transition-all"
        >
          {isExportingNerd ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
          ) : (
            <><Download className="w-5 h-5" /> Save .nerd File</>
          )}
        </button>
      </div>

      {onPlayAgain && (
        <button
          onClick={onPlayAgain}
          className="mt-6 flex items-center justify-center gap-2 py-3 px-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl font-bold transition-all w-full"
        >
          <Play className="w-5 h-5" /> Play Again
        </button>
      )}
    </motion.div>
  );
};

export default ReplayHUD;
