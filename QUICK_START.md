# 🚀 AI Task Planner - Quick Start

## Get Running in 3 Steps

```bash
# 1. Navigate to project
cd /home/ubuntu/ai-agent-projects/ai-task-planner

# 2. Add your API key
echo "MIMO_API_KEY=your_actual_key" > .env.local

# 3. Start the app
./start.sh
```

**Open**: http://localhost:3000

---

## Key Features

✓ Create projects with progress tracking
✓ Kanban board (To Do → In Progress → Done)
✓ AI-powered task generation
✓ Inline task editing
✓ Local storage persistence
✓ Mobile responsive

---

## Quick Commands

```bash
npm run dev        # Development server
npm run build      # Production build
npm start          # Production server
./start.sh         # Quick start with checks
```

---

## AI Setup

1. Get Mimo API key
2. Add to `.env.local`:
   ```
   MIMO_API_KEY=your_key_here
   ```
3. Click "AI Plan" in any project
4. Describe your goal
5. AI generates tasks automatically

---

## File Locations

- **Main UI**: `app/page.tsx`
- **Components**: `components/`
- **API**: `app/api/ai-plan/route.ts`
- **Storage**: `lib/storage.ts`
- **Types**: `types/index.ts`

---

## Need Help?

See `SETUP.md` for detailed documentation.

**Happy Planning! 🎯**
