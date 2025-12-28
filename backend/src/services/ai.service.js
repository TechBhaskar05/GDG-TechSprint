import axios from "axios";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent";

export const analyzeComplaintWithAI = async ({
  imageUrl,
  description,
}) => {
  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `
You are an AI system for civic issue analysis.

Given an IMAGE and DESCRIPTION, return ONLY valid JSON:
{
  "category": "garbage | road | drainage | lighting",
  "severity": "low | medium | high",
  "keywords": ["keyword1", "keyword2"]
}

Description: ${description}
Image URL: ${imageUrl}
`,
              },
            ],
          },
        ],
      }
    );

    const rawText =
      response.data.candidates[0].content.parts[0].text;

    return JSON.parse(rawText);
  } catch (error) {
    console.error("Gemini AI failed:", error.message);

    // Safe fallback
    return {
      category: null,
      severity: "low",
      keywords: [],
    };
  }
};
