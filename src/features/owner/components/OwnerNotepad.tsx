import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, GripVertical, NotebookPen, Pin, Save, SquarePen, Trash2 } from 'lucide-react';
import { ConfirmDeleteModal } from '@/components/common/ConfirmDeleteModal';

export interface OwnerNote {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  pinned?: boolean;
}

const STORAGE_KEY = 'wpp_owner_private_notes';
const HIDDEN_KEY = 'wpp_owner_notepad_hidden';

export function OwnerNotepad({ initialNotes }: { initialNotes: OwnerNote[] }) {
  const [notes, setNotes] = useState<OwnerNote[]>(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : initialNotes; }
    catch { return initialNotes; }
  });
  const [activeId, setActiveId] = useState<string | null>(notes[0]?.id || null);
  const [title, setTitle] = useState(notes[0]?.title || '');
  const [content, setContent] = useState(notes[0]?.content || '');
  const [status, setStatus] = useState('Saved');
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem(HIDDEN_KEY) === 'true'; }
    catch { return false; }
  });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [deleteNote, setDeleteNote] = useState<OwnerNote | null>(null);
  const dirty = useRef(false);

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)), [notes]);

  useEffect(() => {
    const selected = notes.find((note) => note.id === activeId);
    if (!selected) return;
    dirty.current = false;
    setTitle(selected.title);
    setContent(selected.content);
    setStatus('Saved');
  }, [activeId]);

  useEffect(() => {
    if (!dirty.current || !activeId) return;
    setStatus('Saving…');
    const timer = window.setTimeout(() => {
      setNotes((current) => current.map((note) => note.id === activeId ? { ...note, title: title.trim() || 'Untitled Note', content, updatedAt: new Date().toISOString() } : note));
      dirty.current = false;
      setStatus('Saved');
    }, 500);
    return () => window.clearTimeout(timer);
  }, [activeId, content, title]);

  const saveNow = () => {
    if (!activeId) return;
    setNotes((current) => current.map((note) => note.id === activeId ? { ...note, title: title.trim() || 'Untitled Note', content, updatedAt: new Date().toISOString() } : note));
    dirty.current = false;
    setStatus('Saved just now');
  };

  const createNote = () => {
    saveNow();
    const note: OwnerNote = { id: `note-${Date.now()}`, title: 'New Private Note', content: '', updatedAt: new Date().toISOString(), pinned: false };
    setNotes((current) => [note, ...current]);
    setActiveId(note.id);
  };

  const confirmDelete = () => {
    if (!deleteNote) return;
    const remaining = notes.filter((note) => note.id !== deleteNote.id);
    setNotes(remaining);
    if (activeId === deleteNote.id) setActiveId(remaining[0]?.id || null);
    setDeleteNote(null);
  };

  const toggleHidden = () => {
    const next = !hidden;
    setHidden(next);
    localStorage.setItem(HIDDEN_KEY, String(next));
  };

  if (hidden) return <section className="flex items-center justify-between gap-3 rounded-3xl border border-[#dfd9d2] bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-rose-50 text-rose-700"><NotebookPen className="size-6" /></span><div><h3 className="text-base font-black text-slate-900">Private Notepad</h3><p className="text-sm text-slate-600">{notes.length} {notes.length === 1 ? 'note' : 'notes'} hidden</p></div></div><button onClick={toggleHidden} className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-bold text-rose-800 hover:bg-rose-100"><Eye className="size-5" />Show Notepad</button></section>;

  return <section className="space-y-4 rounded-3xl border border-[#dfd9d2] bg-white p-4 shadow-sm sm:p-6">
    <header className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-rose-50 text-rose-700"><NotebookPen className="size-6" /></span><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black text-slate-900">Owner Private Notepad</h3><span className="text-sm font-semibold text-slate-500">{status}</span></div><p className="text-sm leading-relaxed text-slate-600">Private ideas, vendor pricing, meeting notes and studio strategy.</p></div></div><div className="flex gap-2"><button onClick={toggleHidden} className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200"><EyeOff className="size-5" />Hide</button><button onClick={createNote} className="flex items-center gap-2 rounded-xl bg-[#8f3655] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#762944]"><SquarePen className="size-5" />New Note</button></div></header>

    <div className="grid min-h-96 grid-cols-1 gap-4 md:grid-cols-3">
      <aside className="max-h-[440px] space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3"><p className="px-2 text-sm font-extrabold uppercase tracking-wider text-slate-500">Saved Notes ({notes.length})</p>{notes.length === 0 ? <button onClick={createNote} className="w-full rounded-xl border border-dashed border-rose-200 bg-white py-8 text-sm font-bold text-rose-700">Create your first note</button> : notes.map((note, index) => <article key={note.id} draggable onDragStart={() => setDraggedIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedIndex === null || draggedIndex === index) return; setNotes((current) => { const copy = [...current]; const [moved] = copy.splice(draggedIndex, 1); copy.splice(index, 0, moved); return copy; }); setDraggedIndex(null); }} onClick={() => { saveNow(); setActiveId(note.id); }} className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3.5 transition ${activeId === note.id ? 'border-[#8f3655] bg-[#8f3655] text-white' : 'border-slate-200 bg-white text-slate-900 hover:border-rose-200'}`}><GripVertical className="mt-0.5 size-5 shrink-0 opacity-60" /><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5">{note.pinned && <Pin className="size-4 text-amber-400" />}<h4 className="truncate text-sm font-extrabold">{note.title || 'Untitled Note'}</h4></div><p className={`mt-1 truncate text-sm ${activeId === note.id ? 'text-rose-100' : 'text-slate-600'}`}>{note.content || 'Empty note'}</p></div><div className="flex shrink-0"><button title={note.pinned ? 'Unpin note' : 'Pin note'} onClick={(event) => { event.stopPropagation(); setNotes((current) => current.map((item) => item.id === note.id ? { ...item, pinned: !item.pinned } : item)); }} className="rounded p-1.5 hover:bg-black/10"><Pin className="size-4" /></button><button title="Delete note" onClick={(event) => { event.stopPropagation(); setDeleteNote(note); }} className="rounded p-1.5 hover:bg-red-500/15 hover:text-red-500"><Trash2 className="size-4" /></button></div></article>)}</aside>
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">{activeId ? <><div className="flex gap-2"><input value={title} onChange={(event) => { dirty.current = true; setTitle(event.target.value); }} placeholder="Note title" className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-lg font-black text-slate-900 outline-none focus:ring-2 focus:ring-rose-500" /><button onClick={saveNow} className="flex items-center gap-2 rounded-xl bg-[#8f3655] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#762944]"><Save className="size-5" />Save</button></div><textarea value={content} onChange={(event) => { dirty.current = true; setContent(event.target.value); }} placeholder="Write your private studio notes…" className="min-h-72 flex-1 resize-none rounded-xl border border-slate-300 bg-white p-4 font-mono text-base leading-relaxed text-slate-900 outline-none focus:ring-2 focus:ring-rose-500" /></> : <button onClick={createNote} className="m-auto flex flex-col items-center gap-2 text-base font-bold text-slate-500"><SquarePen className="size-9" />Create a new note</button>}</div>
    </div>
    <ConfirmDeleteModal isOpen={!!deleteNote} title="Delete Private Note" itemTitle={deleteNote?.title || ''} onConfirm={confirmDelete} onCancel={() => setDeleteNote(null)} />
  </section>;
}
