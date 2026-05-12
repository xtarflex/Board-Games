// Basic Minimax for Connect Four
export const getBestMoveC4 = (board) => {
  const ROWS = 6;
  const COLS = 7;
  
  const getLowestEmptyRow = (b, c) => {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (b[r][c] === 0) return r;
    }
    return -1;
  };
  
  // Return a random valid move for MVP AI if depth isn't reached
  // (Full minimax implementation takes considerable code, implementing a fast heuristic)
  const availableCols = [];
  for(let c=0; c<COLS; c++) {
    if(getLowestEmptyRow(board, c) !== -1) {
      availableCols.push(c);
    }
  }
  
  if (availableCols.length === 0) return null;
  return availableCols[Math.floor(Math.random() * availableCols.length)];
}

// Minimax for Tic Tac Toe
export const getBestMoveTTT = (board) => {
  const WIN_SCORE = 10;

  const checkWin = (b, player) => {
    const winPatterns = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return winPatterns.some(p => p.every(i => b[i] === player));
  };

  const minimax = (b, depth, isMaximizing) => {
    if (checkWin(b, 2)) return WIN_SCORE - depth;
    if (checkWin(b, 1)) return depth - WIN_SCORE;
    if (b.every(cell => cell !== 0)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (b[i] === 0) {
          b[i] = 2;
          let score = minimax(b, depth + 1, false);
          b[i] = 0;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (b[i] === 0) {
          b[i] = 1;
          let score = minimax(b, depth + 1, true);
          b[i] = 0;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  let bestScore = -Infinity;
  let move = -1;

  const tempBoard = [...board];
  for (let i = 0; i < 9; i++) {
    if (tempBoard[i] === 0) {
      tempBoard[i] = 2;
      let score = minimax(tempBoard, 0, false);
      tempBoard[i] = 0;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
};

import { getValidMovesOthello } from './gameLogic.js';

export const getBestMoveOthello = (board, player) => {
  const validMoves = getValidMovesOthello(board, player);
  if (validMoves.length === 0) return null;

  const WEIGHT_MAP = [
    [100, -20,  10,   5,   5,  10, -20, 100],
    [-20, -50,  -2,  -2,  -2,  -2, -50, -20],
    [ 10,  -2,  -1,  -1,  -1,  -1,  -2,  10],
    [  5,  -2,  -1,   0,   0,  -1,  -2,   5],
    [  5,  -2,  -1,   0,   0,  -1,  -2,   5],
    [ 10,  -2,  -1,  -1,  -1,  -1,  -2,  10],
    [-20, -50,  -2,  -2,  -2,  -2, -50, -20],
    [100, -20,  10,   5,   5,  10, -20, 100]
  ];

  let bestMove = null;
  let bestScore = -Infinity;

  for (let move of validMoves) {
    let score = WEIGHT_MAP[move.r][move.c];
    // Adding a tiny random factor so it doesn't play exactly the same game every time if scores tie
    score += Math.random() * 0.1;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

import { applyMoveMancala } from './gameLogic.js';

export const getBestMoveMancala = (board) => {
  // Simple heuristic:
  // 1. Can we get an extra turn? Do it.
  // 2. Can we capture? Do it.
  // 3. Otherwise pick pit closest to store to build up right side.
  // Player 2 pits are 7 to 12.

  let bestMove = -1;

  // Rule 1: Extra Turn
  for(let i=7; i<=12; i++) {
    if (board[i] === 0) continue;
    if (i + board[i] === 13) return i; // Lands exactly in store
  }

  // Rule 2: Capture
  for(let i=7; i<=12; i++) {
    if (board[i] === 0) continue;
    const res = applyMoveMancala(board, i, 2);
    // Rough check: if our score went up by more than 1, we probably captured
    if (res.newBoard[13] > board[13] + 1) {
       return i;
    }
  }

  // Rule 3: Rightmost valid move
  for(let i=12; i>=7; i--) {
    if(board[i] > 0) return i;
  }

  return bestMove;
};

import { getValidMovesMorris, checkWinMorris } from './gameLogic.js';

export const getBestMoveMorris = (board, phase) => {
  // Simple heuristic for Three Men's Morris AI
  // If placement: Try to win, try to block, else center, else random
  if (phase === 'placement') {
    const valid = getValidMovesMorris(board, phase, 2);

    // Win
    for (let m of valid) {
      let b = [...board]; b[m] = 2;
      if (checkWinMorris(b) === 2) return m;
    }
    // Block
    for (let m of valid) {
      let b = [...board]; b[m] = 1;
      if (checkWinMorris(b) === 1) return m;
    }
    // Center
    if (board[4] === 0) return 4;

    // Random
    if (valid.length > 0) return valid[Math.floor(Math.random() * valid.length)];
    return null;
  }

  // Movement
  if (phase === 'movement') {
    const nodes = getValidMovesMorris(board, phase, 2); // nodes that can move

    // Check if any move wins immediately
    for(let start of nodes) {
      const ends = getValidMovesMorris(board, phase, 2, start);
      for(let end of ends) {
        let b = [...board];
        b[start] = 0; b[end] = 2;
        if(checkWinMorris(b) === 2) return {start, end};
      }
    }

    // Try to block opponent's next win
    // Note: this is a bit deep, let's just do random valid move if no immediate win
    if (nodes.length > 0) {
      // shuffle nodes
      const shuffledNodes = nodes.sort(() => 0.5 - Math.random());
      for (let start of shuffledNodes) {
        const ends = getValidMovesMorris(board, phase, 2, start);
        if (ends.length > 0) {
          return { start, end: ends[Math.floor(Math.random() * ends.length)] };
        }
      }
    }
  }
  return null;
};
