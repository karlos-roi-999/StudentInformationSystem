const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all enrollments
router.get('/', async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT e.enrollment_id, e.student_id, e.enrollment_date, e.enrollment_status,
            s.FirstName AS student_first_name, s.LastName AS student_last_name,
            co.course_offering_id, co.section_name,
            c.course_name, c.subject_area,
            at2.term_name, at2.school_year,
            sch.days_of_week, sch.start_time, sch.end_time,
            f.first_name AS faculty_first_name, f.last_name AS faculty_last_name
            FROM Enrollment e
            JOIN Student s ON e.student_id = s.StudentID
            JOIN Course_Offering co ON e.course_offering_id = co.course_offering_id
            JOIN Course c ON co.course_id = c.course_id
            JOIN Academic_Term at2 ON co.term_id = at2.term_id
            JOIN Schedule sch ON co.time_slot_id = sch.time_slot_id
            JOIN Faculty f ON co.faculty_id = f.faculty_id
        `);

        if(result.length === 0) {
            return res.status(404).json({message:"Enrollments not found"});
        }

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({message:"Error fetching enrollments"});
    }
});

// GET a single enrollment by ID (with JOINs)
router.get('/:id', async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT e.enrollment_id, e.student_id, e.enrollment_date, e.enrollment_status,
            s.FirstName AS student_first_name, s.LastName AS student_last_name,
            co.course_offering_id, co.section_name,
            c.course_name, c.subject_area,
            at2.term_name, at2.school_year,
            sch.days_of_week, sch.start_time, sch.end_time,
            f.first_name AS faculty_first_name, f.last_name AS faculty_last_name
            FROM Enrollment e
            JOIN Student s ON e.student_id = s.StudentID
            JOIN Course_Offering co ON e.course_offering_id = co.course_offering_id
            JOIN Course c ON co.course_id = c.course_id
            JOIN Academic_Term at2 ON co.term_id = at2.term_id
            JOIN Schedule sch ON co.time_slot_id = sch.time_slot_id
            JOIN Faculty f ON co.faculty_id = f.faculty_id
            WHERE e.enrollment_id = ?
        `, [req.params.id]);

        if(result.length === 0) {
            return res.status(404).json({message:"Enrollment not found"});
        }

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({message:"Error fetching enrollment"})
    }
})

// POST (Create) a new enrollment
router.post('/', async (req, res) => {
    try {
        const {student_id, course_offering_id, enrollment_date, enrollment_status} = req.body;
        const [result] = await db.query(
            'INSERT INTO Enrollment (student_id, course_offering_id, enrollment_date, enrollment_status) VALUES (?, ?, CURDATE(), ?)',
            [student_id, course_offering_id, enrollment_status]
        );
        res.status(201).json({message: 'Enrollment created successfully', enrollment_id: result.insertId});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error creating enrollment'});
    }
});

// PUT (Update) an enrollment
router.put('/:id', async (req, res) => {
    try {
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(req.body)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }

        if (fields.length === 0) {
            return res.status(400).json({message: 'No fields to update'});
        }

        values.push(req.params.id);
        const [result] = await db.query(
            `UPDATE Enrollment SET ${fields.join(', ')} WHERE enrollment_id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({message: 'Enrollment not found'});
        }
        res.json({message: 'Enrollment updated successfully'});

    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error updating enrollment'});
    }
});

// DELETE an enrollment
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM Enrollment WHERE enrollment_id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({message: 'Enrollment not found'});
        }

        res.status(200).json({message: 'Enrollment deleted successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error deleting enrollment'});
    }
});

module.exports = router;
