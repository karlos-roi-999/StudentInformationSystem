const express = require('express');
const router = express.Router();
const db = require('../db');

// Dashboard summary counts (students, faculty, courses, active enrollments)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                (SELECT COUNT(*) FROM Student) AS total_students,
                (SELECT COUNT(*) FROM Faculty) AS total_faculty,
                (SELECT COUNT(*) FROM Course) AS total_courses,
                (SELECT COUNT(*) FROM Enrollment WHERE enrollment_status = 'Enrolled') AS active_enrolments
        `);

        res.json(rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

module.exports = router;
