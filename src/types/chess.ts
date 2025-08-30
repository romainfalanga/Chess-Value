export interface Square {
  file: string;
  rank: number;
  square: string;
}

export interface Piece {
  type: string;
  color: 'w' | 'b';
  square: string;
}

export interface PieceValue {
  baseValue: number;
  bonuses: number;
  penalties: number;
  totalValue: number;
  explanation: string[];
}

export interface ChessPosition {
  fen: string;
  pieces: Piece[];
  pieceValues: Record<string, PieceValue>;
}