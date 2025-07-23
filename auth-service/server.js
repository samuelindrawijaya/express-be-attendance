const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const cors = require('cors');
const cookieParser = require('cookie-parser');


app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Register auth routes
app.use('/api/auth', authRoutes);

app.listen(process.env.PORT || 4002, () => {
    console.log(`Auth service running on port ${process.env.PORT || 4002}`);
});
