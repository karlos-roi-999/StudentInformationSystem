const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all schedules
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Schedule');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error fetching schedules'});
    }
});

// GET a single schedule by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Schedule WHERE time_slot_id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({message: 'Schedule not found'});
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error fetching schedule'});
    }
});

// POST (Create) a new schedule
router.post('/', async (req, res) => {
    try {
        const {days_of_week, start_time, end_time} = req.body;
        const [result] = await db.query(
            'INSERT INTO Schedule (days_of_week, start_time, end_time) VALUES (?, ?, ?)',
            [days_of_week, start_time, end_time]
        );
        res.status(201).json({message: 'Schedule created successfully', time_slot_id: result.insertId});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error creating schedule'});
    }
});

// PUT (Update) a schedule
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
            `UPDATE Schedule SET ${fields.join(', ')} WHERE time_slot_id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({message: 'Schedule not found'});
        }
        res.json({message: 'Schedule updated successfully'});

    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error updating schedule'});
    }
});

// DELETE a schedule
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM Schedule WHERE time_slot_id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({message: 'Schedule not found'});
        }

        res.status(200).json({message: 'Schedule deleted successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error deleting schedule'});
    }
});

module.exports = router;
