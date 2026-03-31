import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, UserSquare, BookOpen, ClipboardList, GraduationCap, UsersRound } from 'lucide-react';
import StatCard from '../components/DashboardComponents/StatCard.jsx';
import FunctionCard from '../components/DashboardComponents/FunctionCard.jsx';

function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, faculty: 0, courses: 0, enrollments: 0 });

  useEffect(() => {
    Promise.all([
      axios.get('/api/students'),
      axios.get('/api/faculty'),
      axios.get('/api/course'),
      axios.get('/api/enrollments')
    ])
      .then(([sRes, fRes, cRes, eRes]) => {
        setStats({
          students: sRes.data.length,
          faculty: fRes.data.length,
          courses: cRes.data.length,
          enrollments: eRes.data.filter(e => (e.EnrollmentStatus || e.enrollment_status) === 'Enrolled').length
        });
      })
      .catch(err => console.error('Dashboard fetch error:', err));
  }, []);

  const functionCards = [
    { label: 'Manage Students', description: 'Add, edit, or remove student records.', icon: Users, to: '/admin/students' },
    { label: 'Manage Faculty', description: 'Update faculty accounts and roles.', icon: UserSquare, to: '/admin/faculty' },
    { label: 'Manage Courses', description: 'Edit curriculum and subject areas.', icon: BookOpen, to: '/admin/courses' },
    { label: 'Course Offerings', description: 'Assign faculty and schedules.', icon: GraduationCap, to: '/admin/course-offerings' },
    { label: 'Enrolments', description: 'Manage student enrolments.', icon: ClipboardList, to: '/admin/enrollments' },
    { label: 'Supervision', description: 'Assign faculty supervisors.', icon: UsersRound, to: '/admin/supervises' }
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Dashboard Overview</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Welcome to the administration panel.</p>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <StatCard label="Total Students" value={stats.students} icon={Users} />
        <StatCard label="Total Faculty" value={stats.faculty} icon={UserSquare} />
        <StatCard label="Total Courses" value={stats.courses} icon={BookOpen} />
        <StatCard label="Active Enrolments" value={stats.enrollments} icon={ClipboardList} />
      </div>

      {/* Function Cards */}
      <h2 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Core Functions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        {functionCards.map(card => (
          <FunctionCard key={card.label} {...card}/>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
