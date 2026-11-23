export const statuses = ['To do', 'In progress', 'Completed']
export const priorities = ['High', 'Medium', 'Low']
export const storageKey = 'focusboard.tasks.v1'

export const sampleTasks = [
  {id: 'sample-1', title: 'Review homepage wireframes', description: 'Leave feedback on the latest desktop and mobile flows.', category: 'Design', status: 'In progress', priority: 'High', dueDate: '2026-11-24'},
  {id: 'sample-2', title: 'Write onboarding copy', description: 'Draft the welcome screen and setup instructions.', category: 'Content', status: 'To do', priority: 'Medium', dueDate: '2026-11-25'},
  {id: 'sample-3', title: 'Update component library', description: 'Document the new button styles and variants.', category: 'Design', status: 'Completed', priority: 'Low', dueDate: '2026-11-26'},
  {id: 'sample-4', title: 'Test mobile navigation', description: 'Verify the menu, keyboard navigation, and focus states.', category: 'Engineering', status: 'In progress', priority: 'High', dueDate: '2026-11-27'},
  {id: 'sample-5', title: 'Plan next week’s sprint', description: 'Prioritize the backlog and estimate upcoming work.', category: 'Planning', status: 'To do', priority: 'Medium', dueDate: '2026-11-30'},
  {id: 'sample-6', title: 'Share project update', description: 'Summarize milestones and decisions from this week.', category: 'Planning', status: 'Completed', priority: 'Low', dueDate: '2026-12-01'},
]

export function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey))
    if (Array.isArray(saved) && saved.every(task =>
      task && ['id', 'title', 'description', 'category', 'dueDate'].every(key => typeof task[key] === 'string') &&
      statuses.includes(task.status) && priorities.includes(task.priority),
    )) return saved
  } catch {
    // Storage can be unavailable or contain invalid JSON.
  }
  return sampleTasks
}

const dateFormatter = new Intl.DateTimeFormat('en', {month: 'short', day: 'numeric', year: 'numeric'})

export function formatDate(value) {
  if (!value) return 'No due date'
  const date = new Date(value + 'T00:00:00')
  return Number.isNaN(date.getTime()) ? 'No due date' : dateFormatter.format(date)
}
