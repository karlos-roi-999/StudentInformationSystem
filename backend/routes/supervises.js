const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all supervision relationships (with JOINs)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.supervisor_id,
                   f1.first_name AS supervisor_first_name, f1.last_name AS supervisor_last_name,
                   s.supervisee_id,
                   f2.first_name AS supervisee_first_name, f2.last_name AS supervisee_last_name
            FROM Supervises s
            JOIN Faculty f1 ON s.supervisor_id = f1.faculty_id
            JOIN Faculty f2 ON s.supervisee_id = f2.faculty_id
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error fetching supervision relationships'});
    }
});

// GET all supervisees for a specific supervisor (with JOINs)
router.get('/:supervisorId', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.supervisor_id,
                   f1.first_name AS supervisor_first_name, f1.last_name AS supervisor_last_name,
                   s.supervisee_id,
                   f2.first_name AS supervisee_first_name, f2.last_name AS supervisee_last_name
            FROM Supervises s
            JOIN Faculty f1 ON s.supervisor_id = f1.faculty_id
            JOIN Faculty f2 ON s.supervisee_id = f2.faculty_id
            WHERE s.supervisor_id = ?
        `, [req.params.supervisorId]);

        if (rows.length === 0) {
            return res.status(404).json({message: 'No supervisees found for this supervisor'});
        }
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error fetching supervisees'});
    }
});


// POST (Create) a new supervision relationship
router.post('/', async (req, res) => {
    try {
        const {supervisor_id, supervisee_id} = req.body;

        // Prevent a faculty member from supervising themselves
        if (supervisor_id === supervisee_id) {
            return res.status(400).json({message: 'A faculty member cannot supervise themselves'});
        }

        const [result] = await db.query(
            'INSERT INTO Supervises (supervisor_id, supervisee_id) VALUES (?, ?)',
            [supervisor_id, supervisee_id]
        );
        res.status(201).json({message: 'Supervision relationship created successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error creating supervision relationship'});
    }
});

// DELETE a supervision relationship
router.delete('/', async (req, res) => {
    try {
        const {supervisor_id, supervisee_id} = req.body;
        const [result] = await db.query(
            'DELETE FROM Supervises WHERE supervisor_id = ? AND supervisee_id = ?',
            [supervisor_id, supervisee_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({message: 'Supervision relationship not found'});
        }

        res.status(200).json({message: 'Supervision relationship removed successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error removing supervision relationship'});
    }
});

module.exports = router;
