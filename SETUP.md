# AI Task Planner - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd /home/ubuntu/ai-agent-projects/ai-task-planner
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Mimo API key:
```
MIMO_API_KEY=your_actual_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Features Overview

### Project Management
- Create projects with name and description
- Progress tracking with visual progress bars
- Delete projects (cascades to all tasks)

### Kanban Board
- Three columns: To Do, In Progress, Done
- Task priority indicators (Low/Medium/High)
- Due date tracking with overdue warnings
- Inline task editing
- Move tasks between columns

### AI Task Planning
- Click "AI Plan" button on any project
- Describe your goal in natural language
- AI generates 5-10 actionable tasks
- Tasks automatically added to "To Do" column

### Local Storage
- All data persists in browser localStorage
- No server-side database required
- Data survives page refreshes

## Project Structure

```
ai-task-planner/
├── app/
│   ├── api/
│   │   └── ai-plan/
│   │       └── route.ts          # AI planning API endpoint
│   ├── globals.css               # Global styles + animations
│   ├── layout.tsx                # Root layout with Inter font
│   └── page.tsx                  # Main application (client-side)
├── components/
│   ├── KanbanBoard.tsx           # Kanban columns + AI modal
│   ├── ProjectList.tsx           # Sidebar with projects
│   └── TaskCard.tsx              # Individual task card
├── lib/
│   └── storage.ts                # localStorage utilities
├── types/
│   └── index.ts                  # TypeScript type definitions
├── .env.example                  # Environment template
├── .env.local                    # Local environment (gitignored)
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## API Integration

### Mimo v2.5 Pro API
- Endpoint: `http://100.91.112.121:8317/v1/chat/completions`
- Model: `Mimo-V2.5-Pro`
- Format: OpenAI-compatible
- Auth: Bearer token from `MIMO_API_KEY` env var

### API Route: `/api/ai-plan`
- Method: POST
- Body: `{ goal: string, projectName: string }`
- Response: `{ tasks: Array<{ title, description, priority, status }> }`

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import in Vercel dashboard
3. Add environment variable: `MIMO_API_KEY`
4. Deploy

### Other Platforms
- Ensure Node.js 18+ runtime
- Set `MIMO_API_KEY` environment variable
- Run `npm run build` then `npm start`

## Customization

### Styling
- Edit `tailwind.config.ts` for theme changes
- Modify `app/globals.css` for global styles
- Component styles are inline Tailwind classes

### AI Prompts
- Edit `app/api/ai-plan/route.ts` to customize AI behavior
- Adjust temperature, max_tokens, or system prompts

### Storage
- Currently uses localStorage
- To add database: modify `lib/storage.ts` with API calls

## Troubleshooting

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### AI Not Working
1. Check `MIMO_API_KEY` is set in `.env.local`
2. Verify API endpoint is accessible
3. Check browser console for errors

### Data Not Persisting
- Ensure localStorage is enabled in browser
- Check browser privacy settings
- Data is per-domain (localhost vs production)

## Development Commands

```bash
npm run dev        # Start development server
npm run build      # Create production build
npm start          # Start production server
npm run lint       # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React useState + localStorage
- **AI**: Mimo v2.5 Pro API
- **Deployment**: Vercel-ready

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Static page generation for main route
- Client-side state management
- Lazy-loaded components
- Optimized Tailwind CSS purge

## Security Notes

- API key stored server-side only (env var)
- No sensitive data in localStorage (tasks only)
- HTTPS required for production
- Rate limiting recommended for API endpoint

## Next Steps

Potential enhancements:
- [ ] Drag-and-drop task reordering
- [ ] Task labels/tags
- [ ] Team collaboration
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication
- [ ] Task templates
- [ ] Export/import functionality
- [ ] Dark mode
- [ ] Keyboard shortcuts
- [ ] Mobile app (React Native)

## Support

For issues or questions:
1. Check this documentation
2. Review browser console errors
3. Verify environment variables
4. Test with fresh localStorage

## License

MIT License - See README.md for details
