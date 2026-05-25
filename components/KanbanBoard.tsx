'use client'

import { useState } from 'react'
import { Task, TaskStatus, TaskPriority, Project } from '@/types'
import TaskCard from './TaskCard'

interface KanbanBoardProps {
  tasks: Task[]
  projects: Project[]
  selectedProjectId: string | null
  onUpdateTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void
  onGeneratePlan: (goal: string) => Promise<void>
  isGenerating: boolean
}

const columns: { id: TaskStatus; title: string; icon: string; color: string }[] = [
  { id: 'todo', title: 'To Do', icon: '📋', color: 'border-t-blue-500' },
  { id: 'in-progress', title: 'In Progress', icon: '🔄', color: 'border-t-amber-500' },
  { id: 'done', title: 'Done', icon: '✅', color: 'border-t-emerald-500' },
]

export default function KanbanBoard({
  tasks,
  projects,
  selectedProjectId,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
  onMoveTask,
  onGeneratePlan,
  isGenerating,
}: KanbanBoardProps) {
  const [isAddingTask, setIsAddingTask] = useState<TaskStatus | null>(null)
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [aiGoal, setAiGoal] = useState('')
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    dueDate: '',
  })

  const filteredTasks = selectedProjectId
    ? tasks.filter(t => t.projectId === selectedProjectId)
    : tasks

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  const handleAddTask = (status: TaskStatus) => {
    if (newTask.title.trim() && selectedProjectId) {
      onAddTask({
        title: newTask.title.trim(),
        description: newTask.description.trim() || undefined,
        status,
        priority: newTask.priority,
        dueDate: newTask.dueDate || undefined,
        projectId: selectedProjectId,
      })
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' })
      setIsAddingTask(null)
    }
  }

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (aiGoal.trim()) {
      await onGeneratePlan(aiGoal.trim())
      setAiGoal('')
      setIsAIModalOpen(false)
    }
  }

  const getTaskCount = (status: TaskStatus) => {
    return filteredTasks.filter(t => t.status === status).length
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-slate-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-800">
              {selectedProject ? selectedProject.name : 'All Tasks'}
            </h1>
            {selectedProject && selectedProject.description && (
              <p className="text-sm text-slate-500 mt-1">{selectedProject.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            {selectedProjectId && (
              <>
                <button
                  onClick={() => setIsAddingTask('todo')}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Task
                </button>
                <button
                  onClick={() => setIsAIModalOpen(true)}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isGenerating ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      AI Plan
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 h-full min-h-0">
          {columns.map((column) => (
            <div
              key={column.id}
              className={`bg-slate-50 rounded-xl border-t-4 ${column.color} flex flex-col`}
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{column.icon}</span>
                  <h3 className="font-semibold text-slate-700">{column.title}</h3>
                  <span className="bg-slate-200 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {getTaskCount(column.id)}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pb-4 space-y-3">
                {filteredTasks
                  .filter(t => t.status === column.id)
                  .sort((a, b) => {
                    const priorityOrder = { high: 0, medium: 1, low: 2 }
                    return priorityOrder[a.priority] - priorityOrder[b.priority]
                  })
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdate={onUpdateTask}
                      onDelete={onDeleteTask}
                      onMove={onMoveTask}
                    />
                  ))}

                {isAddingTask === column.id && selectedProjectId && (
                  <div className="bg-white rounded-lg border-2 border-dashed border-primary-300 p-3 animate-fade-in">
                    <input
                      type="text"
                      placeholder="Task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm mb-2"
                      autoFocus
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs resize-none mb-2"
                      rows={2}
                    />
                    <div className="flex gap-2 mb-2">
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                        className="flex-1 px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        className="flex-1 px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddTask(column.id)}
                        className="flex-1 px-3 py-1.5 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors text-xs font-medium"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingTask(null)
                          setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' })
                        }}
                        className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {filteredTasks.filter(t => t.status === column.id).length === 0 && isAddingTask !== column.id && (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-sm">No tasks</p>
                    {selectedProjectId && (
                      <button
                        onClick={() => setIsAddingTask(column.id)}
                        className="text-xs text-primary-500 hover:text-primary-600 mt-1"
                      >
                        + Add one
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* No Project Selected Message */}
      {!selectedProjectId && tasks.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="text-lg font-medium text-slate-600 mb-2">Get Started</h3>
            <p className="text-sm text-slate-400 max-w-md">
              Create a project from the sidebar to start managing your tasks, or select an existing project to view its Kanban board.
            </p>
          </div>
        </div>
      )}

      {/* AI Plan Modal */}
      {isAIModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">AI Task Planner</h3>
                <p className="text-sm text-slate-500">Let AI break down your goal into tasks</p>
              </div>
            </div>

            <form onSubmit={handleAISubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Describe your goal
                </label>
                <textarea
                  value={aiGoal}
                  onChange={(e) => setAiGoal(e.target.value)}
                  placeholder="e.g., Launch a new marketing website for our SaaS product, including landing page, blog, and email capture..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={4}
                  autoFocus
                />
              </div>

              <div className="bg-purple-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-purple-700">
                  <strong>💡 Tip:</strong> Be specific about your goal. The more detail you provide, the better the task breakdown will be.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAIModalOpen(false)
                    setAiGoal('')
                  }}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!aiGoal.trim() || isGenerating}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : 'Generate Tasks'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
