# Ditch

An AI-Powered phone call service to cancel subscriptions.

[Link to Devpost submission](https://devpost.com/software/ditch)

[Link to demo video](https://www.youtube.com/watch?v=H-CZw98RbbI)

## Inspiration

It's too easy to rack up so many subscriptions that you can't keep track of them anymore. Even worse, canceling them can be a chore, especially when companies deliberately overcomplicate the process of ending a subscription plan. So, we wanted to create a Chrome extension that allows you to drastically speed up and simplify the process of ditching unneeded subscriptions, and automatically add Terms of Service information for the AI's context.

## Description

Ditch is a web service that has the capacity to make phone calls to companies, using AI to fully autonomously speak on the phone, in order to cancel your subscriptions! It allows users to log into their own personal accounts, and subscriptions are automatically tracked as soon as terms of agreements are signed. All subscriptions are maintained in a list, holding details such as monthly costs and the company's Terms of Service (TOS). Each one can be canceled with a click of a button, launching a phone call by an AI model to the corresponding company. It includes a Chrome extension as well as a corresponding website.

## Technologies Used
The frontend of the extension and the website use ReactJS, and the website itself is hosted on a GoDaddy domain using Netlify. The data is stored on a Firebase database. The backend of the application uses API routing with Node.js, incorporating Twilio for calling (including the CallGPT library), Deepgram for speech-to-text, ElevenLabs for text-to-speech, and OpenAI's GPT API for response generation. The backend was hosted on AWS EC2.

## Next Steps

A primary goal in expanding Ditch's capabilities is to allow users to communicate with the GPT agent while it is on the call, through providing real-time additions to the GPT's system context. This would allow there to be two input channels to the model during the phone call (which are the company being called and the user of the service), and this lets the user change the course of the conversation upon receiving information from the company representative.

Another interesting direction to go in is integrating our application with Rocket Money, which helps in recognizing subscription plans with credit cards. With that, we could better detect when subscriptions begin on webpages that require users to input credit card information.
