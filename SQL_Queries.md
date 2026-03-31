# SQL Queries Used in Backend API Routes

This document lists all SQL queries executed by the Express backend route handlers.
DDL statements (CREATE TABLE, ALTER TABLE, etc.) are located in `backend/student_info_system_db.sql`.

---

## auth.js — `POST /api/auth/login`

**Fetch faculty by email (login)**
```sql
SELECT faculty_id, first_name, last_name, email, password_hash, phone_number, position
FROM Faculty WHERE email = ?
```

**Fetch student by email (login)**
```sql
SELECT StudentID, FirstName, LastName, Email, password_hash, GradeLevel
FROM Student WHERE Email = ?
```

---

## students.js — `/api/students`

**GET all students (with subclass data via LEFT JOINs)**
```sql
SELECT s.*, ft.ExtraCurricularActivities, ft.GuardianContactInfo,
       pt.ReasonForPartTime, pt.HoursEnrolledPerWeek
FROM Student s
LEFT JOIN Student_FullTime ft ON s.StudentID = ft.StudentID
LEFT JOIN Student_PartTime pt ON s.StudentID = pt.StudentID
```

**GET single student by ID**
```sql
SELECT s.*, ft.ExtraCurricularActivities, ft.GuardianContactInfo,
       pt.ReasonForPartTime, pt.HoursEnrolledPerWeek
FROM Student s
LEFT JOIN Student_FullTime ft ON s.StudentID = ft.StudentID
LEFT JOIN Student_PartTime pt ON s.StudentID = pt.StudentID
WHERE s.StudentID = ?
```

**POST — Enrol new student (stored procedure)**
```sql
CALL EnrolStudent(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
```

**PUT — Update student base fields**
```sql
UPDATE Student SET FirstName = ?, LastName = ?, ... WHERE StudentID = ?
```

**PUT — Check if FullTime subclass row exists**
```sql
SELECT StudentID FROM Student_FullTime WHERE StudentID = ?
```

**PUT — Update FullTime subclass**
```sql
UPDATE Student_FullTime
SET ExtraCurricularActivities = ?, GuardianContactInfo = ?
WHERE StudentID = ?
```

**PUT — Insert FullTime subclass (if switching type)**
```sql
INSERT INTO Student_FullTime (StudentID, ExtraCurricularActivities, GuardianContactInfo)
VALUES (?, ?, ?)
```

**PUT — Remove from PartTime (if switching type)**
```sql
DELETE FROM Student_PartTime WHERE StudentID = ?
```

**PUT — Check if PartTime subclass row exists**
```sql
SELECT StudentID FROM Student_PartTime WHERE StudentID = ?
```

**PUT — Update PartTime subclass**
```sql
UPDATE Student_PartTime
SET ReasonForPartTime = ?, HoursEnrolledPerWeek = ?
WHERE StudentID = ?
```

**PUT — Insert PartTime subclass (if switching type)**
```sql
INSERT INTO Student_PartTime (StudentID, ReasonForPartTime, HoursEnrolledPerWeek)
VALUES (?, ?, ?)
```

**PUT — Remove from FullTime (if switching type)**
```sql
DELETE FROM Student_FullTime WHERE StudentID = ?
```

**DELETE student by ID**
```sql
DELETE FROM Student WHERE StudentID = ?
```

---

## faculty.js — `/api/faculty`

**GET all faculty**
```sql
SELECT * FROM Faculty
```

**GET single faculty by ID**
```sql
SELECT * FROM Faculty WHERE faculty_id = ?
```

**POST — Create new faculty member**
```sql
INSERT INTO Faculty (first_name, last_name, email, phone_number, position, password_hash)
VALUES (?, ?, ?, ?, ?, ?)
```

**PUT — Update faculty member**
```sql
UPDATE Faculty SET first_name = ?, ... WHERE faculty_id = ?
```

**DELETE faculty by ID**
```sql
DELETE FROM Faculty WHERE faculty_id = ?
```

---

## course.js — `/api/course`

**GET all courses**
```sql
SELECT * FROM Course
```

**GET single course by ID**
```sql
SELECT * FROM Course WHERE course_id = ?
```

**POST — Create new course**
```sql
INSERT INTO Course (course_name, subject_area, grade_level, course_description)
VALUES (?, ?, ?, ?)
```

**PUT — Update course**
```sql
UPDATE Course SET course_name = ?, ... WHERE course_id = ?
```

**DELETE course by ID**
```sql
DELETE FROM Course WHERE course_id = ?
```

---

## academicTerms.js — `/api/academic-term`

**GET all academic terms**
```sql
SELECT * FROM Academic_Term
```

**GET single term by ID**
```sql
SELECT * FROM Academic_Term WHERE term_id = ?
```

**POST — Create new term**
```sql
INSERT INTO Academic_Term (term_name, school_year, start_date, end_date)
VALUES (?, ?, ?, ?)
```

**PUT — Update term**
```sql
UPDATE Academic_Term SET term_name = ?, ... WHERE term_id = ?
```

**DELETE term by ID**
```sql
DELETE FROM Academic_Term WHERE term_id = ?
```

---

## schedules.js — `/api/schedules`

**GET all schedules**
```sql
SELECT * FROM Schedule
```

**GET single schedule by ID**
```sql
SELECT * FROM Schedule WHERE time_slot_id = ?
```

**POST — Create new time slot**
```sql
INSERT INTO Schedule (days_of_week, start_time, end_time)
VALUES (?, ?, ?)
```

**PUT — Update schedule**
```sql
UPDATE Schedule SET days_of_week = ?, ... WHERE time_slot_id = ?
```

**DELETE schedule by ID**
```sql
DELETE FROM Schedule WHERE time_slot_id = ?
```

---

## courseOfferings.js — `/api/course-offerings`

**GET all course offerings (multi-table JOIN)**
```sql
SELECT co.course_offering_id, co.section_name,
       c.course_name, c.subject_area, c.grade_level,
       at2.term_name, at2.school_year,
       s.days_of_week, s.start_time, s.end_time,
       f.first_name AS faculty_first_name, f.last_name AS faculty_last_name
FROM Course_Offering co
JOIN Course c ON co.course_id = c.course_id
JOIN Academic_Term at2 ON co.term_id = at2.term_id
JOIN Schedule s ON co.time_slot_id = s.time_slot_id
JOIN Faculty f ON co.faculty_id = f.faculty_id
```

**GET single course offering by ID (same JOINs)**
```sql
... WHERE co.course_offering_id = ?
```

**POST — Create new course offering**
```sql
INSERT INTO Course_Offering (section_name, course_id, term_id, time_slot_id, faculty_id)
VALUES (?, ?, ?, ?, ?)
```

**PUT — Update course offering**
```sql
UPDATE Course_Offering SET section_name = ?, ... WHERE course_offering_id = ?
```

**DELETE course offering by ID**
```sql
DELETE FROM Course_Offering WHERE course_offering_id = ?
```

---

## enrollments.js — `/api/enrollments`

**GET all enrollments (multi-table JOIN, supports ORDER BY via ?sort_by query param)**
```sql
SELECT e.enrollment_id, e.student_id, e.enrollment_date, e.enrollment_status, e.grade,
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
ORDER BY e.enrollment_id
-- or ORDER BY s.LastName ASC, s.FirstName ASC (when ?sort_by=student_name)
-- or ORDER BY c.course_name ASC, co.section_name ASC (when ?sort_by=course_name)
```

**GET single enrollment by ID (same JOINs)**
```sql
... WHERE e.enrollment_id = ?
```

**GET average grade per course (aggregation with GROUP BY)**
```sql
SELECT c.course_id, c.course_name, c.subject_area,
       ROUND(AVG(e.grade), 2) AS avg_grade,
       COUNT(e.enrollment_id) AS total_enrolled,
       COUNT(e.grade) AS graded_count
FROM Course c
JOIN Course_Offering co ON c.course_id = co.course_id
JOIN Enrollment e ON co.course_offering_id = e.course_offering_id
WHERE e.enrollment_status IN ('Enrolled', 'Completed')
GROUP BY c.course_id, c.course_name, c.subject_area
HAVING COUNT(e.grade) > 0
ORDER BY avg_grade DESC
```

**POST — Schedule conflict check (before insert)**
```sql
SELECT e.enrollment_id, c.course_name, co.section_name
FROM Enrollment e
JOIN Course_Offering co ON e.course_offering_id = co.course_offering_id
JOIN Course c ON co.course_id = c.course_id
JOIN Course_Offering new_co ON new_co.course_offering_id = ?
WHERE e.student_id = ?
  AND e.enrollment_status = 'Enrolled'
  AND co.time_slot_id = new_co.time_slot_id
  AND co.term_id = new_co.term_id
```

**POST — Create new enrollment**
```sql
INSERT INTO Enrollment (student_id, course_offering_id, enrollment_date, enrollment_status)
VALUES (?, ?, CURDATE(), ?)
```

**PUT — Update enrollment (dynamic fields)**
```sql
UPDATE Enrollment SET enrollment_status = ?, grade = ?, ... WHERE enrollment_id = ?
```

**DELETE enrollment by ID**
```sql
DELETE FROM Enrollment WHERE enrollment_id = ?
```

---

## prerequisites.js — `/api/prerequisites`

**GET all prerequisites (double JOIN on Course)**
```sql
SELECT p.course_id, c1.course_name AS course_name,
       p.prereq_course_id, c2.course_name AS prerequisite_name
FROM Prerequisite p
JOIN Course c1 ON p.course_id = c1.course_id
JOIN Course c2 ON p.prereq_course_id = c2.course_id
```

**GET prerequisites for a specific course**
```sql
... WHERE p.course_id = ?
```

**POST — Create new prerequisite relationship**
```sql
INSERT INTO Prerequisite (course_id, prereq_course_id)
VALUES (?, ?)
```

**DELETE prerequisite relationship**
```sql
DELETE FROM Prerequisite WHERE course_id = ? AND prereq_course_id = ?
```

---

## supervises.js — `/api/supervises`

**GET all supervision relationships (double JOIN on Faculty)**
```sql
SELECT s.supervisor_id,
       f1.first_name AS supervisor_first_name, f1.last_name AS supervisor_last_name,
       s.supervisee_id,
       f2.first_name AS supervisee_first_name, f2.last_name AS supervisee_last_name
FROM Supervises s
JOIN Faculty f1 ON s.supervisor_id = f1.faculty_id
JOIN Faculty f2 ON s.supervisee_id = f2.faculty_id
```

**GET supervisees for a specific supervisor**
```sql
... WHERE s.supervisor_id = ?
```

**POST — Create new supervision relationship**
```sql
INSERT INTO Supervises (supervisor_id, supervisee_id)
VALUES (?, ?)
```

**DELETE supervision relationship**
```sql
DELETE FROM Supervises WHERE supervisor_id = ? AND supervisee_id = ?
```

---

## stats.js — `/api/stats`

**GET dashboard statistics (subqueries)**
```sql
SELECT
    (SELECT COUNT(*) FROM Student) AS total_students,
    (SELECT COUNT(*) FROM Faculty) AS total_faculty,
    (SELECT COUNT(*) FROM Course) AS total_courses,
    (SELECT COUNT(*) FROM Enrollment WHERE enrollment_status = 'Enrolled') AS active_enrolments
```
