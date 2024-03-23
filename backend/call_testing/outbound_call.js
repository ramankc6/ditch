/*
  Source: https://github.com/twilio-labs/call-gpt/blob/main/scripts/outbound-call.js

  You can use this script to place an outbound call
  to your own mobile phone.
*/

require('dotenv').config();

async function makeOutBoundCall() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  const client = require('twilio')(accountSid, authToken);

  await client.calls
    .create({
      url: `http://ec2-18-117-221-234.us-east-2.compute.amazonaws.com:3001/handle-call`,
      to: process.env.TO_NUMBER,
      from: process.env.FROM_NUMBER,
      
      // recording parameters
      record: true,
      recordingStatusCallback: '/recording-callback'
    })
    .then(call => console.log(`SID of Outbound Call: ${call.sid}` ));
}

makeOutBoundCall();