import React, { useState, useEffect, useRef } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { PieceAnalyzer } from '../utils/pieceAnalyzer';
import { PieceValue } from '../types/chess';

interface ChessBoardProps {
  chess: Chess;
  onMove: (move: Move) => void;
  pieceValues: Record<string, PieceValue>;
  onSquareSelect: (square: string | null) => void;
  selectedSquare: string | null;
}

const pieceSymbols: Record<string, string> = {
  'wk': '♔', 'wq': '♕', 'wr': '♖', 'wb': '♗', 'wn': '♘', 'wp': '♙',
  'bk': '♚', 'bq': '♛', 'br': '♜', 'bb': '♝', 'bn': '♞', 'bp': '♟'
};

export const ChessBoard: React.FC<ChessBoardProps> = ({ chess, onMove, pieceValues, onSquareSelect, selectedSquare }) => {
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<{ square: string; element: HTMLElement } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  const handleSquareClick = (square: string) => {
    const piece = chess.get(square as Square);
    
    if (selectedSquare && possibleMoves.includes(square)) {
      // Make move
      try {
        const fromPiece = chess.get(selectedSquare as Square);
        const moveOptions: any = { from: selectedSquare as Square, to: square as Square };
        
        // Only add promotion if it's a pawn moving to the promotion rank
        if (fromPiece && fromPiece.type === 'p') {
          const toRank = parseInt(square[1]);
          if ((fromPiece.color === 'w' && toRank === 8) || (fromPiece.color === 'b' && toRank === 1)) {
            moveOptions.promotion = 'q';
          }
        }
        
        const move = chess.move(moveOptions);
        if (move) {
          onMove(move);
        }
      } catch (error) {
        console.error('Invalid move:', error);
      }
      setPossibleMoves([]);
      onSquareSelect(null);
    } else if (piece && piece.color === chess.turn()) {
      // Select piece
      onSquareSelect(square);
      const moves = chess.moves({ square: square as Square, verbose: true });
      setPossibleMoves(moves.map(move => move.to));
    } else {
      setPossibleMoves([]);
      onSquareSelect(null);
    }
  };

  const handleRightClick = (e: React.MouseEvent, square: string) => {
    e.preventDefault(); // Empêche le menu contextuel du navigateur
    const piece = chess.get(square as Square);
    if (piece) {
      onSquareSelect(square);
    } else {
      onSquareSelect(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, square: string) => {
    const piece = chess.get(square as Square);
    if (!piece || piece.color !== chess.turn()) {
      e.preventDefault();
      return;
    }
    
    onSquareSelect(square);
    const moves = chess.moves({ square: square as Square, verbose: true });
    setPossibleMoves(moves.map(move => move.to));
    
    setDraggedPiece({ square, element: e.currentTarget as HTMLElement });
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (possibleMoves.length > 0) {
      e.preventDefault();
    }
  };

  const handleDrop = (e: React.DragEvent, square: string) => {
    e.preventDefault();
    
    if (selectedSquare && possibleMoves.includes(square)) {
      try {
        const fromPiece = chess.get(selectedSquare as Square);
        const moveOptions: any = { from: selectedSquare as Square, to: square as Square };
        
        // Only add promotion if it's a pawn moving to the promotion rank
        if (fromPiece && fromPiece.type === 'p') {
          const toRank = parseInt(square[1]);
          if ((fromPiece.color === 'w' && toRank === 8) || (fromPiece.color === 'b' && toRank === 1)) {
            moveOptions.promotion = 'q';
          }
        }
        
        const move = chess.move(moveOptions);
        if (move) {
          onMove(move);
        }
      } catch (error) {
        console.error('Invalid move:', error);
      }
    }
    
    setPossibleMoves([]);
    setDraggedPiece(null);
    onSquareSelect(null);
  };

  const renderSquare = (file: string, rank: number) => {
    const square = `${file}${rank}`;
    const piece = chess.get(square as Square);
    const isLight = (files.indexOf(file) + rank) % 2 === 0;
    const isSelected = selectedSquare === square;
    const isPossibleMove = possibleMoves.includes(square);
    const pieceValue = piece ? pieceValues[square] : null;

    return (
      <div
        key={square}
        className={`
          relative aspect-square flex items-center justify-center cursor-pointer
          transition-all duration-200 hover:brightness-110
          ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
          ${isSelected ? 'ring-4 ring-blue-500 ring-inset' : ''}
          ${isPossibleMove ? 'ring-2 ring-green-500 ring-inset' : ''}
        `}
        onClick={() => handleSquareClick(square)}
        onContextMenu={(e) => handleRightClick(e, square)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, square)}
      >
        {/* Square coordinates */}
        {rank === 1 && (
          <span className="absolute bottom-0 right-0.5 sm:right-1 lg:right-2 xl:right-3 text-xs lg:text-sm xl:text-base font-semibold text-amber-700">
            {file}
          </span>
        )}
        {file === 'a' && (
          <span className="absolute top-0 left-0.5 sm:left-1 lg:left-2 xl:left-3 text-xs lg:text-sm xl:text-base font-semibold text-amber-700">
            {rank}
          </span>
        )}
        
        {/* Piece */}
        {piece && (
          <div
            className="relative z-10 select-none"
            draggable
            onDragStart={(e) => handleDragStart(e, square)}
          >
            <span className={`cursor-grab active:cursor-grabbing ${
              piece.color === 'b' 
                ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl' 
                : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl'
            }`}>
              {pieceSymbols[`${piece.color}${piece.type}`]}
            </span>
            
            {/* Piece value overlay */}
            {pieceValue && pieceValue.totalValue > 0 && piece.type !== 'k' && (
              <div className="absolute -top-1 -right-2 sm:-right-1 bg-blue-600 text-white font-bold rounded-full w-4 h-4 lg:w-6 lg:h-6 xl:w-7 xl:h-7 2xl:w-8 2xl:h-8 flex items-center justify-center shadow-lg border border-white">
                <span className="text-[7px] lg:text-xs xl:text-sm 2xl:text-base leading-none">
                  {pieceValue.totalValue}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Move indicator */}
        {isPossibleMove && !piece && (
          <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 xl:w-8 xl:h-8 2xl:w-10 2xl:h-10 bg-green-500 rounded-full opacity-60"></div>
        )}
        {isPossibleMove && piece && (
          <div className="absolute inset-0 border-2 sm:border-4 lg:border-6 xl:border-8 border-green-500 rounded-full opacity-60"></div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={boardRef}
        className="grid grid-cols-8 border-2 sm:border-4 border-amber-900 shadow-2xl rounded-lg overflow-hidden w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-none lg:w-[520px] xl:w-[580px] 2xl:w-[640px]"
      >
        {ranks.map(rank =>
          files.map(file => renderSquare(file, rank))
        )}
      </div>
    </div>
  );
};