import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, arrayUnion, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Container, Row, Col, Button, Card, CardBody,
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faSync, faStopCircle, faPlayCircle, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { ALL_FLOWER_TILES } from '../constants/mahjong';

const GameMasterPage = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userWind, setUserWind] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roomExists, setRoomExists] = useState(true);
  const [roomData, setRoomData] = useState(null);
  const [highestScore, setHighestScore] = useState(-Infinity);
  const [mostWins, setMostWins] = useState(-1);
  const [confirmEndModalOpen, setConfirmEndModalOpen] = useState(false);
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [gameWinner, setGameWinner] = useState(null);

  const winds = ['East (東)', 'South (南)', 'West (西)', 'North (北)'];

  useEffect(() => {
    if (roomCode) {
      localStorage.setItem('lastRoomCode', roomCode);
    }
  }, [roomCode]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setCurrentUser({ uid: user.uid, ...userDocSnap.data() });
        } else {
          setCurrentUser({ uid: user.uid, username: user.email });
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser || !roomCode) return;

    const roomRef = doc(db, 'rooms', roomCode);

    const unsubscribeRoom = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        setRoomExists(true);
        const currentRoomData = docSnap.data();
        setRoomData(currentRoomData);
        const currentPlayers = currentRoomData.players || [];
        setPlayers(currentPlayers);

        const playerInRoom = currentPlayers.find(p => p.uid === currentUser.uid);

        if (currentRoomData.status === 'finished') {
          if (currentRoomData.winner) {
            const winnerData = currentPlayers.find(p => p.uid === currentRoomData.winner.uid);
            setGameWinner(winnerData || currentRoomData.winner);
          }
          setWinnerModalOpen(true);
          return;
        }

        if (currentRoomData.status === 'in_round' && playerInRoom) {
          navigate(`/records/${roomCode}`);
          return;
        }

        if (currentPlayers.length > 0) {
          const scores = currentPlayers.map(p => p.score);
          setHighestScore(Math.max(...scores));

          const wins = currentPlayers.map(p => p.gamesWon || 0);
          const maxWins = Math.max(...wins);
          setMostWins(maxWins > 0 ? maxWins : -1);
        }

        if (playerInRoom) {
          setUserWind(playerInRoom.wind);
        } else if (currentPlayers.length < 4) {
          const newPlayer = {
            uid: currentUser.uid,
            name: currentUser.username,
            score: 0,
            wind: ''
          };
          updateDoc(roomRef, {
            players: arrayUnion(newPlayer),
            playerUIDs: arrayUnion(currentUser.uid)
          });
        }

        if (currentPlayers.length === 4 && currentRoomData.gameMaster === currentUser.uid) {
          const playersWithoutWind = currentPlayers.filter(p => !p.wind);
          if (playersWithoutWind.length === 1) {
            const takenWinds = currentPlayers.map(p => p.wind).filter(Boolean);
            const availableWinds = winds.filter(w => !takenWinds.includes(w));
            if (availableWinds.length === 1) {
              const lastWind = availableWinds[0];
              const playerToUpdateIndex = currentPlayers.findIndex(p => !p.wind);

              const updatedPlayers = [...currentPlayers];
              updatedPlayers[playerToUpdateIndex].wind = lastWind;

              updateDoc(roomRef, { players: updatedPlayers });
            }
          }
        }
      } else {
        setRoomExists(false);
      }
    });

    return () => unsubscribeRoom();
  }, [roomCode, currentUser, navigate, winds]);

  const handleWindSelection = async (wind) => {
    if (!currentUser) return;
    const roomRef = doc(db, 'rooms', roomCode);
    const playerIndex = players.findIndex(p => p.uid === currentUser.uid);

    if (playerIndex !== -1) {
      const updatedPlayers = [...players];
      updatedPlayers[playerIndex].wind = wind;
      await updateDoc(roomRef, { players: updatedPlayers });
      setUserWind(wind);
    }
  };

  const handleEndGame = async () => {
    toggleConfirmEndModal();

    let winner = null;
    if (players.length > 0) {
      winner = players.reduce((prev, current) => (prev.score > current.score) ? prev : current);
      setGameWinner(winner);
    }

    const roomRef = doc(db, 'rooms', roomCode);
    try {
      await updateDoc(roomRef, {
        status: 'finished',
        finishedAt: serverTimestamp(),
        winner: winner ? { uid: winner.uid, name: winner.name } : null
      });
    } catch (error) {
      console.error("Error archiving room: ", error);
    }

    setWinnerModalOpen(true);
  };

  const handleCloseWinnerModalAndRedirect = () => {
    setWinnerModalOpen(false);
    navigate('/');
  };

  const handleStartRound = async () => {
    if (!canStartGame) return;
    const roomRef = doc(db, 'rooms', roomCode);
    try {
      await updateDoc(roomRef, {
        status: 'in_round',
        availableFlowerTiles: ALL_FLOWER_TILES
      });
    } catch (error) {
      console.error("Error starting round: ", error);
    }
  };

  const toggleDropdown = () => setDropdownOpen(prevState => !prevState);
  const toggleConfirmEndModal = () => setConfirmEndModalOpen(!confirmEndModalOpen);

  const canStartGame = players.length === 4 && players.every(p => p.wind);
  const isPlayerInRoom = players.some(p => p.uid === currentUser?.uid);
  const availableWinds = winds.filter(w => !players.some(p => p.wind === w));

  if (!roomExists) {
    return (
      <div className="gm-background">
        <div className="gm-content text-center">
          <h2>Room Not Found</h2>
          <p>The room with code <strong>{roomCode}</strong> does not exist or has been closed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gm-background">
      <div className="gm-content">
        <Container className="py-4">
          <h2 className="gm-header"><FontAwesomeIcon icon={faCrown} /> Game Master</h2>
          <div className="room-code-display my-4">
            Room Code: {roomCode}
          </div>

          <Row>
            <Col md={8}>
              <h4 className="mb-3">Players in Room</h4>
              <Row>
                {players.map(player => (
                  <Col md={6} key={player.uid} className="mb-4">
                    <Card className={`player-score-card h-100 ${player.score === highestScore ? 'highlight' : ''}`}>
                      <CardBody className="text-center d-flex flex-column justify-content-center">
                        <div className="wind-indicator">{player.wind || 'Choosing...'}</div>
                        <div className="player-name mt-2">{player.name}</div>
                        <div className="player-score my-1">{player.score > 0 ? '+' : ''}{player.score}</div>
                        <small className="text-muted mt-auto">
                          Wind: {player.wind.split(' ')[0]} | Games Won: {player.gamesWon || 0}
                          {player.gamesWon === mostWins && mostWins !== -1 && (
                            <FontAwesomeIcon icon={faTrophy} className="ms-2 text-warning" />
                          )}
                        </small>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
                {players.length < 4 && Array.from({ length: 4 - players.length }).map((_, index) => (
                  <Col md={6} key={`placeholder-${index}`} className="mb-4">
                    <Card className="player-score-card h-100">
                      <CardBody className="text-center d-flex align-items-center justify-content-center">
                        <p className="text-muted">Waiting for more players...</p>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
            <Col md={4}>
              <h4 className="mb-3">Game Controls</h4>
              {isPlayerInRoom && !userWind && (
                <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} className="w-100 mb-3">
                  <DropdownToggle caret>Choose Your Wind</DropdownToggle>
                  <DropdownMenu>
                    {availableWinds.map(wind => (
                      <DropdownItem key={wind} onClick={() => handleWindSelection(wind)}>{wind}</DropdownItem>
                    ))}
                    {availableWinds.length === 0 && <DropdownItem disabled>All winds taken</DropdownItem>}
                  </DropdownMenu>
                </Dropdown>
              )}
              <Button className="w-100 mb-2 gm-btn" disabled={!canStartGame} onClick={handleStartRound}>
                <FontAwesomeIcon icon={faPlayCircle} /> Start New Round
              </Button>
              <Button className="w-100 mb-2 gm-btn-alt">
                <FontAwesomeIcon icon={faSync} /> Reset All Scores
              </Button>
              {roomData?.gameMaster === currentUser?.uid && (
                <Button color="danger" className="w-100 gm-btn-danger" onClick={toggleConfirmEndModal}>
                  <FontAwesomeIcon icon={faStopCircle} /> End Game
                </Button>
              )}
            </Col>
          </Row>
        </Container>

        <Modal isOpen={confirmEndModalOpen} toggle={toggleConfirmEndModal} centered>
          <ModalHeader toggle={toggleConfirmEndModal}>Confirm End Game</ModalHeader>
          <ModalBody>
            Are you sure you want to end this game? The room will be closed and all data will be lost. This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={handleEndGame}>Confirm End Game</Button>{' '}
            <Button color="secondary" onClick={toggleConfirmEndModal}>Cancel</Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={winnerModalOpen} toggle={handleCloseWinnerModalAndRedirect} centered>
          <ModalHeader>Game Over!</ModalHeader>
          <ModalBody className="text-center">
            {gameWinner ? (
              <>
                <h4>🎉 The Winner is {gameWinner.name}! 🎉</h4>
                <p className="lead">Final Score: {gameWinner.score}</p>
              </>
            ) : (
              <p>The game has ended.</p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handleCloseWinnerModalAndRedirect}>Back to Home</Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default GameMasterPage;