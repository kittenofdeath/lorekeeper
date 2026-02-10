import { useState, useEffect } from 'react';
import { getAllPoems, createPoem, updatePoem, deletePoem, getActiveProject } from '../db';
import { Music, Plus, X, Edit2, Mic } from 'lucide-react';

const POEM_TYPES = [
  { id: 'song', label: 'Song', icon: '🎵' },
  { id: 'poem', label: 'Poem', icon: '📜' },
  { id: 'prophecy', label: 'Prophecy', icon: '🔮' },
  { id: 'rhyme', label: 'Rhyme/Saying', icon: '💬' },
  { id: 'chant', label: 'Chant/Prayer', icon: '🙏' },
];

export default function PoetryEditor({ entities }) {
  const [poems, setPoems] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [selectedPoem, setSelectedPoem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newPoem, setNewPoem] = useState({ title: '', content: '', type: 'song', performedBy: null, composedBy: null });

  const characters = entities.filter(e => e.type === 'character');

  useEffect(() => {
    loadPoems();
  }, []);

  async function loadPoems() {
    const project = await getActiveProject();
    if (project) {
      setProjectId(project.id);
      const p = await getAllPoems(project.id);
      setPoems(p);
    }
  }

  async function handleCreate() {
    if (newPoem.title && projectId) {
      await createPoem({ ...newPoem, projectId });
      setNewPoem({ title: '', content: '', type: 'song', performedBy: null, composedBy: null });
      setShowAdd(false);
      loadPoems();
    }
  }

  async function handleUpdate(id, updates) {
    await updatePoem(id, updates);
    if (selectedPoem?.id === id) {
      setSelectedPoem({ ...selectedPoem, ...updates });
    }
    loadPoems();
  }

  async function handleDelete(id) {
    if (confirm('Delete this poem/song?')) {
      await deletePoem(id);
      if (selectedPoem?.id === id) setSelectedPoem(null);
      loadPoems();
    }
  }

  function getCharName(id) {
    return characters.find(c => c.id === id)?.name || '';
  }

  const filteredPoems = filter === 'all' ? poems : poems.filter(p => p.type === filter);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Music className="w-5 h-5 text-amber-400" />
          Poetry & Songs
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${showAdd ? 'bg-amber-500 text-gray-900' : 'bg-gray-700'}`}
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-1 mb-4 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-2 py-1 rounded text-xs ${filter === 'all' ? 'bg-amber-500 text-gray-900' : 'bg-gray-700'}`}
        >
          All
        </button>
        {POEM_TYPES.map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-2 py-1 rounded text-xs ${filter === t.id ? 'bg-amber-500 text-gray-900' : 'bg-gray-700'}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {showAdd && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newPoem.title}
              onChange={e => setNewPoem({ ...newPoem, title: e.target.value })}
              placeholder="Title"
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            />
            <select
              value={newPoem.type}
              onChange={e => setNewPoem({ ...newPoem, type: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            >
              {POEM_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <button onClick={handleCreate} className="px-3 py-1 bg-amber-500 text-gray-900 rounded text-sm">Create</button>
        </div>
      )}

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* List */}
        <div className="w-56 overflow-auto space-y-1">
          {filteredPoems.map(poem => {
            const typeInfo = POEM_TYPES.find(t => t.id === poem.type);
            return (
              <div
                key={poem.id}
                onClick={() => setSelectedPoem(poem)}
                className={`p-2 rounded cursor-pointer ${selectedPoem?.id === poem.id ? 'bg-amber-500/20' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                <div className="flex items-center gap-1">
                  <span>{typeInfo?.icon}</span>
                  <span className="text-sm truncate">{poem.title}</span>
                </div>
              </div>
            );
          })}
          {filteredPoems.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No poems yet</p>}
        </div>

        {/* Editor */}
        {selectedPoem ? (
          <div className="flex-1 flex flex-col bg-gray-800 rounded-lg border border-gray-700 p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <input
                type="text"
                value={selectedPoem.title}
                onChange={e => handleUpdate(selectedPoem.id, { title: e.target.value })}
                className="text-lg font-bold bg-transparent border-b border-transparent hover:border-gray-600 focus:border-amber-500 focus:outline-none"
              />
              <button onClick={() => handleDelete(selectedPoem.id)} className="p-1 hover:bg-gray-700 rounded">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="flex gap-4 mb-3 text-sm">
              <div className="flex items-center gap-1">
                <Mic className="w-3 h-3 text-gray-400" />
                <select
                  value={selectedPoem.performedBy || ''}
                  onChange={e => handleUpdate(selectedPoem.id, { performedBy: e.target.value ? Number(e.target.value) : null })}
                  className="bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-xs"
                >
                  <option value="">Performed by...</option>
                  {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <Edit2 className="w-3 h-3 text-gray-400" />
                <select
                  value={selectedPoem.composedBy || ''}
                  onChange={e => handleUpdate(selectedPoem.id, { composedBy: e.target.value ? Number(e.target.value) : null })}
                  className="bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-xs"
                >
                  <option value="">Composed by...</option>
                  {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <textarea
              value={selectedPoem.content || ''}
              onChange={e => handleUpdate(selectedPoem.id, { content: e.target.value })}
              className="flex-1 bg-gray-900 border border-gray-700 rounded p-3 font-serif text-gray-200 leading-relaxed resize-none focus:outline-none focus:border-amber-500 italic"
              placeholder="Write your verse here...&#10;&#10;Each line on its own&#10;Like poetry should be&#10;With stanzas separated&#10;By empty lines"
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a poem or song to edit</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
