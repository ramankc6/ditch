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
const https = require('https')
const fs = require('fs')
const { Deepgram } = require('@deepgram/sdk');
const textToSpeech = require('@google-cloud/text-to-speech');

const port = process.env.PORT;

app.use(cors());
app.use(express.json());

const OpenAIApi = require('openai');
const openai = new OpenAIApi.OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/getTOS', async (req, res) => {
    console.log("getTOS called")
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
    console.log('handle-call called')
    const twiml = new twilio.twiml.VoiceResponse();

    twiml.say('Server is working.');

    const stream = twiml.connect().stream({
        url: `wss://${process.env.SERVER}/connection`,
    });

    res.type('text/xml');
    res.send(twiml.toString());
  });

app.ws('/connection', (ws) => {
    const streamService = new StreamService(ws);
    const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);
    const ttsClient = new textToSpeech.textToSpeechClient();

    ws.on('message', function message(data) {

        if (msg.event === 'media') {
            deepgram.transcription.live({
                encoding: 'mulaw', // Audio encoding format (e.g., 'mulaw', 'linear16')
                sample_rate: 8000, // Audio sample rate (e.g., 8000, 16000)
                model: 'phone_call', // Transcription model to use (e.g., 'general', 'nova-2')
                punctuate: true, // Whether to include punctuation in the transcript
                interim_results: true, // Whether to receive interim (partial) transcription results
                endpointing: 300, // Endpointing sensitivity (higher values = more sensitive)
                utterance_end_ms: 1500
            })
            .on('transcriptReceived', async (transcription)=> {
                const text = transcription.channel.alternatives[0].transcript;

                if (text.toLowerCase().includes('apple')){

                    const request = {
                        input: {text: 'Secret phrase recognized'},
                        voice: { languageCode: 'en-US', ssmlGender: 'FEMALE'},
                        audioConfig: {audioEncoding: 'MP3'},
                    }

                    const [response] = await ttsClient.synthesizeSpeech(request);
                    const audio = response.audioContent

                    streamService.sendAudio(audio.toString('base64'));
                }
            })
        }
    })
})
const privateKey = fs.readFileSync('private.key', 'utf8')

const certificate = fs.readFileSync('certificate.crt', 'utf8')

const caBundle = fs.readFileSync('ca_bundle.crt', 'utf8')

const credentials = {key: privateKey, cert: certificate, ca: caBundle}
const server = https.createServer(credentials, app)

server.listen(port, console.log(`Server started on port ${port}`))