import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Download, CheckCircle2, Loader2, Play } from 'lucide-react';
import { renderGameToVideo } from '../../utils/ffmpegService.js';
import { serializeGame } from '../../utils/gameSecurity.js';
import { exportNerdFile } from '../../utils/fileSystem.js';

// The callback for rendering each frame of the Connect 4 video
const renderConnect4Frame = (ctx, history, stepIndex, width, height) => {
  const ROWS = 6;
  const COLS = 7;

  // Reconstruct board up to stepIndex
  const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  for (let i = 0; i <= stepIndex; i++) {
    const move = history[i];
    if (!move) continue;
    // Connect Four history object expects: { player: 1|2, col: number, row: number }
    board[move.row][move.col] = move.player;
  }

  // Draw Background
  ctx.fillStyle = '#020617'; // obsidian-900
  ctx.fillRect(0, 0, width, height);

  // Setup grid parameters
  const padding = 50;
  const boardWidth = width - padding * 2;
  const boardHeight = height - padding * 2 - 100; // Leave room for title
  const cellWidth = boardWidth / COLS;
  const cellHeight = boardHeight / ROWS;
  const radius = Math.min(cellWidth, cellHeight) / 2 - 10;

  const startX = padding;
  const startY = padding + 100;

  // Draw Title
  ctx.fillStyle = '#818cf8'; // indigo-400
  ctx.font = 'bold 60px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('NERD HUB REPLAY', width / 2, 80);

  // Draw Board Background
  ctx.fillStyle = '#1e293b'; // obsidian-700
  ctx.beginPath();
  ctx.roundRect(startX - 20, startY - 20, boardWidth + 40, boardHeight + 40, 20);
  ctx.fill();

  // Draw Cells & Tokens
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cx = startX + c * cellWidth + cellWidth / 2;
      const cy = startY + r * cellHeight + cellHeight / 2;

      // Draw empty slot
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#020617'; // background color for empty hole
      ctx.fill();

      // Draw token if exists
      const cellValue = board[r][c];
      if (cellValue !== 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
        if (cellValue === 1) {
          ctx.fillStyle = '#818cf8'; // P1: indigo-400
          ctx.fill();
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#c7d2fe'; // Lighter border
          ctx.stroke();
        } else if (cellValue === 2) {
          ctx.fillStyle = '#f43f5e'; // AI: rose-500
          ctx.fill();
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#fecdd3';
          ctx.stroke();
        }
      }
    }
  }
};

const ReplayHUD = ({ history, gameTypeId, winnerCode, onPlayAgain }) => {
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isExportingNerd, setIsExportingNerd] = useState(false);

  const handleExportVideo = async () => {
    setIsExportingVideo(true);
    try {
      const blob = await renderGameToVideo(history, renderConnect4Frame, 1080, 1080, 30);
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);

      // Auto download
      const a = document.createElement('a');
      a.href = url;
      a.download = `nerdhub-replay-${Date.now()}.mp4`;
      a.click();
    } catch (error) {
      console.error("Video export failed:", error);
    } finally {
      setIsExportingVideo(false);
    }
  };

  const handleExportNerdFile = async () => {
    setIsExportingNerd(true);
    try {
      // Clean history to only include indices for serialization
      // Connect 4 moves are just columns, but our history might have row/col
      // The encodeMoveSequence expects an array of indices or objects with .index
      const serializedHistory = history.map(move => ({ index: move.col }));

      const dataStr = serializeGame(gameTypeId, '1', winnerCode, serializedHistory);
      await exportNerdFile(dataStr, `match-${Date.now()}.nerd`);
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
