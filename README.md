# 🧠 AI Task Planner

An intelligent task decomposition and project planning tool powered by **Mimo V2.5 Pro**. Break down complex projects into manageable, prioritized tasks with AI assistance.

![AI Task Planner](https://img.shields.io/badge/AI-Powered-7c3aed?style=for-the-badge&logo=artificial-intelligence&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- 🤖 **AI-Powered Decomposition** — Describe your project and let AI break it down
- 📊 **Task Tree View** — Hierarchical task structure with expandable subtasks
- 🎯 **Priority System** — High, Medium, Low priority levels with visual indicators
- ⏱️ **Time Estimates** — AI-generated time estimates for each task
- 📈 **Progress Tracking** — Real-time progress bar and completion percentage
- 📅 **Timeline View** — Gantt-like visualization of your project schedule
- 💾 **Export to JSON** — Download your project plan for external use
- 🔄 **Streaming Responses** — Real-time AI task generation
- 🎨 **Beautiful Dark UI** — Purple/violet themed dark interface
- 📱 **Responsive Design** — Works on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- An API key for an OpenAI-compatible service (e.g., OpenAI, OpenRouter, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-task-planner.git
   cd ai-task-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

1. **Enter Project Details** — Type your project name and describe what you want to build
2. **Click "Decompose"** — The AI will analyze your project and break it down into tasks
3. **Review Tasks** — Expand subtasks, check priorities, and review time estimates
4. **Track Progress** — Click tasks to change their status (Todo → Doing → Done)
5. **View Timeline** — See your project schedule in the Gantt-like view
6. **Export** — Download your complete project plan as JSON

## 🏗️ Project Structure

```
ai-task-planner/
├── app/
│   ├── api/
│   │   └── decompose/
│   │       └── route.ts      # AI decomposition API endpoint
│   ├── globals.css            # Global styles + Tailwind
│   ├── layout.tsx             # Root layout with dark theme
│   └── page.tsx               # Main task planner UI
├── public/                    # Static assets
├── .env.example               # Environment variables template
├── .gitignore
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies and scripts
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.ts         # Tailwind CSS with purple theme
├── tsconfig.json              # TypeScript configuration
└── vercel.json                # Vercel deployment configuration
```

## 🔧 Configuration

### API Provider

The app uses an OpenAI-compatible API by default. You can configure a different provider by setting `OPENAI_BASE_URL` in your `.env.local`:

```env
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=your_key
```

### Model

The default model is `mimo-v2.5-pro`. You can change this in `app/api/decompose/route.ts`.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add your `OPENAI_API_KEY` environment variable
4. Deploy!

### Other Platforms

The app can be deployed anywhere Next.js is supported:

```bash
npm run build
npm start
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom purple theme
- **AI**: Vercel AI SDK with OpenAI-compatible API
- **Model**: Mimo V2.5 Pro
- **Deployment**: Vercel

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js and Mimo V2.5 Pro
