
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { auth, db } from "./firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"


const register = async (email, password, name, phone) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    try {
      const userDoc = doc(db, 'users', userCredential.user.uid)
      const docSnap = await getDoc(userDoc)
      const userData = {
        userName: name,
        userPhone: phone,
        userEmail: email,
        subscriptions: []
      }
      if (!docSnap.exists()) {
        await setDoc(userDoc, userData)
      }
    } catch (error) {
      throw error
    }
    return userCredential.user
  } catch (error) {
    //
    throw error
  }
}

const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error('Login failed:', error.code, error.message)
    throw error
  }
}

const logout = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    throw error
  }
}

export const authService = {
  register,
  login,
  logout,
}
