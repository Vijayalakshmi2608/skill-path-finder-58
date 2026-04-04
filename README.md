# 🎯 SkillScan
### *Know your gap. Close it fast.*

> An AI-powered career intelligence platform that tells students **exactly** what stands between them and their dream job — and gives them everything they need to close it in 30 days.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-SkillScan-FF6B6B?style=for-the-badge)](https://skill-path-finder-58.lovable.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Vijayalakshmi2608-181717?style=for-the-badge&logo=github)](https://github.com/Vijayalakshmi2608)
[![Track](https://img.shields.io/badge/Track-Education_/_EdTech-00D4AA?style=for-the-badge)]()
[![AI](https://img.shields.io/badge/Powered_by-Gemini_AI-4285F4?style=for-the-badge&logo=google)]()


---

## 🚨 The Problem

| Statistic | Reality |
|-----------|---------|
| **75%** of graduates | Apply to jobs without knowing their skill gaps |
| **1 in 3** students | Get rejected due to missing keywords on resume |
| **68%** never find out | Why they were rejected |
| **47%** of engineers | Not job-ready at graduation (NASSCOM) |
| **₹0** spent | On understanding what employers actually want |

Students graduate with degrees but zero clarity on what employers need right now. They apply to 100 jobs, get rejected from 97, and never find out why.

> *The gap between a student and their dream job is not talent. It's information.*

---

## 💡 Solution

SkillScan is a **fully deployed AI career intelligence platform** with 7 powerful features — from resume scanning to AI mock interviews to salary intelligence — giving students everything they need to go from graduate to hired.

```
Upload Resume
      ↓
AI Resume Score (0–100) + Exact Fix Suggestions
      ↓
Select Dream Role
      ↓
AI Career Gap Analysis (Market vs Student Skills)
      ↓
Gap Score + Priority Skill Ranking
      ↓
30-Day Personalized Skill Roadmap
      ↓
AI Mock Interview + Salary Intelligence
      ↓
LinkedIn Profile Optimized
      ↓
Paste Any Job Description → Match Score
      ↓
Apply with Confidence ✅ Get Hired
```

---

## ✨ Features — All 7

| Feature | Description |
|---------|-------------|
| 📄 **Resume Scanner** | AI scores resume 0–100, flags weak sections, gives exact rewrite suggestions |
| 🔍 **AI Career Gap Analyzer** | Compares student skills vs real market demand for any target role |
| 🗺️ **Skill Roadmap Generator** | Auto-generates personalized 30-day learning plan with daily tasks + resources |
| 🎯 **Job Match Score** | Paste any JD → instant match % → green (have it) vs red (missing) skills |
| 🎤 **AI Interview Simulator** | Live AI mock interview → scored across 3 dimensions → detailed feedback |
| 💰 **Salary Intelligence Engine** | Current vs projected salary → skill-by-skill salary impact → negotiation script |
| 🔗 **LinkedIn Profile Analyzer** | AI scores every LinkedIn section → exact rewrites → keyword density analysis |

---

## 🛠️ Tech Stack

```
Frontend          React 18 + TypeScript
Styling           Tailwind CSS + Framer Motion
Charts            Recharts
AI Engine         Google Gemini Flash
Backend           Supabase (PostgreSQL + Realtime)
Auth              Supabase Auth + Row Level Security
PDF Parsing       Browser File API + Gemini Vision
Voice Input       Web Speech API (browser-native)
Deployment        Lovable Cloud (Netlify CDN)
Version Control   GitHub
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              FRONTEND LAYER                 │
│   React 18 · TypeScript · Tailwind CSS      │
│   Framer Motion · Recharts                  │
│   Web Speech API (voice interview)          │
│         Deployed: Lovable + Netlify         │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│            AI INTELLIGENCE LAYER            │
│         Google Gemini Flash API             │
│  • Resume weakness detection                │
│  • Skill gap classification                 │
│  • Priority ranking by hiring demand        │
│  • 30-day roadmap generation                │
│  • JD skill extraction + match scoring      │
│  • Interview question generation            │
│  • Answer evaluation (3 dimensions)         │
│  • Salary range calculation per skill       │
│  • LinkedIn section scoring + rewrites      │
│  • Rejection pattern analysis               │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│               DATA LAYER                    │
│         Supabase (PostgreSQL)               │
│  • Student skill profiles                   │
│  • Resume scan history                      │
│  • Roadmap progress tracking                │
│  • Interview session history                │
│  • Salary intelligence cache               │
│  • LinkedIn analysis history               │
│  • Job match score history                  │
└─────────────────────────────────────────────┘
```

---

## 📄 Feature 1 — Resume Scanner

SkillScan's Resume Scanner gives students a brutally honest score with actionable fixes:

```
Resume Score Breakdown:

Action Verbs          ████░░  60%  → Use stronger verbs
Quantified Results    ██░░░░  35%  → Add metrics
Keyword Density       ████░░  65%  → Missing role keywords
Formatting            █████░  80%  → Good structure
Skills Section        ███░░░  55%  → Too generic

Overall Score: 61/100 🟡 Needs Work

Top Fix: Change "worked on projects" to
"led 3-person team delivering X% improvement"
```

---

## 🔍 Feature 2 — Career Gap Analyzer

The core engine of SkillScan — compares student profile against real market requirements:

```
Target Role: Data Scientist

Your Readiness: 43/100 🔴

Missing Skills (Priority Order):
1. 🔴 Machine Learning    — Not started    (HIGH priority)
2. 🔴 SQL Advanced        — Not started    (HIGH priority)
3. 🟡 Python Libraries    — Basic only     (MED priority)
4. 🟡 Data Visualization  — Partial        (MED priority)
5. 🟢 Communication       — Strong         (✅ You have this)

Learn in this order for fastest hiring impact:
SQL → Pandas → Matplotlib → ML Basics → Projects
```

---

## 🗺️ Feature 3 — Skill Roadmap Generator

Auto-generated personalized learning plan based on gap analysis:

```
YOUR 30-DAY DATA SCIENTIST ROADMAP

Week 1–2: SQL Fundamentals
  Daily: 1.5 hours
  Resource: Mode Analytics SQL Tutorial
  Goal: Write complex JOIN queries confidently

Week 3: Pandas & NumPy
  Daily: 1.5 hours
  Resource: Kaggle Python Course (free)
  Goal: Clean and analyze a real dataset

Week 4: First Portfolio Project
  Daily: 2 hours
  Goal: End-to-end analysis on Kaggle dataset
  Output: GitHub repo + LinkedIn post

Estimated job-ready date: 34 days 🎯
Gap score improvement: 43% → 71%
```

---

## 🎯 Feature 4 — Job Match Score

Paste any job description — get instant match intelligence:

```
Job: Senior Data Analyst @ TechCorp
Source: LinkedIn Job Posting

Your Match Score: 67% 🟡

✅ Skills You Have (Apply These in Cover Letter):
  • Python (Basic)
  • Excel Advanced
  • Communication
  • Problem Solving

❌ Skills Standing Between You and This Job:
  • SQL Advanced    → Add to roadmap (2 weeks)
  • Tableau         → Add to roadmap (1 week)
  • Statistics      → Add to roadmap (1 week)

Recommendation:
Close these 3 gaps first → reapply in 4 weeks
Projected match after roadmap: 89% ✅
```

---

## 🎤 Feature 5 — AI Interview Simulator

Live AI mock interview with real-time scoring and detailed feedback:

```
Interview Setup:
  Role: Data Scientist
  Level: Fresher
  Type: Mixed (Technical + HR)
  Questions: 8 per session
  Time: 2 minutes per answer

Live Evaluation per Answer:
  Relevance     ████████░░ 8.0/10
  Clarity       ███████░░░ 7.0/10
  Technical     █████████░ 9.0/10
  Overall       ████████░░ 8.0/10

Keywords Detected:  ✅ supervised learning
                    ✅ training data
                    ✅ classification

Keywords Missed:    ❌ overfitting
                    ❌ cross-validation

Post-Interview Report:
  Overall Score: 74/100 🟡 Good
  Strongest: Q8 — Project Discussion (8.9/10)
  Weakest:   Q4 — System Design (4.2/10)
  Top 3 improvements flagged
  Sample ideal answers provided
```

**How It Works:**
- Student selects role, level, and interview type
- Gemini AI generates 8 realistic interview questions
- Student answers by typing or speaking (Web Speech API)
- AI evaluates each answer across 3 dimensions
- Full report generated with improvement roadmap

---

## 💰 Feature 6 — Salary Intelligence Engine

Know exactly what your skills are worth — and what closing gaps will earn you:

```
Current Market Value (based on skill profile):
  ₹3.2 – ₹4.8 LPA
  Percentile: Top 34% of freshers

After 30-Day Roadmap Completion:
  ₹6.5 – ₹9.2 LPA ✨
  Increase: +₹2.8 LPA minimum
  ROI: 87% salary jump in 30 days

Skill-by-Skill Salary Impact:
  Machine Learning   → +₹2.1 LPA 🔴 Missing
  SQL Advanced       → +₹1.2 LPA 🔴 Missing
  Tableau            → +₹0.8 LPA 🔴 Missing
  Python Advanced    → +₹0.8 LPA 🟡 Partial
  Communication      → +₹0.4 LPA ✅ Have it

City-wise Comparison (Data Scientist):
  Bangalore  → ₹8.5 LPA avg (2,847 openings)
  Mumbai     → ₹7.8 LPA avg (1,923 openings)
  Hyderabad  → ₹7.2 LPA avg (1,654 openings)
  Chennai    → ₹6.2 LPA avg (987 openings)

AI Negotiation Script: Generated per student
based on their skills, market data, and target
```

---

## 🔗 Feature 7 — LinkedIn Profile Analyzer

AI scores every LinkedIn section and gives exact rewrites:

```
LinkedIn Profile Score: 58/100 🟡 Needs Work

Section Scores:
  📝 Headline         6/10  ⚠️ Weak
  📖 About Section    5/10  ❌ Poor
  💼 Experience       7/10  ✅ Good
  🛠️ Skills Listed    4/10  ❌ Poor
  🎓 Education        8/10  ✅ Good
  🏆 Achievements     3/10  ❌ Missing

Recruiter Click Probability: 38% → 81% after fixes

Keyword Analysis:
  Present: ✅ Python · ✅ Data Analysis
  Missing: ❌ Machine Learning · ❌ SQL
           ❌ Data Science · ❌ Statistics

Time to 80+ score: ~2 hours
Recruiter visibility increase: +340%

AI generates:
  • Rewritten headline
  • Rewritten About section
  • Missing skills list
  • Priority fix checklist
```

---

## 🔬 Gap Score Algorithm

```
Career Readiness Score = Weighted Skill Match

For each required skill in target role:
  if student has skill at STRONG level  → full points
  if student has skill at PARTIAL level → half points
  if student has skill at NONE level    → zero points

Gap Score = (Points Earned / Total Points) × 100

Priority Ranking = Hiring Frequency × Skill Weight
  (Skills in 80%+ of JDs  = HIGH priority)
  (Skills in 40–80% of JDs = MED priority)
  (Skills in <40% of JDs   = LOW priority)

Readiness Zones:
  0–30%   🔴 Not Ready — close gaps first
  31–60%  🟠 Getting There — targeted learning needed
  61–80%  🟡 Almost Ready — polish and apply selectively
  81–100% 🟢 Job Ready — apply with confidence
```

---

## 🚀 Getting Started

### Prerequisites

```bash
node >= 18.0.0
npm >= 9.0.0
```

### Installation

```bash
# Clone the repository
git clone https://github.com/Vijayalakshmi2608/skillscan.git

# Navigate into project
cd skillscan

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
skillscan/
├── src/
│   ├── components/
│   │   ├── resume/               # Resume upload + scoring
│   │   ├── gap-analyzer/         # Career gap analysis
│   │   ├── roadmap/              # 30-day roadmap generator
│   │   ├── job-match/            # JD paste + match score
│   │   ├── interview-simulator/  # AI mock interview
│   │   ├── salary-intelligence/  # Salary engine + negotiation
│   │   ├── linkedin-analyzer/    # LinkedIn profile scoring
│   │   └── dashboard/            # Student progress overview
│   ├── pages/                    # Route-level pages
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Supabase + Gemini config
│   ├── types/                    # TypeScript interfaces
│   └── utils/                    # Gap scoring algorithm
├── supabase/
│   └── migrations/               # Database schema
├── public/
└── README.md
```

---

## 💰 Cost & Revenue Model

### Monthly Infrastructure Cost

| Scale | Users | Cost/month |
|-------|-------|------------|
| MVP | 0 – 500 | ₹0 |
| Growth | 500 – 5K | ~₹2,500 |
| Scale | 5K – 50K | ~₹12,000 |

### Revenue Model
- **Students** — Free (3 scans/month)
- **Students Premium** — ₹499/month (unlimited)
- **College Placement Cells** — ₹500/student/year
- **Gross margin at scale** — 91%

### Impact Calculation
```
India: 8M engineering graduates/year
1% adoption = 80,000 students helped
30% hiring improvement = 24,000 extra hires
Every hire = one family changed
```

---


## 🔮 Roadmap

### Phase 1 — Current MVP ✅
- [x] Resume Scanner + AI scoring
- [x] AI Career Gap Analyzer
- [x] 30-Day Skill Roadmap Generator
- [x] Job Match Score
- [x] AI Interview Simulator
- [x] Salary Intelligence Engine
- [x] LinkedIn Profile Analyzer

### Phase 2 — 3 Months
- [ ] Smart Application Tracker + rejection patterns
- [ ] Certification Recommender
- [ ] College placement dashboard
- [ ] WhatsApp skill check bot
- [ ] Mobile app (React Native)

### Phase 3 — 6–12 Months
- [ ] 500K student skill dataset
- [ ] Salary predictor per skill combination
- [ ] Industry partner integrations
- [ ] API for placement cells
- [ ] Corporate hiring intelligence product

---

## 📚 Research Backing

- **NASSCOM** — 47% of Indian engineering graduates not job-ready
- **LinkedIn Talent Trends** — Skills gaps are #1 hiring barrier globally
- **McKinsey** — 87% of companies report skill gaps in new hires
- **World Economic Forum** — 50% of all employees need reskilling by 2025

---

## 👩‍💻 Developer

**Vijayalakshmi S**
- GitHub: [@Vijayalakshmi2608](https://github.com/Vijayalakshmi2608)
- Devpost: [24cse179](https://devpost.com/24cse179)
- Live App: [skill-path-finder-58.lovable.app](https://skill-path-finder-58.lovable.app/)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- [Google Gemini](https://deepmind.google/technologies/gemini/) — AI intelligence layer
- [Supabase](https://supabase.com) — Backend and database
- [Lovable.dev](https://lovable.dev) — Rapid full-stack development
- [NASSCOM](https://nasscom.in) — Skills gap research data

---

<div align="center">

**The gap between a student and their dream job**
**is not talent. It's information.**

**SkillScan closes that gap.**

⭐ Star this repo if SkillScan inspires you to build for student careers!

</div>
