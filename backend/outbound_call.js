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
  send_url = `https://${process.env.SERVER}/incoming`

  console.log(send_url)
  await client.calls
    .create({
      url: send_url,
      to: process.env.TO_NUMBER,
      from: process.env.FROM_NUMBER
    })
    .then(call => console.log(`SID of Outbound Call: ${call.sid}` ));
}

makeOutBoundCall();