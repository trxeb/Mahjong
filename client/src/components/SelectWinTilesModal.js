import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Badge } from 'reactstrap';
import { ALL_PLAYING_TILES, SUITS, HONORS } from '../constants/mahjong';
import { detectBestPattern, countWindTai } from '../constants/mahjong';
import './SelectWinTilesModal.css';

const TILE_LIMIT = 14;

const Tile = ({ tile, onClick, count }) => (
    <div className={`tile ${count > 0 ? 'selected' : ''}`} onClick={() => onClick(tile)}>
        {tile.unicode || tile.name_zh}
        {count > 0 && <Badge pill color="primary" className="tile-count">{count}</Badge>}
    </div>
);

const TileSection = ({ title, tiles, onTileClick, selectedCounts }) => (
    <div className="mb-4 tile-section">
        <h5>{title}</h5>
        <div className="d-flex flex-wrap">
            {tiles.map(tile => (
                <Tile
                    key={tile.id}
                    tile={tile}
                    onClick={onTileClick}
                    count={selectedCounts[tile.id] || 0}
                />
            ))}
        </div>
    </div>
);

const SelectWinTilesModal = ({ isOpen, toggle, onConfirm, playerWind, tableWind }) => {
    const [selectedTiles, setSelectedTiles] = useState([]);

    const handleTileClick = (tile) => {
        setSelectedTiles(currentTiles => {
            const count = currentTiles.filter(t => t.id === tile.id).length;
            if (currentTiles.length < TILE_LIMIT && count < 4) {
                return [...currentTiles, tile];
            }
            return currentTiles;
        });
    };

    const handleRemoveTile = (tile) => {
        setSelectedTiles(currentTiles => {
            const index = currentTiles.findIndex(t => t.id === tile.id);
            if (index > -1) {
                const newTiles = [...currentTiles];
                newTiles.splice(index, 1);
                return newTiles;
            }
            return currentTiles;
        });
    };

    const calculateTai = (hand) => {
        if (hand.length === TILE_LIMIT) {
            // Pass all arguments for robust detection
            const { pattern, tai } = detectBestPattern(hand, playerWind, tableWind);
            const windTai = countWindTai(hand, playerWind, tableWind);
            return { pattern, tai, windTai };
        }
        return { pattern: 'Incomplete Hand', tai: 0, windTai: 0 };
    };

    const handleConfirm = () => {
        const { pattern, tai, windTai } = calculateTai(selectedTiles);
        onConfirm(selectedTiles, tai, pattern, windTai);
        toggle();
    };

    const selectedCounts = selectedTiles.reduce((acc, tile) => {
        acc[tile.id] = (acc[tile.id] || 0) + 1;
        return acc;
    }, {});

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg" className="select-tiles-modal">
            <ModalHeader toggle={toggle}>
                <span className="red-dragon-icon">中</span> Select Your Tiles
            </ModalHeader>
            <ModalBody>
                <div className="selected-hand-display mb-3">
                    {selectedTiles.length > 0 ? selectedTiles.map((tile, index) => (
                        <Tile key={`${tile.id}-${index}`} tile={tile} onClick={() => handleRemoveTile(tile)} count={0} />
                    )) : <p className="text-muted">Select your winning hand...</p>}
                </div>

                <TileSection title="萬子 (Characters)" tiles={SUITS.CHARACTERS} onTileClick={handleTileClick} selectedCounts={selectedCounts} />
                <TileSection title="筒子 (Circles)" tiles={SUITS.DOTS} onTileClick={handleTileClick} selectedCounts={selectedCounts} />
                <TileSection title="索子 (Bamboos)" tiles={SUITS.BAMBOO} onTileClick={handleTileClick} selectedCounts={selectedCounts} />
                <TileSection title="字牌 (Honor Tiles)" tiles={[...HONORS.WINDS, ...HONORS.DRAGONS]} onTileClick={handleTileClick} selectedCounts={selectedCounts} />
            </ModalBody>
            <ModalFooter>
                <div className="w-100 d-flex justify-content-between align-items-center">
                    <span className="selected-tiles-count">Selected Tiles: {selectedTiles.length}/{TILE_LIMIT}</span>
                    <div>
                        <Button className="btn-clear-all me-2" onClick={() => setSelectedTiles([])}>
                            Clear All
                        </Button>
                        <Button className="btn-auto-calc" onClick={handleConfirm} disabled={selectedTiles.length < TILE_LIMIT}>
                            Auto Calculate Tai
                        </Button>
                    </div>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default SelectWinTilesModal;