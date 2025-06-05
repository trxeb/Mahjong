// mahjong-backend-supabase/server.js

require('dotenv').config(); // Load environment variables first

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// --- Firebase Admin SDK Imports and Initialization ---
const admin = require('firebase-admin');
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH); // Load the service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore(); // Get a reference to Firestore
const auth = admin.auth();   // Get a reference to Firebase Auth (for backend verification)

// --- END Firebase Admin SDK Setup ---


const app = express();
const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST"]
}));
app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: FRONTEND_URL,
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5002;

// --- Middleware (Firebase Auth Verification) ---
// This 'protect' middleware now verifies Firebase ID tokens
async function protect(req, res, next) {
    try {
        const idToken = req.headers.authorization?.split('Bearer ')[1];
        if (!idToken) {
            return res.status(401).json({ message: 'No ID token, authorization denied' });
        }

        const decodedToken = await auth.verifyIdToken(idToken); // Verify the token
        req.user = decodedToken; // Attach decoded user info (uid, email, etc.)
        next();
    } catch (error) {
        console.error("Firebase Auth Middleware Error:", error);
        res.status(401).json({ message: 'Invalid or expired ID token.', details: error.message });
    }
}


// --- HTTP API Endpoints (Update to use Firestore) ---

// GET /api/profiles/me
app.get('/api/profiles/me', protect, async (req, res) => {
    const userId = req.user.uid; // Firebase user ID is 'uid'

    try {
        const profileDoc = await db.collection('profiles').doc(userId).get(); // Get profile by UID
        if (!profileDoc.exists) {
            console.warn("Profile not found for user:", userId);
            return res.status(404).json({ message: 'Profile not found for this user.' });
        }
        res.status(200).json(profileDoc.data()); // Send profile data
    } catch (error) {
        console.error('Server error fetching profile:', error);
        res.status(500).json({ message: 'Internal server error while fetching profile.' });
    }
});

// GET /api/leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const profilesRef = db.collection('profiles');
        const snapshot = await profilesRef
            .orderBy('wins', 'desc') // Order by wins descending
            .orderBy('total_tai', 'desc') // Then by total_tai descending
            .limit(100)
            .get();

        const leaderboard = [];
        snapshot.forEach(doc => {
            leaderboard.push({ id: doc.id, ...doc.data() }); // doc.id is the UID
        });

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error('Server error fetching leaderboard:', error);
        res.status(500).json({ message: 'Server error fetching leaderboard' });
    }
});


// --- Socket.IO Event Handlers (Update to use Firestore) ---
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Helper function to fetch full room state from Firestore
    const getFullRoomState = async (roomId) => {
        const roomDoc = await db.collection('rooms').doc(roomId).get();
        if (!roomDoc.exists) return null;

        const roomData = roomDoc.data();
        const playersInRoomSnapshot = await db.collection('playersInRooms')
                                                .where('room_id', '==', roomId)
                                                .get();
        const playersInRoom = playersInRoomSnapshot.docs.map(doc => doc.data());

        return { id: roomDoc.id, ...roomData, players_in_rooms: playersInRoom };
    };

    // Helper to broadcast room state
    const broadcastRoomState = async (roomId) => {
        const updatedRoom = await getFullRoomState(roomId);
        if (updatedRoom) {
            io.to(roomId).emit('roomStateUpdate', updatedRoom);
        } else {
            io.to(roomId).emit('roomStateUpdate', null); // Signal room is gone
        }
    };

    // Handler for client joining a specific game room via socket
    socket.on('joinRoomSocket', async ({ roomId, userId, username }) => {
        try {
            // Check if player already in room (optional, but good for idempotency)
            const existingPlayer = await db.collection('playersInRooms')
                                            .where('room_id', '==', roomId)
                                            .where('user_id', '==', userId)
                                            .get();
            if (!existingPlayer.empty) {
                console.log(`User ${username} (ID: ${userId}) already in room ${roomId}. Updating socket ID.`);
                await db.collection('playersInRooms').doc(existingPlayer.docs[0].id).update({ socket_id: socket.id });
            } else {
                // Add player to playersInRooms collection
                await db.collection('playersInRooms').add({ // Firestore generates ID
                    room_id: roomId,
                    user_id: userId,
                    username: username,
                    is_host: false, // Not host if joining
                    socket_id: socket.id,
                    hand: [], flowers: [], kongs: [], score: 0
                });
            }

            socket.join(roomId);
            console.log(`User ${username} (ID: ${userId}) joined socket room ${roomId} with socket ${socket.id}`);

            await broadcastRoomState(roomId);

        } catch (error) {
            console.error('Server error during socket joinRoom:', error);
            socket.emit('error', 'Server error joining socket room.');
        }
    });

    // Handler for updating a player's hand (tiles, flowers, kongs)
    socket.on('updateHand', async ({ roomId, userId, hand, flowers, kongs }) => {
        try {
            const playerDocSnapshot = await db.collection('playersInRooms')
                                                .where('room_id', '==', roomId)
                                                .where('user_id', '==', userId)
                                                .limit(1).get();

            if (playerDocSnapshot.empty) {
                socket.emit('error', 'Player not found in room.');
                return;
            }

            const playerDocRef = playerDocSnapshot.docs[0].ref;
            await playerDocRef.update({ hand, flowers, kongs });

            await broadcastRoomState(roomId);

        } catch (error) {
            console.error('Server error during updateHand:', error);
            socket.emit('error', 'Server error updating hand.');
        }
    });

    // Handler for starting a game round
    socket.on('startGameRound', async ({ roomId }) => {
        try {
            const roomDocRef = db.collection('rooms').doc(roomId);
            const roomDoc = await roomDocRef.get();

            if (!roomDoc.exists) {
                socket.emit('error', 'Room not found for game round.');
                return;
            }
            const room = roomDoc.data();

            const playersInRoomSnapshot = await db.collection('playersInRooms')
                                                    .where('room_id', '==', roomId)
                                                    .get();
            const players_in_rooms = playersInRoomSnapshot.docs.map(doc => doc.data());

            if (players_in_rooms.length < 4) {
                socket.emit('error', 'Not enough players to start a round (need 4).');
                return;
            }

            // --- Simulate game round logic (simplified) ---
            const roundResults = players_in_rooms.map(player => {
                const isWinner = Math.random() < 0.25;
                const tai = isWinner ? Math.floor(Math.random() * 10) + 1 : 0;
                return {
                    playerId: player.user_id,
                    username: player.username,
                    isWinner,
                    tai,
                    combinations: isWinner ? ['Simulated Win'] : ['No Win']
                };
            });

            // Update player wins/losses/total_tai in the 'profiles' collection
            for (const result of roundResults) {
                const profileRef = db.collection('profiles').doc(result.playerId); // Profile doc ID is UID
                const profileDoc = await profileRef.get();

                if (profileDoc.exists) {
                    const userProfile = profileDoc.data();
                    const updatedWins = (userProfile.wins || 0) + (result.isWinner ? 1 : 0);
                    const updatedLosses = (userProfile.losses || 0) + (result.isWinner ? 0 : 1);
                    const updatedTotalTai = (userProfile.total_tai || 0) + result.tai;

                    await profileRef.update({ wins: updatedWins, losses: updatedLosses, total_tai: updatedTotalTai });
                } else {
                    console.warn(`Profile not found for user ${result.playerId}. Cannot update stats.`);
                }
            }

            // Add round history to the room and update game state/turn
            const newRoundsHistory = room.rounds_history ? [...room.rounds_history, { roundNumber: room.rounds_history.length + 1, results: roundResults }] : [{ roundNumber: 1, results: roundResults }];
            const firstPlayerId = players_in_rooms[0].user_id; // First player for initial turn

            await roomDocRef.update({
                rounds_history: newRoundsHistory,
                game_state: 'playing',
                current_turn_user_id: firstPlayerId
            });

            await broadcastRoomState(roomId);
            io.to(roomId).emit('roundEnded', roundResults); // Optionally, emit a specific round ended event

        } catch (error) {
            console.error('Server error during startGameRound:', error);
            socket.emit('error', 'Server error starting game round.');
        }
    });

    // Handler for player discarding a tile
    socket.on('discardTile', async ({ roomId, userId, discardedTile, updatedHand, flowers, kongs }) => {
        try {
            // 1. Update player's hand in playersInRooms
            const playerDocSnapshot = await db.collection('playersInRooms')
                                                .where('room_id', '==', roomId)
                                                .where('user_id', '==', userId)
                                                .limit(1).get();

            if (playerDocSnapshot.empty) {
                socket.emit('error', 'Player not found in room for discard.');
                return;
            }
            const playerDocRef = playerDocSnapshot.docs[0].ref;
            await playerDocRef.update({ hand: updatedHand, flowers: flowers, kongs: kongs });


            // 2. Add discarded tile to room's discard pile and update turn
            const roomDocRef = db.collection('rooms').doc(roomId);
            const roomDoc = await roomDocRef.get();
            if (!roomDoc.exists) {
                socket.emit('error', 'Room not found for discard update.');
                return;
            }
            const roomData = roomDoc.data();

            const newDiscardPile = [...(roomData.discard_pile || []), discardedTile];

            const playersInRoomSnapshot = await db.collection('playersInRooms')
                                                    .where('room_id', '==', roomId)
                                                    .get();
            const playersInRoom = playersInRoomSnapshot.docs.map(doc => doc.data());

            const currentPlayerIndex = playersInRoom.findIndex(p => p.user_id === userId);
            const nextPlayerIndex = (currentPlayerIndex + 1) % playersInRoom.length;
            const nextTurnUserId = playersInRoom[nextPlayerIndex].user_id;

            await roomDocRef.update({
                discard_pile: newDiscardPile,
                current_turn_user_id: nextTurnUserId
            });

            await broadcastRoomState(roomId);
            console.log(`User ${userId} discarded ${discardedTile} in room ${roomId}. Next turn: ${nextTurnUserId}`);

        } catch (error) {
            console.error('Server error during discardTile:', error);
            socket.emit('error', 'Server error during discard tile.');
        }
    });

    // Handler for client creating a room via socket
    socket.on('createRoom', async ({ roomCode, roomName, userId, username }) => {
        try {
            const roomRef = db.collection('rooms');
            const newRoomDoc = await roomRef.add({ // Firestore generates ID for the room document
                code: roomCode,
                name: roomName,
                creator_id: userId,
                game_state: 'waiting',
                discard_pile: [],
                rounds_history: [],
                current_turn_user_id: null
            });
            const newRoomId = newRoomDoc.id; // Get the Firestore generated ID

            // Add the host player to playersInRooms
            await db.collection('playersInRooms').add({
                room_id: newRoomId, // Use the Firestore generated room ID
                user_id: userId,
                username: username,
                is_host: true,
                socket_id: socket.id,
                hand: [], flowers: [], kongs: [], score: 0
            });

            socket.join(newRoomId); // Join the Socket.IO room with the Firestore room ID
            console.log(`User ${username} created and joined room ${roomCode} (ID: ${newRoomId}) with socket ${socket.id}`);

            await broadcastRoomState(newRoomId);

        } catch (error) {
            console.error('Server error during createRoom:', error);
            socket.emit('error', 'Server error creating room.');
        }
    });

    // Handler for client leaving a room via socket
    socket.on('leaveRoom', async ({ roomId, userId }) => {
        try {
            // Find and delete the player's document in playersInRooms
            const playerDocSnapshot = await db.collection('playersInRooms')
                                                .where('room_id', '==', roomId)
                                                .where('user_id', '==', userId)
                                                .limit(1).get();

            if (!playerDocSnapshot.empty) {
                await playerDocSnapshot.docs[0].ref.delete();
            } else {
                console.warn(`Player ${userId} not found in room ${roomId} when trying to leave.`);
            }

            socket.leave(roomId); // Leave the Socket.IO room

            // Check if room is empty after player leaves
            const remainingPlayersSnapshot = await db.collection('playersInRooms')
                                                        .where('room_id', '==', roomId)
                                                        .get();

            if (remainingPlayersSnapshot.empty) {
                // If room is empty, delete the room document
                await db.collection('rooms').doc(roomId).delete();
                console.log(`Room ${roomId} deleted as it is now empty.`);
                io.to(roomId).emit('roomStateUpdate', null); // Signal room is gone to any lingering clients
            } else {
                // If room still has players, broadcast updated state
                await broadcastRoomState(roomId);
            }
            console.log(`User ${userId} left room ${roomId}`);

        } catch (error) {
            console.error('Server error during leaveRoom:', error);
            socket.emit('error', 'Server error leaving room.');
        }
    });


    // Handler for client disconnect
    socket.on('disconnect', async () => {
        console.log(`User disconnected: ${socket.id}`);
        // Find players associated with this socket ID and update their status or remove them
        try {
            const playerDocs = await db.collection('playersInRooms')
                                        .where('socket_id', '==', socket.id)
                                        .get();

            for (const doc of playerDocs.docs) {
                const player = doc.data();
                const roomId = player.room_id;
                await doc.ref.delete(); // Remove player from room on disconnect

                console.log(`Player ${player.username} (ID: ${player.user_id}) removed from room ${roomId} due to disconnect.`);

                // Check if the room becomes empty after this player leaves
                const remainingPlayersSnapshot = await db.collection('playersInRooms')
                                                            .where('room_id', '==', roomId)
                                                            .get();

                if (remainingPlayersSnapshot.empty) {
                    await db.collection('rooms').doc(roomId).delete();
                    console.log(`Room ${roomId} deleted as it became empty after disconnect.`);
                    io.to(roomId).emit('roomStateUpdate', null); // Signal room is gone
                } else {
                    await broadcastRoomState(roomId); // Broadcast updated state if room still has players
                }
            }
        } catch (error) {
            console.error('Error handling disconnect:', error);
        }
    });
});


// 6. Start the HTTP server (which Socket.IO is attached to)
server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`Frontend should connect to ${FRONTEND_URL}`);
});