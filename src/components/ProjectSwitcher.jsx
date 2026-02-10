import { useState, useEffect } from 'react';
import { getAllProjects, createProject, deleteProject, switchProject, getActiveProject } from '../db';
import { FolderOpen, Plus, Trash2, Check } from 'lucide-react';

export default function ProjectSwitcher({ onSwitch }) {
  const [projects, setProjects] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const all = await getAllProjects();
    setProjects(all);
    const active = await getActiveProject();
    setActiveId(active?.id);
  }

  async function handleCreate() {
    if (newName.trim()) {
      const id = await createProject({ name: newName.trim() });
      await switchProject(id);
      setNewName('');
      setShowAdd(false);
      loadProjects();
      if (onSwitch) onSwitch();
    }
  }

  async function handleSwitch(id) {
    await switchProject(id);
    setActiveId(id);
    if (onSwitch) onSwitch();
  }

  async function handleDelete(id) {
    if (projects.length <= 1) {
      alert("Can't delete your only project!");
      return;
    }
    if (confirm('Delete this project and all its data? This cannot be undone.')) {
      await deleteProject(id);
      if (id === activeId) {
        const remaining = projects.filter(p => p.id !== id);
        if (remaining.length > 0) {
          await switchProject(remaining[0].id);
        }
      }
      loadProjects();
      if (onSwitch) onSwitch();
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-amber-400" />
          Projects
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${showAdd ? 'bg-amber-500 text-gray-900' : 'bg-gray-700'}`}
        >
          <Plus className="w-3 h-3" /> New
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Project name..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
            autoFocus
          />
          <button onClick={handleCreate} className="px-3 py-1 bg-amber-500 text-gray-900 rounded text-sm">
            Create
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto space-y-1">
        {projects.map(project => (
          <div
            key={project.id}
            className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
              project.id === activeId ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-gray-800 hover:bg-gray-700'
            }`}
            onClick={() => handleSwitch(project.id)}
          >
            {project.id === activeId && <Check className="w-4 h-4 text-amber-400" />}
            <span className="flex-1">{project.name}</span>
            <button
              onClick={e => { e.stopPropagation(); handleDelete(project.id); }}
              className="p-1 hover:bg-gray-600 rounded opacity-50 hover:opacity-100"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
        Each project has its own entities, events, scenes, and settings.
      </div>
    </div>
  );
}
