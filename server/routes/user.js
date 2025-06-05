// server/src/routes/users.js (example with Express)
const express = require('express');
const router = express.Router();
const admin = require('../firebase-admin-init'); // Your Admin SDK setup

router.post('/createUser', async (req, res) => {
  const { email, password, displayName } = req.body;
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName
    });
    res.status(201).json({ message: 'User created successfully', uid: userRecord.uid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;n