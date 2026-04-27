# Misinformation Detector — Streamlit App

## Setup & Run (3 steps)

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the app
```bash
streamlit run app.py
```

### 3. Open in browser
Streamlit auto-opens at → http://localhost:8501

---

## Features
- Real-time misinformation risk scoring (0–100%)
- 5 scoring sign
6:49 pm
als: linguistic patterns, source credibility, claim pattern matching, emotional language, unattributed statistics
- Color-coded verdict: Low / Medium / High risk
- Score breakdown bars
- Detected signals list
- Extracted entities (claims, stats, sources)
- Recent analysis history
- 4 built-in sample texts to test

## Project Structure
```
misinformation-streamlit/
├── app.py            ← Main Streamlit application
├── requirements.txt  ← Python dependencies
└── README.md         ← This file
```

## Extending the App
To connect a real NLP backend, replace the `score_text()` function in `app.py` with an API call to your FastAPI backend:

```python
import requests

def score_text(text, source):
    response = requests.post("http://localhost:8000/analyze", json={"text": text, "source": source})
    return response.json()
```
