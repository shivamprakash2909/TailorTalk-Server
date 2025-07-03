import express from "express";
import bookEvent from "../services/googleCalendar.js";
import listEventsForDate from "../services/listEventsForDate.js";
import dayjs from "dayjs";

const router = express.Router();

// POST /api/calendar/book
router.post("/book", async (req, res) => {
  try {
    const { summary, start, end } = req.body;

    if (!summary || !start || !end) {
      return res.status(400).json({ success: false, error: "Missing required fields: summary, start, or end." });
    }

    console.log("📌 Booking event:", summary, start, end);
    const link = await bookEvent(summary, start, end);

    res.json({ success: true, link });
  } catch (err) {
    console.error("❌ Booking Error:", err.message || err);
    res.status(500).json({ success: false, error: err.message || "Unknown error while booking" });
  }
});

// POST /api/calendar/list
router.post("/list", async (req, res) => {
  try {
    const { date } = req.body;

    if (!date || !dayjs(date).isValid()) {
      return res.status(400).json({ success: false, error: "Valid 'date' (YYYY-MM-DD) is required." });
    }

    const isoStart = dayjs(date).startOf("day").toISOString();
    const isoEnd = dayjs(date).endOf("day").toISOString();

    console.log(`📅 Fetching events for ${date} (${isoStart} - ${isoEnd})`);
    const events = await listEventsForDate(isoStart, isoEnd);
    console.log("📋 Events found:", events.length > 0 ? events : "No events");

    res.json({ success: true, events });
  } catch (err) {
    console.error("❌ List Events Error:", err.message || err);
    res.status(500).json({ success: false, error: err.message || "Failed to fetch calendar events" });
  }
});

export default router;
