import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserSquare, BookOpen, Calendar, Clock, GraduationCap, ClipboardList, Link as LinkIcon, UsersRound, User } from 'lucide-react';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/profile', label: 'My Profile', icon: User },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/faculty', label: 'Faculty', icon: UserSquare },
  { to: '/admin/courses', label: 'Courses', icon: BookOpen },
  { to: '/admin/academic-terms', label: 'Academic Terms', icon: Calendar },
  { to: '/admin/schedules', label: 'Time Slots', icon: Clock },
  { to: '/admin/course-offerings', label: 'Course Offerings', icon: GraduationCap },
  { to: '/admin/enrollments', label: 'Enrolments', icon: ClipboardList },
  { to: '/admin/prerequisites', label: 'Prerequisites', icon: LinkIcon },
  { to: '/admin/supervises', label: 'Supervision', icon: UsersRound },
];

const studentLinks = [
  { to: '/student/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { to: '/student/profile', label: 'My Profile', icon: User },
  { to: '/student/courses', label: 'Browse Courses', icon: BookOpen },
  { to: '/student/schedule', label: 'My Schedule', icon: Calendar },
];

const Sidebar = ({ userRole }) => {
  const isAdmin = userRole === 'Admin' || userRole === 'SuperAdmin';
  const isStudent = userRole === 'Student' || userRole === 'SuperAdmin';

  // SuperAdmin sees both admin + student links
  let links = [];
  if (isAdmin) links = [...links, ...adminLinks];
  if (userRole === 'SuperAdmin') {
    links.push({ divider: true, label: 'Student View' });
    links = [...links, ...studentLinks];
  }
  if (userRole === 'Student') links = studentLinks;

  return (
    <aside style={{
      width: '240px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    }}>
      {/* App title */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>
          SIS {userRole === 'SuperAdmin' ? 'Super Admin' : userRole}
        </h2>
      </div>

      {/* Navigation links */}
      <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
        {links.map((link, idx) => (
          link.divider ? (
            <div key={idx} style={{
              padding: '0.5rem 1.5rem', marginTop: '0.5rem',
              fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              borderTop: '1px solid #e5e7eb', paddingTop: '1rem'
            }}>
              {link.label}
            </div>
          ) : (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.5rem',
              textDecoration: 'none',
              color: isActive ? '#111827' : '#6b7280',
              backgroundColor: isActive ? '#f3f4f6' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              borderRight: isActive ? '3px solid #111827' : '3px solid transparent',
              fontSize: '0.9rem'
            })}
          >
            <link.icon size={18} />
            {link.label}
          </NavLink>
          )
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
