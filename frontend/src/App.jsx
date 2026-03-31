import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/LayoutComponents/Sidebar.jsx';
import Topbar from './components/LayoutComponents/Topbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminProfile from './pages/AdminProfile.jsx';
import ManageStudents from './pages/ManageStudents.jsx';
import ManageFaculty from './pages/ManageFaculty.jsx';
import ManageCourses from './pages/ManageCourses.jsx';
import ManageAcademicTerms from './pages/ManageAcademicTerms.jsx';
import ManageSchedules from './pages/ManageSchedules.jsx';
import ManageCourseOfferings from './pages/ManageCourseOfferings.jsx';
import ManageEnrollments from './pages/ManageEnrollments.jsx';
import ManagePrerequisites from './pages/ManagePrerequisites.jsx';
import ManageSupervises from './pages/ManageSupervises.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import StudentCourses from './pages/StudentCourses.jsx';
import StudentSchedule from './pages/StudentSchedule.jsx';
import StudentProfile from './pages/StudentProfile.jsx';

function App() {

  // Pull saved login state from localStorage so refreshing doesn't log you out
  const [userRole, setUserRole] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved).role : null;
  });

  const [userInfo, setUserInfo] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function refresh() {
    setRefreshTrigger(prev => prev + 1);
  }

  function handleLogout() {
    setUserRole(null);
    setUserInfo(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Not logged in? Only show the login page
  if (!userRole) {
    return (
      <Routes>
        <Route path="*" element={<Login setUserRole={setUserRole} setUserInfo={setUserInfo} />} />
      </Routes>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar userRole={userRole} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar userRole={userRole} userInfo={userInfo} onLogout={handleLogout} />
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Routes>
            {/* Admin pages — Admin and SuperAdmin only */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']} userRole={userRole}>
                <AdminDashboard refresh={refresh} refreshTrigger={refreshTrigger} />
              </ProtectedRoute>
            } />
            <Route path="/admin/profile" element={
              <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']} userRole={userRole}>
                <AdminProfile userInfo={userInfo} />
              </ProtectedRoute>
            } />
            <Route path="/admin/students" element={
              <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']} userRole={userRole}>
                <ManageStudents refresh={refresh} refreshTrigger={refreshTrigger} />
              </ProtectedRoute>
            } />
            <Route path="/admin/faculty" element={
              <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']} userRole={userRole}>
                <ManageFaculty refresh={refresh} refreshTrigger={refreshTrigger} />
              </ProtectedRoute>
            } />
            <Route path="/admin/courses" element={
              <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']} userRole={userRole}>
                <ManageCourses refresh={refresh} refreshTrigger={refreshTrigger} />
              </ProtectedRoute>
            } />
            <Route path="/admin/academic-terms" element={
              <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']} userRole={userRole}>
                <ManageAcademicTerms refresh={refresh} refreshTrigger={refreshTrigger} />
              </ProtectedRoute>
            } />
            <Route path="/admin/schedules" element={
              <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']} userRole={userRole}>
                <ManageSchedules refresh={refresh} refreshTrigger={refreshTrigger} />
              </ProtectedRoute>
            } />
            <Route path="/admin/course-offerings" element={
              <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']} userRole={userRole}>
                <ManageCourseOfferings refresh={refresh} refreshTrigger={refreshTrigger} />
              </ProtectedRoute>
            } />
            <Route path="/admin/enrollments" element={
              <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']} userRole={userRole}>
                <ManageEnrollments refresh={refresh} refreshTrigger={refreshTrigger} />
              </ProtectedRoute>
            } />
            <Route path="/admin/prerequisites" element={
              <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']} userRole={userRole}>
                <ManagePrerequisites refresh={refresh} refreshTrigger={refreshTrigger} />
              </ProtectedRoute>
            } />
            <Route path="/admin/supervises" element={
              <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']} userRole={userRole}>
                <ManageSupervises refresh={refresh} refreshTrigger={refreshTrigger} />
              </ProtectedRoute>
            } />

            {/* Student pages — Student and SuperAdmin only */}
            <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/student/dashboard" element={
              <ProtectedRoute allowedRoles={['Student', 'SuperAdmin']} userRole={userRole}>
                <StudentDashboard refreshTrigger={refreshTrigger} userInfo={userInfo} />
              </ProtectedRoute>
            } />
            <Route path="/student/profile" element={
              <ProtectedRoute allowedRoles={['Student', 'SuperAdmin']} userRole={userRole}>
                <StudentProfile userInfo={userInfo} />
              </ProtectedRoute>
            } />
            <Route path="/student/courses" element={
              <ProtectedRoute allowedRoles={['Student', 'SuperAdmin']} userRole={userRole}>
                <StudentCourses refresh={refresh} refreshTrigger={refreshTrigger} userInfo={userInfo} />
              </ProtectedRoute>
            } />
            <Route path="/student/schedule" element={
              <ProtectedRoute allowedRoles={['Student', 'SuperAdmin']} userRole={userRole}>
                <StudentSchedule refreshTrigger={refreshTrigger} userInfo={userInfo} />
              </ProtectedRoute>
            } />

            {/* Default redirect based on role */}
            <Route path="*" element={
              <Navigate to={
                userRole === 'Student' ? '/student/dashboard' : '/admin/dashboard'
              } replace />
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
