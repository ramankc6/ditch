import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../context/userContext'
import '../index.css' // Assuming Tailwind is configured here
import { StarCanvas } from './canvas'
import {
  addSubscription,
  getSubscriptions,
  removeSubscription,
} from '../service/userService' // Make sure this points to your userService file

const SubscriptionCard = ({ subscription, handleRemoveSubscription }) => {
  const { currentUser } = useContext(UserContext)
  const cancelSubscription = async (subscription) => {
    console.log('Cancelling subscription:', subscription)
    try {
      // Call API to cancel the subscription
      const data = {
        subscription,
        userName: currentUser.userName,
        userPhone: currentUser.userPhone,
        userEmail: currentUser.userEmail,
      }
      fetch(process.env.REACT_APP_SERVER + '/api/cancelSubscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      console.log('Cancelling subscription:', subscription)
    } catch (error) {
      console.error('Failed to cancel subscription:', error.message)
    }
  }

  return (
    <div className="w-[80%] max-w-sm flex justify-center mt-4">
      <div className="w-full bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <div className="flex flex-col items-start gap-3">
          {/* Company Name */}
          <div className="flex items-center gap-2">
            <h3 className="text-[24px] font-bold text-blue-700">Company: </h3>
            <p className="text-[24px] font-semibold text-accent">
              {subscription.companyName}
            </p>
          </div>

          {/* Payment  */}
          <div>
            <h4 className="font-medium text-gray-700">Monthly Payment:</h4>
            <p className="text-xl font-bold text-gray-900">
              ${subscription.monthlyPayment}
            </p>
          </div>

          {/* Comment */}
          <div>
            <h4 className="font-medium text-gray-700">Comment:</h4>
            <p className="text-gray-600">{subscription.comment}</p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 mt-1 flex-row">
            <div className="flex items-center gap-3 mt-1 justify-left">
              <button
                onClick={() => cancelSubscription(subscription)}
                className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
                Cancel with AI
              </button>
            </div>
            <div className="flex items-center gap-3 mt-1 justify-right">
              <button
                onClick={() => handleRemoveSubscription(subscription)}
                className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded-lg">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const SubscriptionTable = () => {
  const [subscriptions, setSubscriptions] = useState([])
  const { currentUser } = useContext(UserContext)

  const [companyName, setCompanyName] = useState('')
  const [monthlyPayment, setMonthlyPayment] = useState('')
  const [comment, setComment] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const userSubscriptions = await getSubscriptions(currentUser.uid)
        setSubscriptions(userSubscriptions)
      } catch (error) {
        console.error('Failed to fetch subscriptions:', error.message)
      }
    }
    fetchSubscriptions()
  }, [])

  const handleAddSubscription = (e) => {
    e.preventDefault()

    const newSubscription = {
      companyName,
      monthlyPayment,
      comment,
      phoneNumber,
    }

    setSubscriptions([...subscriptions, newSubscription])
    try {
      addSubscription(currentUser.uid, newSubscription)
    } catch (error) {
      console.error('Failed to add subscription:', error.message)
    }

    setCompanyName('')
    setMonthlyPayment('')
    setComment('')
    setPhoneNumber('')
  }

  const handleRemoveSubscription = (subscription) => {
    const updatedSubscriptions = subscriptions.filter((s) => s !== subscription) // Note the minor change here to fix object comparison
    removeSubscription(currentUser.uid, subscription)
    setSubscriptions(updatedSubscriptions)
  }

  return (
    <div className="w-screen h-screen mx-auto p-6">
      <StarCanvas />
      <div className="flex  items-center flex-row w-screen">
        <div className="flex justify-start items-center flex-col">
          <h1 className="text-2xl text-[40px] text-accent font-black mb-4 mx-3 mt-2">
            Subscriptions
          </h1>

          <h2 className="text-xl text-[30px] text-accent font-black mb-4 mx-3">
            Welcome, {currentUser.email}
          </h2>
        </div>
        <div className="flex justify-end">
          <img
            src="../../ditch.png"
            alt="logo"
            className="w-28 h-28 rounded-2xl"
          />
        </div>
      </div>

      <div className="mt-7 w-full bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-blue-700 text-[30px] font-bold">
          Add New Subscription:
        </h2>
        <form onSubmit={handleAddSubscription} className="mt-2">
          <div className="flex flex-row justify-left gap-5 items-center">
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="px-4 py-2 border rounded-md text-white"
            />
            <input
              type="text"
              placeholder="Monthly Payment"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(e.target.value)}
              required
              className="px-4 py-2 border rounded-md text-white"
            />
            <input
              type="text"
              placeholder="Comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="px-4 py-2 border rounded-md text-white"
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="px-4 py-2 border rounded-md text-white"
            />

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
              Add Subscription
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-wrap gap-4 mt-2 overflow-y-auto max-h-[500px]">
        {subscriptions.map((subscription) => (
          <SubscriptionCard
            key={subscription.id} // Assume you have an ID
            subscription={subscription}
            handleRemoveSubscription={handleRemoveSubscription}
          />
        ))}
      </div>
    </div>
  )
}

export default SubscriptionTable
