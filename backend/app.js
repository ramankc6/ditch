require('dotenv').config()
require('colors')
const url = require('url')
const express = require('express')
const ExpressWs = require('express-ws')
const { exec } = require('child_process')
const { GptService } = require('./gpt')
const { StreamService } = require('./web-socket')
const { TranscriptionService } = require('./transcription')
const { TextToSpeechService } = require('./tts')

const app = express()
ExpressWs(app)

app.use(express.json())

const PORT = process.env.PORT || 3000

const OpenAIApi = require('openai')
const { verifyEmailAndPassword, initializeFirebase, addSubscription } = require('./firebase-service')
const { makeOutBoundCall } = require('./outbound_call')
const openai = new OpenAIApi.OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})
initializeFirebase()
app.post('/incoming', (req, res) => {
  console.log("inc running")
  res.status(200)
  res.type('text/xml')
  res.end(`
  <Response>
    <Connect>
      <Stream url="wss://${process.env.SERVER}/connection" />
    </Connect>
  </Response>
  `)
})

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

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.post('/api/cancelSubscription', async (req, res) => {
  console.log(req.body)
  var { userName, userPhone, userEmail, subscription } = req.body
  var { comment, companyName, phoneNumber, monthlyPayment } = subscription

  // res.status(200).send('OK')
  // exec('node outbound_call.js', async (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`exec error: ${error}`)
  //     return res.status(500).send('Server error')
  //   }
  // })
  try {
    makeOutBoundCall(userName, userPhone, userEmail, subscription)
    res.status(200).send('OK')
  }
  catch (e) {
    console.log(e)
    res.status(500).send('Server error')
  }
}
)


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


app.ws('/connection', (ws, req) => {
  console.log("hey")
  const query = url.parse(req.url, true).query

  ws.on('error', console.error)
  console.log("1")
  // Filled in from start message
  let streamSid
  let callSid
  console.log("2")
  const gptService = new GptService(query)
  console.log("3")
  const streamService = new StreamService(ws)
  console.log("4")
  const transcriptionService = new TranscriptionService()
  console.log("5")
  const ttsService = new TextToSpeechService({})
  console.log("hey2")
  let marks = []
  let interactionCount = 0

  // Incoming from MediaStream
  ws.on('message', function message (data) {
    // console.log("hey3")
    const msg = JSON.parse(data)
    if (msg.event === 'start') {
      streamSid = msg.start.streamSid
      callSid = msg.start.callSid
      streamService.setStreamSid(streamSid)
      gptService.setCallSid(callSid)
      console.log(`Twilio -> Starting Media Stream for ${streamSid}`.underline.red)


      ttsService.generate({ partialResponseIndex: null, partialResponse: `Hello! I\'d like to get some help with cancelling my current subscription.` }, 1)

    } else if (msg.event === 'media') {
      // console.log("media")
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
    // This is a bit of a hack to filter out empty utterances
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

app.listen(PORT)
console.log(`Server running on port ${PORT}`)
