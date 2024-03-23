const express = require('express');
const ExpressWs = require('express-ws');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
ExpressWs(app);
const { exec } = require('child_process');
const twilio = require('twilio');
require('dotenv').config();
const { StreamService } = require('./stream-service'); 


const port = process.env.PORT;

app.use(cors());
app.use(express.json());

const OpenAIApi = require('openai');



const openai = new OpenAIApi.OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.get('/api/getTOS', async (req, res) => {
    const {url} = req.body;

    exec('python3 fetch_tos.py ' + url, async (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Server error');
        }
        console.log(stdout)
        res.json(stdout)
    })
})

app.get('/api/summurizeTOS', async (req, res) => {
    const {tos} = req.body;
    const messages = [{role: "system", content: "You are CancelGPT. CancelGPT is designed to analyze Terms of Service (TOS) documents for companies and provide concise summaries of the terms related to cancellation. It extracts all details pertinent to cancellation, such as conditions, deadlines, fees, and procedures, presenting them in a summary that optimizes for minimal token usage. This approach ensures the essential information is conveyed efficiently, ready for further processing by other GPT instances. CancelGPT prioritizes clarity and precision, focusing solely on cancellation terms without including unnecessary details. It will ask for clarifications only when the provided TOS lacks clear cancellation terms or when essential details are ambiguous, ensuring the summaries are both compact and comprehensive. The tone is straightforward and factual, aimed at distilling relevant information without embellishment. Word it in a way that the summary can be read before contacting customer service to cancel their subscription."}, {role: "user", content:tos}]
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: messages
        });
        const aiResponse = response.choices[0].message.content
        console.log(aiResponse)
        res.json(aiResponse)
    } catch (error) {
        console.error('Failed to send message', error);
        res.status(500).send('Server error');
    }
})

app.post('/handle-call', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();

    twiml.say('Server is working.');
    twiml.hangup();

    res.type('text/xml');
    res.send(twiml.toString());
  });

app.ws('/connection', (ws) => {
    ws.on('error', console.error);
  
    const streamService = new StreamService(ws);
  
    // Filled in from start message
    let streamSid;
  
    // Incoming from MediaStream
    ws.on('message', function message(data) {
      const msg = JSON.parse(data);
      if (msg.event === 'start') {
        streamSid = msg.start.streamSid;
        streamService.setStreamSid(streamSid);
        console.log(`Twilio -> Starting Media Stream for ${streamSid}`);
      } else if (msg.event === 'media') {
        // Echo the received audio back to the caller
        streamService.sendAudio(msg.media.payload);
      } else if (msg.event === 'stop') {
        console.log(`Twilio -> Media stream ${streamSid} ended.`);
      }
    });
  });

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});