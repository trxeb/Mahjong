// src/components/LeaderboardView.jsx
import React, { useEffect, useState } from 'react';
import appStyles from '../styles/appStyles'; // Import the shared styles

const LeaderboardView = ({ backendUrl }) => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${backendUrl}/api/leaderboard`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch leaderboard');
                }
                const data = await response.json();
                setLeaderboardData(data);
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [backendUrl]);

    if (loading) return <div style={{ ...appStyles.screen, ...appStyles.screenActive, ...appStyles.centerContent }}><p style={appStyles.welcomeTitle}>Loading Leaderboard...</p></div>;
    if (error) return <div style={{ ...appStyles.screen, ...appStyles.screenActive, ...appStyles.centerContent }}><p style={appStyles.errorMessage}>Error: {error}</p></div>;

    return (
        <div style={{ ...appStyles.screen, ...appStyles.screenActive }}>
            <div style={appStyles.centerContent}>
                <div style={appStyles.welcomeSection}>
                    <div style={appStyles.welcomeTitle}>Leaderboard</div>
                    <div style={appStyles.welcomeSubtitle}>Current game standings</div>
                </div>

                <div style={{ ...appStyles.card, maxWidth: 'unset', width: '100%' }}>
                    <h3 style={{ color: appStyles.inputGroupLabel.color, marginBottom: '30px', textAlign: 'center' }}>Current Scores</h3>

                    {leaderboardData.map((player, index) => (
                        <div key={player.id || index} style={index === 0 ? appStyles.scoreItemWinner : appStyles.scoreItem}>
                            <div>
                                <strong>{player.username}</strong>
                                {index === 0 && <div style={{ fontSize: '14px', opacity: 0.8 }}>Recent Winner</div>} {/* Example for winner badge */}
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                {player.wins} W / {player.losses} L ({player.total_tai} Tai)
                            </div>
                        </div>
                    ))}
                </div>

                {/* Game Statistics (Placeholder, as real-time stats would come from backend) */}
                <div style={{ ...appStyles.card, maxWidth: 'unset', width: '100%', textAlign: 'center' }}>
                    <h3 style={{ color: appStyles.inputGroupLabel.color, marginBottom: '20px' }}>Game Statistics</h3>
                    <div style={appStyles.playerItem}>
                        <span>Total Rounds Played:</span>
                        <span><strong>N/A</strong></span> {/* Placeholder */}
                    </div>
                    <div style={appStyles.playerItem}>
                        <span>Current Wind Round:</span>
                        <span><strong>N/A</strong></span> {/* Placeholder */}
                    </div>
                    <div style={appStyles.playerItem}>
                        <span>Game Duration:</span>
                        <span><strong>N/A</strong></span> {/* Placeholder */}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <button style={appStyles.btn} onClick={() => alert('End Game logic here')}>End Game</button>
                    <button style={{ ...appStyles.btn, ...appStyles.btnSecondary, marginLeft: '20px' }} onClick={() => alert('Record Win logic here')}>Record Win</button>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardView;
