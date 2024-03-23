const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 3001;


app.use(cors());
app.use(express.json());

const OpenAIApi = require('openai');



const openai = new OpenAIApi.OpenAI({
    apiKey: ""
});

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

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});