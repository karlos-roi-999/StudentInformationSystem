const express = require('express');
const router = express.Router();
const db = require('../db');

// List all course offerings with joined course, term, schedule, and faculty info
router.get('/', async (req, res) => {
    try {
        const [result] = await db.query(
            `SELECT co.course_offering_id, co.section_name,
            c.course_name, c.subject_area, c.grade_level, at2.term_name,
            at2.school_year, s.days_of_week, s.start_time, s.end_time,
            f.first_name AS faculty_first_name, f.last_name AS faculty_last_name
            FROM Course_Offering co
            JOIN Course c ON co.course_id = c.course_id
            JOIN Academic_Term at2 ON co.term_id = at2.term_id
            JOIN Schedule s ON co.time_slot_id = s.time_slot_id
            JOIN Faculty f ON co.faculty_id = f.faculty_id`
        );
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({message:"Error fetching course offerings"});   
    }
});

// Get one course offering by ID (with all joined details)
router.get('/:id', async (req, res) => {
    try {
        const [result] = await db.query(
            `SELECT co.course_offering_id, co.section_name,
            c.course_name, c.subject_area, at2.term_name,
            at2.school_year, s.days_of_week, s.start_time, s.end_time,
            f.first_name AS faculty_first_name, f.last_name AS faculty_last_name
            FROM Course_Offering co
            JOIN Course c ON co.course_id = c.course_id
            JOIN Academic_Term at2 ON co.term_id = at2.term_id
            JOIN Schedule s ON co.time_slot_id = s.time_slot_id
            JOIN Faculty f ON co.faculty_id = f.faculty_id
            WHERE co.course_offering_id = ?`, [req.params.id]
        );

        if(result.length === 0){
            return res.status(404).json({message:"Course Offering not found"});
        }
        res.json(result[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({message:"Error fetching course offering"});   
    }
});


// Create a new course offering
router.post('/', async (req, res) => {
    try {
        const {section_name, course_id, term_id, time_slot_id, faculty_id} = req.body;
        const [result] = await db.query(
            'INSERT INTO Course_Offering (section_name, course_id, term_id, time_slot_id, faculty_id) VALUES (?, ?, ?, ?, ?)',
            [section_name, course_id, term_id, time_slot_id, faculty_id]
        );
        res.status(201).json({message: 'Course offering created successfully', course_offering_id: result.insertId});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error creating course offering'});
    }
});

// Update course offering fields
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
            `UPDATE Course_Offering SET ${fields.join(', ')} WHERE course_offering_id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({message: 'Course offering not found'});
        }
        res.json({message: 'Course offering updated successfully'});

    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error updating course offering'});
    }
});

// Remove a course offering by ID
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM Course_Offering WHERE course_offering_id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({message: 'Course offering not found'});
        }

        res.status(200).json({message: 'Course offering deleted successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error deleting course offering'});
    }
});

module.exports = router;
