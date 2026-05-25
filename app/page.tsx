'use client'

import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Project, Task, TaskStatus } from '@/types'
import { storage } from '@/lib/storage'
import ProjectList from '@/components/ProjectList'
import KanbanBoard from '@/components/KanbanBoard'

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedProjects = storage.getProjects()
    const loadedTasks = storage.getTasks()
    setProjects(loadedProjects)
    setTasks(loadedTasks)
    setIsLoaded(true)
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      storage.saveProjects(projects)
    }
  }, [projects, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      storage.saveTasks(tasks)
    }
  }, [tasks, isLoaded])

  const handleAddProject = useCallback((name: string, description: string) => {
    const newProject: Project = {
      id: uuidv4(),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setProjects(prev => [...prev, newProject])
    setSelectedProjectId(newProject.id)
  }, [])

  const handleDeleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId))
    setTasks(prev => prev.filter(t => t.projectId !== projectId))
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null)
    }
  }, [selectedProjectId])

  const handleAddTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTasks(prev => [...prev, newTask])
  }, [])

  const handleUpdateTask = useCallback((updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))
  }, [])

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }, [])

  const handleMoveTask = useCallback((taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
        : t
    ))
  }, [])

  const handleGeneratePlan = useCallback(async (goal: string) => {
    if (!selectedProjectId) return

    const project = projects.find(p => p.id === selectedProjectId)
    if (!project) return

    setIsGenerating(true)

    try {
      const response = await fetch('/api/ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, projectName: project.name }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate plan')
      }

      const data = await response.json()
      
      if (data.tasks && Array.isArray(data.tasks)) {
        const newTasks: Task[] = data.tasks.map((task: any) => ({
          id: uuidv4(),
          title: task.title,
          description: task.description,
          status: 'todo' as TaskStatus,
          priority: task.priority || 'medium',
          projectId: selectedProjectId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))
        
        setTasks(prev => [...prev, ...newTasks])
      }
    } catch (error) {
      console.error('Error generating plan:', error)
      alert('Failed to generate AI plan. Please check your API key and try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [selectedProjectId, projects])

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-pulse">
          <svg className="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <h1 className="text-lg font-bold text-slate-800">AI Task Planner</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar - Desktop always visible, mobile toggleable */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block`}>
        <ProjectList
          projects={projects}
          tasks={tasks}
          selectedProjectId={selectedProjectId}
          onSelectProject={(id) => {
            setSelectedProjectId(id)
            setIsMobileMenuOpen(false)
          }}
          onAddProject={handleAddProject}
          onDeleteProject={handleDeleteProject}
        />
      </div>

      {/* Main Content */}
      <KanbanBoard
        tasks={tasks}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onAddTask={handleAddTask}
        onMoveTask={handleMoveTask}
        onGeneratePlan={handleGeneratePlan}
        isGenerating={isGenerating}
      />
    </div>
  )
}
