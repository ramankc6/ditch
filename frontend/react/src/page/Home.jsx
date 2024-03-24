import React, { useContext, useEffect } from 'react'
import { UserContext } from '../context/userContext'
import { useNavigate } from 'react-router-dom'
import '../index.css'
import SubscriptionTable from '../component/SubscriptionTable'

const Home = () => {
  const { currentUser } = useContext(UserContext)
  const navigate = useNavigate()
  useEffect(() => {
    // Redirect if currentUser is null or undefined
    if (!currentUser) {
      navigate('/login')
    }
  }, [currentUser, navigate]) // Add dependencies here

  if (!currentUser) {
    return null
  }

  return <SubscriptionTable />
}

export default Home
