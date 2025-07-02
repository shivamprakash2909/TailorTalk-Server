import express from "express";
import bookEvent from "../services/googleCalendar.js";
const router = express.Router();

router.post("/book", async (req, res) => {
  try {
    const { summary, start, end } = req.body;
    const link = await bookEvent(summary, start, end);
    res.json({ success: true, link });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
export default router;
