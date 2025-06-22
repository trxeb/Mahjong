// This is a new file for the Declare Win modal.
// The content will be added in the next step. 

import React, { useState, useEffect } from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, Row, Col
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

const handTypes = [
  { name: '平胡 (Basic Win)', tai: 1 },
  { name: '對對胡 (All Pungs)', tai: 2 },
  { name: '混一色 (Mixed Suit)', tai: 3 },
  { name: '清一色 (Pure Suit)', tai: 8 },
  { name: '字一色 (All Honors)', tai: 8 },
  { name: 'Custom Tai', tai: null },
];

const DeclareWinModal = ({ isOpen, toggle, players, currentUser, room, onDeclare }) => {
  const [isSelfDrawn, setIsSelfDrawn] = useState(false);
  const [losingPlayerId, setLosingPlayerId] = useState('');
  const [taiValue, setTaiValue] = useState(1);
  const [handType, setHandType] = useState('Custom Tai');

  const winner = players.find(p => p.uid === currentUser?.uid);

  useEffect(() => {
    const selectedHand = handTypes.find(h => h.name === handType);
    if (selectedHand && selectedHand.tai !== null) {
      setTaiValue(selectedHand.tai);
    } else {
      // Default to 1 if switching back to Custom Tai
      setTaiValue(1);
    }
  }, [handType]);

  // Effect to set a default losing player
  useEffect(() => {
    if (!isSelfDrawn) {
      const otherPlayers = players.filter(p => p.uid !== currentUser?.uid);
      if (otherPlayers.length > 0 && !losingPlayerId) {
        setLosingPlayerId(otherPlayers[0].uid);
      }
    }
  }, [isSelfDrawn, players, currentUser, losingPlayerId]);

  const handleSubmit = () => {
    onDeclare({
      isSelfDrawn,
      losingPlayerId: isSelfDrawn ? null : losingPlayerId,
      taiValue
    });
    toggle(); // Close the modal after submitting
  };

  const handleTaiChange = (amount) => {
    setTaiValue(prev => Math.max(1, prev + amount));
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle} className="win-modal-header">
        🎉 Declare Win (胡)
      </ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label>Winner</Label>
            <Input type="text" value={winner?.name || ''} disabled />
          </FormGroup>
          <FormGroup>
            <Label>Current Wind</Label>
            <Input type="text" value={room?.currentWind || 'East Wind (東風)'} disabled />
          </FormGroup>
          <FormGroup check className="mb-3">
            <Label check>
              <Input type="checkbox" checked={isSelfDrawn} onChange={() => setIsSelfDrawn(!isSelfDrawn)} />{' '}
              Self Drawn (自摸)
            </Label>
          </FormGroup>
          {!isSelfDrawn && (
            <FormGroup>
              <Label for="losingPlayer">Losing Player (放槍者)</Label>
              <Input type="select" name="losingPlayer" id="losingPlayer" value={losingPlayerId} onChange={(e) => setLosingPlayerId(e.target.value)}>
                {players.filter(p => p.uid !== currentUser?.uid).map(p => (
                  <option key={p.uid} value={p.uid}>{p.name} ({p.wind})</option>
                ))}
              </Input>
            </FormGroup>
          )}
          <FormGroup>
            <Label for="handType">Hand Type</Label>
            <Input type="select" name="handType" id="handType" value={handType} onChange={(e) => setHandType(e.target.value)}>
              {handTypes.map(hand => (
                <option key={hand.name} value={hand.name}>
                  {hand.name}{hand.tai !== null ? ` - ${hand.tai} Tai` : ''}
                </option>
              ))}
            </Input>
          </FormGroup>
          {handType === 'Custom Tai' ? (
            <FormGroup>
              <Label>Custom Tai Value</Label>
              <div className="d-flex align-items-center justify-content-center">
                <Button color="secondary" onClick={() => handleTaiChange(-1)} className="me-3">
                  <FontAwesomeIcon icon={faMinus} />
                </Button>
                <span className="h4 mx-3 mb-0">{taiValue}</span>
                <Button color="secondary" onClick={() => handleTaiChange(1)} className="ms-3">
                  <FontAwesomeIcon icon={faPlus} />
                </Button>
              </div>
            </FormGroup>
          ) : (
            <FormGroup>
              <Label>Tai Value</Label>
              <Input type="text" value={`${taiValue} Tai`} disabled />
            </FormGroup>
          )}
        </Form>
      </ModalBody>
      <ModalFooter className="win-modal-footer">
        <Button color="primary" onClick={handleSubmit}>
          Calculate & Apply
        </Button>
        <Button color="secondary" disabled>Select Tiles</Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeclareWinModal; 