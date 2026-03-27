const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// GET all faculty members
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Faculty');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching faculty members' });
    }
});

// GET a single faculty member by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Faculty WHERE faculty_id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Faculty member not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching faculty member' });
    }
});

// POST (Create) a new faculty member
router.post('/', async (req, res) => {
    try {
        const {first_name, last_name, email, phone_number, position} = req.body;

        // Generate default password: (FirstLetter)(LastName)(random 2 digits) e.g. MThompson73
        const randomNum = String(Math.floor(Math.random() * 100)).padStart(2, '0');
        const defaultPassword = first_name.charAt(0).toUpperCase() + last_name + randomNum;
        const password_hash = await bcrypt.hash(defaultPassword, 10);

        const [result] = await db.query(
            'INSERT INTO Faculty (first_name, last_name, email, phone_number, position, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, phone_number, position, password_hash]
        );
        res.status(201).json({ message: 'Faculty member created successfully', faculty_id: result.insertId, default_password: defaultPassword });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating faculty member' });
    }
});

// PUT (Update) a faculty member
router.put('/:id', async (req, res) => {
    try {
        const fields = [];
    const values = [];

    for(const [key, value] of Object.entries(req.body)){
        fields.push(`${key} = ?`);
        values.push(value);
    }

    if(fields.length === 0){
        return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(req.params.id);
    const [result] = await db.query(
        `UPDATE Faculty SET ${fields.join(', ')} WHERE faculty_id = ?`,
        values
    )

    if(result.affectedRows === 0) {
        return res.status(404).json( {message: "Faculty member not found"} )
    }
    res.json({message:"Faculty member updated successfully"});

    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Error updating faculty member"})
    }
});

// DELETE a faculty member
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM Faculty WHERE faculty_id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({message: "Faculty member not found"});
        }

        res.status(200).json({message: "Faculty member deleted successfully"})
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Error deleting faculty member"});
    }
});

module.exports = router;