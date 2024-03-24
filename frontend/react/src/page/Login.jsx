import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../service/authSerivce'
import '../css/login.scss' // Ensure this SCSS file is equipped to handle the new styles
import { UserContext } from '../context/userContext'
import RobotCanvas from '../component/canvas/robot'
import logo from '../assets/Ditch.png'
import '../index.css'
import { StarCanvas } from '../component/canvas'

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
    } catch (error) {
      console.error('Login failed:', error.message)
    }
  }

  return (
    <section className="relative w-screen h-screen mx-auto flex flex-col items-center z-2">
      <StarCanvas className="absolute top-0 left-0 w-full h-full z-[-1]" />

      <div className={`mx-auto flex items-start gap-2`}>
        <div className="flex justify-center items-center flex-col">
          <div className="flex justify-center items-center flex-row gap-4 w-screen">
            <img src={logo} alt="logo" className="w-24 h-24 rounded-2xl" />
            <h1
              className={`text-center text-accent text-[80px] font-black mr-14`}>
              Ditch
            </h1>
          </div>
          <p className="flex justify-center items-center text-center mt-0 text-white text-[28px] mx-5 fade-in-text">
            AI-Powered Subscription Cancellation Service
          </p>
        </div>
      </div>
      <div className="w-full h-[700px] flex flex-row items-center justify-center">
        <div className="w-2/5 h-[700px] mr-50">
          <RobotCanvas />
        </div>
        <div style={{ width: '10%' }}></div>
        <div
          className="w-2/5 h-3/5 mb-20 rounded-2xl flex flex-col items-center justify-center shadow-lg text-white"
          style={{
            backgroundColor: 'rgba(252, 183, 17, 0.8)', // #FCB711 with 50% opacity
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          }}>
          <h2 className="text-xl font-bold mb-4">Login</h2>{' '}
          {/* Removed text-gray-800 to apply text-white */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block">
                Username:
              </label>
              <input
                type="text"
                id="username"
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-black"
                name="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block">
                Password:
              </label>
              <input
                type="password"
                id="password"
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-black"
              />
            </div>
            <div className="flex items-center justify-between w-full">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-800 font-bold py-2 px-4 rounded">
                Login
              </button>
              <Link
                to="/register"
                className="underline hover:text-blue-800 font-bold py-2 px-4">
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Login
