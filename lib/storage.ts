import { Task, Project } from '@/types'

const PROJECTS_KEY = 'ai-task-planner-projects'
const TASKS_KEY = 'ai-task-planner-tasks'

export const storage = {
  // Projects
  getProjects: (): Project[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(PROJECTS_KEY)
    return data ? JSON.parse(data) : []
  },

  saveProjects: (projects: Project[]): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
  },

  addProject: (project: Project): void => {
    const projects = storage.getProjects()
    projects.push(project)
    storage.saveProjects(projects)
  },

  updateProject: (updatedProject: Project): void => {
    const projects = storage.getProjects()
    const index = projects.findIndex(p => p.id === updatedProject.id)
    if (index !== -1) {
      projects[index] = updatedProject
      storage.saveProjects(projects)
    }
  },

  deleteProject: (projectId: string): void => {
    const projects = storage.getProjects()
    storage.saveProjects(projects.filter(p => p.id !== projectId))
    // Also delete all tasks in this project
    const tasks = storage.getTasks()
    storage.saveTasks(tasks.filter(t => t.projectId !== projectId))
  },

  // Tasks
  getTasks: (): Task[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(TASKS_KEY)
    return data ? JSON.parse(data) : []
  },

  saveTasks: (tasks: Task[]): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  },

  addTask: (task: Task): void => {
    const tasks = storage.getTasks()
    tasks.push(task)
    storage.saveTasks(tasks)
  },

  updateTask: (updatedTask: Task): void => {
    const tasks = storage.getTasks()
    const index = tasks.findIndex(t => t.id === updatedTask.id)
    if (index !== -1) {
      tasks[index] = updatedTask
      storage.saveTasks(tasks)
    }
  },

  deleteTask: (taskId: string): void => {
    const tasks = storage.getTasks()
    storage.saveTasks(tasks.filter(t => t.id !== taskId))
  },

  getTasksByProject: (projectId: string): Task[] => {
    return storage.getTasks().filter(t => t.projectId === projectId)
  },
}
