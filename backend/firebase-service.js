const admin = require('firebase-admin')

let serviceAccount = require('./hoohack-c24ae-firebase-adminsdk-jrhu8-e81b4ca042.json')

const initializeFirebase = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
}

const addSubscription = async (email, subscription) => {
  const id = await admin.auth().getUserByEmail(email)
  const docRef = db.collection('users').doc(id)
  await docRef.set({ subscriptions: admin.firestore.FieldValue.arrayUnion(subscription) })
}

async function verifyEmailAndPassword (email, password) {
  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password)
    console.log("Authentication successful", userCredential.user)
  } catch (error) {
    console.error("Authentication failed", error)
  }
}

module.exports = {
  initializeFirebase,
  addSubscription,
  verifyEmailAndPassword
}