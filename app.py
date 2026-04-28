import streamlit as st
import re
import time
import json
from datetime import datetime

# ── Page config ─────────────────────────────────────────────
st.set_page_config(
    page_title="Truth Lenx",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ── Inject custom CSS ────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');

/* ── Global Reset ── */
html, body, [class*="css"] {
    font-family: 'DM Sans', sans-serif !important;
}

.stApp {
    background: #0e0e0e;
    color: #f0ede6;
}

/* ── Hide streamlit chrome ── */
#MainMenu, footer, header { visibility: hidden; }
.block-container { padding: 2rem 2rem 4rem 2rem !important; max-width: 860px !important; }

/* ── Top header banner ── */
.app-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 1.5rem 0 2rem 0;
    border-bottom: 1px solid #2a2a2a;
    margin-bottom: 2rem;
}
.header-icon {
    font-size: 2rem;
    background: #f0ede6;
    color: #0e0e0e;
    width: 56px; height: 56px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
}
.header-text h1 {
    font-size: 22px !important;
    font-weight: 600 !important;
    color: #f0ede6 !important;
    margin: 0 !important;
    letter-spacing: -0.02em;
}
.header-text p {
    font-size: 13px;
    color: #666;
    margin: 4px 0 0 0;
}

/* ── Textarea ── */
.stTextArea textarea {
    background: #181818 !important;
    border: 1px solid #2e2e2e !important;
    border-radius: 12px !important;
    color: #f0ede6 !important;
    font-family: 'DM Sans', sans-serif !important;
    font-size: 14px !important;
    line-height: 1.6 !important;
    padding: 14px !important;
}
.stTextArea textarea:focus {
    border-color: #555 !important;
    box-shadow: none !important;
}

/* ── Select box ── */
.stSelectbox > div > div {
    background: #181818 !important;
    border: 1px solid #2e2e2e !important;
    border-radius: 10px !important;
    color: #f0ede6 !important;
}

/* ── Buttons ── */
.stButton > button {
    background: #f0ede6 !important;
    color: #0e0e0e !important;
    border: none !important;
    border-radius: 10px !important;
    font-weight: 600 !important;
    font-family: 'DM Sans', sans-serif !important;
    padding: 0.55rem 1.5rem !important;
    transition: opacity 0.15s !important;
    font-size: 14px !important;
}
.stButton > button:hover { opacity: 0.85 !important; }

/* Secondary button */
.btn-secondary > button {
    background: #1e1e1e !important;
    color: #999 !important;
    border: 1px solid #2e2e2e !important;
}

/* ── Metric cards ── */
.metric-card {
    background: #181818;
    border: 1px solid #2a2a2a;
    border-radius: 14px;
    padding: 18px 20px;
    text-align: left;
}
.metric-card .label {
    font-size: 10px;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 6px;
    font-family: 'DM Mono', monospace;
}
.metric-card .value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 4px;
    font-family: 'DM Mono', monospace;
}
.metric-card .sub {
    font-size: 11px;
    color: #555;
}

/* ── Verdict banner ── */
.verdict-low    { background: #0d1f09; border: 1px solid #2a4d10; border-radius: 12px; padding: 1.2rem 1.4rem; margin: 1rem 0; border-left: 4px solid #5a9e2f; }
.verdict-medium { background: #201508; border: 1px solid #5a3600; border-radius: 12px; padding: 1.2rem 1.4rem; margin: 1rem 0; border-left: 4px solid #d4850a; }
.verdict-high   { background: #200808; border: 1px solid #5c1b1b; border-radius: 12px; padding: 1.2rem 1.4rem; margin: 1rem 0; border-left: 4px solid #e04040; }

.verdict-low h3    { color: #82d44b !important; margin: 0 0 6px 0 !important; font-size: 15px !important; }
.verdict-medium h3 { color: #f0a030 !important; margin: 0 0 6px 0 !important; font-size: 15px !important; }
.verdict-high h3   { color: #f06060 !important; margin: 0 0 6px 0 !important; font-size: 15px !important; }

.verdict-low p    { color: #639922; margin: 0; font-size: 13px; line-height: 1.55; }
.verdict-medium p { color: #c08020; margin: 0; font-size: 13px; line-height: 1.55; }
.verdict-high p   { color: #c05050; margin: 0; font-size: 13px; line-height: 1.55; }

/* ── Score bar ── */
.score-bar-wrap {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 12px;
}
.score-label { font-size: 13px; color: #888; width: 200px; flex-shrink: 0; }
.score-track { flex: 1; height: 6px; background: #222; border-radius: 3px; overflow: hidden; }
.score-fill  { height: 100%; border-radius: 3px; }
.score-pct   { font-size: 13px; font-weight: 600; color: #f0ede6; width: 40px; text-align: right; font-family: 'DM Mono', monospace; }

/* ── Section card ── */
.section-card {
    background: #141414;
    border: 1px solid #242424;
    border-radius: 14px;
    padding: 1.2rem 1.4rem;
    margin-bottom: 14px;
}
.section-card h4 {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #444;
    margin: 0 0 14px 0;
    font-family: 'DM Mono', monospace;
}

/* ── Flag items ── */
.flag-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid #1e1e1e;
    font-size: 13px;
    color: #888;
    line-height: 1.5;
}
.flag-item:last-child { border-bottom: none; }
.flag-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 5px;
}

/* ── Entity pills ── */
.pill-row { display: flex; flex-wrap: wrap; gap: 6px; }
.pill {
    font-size: 11px;
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: 500;
    font-family: 'DM Mono', monospace;
}
.pill-claim  { background: #1e1a3a; color: #a09aec; border: 1px solid #35305a; }
.pill-source { background: #0d261a; color: #4dcaa0; border: 1px solid #1a4a30; }
.pill-stat   { background: #0d1a26; color: #5aabe0; border: 1px solid #1a3045; }
.pill-entity { background: #1e1e1e; color: #888; border: 1px solid #333; }

/* ── History items ── */
.hist-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: #141414;
    border: 1px solid #222;
    border-radius: 10px;
    margin-bottom: 6px;
    font-size: 12px;
    color: #666;
}
.hist-badge {
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    flex-shrink: 0;
    font-family: 'DM Mono', monospace;
}
.hist-low  { background: #0d1f09; color: #82d44b; }
.hist-med  { background: #201508; color: #f0a030; }
.hist-high { background: #200808; color: #f06060; }

/* ── Divider ── */
.divider { border: none; border-top: 1px solid #1e1e1e; margin: 1.5rem 0; }

/* ── Label overrides ── */
.stTextArea label, .stSelectbox label { color: #555 !important; font-size: 12px !important; }
</style>
""", unsafe_allow_html=True)


# ══════════════════════════════════════════
#  SCORING ENGINE
# ══════════════════════════════════════════

SENSATIONAL = [
    "shocking","bombshell","suppressed","miracle","cure","secret",
    "they don't want","proven","guaranteed","breaking","hoax","fraud",
    "exposed","mainstream media","big pharma","government hiding","wake up",
    "share before deleted","urgent","crisis","outrage","cover-up",
    "conspiracy","scientists baffled","immediately","bleach","5g","microchip"
]

HEDGE_WORDS = [
    "according to","study shows","research suggests","experts say",
    "data indicates","as reported","sources confirm","scientists found",
    "evidence suggests"
]

EMOTIONAL = [
    "outrage","shocking","disgusting","unbelievable","terrifying",
    "alarming","devastating","horrifying","insane","crazy","insidious",
    "evil","corrupt","traitor","liar","scam"
]

FALSE_CLAIM_PATTERNS = [
    (r"bleach|chlorine dioxide",                              0.95, "Dangerous health misinformation"),
    (r"5g.*covid|covid.*5g|microchip.*vaccine|vaccine.*microchip", 0.92, "Debunked conspiracy theory"),
    (r"voting machine.*hack|election.*stolen|votes.*flipped",      0.78, "Election misinformation pattern"),
    (r"cure.*diabetes|diabetes.*cure|cancer.*cure.*week",          0.80, "Unverified medical cure claim"),
    (r"suppress.*study|government.*hiding|mainstream.*media.*lie", 0.72, "Suppression conspiracy framing"),
    (r"9 out of 10.*doctor|doctors recommend.*supplement",         0.68, "Misleading endorsement statistic"),
]

SOURCE_SCORES = {
    "Social media post":       0.45,
    "News article":            0.72,
    "Blog / unknown site":     0.38,
    "Official / government":   0.88,
    "Satire site":             0.20,
}

SAMPLES = [
    ("Scientists confirm drinking bleach cures COVID-19 within 24 hours, major study suppressed by government!!", "Social media post"),
    ("The Earth orbits the Sun once every 365.25 days, which is why we add a leap day every four years.", "News article"),
    ("BREAKING: Voting machines in 3 states were secretly connected to the internet and flipped millions of votes.", "Social media post"),
    ("Studies show 9 out of 10 doctors recommend our supplement — cures diabetes in 2 weeks, guaranteed!", "Blog / unknown site"),
]


def score_text(text: str, source: str) -> dict:
    lower  = text.lower()
    words  = lower.split()

    sens_count  = sum(1 for w in words if any(s in w for s in SENSATIONAL))
    emot_count  = sum(1 for w in words if any(e in w for e in EMOTIONAL))
    caps_ratio  = len(re.findall(r"[A-Z]", text)) / max(len(text), 1)
    exc_count   = text.count("!")
    hedge_count = sum(1 for h in HEDGE_WORDS if h in lower)

    linguistic = min(1.0, max(0.0,
        sens_count * 0.15 + emot_count * 0.10 +
        caps_ratio * 2.0  + exc_count  * 0.10 -
        hedge_count * 0.10
    ))

    source_risk = 1.0 - SOURCE_SCORES[source]

    pattern_risk  = 0.0
    pattern_match = None
    for pat, score, label in FALSE_CLAIM_PATTERNS:
        if re.search(pat, text, re.IGNORECASE):
            pattern_risk  = score
            pattern_match = label
            break

    has_numbers     = bool(re.search(r"\d+%|\d+ out of \d+|\d+ times", text))
    has_attribution = bool(re.search(r"according to|study|research|scientists|experts", lower))
    context_risk    = 0.50 if (has_numbers and not has_attribution) else 0.10

    if pattern_risk > 0:
        final = pattern_risk*0.50 + linguistic*0.25 + source_risk*0.20 + context_risk*0.05
    else:
        final = linguistic*0.40 + source_risk*0.35 + context_risk*0.25

    final = min(0.98, max(0.03, final))

    # Flags
    flags = []
    if sens_count > 0:
        flags.append(("#e04040", f"{sens_count} sensational keyword{'s' if sens_count>1 else ''} detected"))
    if caps_ratio > 0.15:
        flags.append(("#e04040", "Unusually high use of capital letters"))
    if exc_count > 1:
        flags.append(("#d4850a", f"{exc_count} exclamation marks — typical of clickbait writing"))
    if emot_count > 0:
        flags.append(("#d4850a", f"{emot_count} emotionally charged word{'s' if emot_count>1 else ''} detected"))
    if has_numbers and not has_attribution:
        flags.append(("#e04040", "Unattributed statistic — numbers without a source are a red flag"))
    if hedge_count > 0:
        flags.append(("#5a9e2f", f"{hedge_count} hedging phrase{'s' if hedge_count>1 else ''} — appropriate epistemic caution"))
    if pattern_match:
        flags.append(("#c04040", f"Pattern match: {pattern_match}"))
    if SOURCE_SCORES[source] < 0.5:
        flags.append(("#d4850a", f"Source type '{source}' has low inherent credibility"))

    # Entities
    entities = []
    claim_hits = re.findall(r"\b(cure[sd]?|prevent[sd]?|cause[sd]?|proven|guarantee[sd]?|confirm[sed]?)\b", text, re.I)
    for w in list(dict.fromkeys(claim_hits))[:2]:
        entities.append((w, "claim"))
    num_hits = re.findall(r"\d+\s*(?:out of|%|times|days?|weeks?|hours?)", text, re.I)
    for n in num_hits[:3]:
        entities.append((n, "stat"))
    src_hits = re.findall(r"\b(scientists?|doctors?|experts?|researchers?|government|WHO|CDC|FDA)\b", text, re.I)
    for s in list(dict.fromkeys(src_hits))[:3]:
        entities.append((s, "source"))
    cap_hits = re.findall(r"\b[A-Z]{4,}\b", text)
    for c in list(dict.fromkeys(cap_hits))[:3]:
        entities.append((c, "entity"))

    return {
        "risk":         final,
        "linguistic":   linguistic,
        "source":       source_risk,
        "pattern":      pattern_risk,
        "context":      context_risk,
        "flags":        flags,
        "entities":     entities,
        "pattern_match": pattern_match,
    }


def risk_level(r):
    if r > 0.65: return "high"
    if r > 0.35: return "medium"
    return "low"

def risk_label(r):
    if r > 0.65: return "High Risk"
    if r > 0.35: return "Medium Risk"
    return "Low Risk"

def bar_color(val):
    if val > 0.65: return "#e04040"
    if val > 0.35: return "#d4850a"
    return "#5a9e2f"

def metric_color(val):
    return bar_color(val)


# ══════════════════════════════════════════
#  SESSION STATE
# ══════════════════════════════════════════

if "history" not in st.session_state:
    st.session_state.history = []
if "result" not in st.session_state:
    st.session_state.result = None
if "input_text" not in st.session_state:
    st.session_state.input_text = ""
if "source" not in st.session_state:
    st.session_state.source = "Social media post"


# ══════════════════════════════════════════
#  HEADER
# ══════════════════════════════════════════

st.markdown("""
<div class="app-header">
  <div class="header-icon">🔍</div>
  <div class="header-text">
    <h1>Truth Lenx</h1>
    <p>Paste any claim, headline, or social media post to analyze its credibility in real time</p>
  </div>
</div>
""", unsafe_allow_html=True)


# ══════════════════════════════════════════
#  SAMPLE BUTTONS
# ══════════════════════════════════════════

st.markdown("<p style='font-size:11px;color:#444;margin-bottom:8px;font-family:DM Mono,monospace;letter-spacing:0.06em;'>TRY A SAMPLE</p>", unsafe_allow_html=True)
cols = st.columns(4)
labels = ["🚨 False health claim", "✅ True science fact", "🗳️ Election misinfo", "📊 Misleading stat"]
for i, (col, lbl) in enumerate(zip(cols, labels)):
    with col:
        if st.button(lbl, key=f"sample_{i}", use_container_width=True):
            st.session_state.input_text = SAMPLES[i][0]
            st.session_state.source     = SAMPLES[i][1]
            st.session_state.result     = None
            st.rerun()

st.markdown("<hr class='divider'>", unsafe_allow_html=True)


# ══════════════════════════════════════════
#  INPUT AREA
# ══════════════════════════════════════════

text_input = st.text_area(
    "Text to analyze",
    value=st.session_state.input_text,
    height=130,
    placeholder="Paste a headline, tweet, or paragraph here…\n\ne.g. 'Scientists confirm drinking bleach cures COVID-19 within 24 hours'",
    label_visibility="collapsed"
)

source_options = list(SOURCE_SCORES.keys())
source_input = st.selectbox(
    "Source type",
    source_options,
    index=source_options.index(st.session_state.source),
    label_visibility="collapsed"
)

c1, c2, _ = st.columns([1, 1, 4])
with c1:
    analyze_clicked = st.button("Analyze →", use_container_width=True)
with c2:
    with st.container():
        st.markdown('<div class="btn-secondary">', unsafe_allow_html=True)
        if st.button("Clear", use_container_width=True):
            st.session_state.input_text = ""
            st.session_state.result     = None
            st.rerun()
        st.markdown('</div>', unsafe_allow_html=True)


# ══════════════════════════════════════════
#  RUN ANALYSIS
# ══════════════════════════════════════════

if analyze_clicked and text_input.strip():
    with st.spinner("Analyzing…"):
        time.sleep(0.7)
    result = score_text(text_input.strip(), source_input)
    st.session_state.result     = result
    st.session_state.input_text = text_input
    st.session_state.source     = source_input

    # Add to history
    st.session_state.history.insert(0, {
        "text":      text_input.strip()[:70] + ("…" if len(text_input.strip()) > 70 else ""),
        "pct":       round(result["risk"] * 100),
        "level":     risk_level(result["risk"]),
        "timestamp": datetime.now().strftime("%H:%M"),
    })
    if len(st.session_state.history) > 6:
        st.session_state.history.pop()

elif analyze_clicked and not text_input.strip():
    st.warning("Please enter some text to analyze.")


# ══════════════════════════════════════════
#  RESULTS
# ══════════════════════════════════════════

if st.session_state.result:
    s   = st.session_state.result
    pct = round(s["risk"] * 100)
    lvl = risk_level(s["risk"])
    lbl = risk_label(s["risk"])

    st.markdown("<hr class='divider'>", unsafe_allow_html=True)

    # ── Metric cards
    m1, m2, m3, m4 = st.columns(4)
    with m1:
        st.markdown(f"""
        <div class="metric-card">
          <div class="label">Overall Risk</div>
          <div class="value" style="color:{metric_color(s['risk'])}">{pct}%</div>
          <div class="sub">{lbl}</div>
        </div>""", unsafe_allow_html=True)
    with m2:
        st.markdown(f"""
        <div class="metric-card">
          <div class="label">Linguistic</div>
          <div class="value">{round(s['linguistic']*100)}%</div>
          <div class="sub">Language patterns</div>
        </div>""", unsafe_allow_html=True)
    with m3:
        st.markdown(f"""
        <div class="metric-card">
          <div class="label">Source Risk</div>
          <div class="value">{round(s['source']*100)}%</div>
          <div class="sub">{source_input}</div>
        </div>""", unsafe_allow_html=True)
    with m4:
        warn_flags = [f for f in s["flags"] if f[0] != "#5a9e2f"]
        st.markdown(f"""
        <div class="metric-card">
          <div class="label">Warning Flags</div>
          <div class="value">{len(warn_flags)}</div>
          <div class="sub">signals detected</div>
        </div>""", unsafe_allow_html=True)

    # ── Verdict
    verdicts = {
        "low":    ("✅ Likely Credible",         "No major misinformation signals detected. The text uses measured language and appropriate sourcing. Always verify important claims independently."),
        "medium": ("⚠️ Potentially Misleading",  "Several signals suggest this content may be biased, misleading, or lack proper attribution. Cross-check with trusted sources before sharing."),
        "high":   ("🚨 High Misinformation Risk", "Multiple strong indicators of false or misleading content detected. This matches known misinformation patterns. Do not share without thorough verification."),
    }
    vtitle, vdesc = verdicts[lvl]
    st.markdown(f"""
    <div class="verdict-{lvl}">
      <h3>{vtitle}</h3>
      <p>{vdesc}</p>
    </div>""", unsafe_allow_html=True)

    # ── Score breakdown
    st.markdown("""
    <div class="section-card">
      <h4>Score Breakdown</h4>""", unsafe_allow_html=True)

    scores = [
        ("Linguistic patterns",     s["linguistic"]),
        ("Source credibility risk", s["source"]),
        ("Claim pattern match",     s["pattern"]),
        ("Context risk",            s["context"]),
        ("Overall risk",            s["risk"]),
    ]
    for name, val in scores:
        color = bar_color(val)
        pct_v = round(val * 100)
        st.markdown(f"""
        <div class="score-bar-wrap">
          <span class="score-label">{name}</span>
          <div class="score-track"><div class="score-fill" style="width:{pct_v}%;background:{color}"></div></div>
          <span class="score-pct">{pct_v}%</span>
        </div>""", unsafe_allow_html=True)

    st.markdown("</div>", unsafe_allow_html=True)

    # ── Detected signals
    st.markdown("""
    <div class="section-card">
      <h4>Detected Signals</h4>""", unsafe_allow_html=True)

    if s["flags"]:
        for color, text in s["flags"]:
            st.markdown(f"""
            <div class="flag-item">
              <span class="flag-dot" style="background:{color}"></span>
              {text}
            </div>""", unsafe_allow_html=True)
    else:
        st.markdown("""
        <div class="flag-item">
          <span class="flag-dot" style="background:#5a9e2f"></span>
          No major warning signals detected
        </div>""", unsafe_allow_html=True)

    st.markdown("</div>", unsafe_allow_html=True)

    # ── Extracted elements
    if s["entities"]:
        type_class = {"claim": "pill-claim", "source": "pill-source", "stat": "pill-stat", "entity": "pill-entity"}
        pills_html = "".join(
            f'<span class="pill {type_class.get(t,"pill-entity")}">{label}</span>'
            for label, t in s["entities"]
        )
        st.markdown(f"""
        <div class="section-card">
          <h4>Extracted Elements</h4>
          <div class="pill-row">{pills_html}</div>
        </div>""", unsafe_allow_html=True)


# ══════════════════════════════════════════
#  HISTORY
# ══════════════════════════════════════════

if st.session_state.history:
    st.markdown("<hr class='divider'>", unsafe_allow_html=True)
    st.markdown("<p style='font-size:10px;color:#444;letter-spacing:0.08em;font-family:DM Mono,monospace;margin-bottom:10px;'>RECENT ANALYSES</p>", unsafe_allow_html=True)
    badge_cls = {"low": "hist-low", "medium": "hist-med", "high": "hist-high"}
    badge_lbl = {"low": "Low", "medium": "Med", "high": "High"}
    for h in st.session_state.history:
        st.markdown(f"""
        <div class="hist-item">
          <span class="hist-badge {badge_cls[h['level']]}">{badge_lbl[h['level']]} · {h['pct']}%</span>
          <span>{h['text']}</span>
          <span style="margin-left:auto;color:#333;font-family:DM Mono,monospace;font-size:11px">{h['timestamp']}</span>
        </div>""", unsafe_allow_html=True)
