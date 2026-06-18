import { useState, useRef } from "react";

const DIMENSIONS = [
  {
    id: "completeness",
    label: "Completeness",
    icon: "◉",
    color: "#1B6CA8",
    description: "Are all required data fields filled with no missing values?",
    questions: [
      { id: "c1", text: "All required fields in data collection forms are filled (no blanks or N/A without justification)", weight: 2 },
      { id: "c2", text: "All enrolled beneficiaries have a corresponding record in the register", weight: 2 },
      { id: "c3", text: "Monthly summary reports account for 100% of expected submissions from all sites/units", weight: 2 },
      { id: "c4", text: "Disaggregated data (sex, age, location) is consistently captured across all records", weight: 1.5 },
      { id: "c5", text: "Historical data for the current reporting period is available and accessible", weight: 1 },
    ],
  },
  {
    id: "accuracy",
    label: "Accuracy",
    icon: "◎",
    color: "#16A085",
    description: "Do values reflect reality and fall within valid, expected ranges?",
    questions: [
      { id: "a1", text: "A sample cross-check of field data against source documents shows ≤5% discrepancy", weight: 2 },
      { id: "a2", text: "Numeric values (e.g. MUAC, weight, quantities) are within plausible biological/operational ranges", weight: 2 },
      { id: "a3", text: "Data entry has been verified by a second staff member or supervisor", weight: 1.5 },
      { id: "a4", text: "Outliers have been identified, reviewed, and documented", weight: 1.5 },
      { id: "a5", text: "Calculation formulas/totals in aggregated reports are verified correct", weight: 1 },
    ],
  },
  {
    id: "timeliness",
    label: "Timeliness",
    icon: "◷",
    color: "#8E44AD",
    description: "Was data collected, submitted, and reported within required timeframes?",
    questions: [
      { id: "t1", text: "Field data is submitted to the programme office within the required reporting window", weight: 2 },
      { id: "t2", text: "Monthly programme reports are submitted to donors/clusters on or before the deadline", weight: 2 },
      { id: "t3", text: "Data collection visits occur at the scheduled frequency (weekly/monthly)", weight: 1.5 },
      { id: "t4", text: "There is a documented system for tracking submission status and follow-up on late reports", weight: 1 },
    ],
  },
  {
    id: "consistency",
    label: "Consistency",
    icon: "⊟",
    color: "#D35400",
    description: "Do totals and figures align across all forms, registers, and reports?",
    questions: [
      { id: "co1", text: "Totals in summary reports match the sum of individual site/unit registers", weight: 2 },
      { id: "co2", text: "The same indicator is defined and measured the same way across all sites", weight: 2 },
      { id: "co3", text: "Data reported in different formats (paper form vs. digital) for the same period match", weight: 2 },
      { id: "co4", text: "Figures reported to different stakeholders (donor, cluster, internal) are identical", weight: 1.5 },
    ],
  },
  {
    id: "security",
    label: "Confidentiality & Security",
    icon: "◈",
    color: "#C0392B",
    description: "Is beneficiary data protected, stored safely, and shared appropriately?",
    questions: [
      { id: "s1", text: "Physical registers are stored in a locked cabinet accessible only to authorized staff", weight: 2 },
      { id: "s2", text: "Digital data is password-protected and backed up regularly", weight: 2 },
      { id: "s3", text: "Beneficiary personal information is not shared with unauthorized third parties", weight: 2 },
      { id: "s4", text: "Staff have been trained on data protection protocols and informed consent procedures", weight: 1.5 },
    ],
  },
];

const RECOMMENDATIONS = {
  completeness: [
    "Enforce mandatory fields in KoBoToolbox/ODK forms to prevent blank submissions.",
    "Conduct weekly completeness checks at field level before data submission.",
    "Introduce a reporting checklist for field officers to self-verify before submission.",
  ],
  accuracy: [
    "Implement peer verification: a second staff member reviews 10% of records randomly.",
    "Set range validation rules in digital forms (e.g. MUAC: 6.5–20 cm).",
    "Train enumerators on correct measurement techniques and data entry standards.",
  ],
  timeliness: [
    "Set automated submission reminders via SMS/WhatsApp for field officers.",
    "Establish a submission tracking register with escalation to supervisors for delays.",
    "Reduce reporting periods if weekly deadlines are consistently missed.",
  ],
  consistency: [
    "Develop a programme-wide indicator reference guide with standard definitions.",
    "Conduct quarterly data reconciliation sessions across field sites.",
    "Use a single master template for all data reporting to prevent version confusion.",
  ],
  security: [
    "Audit who has access to physical registers and digital platforms quarterly.",
    "Enable two-factor authentication on all digital data platforms (KoBoToolbox, DHIS2).",
    "Conduct a data protection refresher training for all programme staff.",
  ],
};

function getRating(score) {
  if (score >= 80) return { label: "Adequate", color: "#16A085", bg: "#E8F8F5", dot: "🟢" };
  if (score >= 50) return { label: "Needs Improvement", color: "#D35400", bg: "#FEF9E7", dot: "🟡" };
  return { label: "Inadequate", color: "#C0392B", bg: "#FDEDEC", dot: "🔴" };
}

function scorePercent(answers, questions) {
  let total = 0, earned = 0;
  questions.forEach((q) => {
    total += q.weight;
    if (answers[q.id] === "yes") earned += q.weight;
    else if (answers[q.id] === "partial") earned += q.weight * 0.5;
  });
  return total === 0 ? 0 : Math.round((earned / total) * 100);
}

export default function DQATool() {
  const [step, setStep] = useState("meta"); // meta | assess | results
  const [meta, setMeta] = useState({ programme: "", organisation: "", assessor: "", date: "", location: "", period: "" });
  const [activeTab, setActiveTab] = useState(0);
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState({});
  const printRef = useRef();

  const handleMeta = (k, v) => setMeta((m) => ({ ...m, [k]: v }));
  const handleAnswer = (qid, val) => setAnswers((a) => ({ ...a, [qid]: val }));
  const handleNote = (did, val) => setNotes((n) => ({ ...n, [did]: val }));

  const dimScores = DIMENSIONS.map((d) => ({
    ...d,
    score: scorePercent(answers, d.questions),
  }));

  const overallScore = Math.round(dimScores.reduce((s, d) => s + d.score, 0) / DIMENSIONS.length);
  const overallRating = getRating(overallScore);

  const answeredAll = DIMENSIONS.every((d) => d.questions.every((q) => answers[q.id]));

  const handlePrint = () => {
    window.print();
  };

  if (step === "meta") {
    return (
      <div style={{ minHeight: "100vh", background: "#F0F4F8", fontFamily: "'Inter', system-ui, sans-serif", padding: "0" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
          * { box-sizing: border-box; }
          input, select, textarea { font-family: inherit; }
          .meta-input { width:100%; padding:10px 14px; border:1.5px solid #CBD5E0; border-radius:8px; font-size:14px; background:#fff; transition:border-color 0.2s; outline:none; }
          .meta-input:focus { border-color:#1B6CA8; }
          .btn-primary { background:#1B6CA8; color:#fff; border:none; border-radius:10px; padding:14px 32px; font-size:15px; font-weight:600; cursor:pointer; transition:background 0.2s; }
          .btn-primary:hover { background:#155A8A; }
          .btn-primary:disabled { background:#A0AEC0; cursor:not-allowed; }
        `}</style>

        <div style={{ background: "#1B6CA8", padding: "32px 24px 48px", textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#90CDF4", textTransform: "uppercase", marginBottom: 12 }}>Peetron Data Analytics</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>Data Quality Assessment</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "#90CDF4", lineHeight: 1.2 }}>Scoring Tool</div>
          <div style={{ marginTop: 12, fontSize: 13, color: "#BEE3F8", maxWidth: 400, margin: "12px auto 0" }}>
            Structured DQA for humanitarian & development programmes — aligned with USAID, WFP, and PEPFAR standards.
          </div>
        </div>

        <div style={{ maxWidth: 560, margin: "-24px auto 0", background: "#fff", borderRadius: 16, padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1B6CA8", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1 }}>Assessment Details</div>

          {[
            { k: "programme", label: "Programme / Project Name", placeholder: "e.g. TSFP Borno State 2025" },
            { k: "organisation", label: "Implementing Organisation", placeholder: "e.g. Intersos / WFP" },
            { k: "assessor", label: "Assessor Name", placeholder: "Your full name" },
            { k: "location", label: "Location / LGA", placeholder: "e.g. Bama LGA, Borno State" },
            { k: "period", label: "Reporting Period Assessed", placeholder: "e.g. January – March 2025" },
            { k: "date", label: "Assessment Date", placeholder: "", type: "date" },
          ].map(({ k, label, placeholder, type }) => (
            <div key={k} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#4A5568", marginBottom: 6 }}>{label}</label>
              <input
                className="meta-input"
                type={type || "text"}
                placeholder={placeholder}
                value={meta[k]}
                onChange={(e) => handleMeta(k, e.target.value)}
              />
            </div>
          ))}

          <button
            className="btn-primary"
            style={{ width: "100%", marginTop: 8 }}
            disabled={!meta.programme || !meta.assessor || !meta.date}
            onClick={() => setStep("assess")}
          >
            Start Assessment →
          </button>
          <div style={{ fontSize: 11, color: "#A0AEC0", textAlign: "center", marginTop: 10 }}>Programme name, assessor, and date are required</div>
        </div>

        <div style={{ textAlign: "center", padding: "24px", fontSize: 11, color: "#A0AEC0" }}>
          Covers 5 dimensions · 22 weighted indicators · Generates PDF-ready report
        </div>
      </div>
    );
  }

  if (step === "assess") {
    const dim = DIMENSIONS[activeTab];
    const dimScore = scorePercent(answers, dim.questions);
    const dimRating = getRating(dimScore);
    const answered = dim.questions.filter((q) => answers[q.id]).length;

    return (
      <div style={{ minHeight: "100vh", background: "#F0F4F8", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
          * { box-sizing: border-box; }
          .tab { padding:10px 14px; border:none; background:transparent; cursor:pointer; font-size:12px; font-weight:600; color:#718096; border-bottom:2px solid transparent; transition:all 0.2s; white-space:nowrap; }
          .tab.active { color:#1B6CA8; border-bottom-color:#1B6CA8; }
          .answer-btn { flex:1; padding:9px 6px; border:1.5px solid #CBD5E0; background:#fff; border-radius:8px; cursor:pointer; font-size:12px; font-weight:600; color:#718096; transition:all 0.15s; text-align:center; }
          .answer-btn.yes.sel { background:#E8F8F5; border-color:#16A085; color:#16A085; }
          .answer-btn.partial.sel { background:#FEF9E7; border-color:#D35400; color:#D35400; }
          .answer-btn.no.sel { background:#FDEDEC; border-color:#C0392B; color:#C0392B; }
          .answer-btn:hover { border-color:#1B6CA8; }
          .btn-nav { padding:12px 24px; border:none; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; transition:background 0.2s; }
          textarea { font-family:inherit; width:100%; padding:10px 12px; border:1.5px solid #CBD5E0; border-radius:8px; font-size:13px; resize:vertical; outline:none; }
          textarea:focus { border-color:#1B6CA8; }
        `}</style>

        {/* Header */}
        <div style={{ background: "#1B6CA8", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff" }}>DQA Assessment</div>
            <div style={{ fontSize: 11, color: "#90CDF4" }}>{meta.programme}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#BEE3F8" }}>Overall Progress</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
              {Object.keys(answers).length}/{DIMENSIONS.reduce((s, d) => s + d.questions.length, 0)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", overflowX: "auto" }}>
          <div style={{ display: "flex", minWidth: "max-content", padding: "0 8px" }}>
            {DIMENSIONS.map((d, i) => (
              <button key={d.id} className={`tab ${activeTab === i ? "active" : ""}`} onClick={() => setActiveTab(i)}>
                {d.icon} {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dimension Content */}
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px" }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "20px", marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: dim.color }}>{dim.label}</div>
                <div style={{ fontSize: 12, color: "#718096", marginTop: 4 }}>{dim.description}</div>
              </div>
              {answered > 0 && (
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: dimRating.color }}>{dimScore}%</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: dimRating.color }}>{dimRating.dot} {dimRating.label}</div>
                </div>
              )}
            </div>
            <div style={{ fontSize: 11, color: "#A0AEC0" }}>{answered}/{dim.questions.length} questions answered</div>
          </div>

          {dim.questions.map((q, qi) => (
            <div key={q.id} style={{ background: "#fff", borderRadius: 12, padding: "16px", marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `3px solid ${answers[q.id] ? dim.color : "#E2E8F0"}` }}>
              <div style={{ fontSize: 13, color: "#2D3748", marginBottom: 12, lineHeight: 1.5 }}>
                <span style={{ color: dim.color, fontWeight: 700, marginRight: 6 }}>{qi + 1}.</span>{q.text}
                <span style={{ float: "right", fontSize: 10, color: "#A0AEC0", fontWeight: 600 }}>Weight: {q.weight}×</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { val: "yes", label: "✓ Yes", cls: "yes" },
                  { val: "partial", label: "~ Partial", cls: "partial" },
                  { val: "no", label: "✗ No", cls: "no" },
                ].map(({ val, label, cls }) => (
                  <button
                    key={val}
                    className={`answer-btn ${cls} ${answers[q.id] === val ? "sel" : ""}`}
                    onClick={() => handleAnswer(q.id, val)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ background: "#fff", borderRadius: 12, padding: "16px", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#4A5568", display: "block", marginBottom: 8 }}>Notes / Observations (optional)</label>
            <textarea
              rows={3}
              placeholder={`Add specific observations for ${dim.label.toLowerCase()}...`}
              value={notes[dim.id] || ""}
              onChange={(e) => handleNote(dim.id, e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
            <button
              className="btn-nav"
              style={{ background: "#EDF2F7", color: "#4A5568" }}
              onClick={() => activeTab > 0 ? setActiveTab(activeTab - 1) : setStep("meta")}
            >
              ← {activeTab === 0 ? "Back" : "Previous"}
            </button>
            {activeTab < DIMENSIONS.length - 1 ? (
              <button className="btn-nav" style={{ background: dim.color, color: "#fff" }} onClick={() => setActiveTab(activeTab + 1)}>
                Next Dimension →
              </button>
            ) : (
              <button
                className="btn-nav"
                style={{ background: answeredAll ? "#16A085" : "#A0AEC0", color: "#fff", cursor: answeredAll ? "pointer" : "not-allowed" }}
                onClick={() => answeredAll && setStep("results")}
                disabled={!answeredAll}
              >
                {answeredAll ? "View Results →" : `Answer all questions first`}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // RESULTS
  return (
    <div style={{ minHeight: "100vh", background: "#F0F4F8", fontFamily: "'Inter', system-ui, sans-serif" }} ref={printRef}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        * { box-sizing: border-box; }
        .btn-action { padding:12px 22px; border:none; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; }
        @media print {
          .no-print { display:none !important; }
          body { background:#fff !important; }
          .print-page { box-shadow:none !important; margin:0 !important; }
        }
      `}</style>

      {/* Print Header */}
      <div style={{ background: "#1B6CA8", padding: "24px 20px 32px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: "#90CDF4", textTransform: "uppercase" }}>Peetron Data Analytics</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", marginTop: 4 }}>DQA Report</div>
              <div style={{ fontSize: 12, color: "#BEE3F8", marginTop: 4 }}>{meta.programme} · {meta.organisation}</div>
              <div style={{ fontSize: 11, color: "#90CDF4", marginTop: 2 }}>{meta.location} · {meta.period} · Assessed: {meta.date}</div>
            </div>
            <div style={{ textAlign: "center", background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "16px 24px" }}>
              <div style={{ fontSize: 42, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{overallScore}%</div>
              <div style={{ fontSize: 11, color: "#BEE3F8", marginTop: 4 }}>Overall DQA Score</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: overallRating.color === "#16A085" ? "#6EDDC1" : overallRating.color === "#D35400" ? "#FBD38D" : "#FC8181", marginTop: 4 }}>
                {overallRating.dot} {overallRating.label}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>
        {/* Action Buttons */}
        <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <button className="btn-action" style={{ background: "#1B6CA8", color: "#fff" }} onClick={handlePrint}>
            ⬇ Print / Save PDF
          </button>
          <button className="btn-action" style={{ background: "#EDF2F7", color: "#4A5568" }} onClick={() => setStep("assess")}>
            ← Edit Responses
          </button>
          <button className="btn-action" style={{ background: "#EDF2F7", color: "#4A5568" }} onClick={() => { setStep("meta"); setAnswers({}); setNotes({}); setMeta({ programme: "", organisation: "", assessor: "", date: "", location: "", period: "" }); }}>
            ↺ New Assessment
          </button>
        </div>

        {/* Assessor Info */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            { label: "Assessor", val: meta.assessor },
            { label: "Date", val: meta.date },
            { label: "Location", val: meta.location || "—" },
          ].map(({ label, val }) => (
            <div key={label}>
              <div style={{ fontSize: 10, color: "#A0AEC0", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#2D3748", marginTop: 2 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Score Summary Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 20 }}>
          {dimScores.map((d) => {
            const r = getRating(d.score);
            return (
              <div key={d.id} style={{ background: "#fff", borderRadius: 12, padding: "14px 12px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", borderTop: `3px solid ${d.color}`, textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: d.color, textTransform: "uppercase", letterSpacing: 0.8 }}>{d.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: r.color, margin: "6px 0 2px" }}>{d.score}%</div>
                <div style={{ fontSize: 10, color: r.color, fontWeight: 600 }}>{r.dot} {r.label}</div>
              </div>
            );
          })}
        </div>

        {/* Score Bar Chart */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "20px", marginBottom: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#4A5568", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Score by Dimension</div>
          {dimScores.map((d) => {
            const r = getRating(d.score);
            return (
              <div key={d.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#4A5568" }}>{d.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{d.score}%</span>
                </div>
                <div style={{ background: "#EDF2F7", borderRadius: 6, height: 10, overflow: "hidden" }}>
                  <div style={{ width: `${d.score}%`, height: "100%", background: d.color, borderRadius: 6, transition: "width 0.6s ease" }} />
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #EDF2F7", display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[{ dot: "🟢", label: "Adequate ≥80%" }, { dot: "🟡", label: "Needs Improvement 50–79%" }, { dot: "🔴", label: "Inadequate <50%" }].map((l) => (
              <span key={l.label} style={{ fontSize: 11, color: "#718096" }}>{l.dot} {l.label}</span>
            ))}
          </div>
        </div>

        {/* Detailed Findings */}
        <div style={{ fontSize: 12, fontWeight: 700, color: "#4A5568", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Detailed Findings & Recommendations</div>
        {dimScores.map((d) => {
          const r = getRating(d.score);
          const weakQuestions = d.questions.filter((q) => answers[q.id] === "no" || answers[q.id] === "partial");
          return (
            <div key={d.id} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", marginBottom: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: d.color }}>{d.label}</div>
                <div style={{ background: r.bg, color: r.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{d.score}% · {r.label}</div>
              </div>

              {/* Response summary */}
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                {d.questions.map((q) => (
                  <div key={q.id} title={q.text} style={{
                    width: 28, height: 28, borderRadius: 6, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center",
                    background: answers[q.id] === "yes" ? "#E8F8F5" : answers[q.id] === "partial" ? "#FEF9E7" : "#FDEDEC",
                    color: answers[q.id] === "yes" ? "#16A085" : answers[q.id] === "partial" ? "#D35400" : "#C0392B",
                  }}>
                    {answers[q.id] === "yes" ? "✓" : answers[q.id] === "partial" ? "~" : "✗"}
                  </div>
                ))}
              </div>

              {weakQuestions.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#C0392B", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Issues Identified</div>
                  {weakQuestions.map((q) => (
                    <div key={q.id} style={{ fontSize: 12, color: "#4A5568", padding: "5px 0", borderBottom: "1px solid #F7FAFC", display: "flex", gap: 8 }}>
                      <span style={{ color: answers[q.id] === "partial" ? "#D35400" : "#C0392B", flexShrink: 0 }}>{answers[q.id] === "partial" ? "~" : "✗"}</span>
                      {q.text}
                    </div>
                  ))}
                </div>
              )}

              {d.score < 80 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1B6CA8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Recommended Actions</div>
                  {RECOMMENDATIONS[d.id].map((rec, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#4A5568", padding: "4px 0 4px 14px", borderLeft: `2px solid ${d.color}`, marginBottom: 6 }}>{rec}</div>
                  ))}
                </div>
              )}

              {d.score === 100 && (
                <div style={{ fontSize: 12, color: "#16A085", fontWeight: 600 }}>✓ All criteria met. Maintain current practices.</div>
              )}

              {notes[d.id] && (
                <div style={{ marginTop: 10, padding: "10px 12px", background: "#F7FAFC", borderRadius: 8, fontSize: 12, color: "#4A5568", borderLeft: "3px solid #CBD5E0" }}>
                  <span style={{ fontWeight: 600, color: "#718096" }}>Assessor Notes: </span>{notes[d.id]}
                </div>
              )}
            </div>
          );
        })}

        {/* Conclusion */}
        <div style={{ background: overallRating.bg, border: `1.5px solid ${overallRating.color}`, borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: overallRating.color, marginBottom: 8 }}>
            {overallRating.dot} Overall Assessment: {overallRating.label} ({overallScore}%)
          </div>
          <div style={{ fontSize: 13, color: "#4A5568", lineHeight: 1.6 }}>
            {overallScore >= 80
              ? "This programme's data management systems meet acceptable quality standards. Continue regular DQA checks and maintain documentation practices."
              : overallScore >= 50
              ? "Data quality is partially adequate but requires targeted improvements. Address the flagged issues above before the next reporting cycle."
              : "Data quality is critically inadequate. Immediate corrective action is required across multiple dimensions. A data quality improvement plan should be developed and implemented urgently."}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "16px 0 32px", fontSize: 11, color: "#A0AEC0" }}>
          Generated by Peetron Data Analytics DQA Tool · {meta.date} · Assessor: {meta.assessor}
        </div>
      </div>
    </div>
  );
}
