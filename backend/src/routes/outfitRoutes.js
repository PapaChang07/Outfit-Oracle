const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const wardrobe = require("../data/wardrobeData");

function formatWardrobeItem(item) {
  return [
    `- Name: ${item.name}`,
    `  Category: ${item.category}`,
    `  Item type: ${item.itemType || "N/A"}`,
    `  Brand: ${item.brand || "N/A"}`,
    `  Fit/Cut: ${item.fit || "N/A"}`,
    `  Material/Fabric: ${item.material || "N/A"}`,
    `  Color/Pattern: ${item.colorPattern || "N/A"}`,
  ].join("\n");
}

const wardrobeText = wardrobe.map(formatWardrobeItem).join("\n\n");

router.post("/generate", async (req, res) => {
  try {
    const { occasion, temperature, weather, vibe } = req.body;

    const prompt = `
You are Outfit Oracle, a practical personal stylist.

The user wants an outfit for:
- Occasion: ${occasion}
- Temperature: ${temperature}
- Weather: ${weather}
- Vibe: ${vibe}

Here is the user's wardrobe:
${wardrobeText}

Rules:
- Only recommend items that appear in the wardrobe.
- Pick one complete outfit.
- Include top, bottom, shoes, and outerwear if useful.
- Do not invent clothing items.
- Consider temperature, weather, formality, color harmony, and vibe.
- If an item is optional, mark it as optional.
- Explain why the outfit works in a natural, concise way.
- Use the exact item names from the wardrobe.

Return valid JSON in this exact shape:
{
  "outfit": {
    "top": "",
    "bottom": "",
    "shoes": "",
    "outerwear": "",
    "accessories": []
  },
  "explanation": "",
  "alternatives": []
}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a helpful fashion stylist. Return only valid JSON.",
        },
        { role: "user", content: prompt },
      ],
    });

    const text = response.choices[0].message.content;

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