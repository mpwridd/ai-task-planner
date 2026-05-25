'use client';

import { useState, useRef, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  status: 'todo' | 'doing' | 'done';
  subtasks?: Task[];
  expanded?: boolean;
}

export default function Home() {
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [streaming]);

  const decompose = async () => {
    if (!projectDesc.trim()) return;
    setLoading(true);
    setTasks([]);
    setStreaming('');

    try {
      const res = await fetch('/api/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, description: projectDesc }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          fullText += chunk;
          setStreaming(fullText);
        }
      }

      // Try to parse JSON from response
      try {
        const jsonMatch = fullText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const withIds = addIds(parsed);
          setTasks(withIds);
        }
      } catch {
        // Keep streaming text visible
      }
    } catch (err) {
      setStreaming('Error: Failed to decompose project');
    }
    setLoading(false);
  };

  const addIds = (items: any[], depth = 0): Task[] => {
    return items.map((item, i) => ({
      id: `task-${depth}-${i}-${Date.now()}`,
      title: item.title || item.name || 'Untitled Task',
      description: item.description || '',
      priority: item.priority || 'medium',
      estimatedTime: item.estimatedTime || item.estimated_time || '1h',
      status: 'todo' as const,
      subtasks: item.subtasks ? addIds(item.subtasks, depth + 1) : undefined,
      expanded: depth < 1,
    }));
  };

  const toggleStatus = (id: string) => {
    const toggle = (items: Task[]): Task[] =>
      items.map((t) => ({
        ...t,
        status: t.id === id ? (t.status === 'todo' ? 'doing' : t.status === 'doing' ? 'done' : 'todo') : t.status,
        subtasks: t.subtasks ? toggle(t.subtasks) : undefined,
      }));
    setTasks(toggle(tasks));
  };

  const toggleExpand = (id: string) => {
    const expand = (items: Task[]): Task[] =>
      items.map((t) => ({
        ...t,
        expanded: t.id === id ? !t.expanded : t.expanded,
        subtasks: t.subtasks ? expand(t.subtasks) : undefined,
      }));
    setTasks(expand(tasks));
  };

  const getProgress = (): number => {
    const count = (items: Task[]): [number, number] => {
      let done = 0, total = 0;
      items.forEach((t) => {
        total++;
        if (t.status === 'done') done++;
        if (t.subtasks) {
          const [d, tt] = count(t.subtasks);
          done += d;
          total += tt;
        }
      });
      return [done, total];
    };
    const [done, total] = count(tasks);
    return total === 0 ? 0 : Math.round((done / total) * 100);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName || 'project'}-tasks.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const priorityColor = (p: string) =>
    p === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
    p === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
    'bg-green-500/20 text-green-400 border-green-500/30';

  const statusIcon = (s: string) =>
    s === 'done' ? '✅' : s === 'doing' ? '🔄' : '⬜';

  const renderTask = (task: Task, depth = 0) => (
    <div key={task.id} style={{ marginLeft: `${depth * 24}px` }} className="mb-2">
      <div
        className={`p-3 rounded-lg border backdrop-blur-sm transition-all duration-200 hover:border-purple-500/50 ${
          task.status === 'done' ? 'opacity-60' : ''
        } bg-white/5 border-white/10`}
      >
        <div className="flex items-start gap-3">
          <button onClick={() => toggleStatus(task.id)} className="text-xl mt-0.5 hover:scale-110 transition-transform">
            {statusIcon(task.status)}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {task.subtasks && (
                <button onClick={() => toggleExpand(task.id)} className="text-purple-400 hover:text-purple-300 text-sm">
                  {task.expanded ? '▼' : '▶'}
                </button>
              )}
              <h3 className={`font-medium text-white ${task.status === 'done' ? 'line-through' : ''}`}>
                {task.title}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColor(task.priority)}`}>
                {task.priority}
              </span>
              <span className="text-xs text-gray-500">⏱ {task.estimatedTime}</span>
            </div>
            {task.description && (
              <p className="text-sm text-gray-400 mt-1">{task.description}</p>
            )}
          </div>
        </div>
      </div>
      {task.expanded && task.subtasks?.map((st) => renderTask(st, depth + 1))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c0a1d] to-[#1a0a2e] text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-black/30 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-xl">📋</div>
            <div>
              <h1 className="text-xl font-bold">AI Task Planner</h1>
              <p className="text-xs text-gray-400">Powered by Mimo V2.5 Pro</p>
            </div>
          </div>
          {tasks.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">{getProgress()}% complete</span>
              <button onClick={exportJSON} className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 text-sm transition-all">
                Export JSON
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Input Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">🎯 Describe Your Project</h2>
          <input
            type="text"
            placeholder="Project name (e.g., E-commerce Platform)"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none mb-3"
          />
          <textarea
            placeholder="Describe your project in detail. What do you want to build? What are the key features? What's the tech stack?"
            value={projectDesc}
            onChange={(e) => setProjectDesc(e.target.value)}
            rows={4}
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none mb-4"
          />
          <button
            onClick={decompose}
            disabled={loading || !projectDesc.trim()}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 text-white font-medium hover:from-purple-600 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Decomposing...
              </span>
            ) : '🪄 Decompose Project'}
          </button>
        </div>

        {/* Progress Bar */}
        {tasks.length > 0 && (
          <div className="mb-6">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all duration-500"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>
        )}

        {/* Streaming Output */}
        {streaming && tasks.length === 0 && (
          <div ref={outputRef} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">{streaming}</pre>
          </div>
        )}

        {/* Task List */}
        {tasks.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold mb-4">📝 Tasks ({tasks.length})</h2>
            {tasks.map((task) => renderTask(task))}
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && !loading && !streaming && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">🪄</div>
            <p className="text-lg">Describe your project and let AI break it down into actionable tasks</p>
          </div>
        )}
      </main>
    </div>
  );
}
