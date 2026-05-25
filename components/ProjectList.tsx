'use client'

import { useState } from 'react'
import { Project, Task } from '@/types'

interface ProjectListProps {
  projects: Project[]
  tasks: Task[]
  selectedProjectId: string | null
  onSelectProject: (projectId: string | null) => void
  onAddProject: (name: string, description: string) => void
  onDeleteProject: (projectId: string) => void
}

export default function ProjectList({
  projects,
  tasks,
  selectedProjectId,
  onSelectProject,
  onAddProject,
  onDeleteProject,
}: ProjectListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId)
    if (projectTasks.length === 0) return 0
    const doneTasks = projectTasks.filter(t => t.status === 'done').length
    return Math.round((doneTasks / projectTasks.length) * 100)
  }

  const getProjectTaskCount = (projectId: string) => {
    return tasks.filter(t => t.projectId === projectId).length
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newName.trim()) {
      onAddProject(newName.trim(), newDescription.trim())
      setNewName('')
      setNewDescription('')
      setIsAdding(false)
    }
  }

  return (
    <div className="w-full lg:w-72 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Projects</h2>
          <button
            onClick={() => setIsAdding(true)}
            className="p-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            title="New Project"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-3 animate-fade-in">
            <input
              type="text"
              placeholder="Project name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              autoFocus
            />
            <textarea
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false)
                  setNewName('')
                  setNewDescription('')
                }}
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-2">
          <button
            onClick={() => onSelectProject(null)}
            className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
              selectedProjectId === null
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="text-sm font-medium">All Tasks</span>
            </div>
          </button>

          {projects.map((project) => {
            const progress = getProjectProgress(project.id)
            const taskCount = getProjectTaskCount(project.id)

            return (
              <div
                key={project.id}
                className={`group relative w-full text-left px-3 py-3 rounded-lg mb-1 transition-colors ${
                  selectedProjectId === project.id
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <button
                  onClick={() => onSelectProject(project.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate pr-2">{project.name}</span>
                    <span className="text-xs text-slate-500">{taskCount} tasks</span>
                  </div>
                  {project.description && (
                    <p className="text-xs text-slate-500 truncate mb-2">{project.description}</p>
                  )}
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 mt-1">{progress}% complete</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Delete this project and all its tasks?')) {
                      onDeleteProject(project.id)
                    }
                  }}
                  className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 text-slate-400 hover:text-red-500 transition-all"
                  title="Delete project"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )
          })}

          {projects.length === 0 && !isAdding && (
            <div className="text-center py-8 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p className="text-sm">No projects yet</p>
              <p className="text-xs mt-1">Click + to create one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
