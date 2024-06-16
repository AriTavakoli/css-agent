import express from 'express';
import OpenAI from 'openai';
import getCurrentWeather from '../../tools/functions/getWeather';
import { availableFunctions, tools } from '../../tools/tools-index';
import { defaultPrompt } from '../../prompts/prompt-index';
import { Pinecone } from '@pinecone-database/pinecone';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        // Instantiate a new Pinecone client
        const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

        // Select the desired index
        const index = pinecone.Index(process.env.PINECONE_INDEX!);

        // Use the custom namespace, if provided, otherwise use the default
        const namespaceName = process.env.PINECONE_NAMESPACE ?? " ";
        const namespace = index.namespace(namespaceName);

        // Delete everything within the namespace
        await namespace.deleteAll();

        res.json({
            success: true
        });
    } catch (error) {
        console.error('Failed to delete namespace:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


export default router;