# 🎥 Jitsi Interviews — Scheduling, Links, and Joining (How It Works)

This document explains how **SkillMatch AI** schedules and manages video interviews using **Jitsi Meet**, how meeting links are generated, how both recruiter and candidate join the **same room**, and why Jitsi is used in this project.

---

## 📍 Quick Navigation

- [🎯 What this feature does](#-what-this-feature-does)
- [🧠 Why Jitsi (vs Zoom / Google Meet)](#-why-jitsi-vs-zoom--google-meet)
- [🔗 Meeting link format (room generation)](#-meeting-link-format-room-generation)
- [🧑‍💼 Recruiter flow: schedule → manage → join](#-recruiter-flow-schedule--manage--join)
- [🧑‍🎓 Candidate flow: view → join](#-candidate-flow-view--join)
- [🔌 APIs used (backend)](#-apis-used-backend)
- [🗂️ Interview data model (MongoDB)](#-interview-data-model-mongodb)
- [🔐 Security rules](#-security-rules)
- [🧩 Optional: embedded Jitsi component](#-optional-embedded-jitsi-component)
- [🧪 Troubleshooting](#-troubleshooting)

---

## 🎯 What this feature does

SkillMatch AI supports a complete interview workflow:
- Recruiter schedules an interview for a candidate
- Backend creates a **single Jitsi room** and **single meeting link**
- Interview is stored in MongoDB (`interviews`)
- Candidate and recruiter both see the interview in their dashboards
- Both users join the **same meeting link** when it’s time

---

## 🧠 Why Jitsi (vs Zoom / Google Meet)

Jitsi is used here because it fits the project goals and stack:

### ✅ Why it’s a good fit
- **Fast link-based meetings**: generate a room name → share link → join.
- **No OAuth setup required**: unlike Zoom/Google Meet integrations which often require app registration and OAuth.
- **Embeddable option**: Jitsi offers an External API script if you want a dedicated in-app meeting page later.
- **Good for prototyping and MVP**: minimal backend complexity.

### ⚠️ Tradeoffs to understand
- If you use the public hosted server (`meet.jit.si`), you depend on an external service.
- Advanced enterprise needs (recording control, analytics, strict hosting) may require a **self-hosted Jitsi** setup or a managed provider.

---

## 🔗 Meeting link format (room generation)

For video interviews, the backend generates a unique room name and builds a link like:

```text
https://meet.jit.si/<roomName>
```

### How room names are generated
Backend utility (see `SkillMatch-AI-Server/controllers/interviews.controller.js`) creates:
- `skillmatch-<jobId>-<applicationId>-<timestamp>-<random>`

This makes collisions extremely unlikely and prevents “guessable” room names.

### Where the link is stored
Interview documents may include:
- `meetingRoomName` (recommended canonical room identifier)
- `meetingLink` / `meetingUrl` (legacy compatibility fields)
- `meetingProvider: "jitsi"` when `type === "video"`

---

## 🧑‍💼 Recruiter flow: schedule → manage → join

### 1) Schedule interview
UI entry points:
- Recruiter pipeline pages (commonly **Shortlisted** stage)

Frontend component:
- `SkillMatch-AI/src/app/components/InterviewScheduler/InterviewScheduler.jsx`

When recruiter submits the form:
- Frontend calls: `POST /api/interviews/schedule`
- Payload includes: date, time, duration, timezone, notes, instructions, candidate IDs, job info.

Backend behavior (high-level):
1. Verifies JWT (Firebase ID token) via middleware.
2. Enforces recruiter access (`requireRecruiter`).
3. Validates required fields (candidate ID + schedule date/time).
4. If `applicationId` is present:
   - validates the recruiter owns the job/application
   - validates stage is schedulable (`shortlisted` or `interview_selected`)
   - prevents duplicate active interviews for the same application
5. Creates interview record and inserts into MongoDB.
6. Updates related application status to **`interviewing`**.
7. Creates notifications (MongoDB + Firebase push, best-effort).

### 2) Manage scheduled interviews
Recruiter list page:
- `SkillMatch-AI/src/app/(dashboard)/interviews/page.jsx`

Capabilities:
- List interviews
- Join interview
- Update status (scheduled/completed/cancelled) via status endpoints (where enabled)

### 3) Join interview
Recruiter can join from the interview list or the join route:
- Route: `/interviews/[interviewId]/join`

Join page behavior:
1. Fetches interview using `GET /api/interviews/:id` with recruiter token.
2. Verifies recruiter owns the interview.
3. Redirects to the meeting link (`meet.jit.si/...`).

---

## 🧑‍🎓 Candidate flow: view → join

### 1) View interviews
Candidate interviews page:
- `SkillMatch-AI/src/app/(dashboard)/my-interviews/page.jsx`

This page:
- calls `GET /api/interviews/candidate`
- shows interview cards (company, job title, date/time, notes)

### 2) Join interview
Candidate join route:
- `/my-interviews/[interviewId]/join`

Join behavior:
1. Fetches the interview with `GET /api/interviews/:id` using the candidate’s token.
2. Verifies `interview.applicantId === user.uid`.
3. Redirects to the stored meeting link.

Result: candidate and recruiter land in the **same Jitsi room**.

---

## 🔌 APIs used (backend)

Router:
- `SkillMatch-AI-Server/routes/interviews.routes.js`

Key endpoints:

### Create / schedule
- `POST /api/interviews/schedule` (recruiter)

### Lists
- `GET /api/interviews/recruiter` (recruiter)
- `GET /api/interviews/candidate` (candidate)

### Single interview (used by join pages)
- `GET /api/interviews/:id`

### Status / updates (recruiter)
- `PUT /api/interviews/:id/status` (legacy)
- `PATCH /api/interviews/:id/cancel`
- `PATCH /api/interviews/:id/complete`
- `PATCH /api/interviews/:id/start`

---

## 🗂️ Interview data model (MongoDB)

Collection: `interviews`

Common fields:
- `jobId`, `applicationId`
- `applicantId` (candidate firebase uid), `recruiterId` (recruiter firebase uid)
- `company`, `jobTitle`, `interviewTitle`
- `type`: `"video" | "phone" | "in-person"`
- `scheduledDateTime`, `date`, `time`, `timezone`, `durationMinutes`
- `notes`, `recruiterInstructions`, `candidateInstructions`
- `meetingProvider`, `meetingRoomName`, `meetingLink`/`meetingUrl`
- `status`: `"scheduled" | "live" | "completed" | "cancelled" | "rescheduled" | ...`

Reference file:
- `SkillMatch-AI-Server/models/Interview.js` (schema reference / documentation)

---

## 🔐 Security rules

Security is enforced at two layers:

### ✅ 1) Backend authorization
- `verifyToken` (Firebase ID token verification) for all `/api/interviews/*`
- `requireRecruiter` for recruiter-only operations
- Ownership checks:
  - recruiters can only access interviews they created/own
  - candidates can only access interviews where `applicantId === uid`

### ✅ 2) Frontend join protection
The join pages fetch interview details first and show an “Unauthorized” error if the user does not own the interview.

---

## 🧩 Optional: embedded Jitsi component

There is a reusable Jitsi embed component:
- `SkillMatch-AI/src/app/components/JitsiMeeting/JitsiMeeting.jsx`

It uses:
- `https://meet.jit.si/external_api.js`
- `window.JitsiMeetExternalAPI`

If you want a “full interview workspace” page inside the app (instead of redirecting to `meet.jit.si`), you can render `JitsiMeeting` and pass:
- `roomName`
- `displayName`
- `email`

This gives you a dedicated UI surface while still using Jitsi as the meeting provider.

---

## 🧪 Troubleshooting

### Join button does nothing
Check the interview has one of:
- `meetingLink`
- `meetingUrl`
- `meetingRoomName`

### Unauthorized join error
- Candidate is trying to open another candidate’s interview
- Recruiter is trying to open an interview not owned by them

### Meeting opens but room is wrong
Ensure both sides are using the same interview record (same `interviewId`) and the backend generated `meetingRoomName` once.


