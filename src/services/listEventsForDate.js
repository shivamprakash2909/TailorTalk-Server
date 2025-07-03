import { auth, calendar } from "./googleCalendar.js";

async function listEventsForDate(startTime, endTime) {
  const authClient = await auth.getClient();
  const calendarId = process.env.CALENDAR_ID;

  try {
    const res = await calendar.events.list({
      auth: authClient,
      calendarId,
      timeMin: startTime,
      timeMax: endTime,
      timeZone: "Asia/Kolkata",
      singleEvents: true,
      orderBy: "startTime",
    });
    console.log("📋 Fetched events count:", res.data.items.length);

    return res.data.items.map((event) => ({
      summary: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      link: event.htmlLink,
    }));
  } catch (err) {
    console.error("❌ Error listing calendar events:", err?.response?.data || err.message);
    throw new Error("Failed to fetch calendar events");
  }
}

export default listEventsForDate;
