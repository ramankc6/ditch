const admin = require('firebase-admin')
// const firebase = require("firebase/app")

let serviceAccount = require('./hoohack-c24ae-firebase-adminsdk-jrhu8-e81b4ca042.json')

const initializeFirebase = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
  console.log("Firebase initialized")
}

const addSubscription = async (email, subscription) => {
  const db = admin.firestore()
  const userRecord = await admin.auth().getUserByEmail(email)
  const userId = userRecord.uid
  const docRef = db.collection('users').doc(userId)
  console.log("Adding subscription", subscription)
  await docRef.set({ subscriptions: admin.firestore.FieldValue.arrayUnion(subscription) })
}

const addTOS = async (email, TOS) => {
  const id = await admin.auth().getUserByEmail(email)
  const docRef = db.collection('users').doc(id)
  await docRef.set({ TOS: admin.firestore.FieldValue.arrayUnion(TOS) })
}

async function verifyEmailAndPassword (email, password) {
  // try {
  //   const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password)
  //   console.log("Authentication successful", userCredential.user)
  //   return userCredential
  // } catch (error) {
  //   console.error("Authentication failed", error)
  // }
}

module.exports = {
  initializeFirebase,
  addSubscription,
  verifyEmailAndPassword
}