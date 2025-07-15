const express = require('express');
const app = express();
const employeeRoutes = require('./routes/employees');
const path = require('path');
const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

// Register auth routes
app.use('/api/employee', employeeRoutes);

app.listen(process.env.PORT || 4003, () => {
    console.log(`Auth empolyee running on port ${process.env.PORT || 4003}`);
});

app.use(
    '/employee-photos',
    express.static(path.join(__dirname, '../uploads/employee_photos'))
);
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: err.message, code: 'UPLOAD_ERROR' });
    }

    if (err.message?.includes('Only JPG')) {
        return res.status(400).json({ success: false, message: err.message, code: 'INVALID_FILE_TYPE' });
    }

    next(err);
});