# 🤖 SkillMatch AI Chatbot — How It Works (Gemini + Secure Read‑Only Assistant)

This document explains **how the chatbot works inside SkillMatch AI**, how it stays secure (read‑only), what data it can access, and **why Gemini is used** in this project.

---

## 📍 Quick Navigation

- [🧭 Where the chatbot appears](#-where-the-chatbot-appears)
- [🔐 Authentication (Token flow)](#-authentication-token-flow)
- [🔌 API endpoint](#-api-endpoint)
- [🧠 How the chatbot thinks (intent + context)](#-how-the-chatbot-thinks-intent--context)
- [📚 Knowledge base (tooling)](#-knowledge-base-tooling)
- [🧼 Safety & guardrails](#-safety--guardrails)
- [⚡ Why Gemini (and why this model)](#-why-gemini-and-why-this-model)
- [🧪 Troubleshooting](#-troubleshooting)
- [🛠️ How to improve answers safely](#-how-to-improve-answers-safely)

---

## 🧭 Where the chatbot appears

The chatbot is a **global widget** rendered from the app layout:
- Frontend: `SkillMatch-AI/src/app/layout.js`
- Component: `SkillMatch-AI/src/app/components/Chatbot/Chatbot.jsx`

Behavior highlights:
- Floating “Ask AI” button + chat panel UI
- Quick prompt suggestions
- Loading state + basic fallback replies if the API fails
- 20s request timeout (AbortController)

---

## 🔐 Authentication (Token flow)

The chatbot is protected the same way as other secure backend routes.

### ✅ Client (Next.js)
1. User signs in with **Firebase Authentication**.
2. Frontend gets a Firebase **ID token** via `user.getIdToken()`.
3. Frontend sends the token:

```http
Authorization: Bearer <firebase_id_token>
```

This happens in `Chatbot.jsx` when calling `POST /api/chatbot/ask`.

### ✅ Server (Express)
1. Backend verifies the token using Firebase Admin:
   - `SkillMatch-AI-Server/middleware/auth.js`
2. Backend fetches the user profile from MongoDB (`users`) to attach a role.
3. Server sets:
```js
req.user = { uid, email, role }
```

Why this matters:
- The chatbot can safely fetch **only the logged‑in user’s data**
- It can respond differently for candidate vs recruiter

---

## 🔌 API endpoint

### `POST /api/chatbot/ask`

Defined in:
- `SkillMatch-AI-Server/routes/chatbot.routes.js`
- `SkillMatch-AI-Server/controllers/chatbotController.js`
- `SkillMatch-AI-Server/services/chatbotService.js`

**Request body**
```json
{ "prompt": "How do I apply for a job?" }
```

**Response**
```json
{ "success": true, "assistant": "..." }
```

---

## 🧠 How the chatbot thinks (intent + context)

The chatbot service follows a simple but secure pipeline:

### 1) Normalize the input
To handle case‑insensitive and slightly varied phrasing, user input is normalized:
- `trim()`
- `toLowerCase()`
- remove punctuation like `. , ? !`

Implementation: `normalizeInput()` in `SkillMatch-AI-Server/services/chatbotService.js`

### 2) Intent classification (keyword groups)
The app uses a lightweight keyword approach to classify intent:
- `platform_help`
- `candidate_workflow_help`
- `recruiter_workflow_help`
- `user_data_summary`
- `learning_guidance`
- `skill_matching_explanation`
- `dashboard_navigation_help`
- `safe_next_step_guidance`
- fallback: `general`

Implementation: `classifyIntent()` in `SkillMatch-AI-Server/services/chatbotService.js`

Notes:
- This is intentionally simple (fast + predictable).
- It can be extended over time (see the “Improve answers safely” section).

### 3) Context building (read-only user data)
Based on the user role, the backend fetches minimal, safe data:

**Candidate context**
- profile basics: `displayName`, `email`, `skills`, `title`
- counts: total applications, total saved jobs

**Recruiter context**
- profile basics: `displayName`, `email`, `companyName`
- counts: active jobs posted, total applicants (derived by counting applications per job)

Implementation:
- `getCandidateContext(uid)`
- `getRecruiterContext(uid)`

Security characteristics:
- Uses server-side MongoDB only
- Uses projections (safe fields) and aggregate counts (not full raw datasets)
- Never reads other users’ private profiles

### 4) Prompt assembly (instructions + context + knowledge)
The backend builds a single prompt containing:
- strict security rules (read‑only, no actions)
- user context JSON (safe fields only)
- platform knowledge base JSON
- the user’s question

Then it calls Gemini to produce a natural response.

---

## 📚 Knowledge base (tooling)

The chatbot uses an internal knowledge source to answer platform questions consistently:
- `SkillMatch-AI-Server/config/systemKnowledge.json`

Each entry contains:
- `category` (e.g., `platform_help`)
- `topic`
- `content` (the explanation text)

Why this is useful:
- Keeps answers consistent across sessions
- Reduces hallucinations
- Lets you update product help without code changes (just edit JSON)

---

## 🧼 Safety & guardrails

The chatbot is designed to be **read‑only**.

### ✅ Hard fallback for out-of-scope questions
If the question is unrelated to the platform, the assistant must reply exactly:

```
Sorry, I do not have relevant information about that right now. I can help you with platform features, your data in this system, learning plans, and job matching guidance.
```

This sentence is embedded in the prompt so Gemini can follow it.

### ✅ Action refusal
If a user asks the bot to perform actions (apply, post job, update data), the bot should refuse and guide them through the UI.

### ✅ Response sanitizer (for forbidden claims)
After Gemini returns text, the service checks for phrases like:
- “I updated your …”
- “I deleted your …”
- “I posted the …”

If detected, the response is replaced with a safe message:
> “I cannot perform actions directly, but I can guide you on how to do it in the platform.”

Implementation: forbidden phrase scan at the end of `askChatbot()`.

---

## ⚡ Why Gemini (and why this model)

This project uses Gemini through Google’s official Node SDK:
- Package: `@google/generative-ai`
- Model configured in code: `gemini-2.5-flash`

### Why Gemini is used here
- **Already integrated** in the backend services, so it fits the existing architecture.
- **Good for conversational help** with short answers, guidance, and summarization.
- **Simple Node.js integration** using the official SDK.

### Why `gemini-2.5-flash`
- Optimized for **fast responses** and **lower latency** compared to heavier models.
- A good fit for a UI assistant that should feel quick and responsive.

### Why not “just call the AI from the frontend”
The frontend never calls Gemini directly because:
- it would expose secrets (API keys)
- it would bypass access control
- it would risk leaking private data

So the server is the only allowed place to call the model.

### Could other models/providers work?
Yes — the architecture supports swapping the LLM provider, but you must preserve:
- server-only model calls
- strict token-based auth
- role-based, read-only context building
- strong out-of-scope fallback behavior

---

## 🧪 Troubleshooting

### “Gemini API not configured.”
- Backend is missing `GEMINI_API_KEY` in `SkillMatch-AI-Server/.env`.

### “Unauthorized: Missing Token” (401)
- Frontend didn’t attach the `Authorization` header.
- User isn’t logged in (no `getIdToken()` available).

### Slow responses / timeouts
- Frontend aborts requests after ~20 seconds.
- Consider shortening the prompt payload (smaller context, smaller knowledge base).

---

## 🛠️ How to improve answers safely

Recommended safe improvements:

1. Expand intent classifier keywords
   - Add more synonyms (e.g., “cv” → resume, “bookmark” → saved jobs).

2. Improve user context (still read‑only)
   - Add small summaries like “top 3 saved jobs” (still filtered by user).
   - Keep `projection` strict to avoid exposing sensitive info.

3. Improve knowledge base quality
   - Add more entries to `systemKnowledge.json`.
   - Keep content short, direct, and UI-oriented (what button/page to use).

4. Add stricter output enforcement (optional)
   - For example, post-process Gemini output to ensure it never includes links/actions not present in the app.


