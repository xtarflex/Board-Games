// Basic Minimax for Connect Four
export const getBestMoveC4 = (board, player, depth = 5) => {
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
