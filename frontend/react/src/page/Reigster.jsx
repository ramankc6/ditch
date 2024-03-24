import React, { useState } from 'react'
import { authService } from '../service/authSerivce'
import { Link } from 'react-router-dom'
import '../index.css'

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
    <div className="min-h-screen w-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96"> {/* Card container */}
        <h2 className="text-2xl font-bold mb-4">Register</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4"> 
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full text-[#e8e5dc] border border-gray-300 rounded-md px-3 py-2 focus:outline-blue-500"
            />
          </div>

          <div className="mb-4">          
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full text-[#e8e5dc] border border-gray-300 rounded-md px-3 py-2 focus:outline-blue-500" 
            />
          </div>

          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md w-full">
            Register
          </button>

          <p className="text-center mt-4">
            Have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;