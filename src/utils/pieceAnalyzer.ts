import { Chess, Square } from 'chess.js';
import { PieceValue } from '../types/chess';

export class PieceAnalyzer {
  private chess: Chess;
  
  constructor(chess: Chess) {
    this.chess = chess;
  }

  analyzePiece(square: string): PieceValue {
    const piece = this.chess.get(square as Square);
    if (!piece) {
      return { baseValue: 0, bonuses: 0, penalties: 0, totalValue: 0, explanation: [] };
    }

    switch (piece.type) {
      case 'p':
        return this.analyzePawn(square, piece.color);
      case 'n':
        return this.analyzeKnight(square, piece.color);
      case 'b':
        return this.analyzeBishop(square, piece.color);
      case 'r':
        return this.analyzeRook(square, piece.color);
      case 'q':
        return this.analyzeQueen(square, piece.color);
      case 'k':
        return this.analyzeKing(square, piece.color);
      default:
        return { baseValue: 0, bonuses: 0, penalties: 0, totalValue: 0, explanation: [] };
    }
  }

  private analyzePawn(square: string, color: 'w' | 'b'): PieceValue {
    const baseValue = 1;
    let bonuses = 0;
    let penalties = 0;
    const explanation: string[] = ['Base: 1'];

    const file = square[0];
    const rank = parseInt(square[1]);
    
    // In opponent half
    const isInOpponentHalf = (color === 'w' && rank >= 5) || (color === 'b' && rank <= 4);
    if (isInOpponentHalf) {
      bonuses += 0.5;
      explanation.push('+0.5 (opponent half)');
    }

    // Passed pawn check
    if (this.isPawnPassed(square, color)) {
      bonuses += 0.5;
      explanation.push('+0.5 (passed)');
      
      // Bonus for passed pawn close to promotion
      const isCloseToPromotion = (color === 'w' && rank >= 6) || (color === 'b' && rank <= 3);
      if (isCloseToPromotion) {
        bonuses += 1.0;
        explanation.push('+1.0 (close to promotion)');
      }
    }

    // Isolated or doubled pawn
    if (this.isPawnIsolated(square, color) || this.isPawnDoubled(square, color)) {
      penalties += 0.5;
      explanation.push('-0.5 (isolated/doubled)');
    }

    // Defended by other pawns
    const defendingPawns = this.countDefendingPawns(square, color);
    if (defendingPawns > 0) {
      bonuses += 0.3;
      explanation.push('+0.3 (defended)');
    }

    // Central control bonus
    const centralSquares = ['d4', 'e4', 'd5', 'e5'];
    const controlsCentral = this.pawnControlsCentralSquares(square, color);
    const isOnCentral = centralSquares.includes(square);
    
    if (isOnCentral || controlsCentral > 0) {
      bonuses += 0.3;
      if (isOnCentral) {
        explanation.push('+0.3 (on central square)');
      } else {
        explanation.push(`+0.3 (controls ${controlsCentral} central square${controlsCentral > 1 ? 's' : ''})`);
      }
    }

    // Column position bonuses
    if (file === 'd' || file === 'e') {
      bonuses += 0.5;
      explanation.push('+0.5 (on d/e column)');
    } else if (file === 'c' || file === 'f') {
      bonuses += 0.3;
      explanation.push('+0.3 (on c/f column)');
    }

    const totalValue = Math.round((baseValue + bonuses - penalties) * 10) / 10;
    return { baseValue, bonuses, penalties, totalValue, explanation };
  }

  private analyzeKnight(square: string, color: 'w' | 'b'): PieceValue {
    const baseValue = 3;
    let bonuses = 0;
    let penalties = 0;
    const explanation: string[] = ['Base: 3'];

    // Central squares
    const centralSquares = ['d4', 'e4', 'd5', 'e5'];
    if (centralSquares.includes(square)) {
      bonuses += 1;
      explanation.push('+1 (central)');
    }

    // Edge columns
    const file = square[0];
    if (file === 'a' || file === 'h') {
      penalties += 1;
      explanation.push('-1 (edge)');
    }

    const totalValue = Math.round((baseValue + bonuses - penalties) * 10) / 10;
    return { baseValue, bonuses, penalties, totalValue, explanation };
  }

  private analyzeBishop(square: string, color: 'w' | 'b'): PieceValue {
    const baseValue = 3;
    let bonuses = 0;
    let penalties = 0;
    const explanation: string[] = ['Base: 3'];

    // Open diagonal check - bonus if at least one diagonal direction is free
    if (this.hasOpenDiagonal(square, color)) {
      bonuses += 1;
      explanation.push('+1 (open diagonal)');
    }

    // Blocked by own pawns - penalty only if both diagonals are blocked
    if (this.isBishopBlockedByPawns(square, color)) {
      penalties += 1;
      explanation.push('-1 (both diagonals blocked)');
    }

    // Bishop pair bonus
    if (this.hasBishopPair(color)) {
      bonuses += 0.5;
      explanation.push('+0.5 (bishop pair)');
    }

    const totalValue = Math.round((baseValue + bonuses - penalties) * 10) / 10;
    return { baseValue, bonuses, penalties, totalValue, explanation };
  }

  private analyzeRook(square: string, color: 'w' | 'b'): PieceValue {
    const baseValue = 5;
    let bonuses = 0;
    let penalties = 0;
    const explanation: string[] = ['Base: 5'];

    // Open column
    if (this.isOnOpenColumn(square)) {
      bonuses += 1;
      explanation.push('+1 (open column)');
    } else if (this.isOnSemiOpenColumn(square, color)) {
      bonuses += 0.5;
      explanation.push('+0.5 (semi-open column)');
    }

    // 7th rank in opponent territory
    const rank = parseInt(square[1]);
    const isOn7thRank = (color === 'w' && rank === 7) || (color === 'b' && rank === 2);
    if (isOn7thRank) {
      bonuses += 1;
      explanation.push('+1 (7th rank)');
    }

    // Connected rooks bonus
    if (this.areRooksConnected(square, color)) {
      bonuses += 0.5;
      explanation.push('+0.5 (connected rooks)');
    }

    const totalValue = Math.round((baseValue + bonuses - penalties) * 10) / 10;
    return { baseValue, bonuses, penalties, totalValue, explanation };
  }

  private analyzeQueen(square: string, color: 'w' | 'b'): PieceValue {
    const baseValue = 9;
    const explanation: string[] = ['Base: 9'];
    return { baseValue, bonuses: 0, penalties: 0, totalValue: Math.round(baseValue * 10) / 10, explanation };
  }

  private analyzeKing(square: string, color: 'w' | 'b'): PieceValue {
    const baseValue = 0;
    const explanation: string[] = ['Base: 0'];

    return { baseValue, bonuses: 0, penalties: 0, totalValue: Math.round(baseValue * 10) / 10, explanation };
  }

  private isPawnPassed(square: string, color: 'w' | 'b'): boolean {
    const file = square[0];
    const rank = parseInt(square[1]);
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const fileIndex = files.indexOf(file);
    
    const filesToCheck = [];
    if (fileIndex > 0) filesToCheck.push(files[fileIndex - 1]);
    filesToCheck.push(file);
    if (fileIndex < 7) filesToCheck.push(files[fileIndex + 1]);

    for (const checkFile of filesToCheck) {
      const startRank = color === 'w' ? rank + 1 : rank - 1;
      const endRank = color === 'w' ? 8 : 1;
      const direction = color === 'w' ? 1 : -1;

      for (let r = startRank; color === 'w' ? r <= endRank : r >= endRank; r += direction) {
        const checkSquare = `${checkFile}${r}` as Square;
        const piece = this.chess.get(checkSquare);
        if (piece && piece.type === 'p' && piece.color !== color) {
          return false;
        }
      }
    }
    return true;
  }

  private isPawnIsolated(square: string, color: 'w' | 'b'): boolean {
    const file = square[0];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const fileIndex = files.indexOf(file);
    
    const adjacentFiles = [];
    if (fileIndex > 0) adjacentFiles.push(files[fileIndex - 1]);
    if (fileIndex < 7) adjacentFiles.push(files[fileIndex + 1]);

    for (const adjFile of adjacentFiles) {
      for (let rank = 1; rank <= 8; rank++) {
        const checkSquare = `${adjFile}${rank}` as Square;
        const piece = this.chess.get(checkSquare);
        if (piece && piece.type === 'p' && piece.color === color) {
          return false;
        }
      }
    }
    return true;
  }

  private isPawnDoubled(square: string, color: 'w' | 'b'): boolean {
    const file = square[0];
    const rank = parseInt(square[1]);
    
    // Check if there's another pawn of the same color in front of this pawn
    const direction = color === 'w' ? 1 : -1;
    const frontRank = rank + direction;
    
    // Only check squares in front of the current pawn
    for (let r = frontRank; color === 'w' ? r <= 8 : r >= 1; r += direction) {
      const checkSquare = `${file}${r}` as Square;
      const piece = this.chess.get(checkSquare);
      if (piece && piece.type === 'p' && piece.color === color) {
        return true; // This pawn is blocked by another pawn in front
      }
    }
    return false;
  }

  private isOnLongDiagonal(square: string): boolean {
    const longDiagonals = [
      ['a1', 'b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8'],
      ['h1', 'g2', 'f3', 'e4', 'd5', 'c6', 'b7', 'a8']
    ];
    return longDiagonals.some(diagonal => diagonal.includes(square));
  }

  private hasOpenDiagonal(square: string, color: 'w' | 'b'): boolean {
    const file = square[0];
    const rank = parseInt(square[1]);
    
    // Check the four diagonal directions
    const upRight = this.isDiagonalOpen(square, color, 1, 1);
    const downLeft = this.isDiagonalOpen(square, color, -1, -1);
    const upLeft = this.isDiagonalOpen(square, color, -1, 1);
    const downRight = this.isDiagonalOpen(square, color, 1, -1);
    
    // Return true if at least one diagonal direction is open (has at least 2-3 free squares)
    return upRight || downLeft || upLeft || downRight;
  }

  private isDiagonalOpen(square: string, color: 'w' | 'b', fileDir: number, rankDir: number): boolean {
    const file = square[0];
    const rank = parseInt(square[1]);
    let freeSquares = 0;
    
    // Check up to 7 squares in this diagonal direction
    for (let i = 1; i <= 7; i++) {
      const newFile = String.fromCharCode(file.charCodeAt(0) + fileDir * i);
      const newRank = rank + rankDir * i;
      const checkSquare = `${newFile}${newRank}`;
      
      if (!this.isValidSquare(checkSquare)) {
        break; // Reached edge of board
      }
      
      const piece = this.chess.get(checkSquare as Square);
      if (piece) {
        break; // Hit a piece, stop counting
      }
      
      freeSquares++;
    }
    
    // Consider diagonal "open" if it has at least 4 free squares
    return freeSquares >= 4;
  }

  private isBishopBlockedByPawns(square: string, color: 'w' | 'b'): boolean {
    // A bishop is penalized only if BOTH diagonal directions are blocked by own pawns
    const file = square[0];
    const rank = parseInt(square[1]);
    
    // Check the four diagonal directions
    const upRight = this.isDiagonalBlocked(square, color, 1, 1);
    const downLeft = this.isDiagonalBlocked(square, color, -1, -1);
    const upLeft = this.isDiagonalBlocked(square, color, -1, 1);
    const downRight = this.isDiagonalBlocked(square, color, 1, -1);
    
    // Check if both diagonal lines are blocked
    const diagonal1Blocked = upRight || downLeft; // One diagonal line
    const diagonal2Blocked = upLeft || downRight; // Other diagonal line
    
    // Only penalize if BOTH diagonal lines have at least one direction blocked
    return diagonal1Blocked && diagonal2Blocked;
  }

  private isDiagonalBlocked(square: string, color: 'w' | 'b', fileDir: number, rankDir: number): boolean {
    const file = square[0];
    const rank = parseInt(square[1]);
    
    // Check the immediate diagonal squares for blocking pawns
    for (let i = 1; i <= 2; i++) { // Only check first 2 squares for immediate blocking
      const newFile = String.fromCharCode(file.charCodeAt(0) + fileDir * i);
      const newRank = rank + rankDir * i;
      const checkSquare = `${newFile}${newRank}`;
      
      if (!this.isValidSquare(checkSquare)) {
        break; // Reached edge of board
      }
      
      const piece = this.chess.get(checkSquare as Square);
      if (piece) {
        // If we hit our own pawn immediately, this direction is blocked
        if (piece.color === color && piece.type === 'p') {
          return true;
        }
        // If we hit any other piece, stop but don't consider it blocking
        break;
      }
    }
    return false; // This direction is not blocked by own pawns
  }

  private isOnOpenColumn(square: string): boolean {
    const file = square[0];
    for (let rank = 1; rank <= 8; rank++) {
      const checkSquare = `${file}${rank}` as Square;
      if (checkSquare !== square) {
        const piece = this.chess.get(checkSquare);
        // Une colonne est ouverte s'il n'y a AUCUN pion (ni ami ni ennemi)
        if (piece && piece.type === 'p') {
          return false;
        }
      }
    }
    return true;
  }

  private isOnSemiOpenColumn(square: string, color: 'w' | 'b'): boolean {
    const file = square[0];
    let hasOwnPawn = false;
    
    // Check for pawns of our color on this file
    for (let rank = 1; rank <= 8; rank++) {
      const checkSquare = `${file}${rank}` as Square;
      if (checkSquare !== square) {
        const piece = this.chess.get(checkSquare);
        if (piece && piece.type === 'p' && piece.color === color) {
          hasOwnPawn = true;
          break;
        }
      }
    }
    
    // Semi-ouverte: pas de pions de notre camp sur cette colonne
    // (peu importe s'il y a des pions adverses)
    return !hasOwnPawn;
  }

  private areRooksConnected(square: string, color: 'w' | 'b'): boolean {
    const file = square[0];
    const rank = parseInt(square[1]);
    
    // Check horizontally for another rook
    for (let f = 'a'.charCodeAt(0); f <= 'h'.charCodeAt(0); f++) {
      const checkFile = String.fromCharCode(f);
      if (checkFile !== file) {
        const checkSquare = `${checkFile}${rank}` as Square;
        const piece = this.chess.get(checkSquare);
        if (piece && piece.type === 'r' && piece.color === color) {
          // Check if path is clear between rooks
          const startFile = Math.min(file.charCodeAt(0), f);
          const endFile = Math.max(file.charCodeAt(0), f);
          let pathClear = true;
          
          for (let checkF = startFile + 1; checkF < endFile; checkF++) {
            const pathSquare = `${String.fromCharCode(checkF)}${rank}` as Square;
            if (this.chess.get(pathSquare)) {
              pathClear = false;
              break;
            }
          }
          
          if (pathClear) return true;
        }
      }
    }
    
    // Check vertically for another rook
    for (let r = 1; r <= 8; r++) {
      if (r !== rank) {
        const checkSquare = `${file}${r}` as Square;
        const piece = this.chess.get(checkSquare);
        if (piece && piece.type === 'r' && piece.color === color) {
          // Check if path is clear between rooks
          const startRank = Math.min(rank, r);
          const endRank = Math.max(rank, r);
          let pathClear = true;
          
          for (let checkR = startRank + 1; checkR < endRank; checkR++) {
            const pathSquare = `${file}${checkR}` as Square;
            if (this.chess.get(pathSquare)) {
              pathClear = false;
              break;
            }
          }
          
          if (pathClear) return true;
        }
      }
    }
    
    return false;
  }

  private hasBishopPair(color: 'w' | 'b'): boolean {
    let bishopCount = 0;
    const board = this.chess.board();
    
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece && piece.type === 'b' && piece.color === color) {
          bishopCount++;
        }
      }
    }
    
    return bishopCount >= 2;
  }

  private isValidSquare(square: string): boolean {
    return /^[a-h][1-8]$/.test(square);
  }

  private countDefendingPawns(square: string, color: 'w' | 'b'): number {
    const file = square[0];
    const rank = parseInt(square[1]);
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const fileIndex = files.indexOf(file);
    let defendingCount = 0;
    
    // Un pion peut être défendu par des pions sur les colonnes adjacentes
    // et une rangée en arrière (direction opposée à l'avancement)
    const backwardRank = color === 'w' ? rank - 1 : rank + 1;
    
    // Vérifier les colonnes adjacentes
    const adjacentFiles = [];
    if (fileIndex > 0) adjacentFiles.push(files[fileIndex - 1]); // Colonne de gauche
    if (fileIndex < 7) adjacentFiles.push(files[fileIndex + 1]); // Colonne de droite
    
    for (const adjFile of adjacentFiles) {
      const defenderSquare = `${adjFile}${backwardRank}`;
      if (this.isValidSquare(defenderSquare)) {
        const piece = this.chess.get(defenderSquare as Square);
        if (piece && piece.type === 'p' && piece.color === color) {
          defendingCount++;
        }
      }
    }
    
    return defendingCount;
  }

  private pawnControlsCentralSquares(square: string, color: 'w' | 'b'): number {
    const file = square[0];
    const rank = parseInt(square[1]);
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const fileIndex = files.indexOf(file);
    const centralSquares = ['d4', 'e4', 'd5', 'e5'];
    let controlledCount = 0;
    
    // Un pion contrôle les cases diagonales devant lui
    const forwardRank = color === 'w' ? rank + 1 : rank - 1;
    
    // Vérifier les deux cases diagonales devant le pion
    const controlledSquares = [];
    if (fileIndex > 0) {
      controlledSquares.push(`${files[fileIndex - 1]}${forwardRank}`);
    }
    if (fileIndex < 7) {
      controlledSquares.push(`${files[fileIndex + 1]}${forwardRank}`);
    }
    
    // Compter combien de cases centrales sont contrôlées
    for (const controlledSquare of controlledSquares) {
      if (this.isValidSquare(controlledSquare) && centralSquares.includes(controlledSquare)) {
        controlledCount++;
      }
    }
    
    return controlledCount;
  }

  getAllPieceValues(): Record<string, PieceValue> {
    const values: Record<string, PieceValue> = {};
    const board = this.chess.board();
    
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece) {
          const square = `${String.fromCharCode(97 + file)}${8 - rank}`;
          values[square] = this.analyzePiece(square);
        }
      }
    }
    
    return values;
  }
}