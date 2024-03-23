const EventEmitter = require('events');

class StreamService extends EventEmitter {
  constructor(websocket) {
    super();
    this.ws = websocket;
    this.streamSid = '';
  }

  setStreamSid(streamSid) {
    this.streamSid = streamSid;
  }

  sendAudio(audio) {
    this.ws.send(
      JSON.stringify({
        streamSid: this.streamSid,
        event: 'media',
        media: {
          payload: audio,
        },
      })
    );
  }
}

module.exports = { StreamService };