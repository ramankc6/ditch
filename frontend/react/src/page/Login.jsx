import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../service/authSerivce'
import '../css/login.scss'
import { UserContext } from '../context/userContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { setCurrentUser } = useContext(UserContext)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const user = await authService.login(email, password)
      console.log('User logged in:', user)
      setCurrentUser(user)
      navigate('/')
      // Redirect user or show success message
    } catch (error) {
      console.error('Login failed:', error.message)
      // Show error message to the user
    }
  }

  return (
    <div className="login-container">
      <div className="background"></div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  )
}

export default Login
