// src/components/Views/HuView.jsx
import React, { useState } from 'react';
import appStyles from '../../styles/appStyles'; // Import the shared styles

const HuView = ({ onShowTileModal }) => {
    const [selfDrawn, setSelfDrawn] = useState(false);
    const [taiValue, setTaiValue] = useState(2); // Default tai value
    const [handType, setHandType] = useState('');

    const updateTaiValue = (e) => {
        const selectedValue = e.target.value;
        setHandType(selectedValue);
        if (selectedValue !== 'custom') {
            setTaiValue(parseInt(selectedValue, 10));
        }
    };

    const changeTai = (delta) => {
        setTaiValue(prev => Math.max(1, prev + delta)); // Ensure tai is at least 1
    };

    const confirmWin = () => {
        // Implement logic to confirm win, send data to backend, etc.
        alert(`Win Confirmed!\nWinner Seat: ${document.getElementById('winnerSeat').value}\nSelf-Drawn: ${selfDrawn}\nTai: ${taiValue}`);
        console.log('Win confirmed with:', {
            winnerSeat: document.getElementById('winnerSeat').value,
            currentWind: document.getElementById('currentWind').value,
            selfDrawn: selfDrawn,
            losingPlayer: selfDrawn ? null : document.getElementById('losingPlayer').value,
            handType: handType,
            taiValue: taiValue
        });
    };

    return (
        <div style={{ ...appStyles.screen, ...appStyles.screenActive }}>
            <div style={appStyles.centerContent}>
                <div style={appStyles.welcomeSection}>
                    <div style={appStyles.welcomeTitle}>Declare Win (Hu)</div>
                    <div style={appStyles.welcomeSubtitle}>Calculate and record winning hands</div>
                </div>

                <div style={{ ...appStyles.card, maxWidth: 'unset', width: '100%' }}>
                    <h3 style={{ color: appStyles.inputGroupLabel.color, marginBottom: '20px' }}>Game Information</h3>

                    <div style={appStyles.inputGroup}>
                        <label htmlFor="winnerSeat" style={appStyles.inputGroupLabel}>Winner's Seat</label>
                        <select id="winnerSeat" style={appStyles.inputGroupInput}>
                            <option value="">Select seat...</option>
                            <option value="east">East (東)</option>
                            <option value="south">South (南)</option>
                            <option value="west">West (西)</option>
                            <option value="north">North (北)</option>
                        </select>
                    </div>

                    <div style={appStyles.inputGroup}>
                        <label htmlFor="currentWind" style={appStyles.inputGroupLabel}>Current Wind</label>
                        <select id="currentWind" style={appStyles.inputGroupInput}>
                            <option value="east">East Wind (東風)</option>
                            <option value="south">South Wind (南風)</option>
                            <option value="west">West Wind (西風)</option>
                            <option value="north">North Wind (北風)</option>
                        </select>
                    </div>

                    <div style={appStyles.checkboxContainer}>
                        <input
                            type="checkbox"
                            id="selfDrawn"
                            checked={selfDrawn}
                            onChange={(e) => setSelfDrawn(e.target.checked)}
                            style={appStyles.checkboxInput}
                        />
                        <label htmlFor="selfDrawn" style={appStyles.inputGroupLabel}>Self-Drawn (自摸)</label>
                    </div>

                    {!selfDrawn && (
                        <div style={appStyles.inputGroup} id="loserGroup">
                            <label htmlFor="losingPlayer" style={appStyles.inputGroupLabel}>Losing Player</label>
                            <select id="losingPlayer" style={appStyles.inputGroupInput}>
                                <option value="">Select losing player...</option>
                                <option value="east">East Player</option>
                                <option value="south">South Player</option>
                                <option value="west">West Player</option>
                                <option value="north">North Player</option>
                            </select>
                        </div>
                    )}
                </div>

                <div style={{ ...appStyles.card, maxWidth: 'unset', width: '100%' }}>
                    <h3 style={{ color: appStyles.inputGroupLabel.color, marginBottom: '20px' }}>Hand Type Selection</h3>
                    <div style={appStyles.inputGroup}>
                        <label htmlFor="handType" style={appStyles.inputGroupLabel}>Select Hand Type</label>
                        <select id="handType" onChange={updateTaiValue} value={handType} style={appStyles.inputGroupInput}>
                            <option value="">Select hand type...</option>
                            <option value="64">All Honor (字一色) - 64 tai</option>
                            <option value="32">Big Dragons (大三元) - 32 tai</option>
                            <option value="32">Four Winds (大四喜) - 32 tai</option>
                            <option value="16">Pure Hand (清一色) - 16 tai</option>
                            <option value="8">Mixed Hand (混一色) - 8 tai</option>
                            <option value="4">All Triplets (對對胡) - 4 tai</option>
                            <option value="2">Common Hand (平胡) - 2 tai</option>
                            <option value="custom">Custom Hand - Select tai</option>
                        </select>
                    </div>

                    {handType === 'custom' && (
                        <div id="taiSelector">
                            <h4 style={{ color: appStyles.inputGroupLabel.color, margin: '20px 0', textAlign: 'center' }}>Tai Value</h4>
                            <div style={appStyles.wheelSelector}>
                                <button style={appStyles.wheelBtn} onClick={() => changeTai(-1)}>−</button>
                                <div style={appStyles.wheelValue} id="taiValue">{taiValue}</div>
                                <button style={appStyles.wheelBtn} onClick={() => changeTai(1)}>+</button>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <button style={{ ...appStyles.btn, ...appStyles.btnLarge }} onClick={confirmWin}>Confirm Win</button>
                    <button style={{ ...appStyles.btn, ...appStyles.btnSecondary, marginLeft: '20px' }} onClick={onShowTileModal}>Calculate from Tiles</button>
                </div>
            </div>
        </div>
    );
};

export default HuView;
