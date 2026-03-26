<img width="1919" height="965" alt="Screenshot 2026-03-26 150323" src="https://github.com/user-attachments/assets/5b49c15d-b321-49bf-885d-77f35124c5f1" /># 🧠 FitMind — AI-Powered Fitness Platform

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

> 
![<img width="1903" height="955" alt="Screenshot 2026-03-26 150334" src="https://github.com/user-attachments/assets/27f29d06-d5a1-4483-93c3-3e8fd58bed9f" />
<img width="1919" height="959" alt="Screenshot 2026-03-26 150240" src="https://github.com/user-attachments/assets/68c7db8b-8dd1-476a-b6e5-e314b0684077" />
<img width="1919" height="965" alt="Screenshot 2026-03-26 150344" src="https://github.com/user-attachments/assets/9bd8828c-26cc-4594-a2fc-7d1fba9a9023" />
<img width="1919" height="960" alt="Screenshot 2026-03-26 150353" src="https://github.com/user-attachments/assets/ea0798f8-fb68-4041-82e9-6ad234861cd5" />
<img width="1917" height="966" alt="Screenshot 2026-03-26 150255" src="https://github.com/user-attachments/assets/f9dcab2f-eb67-4260-9814-5091f4709d04" />
<img width="1919" height="971" alt="Screenshot 2026-03-26 150402" src="https://github.com/user-attachments/assets/c5a8ae40-71e8-422a-83ef-911ea110874d" />
<img width="1919" height="961" alt="Screenshot 2026-03-26 150310" src="https://github.com/user-attachments/assets/1305d059-dfd8-4e3b-99c0-201ffddd4f38" />
<img width="1919" height="965" alt="Screenshot 2026-03-26 150413" src="https://github.com/user-attachments/assets/614cb361-dac2-4f83-b336-3b52a92e27d3" />
<img width="1919" height="952" alt="Screenshot 2026-03-26 150227" src="https://github.com/user-attachments/assets/276a5150-fadf-4dfa-98e5-6bbdf05e4b93" />
Uploading Screenshot 2026-03-26 150323.png…]()

---

## 📄 License

MIT — feel free to use and modify.
