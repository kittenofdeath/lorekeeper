import { useState, useEffect } from 'react';
import { getAllDialogues, createDialogue, updateDialogue, deleteDialogue, getAllScenes } from '../db';
import { MessageSquare, Plus, X, Users, Star } from 'lucide-react';

export default function DialogueLog({ entities }) {
  const [dialogues, setDialogues] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newDialogue, setNewDialogue] = useState({
    participants: [],
    summary: '',
    importance: 'normal',
    tags: ''
  });

  const characters = entities.filter(e => e.type === 'character');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const d = await getAllDialogues();
    setDialogues(d);
    const s = await getAllScenes();
    setScenes(s);
  }

  async function handleCreate() {
    if (newDialogue.summary && newDialogue.participants.length >= 2) {
      await createDialogue(newDialogue);
      setNewDialogue({ participants: [], summary: '', importance: 'normal', tags: '' });
      setShowAdd(false);
      loadData();
    }
  }

  async function handleDelete(id) {
    if (confirm('Delete this dialogue?')) {
      await deleteDialogue(id);
      loadData();
    }
  }

  function toggleParticipant(id) {
    const current = newDialogue.participants || [];
    if (current.includes(id)) {
      setNewDialogue({ ...newDialogue, participants: current.filter(p => p !== id) });
    } else {
      setNewDialogue({ ...newDialogue, participants: [...current, id] });
    }
  }

  function getCharName(id) {
    return characters.find(c => c.id === id)?.name || `#${id}`;
  }

  function getSceneName(id) {
    return scenes.find(s => s.id === id)?.title || 'Unknown scene';
  }

  const IMPORTANCE_COLORS = {
    minor: 'border-gray-600 bg-gray-800',
    normal: 'border-blue-500/30 bg-blue-500/10',
    major: 'border-amber-500/30 bg-amber-500/10',
    critical: 'border-red-500/30 bg-red-500/10',
  };

  const filteredDialogues = filter === 'all' 
    ? dialogues 
    : dialogues.filter(d => d.importance === filter);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-amber-400" />
          Dialogue Log
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
            showAdd ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Plus className="w-4 h-4" />
          Log Conversation
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Participants (select 2+)</label>
              <div className="flex flex-wrap gap-2">
                {characters.map(char => (
                  <button
                    key={char.id}
                    onClick={() => toggleParticipant(char.id)}
                    className={`px-2 py-1 rounded text-sm ${
                      newDialogue.participants?.includes(char.id)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {char.name}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={newDialogue.summary}
              onChange={e => setNewDialogue({ ...newDialogue, summary: e.target.value })}
              placeholder="Summarize the conversation..."
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm resize-none"
              rows={3}
            />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Importance</label>
                <select
                  value={newDialogue.importance}
                  onChange={e => setNewDialogue({ ...newDialogue, importance: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                >
                  <option value="minor">Minor</option>
                  <option value="normal">Normal</option>
                  <option value="major">Major</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Scene (optional)</label>
                <select
                  value={newDialogue.sceneId || ''}
                  onChange={e => setNewDialogue({ ...newDialogue, sceneId: e.target.value ? Number(e.target.value) : null })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                >
                  <option value="">Not linked</option>
                  {scenes.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tags</label>
                <input
                  type="text"
                  value={newDialogue.tags}
                  onChange={e => setNewDialogue({ ...newDialogue, tags: e.target.value })}
                  placeholder="confession, threat, deal..."
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                />
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={newDialogue.participants.length < 2 || !newDialogue.summary}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded font-medium text-sm disabled:opacity-50"
            >
              Log Conversation
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['all', 'critical', 'major', 'normal', 'minor'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-sm ${
              filter === f ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Dialogues List */}
      <div className="flex-1 overflow-auto">
        {filteredDialogues.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No conversations logged yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDialogues.map(dialogue => (
              <div
                key={dialogue.id}
                className={`p-4 rounded-lg border ${IMPORTANCE_COLORS[dialogue.importance]}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">
                        {dialogue.participants?.map(id => getCharName(id)).join(' & ')}
                      </span>
                      {dialogue.importance === 'critical' && (
                        <Star className="w-4 h-4 text-red-400 fill-red-400" />
                      )}
                    </div>
                    <p className="text-gray-200">{dialogue.summary}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      {dialogue.sceneId && <span>Scene: {getSceneName(dialogue.sceneId)}</span>}
                      {dialogue.tags && <span>Tags: {dialogue.tags}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(dialogue.id)}
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
