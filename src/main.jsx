import React, {useEffect, useRef, useState} from 'react'
import {createRoot} from 'react-dom/client'
import {
  CalendarDays, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
  Circle, Clock3, Crosshair, LayoutDashboard, ListTodo, Pencil,
  Plus, Search, SlidersHorizontal, Sparkles, Trash2, X,
} from 'lucide-react'
import {formatDate, loadTasks, priorities, statuses, storageKey} from './tasks'
import './styles.css'

const notes = [
  {title: 'Make time for what matters', description: 'Choose one important task and give it your full attention before moving on.', theme: 'violet'},
  {title: 'Break big tasks into small steps', description: 'Pick a first step you can finish today. Give it a clear action and a due date.', theme: 'blue'},
  {title: 'Take a moment to reset', description: 'Review what you finished, clear your list, and set one priority for tomorrow.', theme: 'green'},
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <a href="#overview" className="brand"><span><Crosshair size={21} /></span>FocusBoard</a>
      <nav aria-label="Workspace">
        <p className="nav-label">Workspace</p>
        <a href="#overview" className="nav-overview"><LayoutDashboard size={18} /> Overview</a>
        <a href="#tasks"><ListTodo size={19} /> Tasks</a>
      </nav>
      <div className="profile"><span className="avatar">M</span><div><strong>Madan Kumar</strong><small>Personal workspace</small></div></div>
    </aside>
  )
}

function Summary({tasks}) {
  const inProgress = tasks.filter(task => task.status === 'In progress').length
  const completed = tasks.filter(task => task.status === 'Completed').length
  const percentage = tasks.length ? Math.round(completed * 100 / tasks.length) : 0
  return (
    <section className="summary" aria-label="Task statistics">
      {[
        ['Total tasks', tasks.length, ListTodo, 'purple'],
        ['In progress', inProgress, Clock3, 'amber'],
        ['Completed', completed, CheckCircle2, 'mint'],
        ['Completion rate', percentage + '%', Crosshair, 'sky'],
      ].map(([label, value, Icon, color]) => (
        <article className="stat" key={label}>
          <span className={'stat-icon ' + color}><Icon size={19} /></span>
          <div><p>{label}</p><strong>{value}</strong></div>
        </article>
      ))}
    </section>
  )
}

function FocusNotes() {
  const [active, setActive] = useState(0)
  const note = notes[active]
  function advance(offset) {
    setActive(index => (index + offset + notes.length) % notes.length)
  }
  return (
    <section className={'notes ' + note.theme} aria-label="Focus Notes" aria-roledescription="carousel"
      onKeyDown={event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          advance(event.key === 'ArrowLeft' ? -1 : 1)
        }
      }}>
      <div className="note-content" aria-live="polite">
        <p className="note-label"><Sparkles size={15} /> Focus Notes</p>
        <h2>{note.title}</h2>
        <p>{note.description}</p>
      </div>
      <div className="carousel-controls">
        <button className="icon-button" type="button" onClick={() => advance(-1)} aria-label="Previous note"><ChevronLeft size={19} /></button>
        <div className="dots">
          {notes.map((slide, index) => (
            <button key={slide.title} type="button" aria-label={'Show note ' + (index + 1)} aria-current={index === active ? 'true' : undefined} onClick={() => setActive(index)}><span /></button>
          ))}
        </div>
        <button className="icon-button" type="button" onClick={() => advance(1)} aria-label="Next note"><ChevronRight size={19} /></button>
      </div>
    </section>
  )
}

function TaskRow({task, onStatus, onEdit, onDelete}) {
  return (
    <li className="task-row">
      <div className="task-detail">
        <span className="row-symbol">{task.status === 'Completed' ? <CheckCircle2 size={19} /> : <Circle size={19} />}</span>
        <div><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}<span className="category">{task.category}</span></div>
      </div>
      <div className="task-meta">
        <div className={'status-control ' + task.status.toLowerCase().replaceAll(' ', '-')}>
          <select aria-label={'Status for ' + task.title} value={task.status} onChange={event => onStatus(task.id, event.target.value)}>
            {statuses.map(status => <option key={status}>{status}</option>)}
          </select>
          <ChevronDown size={13} />
        </div>
        <span className={'priority ' + task.priority.toLowerCase()}>{task.priority}</span>
        <span className="due"><CalendarDays size={15} />{formatDate(task.dueDate)}</span>
      </div>
      <div className="row-actions">
        <button className="icon-button" type="button" onClick={() => onEdit(task)} aria-label={'Edit ' + task.title}><Pencil size={16} /></button>
        <button className="icon-button delete-icon" type="button" onClick={() => onDelete(task)} aria-label={'Delete ' + task.title}><Trash2 size={16} /></button>
      </div>
    </li>
  )
}

const emptyTask = {title: '', description: '', category: '', status: statuses[0], priority: priorities[1], dueDate: ''}

function Modal({title, children, onClose}) {
  const dialog = useRef(null)
  useEffect(() => {
    const element = dialog.current
    const trigger = document.activeElement
    element.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
      if (trigger?.isConnected) trigger.focus()
      else document.getElementById('tasks-heading')?.focus()
    }
  }, [])
  return (
    <dialog ref={dialog} className="modal" aria-labelledby="dialog-title" onCancel={event => {event.preventDefault(); onClose()}}>
      <div className="modal-heading"><h2 id="dialog-title">{title}</h2><button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20} /></button></div>
      {children}
    </dialog>
  )
}

function TaskForm({task, onSave, onClose}) {
  const [draft, setDraft] = useState(task ?? emptyTask)
  const [error, setError] = useState(false)
  const titleField = useRef(null)
  function change(event) {
    const {name, value} = event.target
    setDraft(previous => ({...previous, [name]: value}))
    if (name === 'title' && value.trim()) setError(false)
  }
  function submit(event) {
    event.preventDefault()
    const title = draft.title.trim()
    if (!title) {
      setError(true)
      titleField.current.focus()
      return
    }
    onSave({...draft, title, description: draft.description.trim(), category: draft.category.trim() || 'General'})
  }
  return (
    <Modal title={task ? 'Edit task' : 'Create task'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <label htmlFor="title">Title <span aria-hidden="true">*</span></label>
        <input ref={titleField} id="title" autoFocus required name="title" value={draft.title} onChange={change}
          maxLength={120} placeholder="Enter task title" aria-invalid={error} aria-describedby={error ? 'title-error' : undefined} />
        {error && <p id="title-error" className="field-error" role="alert">Enter a title to save this task.</p>}
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" value={draft.description} onChange={change} maxLength={500} rows={4} placeholder="Add a short description" />
        <label htmlFor="category">Category</label>
        <input id="category" name="category" value={draft.category} onChange={change} maxLength={40} placeholder="General" />
        <div className="form-grid">
          <div><label htmlFor="form-status">Status</label><select id="form-status" name="status" value={draft.status} onChange={change}>{statuses.map(status => <option key={status}>{status}</option>)}</select></div>
          <div><label htmlFor="form-priority">Priority</label><select id="form-priority" name="priority" value={draft.priority} onChange={change}>{priorities.map(priority => <option key={priority}>{priority}</option>)}</select></div>
        </div>
        <label htmlFor="date">Due date</label>
        <input id="date" type="date" name="dueDate" value={draft.dueDate} onChange={change} />
        <div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button type="submit" className="primary">{task ? 'Save changes' : 'Create task'}</button></div>
      </form>
    </Modal>
  )
}

function App() {
  const [tasks, setTasks] = useState(loadTasks)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All tasks')
  const [priority, setPriority] = useState('')
  const [modal, setModal] = useState(null)
  const [storageError, setStorageError] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(tasks))
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }, [tasks])

  const matching = tasks.filter(task =>
    task.title.toLowerCase().includes(query.trim().toLowerCase()) &&
    (status === 'All tasks' || task.status === status) &&
    (!priority || task.priority === priority),
  )

  function saveTask(draft) {
    if (draft.id) {
      setTasks(previous => previous.map(task => task.id === draft.id ? draft : task))
    } else {
      const task = {...draft, id: crypto.randomUUID()}
      setTasks(previous => [task, ...previous])
      setQuery('')
      setPriority('')
      setStatus('All tasks')
    }
    setAnnouncement(draft.id ? 'Task updated.' : 'Task created.')
    setModal(null)
  }

  function updateStatus(id, nextStatus) {
    setTasks(previous => previous.map(task => task.id === id ? {...task, status: nextStatus} : task))
    setAnnouncement('Task status changed to ' + nextStatus + '.')
  }

  function deleteTask() {
    setTasks(previous => previous.filter(task => task.id !== modal.task.id))
    setAnnouncement('Task deleted.')
    setModal(null)
  }

  return (
    <div className="layout">
      <a className="skip-link" href="#main">Skip to dashboard</a>
      <Sidebar />
      <div className="workspace">
        <header className="topbar">
          <span><LayoutDashboard size={17} /> Dashboard</span>
          <button className="primary" type="button" onClick={() => setModal({type: 'form'})}><Plus size={18} /> New task</button>
        </header>
        <main id="main">
          <section id="overview" aria-labelledby="overview-heading">
            <div className="page-heading"><h1 id="overview-heading">Overview</h1><p>Track your tasks and see what’s moving forward.</p></div>
            <Summary tasks={tasks} />
          </section>
          <FocusNotes />
          {storageError && <p className="storage-error" role="alert">Browser storage is unavailable. Changes may be lost when you refresh.</p>}
          <section id="tasks" className="tasks" aria-labelledby="tasks-heading">
            <div className="tasks-heading"><h2 id="tasks-heading" tabIndex={-1}>My tasks</h2><span>{matching.length} {matching.length === 1 ? 'task' : 'tasks'}</span></div>
            <div className="toolbar">
              <div className="status-tabs" role="group" aria-label="Filter by status">
                {['All tasks', ...statuses].map(tab => <button key={tab} type="button" aria-pressed={tab === status} onClick={() => setStatus(tab)}>{tab}</button>)}
              </div>
              <div className="filters">
                <label className="search"><Search size={17} /><input type="search" placeholder="Search tasks" aria-label="Search by task title" value={query} onChange={event => setQuery(event.target.value)} /></label>
                <label className="priority-filter"><SlidersHorizontal size={16} /><select value={priority} aria-label="Filter by priority" onChange={event => setPriority(event.target.value)}><option value="">Priority</option>{priorities.map(value => <option key={value}>{value}</option>)}</select></label>
              </div>
            </div>
            <ul className="task-list">
              {matching.map(task => <TaskRow key={task.id} task={task} onStatus={updateStatus} onEdit={item => setModal({type: 'form', task: item})} onDelete={item => setModal({type: 'delete', task: item})} />)}
            </ul>
            {!matching.length && <p className="empty">{tasks.length ? 'No tasks match your search and filters.' : 'Your task list is empty. Create a task to get started.'}</p>}
          </section>
        </main>
      </div>
      <div className="sr-only" role="status">{announcement}</div>
      {modal?.type === 'form' && <TaskForm task={modal.task} onSave={saveTask} onClose={() => setModal(null)} />}
      {modal?.type === 'delete' && (
        <Modal title="Delete task?" onClose={() => setModal(null)}>
          <p className="delete-copy">Remove “{modal.task.title}” from your board? This action cannot be undone.</p>
          <div className="modal-actions"><button autoFocus type="button" className="secondary" onClick={() => setModal(null)}>Cancel</button><button type="button" className="danger" onClick={deleteTask}>Delete task</button></div>
        </Modal>
      )}
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
