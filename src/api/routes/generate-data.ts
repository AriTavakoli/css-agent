import express from "express";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const router = express.Router();
const apiKey = process.env.OPENAI_API_KEY;

router.post("/", async (req, res) => {
  const promptDescription = "Generate data for a grid layout with 3 columns and 4 rows.";
  const number_of_examples = 1;
  const temperature = 0.7;

  const openai = new OpenAI({ apiKey });

  let trainingData = [];

  for (let i = 0; i < number_of_examples; i++) {
    console.log(`Generating example ${i}`);
    try {
      const messages = [
        {
          role: "system",
          content: `You are to generate a response in JSON format detailing a grid layout based on the following prompt: ${promptDescription}`
        },
        {
          role: "user",
          content: promptDescription
        }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: temperature,
        max_tokens: 1000,
      });

      const completion = response.choices[0].message.content;  

      trainingData.push({
        prompt: promptDescription,
        completion: completion
      });

      console.log(`Example ${i} generated successfully.`);
    } catch (error) {
      console.error(`Error generating example ${i}:`, error);
      res.status(500).json({ error: "Failed to generate examples" });
      return;
    }
  }

  try {
    const rootDir = process.cwd();
    const filePath = path.join(rootDir, "training-data", "training_examples.jsonl");

    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const fileStream = fs.createWriteStream(filePath);
    trainingData.forEach(data => {
      fileStream.write(JSON.stringify(data) + "\n");
    });
    fileStream.end();

    console.log(`Training examples saved to ${filePath}`);
    res.status(200).json({ message: "Training examples generated and saved successfully." });
  } catch (error) {
    console.error("Error while saving the file:", error);
    res.status(500).json({ error: "Failed to save the examples" });
  }
});

export default router;
