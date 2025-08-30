import React from 'react';
import { Chess } from 'chess.js';
import { PieceValue } from '../types/chess';
import { Info, Target, TrendingUp } from 'lucide-react';

interface GameInfoProps {
  chess: Chess;
  pieceValues: Record<string, PieceValue>;
}

export const GameInfo: React.FC<GameInfoProps> = ({ chess, pieceValues }) => {
  const calculateTotalValue = (color: 'w' | 'b') => {
    const total = Object.entries(pieceValues)
      .filter(([square]) => {
        const piece = chess.get(square as any);
        return piece && piece.color === color;
      })
      .reduce((total, [, value]) => total + value.totalValue, 0);
    return Math.round(total * 10) / 10;
  };

  const whiteTotal = calculateTotalValue('w');
  const blackTotal = calculateTotalValue('b');
  const advantage = Math.round((whiteTotal - blackTotal) * 10) / 10;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Position Analysis</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Turn:</span>
          <span className="font-semibold">
            {chess.turn() === 'w' ? '♔ White' : '♚ Black'}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">♔ White Total:</span>
            <span className="font-semibold text-blue-600">{whiteTotal}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">♚ Black Total:</span>
            <span className="font-semibold text-gray-800">{blackTotal}</span>
          </div>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">Advantage:</span>
            </div>
            <span className={`font-bold ${advantage > 0 ? 'text-blue-600' : advantage < 0 ? 'text-gray-800' : 'text-green-600'}`}>
              {advantage > 0 ? `White +${advantage}` : 
               advantage < 0 ? `Black +${Math.abs(advantage)}` : 
               'Equal'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-800">Educational Goal</span>
        </div>
        <p className="text-xs text-blue-700">
          Values shown on pieces reflect their strategic worth based on position, 
          activity, and tactical potential. Move pieces to see how positioning affects value!
        </p>
      </div>
    </div>
  );
};