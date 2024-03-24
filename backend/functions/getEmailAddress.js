async function getEmailAddress(functionArgs) {
    let model = functionArgs.model;
    console.log('GPT -> called getEmailAddress() function');
    const email = "niketh.vangaru@gmail.com";
    if (model) {
      return JSON.stringify({ email });
    } else {
      return JSON.stringify({ error: "A prompt for the getEmailAddress function was not given." })
    }
  }
  
  module.exports = getEmailAddress;