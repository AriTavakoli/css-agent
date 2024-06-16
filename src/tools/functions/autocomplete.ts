import express from 'express';
import OpenAI from 'openai';


export default async function autocomplete() {
    const messages = [
        {
            role: "system",
            content: 'Design assistant autocomplete',
        },
        {
            role: "user",
            content: 'I want to create a hero section on my website.',
        },
    ];
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages
    });


    return response.choices[0]

}