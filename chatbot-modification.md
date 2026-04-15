Implement a secure, production-ready AI Help Chatbot feature in my existing application using JavaScript only (NO TypeScript), and ensure it fully satisfies all requirements below.

PROJECT STACK:
- Next.js frontend (JavaScript)
- Node.js + Express backend (JavaScript)
- MongoDB (Mongoose)
- Gemini API already integrated in backend
- JWT authentication already exists
- App has roles: candidate, recruiter (and optional admin)

CRITICAL GLOBAL RULES:
- Use JavaScript only (NO TypeScript)
- Do NOT change existing design, routing, business logic, or working features
- Do NOT refactor unrelated code
- Reuse existing JWT middleware, axios setup, and Gemini integration
- Only ADD chatbot feature safely and modularly
- Frontend must NEVER call Gemini directly
- Frontend must NEVER access database directly

====================================================
GOAL
====================================================
Build a modern AI chatbot that:
- feels natural and conversational (like a real support assistant)
- answers platform-related questions (features, workflows, data summaries)
- handles similar/rephrased questions (case-insensitive)
- reads ONLY the logged-in user’s data (read-only)
- provides helpful steps + **deep links** to relevant pages
- stores chat history per user (private)
- allows user to manually delete chat history
- NEVER performs actions (only guides)
- NEVER exposes other users’ data
- NEVER uses outside internet knowledge

====================================================
HOW THE CHATBOT WORKS (ARCHITECTURE)
====================================================
Flow:

User (Next.js UI)
→ sends message + JWT
→ Backend API: POST /api/chatbot/ask
→ verifyJWT middleware extracts req.user.id and req.user.role
→ Intent classification (case-insensitive, semantic)
→ Build SAFE read-only context from DB (only this user)
→ Hybrid answering:
   - simple structured questions → direct backend answer
   - explanations/guidance → Gemini with strict prompt + context
→ Sanitize response (block unsafe claims)
→ Save message + reply to chat history (user-specific)
→ Return response + optional links
→ Frontend renders response
→ If user clicks a link → navigate + minimize chatbot UI

====================================================
READ-ONLY DATABASE ACCESS (STRICT)
====================================================
- Use req.user.id from JWT
- Fetch ONLY allowed fields with .select() and limit()
- Example:

getCandidateContext(userId):
  - user profile summary
  - applications (limit 5)
  - matched jobs (limit 5)
  - learning plan summary

getRecruiterContext(userId):
  - job posts summary
  - applicant counts
  - top candidates summary

- NEVER include:
  - other users’ data
  - full collections
  - sensitive fields

- Convert DB data into SAFE SUMMARY before sending to Gemini

====================================================
INTENT MATCHING (VERY IMPORTANT)
====================================================
- Case-insensitive
- Normalize input: trim, lowercase, remove extra punctuation
- Use keyword groups + synonyms
- Accept similar/rephrased questions

Examples mapping to same intent:
- "how do i apply for a job"
- "apply job"
- "job apply process"
- "how can i apply"

All should map to APPLY_JOB intent.

====================================================
ALLOWED QUESTION CATEGORIES
====================================================
1. Platform feature help
2. Candidate workflow (apply job, profile, etc.)
3. Recruiter workflow (post job, schedule interview, etc.)
4. User’s own data (read-only summaries)
5. Learning plan / skill gap
6. Job matching explanation
7. Dashboard navigation
8. Next-step suggestions

Include recruiter-specific:
- How to create a job post
- How to schedule interview with candidate
- How to review applicants
- How to shortlist candidates (explain only)

====================================================
DEEP LINK RESPONSE FEATURE (IMPORTANT UX)
====================================================
When answering “how to do something”, chatbot must include relevant page link.

Example:
User: "How do I apply for a job?"

Response:
"You can apply for a job by visiting the job details page and clicking the Apply button.
👉 Go to Apply Jobs Page: /jobs"

IMPLEMENT:
- Maintain a mapping:
  {
    APPLY_JOB: "/jobs",
    CREATE_JOB: "/recruiter/post-job",
    VIEW_APPLICATIONS: "/dashboard/applications",
    LEARNING_PLAN: "/dashboard/learning-plan"
  }

Frontend behavior:
- Render link clickable
- On click:
  - navigate to page
  - automatically minimize chatbot UI

====================================================
CHAT HISTORY SYSTEM (IMPORTANT)
====================================================
- Create MongoDB collection: ChatHistory

Schema:
{
  userId: ObjectId,
  role: String,
  messages: [
    {
      sender: "user" | "bot",
      text: String,
      createdAt: Date
    }
  ],
  createdAt,
  updatedAt
}

RULES:
- Each user sees ONLY their own chat history
- Query: findOne({ userId })
- NEVER expose other users’ chats
- Save every message and reply
- Provide API to delete chat history manually:
  DELETE /api/chatbot/history
- Only delete when user requests
- Otherwise persist chat history

====================================================
FALLBACK RESPONSE (MANDATORY)
====================================================
If unknown or out-of-scope, ALWAYS return EXACTLY:

"Sorry, I do not have relevant information about that right now. I can help you with platform features, your data in this system, learning plans, and job matching guidance."

====================================================
ACTION REQUEST HANDLING
====================================================
If user asks:
- apply job
- post job
- schedule interview

Response MUST be:
"I can guide you through the steps, but I cannot perform actions directly. Here’s how you can do it..."

====================================================
SECURITY RULES
====================================================
- Read-only DB access only
- Role-based filtering
- No raw MongoDB queries from user input
- No outside knowledge
- No other users’ data
- Sanitize Gemini output:
  block phrases like:
  - "I updated"
  - "I deleted"
  - "I applied"

====================================================
FRONTEND REQUIREMENTS (Next.js)
====================================================
- Chat component (JavaScript)
- Features:
  - message list
  - input box
  - send button
  - loading state
  - clickable links
  - auto minimize on link click
- Store chat history in backend, not only local state
- Fetch history on load
- Add “Clear Chat” button

====================================================
BACKEND FILES TO GENERATE
====================================================
- routes/chatbot.routes.js
- controllers/chatbot.controller.js
- services/chatbot.service.js
- services/context.service.js
- services/classifier.service.js
- services/sanitizer.service.js
- models/ChatHistory.js
- utils/normalizeInput.js
- utils/linkMapper.js

====================================================
FRONTEND FILES
====================================================
- components/Chatbot.js
- services/chatbotApi.js
- UI logic for minimizing on link click

====================================================
GEMINI SYSTEM PROMPT
====================================================
- You are a platform assistant
- Answer naturally
- Use only provided context
- No external knowledge
- No actions
- Provide guidance + links
- Use fallback if unknown

====================================================
OUTPUT REQUIREMENT
====================================================
Generate:
- Full working backend code
- Full frontend code
- Chat history implementation
- Link mapping system
- Integration steps
- Folder structure
- Clear explanation where to place each file

====================================================
FINAL REQUIREMENTS
====================================================
- Chatbot must feel modern and helpful
- Must handle similar questions
- Must be case-insensitive
- Must include navigation links
- Must store private chat history per user
- Must be fully secure and read-only
- Must not break existing app