// src/components/TileButton.jsx
import React from 'react';
import { X } from 'lucide-react';
import { tileNames, tileLabels } from '../data/MahjongTiles'; // Import data

const TileButton = ({ tile, onClick, canRemove = false, onRemove, index, type }) => (
  <div className="relative inline-block m-1">
    <button
      className="tile-button p-3 border-2 border-gray-300 rounded-lg shadow-lg bg-gradient-to-br from-white to-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 min-w-16 min-h-20 flex flex-col items-center justify-center"
      onClick={onClick}
    >
      <div className="text-3xl">{tileNames[tile]}</div>
      <div className="text-xs mt-1 text-gray-600">{tileLabels[tile]}</div>
    </button>
    {canRemove && (
      <button
        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index, type);
        }}
      >
        <X size={12} />
      </button>
    )}
  </div>
);

export default TileButton;