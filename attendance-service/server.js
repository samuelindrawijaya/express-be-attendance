const express = require('express');
const app = express();
const attendanceRoutes = require('./routes/attendances');

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
const path = require('path');
app.use(express.json());

app.use('/api/attendance', attendanceRoutes);

app.use(
    '/attendance-photos',
    express.static(path.join(__dirname, '../uploads/attendance_photos'))
);


app.listen(process.env.PORT, () => {
  console.log(`Attendance service running on port ${process.env.PORT}`);
});
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message, code: 'UPLOAD_ERROR' });
  }

  if (err.message?.includes('Only JPG')) {
    return res.status(400).json({ success: false, message: err.message, code: 'INVALID_FILE_TYPE' });
  }

  next(err);
});

