// backend/routes/gemini.js

import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/chat", async (req, res) => {
  const { message } = req.body;

  const prompt = `
You are TailorTalk, a smart and friendly AI assistant.
You can chat with the users in a friendly way and help them with their queries.

User: ${message}
`;

  try {
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-001:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const rawText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(500).json({ success: false, error: "No response from Gemini" });
    }

    console.log("🔎 Gemini Raw Response:", rawText);
    res.json({ success: true, reply: rawText });
  } catch (err) {
    console.error("❌ Gemini API Error:", err?.response?.data || err.message || err);
    res.status(500).json({
      success: false,
      error: err.response?.data?.error?.message || err.message || "Gemini API error",
    });
  }
});
router.post("/extract", async (req, res) => {
  const { message } = req.body;

  const prompt = `
You are an intelligent calendar assistant.

Your task is to extract event details from the user's message. If summary, date, start-time, end-time are present, return ONLY the following JSON:
{
  "summary": "...",
  "start": "...",  // ISO 8601 format (e.g., 2024-07-04T15:00:00)
  "end": "..."
}
If the message contain the details of a meeting, then directly book the meeting without asking the user for confirmation.
If any required field is missing:
- DO NOT return JSON
- Instead, ask the user a clear question to collect what's missing (e.g., "What time should the meeting start?")

Message: "${message}"
`;

  try {
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-001:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const rawText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("🔍 Gemini JSON Raw:", rawText);

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (parsed?.summary && parsed?.start && parsed?.end) {
      res.json({ success: true, ...parsed });
    }
  } catch (err) {
    console.error("❌ Gemini Extract Error:", err?.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: "Gemini API error",
    });
  }
});

export default router;
