
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { auth } from "./firebase"

const register = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    throw error
  }
}

const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error('Login failed:', error.code, error.message);
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
