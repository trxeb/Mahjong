// server/src/firebase-admin-init.js
const admin = require('firebase-admin');
const serviceAccount = require('../config/serviceAccountKey.json');// Adjust path as needed C:\GitHub Projects\Mahjong\server\config\serviceAccountKey.json

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount), 
    databaseURL: "https://mahjong-8c580.firebaseio.com" // Only if you use Realtime Database
  });
  console.log('Firebase Admin SDK initialized successfully!');
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error);
}

module.exports = admin;