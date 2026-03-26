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
# Install Python dependencies
pip install flask flask-cors pyjwt werkzeug requests python-dotenv

# Create .env file with your Groq key
echo "GROQ_API_KEY=your_groq_api_key_here" > ../FITMIND/.env

# Start the backend (from the FITMIND folder)
python ../FITMIND/fitbackend.py
```

### 3. Set up the frontend
```bash
npm install
npm run dev
```

### 4. Open the app
- Frontend: **http://localhost:5173**
- Backend API: **http://localhost:5000**

> ⚠️ **The backend must be running** for AI features to work. Sign up for an account on first launch.

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
