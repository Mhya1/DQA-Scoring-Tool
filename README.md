# DQA Scoring Tool

A structured, browser-based **Data Quality Assessment (DQA) Scoring Tool** for humanitarian and development programme staff. Built to mirror the DQA standards used by USAID, WFP, and PEPFAR — without needing Excel, internet access, or specialist software.

Built by **[Peetron Data Analytics](https://github.com/YOUR_USERNAME)** · Joshua Samuel Dauda

---

## What It Does

Field MEAL officers, M&E assistants, and programme managers can use this tool to:

- Run a structured DQA across **5 data quality dimensions**
- Answer **22 weighted indicator questions** with Yes / Partial / No responses
- Get an **automatic percentage score and traffic light rating** per dimension
- See **specific issues flagged** and **corrective action recommendations** generated automatically
- Export a **print-ready PDF report** to submit to donors, cluster leads, or programme management

---

## Data Quality Dimensions Covered

| Dimension | Questions | Focus |
|---|---|---|
| Completeness | 5 | Missing fields, beneficiary records, disaggregated data |
| Accuracy | 5 | Cross-checks, range validation, outlier review |
| Timeliness | 4 | Submission deadlines, reporting frequency |
| Consistency | 4 | Cross-form reconciliation, indicator definitions |
| Confidentiality & Security | 4 | Data storage, access control, staff training |

---

## Scoring Logic

Each question carries a **weight (1.0–2.0×)**. Critical indicators score higher.

- **Yes** = full weight
- **Partial** = 50% of weight
- **No** = 0

$$\text{Dimension Score} = \frac{\sum \text{earned weights}}{\sum \text{total weights}} \times 100$$

**Traffic Light Rating:**

| Score | Rating |
|---|---|
| 80–100% | 🟢 Adequate |
| 50–79% | 🟡 Needs Improvement |
| 0–49% | 🔴 Inadequate |

---

## Tech Stack

- **React** (functional components + hooks)
- **Vite** (build tool)
- **CSS-in-JS** (inline styles, no external CSS framework required)
- **Browser Print API** (PDF export — no backend needed)

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/dqa-scoring-tool.git
cd dqa-scoring-tool

# Install dependencies
npm install

# Run locally
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
dqa-scoring-tool/
├── src/
│   └── App.jsx        # Main tool — all logic, UI, and scoring
├── index.html
├── package.json
└── vite.config.js
```

---

## Use Cases

- TSFP / CMAM programme monitoring (WFP, UNICEF, Intersos)
- WASH, shelter, livelihoods programme DQA
- Pre-donor-report data quality checks
- Capacity building for field M&E staff
- Cluster-level data quality review sessions

---

## Alignment with International Standards

This tool is structured to reflect DQA frameworks from:

- **USAID** — Data Quality Assessment guidance (Routine Data Quality Assessment)
- **WFP** — M&E and data quality standards for nutrition programmes
- **PEPFAR** — Site Improvement through Monitoring Systems (SIMS) DQA principles
- **SPHERE** — Accountability to Affected Populations (AAP) data principles

---

## Roadmap

- [ ] Export report as downloadable PDF file (via jsPDF)
- [ ] KoBoToolbox API integration — auto-pull completeness and timeliness stats
- [ ] Multi-site comparison dashboard
- [ ] Offline-first PWA mode for field use without internet
- [ ] French and Hausa language support

---

## Author

**Joshua Samuel Dauda**  
Founder, Peetron Data Analytics | Data Scientist & MEAL Practitioner  
Maiduguri, Borno State, Nigeria  

[LinkedIn](https://linkedin.com/in/YOUR_PROFILE) · [GitHub](https://github.com/YOUR_USERNAME)

---

## License

MIT License — free to use, adapt, and deploy for humanitarian and development purposes.
