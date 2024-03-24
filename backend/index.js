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
  const { email, password } = req.body
  const userCredential = await verifyEmailAndPassword(email, password)
  if (userCredential) {
    res.json({ success: true, user: userCredential.user })
  }
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
    console.log(aiResponse)
    return aiResponse
  } catch (error) {
    console.error('Failed to send message', error)
    res.status(500).send('Server error')
  }
}

app.post('/api/getTOS', async (req, res) => {
  console.log("getTOS called")
  const { userEmail, url, compName, compPhone, userPay } = req.body
  const subscription = { url, compName, compPhone, userPay }
  console.log("subscription", subscription)

  exec('python3 fetch_tos.py ' + url, async (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return res.status(500).send('Server error')
    }
    console.log(stdout)
    const sum = await summarizeTOS(stdout)
    subscription.summary = sum
    addSubscription(email, subscription)
    res.json(sum)
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

app.ws('/connection', (ws) => {
  console.log("made it to connection")
  ws.on('error', console.error)
  // Filled in from start message
  let streamSid
  let callSid

  const gptService = new GptService()
  const streamService = new StreamService(ws)
  const transcriptionService = new TranscriptionService()
  const ttsService = new TextToSpeechService({})

  let marks = []
  let interactionCount = 0

  // Incoming from MediaStream
  ws.on('message', function message (data) {
    const msg = JSON.parse(data)
    if (msg.event === 'start') {
      streamSid = msg.start.streamSid
      callSid = msg.start.callSid
      streamService.setStreamSid(streamSid)
      gptService.setCallSid(callSid)
      console.log(`Twilio -> Starting Media Stream for ${streamSid}`.underline.red)
      ttsService.generate({ partialResponseIndex: null, partialResponse: 'Hello! I understand you\'re looking for a pair of AirPods, is that correct?' }, 1)
    } else if (msg.event === 'media') {
      transcriptionService.send(msg.media.payload)
    } else if (msg.event === 'mark') {
      const label = msg.mark.name
      console.log(`Twilio -> Audio completed mark (${msg.sequenceNumber}): ${label}`.red)
      marks = marks.filter(m => m !== msg.mark.name)
    } else if (msg.event === 'stop') {
      console.log(`Twilio -> Media stream ${streamSid} ended.`.underline.red)
    }
  })

  transcriptionService.on('utterance', async (text) => {
    if (marks.length > 0 && text?.length > 5) {
      console.log('Twilio -> Interruption, Clearing stream'.red)
      ws.send(
        JSON.stringify({
          streamSid,
          event: 'clear',
        })
      )
    }
  })

  transcriptionService.on('transcription', async (text) => {
    if (!text) { return }
    console.log(`Interaction ${interactionCount} – STT -> GPT: ${text}`.yellow)
    gptService.completion(text, interactionCount)
    interactionCount += 1
  })

  gptService.on('gptreply', async (gptReply, icount) => {
    console.log(`Interaction ${icount}: GPT -> TTS: ${gptReply.partialResponse}`.green)
    ttsService.generate(gptReply, icount)
  })

  ttsService.on('speech', (responseIndex, audio, label, icount) => {
    console.log(`Interaction ${icount}: TTS -> TWILIO: ${label}`.blue)

    streamService.buffer(responseIndex, audio)
  })

  streamService.on('audiosent', (markLabel) => {
    marks.push(markLabel)
  })
})

const privateKey = fs.readFileSync('private.key', 'utf8')

const certificate = fs.readFileSync('certificate.crt', 'utf8')

const caBundle = fs.readFileSync('ca_bundle.crt', 'utf8')

const credentials = { key: privateKey, cert: certificate, ca: caBundle }
const server = https.createServer(credentials, app)

server.listen(port, console.log(`Server started on port ${port}`))