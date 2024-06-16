import express from 'express';
import OpenAI from 'openai';
import getCurrentWeather from '../../tools/functions/getWeather';
import { availableFunctions, tools } from '../../tools/tools-index';
import { defaultPrompt } from '../../prompts/prompt-index';
import { createEmbedding } from '../../utils/create-embeddings';

const router = express.Router();

type SuggestionResponse = string[];

router.get<{}, SuggestionResponse>('/', async (req, res) => {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const text = req.query.text;

 
    const embeddings = await createEmbedding(text);

    console.log('Embeddings:', embeddings);

});


export default router;