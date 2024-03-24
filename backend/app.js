require('dotenv').config();
require('colors');
const express = require('express');
const ExpressWs = require('express-ws');

const { GptService } = require('./gpt');
const { StreamService } = require('./web-socket');
const { TranscriptionService } = require('./transcription');
const { TextToSpeechService } = require('./tts');

const app = express();
ExpressWs(app);

const PORT = process.env.PORT || 3000;

app.post('/incoming', (req, res) => {
  // console.log("inc running")
  res.status(200);
  res.type('text/xml');
  res.end(`
  <Response>
    <Connect>
      <Stream url="wss://${process.env.SERVER}/connection" />
    </Connect>
  </Response>
  `);
});

app.ws('/connection', (ws) => {
  // console.log("hey")
  ws.on('error', console.error);
  // console.log("1")
  // Filled in from start message
  let streamSid;
  let callSid;
  // console.log("2")
  const gptService = new GptService();
  // console.log("3")
  const streamService = new StreamService(ws);
  // console.log("4")
  const transcriptionService = new TranscriptionService();
  // console.log("5")
  const ttsService = new TextToSpeechService({});
  // console.log("hey2")
  let marks = [];
  let interactionCount = 0;

  // Incoming from MediaStream
  ws.on('message', function message(data) {
    // console.log("hey3")
    const msg = JSON.parse(data);
    if (msg.event === 'start') {
      streamSid = msg.start.streamSid;
      callSid = msg.start.callSid;
      streamService.setStreamSid(streamSid);
      gptService.setCallSid(callSid);
      console.log(`Twilio -> Starting Media Stream for ${streamSid}`.underline.red);

      const userFullName = "Sriniketh Vangaru";
      const userEmailAddress = "niketh.vangaru@gmail.com";
      const userPhoneNumber = "(123) 456-7899";
      const companyName = "Netflix";
      const summaryOfTOS = "Netflix Cancellation Summary: Cancelling your Netflix membership is straightforward and can be done at any time. You will retain access to the service until the end of your current billing period, but no refunds are offered for partially used periods. To cancel, simply navigate to the \"Account\" page on netflix.com and follow the instructions provided. If you subscribed through a third-party, cancellation may need to be completed through their platform instead. Your account will automatically close at the end of your current billing period. You can verify the closure date by checking the \"Billing details\" section within your \"Account\" page. Should you encounter any difficulties or have further questions, the Netflix Help Center offers comprehensive information and assistance.";

      ttsService.generate({partialResponseIndex: null, partialResponse: `Hello! My name is ${userFullName}, and I\'d like to get some help with cancelling my current subscription to ${companyName}.` }, 1);
    
    } else if (msg.event === 'media') {
      // console.log("media")
      transcriptionService.send(msg.media.payload);
    } else if (msg.event === 'mark') {
      const label = msg.mark.name;
      console.log(`Twilio -> Audio completed mark (${msg.sequenceNumber}): ${label}`.red);
      marks = marks.filter(m => m !== msg.mark.name);
    } else if (msg.event === 'stop') {
      console.log(`Twilio -> Media stream ${streamSid} ended.`.underline.red);
    }
  });

  transcriptionService.on('utterance', async (text) => {
    // This is a bit of a hack to filter out empty utterances
    if(marks.length > 0 && text?.length > 5) {
      console.log('Twilio -> Interruption, Clearing stream'.red);
      ws.send(
        JSON.stringify({
          streamSid,
          event: 'clear',
        })
      );
    }
  });

  transcriptionService.on('transcription', async (text) => {
    if (!text) { return; }
    console.log(`Interaction ${interactionCount} – STT -> GPT: ${text}`.yellow);
    gptService.completion(text, interactionCount);
    interactionCount += 1;
  });
  
  gptService.on('gptreply', async (gptReply, icount) => {
    console.log(`Interaction ${icount}: GPT -> TTS: ${gptReply.partialResponse}`.green );
    ttsService.generate(gptReply, icount);
  });

  ttsService.on('speech', (responseIndex, audio, label, icount) => {
    console.log(`Interaction ${icount}: TTS -> TWILIO: ${label}`.blue);

    streamService.buffer(responseIndex, audio);
  });

  streamService.on('audiosent', (markLabel) => {
    marks.push(markLabel);
  });
});

app.listen(PORT);
console.log(`Server running on port ${PORT}`);
