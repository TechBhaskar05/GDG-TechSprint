import axios from "axios";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export const analyzeComplaintWithAI = async ({ imageUrl, description }) => {
  try {
    // 1. Fetch image from Cloudinary and convert to Base64
    const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const base64Image = Buffer.from(imageRes.data, "binary").toString("base64");

    const response = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `You are a Lucknow Municipal Corporation AI assistant. Analyze this civic issue description: "${description}". 
                Compare the text with the provided image. 
                Return ONLY a valid JSON object with these exact keys: 
                "category" (must be one of: garbage, road, drainage, lighting), 
                "severity" (must be one of: low, medium, high), 
                "keywords" (array of relevant tags).`,
              },
              { inline_data: { mime_type: "image/jpeg", data: base64Image } },
            ],
          },
        ],
      }
    );

    let rawText = response.data.candidates[0].content.parts[0].text;

    // Improved JSON extraction to handle potential AI chatter
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const aiResult = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);

    // Force lowercase and validate against your Mongoose Enums
    return {
      category: aiResult.category?.toLowerCase() || "road",
      severity: aiResult.severity?.toLowerCase() || "medium",
      keywords: aiResult.keywords || [],
    };
  } catch (error) {
    // Log detailed error for debugging
    console.error(
      "Gemini AI Processing Failed:",
      error.response?.data || error.message
    );
    return {
      category: "road",
      severity: "medium",
      keywords: ["manual_review_required"],
    };
  }
};
