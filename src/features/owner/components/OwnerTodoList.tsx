import { useEffect, useState } from 'react';
import { Calendar, ChevronDown, CirclePlus, ListTodo, Trash2 } from 'lucide-react';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';

interface TodoTask {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate?: string;
  category?: string;
  createdAt: string;
}

const INITIAL_TODOS: TodoTask[] = [
  { id: 'ot-1', title: 'Follow up on pending album approvals for Rohan & Ananya wedding', priority: 'high', completed: false, dueDate: '2026-08-06', category: 'Client Followup', createdAt: new Date().toISOString() },
  { id: 'ot-2', title: 'Review monthly equipment maintenance schedule & lens calibration', priority: 'medium', completed: false, dueDate: '2026-08-10', category: 'Studio Gear', createdAt: new Date().toISOString() },
  { id: 'ot-3', title: 'Check pending client installment payments & issue GST receipts', priority: 'high', completed: true, dueDate: '2026-08-05', category: 'Finance', createdAt: new Date().toISOString() },
  { id: 'ot-4', title: 'Update pricing catalog for upcoming festival pre-wedding season', priority: 'low', completed: false, dueDate: '2026-08-15', category: 'General', createdAt: new Date().toISOString() },
];

export function OwnerTodoList({ onPendingCountChange }: { onPendingCountChange: (count: number) => void }) {
  const [todos, setTodos] = useState<TodoTask[]>(() => {
    try { const saved = localStorage.getItem('wpp_owner_todo_list'); return saved ? JSON.parse(saved) : INITIAL_TODOS; }
    catch { return INITIAL_TODOS; }
  });
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TodoTask['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('General');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [deleteTask, setDeleteTask] = useState<TodoTask | null>(null);
  const pendingCount = todos.filter((task) => !task.completed).length;
  const filtered = todos.filter((task) => filter === 'all' || (filter === 'pending' ? !task.completed : task.completed));

  useEffect(() => { localStorage.setItem('wpp_owner_todo_list', JSON.stringify(todos)); onPendingCountChange(pendingCount); }, [onPendingCountChange, pendingCount, todos]);

  const addTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    setTodos((current) => [{ id: `ot-${Date.now()}`, title: title.trim(), priority, completed: false, dueDate: dueDate || undefined, category, createdAt: new Date().toISOString() }, ...current]);
    setTitle('');
    setDueDate('');
  };

  return <section className="space-y-4 rounded-3xl border border-[#dfd9d2] bg-white p-4 shadow-sm sm:p-6">
    <header className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-amber-100 text-amber-800"><ListTodo className="size-6" /></span><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black text-slate-900">To‑Do List & Tasks</h3><span className="rounded-full bg-amber-100 px-2.5 py-1 text-sm font-extrabold text-amber-900">{pendingCount} pending</span></div><p className="text-sm leading-relaxed text-slate-600">Private checklist for owner duties, follow-ups and studio tasks.</p></div></div><div className="flex rounded-xl bg-slate-100 p-1">{(['all', 'pending', 'completed'] as const).map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-lg px-3 py-1.5 text-sm font-bold capitalize ${filter === item ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>{item}</button>)}</div></header>
    <form onSubmit={addTask} className="grid grid-cols-1 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 md:grid-cols-[1fr_auto_auto_auto_auto]"><input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Write a new owner task…" className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500" /><div className="relative"><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-full w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-3 pr-10 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"><option>General</option><option>Finance</option><option>Client Followup</option><option>Studio Gear</option></select><ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-slate-600" /></div><div className="relative"><select value={priority} onChange={(event) => setPriority(event.target.value as TodoTask['priority'])} className="h-full w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-3 pr-10 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"><option value="high">High Priority</option><option value="medium">Medium Priority</option><option value="low">Low Priority</option></select><ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-slate-600" /></div><input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold" /><button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-amber-600"><CirclePlus className="size-5" />Add Task</button></form>
    <div className="space-y-2">{filtered.length === 0 ? <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm italic text-slate-500">No tasks match this filter.</p> : filtered.map((task) => <article key={task.id} className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${task.completed ? 'border-slate-200 bg-slate-50 opacity-60' : 'border-slate-200 bg-white hover:border-amber-200'}`}><div className="flex min-w-0 flex-1 items-center gap-3"><input type="checkbox" checked={task.completed} onChange={() => setTodos((current) => current.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item))} className="size-5 accent-amber-500" /><div className="min-w-0"><p className={`text-sm font-black leading-relaxed text-slate-900 ${task.completed ? 'line-through' : ''}`}>{task.title}</p><div className="mt-1.5 flex flex-wrap items-center gap-2"><span className={`rounded px-2.5 py-1 text-sm font-bold ${task.priority === 'high' ? 'bg-red-100 text-red-800' : task.priority === 'medium' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'}`}>{task.priority}</span>{task.category && <span className="rounded border border-rose-100 bg-rose-50 px-2.5 py-1 text-sm font-bold text-rose-700">{task.category}</span>}{task.dueDate && <span className="flex items-center gap-1.5 text-sm text-slate-600"><Calendar className="size-4" />{task.dueDate}</span>}</div></div></div><button onClick={() => setDeleteTask(task)} title="Delete task" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="size-5" /></button></article>)}</div>
    {todos.some((task) => task.completed) && <div className="flex justify-end"><button onClick={() => setTodos((current) => current.filter((task) => !task.completed))} className="text-sm font-bold text-slate-600 underline hover:text-slate-900">Clear completed</button></div>}
    <ConfirmDeleteModal isOpen={!!deleteTask} title="Delete Owner Task" itemTitle={deleteTask?.title || ''} onConfirm={() => { if (deleteTask) setTodos((current) => current.filter((task) => task.id !== deleteTask.id)); setDeleteTask(null); }} onCancel={() => setDeleteTask(null)} />
  </section>;
}
