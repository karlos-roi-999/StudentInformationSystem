const express = require('express');
const router = express.Router();
const db = require('../db');

// GET ALL
router.get('/', async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM Academic_Term');
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({message:"Error getting Academic Term"});
    }
});

// GET a single academic term
router.get('/:id', async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM Academic_Term WHERE term_id = ?', [req.params.id]);
        if(result.length === 0) {
            return res.status(404).json({message:"Term not found"})
        }
        res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({message:"Error getting term"});  
    }
});

// POST (Create) a new Academic Term
router.post('/', async (req, res) => {
    try {
        const {term_name, school_year, start_date, end_date} = req.body;
        const [result] = await db.query(
            `INSERT INTO Academic_Term (term_name, school_year, start_date, end_date) VALUES (?, ?, ?, ?);`, [term_name, school_year, start_date, end_date]
        )
        res.status(201).json({message:"Term created successfully", termId: result.insertId});
    } catch (err) {
        console.error(err);
        res.status(500).json({message:"Error creating new term"});
    }
});

// PUT (Update) and Academic Term
router.put('/:id', async (req, res) => {
    try {
        const fields = [];
        const values = [];

        for(const[key, value] of Object.entries(req.body)){
            fields.push(`${key} = ?`);
            values.push(value);
        }

        if(fields.length === 0) {
            return res.status(404).json({message: "No fields to update"});
        }

        values.push(req.params.id);
        const [result] = await db.query(
            `UPDATE Academic_Term SET ${fields.join(', ')} WHERE term_id = ?`, values
        );

        if(result.affectedRows === 0){
            return res.status(404).json({message: "Term not found"});
        }
        res.json({message: "Term updated successfully"});

    } catch (err) {
        console.error(err);
        res.status(500).json({message:"Error updating term"});
    }
});

// DELETE an academic term
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query(`DELETE FROM Academic_Term WHERE term_id = ?`, req.params.id);
        
        if(result.affectedRows === 0) {
            return res.status(404).json({message:"Term not found"});
        }

        res.status(200).json({message:"Term deleted successfully"});

    } catch (err) {
        console.error(err);
        res.status(500).json({message:"Error deleting term"});
    }
});

module.exports = router;