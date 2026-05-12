export const checkWinC4 = (board, player) => {
  const ROWS = 6;
  const COLS = 7;

  // Check horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        board[r][c] === player &&
        board[r][c + 1] === player &&
        board[r][c + 2] === player &&
        board[r][c + 3] === player
      ) {
        return true;
      }
    }
  }

  // Check vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      if (
        board[r][c] === player &&
        board[r + 1][c] === player &&
        board[r + 2][c] === player &&
        board[r + 3][c] === player
      ) {
        return true;
      }
    }
  }

  // Check diagonal (bottom left to top right)
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        board[r][c] === player &&
        board[r - 1][c + 1] === player &&
        board[r - 2][c + 2] === player &&
        board[r - 3][c + 3] === player
      ) {
        return true;
      }
    }
  }

  // Check diagonal (top left to bottom right)
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        board[r][c] === player &&
        board[r + 1][c + 1] === player &&
        board[r + 2][c + 2] === player &&
        board[r + 3][c + 3] === player
      ) {
        return true;
      }
    }
  }

  return false;
};

// Also adding a draw check utility
export const checkDrawC4 = (board) => {
  for (let c = 0; c < 7; c++) {
    if (board[0][c] === 0) {
      return false; // Found an empty spot in the top row
    }
  }
  return true; // Top row is full
};

export const checkWinTTT = (board, player) => {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];
  return winPatterns.some(pattern =>
    pattern.every(index => board[index] === player)
  );
};

export const checkDrawTTT = (board) => {
  return board.every(cell => cell !== 0);
};

// Othello logic
export const getValidMovesOthello = (board, player) => {
  const validMoves = [];
  const opponent = player === 1 ? 2 : 1;
  const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] !== 0) continue;

      let isValid = false;
      for (let [dr, dc] of dirs) {
        let nr = r + dr, nc = c + dc;
        let flipped = 0;

        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === opponent) {
          nr += dr;
          nc += dc;
          flipped++;
        }

        if (flipped > 0 && nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === player) {
          isValid = true;
          break;
        }
      }

      if (isValid) validMoves.push({ r, c });
    }
  }
  return validMoves;
};

export const applyMoveOthello = (board, r, c, player) => {
  const newBoard = board.map(row => [...row]);
  const opponent = player === 1 ? 2 : 1;
  const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

  newBoard[r][c] = player;

  for (let [dr, dc] of dirs) {
    let nr = r + dr, nc = c + dc;
    let flipped = [];

    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && newBoard[nr][nc] === opponent) {
      flipped.push({r: nr, c: nc});
      nr += dr;
      nc += dc;
    }

    if (flipped.length > 0 && nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && newBoard[nr][nc] === player) {
      for (let cell of flipped) {
        newBoard[cell.r][cell.c] = player;
      }
    }
  }
  return newBoard;
};

export const getOthelloScore = (board) => {
  let p1 = 0, p2 = 0;
  for(let r=0; r<8; r++){
    for(let c=0; c<8; c++){
      if(board[r][c] === 1) p1++;
      else if(board[r][c] === 2) p2++;
    }
  }
  return { p1, p2 };
};

// Mancala logic (Kalah rules: 6 pits, 1 store per player, 4 seeds each)
export const getInitialMancalaBoard = () => {
  return [
    4, 4, 4, 4, 4, 4, 0, // P1: pits 0-5, store 6
    4, 4, 4, 4, 4, 4, 0  // P2: pits 7-12, store 13
  ];
};

export const applyMoveMancala = (board, pitIndex, player) => {
  const newBoard = [...board];
  let seeds = newBoard[pitIndex];
  newBoard[pitIndex] = 0;

  let currentPit = pitIndex;

  while (seeds > 0) {
    currentPit = (currentPit + 1) % 14;
    // Skip opponent's store
    if ((player === 1 && currentPit === 13) || (player === 2 && currentPit === 6)) {
      continue;
    }
    newBoard[currentPit]++;
    seeds--;
  }

  let extraTurn = false;
  // Extra turn if ends in own store
  if ((player === 1 && currentPit === 6) || (player === 2 && currentPit === 13)) {
    extraTurn = true;
  }

  // Capture if ends in empty pit on own side
  if (newBoard[currentPit] === 1) {
    if (player === 1 && currentPit >= 0 && currentPit <= 5) {
      const opposite = 12 - currentPit;
      if (newBoard[opposite] > 0) {
        newBoard[6] += newBoard[currentPit] + newBoard[opposite];
        newBoard[currentPit] = 0;
        newBoard[opposite] = 0;
      }
    } else if (player === 2 && currentPit >= 7 && currentPit <= 12) {
      const opposite = 12 - currentPit;
      if (newBoard[opposite] > 0) {
        newBoard[13] += newBoard[currentPit] + newBoard[opposite];
        newBoard[currentPit] = 0;
        newBoard[opposite] = 0;
      }
    }
  }

  // Check if game is over
  const p1Empty = newBoard.slice(0, 6).every(seeds => seeds === 0);
  const p2Empty = newBoard.slice(7, 13).every(seeds => seeds === 0);

  let isGameOver = false;
  if (p1Empty || p2Empty) {
    isGameOver = true;
    // Sweep remaining to stores
    for(let i=0; i<6; i++) {
      newBoard[6] += newBoard[i];
      newBoard[i] = 0;
    }
    for(let i=7; i<13; i++) {
      newBoard[13] += newBoard[i];
      newBoard[i] = 0;
    }
  }

  return { newBoard, extraTurn, isGameOver };
};

// Three Men's Morris Logic
export const getValidMovesMorris = (board, phase, player, selectedNode = null) => {
  const validMoves = [];

  if (phase === 'placement') {
    for (let i = 0; i < 9; i++) {
      if (board[i] === 0) validMoves.push(i);
    }
  } else if (phase === 'movement') {
    // 3x3 board connections
    const adj = [
      [1, 3, 4],       // 0
      [0, 2, 4],       // 1
      [1, 5, 4],       // 2
      [0, 4, 6],       // 3
      [0, 1, 2, 3, 5, 6, 7, 8], // 4
      [2, 4, 8],       // 5
      [3, 4, 7],       // 6
      [6, 8, 4],       // 7
      [5, 7, 4]        // 8
    ];

    if (selectedNode !== null) {
      if (board[selectedNode] === player) {
        for (let next of adj[selectedNode]) {
          if (board[next] === 0) validMoves.push(next);
        }
      }
    } else {
       // Just finding all nodes that CAN move
       for (let i = 0; i < 9; i++) {
         if (board[i] === player) {
           for (let next of adj[i]) {
             if (board[next] === 0) {
                validMoves.push(i);
                break;
             }
           }
         }
       }
    }
  }
  return validMoves;
};

export const checkWinMorris = (board) => {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  for (let p of winPatterns) {
    if (board[p[0]] !== 0 && board[p[0]] === board[p[1]] && board[p[1]] === board[p[2]]) {
      return board[p[0]];
    }
  }
  return null;
};
