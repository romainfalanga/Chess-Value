import React, { useState } from 'react';
import { X, Upload, Info } from 'lucide-react';

interface PGNImporterProps {
  onImport: (pgn: string) => void;
  onClose: () => void;
}

export const PGNImporter: React.FC<PGNImporterProps> = ({ onImport, onClose }) => {
  const [pgn, setPgn] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pgn.trim()) {
      onImport(pgn.trim());
    }
  };

  const samplePGN = `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.01.20"]
[Round "-"]
[White "Player1"]
[Black "Player2"]
[Result "1-0"]
[WhiteElo "1500"]
[BlackElo "1480"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 1-0`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Import PGN Game</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">What is PGN?</span>
              </div>
              <p className="text-blue-700 text-sm mb-3">
                PGN (Portable Game Notation) is a standard format for recording chess games. 
                Import a PGN to analyze any game with our dynamic piece valuation system!
              </p>
              <h3 className="font-semibold text-blue-800 mb-2">How to get PGN from Chess.com:</h3>
              <p className="text-blue-700 text-sm">
                <span className="font-medium">Game → Share/Options → PGN → Copy</span> → Paste below
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="pgn" className="block text-sm font-medium text-gray-700 mb-2">
                  Paste your PGN here:
                </label>
                <textarea
                  id="pgn"
                  value={pgn}
                  onChange={(e) => setPgn(e.target.value)}
                  placeholder={samplePGN}
                  className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!pgn.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  <Upload className="w-5 h-5" />
                  Import Game
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};