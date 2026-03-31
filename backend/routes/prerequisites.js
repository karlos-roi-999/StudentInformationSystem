const express = require('express');
const router = express.Router();
const db = require('../db');

// List all prerequisite relationships with course names
router.get('/', async (req, res) => {
    try {
        const [result] = await db.query(`
           SELECT p.course_id, c1.course_name AS course_name, 
           p.prereq_course_id, c2.course_name AS prerequisite_name
           FROM Prerequisite p
           JOIN Course c1 ON p.course_id = c1.course_id
           JOIN Course c2 ON p.prereq_course_id = c2.course_id
        `)
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({message:"Error fetching course prerequisites"});
    }
});

// List prerequisites for a specific course
router.get('/:id', async (req, res) => {
    try {
        const [result] = await db.query(`
           SELECT p.course_id, c1.course_name AS course_name, 
           p.prereq_course_id, c2.course_name AS prerequisite_name
           FROM Prerequisite p
           JOIN Course c1 ON p.course_id = c1.course_id
           JOIN Course c2 ON p.prereq_course_id = c2.course_id
           WHERE p.course_id = ?
        `, [req.params.id])
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({message:"Error fetching course prerequisites"});
    }
});


// Add a prerequisite link between two courses
router.post('/', async (req, res) => {
    try {
        const {course_id, prereq_course_id} = req.body;

        // Can't require itself as a prerequisite
        if (course_id === prereq_course_id) {
            return res.status(400).json({message: 'A course cannot be its own prerequisite'});
        }

        const [result] = await db.query(
            'INSERT INTO Prerequisite (course_id, prereq_course_id) VALUES (?, ?)',
            [course_id, prereq_course_id]
        );
        res.status(201).json({message: 'Prerequisite added successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error adding prerequisite'});
    }
});

// Remove a prerequisite link
router.delete('/', async (req, res) => {
    try {
        const {course_id, prereq_course_id} = req.body;
        const [result] = await db.query(
            'DELETE FROM Prerequisite WHERE course_id = ? AND prereq_course_id = ?',
            [course_id, prereq_course_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({message: 'Prerequisite not found'});
        }

        res.status(200).json({message: 'Prerequisite removed successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error removing prerequisite'});
    }
});

module.exports = router;
