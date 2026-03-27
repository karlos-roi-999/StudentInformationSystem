const express = require("express");
const dotenv = require("dotenv");
const db = require('./db');
const studentRoutes = require('./routes/students');
const facultyRoutes = require('./routes/faculty');
const courseRoutes = require('./routes/course');
const acadTerm = require('./routes/academicTerms');
const scheduleRoutes = require('./routes/schedules');
const courseOfferingRoutes = require('./routes/courseOfferings');
const enrollmentRoutes = require('./routes/enrollments');
const prerequisiteRoutes = require('./routes/prerequisites');
const supervisesRoutes = require('./routes/supervises');
const authRoutes = require('./routes/auth');

// Environment variables from .env files
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
// DO NOT TOUCH ANY OF THESE
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/academic-term', acadTerm);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/course-offerings', courseOfferingRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/prerequisites', prerequisiteRoutes);
app.use('/api/supervises', supervisesRoutes);
app.use('/api/auth', authRoutes);

// Test (Remove later)
app.get('/', (req,res) => {
    res.json({ message: "Student Information System API is running"});
})

db.getConnection()
    .then((connection) => {
        console.log("Database connected successfully!");
        connection.release();

        app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
    })
    .catch((err) => {
        console.log("Database connection failed: " + err.message);
    });