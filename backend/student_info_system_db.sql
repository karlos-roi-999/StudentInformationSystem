-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 27, 2026 at 09:22 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `student_info_system_db`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `EnrolStudent` (IN `p_FirstName` VARCHAR(50), IN `p_LastName` VARCHAR(50), IN `p_PhoneNumber` VARCHAR(20), IN `p_DateOfBirth` DATE, IN `p_Email` VARCHAR(100), IN `p_GradeLevel` VARCHAR(10), IN `p_EnrolmentStatus` ENUM('Active','Inactive'), IN `p_StudentType` VARCHAR(10), IN `p_ExtraCurricular` VARCHAR(255), IN `p_GuardianContactInfo` VARCHAR(255), IN `p_ReasonForPartTime` VARCHAR(255), IN `p_HoursEnrolledPerWeek` DECIMAL(4,1), IN `p_PasswordHash` VARCHAR(255))   BEGIN
    DECLARE v_StudentID BIGINT;

    START TRANSACTION;

    INSERT INTO Student
        (FirstName, LastName, PhoneNumber, DateOfBirth,
         Email, GradeLevel, EnrolmentStatus)
    VALUES
        (p_FirstName, p_LastName, p_PhoneNumber, p_DateOfBirth,
         p_Email, p_GradeLevel, p_EnrolmentStatus);

    SET v_StudentID = LAST_INSERT_ID();

    IF p_StudentType = 'FullTime' THEN
        INSERT INTO Student_FullTime
            (StudentID, ExtraCurricularActivities, GuardianContactInfo)
        VALUES
            (v_StudentID, p_ExtraCurricular, p_GuardianContactInfo);

    ELSEIF p_StudentType = 'PartTime' THEN
        INSERT INTO Student_PartTime
            (StudentID, ReasonForPartTime, HoursEnrolledPerWeek)
        VALUES
            (v_StudentID, p_ReasonForPartTime, p_HoursEnrolledPerWeek);

    ELSE
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid student type. Use FullTime or PartTime.';
    END IF;

    COMMIT;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `academic_term`
--

CREATE TABLE `academic_term` (
  `term_id` int(11) NOT NULL,
  `term_name` enum('Winter','Spring','Summer','Fall') NOT NULL,
  `school_year` year(4) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL
) ;

--
-- Dumping data for table `academic_term`
--

INSERT INTO `academic_term` (`term_id`, `term_name`, `school_year`, `start_date`, `end_date`) VALUES
(2, 'Fall', '2025', '2025-09-02', '2025-12-19'),
(3, 'Spring', '2026', '2026-01-06', '2026-04-17'),
(4, 'Summer', '2026', '2026-07-06', '2026-08-14');

-- --------------------------------------------------------

--
-- Table structure for table `course`
--

CREATE TABLE `course` (
  `course_id` int(11) NOT NULL,
  `course_name` varchar(150) NOT NULL,
  `subject_area` varchar(100) NOT NULL,
  `grade_level` varchar(10) NOT NULL,
  `course_description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course`
--

INSERT INTO `course` (`course_id`, `course_name`, `subject_area`, `grade_level`, `course_description`) VALUES
(102, 'Precalculus 11', 'Math', '11', 'Introduction to functions, trigonometry, and sequences'),
(103, 'Precalculus 12', 'Math', '12', 'Advanced functions, logarithms, and combinatorics'),
(104, 'Physics 11', 'Science', '11', 'Mechanics, waves, and basic electricity'),
(105, 'English 11', 'English', '11', 'Literary analysis, essay writing, and communication skills'),
(106, 'Chemistry 11', 'Science', '11', 'Atomic theory, chemical bonding, and stoichiometry'),
(109, 'Arts 11', 'Arts', '11', 'Arts and Crafts, Paint and Post!');

-- --------------------------------------------------------

--
-- Table structure for table `course_offering`
--

CREATE TABLE `course_offering` (
  `course_offering_id` int(11) NOT NULL,
  `section_name` varchar(50) NOT NULL,
  `course_id` int(11) NOT NULL,
  `term_id` int(11) NOT NULL,
  `time_slot_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_offering`
--

INSERT INTO `course_offering` (`course_offering_id`, `section_name`, `course_id`, `term_id`, `time_slot_id`, `faculty_id`) VALUES
(1, 'Section A', 102, 2, 1, 102),
(2, 'Section A', 103, 2, 2, 103),
(3, 'Section A', 104, 2, 3, 104),
(4, 'Section A', 105, 3, 4, 103);

-- --------------------------------------------------------

--
-- Table structure for table `enrollment`
--

CREATE TABLE `enrollment` (
  `enrollment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `course_offering_id` int(11) NOT NULL,
  `enrollment_date` date NOT NULL,
  `enrollment_status` enum('Enrolled','Dropped','Completed') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `enrollment`
--

INSERT INTO `enrollment` (`enrollment_id`, `student_id`, `course_offering_id`, `enrollment_date`, `enrollment_status`) VALUES
(1, 100000, 1, '2026-03-26', 'Enrolled'),
(2, 100000, 2, '2026-03-26', 'Enrolled'),
(3, 100001, 1, '2026-03-26', 'Enrolled'),
(5, 100002, 2, '2026-03-26', 'Enrolled'),
(17, 100001, 2, '2026-03-27', 'Enrolled'),
(21, 100001, 3, '2026-03-27', 'Enrolled'),
(22, 100001, 4, '2026-03-27', 'Enrolled');

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `faculty_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `position` varchar(100) NOT NULL,
  `supervisor_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`faculty_id`, `first_name`, `last_name`, `email`, `password_hash`, `phone_number`, `position`, `supervisor_id`) VALUES
(101, 'Michael', 'Thompson', 'm.thompson@school.com', '$2b$10$dhNzuPBJnEZKWs9PzdyX4OSNZznOJSklxgwDuGRmfhqCYTpyTquO2', '604-555-0201', 'Department Head', NULL),
(102, 'Sarah', 'Williams', 's.williams@school.com', '$2b$10$tLvYqbJ0VtXzpEcrH8Qi7uaJ8qgVq9JiIxSTSox/ElN2LC5crbdeK', '604-555-0202', 'Teacher', NULL),
(103, 'David', 'Lee', 'd.lee@school.com', '$2b$10$/jrbZw0CBMlyxuPFVl.Dt.TNZOMeO1ye92lKIaeY6dkt1ooi9hme.', '604-555-0203', 'Teacher', NULL),
(104, 'Jennifer', 'Garcia', 'j.garcia@school.com', '$2b$10$wBJLmaCYGFoqs9TBRtMET.cEGl/ZoYfWQQMiZZDfTYLrcSKfHj4w6', '604-555-0204', 'Teacher', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `prerequisite`
--

CREATE TABLE `prerequisite` (
  `course_id` int(11) NOT NULL,
  `prereq_course_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `prerequisite`
--

INSERT INTO `prerequisite` (`course_id`, `prereq_course_id`) VALUES
(103, 102);

-- --------------------------------------------------------

--
-- Table structure for table `schedule`
--

CREATE TABLE `schedule` (
  `time_slot_id` int(11) NOT NULL,
  `days_of_week` varchar(20) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL
) ;

--
-- Dumping data for table `schedule`
--

INSERT INTO `schedule` (`time_slot_id`, `days_of_week`, `start_time`, `end_time`) VALUES
(1, 'MWF', '08:30:00', '09:45:00'),
(2, 'MWF', '10:00:00', '11:15:00'),
(3, 'TTh', '08:30:00', '10:00:00'),
(4, 'TTh', '13:00:00', '14:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `StudentID` int(11) NOT NULL,
  `FirstName` varchar(50) NOT NULL,
  `LastName` varchar(50) NOT NULL,
  `PhoneNumber` varchar(20) DEFAULT NULL,
  `DateOfBirth` date NOT NULL,
  `Email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `GradeLevel` varchar(10) NOT NULL,
  `EnrolmentStatus` enum('Active','Inactive') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`StudentID`, `FirstName`, `LastName`, `PhoneNumber`, `DateOfBirth`, `Email`, `password_hash`, `GradeLevel`, `EnrolmentStatus`) VALUES
(1, 'Alice', 'Smith', '604-111-1111', '2002-04-12', 'alice@school.ca', '$2b$10$XiPcRdtqZXTVYg2cqrbC1erh9MIQcRxLQ2SR2YJapGOOK/8JcOFxq', '11', 'Active'),
(100000, 'Ellise', 'Bonghanoy', '604-555-1234', '2005-08-15', 'karlosbonghanoy@mail.com', '$2b$10$622yxMzLUEtNlhUN60PEFuP7A731V/NRapW99LaqGPagQ6PT5STjO', '11', 'Active'),
(100001, 'Karlos', 'Santos', '604-555-0101', '2008-08-15', 'karlos.santos@school.com', '$2b$10$wjETNcoXF0Fzkkss09Z9H.fNXgC3fOMRrO7sKzPGmcC1UOril0UOO', '11', 'Active'),
(100002, 'Emma', 'Chen', '604-555-0102', '2008-03-22', 'emma.chen@school.com', '$2b$10$47JU3wQGiemwQq8SCbEb2eY4is98ETQh3RQKO04sqiGILZ1DPF5iq', '11', 'Active'),
(100003, 'Liam', 'Rivera', '604-555-0103', '2009-11-05', 'liam.rivera@school.com', '$2b$10$KD.0rkpTlhms3abpsk12xeuJvoF9cMVf7iBAKEzbOSr36qDniEyYS', '10', 'Active'),
(100005, 'James', 'Park', '604-555-0105', '2007-01-30', 'james.park@school.com', '$2b$10$7mJ3DEcWHX0pBNZp5ekzje0DDPDkXfZWnGu0e1K.ffnZ6K5VGH55S', '12', 'Active'),
(100006, 'Karlos', 'Bonghanoy', '604-555-0101', '2008-08-15', 'karlos.bonghanoy@school.com', '$2b$10$MEX/yz4vj6VP31SumxxVpe0JmAq5AJkHY88TI9gNrVuYiuda1dq4u', '11', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `student_fulltime`
--

CREATE TABLE `student_fulltime` (
  `StudentID` int(11) NOT NULL,
  `ExtraCurricularActivities` varchar(255) DEFAULT NULL,
  `GuardianContactInfo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_fulltime`
--

INSERT INTO `student_fulltime` (`StudentID`, `ExtraCurricularActivities`, `GuardianContactInfo`) VALUES
(1, 'Basketball, Drama Club', 'Jane Smith, 604-999-8888'),
(100006, 'Basketball, Drama Club', 'Jane Santos, 604-555-9999');

-- --------------------------------------------------------

--
-- Table structure for table `student_parttime`
--

CREATE TABLE `student_parttime` (
  `StudentID` int(11) NOT NULL,
  `ReasonForPartTime` varchar(255) DEFAULT NULL,
  `HoursEnrolledPerWeek` decimal(4,1) DEFAULT NULL CHECK (`HoursEnrolledPerWeek` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supervises`
--

CREATE TABLE `supervises` (
  `supervisor_id` int(11) NOT NULL,
  `supervisee_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supervises`
--

INSERT INTO `supervises` (`supervisor_id`, `supervisee_id`) VALUES
(101, 102),
(101, 103);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_term`
--
ALTER TABLE `academic_term`
  ADD PRIMARY KEY (`term_id`);

--
-- Indexes for table `course`
--
ALTER TABLE `course`
  ADD PRIMARY KEY (`course_id`);

--
-- Indexes for table `course_offering`
--
ALTER TABLE `course_offering`
  ADD PRIMARY KEY (`course_offering_id`),
  ADD UNIQUE KEY `course_id` (`course_id`,`term_id`),
  ADD KEY `term_id` (`term_id`),
  ADD KEY `time_slot_id` (`time_slot_id`),
  ADD KEY `faculty_id` (`faculty_id`);

--
-- Indexes for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD PRIMARY KEY (`enrollment_id`),
  ADD UNIQUE KEY `student_id` (`student_id`,`course_offering_id`),
  ADD KEY `course_offering_id` (`course_offering_id`);

--
-- Indexes for table `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`faculty_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `supervisor_id` (`supervisor_id`);

--
-- Indexes for table `prerequisite`
--
ALTER TABLE `prerequisite`
  ADD PRIMARY KEY (`course_id`,`prereq_course_id`),
  ADD KEY `prereq_course_id` (`prereq_course_id`);

--
-- Indexes for table `schedule`
--
ALTER TABLE `schedule`
  ADD PRIMARY KEY (`time_slot_id`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`StudentID`),
  ADD UNIQUE KEY `uq_student_email` (`Email`);

--
-- Indexes for table `student_fulltime`
--
ALTER TABLE `student_fulltime`
  ADD PRIMARY KEY (`StudentID`);

--
-- Indexes for table `student_parttime`
--
ALTER TABLE `student_parttime`
  ADD PRIMARY KEY (`StudentID`);

--
-- Indexes for table `supervises`
--
ALTER TABLE `supervises`
  ADD PRIMARY KEY (`supervisor_id`,`supervisee_id`),
  ADD KEY `supervisee_id` (`supervisee_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academic_term`
--
ALTER TABLE `academic_term`
  MODIFY `term_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course`
--
ALTER TABLE `course`
  MODIFY `course_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;

--
-- AUTO_INCREMENT for table `course_offering`
--
ALTER TABLE `course_offering`
  MODIFY `course_offering_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `enrollment`
--
ALTER TABLE `enrollment`
  MODIFY `enrollment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `faculty`
--
ALTER TABLE `faculty`
  MODIFY `faculty_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=105;

--
-- AUTO_INCREMENT for table `schedule`
--
ALTER TABLE `schedule`
  MODIFY `time_slot_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student`
--
ALTER TABLE `student`
  MODIFY `StudentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100007;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `course_offering`
--
ALTER TABLE `course_offering`
  ADD CONSTRAINT `course_offering_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  ADD CONSTRAINT `course_offering_ibfk_2` FOREIGN KEY (`term_id`) REFERENCES `academic_term` (`term_id`),
  ADD CONSTRAINT `course_offering_ibfk_3` FOREIGN KEY (`time_slot_id`) REFERENCES `schedule` (`time_slot_id`),
  ADD CONSTRAINT `course_offering_ibfk_4` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`);

--
-- Constraints for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD CONSTRAINT `enrollment_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`StudentID`),
  ADD CONSTRAINT `enrollment_ibfk_2` FOREIGN KEY (`course_offering_id`) REFERENCES `course_offering` (`course_offering_id`);

--
-- Constraints for table `faculty`
--
ALTER TABLE `faculty`
  ADD CONSTRAINT `faculty_ibfk_1` FOREIGN KEY (`supervisor_id`) REFERENCES `faculty` (`faculty_id`);

--
-- Constraints for table `prerequisite`
--
ALTER TABLE `prerequisite`
  ADD CONSTRAINT `prerequisite_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  ADD CONSTRAINT `prerequisite_ibfk_2` FOREIGN KEY (`prereq_course_id`) REFERENCES `course` (`course_id`);

--
-- Constraints for table `student_fulltime`
--
ALTER TABLE `student_fulltime`
  ADD CONSTRAINT `student_fulltime_ibfk_1` FOREIGN KEY (`StudentID`) REFERENCES `student` (`StudentID`);

--
-- Constraints for table `student_parttime`
--
ALTER TABLE `student_parttime`
  ADD CONSTRAINT `student_parttime_ibfk_1` FOREIGN KEY (`StudentID`) REFERENCES `student` (`StudentID`);

--
-- Constraints for table `supervises`
--
ALTER TABLE `supervises`
  ADD CONSTRAINT `supervises_ibfk_1` FOREIGN KEY (`supervisor_id`) REFERENCES `faculty` (`faculty_id`),
  ADD CONSTRAINT `supervises_ibfk_2` FOREIGN KEY (`supervisee_id`) REFERENCES `faculty` (`faculty_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
