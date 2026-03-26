# 🧠 FitMind — AI-Powered Fitness Platform

A full-stack, AI-driven fitness web application with a beautiful glassmorphism UI. Get personalized meal plans, workout programs, exercise form analysis via video, and a 24/7 AI coach — all powered by **Groq Llama 3**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏋️ **BMI Analyzer** | Calculate BMI with animated gauge + AI health tip |
| 🥗 **Diet Planner** | AI-generated 7-day meal plan based on your profile |
| 🎥 **Form AI** | Upload a workout video → Vision AI analyzes your exercise form |
| 💪 **Workout Planner** | Personalized weekly training program with smart split logic |
| 💬 **AI Coach** | Conversational fitness chatbot with conversation history |
| 📊 **Progress Tracker** | Log weight, workouts, water & calories — all stored locally |

---

## 🛠️ Tech Stack

**Frontend:** React 19, Vite 7, TailwindCSS v4, Framer Motion, Three.js, shadcn/ui  
**Backend:** Python, Flask, SQLite  
**AI:** Groq API — `llama-3.3-70b-versatile` (text) + `llama-4-scout` (vision)  
**Auth:** JWT tokens, bcrypt password hashing

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- Python >= 3.9
- A free [Groq API key](https://console.groq.com)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/fitmind-react.git
cd fitmind-react
```

### 2. Set up the backend
```bash
# Go into the backend folder
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Copy the env example and add your Groq key
copy .env.example .env
# Open .env and paste your real GROQ_API_KEY

# Start the backend
python fitbackend.py
```

### 3. Set up the frontend
```bash
# Go back to root
cd ..
npm install
npm run dev
```

### 4. Or just double-click `start.bat` 🚀
This will launch both backend and frontend automatically!

---

## 📁 Project Structure

```
fitmind-react/          ← Frontend (React + Vite)
├── src/
│   ├── components/     ← All UI sections and layout
│   ├── hooks/          ← useAuth, useProgress
│   └── lib/            ← API helpers, utilities
│
FITMIND/                ← Backend (Python Flask)
├── fitbackend.py       ← REST API server
└── .env                ← YOUR API KEY (never commit this!)
```

---

## 🔑 Environment Variables

Create a `.env` file in the `FITMIND/` folder:

```env
GROQ_API_KEY=gsk_your_key_here
```

Get your free key at → https://console.groq.com

---

## 📸 Screenshots

> Coming soon

---

## 📄 License

MIT — feel free to use and modify.
