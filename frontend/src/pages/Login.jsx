import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const inputStyle = {
  width: '100%', padding: '12px', borderRadius: '8px',
  border: '1px solid #d1d5db', marginTop: '0.5rem', marginBottom: '1rem',
  fontSize: '0.9rem', backgroundColor: '#fafafa'
};

function Login({ setUserRole, setUserInfo }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: 'm.thompson@school.com', password: 'MThompson43' }); // Pre-filled with SuperAdmin creds for easy testing
  // Student login for testing: {email: "karlos.santos@school.com", password:"KSantos11"}
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      // Save session to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUserRole(data.user.role);
      setUserInfo(data.user);

      // Redirect to the right dashboard
      if (data.user.role === 'Student') {
        navigate('/student/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError('Unable to connect to the server');
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        padding: '3rem',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '0.5rem', color: '#111827' }}>Student Information System</h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '0.9rem' }}>Sign in to continue</p>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px',
            borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <label style={{ fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required
            placeholder="Enter your email" style={inputStyle} />

          <label style={{ fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required
            placeholder="Enter your password" style={inputStyle} />

          <button type="submit" disabled={loading} style={{
            marginTop: '1rem', padding: '12px',
            backgroundColor: loading ? '#6b7280' : '#111827',
            color: 'white', border: 'none', borderRadius: '8px',
            fontSize: '1rem', fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
