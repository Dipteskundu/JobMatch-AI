Here is a **complete, practical, production-ready list of questions** your chatbot should support for both **candidates** and **recruiters**.
This list is designed so you can:

* build your **intent classifier**
* improve chatbot **response quality**
* ensure **full platform coverage**
* support **similar / rephrased questions**

---

# 🎯 1. Candidate Questions

## 🔹 A. Profile & Account

* How do I create my profile?
* How do I complete my profile?
* Is my profile complete?
* What is missing in my profile?
* How do I update my skills?
* How do I add experience or education?
* How do I upload my resume?
* How can I improve my profile?
* Why is my profile not getting matches?
* What should I improve first in my profile?

👉 Variations:

* complete profile steps
* profile not complete why
* improve profile tips

---

## 🔹 B. Job Application

* How do I apply for a job?
* Where can I apply for jobs?
* What happens after I apply?
* How do I check my application status?
* Show my recent applications
* How many jobs have I applied for?
* Why was my application not shortlisted?
* How do I increase my chances of getting selected?
* Can I edit my application?

👉 Variations:

* apply job process
* job apply steps
* check application status

---

## 🔹 C. Job Recommendations / Matching

* Why is this job recommended to me?
* How does job matching work?
* What is my match score?
* How can I improve my match score?
* Which jobs match my skills best?
* Show my matched jobs
* Why am I not getting good matches?
* Which skills are missing for better matches?

👉 Variations:

* job recommendation reason
* improve job match
* why low match score

---

## 🔹 D. Saved Jobs / Dashboard

* How do I save a job?
* Where can I see my saved jobs?
* Show my saved jobs
* Where is my dashboard?
* Where can I see my applications?
* Where can I find recommended jobs?

👉 Variations:

* saved job list
* dashboard location

---

## 🔹 E. Learning Plan / Skill Gap

* What is my learning plan?
* Why was this learning plan recommended?
* What skills should I improve?
* What are my skill gaps?
* Which courses are recommended for me?
* What should I learn first?
* How will this improve my job chances?
* What should I focus on next?

👉 Variations:

* learning plan explain
* skill gap meaning
* what to learn first

---

## 🔹 F. Workflow / Guidance

* What should I do after signing up?
* What should I do before applying for jobs?
* What should I do after applying?
* How can I get more job recommendations?
* What should I do to get shortlisted?
* What is the best way to use this platform?

👉 Variations:

* next step for me
* what should i do now

---

## 🔹 G. Navigation Help

* Where can I update my profile?
* Where can I apply for jobs?
* Where can I see my learning plan?
* Where can I find my matched jobs?

👉 (Bot should return links like `/jobs`, `/dashboard/profile`)

---

# 🎯 2. Recruiter Questions

## 🔹 A. Job Posting

* How do I create a job post?
* How do I post a job?
* Where can I create a job post?
* How do I edit a job post?
* How do I delete a job post? *(explain only)*
* How do I manage my job posts?

👉 Variations:

* create job steps
* post job process

---

## 🔹 B. Applicant Management

* How do I view applicants?
* Where can I see applicants for my job?
* Show applicants for my job
* How many applicants do I have?
* Which job has the most applicants?
* How do I review candidate profiles?
* How do I shortlist candidates? *(explain only)*

👉 Variations:

* applicant list
* candidate review process

---

## 🔹 C. Interview Scheduling

* How do I schedule an interview with a candidate?
* How do I manage interview schedules?
* How do I contact candidates?
* What is the interview workflow?

👉 Variations:

* schedule interview steps
* interview setup process

---

## 🔹 D. Candidate Matching

* Why is this candidate recommended?
* How does candidate matching work?
* Which candidates are best for my job?
* Show top matched candidates
* Why is one candidate ranked higher?

👉 Variations:

* best candidates for job
* candidate ranking reason

---

## 🔹 E. Job Performance / Analytics

* Which job post is performing best?
* Which job has the most applicants?
* How can I improve my job post?
* Why am I not getting enough applicants?

👉 Variations:

* improve job visibility
* low applicants reason

---

## 🔹 F. Recruiter Workflow

* What should I do after posting a job?
* What is the hiring workflow?
* What is the best way to review candidates?
* What should I do after receiving applications?

👉 Variations:

* recruiter next step
* hiring process guide

---

## 🔹 G. Dashboard / Navigation

* Where can I see my job posts?
* Where can I view applicants?
* Where can I manage interviews?
* Where can I update company details?

👉 (Bot should return links like `/recruiter/jobs`, `/recruiter/applicants`)

---

# 🎯 3. Shared Questions (Both Can Ask)

* How does this platform work?
* What features does this platform have?
* What should I do next?
* How can I improve my results?
* How does AI matching work?
* How can I use this platform effectively?

---

# ❌ 4. Questions the Bot Must NOT Answer

Your chatbot should reject these:

* Apply for a job for me
* Post a job for me
* Delete my application
* Approve/reject candidate automatically
* Show other users’ data
* Show all database records
* Run MongoDB queries
* Give admin secrets
* Any unrelated general knowledge

---

# 🧠 5. Important Implementation Insight

You don’t need to store ALL questions.

Instead group them into **intents** like:

```js
APPLY_JOB
CREATE_JOB
VIEW_APPLICATIONS
LEARNING_PLAN
MATCH_EXPLANATION
PROFILE_HELP
SCHEDULE_INTERVIEW
```

Then map:

* many question variations → one intent
* one intent → one response logic

---

# 🚀 Final Recommendation

For best results:

* Use **20–30 intents**
* Each intent supports **10–20 variations**
* Use **case-insensitive matching**
* Use **synonyms**

---

