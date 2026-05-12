import { crc32 } from './crc32.js';

const toBase36 = (num) => num.toString(36);
const fromBase36 = (str) => parseInt(str, 36);
const XOR_KEY = 42; 

export const encodeMoveSequence = (history) => {
  const scrambled = history.map(move => {
    const rawIndex = move.index !== undefined ? move.index : move;
    return toBase36(rawIndex ^ XOR_KEY);
  });
  return scrambled.join('.');
};

export const decodeMoveSequence = (encodedStr) => {
  if (!encodedStr) return [];
  const moves = [];
  const parts = encodedStr.split('.');
  for (let i = 0; i < parts.length; i++) {
    const char = parts[i];
    const base10 = fromBase36(char);
    const unscrambled = base10 ^ XOR_KEY;
    moves.push({ index: unscrambled });
  }
  return moves;
};

export const generateChecksum = (data) => crc32(data).toString(16);

export const serializeGame = (gameTypeId, version, winnerCode, history) => {
  const header = `${gameTypeId}${version}${winnerCode}`;
  const encodedMoves = encodeMoveSequence(history);
  const hash = generateChecksum(`${header}-${encodedMoves}`);
  const payload = `${header}-${encodedMoves}-${hash}`;
  return btoa(payload);
};

export const deserializeGame = (base64Str) => {
  try {
    const payload = atob(base64Str);
    const parts = payload.split('-');
    
    if (parts.length !== 3) throw new Error("Invalid format");
    
    const [header, encodedMoves, hash] = parts;
    const expectedHash = generateChecksum(`${header}-${encodedMoves}`);
    
    if (hash !== expectedHash) {
      throw new Error("Checksum verification failed. File might be tampered.");
    }
    
    const gameTypeId = header.substring(0, header.length - 2);
    const version = header.charAt(header.length - 2);
    const winnerCode = header.charAt(header.length - 1);
    
    const history = decodeMoveSequence(encodedMoves);
    
    return { gameTypeId, version, winnerCode, history };
  } catch (error) {
    console.error("Failed to parse .nerd file:", error);
    return { error: error.message };
  }
};
