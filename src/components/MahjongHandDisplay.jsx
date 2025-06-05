// For displaying the current player's hand

// src/components/MahjongHandDisplay.jsx
import React from 'react';
import { Plus, Calculator, RotateCcw, Trophy, Flower } from 'lucide-react';
import TileButton from './TileButton';
import { styles } from '../App'; // Import styles from App for consistency

const MahjongHandDisplay = ({
  currentHand,
  currentFlowers,
  currentKongs,
  currentScoreResult,
  onAddTileClick,
  onCalculateHandScore,
  onClearAll,
  playerName
}) => {
  return (
    <div style={{...styles.card, marginTop: '2rem', padding: '1.5rem'}}>
      <h3 style={{ marginBottom: '1.5rem' }}>Your Hand ({playerName})</h3>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full shadow-lg mr-2 transition-colors inline-flex items-center text-sm"
          onClick={onAddTileClick}
        >
          <Plus className="mr-1" size={16} /> Add Tile
        </button>
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full shadow-lg mr-2 transition-colors inline-flex items-center text-sm"
          onClick={onCalculateHandScore}
        >
          <Calculator className="mr-1" size={16} /> Calculate Hand Tai
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full shadow-lg transition-colors inline-flex items-center text-sm"
          onClick={onClearAll}
        >
          <RotateCcw className="mr-1" size={16} /> Clear Hand
        </button>
      </div>

      {/* Hand Display */}
      <div className="mb-4">
        <div className="bg-white rounded-xl shadow-inner overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 border-b">
            <h4 className="text-md font-semibold flex items-center">
              🀄 Main Hand ({currentHand.length}/14)
            </h4>
          </div>
          <div className="p-4 flex flex-wrap justify-center" style={{ minHeight: '100px' }}>
            {currentHand.length === 0 ? (
              <div className="text-center text-gray-400 py-4 text-sm">
                No tiles in hand.
              </div>
            ) : (
              currentHand.map((tile, index) => (
                <TileButton
                  key={`hand-${index}`}
                  tile={tile}
                  canRemove={true}
                  onRemove={(idx, type) => {/* Handled by parent */}} // Pass removal logic from parent
                  index={index}
                  type="hand"
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Flowers and Kongs Display */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-inner overflow-hidden">
          <div className="bg-green-100 px-4 py-3 border-b">
            <h4 className="text-md font-semibold flex items-center">
              <Flower className="mr-1" size={16} /> Flower Tiles ({currentFlowers.length})
            </h4>
          </div>
          <div className="p-4 flex flex-wrap justify-center" style={{ minHeight: '80px' }}>
            {currentFlowers.length === 0 ? (
              <div className="text-center text-gray-400 py-2 text-sm">
                No flower tiles.
              </div>
            ) : (
              currentFlowers.map((tile, index) => (
                <TileButton
                  key={`flower-${index}`}
                  tile={tile}
                  canRemove={true}
                  onRemove={(idx, type) => {/* Handled by parent */}}
                  index={index}
                  type="flower"
                />
              ))
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-inner overflow-hidden">
          <div className="bg-yellow-100 px-4 py-3 border-b">
            <h4 className="text-md font-semibold flex items-center">
              🀆 Kong Tiles ({currentKongs.length})
            </h4>
          </div>
          <div className="p-4 flex flex-wrap justify-center" style={{ minHeight: '80px' }}>
            {currentKongs.length === 0 ? (
              <div className="text-center text-gray-400 py-2 text-sm">
                No kong tiles.
              </div>
            ) : (
              currentKongs.map((tile, index) => (
                <TileButton
                  key={`kong-${index}`}
                  tile={tile}
                  canRemove={true}
                  onRemove={(idx, type) => {/* Handled by parent */}}
                  index={index}
                  type="kong"
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Current Hand Score Display */}
      {currentScoreResult && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
          <h4 className="text-lg font-bold text-green-800 flex items-center mb-2">
            <Trophy className="mr-2" /> Your Hand Total: <span className="bg-green-500 text-white px-3 py-1 rounded-full ml-2">{currentScoreResult.score} Tai</span>
          </h4>
          <ul className="list-disc list-inside text-green-700 text-sm">
            {currentScoreResult.tai.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MahjongHandDisplay;