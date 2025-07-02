# 🧠 TailorTalk - Backend Server

This is the **backend server** for [TailorTalk](https://tailortalk-server.onrender.com), an AI-powered assistant that helps users schedule meetings through natural language conversations.

It integrates:

- 🧠 LLMs like **Gemini**
- 📅 **Google Calendar API** for event booking
- 🌐 A frontend built in React → [Frontend Repo](https://github.com/shivamprakash2909/tailortalk)

---

## 🚀 Features

- 🧠 Gemini based conversational AI endpoints
- 📅 Google Calendar event creation using service accounts
- 📥 Natural language extraction to structured event data
- ⚙️ Express.js backend, easily extendable
- 🔐 Secure API key & environment-based configuration

---

## 🌍 API Endpoints

| Method | Endpoint              | Description                     |
| ------ | --------------------- | ------------------------------- |
| POST   | `/api/gemini/chat`    | Generate a conversational reply |
| POST   | `/api/gemini/extract` | Extract summary, date, time     |
| POST   | `/api/calendar/book`  | Book event in Google Calendar   |

---

## 🧩 Technologies Used

- Node.js + Express
- Google Calendar API (Service Account)
- Gemini / Gemma LLM (via HTTP calls)
- dotenv for environment config
- Axios for API interaction
- Deployed on Render / Railway (optional)

---

## 🔧 Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/shivamprakash2909/TailorTalk-Server.git
cd tailortalk-backend
```
