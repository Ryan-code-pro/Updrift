# 🌊 Updrift — Deep-Sea Gamified AI Study & Quest Platform

> **Navigate the abyssal depths of learning, defeat academic Leviathans, and turn course syllabi into high-stakes underwater study quests.**

---

## 📌 Project Purpose

**Updrift** transforms overwhelming course loads, complex academic syllabi, and routine study habits into an immersive, gamified submarine diving expedition. Traditional study apps often suffer from dry task lists and passive reading routines. Updrift solves student burnout by combining **AI-driven syllabus parsing**, **audio sonar briefings**, **abyssal note distillation**, and **gamified Leviathan boss battles** into a unified, high-octane study dashboard.

As students complete tasks and log study hours, they submerge deeper into the academic ocean, earning XP, unlocking sonar torpedoes, maintaining depth streaks, and tracking real-time pressure diagnostics.

---

## 🎨 Theme & Visual Identity

The platform is designed around a **Deep-Sea Submarine Command Console**:

- **Color Palette**: Dark oceanic blues (`#0a1128`, `#001f3f`), bioluminescent cyan/teal accents (`#00f2fe`, `#4facfe`), submarine radar gold (`#ffb703`), and pressure alarm crimson (`#ff4d4d`).
- **Tactile UI Controls**: Glassmorphic gauge panels, depth indicator bars, sonar radar displays, and hydro-acoustic audio controllers.
- **Audio & FX**: Built-in aquatic sound effects (sonar pings, depth charges, level-up chime, bubble ambiance) powered by synthesized audio engines.

---

## ✨ Core Features

### 1. 📑 AI Syllabus Parser & Tactical Quest Engine
- Upload PDF, image, or text syllabi directly into the AI analyzer.
- The **Gemini AI engine** automatically extracts modules, assignments, exam dates, and difficulty ratings.
- Converts raw syllabi into structured **Submarine Quests** organized by ocean depth (e.g., *Epipelagic Surface*, *Mesopelagic Twilight Zone*, *Bathypelagic Trench*).

### 2. 🔊 Sonar Audiobooks & AI Audio Briefings
- Generate AI study summaries and listen to them via interactive audio players.
- Built-in speech synthesis and ambient sonar audio guides for hands-free learning on the go.

### 3. 📝 Abyssal Hydro-Notes & Flashcard Generator
- Distill complex study materials into bite-sized **Hydro-Notes** and active recall flashcards.
- Instant AI key takeaway generation with customizable study tagging and search filtering.

### 4. 👾 Leviathan Boss Fights & Pomodoro Study Sprints
- Study focus timer configured as a submarine sonar lock-on sequence.
- Every completed 25-minute study sprint fires a high-yield torpedo at the active **Leviathan Boss** (e.g., *Midterm Kraken*, *Thesis Megalodon*).
- Reward system grants XP, badge drops, and streak multipliers.

### 5. 📊 Bathymetric Diagnostic Analytics
- Track study depth metrics in **meters below sea level**.
- Real-time pressure resistance stats, weekly activity bar charts, completion percentages, and leveling progress bars.

### 6. 🔐 Firebase Auth & Cloud Firestore Persistence
- Full authentication support with Firebase Auth (Email/Password & Seamless local fallback mode).
- Real-time cloud storage syncs user profiles, quest progress, hydro-notes, and study logs across devices.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & UI** | Tailwind CSS, Lucide React Icons, Framer Motion |
| **Backend Server** | Node.js, Express (API Proxy & Vite Middleware) |
| **Artificial Intelligence** | Google Gemini AI (`@google/genai`) |
| **Database & Auth** | Firebase Auth, Google Cloud Firestore |
| **Audio Engine** | Web Audio API & Synthesized Sound FX |
| **Build Tooling** | Vite, ESBuild, TypeScript Compiler (`tsc`) |

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation Steps

1. **Extract or Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/updrift.git
   cd updrift
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file or update `.env.example` with your Gemini API Key and Firebase configuration:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Launch the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🌐 Deploying to Firebase Hosting

To deploy your live version to Firebase Hosting and Cloud Firestore:

1. **Build the Production Bundle**:
   ```bash
   npm run build
   ```

2. **Log In to Firebase CLI**:
   ```bash
   npx firebase login
   ```

3. **Deploy to Firebase**:
   ```bash
   npx firebase deploy
   ```

Upon completion, Firebase CLI will output your live Hosting URL (e.g., `https://updrift-e68dc.web.app`).

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
