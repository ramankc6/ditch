import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../service/authSerivce'
import '../css/login.scss'
import { UserContext } from '../context/userContext'
import RobotCanvas from '../component/canvas/robot'
import logo from '../assets/Ditch.png'
import '../index.css'

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
    <section className="relative w-screen h-screen mx-auto flex flex-col items-center justify-top bg-background">
      
      <div className={`mx-auto flex items-start gap-5`}>
        
        <div className='flex justify-center items-center flex-col'>
          <div className = 'flex justify-center items-center flex-row gap-2'> 
            <img src={logo} alt="logo" className="w-24 h-24"/>
            <h1 className={`text-center text-primary text-[80px] font-black`}>Ditch</h1>
          </div>
            <p className = 'flex justify-center items-center text-center mt-0 text-primary text-[24px]'>
            We use advanced AI to call and cancel your subscriptions for you. Tired of waiting on hold and talking to customer service? We got you.
            </p>

            
        </div>
        
      </div>
      <div className="w-full h-[600px] flex flex-row items-center justify-center">

        <div className="w-full h-[600px]">
          <RobotCanvas />
          
        </div>
      
        <div className="w-1/2 bg-white p-10 rounded-2xl flex flex-col items-center justify-center mr-20">  
          <h2 className="text-2xl font-bold mb-4">Login</h2>
          <form
            onSubmit={handleSubmit}
          >
            <div className="mb-4">
              <label for="username" class="block text-gray-700">Username:</label>
              <input type="text" id="username" name="username" onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div className="mb-4">
              <label for="password" class="block text-gray-700">Password:</label>
              <input type="password" id="password" name="password" onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div className="flex items-center justify-between w-full">  
              <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Login</button>

              <Link to="/register" className="underline text-blue-500 hover:text-blue-700 font-bold py-2 px-4">Register</Link> 
            </div>
          </form>
        </div>   
      </div>

    
    </section>
  )
}

export default Login
