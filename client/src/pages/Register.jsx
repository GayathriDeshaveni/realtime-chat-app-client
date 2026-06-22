import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password)
      return setError('All fields are required')
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('username', res.data.username)
      navigate('/rooms')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>💬 ChatApp</h1>
        <p style={styles.subtitle}>Create your account</p>

        {error && <p style={styles.error}>{error}</p>}

        <input
          style={styles.input}
          type="text"
          name="username"
          placeholder="Username..."
          value={form.username}
          onChange={handleChange}
        />
        <input
          style={styles.input}
          type="email"
          name="email"
          placeholder="Email..."
          value={form.email}
          onChange={handleChange}
        />
        <input
          style={styles.input}
          type="password"
          name="password"
          placeholder="Password..."
          value={form.password}
          onChange={handleChange}
          onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
        />

        <button style={styles.button} onClick={handleRegister}>
          Create Account →
        </button>

        <p style={styles.link}>
          Already have an account?{' '}
          <Link to="/login" style={styles.anchor}>Login</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0f',
  },
  card: {
    background: '#13131a',
    border: '1px solid #2a2a3d',
    borderRadius: '16px',
    padding: '48px',
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    color: '#888',
    textAlign: 'center',
    fontSize: '14px',
  },
  error: {
    color: '#f87171',
    fontSize: '13px',
    textAlign: 'center',
    background: '#2a1a1a',
    padding: '10px',
    borderRadius: '8px',
  },
  input: {
    background: '#1e1e2e',
    border: '1px solid #2a2a3d',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    background: '#7c3aed',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  link: {
    color: '#888',
    fontSize: '13px',
    textAlign: 'center',
  },
  anchor: {
    color: '#7c3aed',
    textDecoration: 'none',
    fontWeight: '600',
  },
}

export default Register