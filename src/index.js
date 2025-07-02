import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/calendar.js";
import geminiRouter from "./routes/gemini.js";

dotenv.config();

const app = express();
console.log("here, origin: ", process.env.NODE_ENV === "production" ? process.env.ORIGIN_PROD : process.env.ORIGIN);

app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? process.env.ORIGIN_PROD : process.env.ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    credentials: true,
  })
);
app.use(bodyParser.json());

app.use("/api/calendar", router);
app.use("/api/gemini", geminiRouter);

app.get("/", (req, res) => {
  res.send("Backend is working ✅");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is healthy" });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on PORT:${PORT}`);
});
