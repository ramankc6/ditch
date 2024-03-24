import React, { useState } from 'react'
import { authService } from '../service/authSerivce'
import { Link } from 'react-router-dom'
import '../index.css'
import { StarCanvas } from '../component/canvas'


const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null); // For success or error
  const [messageType, setMessageType] = useState(null); // 'success' or 'error'


  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const user = await authService.register(email, password)
      console.log('User registered:', user)
      setMessage('Registration successful!');
      setMessageType('success');
    } catch (error) {
      console.error('Registration failed:', error.message)
      setMessage(error.message); // Set specific error message
      setMessageType('error');
    }
  }

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center">
      <StarCanvas />
      <img src="../../ditch.png" alt="logo" className="w-40 h-40 rounded-2xl mb-5"/>
      <div className="bg-white p-8 rounded-lg shadow-md w-96"> {/* Card container */}
        <h2 className="text-2xl text-secondary font-bold mb-4">Register</h2>

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
          {message && (
          <div className={`mt-4 p-2 rounded-md ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
          )}

          <button type="submit" className="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md w-full">
            Register
          </button>

          <p className="text-center mt-4 text-secondary">
            Have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;