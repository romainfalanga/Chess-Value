import React from 'react';
import { BookOpen, Award } from 'lucide-react';

const ValueLegend: React.FC = () => {
  const rules = [
    {
      piece: '♟',
      name: 'Pawn',
      rules: [
        'Base: 1 point',
        '+0.5 if in opponent half',
        '+0.5 if passed',
        '+1.0 if passed & close to promotion',
        '-0.5 if isolated',
        '-0.5 if blocked by front pawn',
        '+0.3 if defended by pawn',
        '+0.3 if on/controls central squares',
        '+0.5 if on d/e columns',
        '+0.3 if on c/f columns'
      ]
    },
    {
      piece: '♞',
      name: 'Knight',
      rules: [
        'Base: 3 points',
        '+1 if on central squares',
        '-1 if on edge columns (A/H)'
      ]
    },
    {
      piece: '♝',
      name: 'Bishop',
      rules: [
        'Base: 3 points',
        '+1 if has open diagonal (4+ squares)',
        '-1 if both diagonals blocked',
        '+0.5 if bishop pair'
      ]
    },
    {
      piece: '♜',
      name: 'Rook',
      rules: [
        'Base: 5 points',
        '+1 if on open column (no pawns at all)',
        '+0.5 if on semi-open column (no own pawns in front)',
        '+1 if on 7th rank',
        '+0.5 if connected to other rook'
      ]
    },
    {
      piece: '♛',
      name: 'Queen',
      rules: ['Base: 9 points']
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-purple-600" />
        <h3 className="text-xl font-semibold text-gray-800">Piece Valuation Rules</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {rules.map((rule, index) => (
          <div key={index} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{rule.piece}</span>
              <span className="font-semibold text-gray-800">{rule.name}</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              {rule.rules.map((r, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-purple-600" />
          <span className="text-lg font-semibold text-purple-800">Strategic Tip</span>
        </div>
        <p className="text-sm text-purple-700">
          Watch how piece values change when you move them to different squares. 
          Strategic positioning can significantly increase a piece's worth! 
          Right-click on a piece to see detailed value calculation.
        </p>
      </div>
    </div>
  );
};

export default ValueLegend;