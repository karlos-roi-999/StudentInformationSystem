const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all courses in the database
router.get('/', async (req, res) => {
    try {
        const [results] = await db.query(`SELECT * FROM Course`);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({message:"Error getting courses"});   
    }
});

// GET a single course by course_id
router.get('/:id', async (req,res) => {
    try {
        const [results] = await db.query('SELECT * FROM Course WHERE course_id = ?', req.params.id);
        if(results.length === 0){
            return res.status(404).json({message: "Course not found"});
        }
        res.json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({message:"Error getting courses"});
    }
});

// POST (Create a new course) 
router.post('/', async (req, res) => {
    try {
        const {course_name, subject_area, grade_level, course_description} = req.body;
        const [results] = await db.query(
            `INSERT INTO Course (course_name, subject_area, grade_level, course_description)
            VALUES (?, ?, ?, ?)`, [course_name, subject_area, grade_level, course_description]
        );
        res.status(201).json( {message: "Course created successfully", courseId: results.insertId});
    } catch (err) {
        console.error(err);
        res.status(500).json( {message: "Error creating new course"} );
    }
});

// PUT (Update) a course 
router.put('/:id', async (req, res) => {
    try {
        const fields = [];
        const values = [];

        for(const[key, value] of Object.entries(req.body)){
            fields.push(`${key} = ?`);
            values.push(value);
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(req.params.id);
        const [result] = await db.query(
            `UPDATE Course SET ${fields.join(', ')} WHERE course_id = ?`,
            values
        );

        if(result.affectedRows === 0){
            return res.status(404).json({message:"Course not found"});
        }
        res.json({message: "Course update successfully"});

    } catch (err) {
        console.error(err);
        res.status(500).json( {message: "Error getting course"} );
    }
});

// DELETE a course
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query(`DELETE FROM Course WHERE course_id = ?`, req.params.id);

        if(result.affectedRows === 0){
            return res.status(404).json({message:"Course not found"});
        }

        res.status(200).json( {message: "Course deleted successfully"} );
    } catch (err) {
        console.error(err);
        res.status(500).json( {message: "Error deleting course"} );
    }
});

module.exports = router;