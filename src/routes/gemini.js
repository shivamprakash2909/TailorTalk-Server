import express from "express";
import axios from "axios";
import { google } from "googleapis";
import dayjs from "dayjs";
import calendarAuth from "../services/googleCalendar.js";

const router = express.Router();
const calendar = google.calendar("v3");

// POST /api/gemini/chat
router.post("/chat", async (req, res) => {
  const { message } = req.body;

  const prompt = `
You are TailorTalk, a smart and friendly AI assistant.
You help users schedule meetings or check their calendar availability.
If the user asks for a schedule or free slots on a specific day, respond clearly with the date in YYYY-MM-DD format so the backend can act on it.
Otherwise, chat casually or assist with tasks.

User: ${message}
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

// POST /api/gemini/extract
router.post("/extract", async (req, res) => {
  const { message } = req.body;

  const prompt = `
You are an intelligent calendar assistant.

Your job is to extract either:
1. A meeting booking → return:
{
  "summary": "...",
  "start": "YYYY-MM-DDTHH:mm:ss",
  "end": "YYYY-MM-DDTHH:mm:ss"
}

2. A schedule request → return:
{
  "dateQuery": "YYYY-MM-DD"
}

❗IMPORTANT:
- If all required information is present, return the JSON immediately without any follow-up question.
- DO NOT ask the user for confirmation.
- DO NOT include any explanation or context — just return the valid JSON.

If the message is incomplete or lacks recognizable information, DO NOT return JSON. Just explain what’s missing in plain text.

User: "${message}"
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
      return res.json({ success: true, type: "booking", ...parsed });
    }

    if (parsed?.dateQuery) {
      return res.json({ success: true, type: "dateQuery", date: parsed.dateQuery });
    }

    res.json({ success: false, reply: rawText });
  } catch (err) {
    console.error("❌ Gemini Extract Error:", err?.response?.data || err.message);
    res.status(500).json({ success: false, error: "Gemini API error" });
  }
});

// POST /api/gemini/schedule
router.post("/schedule", async (req, res) => {
  const { date } = req.body;

  if (!date) return res.status(400).json({ success: false, error: "Missing 'date'" });

  try {
    const authClient = await calendarAuth.getClient();
    const timeMin = dayjs(date).startOf("day").toISOString();
    const timeMax = dayjs(date).endOf("day").toISOString();

    const result = await calendar.events.list({
      auth: authClient,
      calendarId: process.env.CALENDAR_ID,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = result.data.items.map((event) => ({
      summary: event.summary,
      start: event.start.dateTime,
      end: event.end.dateTime,
    }));

    res.json({ success: true, schedule: events });
  } catch (err) {
    console.error("❌ Schedule Fetch Error:", err?.response?.data || err.message);
    res.status(500).json({ success: false, error: "Failed to fetch schedule" });
  }
});

export default router;
