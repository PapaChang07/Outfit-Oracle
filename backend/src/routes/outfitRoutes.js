const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const wardrobe = require("../data/wardrobeData");

const wardrobeList = wardrobe
  .map(
    (item) =>
      `- ${item.category}: ${item.name}, color: ${item.color}, style: ${item.style}, warmth: ${item.warmth}`
  )
  .join("\n");

router.post("/generate", async (req, res) => {
  try {
    const { occasion, temperature, weather, vibe } = req.body;

    const prompt = `
You are a personal stylist for a 26-year-old Asian male with warm undertones.

Generate an outfit based on:
- Occasion: ${occasion}
- Temperature: ${temperature}
- Weather: ${weather}
- Vibe: ${vibe}

You MUST follow these rules:
- ONLY use items from the wardrobe below
- DO NOT invent new clothing items
- If a category is missing, return "none"

Wardrobe:
${wardrobeList}

Return ONLY valid JSON in this format:
{
  "outfit": {
    "top": "",
    "bottom": "",
    "outerwear": "",
    "shoes": ""
  },
  "explanation": ""
}
`;;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a helpful fashion stylist. Return only valid JSON." },
        { role: "user", content: prompt },
      ],
    });

    const text = response.choices[0].message.content;

    // try parsing AI response
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({
        error: "Invalid AI response",
        raw: text,
      });
    }

    res.json(parsed);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;