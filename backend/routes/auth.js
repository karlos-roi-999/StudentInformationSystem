const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sis-secret-key-2026';

// Login — checks Faculty table first, then Student table
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Look for a matching faculty account
        const [faculty] = await db.query(
            'SELECT faculty_id, first_name, last_name, email, password_hash, phone_number, position FROM Faculty WHERE email = ?',
            [email]
        );

        if (faculty.length > 0) {
            const user = faculty[0];
            const match = await bcrypt.compare(password, user.password_hash);

            if (!match) {
                return res.status(401).json({ message: 'Invalid password' });
            }

            // Hard-coded SuperAdmin check (only Michael Thompson has this role)
            const isSuperAdmin = user.first_name === 'Michael' && user.last_name === 'Thompson';
            const role = isSuperAdmin ? 'SuperAdmin' : 'Admin';

            const token = jwt.sign(
                { id: user.faculty_id, role, email: user.email },
                JWT_SECRET,
                { expiresIn: '8h' }
            );

            return res.json({  
                message: 'Login successful',
                token,
                user: {
                    id: user.faculty_id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone_number: user.phone_number,
                    position: user.position,
                    role
                }
            });
        }

        // No faculty match — try the Student table instead
        const [students] = await db.query(
            'SELECT StudentID, FirstName, LastName, Email, password_hash, GradeLevel FROM Student WHERE Email = ?',
            [email]
        );

        if (students.length > 0) {
            const user = students[0];
            const match = await bcrypt.compare(password, user.password_hash);

            if (!match) {
                return res.status(401).json({ message: 'Invalid password' });
            }

            const token = jwt.sign(
                { id: user.StudentID, role: 'Student', email: user.Email },
                JWT_SECRET,
                { expiresIn: '8h' }
            );

            return res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.StudentID,
                    first_name: user.FirstName,
                    last_name: user.LastName,
                    email: user.Email,
                    grade_level: user.GradeLevel,
                    role: 'Student'
                }
            });
        }

        // Email doesn't exist in either table
        return res.status(401).json({ message: 'No account found with that email' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error during login' });
    }
});

module.exports = router;
