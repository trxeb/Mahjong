import React from 'react';
import { Modal, ModalHeader, ModalBody, Row, Col, Button } from 'reactstrap';
import { FLOWER_TILES } from '../constants/mahjong';

// Moved TileButton outside of the main component to prevent re-definitions on every render.
const TileButton = ({ tile, onSelect, isAvailable }) => (
    <Button
        color={isAvailable ? "light" : "secondary"}
        className="w-100 mb-2"
        onClick={() => {
            if (isAvailable) {
                onSelect(tile);
            }
        }}
        disabled={!isAvailable}
        style={{ cursor: isAvailable ? 'pointer' : 'not-allowed', opacity: isAvailable ? 1 : 0.6 }}
    >
        {tile.name}
    </Button>
);

const TileGroup = ({ title, tiles, onSelect, availableTiles }) => (
    <Col md={4} className="mb-3">
        <h5 className="text-center mb-3">{title}</h5>
        {tiles.map(tile => {
            const isAvailable = availableTiles.some(available => available.id === tile.id);
            return <TileButton key={tile.id} tile={tile} onSelect={onSelect} isAvailable={isAvailable} />;
        })}
    </Col>
);

const FlowerModal = ({ isOpen, toggle, onSelect, availableTiles }) => {    
    return (
        <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
            <ModalHeader toggle={toggle}>Select a Flower Tile</ModalHeader>
            <ModalBody>
                <Row>
                    <TileGroup title="Seasons" tiles={FLOWER_TILES.SEASONS} onSelect={onSelect} availableTiles={availableTiles} />
                    <TileGroup title="Flowers" tiles={FLOWER_TILES.FLOWERS} onSelect={onSelect} availableTiles={availableTiles} />
                    <TileGroup title="Animals" tiles={FLOWER_TILES.ANIMALS} onSelect={onSelect} availableTiles={availableTiles} />
                </Row>
            </ModalBody>
        </Modal>
    );
};

export default FlowerModal; 