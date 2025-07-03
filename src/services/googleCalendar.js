import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";

const calendar = google.calendar("v3");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keyPath = path.join(__dirname, "../../service-account.json");
const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ["https://www.googleapis.com/auth/calendar"],
});

async function bookEvent(summary, startTime, endTime) {
  const authClient = await auth.getClient();
  const calendarId = process.env.CALENDAR_ID;

  console.log("📅 Calendar ID:", calendarId);
  console.log("📨 Summary:", summary);
  console.log("🕒 Start:", startTime);
  console.log("🕒 End:", endTime);

  const event = {
    summary,
    start: { dateTime: startTime, timeZone: "Asia/Kolkata" },
    end: { dateTime: endTime, timeZone: "Asia/Kolkata" },
  };

  try {
    const response = await calendar.events.insert({
      auth: authClient,
      calendarId,
      requestBody: event,
    });

    console.log("✅ Event created:", response.data.htmlLink);
    return response.data.htmlLink;
  } catch (err) {
    console.error("❌ Google Calendar API Error:");
    console.error(err.response?.data || err.message || err);
    throw new Error("Failed to create event: " + (err.response?.data?.error?.message || err.message));
  }
}
export { auth, calendar };
export default bookEvent;
