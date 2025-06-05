// src/components/TileSelectionModal.jsx
import React from 'react';
import appStyles from '../styles/appStyles'; // Import the shared styles

const TileSelectionModal = ({ show, onClose, tiles, onSelectTile, title, onSetTileType, tileType }) => {
    if (!show) return null;

    const allTileTypes = [
        'regular', 'flower', 'kong'
    ];

    // Example Mahjong tiles (you can expand this list)
    const mahjongTiles = {
        regular: ['一萬', '二萬', '三萬', '四萬', '五萬', '六萬', '七萬', '八萬', '九萬',
                  '一筒', '二筒', '三筒', '四筒', '五筒', '六筒', '七筒', '八筒', '九筒',
                  '一索', '二索', '三索', '四索', '五索', '六索', '七索', '八索', '九索',
                  '東', '南', '西', '北', '中', '發', '白'],
        flower: ['春', '夏', '秋', '冬', '梅', '蘭', '竹', '菊'],
        kong: ['東', '南', '西', '北', '中', '發', '白', '一萬', '二萬', '...'] // Example, should be a full list of possible Kongs
    };

    // Determine which tiles to display based on the selected type
    const tilesToDisplay = tileType === 'remove' ? tiles : mahjongTiles[tileType] || [];

    return (
        <div style={{ ...appStyles.modal, ...appStyles.modalActive }}>
            <div style={appStyles.modalContent}>
                <h2 style={appStyles.modalHeader}>{title}</h2>

                {/* Tile Type Selector (for adding/removing different kinds of tiles) */}
                <div style={appStyles.typeSelector}>
                    {onSetTileType && allTileTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => onSetTileType(type)}
                            style={tileType === type ?
                                { ...appStyles.btn, ...appStyles.btnSecondary, ...appStyles.typeButtonActive } : // Using appStyles.btn as base
                                { ...appStyles.btn, ...appStyles.btnSecondary }
                            }
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)} Tiles
                        </button>
                    ))}
                    {/* Add a button for "Remove Tile" if this modal is used for both adding and removing */}
                    <button
                        onClick={() => onSetTileType('remove')}
                        style={tileType === 'remove' ?
                            { ...appStyles.btn, ...appStyles.btnSecondary, ...appStyles.typeButtonActive } :
                            { ...appStyles.btn, ...appStyles.btnSecondary }
                        }
                    >
                        Remove Tile
                    </button>
                </div>

                <div style={appStyles.tileSelector}>
                    {tilesToDisplay && tilesToDisplay.length > 0 ? (
                        tilesToDisplay.map((tile, index) => (
                            <div
                                key={tile + index} // Use tile + index for unique key if tiles can repeat
                                style={appStyles.tile}
                                onClick={() => onSelectTile(tile)}
                            >
                                {tile}
                            </div>
                        ))
                    ) : (
                        <p style={{ color: appStyles.inputGroupLabel.color, width: '100%', textAlign: 'center' }}>No tiles available in this category.</p>
                    )}
                </div>
                <button style={{ ...appStyles.btn, ...appStyles.btnSecondary }} onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default TileSelectionModal;
