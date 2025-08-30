import React from 'react';
import { Chess, Square } from 'chess.js';
import { PieceValue } from '../types/chess';
import { Target, Info, TrendingUp, TrendingDown } from 'lucide-react';

interface PieceDetailsProps {
  chess: Chess;
  selectedSquare: string | null;
  pieceValues: Record<string, PieceValue>;
}

const pieceNames: Record<string, string> = {
  'p': 'Pawn',
  'n': 'Knight',
  'b': 'Bishop',
  'r': 'Rook',
  'q': 'Queen',
  'k': 'King'
};

const pieceSymbols: Record<string, string> = {
  'wk': '♔', 'wq': '♕', 'wr': '♖', 'wb': '♗', 'wn': '♘', 'wp': '♙',
  'bk': '♚', 'bq': '♛', 'br': '♜', 'bb': '♝', 'bn': '♞', 'bp': '♟'
};

export const PieceDetails: React.FC<PieceDetailsProps> = ({ chess, selectedSquare, pieceValues }) => {
  if (!selectedSquare) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Piece Details</h3>
        </div>
        
        <div className="text-center py-8">
          <div className="text-6xl mb-4 opacity-30">♔</div>
          <p className="text-gray-500">
            <span className="hidden sm:inline">Right-click on a piece to see its valuation details</span>
            <span className="sm:hidden">Right-click on a piece to see its valuation details (feature available on desktop)</span>
          </p>
        </div>
      </div>
    );
  }

  const piece = chess.get(selectedSquare as Square);
  if (!piece) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Piece Details</h3>
        </div>
        
        <div className="text-center py-8">
          <p className="text-gray-500">Empty square selected</p>
        </div>
      </div>
    );
  }

  const pieceValue = pieceValues[selectedSquare];
  const pieceName = pieceNames[piece.type] || 'Pièce inconnue';
  const pieceSymbol = pieceSymbols[`${piece.color}${piece.type}`];
  const colorName = piece.color === 'w' ? 'White' : 'Black';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Piece Details</h3>
      </div>
      
      {/* Piece Header */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-4xl">{pieceSymbol}</div>
        <div>
          <h4 className="text-xl font-bold text-gray-800">{pieceName} {colorName}</h4>
          <p className="text-gray-600">Square: {selectedSquare.toUpperCase()}</p>
        </div>
      </div>

      {/* Value Summary */}
      {pieceValue && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">Base Value</span>
              </div>
              <span className="text-xl font-bold text-blue-600">{pieceValue.baseValue}</span>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-800">Total Value</span>
              </div>
              <span className="text-xl font-bold text-purple-600">{pieceValue.totalValue}</span>
            </div>
          </div>

          {/* Bonuses and Penalties */}
          <div className="grid grid-cols-2 gap-4">
            {pieceValue.bonuses > 0 && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-800">Bonuses</span>
                </div>
                <span className="text-lg font-bold text-green-600">+{pieceValue.bonuses}</span>
              </div>
            )}
            
            {pieceValue.penalties > 0 && (
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-semibold text-red-800">Penalties</span>
                </div>
                <span className="text-lg font-bold text-red-600">-{pieceValue.penalties}</span>
              </div>
            )}
          </div>

          {/* Detailed Explanation */}
          <div className="border-t pt-4">
            <h5 className="font-semibold text-gray-800 mb-3">Detailed Calculation:</h5>
            <div className="space-y-2">
              {pieceValue.explanation.map((explanation, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-400 mt-1">•</span>
                  <span className="text-gray-700">{explanation}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Tips */}
          <div className="mt-6 p-4 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">Strategic Advice</span>
            </div>
            <p className="text-xs text-amber-700">
              {getStrategicTip(piece.type, pieceValue)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

function getStrategicTip(pieceType: string, pieceValue: PieceValue): string {
  switch (pieceType) {
    case 'p':
      if (pieceValue.explanation.some(e => e.includes('passed'))) {
        return "This passed pawn is very valuable! Try to push it towards promotion while protecting it.";
      }
      if (pieceValue.explanation.some(e => e.includes('isolated'))) {
        return "This isolated pawn is vulnerable. Consider supporting it with other pieces or trading it.";
      }
      return "Central and advanced pawns are generally stronger. Try to support them with each other.";
    
    case 'n':
      if (pieceValue.explanation.some(e => e.includes('central'))) {
        return "Excellent placement! Knights in the center control many important squares.";
      }
      if (pieceValue.explanation.some(e => e.includes('edge'))) {
        return "Knights on the edge are less effective. Try to reposition it towards the center.";
      }
      return "Knights are stronger in the center where they control more squares.";
    
    case 'b':
      if (pieceValue.explanation.some(e => e.includes('open diagonal'))) {
        return "This bishop has a nice open diagonal! Use it to apply long-term pressure.";
      }
      if (pieceValue.explanation.some(e => e.includes('blocked'))) {
        return "This bishop is hindered by its own pawns. Consider advancing pawns to free the diagonal.";
      }
      return "Bishops are stronger with open diagonals and as a pair.";
    
    case 'r':
      if (pieceValue.explanation.some(e => e.includes('open column'))) {
        return "This rook on an open file is very active! Use it to attack or control weak points.";
      }
      if (pieceValue.explanation.some(e => e.includes('7th rank'))) {
        return "Rook on the 7th rank - very strong position to attack pawns and confine the enemy king.";
      }
      return "Rooks are stronger on open files and important ranks.";
    
    case 'q':
      return "The queen is your most powerful piece. Keep it safe while looking for tactical opportunities.";
    
    case 'k':
      return "King safety is paramount. In the endgame, the king becomes more active.";
    
    default:
      return "Each piece has its strengths and weaknesses depending on its position on the board.";
  }
}