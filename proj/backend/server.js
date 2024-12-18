const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config();
const cors = require('cors');


const userRoutes = require('./routes/users');
const testRoutes = require('./routes/tests');
const authRoutes = require('./routes/auth');
const userProfileRoutes = require('./routes/userProfile');
const testResultRoutes = require('./routes/testResults');
const reviewRoutes = require('./routes/review')
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
}));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));

app.use('/api/users', userRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/userprofile', userProfileRoutes);
app.use('/api/testresults', testResultRoutes);
app.use('/api/review', reviewRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
