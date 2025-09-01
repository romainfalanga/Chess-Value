import React, { useState, useEffect } from 'react';
import { Chess, Move } from 'chess.js';
import { ChessBoard } from './components/ChessBoard';
import { GameInfo } from './components/GameInfo';
import ValueLegend from './components/ValueLegend';
import { PieceDetails } from './components/PieceDetails';
import { PGNImporter } from './components/PGNImporter';
import { PieceAnalyzer } from './utils/pieceAnalyzer';
import { PieceValue } from './types/chess';
import { Crown, RotateCcw, Play, Upload, ChevronLeft, ChevronRight } from 'lucide-react';

function App() {
  const [chess, setChess] = useState(new Chess());
  const [pieceValues, setPieceValues] = useState<Record<string, PieceValue>>({});
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [importedMoves, setImportedMoves] = useState<Move[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [showPGNImporter, setShowPGNImporter] = useState(false);

  useEffect(() => {
    updatePieceValues();
  }, [chess]);

  const updatePieceValues = () => {
    const analyzer = new PieceAnalyzer(chess);
    const values = analyzer.getAllPieceValues();
    setPieceValues(values);
  };

  const handleMove = (move: Move) => {
    // Empêcher les nouveaux coups si on est en train de regarder une partie importée
    if (importedMoves.length === 0) {
      const newChess = new Chess(chess.fen());
      setChess(newChess);
      setMoveHistory(prev => [...prev, move]);
      setSelectedSquare(null);
      // Values will be updated automatically via useEffect
    }
  };

  const handleSquareSelect = (square: string | null) => {
    setSelectedSquare(square);
  };
  const resetGame = () => {
    const newChess = new Chess();
    setChess(newChess);
    setMoveHistory([]);
    setImportedMoves([]);
    setCurrentMoveIndex(-1);
    setSelectedSquare(null);
  };

  const undoMove = () => {
    if (importedMoves.length > 0) {
      // Navigation dans une partie importée
      if (currentMoveIndex > -1) {
        const newIndex = currentMoveIndex - 1;
        setCurrentMoveIndex(newIndex);
        
        const newChess = new Chess();
        for (let i = 0; i <= newIndex; i++) {
          newChess.move(importedMoves[i]);
        }
        setChess(newChess);
        setSelectedSquare(null);
      }
    } else if (moveHistory.length > 0) {
      // Annulation d'un coup dans une partie normale
      const newChess = new Chess();
      const newHistory = moveHistory.slice(0, -1);
      
      newHistory.forEach(move => {
        newChess.move(move);
      });
      
      setChess(newChess);
      setMoveHistory(newHistory);
      setSelectedSquare(null);
    }
  };

  const nextMove = () => {
    if (importedMoves.length > 0 && currentMoveIndex < importedMoves.length - 1) {
      const newIndex = currentMoveIndex + 1;
      setCurrentMoveIndex(newIndex);
      
      const newChess = new Chess();
      for (let i = 0; i <= newIndex; i++) {
        newChess.move(importedMoves[i]);
      }
      setChess(newChess);
      setSelectedSquare(null);
    }
  };

  const handlePGNImport = (pgn: string) => {
    try {
      const newChess = new Chess();
      newChess.loadPgn(pgn);
      
      // Get all moves from the PGN
      const history = newChess.history({ verbose: true });
      
      // Reset to starting position and replay moves
      const gameChess = new Chess();
      setChess(gameChess);
      setMoveHistory([]);
      setImportedMoves(history);
      setCurrentMoveIndex(-1);
      setSelectedSquare(null);
      setShowPGNImporter(false);
    } catch (error) {
      console.error('Error loading PGN:', error);
      alert('Invalid PGN format. Please check your PGN and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Chess Value</h1>
        </div>

        {/* Game Controls */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 px-4">
          <button
            onClick={resetGame}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg font-semibold text-sm sm:text-base"
          >
            <Play className="w-5 h-5" />
            New Game
          </button>
          <button
            onClick={() => setShowPGNImporter(true)}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg font-semibold text-sm sm:text-base"
          >
            <Upload className="w-5 h-5" />
            Import Game
          </button>
        </div>

        {/* Main Game Area */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-4 lg:gap-8 max-w-7xl mx-auto">
          {/* Left Sidebar - Piece Details */}
          <div className="order-2 lg:order-1 w-full lg:w-80 px-2 lg:px-0">
            <PieceDetails 
              chess={chess}
              selectedSquare={selectedSquare}
              pieceValues={pieceValues}
            />
          </div>

          {/* Chess Board */}
          <div className="order-1 lg:order-2 flex-shrink-0 w-full max-w-md mx-auto lg:max-w-none lg:w-auto px-2 lg:px-0">
            <ChessBoard 
              chess={chess} 
              onMove={handleMove}
              pieceValues={pieceValues}
              onSquareSelect={handleSquareSelect}
              selectedSquare={selectedSquare}
            />
            
            {/* Move Counter and Undo Button */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 mt-4 px-2">
              {importedMoves.length > 0 ? (
                // Navigation pour partie importée
                <div className="flex items-center gap-2 sm:gap-4">
                  <button
                    onClick={undoMove}
                    disabled={currentMoveIndex < 0}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg font-semibold text-xs sm:text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>
                  
                  <div className="text-center">
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Move {currentMoveIndex + 1} / {importedMoves.length}
                    </p>
                    {currentMoveIndex >= 0 && (
                      <span className="font-mono text-xs sm:text-sm text-gray-500">
                        {importedMoves[currentMoveIndex].san}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={nextMove}
                    disabled={currentMoveIndex >= importedMoves.length - 1}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg font-semibold text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                // Interface normale pour partie en cours
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                  <button
                    onClick={undoMove}
                    disabled={moveHistory.length === 0}
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg font-semibold text-xs sm:text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Undo Move
                  </button>
                  <p className="text-gray-600 text-xs sm:text-sm text-center">
                    Move {Math.floor(moveHistory.length / 2) + 1} • 
                    {moveHistory.length > 0 && (
                      <span className="ml-1 sm:ml-2 font-mono text-xs sm:text-sm">
                        Last: {moveHistory[moveHistory.length - 1].san}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Game Info */}
          <div className="order-3 w-full lg:w-auto px-2 lg:px-0">
            <GameInfo chess={chess} pieceValues={pieceValues} />
          </div>
        </div>

        {/* Value Legend - Full Width Below Board */}
        <div className="mt-12 max-w-7xl mx-auto">
          <ValueLegend />
        </div>
        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>
            Click and drag pieces or click to select and move. 
            <span className="hidden sm:inline">Right-click to see details.</span>
            <span className="sm:hidden">Tap a piece to see details (right-click available on desktop).</span>
            Values update automatically!
          </p>
        </div>

        {/* PGN Importer Modal */}
        {showPGNImporter && (
          <PGNImporter
            onImport={handlePGNImport}
            onClose={() => setShowPGNImporter(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;