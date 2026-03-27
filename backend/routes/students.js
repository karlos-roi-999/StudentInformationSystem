const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// GET all students
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Student');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching students' });
    }
});

// GET a single student by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Student WHERE StudentID = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching student' });
    }
});

// POST (Create) a new student using EnrolStudent stored procedure
router.post('/', async (req, res) => {
    try {
        const {
            first_name, last_name, phone_number, date_of_birth,
            email, grade_level, enrollment_status, student_type,
            extra_curricular, guardian_contact_info,
            reason_for_part_time, hours_enrolled_per_week
        } = req.body;

        // Generate default password: (FirstLetter)(LastName)(random 2 digits) e.g. KSantos47
        const randomNum = String(Math.floor(Math.random() * 100)).padStart(2, '0');
        const defaultPassword = first_name.charAt(0).toUpperCase() + last_name + randomNum;
        const password_hash = await bcrypt.hash(defaultPassword, 10);

        await db.query(
            'CALL EnrolStudent(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                first_name, last_name, phone_number, date_of_birth,
                email, grade_level, enrollment_status, student_type,
                extra_curricular || null, guardian_contact_info || null,
                reason_for_part_time || null, hours_enrolled_per_week || null,
                password_hash
            ]
        );
        res.status(201).json({ message: 'Student enrolled successfully', default_password: defaultPassword });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error enrolling student' });
    }
});

// PUT (Update) a student
router.put('/:id', async (req, res) => {
    try {
        const fields = [];
        const values = [];

        // Loop to ensure that only fields that are inserted be the only ones to be updated
        for (const [key, value] of Object.entries(req.body)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(req.params.id);
        const [result] = await db.query(
            `UPDATE Student SET ${fields.join(', ')} WHERE StudentID = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({ message: 'Student updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating student' });
    }
});


// DELETE a student (using student id in the parameters)
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM Student WHERE StudentID = ?', [req.params.id]);
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting student' });
    }
});

module.exports = router;