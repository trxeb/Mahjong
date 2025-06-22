const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Try to load user routes, but don't fail if Firebase admin isn't configured
let userRoutes;
try {
  userRoutes = require('./routes/user');
  app.use('/api/users', userRoutes);
  console.log('User routes loaded successfully');
} catch (error) {
  console.log('User routes not loaded due to Firebase admin configuration:', error.message);
}

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Mahjong Server is running!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 