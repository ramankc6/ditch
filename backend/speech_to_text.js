require('colors');
const { Deepgram } = require('@deepgram/sdk');
const { Buffer } = require('node:buffer');
const EventEmitter = require('events');
const express = require("express");

const app = express();

const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);
const deepgramLive = deepgram.transcription.live({
    encoding: 'mulaw',
    sample_rate: '8000',
    model: 'nova-2',
    punctuate: true,
    interim_results: true,
    endpointing: 200,
    utterance_end_ms: 1000
});

app.post('/handle-call', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
  
    // Create a Stream element to connect to the websocket
    const stream = twiml.connect().stream({
      url: `wss://${process.env.SERVER}/connection`,
    });
  
    res.type('text/xml');
    res.send(twiml.toString());
});

// Websocket endpoint for handling the audio stream
app.ws('/connection', (ws) => {
    ws.on('error', console.error);

    // Incoming from MediaStream
    ws.on('message', function message(data) {
        const msg = JSON.parse(data);
        if (msg.event === 'start') {
            console.log(`Twilio -> Starting Media Stream for ${msg.start.streamSid}`);
        } else if (msg.event === 'media') {
            // Send audio chunk for transcription
            deepgramLive.send(Buffer.from(msg.media.payload, 'base64'));
        } else if (msg.event === 'stop') {
            console.log(`Twilio -> Media stream ended.`);
        }
    });
});

// Deepgram transcription event handler
deepgramLive.addListener('transcriptReceived', (transcriptionMessage) => {
    const transcription = JSON.parse(transcriptionMessage);
    const text = transcription.channel?.alternatives[0]?.transcript;
  
    if (text?.toLowerCase().includes('apple')) {
        // Secret phrase detected, respond and hang up
        const twiml = new twilio.twiml.VoiceResponse();
        twiml.say('User said secret phrase.');
        twiml.hangup();
  
        // Send the TwiML response to Twilio (replace with your actual call SID)
        client.calls('YOUR_CALL_SID').update({ twiml: twiml.toString() });
    }
});
  

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});