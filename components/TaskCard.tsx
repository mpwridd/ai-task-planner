'use client'

import { useState } from 'react'
import { Task, TaskPriority, TaskStatus } from '@/types'

interface TaskCardProps {
  task: Task
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
  onMove: (taskId: string, newStatus: TaskStatus) => void
}

export default function TaskCard({ task, onUpdate, onDelete, onMove }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description || '')
  const [editPriority, setEditPriority] = useState<TaskPriority>(task.priority)
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '')

  const priorityColors = {
    low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-red-100 text-red-700 border-red-200',
  }

  const priorityDots = {
    low: 'bg-emerald-500',
    medium: 'bg-amber-500',
    high: 'bg-red-500',
  }

  const statusOrder: TaskStatus[] = ['todo', 'in-progress', 'done']

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate({
        ...task,
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        priority: editPriority,
        dueDate: editDueDate || undefined,
        updatedAt: new Date().toISOString(),
      })
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditTitle(task.title)
    setEditDescription(task.description || '')
    setEditPriority(task.priority)
    setEditDueDate(task.dueDate || '')
    setIsEditing(false)
  }

  const getMoveButtons = () => {
    const currentIndex = statusOrder.indexOf(task.status)
    const buttons = []

    if (currentIndex > 0) {
      buttons.push(
        <button
          key="left"
          onClick={() => onMove(task.id, statusOrder[currentIndex - 1])}
          className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          title={`Move to ${statusOrder[currentIndex - 1].replace('-', ' ')}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )
    }

    if (currentIndex < statusOrder.length - 1) {
      buttons.push(
        <button
          key="right"
          onClick={() => onMove(task.id, statusOrder[currentIndex + 1])}
          className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          title={`Move to ${statusOrder[currentIndex + 1].replace('-', ' ')}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )
    }

    return buttons
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg border-2 border-primary-300 p-3 animate-fade-in">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium mb-2"
          placeholder="Task title"
          autoFocus
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs resize-none mb-2"
          placeholder="Description (optional)"
          rows={2}
        />
        <div className="flex gap-2 mb-2">
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
            className="flex-1 px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            className="flex-1 px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-3 py-1.5 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors text-xs font-medium"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-md transition-shadow group animate-slide-up">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${priorityDots[task.priority]}`} />
          <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {getMoveButtons()}
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this task?')) {
                onDelete(task.id)
              }
            }}
            className="p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <h4 className={`text-sm font-medium text-slate-800 mb-1 ${task.status === 'done' ? 'line-through text-slate-500' : ''}`}>
        {task.title}
      </h4>

      {task.description && (
        <p className="text-xs text-slate-500 mb-2 line-clamp-2">{task.description}</p>
      )}

      {task.dueDate && (
        <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {isOverdue && ' (overdue)'}
          </span>
        </div>
      )}
    </div>
  )
}
