const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

const STUDENT_JOIN_QUERY = `
    SELECT
        s.*,
        ft.ExtraCurricularActivities,
        ft.GuardianContactInfo,
        pt.ReasonForPartTime,
        pt.HoursEnrolledPerWeek
    FROM Student s
    LEFT JOIN Student_FullTime ft ON s.StudentID = ft.StudentID
    LEFT JOIN Student_PartTime pt ON s.StudentID = pt.StudentID
`;

// Determines FullTime vs PartTime based on which subclass columns have data
function deriveStudentType(row) {
    if (row.ExtraCurricularActivities !== null || row.GuardianContactInfo !== null) {
        return 'FullTime';
    } else if (row.ReasonForPartTime !== null || row.HoursEnrolledPerWeek !== null) {
        return 'PartTime';
    }
    return null;  // student has no subclass row yet
}

// Fetch all students with their subclass data (FullTime/PartTime)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(STUDENT_JOIN_QUERY);

        const students = rows.map(row => ({
            ...row,
            student_type: deriveStudentType(row)
        }));

        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching students' });
    }
});

// Fetch one student by ID, including subclass info
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            STUDENT_JOIN_QUERY + ' WHERE s.StudentID = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Attach student_type before sending response
        const student = { ...rows[0], student_type: deriveStudentType(rows[0]) };

        res.json(student);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching student' });
    }
});

// Create a new student via the EnrolStudent stored procedure
router.post('/', async (req, res) => {
    try {
        const {
            first_name, last_name, phone_number, date_of_birth,
            email, grade_level, enrollment_status, student_type,
            extra_curricular, guardian_contact_info,
            reason_for_part_time, hours_enrolled_per_week
        } = req.body;

        // Auto-generate a password like "KSantos47" for new students
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

// Update a student's base info + their FullTime/PartTime subclass data
router.put('/:id', async (req, res) => {
    try {
        const {
            first_name, last_name, email, phone_number,
            date_of_birth, grade_level, enrollment_status,
            student_type,
            extra_curricular, guardian_contact_info,
            reason_for_part_time, hours_enrolled_per_week
        } = req.body;

        const studentFieldMap = {
            first_name:        'FirstName',
            last_name:         'LastName',
            email:             'Email',
            phone_number:      'PhoneNumber',
            date_of_birth:     'DateOfBirth',
            grade_level:       'GradeLevel',
            enrollment_status: 'EnrolmentStatus',  // DB uses British spelling "Enrolment"
        };

        const fields = [];
        const values = [];

        for (const [key, dbCol] of Object.entries(studentFieldMap)) {
            if (req.body[key] !== undefined) {
                fields.push(`${dbCol} = ?`);
                values.push(req.body[key]);
            }
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No base fields to update' });
        }

        values.push(req.params.id);
        const [result] = await db.query(
            `UPDATE Student SET ${fields.join(', ')} WHERE StudentID = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Handle subclass table — upsert into the correct one, clean up the other
        if (student_type === 'FullTime') {
            // Upsert: update if exists, otherwise insert
            const [ftRows] = await db.query(
                'SELECT StudentID FROM Student_FullTime WHERE StudentID = ?',
                [req.params.id]
            );
            if (ftRows.length > 0) {
                await db.query(
                    `UPDATE Student_FullTime
                     SET ExtraCurricularActivities = ?, GuardianContactInfo = ?
                     WHERE StudentID = ?`,
                    [extra_curricular || null, guardian_contact_info || null, req.params.id]
                );
            } else {
                await db.query(
                    `INSERT INTO Student_FullTime (StudentID, ExtraCurricularActivities, GuardianContactInfo)
                     VALUES (?, ?, ?)`,
                    [req.params.id, extra_curricular || null, guardian_contact_info || null]
                );
                // Clean up old subclass if they switched from PartTime
                await db.query('DELETE FROM Student_PartTime WHERE StudentID = ?', [req.params.id]);
            }
        } else if (student_type === 'PartTime') {
            const [ptRows] = await db.query(
                'SELECT StudentID FROM Student_PartTime WHERE StudentID = ?',
                [req.params.id]
            );
            if (ptRows.length > 0) {
                await db.query(
                    `UPDATE Student_PartTime
                     SET ReasonForPartTime = ?, HoursEnrolledPerWeek = ?
                     WHERE StudentID = ?`,
                    [reason_for_part_time || null, hours_enrolled_per_week || null, req.params.id]
                );
            } else {
                await db.query(
                    `INSERT INTO Student_PartTime (StudentID, ReasonForPartTime, HoursEnrolledPerWeek)
                     VALUES (?, ?, ?)`,
                    [req.params.id, reason_for_part_time || null, hours_enrolled_per_week || null]
                );
                // Clean up old subclass if they switched from FullTime
                await db.query('DELETE FROM Student_FullTime WHERE StudentID = ?', [req.params.id]);
            }
        }

        res.json({ message: 'Student updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating student' });
    }
});


// Delete a student by ID
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