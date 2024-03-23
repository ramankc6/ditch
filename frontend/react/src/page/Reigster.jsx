import React, { useState } from 'react'
import { authService } from '../service/authSerivce'
import { Link } from 'react-router-dom'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const user = await authService.register(email, password)
      console.log('User registered:', user)
    } catch (error) {
      console.error('Registration failed:', error.message)
    }
  }

  return (
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
      <button type="submit">Register</button>

      <p>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  )
}

export default Register
