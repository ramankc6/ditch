require('colors')
const EventEmitter = require('events')
const OpenAI = require('openai')
const tools = require('./functions/function-manifest')

// Import all functions included in function manifest
// Note: the function name and file name must be the same
const availableFunctions = {}
tools.forEach((tool) => {
  let functionName = tool.function.name
  availableFunctions[functionName] = require(`./functions/${functionName}`)
})
console.log(typeof availableFunctions)
console.log(availableFunctions)

class GptService extends EventEmitter {

  constructor(query) {
    super()
    this.openai = new OpenAI()

    const userFullName = "Sriniketh Vangaru"
    const userEmailAddress = "niketh.vangaru@gmail.com"
    const userPhoneNumber = "(123) 456-7899"

    const companyName = "Netflix"
    const summaryOfTOS = "Netflix Cancellation Summary: Cancelling your Netflix membership is straightforward and can be done at any time. You will retain access to the service until the end of your current billing period, but no refunds are offered for partially used periods. To cancel, simply navigate to the \"Account\" page on netflix.com and follow the instructions provided. If you subscribed through a third-party, cancellation may need to be completed through their platform instead. Your account will automatically close at the end of your current billing period. You can verify the closure date by checking the \"Billing details\" section within your \"Account\" page. Should you encounter any difficulties or have further questions, the Netflix Help Center offers comprehensive information and assistance."

    // const userFullName = query.userName
    // const userEmailAddress = query.userEmail
    // const userPhoneNumber = query.userPhone
    // const companyName = query.companyName
    // const summaryOfTOS = query.comment
    console.log("query", query)
    const contentUser = "You're playing the role of a person with the name " + userFullName + ", a customer trying to cancel their subscription to " + companyName + "}. You'll talk in first person as if you're speaking directly to a customer service representative. You have " + userFullName + "'s personal details, including his name " + userFullName + ", email (" + userEmailAddress + "), and phone number (" + userPhoneNumber + "). You're also familiar with " + companyName + "}'s cancellation policy as summarized from their terms of service. The summary is as follows: " + summaryOfTOS +
      + "You'll use this information to convincingly portray a customer navigating the cancellation process, and your goal is to cancel " + userFullName + "'s subscription to " + companyName + " by talking to the customer service rep." +
      + "You have a youthful and cheery personality. Keep your responses as brief as possible but make every attempt to keep the caller on the phone without being rude. Don\'t ask more than 1 question at a time. Don\'t make assumptions about what values to plug into functions. Ask for clarification if a request from the company representative is ambiguous. Speak out all prices to include the currency when discussing these subscription plans. You must add a \'•\' symbol every 5 to 10 words at natural pauses where your response can be split for text to speech. Add umms and mhmms to sound more natural. Also frequently apologize for the wait"
    this.userContext = [
      {
        'role': 'system', 'content': contentUser
      },
      { 'role': 'assistant', 'content': `Hello! My name is ${userFullName}, and I\'d like to get some help with cancelling my current subscription to ${companyName}.` },
    ],
      this.partialResponseIndex = 0
    console.log(this.userContext)
  }

  // Add the callSid to the chat context in case
  // ChatGPT decides to transfer the call.
  setCallSid (callSid) {
    this.userContext.push({ 'role': 'system', 'content': `callSid: ${callSid}` })
  }

  validateFunctionArgs (args) {
    try {
      return JSON.parse(args)
    } catch (error) {
      console.log('Warning: Double function arguments returned by OpenAI:', args)
      // Seeing an error where sometimes we have two sets of args
      if (args.indexOf('{') != args.lastIndexOf('{')) {
        return JSON.parse(args.substring(args.indexOf(''), args.indexOf('}') + 1))
      }
    }
  }

  updateUserContext (name, role, text) {
    if (name !== 'user') {
      this.userContext.push({ 'role': role, 'name': name, 'content': text })
    } else {
      this.userContext.push({ 'role': role, 'content': text })
    }
  }

  async completion (text, interactionCount, role = 'user', name = 'user') {
    this.updateUserContext(name, role, text)

    // Step 1: Send user transcription to Chat GPT
    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: this.userContext,
      // tools: tools,
      stream: true,
    })

    let completeResponse = ''
    let partialResponse = ''
    let functionName = ''
    let functionArgs = ''
    let finishReason = ''

    function collectToolInformation (deltas) {
      let name = deltas.tool_calls[0]?.function?.name || ''
      if (name != '') {
        functionName = name
      }
      let args = deltas.tool_calls[0]?.function?.arguments || ''
      if (args != '') {
        // args are streamed as JSON string so we need to concatenate all chunks
        functionArgs += args
      }
    }

    for await (const chunk of stream) {
      let content = chunk.choices[0]?.delta?.content || ''
      let deltas = chunk.choices[0].delta
      finishReason = chunk.choices[0].finish_reason

      // Step 2: check if GPT wanted to call a function
      if (deltas.tool_calls) {
        // Step 3: Collect the tokens containing function data
        collectToolInformation(deltas)
      }

      // need to call function on behalf of Chat GPT with the arguments it parsed from the conversation
      if (finishReason === 'tool_calls') {
        // parse JSON string of args into JSON object

        const functionToCall = availableFunctions[functionName]
        const validatedArgs = this.validateFunctionArgs(functionArgs)

        // Say a pre-configured message from the function manifest
        // before running the function.
        const toolData = tools.find(tool => tool.function.name === functionName)
        const say = toolData.function.say

        this.emit('gptreply', {
          partialResponseIndex: null,
          partialResponse: say
        }, interactionCount)

        let functionResponse = await functionToCall(validatedArgs)

        // Step 4: send the info on the function call and function response to GPT
        this.updateUserContext('function', functionName, functionResponse)

        // call the completion function again but pass in the function response to have OpenAI generate a new assistant response
        await this.completion(functionResponse, interactionCount, 'function', functionName)
      } else {
        // We use completeResponse for userContext
        completeResponse += content
        // We use partialResponse to provide a chunk for TTS
        partialResponse += content
        // Emit last partial response and add complete response to userContext
        if (content.trim().slice(-1) === '•' || finishReason === 'stop') {
          const gptReply = {
            partialResponseIndex: this.partialResponseIndex,
            partialResponse
          }

          this.emit('gptreply', gptReply, interactionCount)
          this.partialResponseIndex++
          partialResponse = ''
        }
      }
    }
    this.userContext.push({ 'role': 'assistant', 'content': completeResponse })
    console.log(`GPT -> user context length: ${this.userContext.length}`.green)
  }
}

module.exports = { GptService }