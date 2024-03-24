const express = require('express')
const ExpressWs = require('express-ws')
const { Pool } = require('pg')
const cors = require('cors')
const app = express()
ExpressWs(app)
const { exec } = require('child_process')
const twilio = require('twilio')
require('dotenv').config()
const { StreamService } = require('./stream-service')
const { TranscriptionService } = require('./transcription-service')
const { TextToSpeechService } = require('./tts-service')
const { GptService } = require('./gpt-service')
const https = require('https')
const fs = require('fs')
const { Deepgram } = require('@deepgram/sdk')
const textToSpeech = require('@google-cloud/text-to-speech')

const port = process.env.PORT

app.use(cors())
app.use(express.json())

const OpenAIApi = require('openai')
const { verifyEmailAndPassword, initializeFirebase, addSubscription } = require('./firebase-service')
const openai = new OpenAIApi.OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

initializeFirebase()

app.post('/api/validate', async (req, res) => {
  console.log("validate called")
  res.status(200).send('OK')
  // const { email, password } = req.body
  // const userCredential = await verifyEmailAndPassword(email, password)
  // if (userCredential) {
  //   res.json({ success: true, user: userCredential.user })
  // }
}
)

const summarizeTOS = async (tos) => {
  const messages = [{ role: "system", content: "You are CancelGPT. CancelGPT is designed to analyze Terms of Service (TOS) documents for companies and provide concise summaries of the terms related to cancellation. It extracts all details pertinent to cancellation, such as conditions, deadlines, fees, and procedures, presenting them in a summary that optimizes for minimal token usage. This approach ensures the essential information is conveyed efficiently, ready for further processing by other GPT instances. CancelGPT prioritizes clarity and precision, focusing solely on cancellation terms without including unnecessary details. It will ask for clarifications only when the provided TOS lacks clear cancellation terms or when essential details are ambiguous, ensuring the summaries are both compact and comprehensive. The tone is straightforward and factual, aimed at distilling relevant information without embellishment. Word it in a way that the summary can be read before contacting customer service to cancel their subscription." }, { role: "user", content: tos }]
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages
    })
    const aiResponse = response.choices[0].message.content
    return aiResponse
  } catch (error) {
    console.error('Failed to send message', error)
    res.status(500).send('Server error')
  }
}

app.post('/api/getTOS', async (req, res) => {
  console.log(req.body)
  const { userEmail, url, companyName, phoneNumber, monthlyPayment } = req.body
  const subscription = { url, companyName, phoneNumber, monthlyPayment }
  console.log(subscription)
  exec('python3 fetch_tos.py ' + url, async (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return res.status(500).send('Server error')
    }
    // If not an error, proceed to process stdout
    try {
      const sum = await summarizeTOS(stdout)
      subscription.comment = sum
      // Handle addSubscription properly
      await addSubscription(userEmail, subscription).catch(e => {
        console.error(`Error adding subscription: ${e}`)
        // Respond with an error message or handle accordingly
        // Not sending a response here since you might want to handle it differently
      })
      res.json(sum) // Respond with the summary if everything is successful
    } catch (e) {
      console.error(`Error summarizing terms of service: ${e}`)
      res.status(500).send('Server error')
    }
  })
})

app.get('/api/summurizeTOS', async (req, res) => {
  const { tos } = req.body
  const messages = [{ role: "system", content: "You are CancelGPT. CancelGPT is designed to analyze Terms of Service (TOS) documents for companies and provide concise summaries of the terms related to cancellation. It extracts all details pertinent to cancellation, such as conditions, deadlines, fees, and procedures, presenting them in a summary that optimizes for minimal token usage. This approach ensures the essential information is conveyed efficiently, ready for further processing by other GPT instances. CancelGPT prioritizes clarity and precision, focusing solely on cancellation terms without including unnecessary details. It will ask for clarifications only when the provided TOS lacks clear cancellation terms or when essential details are ambiguous, ensuring the summaries are both compact and comprehensive. The tone is straightforward and factual, aimed at distilling relevant information without embellishment. Word it in a way that the summary can be read before contacting customer service to cancel their subscription." }, { role: "user", content: tos }]
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages
    })
    const aiResponse = response.choices[0].message.content
    console.log(aiResponse)

    res.json(aiResponse)
  } catch (error) {
    console.error('Failed to send message', error)
    res.status(500).send('Server error')
  }
})

app.post('/handle-call', (req, res) => {
  res.status(200)
  res.type('text/xml')
  res.end(`
    <Response>
      <Connect>
        <Stream url="${process.env.SERVER}/connection" />
      </Connect>
    </Response>
    `)
})

const privateKey = fs.readFileSync('private.key', 'utf8')

const certificate = fs.readFileSync('certificate.crt', 'utf8')

const caBundle = fs.readFileSync('ca_bundle.crt', 'utf8')

const credentials = { key: privateKey, cert: certificate, ca: caBundle }
const server = https.createServer(credentials, app)

server.listen(port, console.log(`Server started on port ${port}`))