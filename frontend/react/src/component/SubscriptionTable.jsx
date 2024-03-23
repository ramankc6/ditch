import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../context/userContext'
import {
  addSubscription,
  getSubscriptions,
  removeSubscription,
} from '../service/userService'

const SubscriptionTable = () => {
  const [subscriptions, setSubscriptions] = useState([])
  const { currentUser } = useContext(UserContext)

  const [companyName, setCompanyName] = useState('')
  const [monthlyPayment, setMonthlyPayment] = useState('')
  const [comment, setComment] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  useEffect(() => {
    console.log(currentUser.uid)
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
    e.preventDefault() // Prevent the form from causing a page reload

    // Create a new subscription object
    const newSubscription = {
      companyName,
      monthlyPayment,
      comment,
      phoneNumber,
    }

    // Update the subscriptions state
    setSubscriptions([...subscriptions, newSubscription])
    try {
      addSubscription(currentUser.uid, newSubscription)
    } catch (error) {
      console.error('Failed to add subscription:', error.message)
    }

    // Clear the form inputs after adding
    setCompanyName('')
    setMonthlyPayment('')
    setComment('')
    setPhoneNumber('')
  }

  const handleRemoveSubscription = (subscription) => {
    const updatedSubscriptions = subscriptions.filter((s) => s != subscription)
    removeSubscription(currentUser.uid, subscription)
    setSubscriptions(updatedSubscriptions)
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Monthly Payment</th>
            <th>Comment</th>
            <th>Phone Number</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((subscription) => (
            <tr key={subscription.id}>
              <td>{subscription.companyName}</td>
              <td>{subscription.monthlyPayment}</td>
              <td>{subscription.comment}</td>
              <td>{subscription.phoneNumber}</td>
              <td>
                <button
                  onClick={() =>
                    window.open(`tel:${subscription.phoneNumber}`)
                  }>
                  Call
                </button>
                <button onClick={() => handleRemoveSubscription(subscription)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Inside your component return statement, after the table */}
      <form onSubmit={handleAddSubscription}>
        <input
          type="text"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Monthly Payment"
          value={monthlyPayment}
          onChange={(e) => setMonthlyPayment(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        <button type="submit">Add Subscription</button>
      </form>
    </div>
  )
}

export default SubscriptionTable
