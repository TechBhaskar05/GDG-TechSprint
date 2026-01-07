import OpenAI from "openai";
import axios from "axios";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeComplaintWithAI = async ({ imageUrl, description }) => {
  try {
    // Convert image → base64
    const imageRes = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const base64Image = Buffer.from(imageRes.data).toString("base64");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            "You are an AI used by Indian municipal corporations to validate and classify civic complaints.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
TASK 1: Validate image relevance.
TASK 2: Classify the civic issue ONLY if relevant.

Rules:
- If the image does NOT show a real civic/public infrastructure issue, mark isRelevant=false.
- Do NOT guess.
- Reject selfies, animals, food, screenshots, private objects, memes, random photos.

Return ONLY valid JSON in this EXACT format:

{
  "isRelevant": true | false,
  "category": "garbage | road | drainage | lighting | null",
  "severity": "low | medium | high | null",
  "keywords": ["tag1", "tag2"]
}

Complaint description:
"${description}"
              `,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    });

    const raw = response.choices[0].message.content;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch[0]);

    // 🚫 REJECT irrelevant images
    if (!parsed.isRelevant) {
      throw new Error("Irrelevant image uploaded");
    }

    return {
      category: parsed.category?.toLowerCase() || "road",
      severity: parsed.severity?.toLowerCase() || "medium",
      keywords: parsed.keywords || [],
    };
  } catch (error) {
    console.error("OpenAI Vision Failed:", error.message);

    // Explicit signal to controller
    return {
      error: true,
      message: "Uploaded image is not a valid civic issue",
    };
  }
};
