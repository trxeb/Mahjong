// This is a new file for the Declare Win modal.
// The content will be added in the next step. 

import React, { useState, useEffect } from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import SelectWinTilesModal from './SelectWinTilesModal';
import { detectBestPattern, countWindTai } from '../constants/mahjong';

const handTypes = [
  // Basic Combinations
  { name: 'Pong Pong (對對胡 / All Pungs)', tai: 2 },
  { name: 'Ping Hu (平胡 / All Chows)', tai: 4 },
  { name: 'Cao Ping Hu (草平胡 / Ruined Ping Hu)', tai: 1 },
  // Advanced Combinations
  { name: 'Half-Colour (Same Suit + Big Cards)', tai: 2 },
  { name: 'Half-Colour Pong Pong (Same Suit + Big Cards + All Pungs)', tai: 4 },
  { name: 'Full-Colour (Same Suit Only)', tai: 4 },
  { name: 'Full-Colour Ping Hu (Same Suit + Ping Hu)', tai: 5 },
  // Rare Combinations
  { name: 'Seven Pairs (七对子)', tai: 5 },
  { name: 'Thirteen Orphans (十三么)', tai: 5 },
  // Bonus: fallback and custom
  { name: 'Custom Tai', tai: null },
  { name: 'Hand from Tiles', tai: null, hidden: true }, // For internal use
];

const DeclareWinModal = ({ isOpen, toggle, players, currentUser, room, onDeclare }) => {
  const [isSelfDrawn, setIsSelfDrawn] = useState(false);
  const [losingPlayerId, setLosingPlayerId] = useState('');
  const [taiValue, setTaiValue] = useState(1);
  const [handType, setHandType] = useState('Custom Tai');
  const [isTilesModalOpen, setIsTilesModalOpen] = useState(false);
  const [winningHand, setWinningHand] = useState([]);
  const [windTai, setWindTai] = useState(0);
  const [seatWindTaiChecked, setSeatWindTaiChecked] = useState(false);
  const [roundWindTaiChecked, setRoundWindTaiChecked] = useState(false);

  const winner = players.find(p => p.uid === currentUser?.uid);
  const playerWind = winner?.wind;
  const tableWind = room?.currentWind;

  useEffect(() => {
    const selectedHand = handTypes.find(h => h.name === handType);
    if (selectedHand && selectedHand.tai !== null) {
      setTaiValue(selectedHand.tai);
      if (handType !== 'Hand from Tiles') {
        setWindTai(0);
      }
    } else if (handType !== 'Hand from Tiles') {
      setTaiValue(1);
      setWindTai(0);
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

  useEffect(() => {
    // If using Select Tiles, auto-fill and lock wind tai checkboxes
    if (handType === 'Hand from Tiles') {
      // Use windTai to set checkboxes
      if (playerWind && tableWind) {
        setSeatWindTaiChecked(windTai > 0 && countWindTai(winningHand, playerWind, null) > 0);
        setRoundWindTaiChecked(windTai > 0 && countWindTai(winningHand, null, tableWind) > 0);
      }
    } else {
      setSeatWindTaiChecked(false);
      setRoundWindTaiChecked(false);
    }
  }, [handType, windTai, winningHand, playerWind, tableWind]);

  const handleSubmit = () => {
    let manualWindTai = 0;
    if (handType !== 'Hand from Tiles') {
      if (seatWindTaiChecked) manualWindTai += 1;
      if (roundWindTaiChecked) manualWindTai += 1;
    }
    onDeclare({
      isSelfDrawn,
      losingPlayerId: isSelfDrawn ? null : losingPlayerId,
      taiValue,
      windTai: handType === 'Hand from Tiles' ? windTai : manualWindTai
    });
    toggle(); // Close the modal after submitting
  };

  const handleTaiChange = (amount) => {
    setTaiValue(prev => Math.max(1, prev + amount));
  };

  const toggleTilesModal = () => setIsTilesModalOpen(!isTilesModalOpen);

  const handleHandConfirm = (hand, calculatedTai, detectedPattern, windTai) => {
    setWinningHand(hand);
    setTaiValue(calculatedTai);
    setWindTai(windTai || 0);
    // Try to match detectedPattern to a handType
    const match = handTypes.find(h => detectedPattern && detectedPattern.startsWith(h.name));
    if (match) {
      setHandType(match.name);
    } else if (detectedPattern && detectedPattern !== 'Incomplete Hand') {
      setHandType(detectedPattern);
    } else {
      setHandType('Hand from Tiles');
    }
  };

  const getTotalTai = () => {
    let baseTai = taiValue;
    let extra = 0;
    if (handType === 'Hand from Tiles') {
      extra = windTai;
    } else {
      if (seatWindTaiChecked) extra += 1;
      if (roundWindTaiChecked) extra += 1;
    }
    return baseTai + extra;
  };

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} size="lg" className="win-modal">
        <ModalHeader toggle={toggle}>Declare Win</ModalHeader>
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
                {handTypes.filter(h => !h.hidden).map(hand => (
                  <option key={hand.name} value={hand.name}>
                    {hand.name}{hand.tai !== null ? ` - ${hand.tai} Tai` : ''}
                  </option>
                ))}
                {handType === 'Hand from Tiles' && (
                    <option key="hand-from-tiles" value="Hand from Tiles">
                        Hand from Tiles - {taiValue} Tai
                    </option>
                )}
              </Input>
            </FormGroup>
            {/* Wind Tai checkboxes */}
            <FormGroup check className="mb-2">
              <Label check>
                <Input type="checkbox" checked={seatWindTaiChecked} onChange={() => setSeatWindTaiChecked(v => !v)} disabled={handType === 'Hand from Tiles'} />
                +1 Tai for Pong/Kong of My Seat Wind
              </Label>
            </FormGroup>
            <FormGroup check className="mb-2">
              <Label check>
                <Input type="checkbox" checked={roundWindTaiChecked} onChange={() => setRoundWindTaiChecked(v => !v)} disabled={handType === 'Hand from Tiles'} />
                +1 Tai for Pong/Kong of Prevailing Wind
              </Label>
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
            {windTai > 0 && (
              <div className="mb-2 text-success">+{windTai} Tai for Wind Pongs/Kongs</div>
            )}
            <FormGroup>
              <Label>Total Tai</Label>
              <Input type="text" value={`${getTotalTai()} Tai`} disabled />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter className="win-modal-footer">
          <Button color="primary" onClick={handleSubmit}>
            Calculate & Apply
          </Button>
          <Button color="secondary" onClick={toggleTilesModal}>Select Tiles</Button>
        </ModalFooter>
      </Modal>
      <SelectWinTilesModal
        isOpen={isTilesModalOpen}
        toggle={toggleTilesModal}
        onConfirm={handleHandConfirm}
        playerWind={playerWind}
        tableWind={tableWind}
      />
    </>
  );
};

export default DeclareWinModal; 