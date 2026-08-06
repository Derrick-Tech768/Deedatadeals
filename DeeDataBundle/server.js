const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const topupRoutes = require('./routes/topup');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', topupRoutes);
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`DeeDataBundle server running on http://localhost:${PORT}`);
});
