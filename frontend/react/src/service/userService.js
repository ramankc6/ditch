
import { db } from './firebase'
import { getDoc, updateDoc, arrayUnion, doc, setDoc, arrayRemove } from 'firebase/firestore'

export const getSubscriptions = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)
    if (!userDoc.exists()) {
      return []
    }
    return userDoc.data().subscriptions
  } catch (error) {
    throw error
  }
}

export const addSubscription = async (userId, subscription) => {
  try {
    const userDoc = doc(db, 'users', userId)
    const docSnap = await getDoc(userDoc)
    if (!docSnap.exists()) {
      await createUser(userId)
    }
    await updateDoc(userDoc, {
      subscriptions: arrayUnion(subscription)
    })
  } catch (error) {
    throw error
  }
}

export const createUser = async (userId) => {
  try {
    const userDoc = doc(db, 'users', userId)
    const userData = {
      subscriptions: []
    }
    await setDoc(userDoc, userData)
  } catch (error) {
    throw error
  }
}

export const removeSubscription = async (userId, subscription) => {
  try {
    const userDoc = doc(db, 'users', userId)
    await updateDoc(userDoc, {
      subscriptions: arrayRemove(subscription)
    })
  } catch (error) {
    throw error
  }
}
