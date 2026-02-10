import { useState, useEffect } from 'react';
import { 
  getAllThemes, createTheme, updateTheme, deleteTheme,
  getThemeOccurrences, addThemeOccurrence, removeThemeOccurrence,
  getAllScenes, getAllEvents
} from '../db';
import { Palette, Plus, X, Tag } from 'lucide-react';

const THEME_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', 
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'
];

export default function ThemeTracker({ entities }) {
  const [themes, setThemes] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [occurrences, setOccurrences] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTheme, setNewTheme] = useState({ name: '', description: '', color: THEME_COLORS[0] });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTheme) {
      loadOccurrences(selectedTheme.id);
    }
  }, [selectedTheme]);

  async function loadData() {
    const t = await getAllThemes();
    setThemes(t);
    const s = await getAllScenes();
    setScenes(s);
    const e = await getAllEvents();
    setEvents(e);
  }

  async function loadOccurrences(themeId) {
    const o = await getThemeOccurrences(themeId);
    setOccurrences(o);
  }

  async function handleCreate() {
    if (newTheme.name) {
      await createTheme(newTheme);
      setNewTheme({ name: '', description: '', color: THEME_COLORS[0] });
      setShowAdd(false);
      loadData();
    }
  }

  async function handleDelete(id) {
    if (confirm('Delete this theme?')) {
      await deleteTheme(id);
      if (selectedTheme?.id === id) setSelectedTheme(null);
      loadData();
    }
  }

  async function handleAddOccurrence(type, id) {
    if (!selectedTheme) return;
    const occurrence = { themeId: selectedTheme.id };
    if (type === 'scene') occurrence.sceneId = id;
    if (type === 'event') occurrence.eventId = id;
    if (type === 'entity') occurrence.entityId = id;
    await addThemeOccurrence(occurrence);
    loadOccurrences(selectedTheme.id);
  }

  async function handleRemoveOccurrence(id) {
    await removeThemeOccurrence(id);
    loadOccurrences(selectedTheme.id);
  }

  function getItemName(occ) {
    if (occ.sceneId) return scenes.find(s => s.id === occ.sceneId)?.title || 'Scene';
    if (occ.eventId) return events.find(e => e.id === occ.eventId)?.title || 'Event';
    if (occ.entityId) return entities.find(e => e.id === occ.entityId)?.name || 'Entity';
    return 'Unknown';
  }

  function getItemType(occ) {
    if (occ.sceneId) return 'scene';
    if (occ.eventId) return 'event';
    if (occ.entityId) return 'entity';
    return 'unknown';
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="w-6 h-6 text-amber-400" />
          Theme Tracker
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
            showAdd ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Plus className="w-4 h-4" />
          Add Theme
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="space-y-3">
            <input
              type="text"
              value={newTheme.name}
              onChange={e => setNewTheme({ ...newTheme, name: e.target.value })}
              placeholder="Theme name (e.g., Redemption, Power corrupts)"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            />
            <textarea
              value={newTheme.description}
              onChange={e => setNewTheme({ ...newTheme, description: e.target.value })}
              placeholder="Description..."
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm resize-none"
              rows={2}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Color:</span>
              {THEME_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setNewTheme({ ...newTheme, color })}
                  className={`w-6 h-6 rounded-full ${newTheme.color === color ? 'ring-2 ring-white' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <button
              onClick={handleCreate}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded font-medium text-sm"
            >
              Add Theme
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Themes List */}
        <div className="w-64 overflow-auto space-y-2">
          {themes.map(theme => (
            <div
              key={theme.id}
              onClick={() => setSelectedTheme(theme)}
              className={`p-3 rounded-lg cursor-pointer ${
                selectedTheme?.id === theme.id 
                  ? 'bg-gray-700 ring-2' 
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
              style={{ borderColor: theme.color, ringColor: theme.color }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.color }} />
                <span className="font-medium">{theme.name}</span>
              </div>
              {theme.description && (
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{theme.description}</p>
              )}
            </div>
          ))}
          {themes.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No themes yet</p>
          )}
        </div>

        {/* Theme Details */}
        {selectedTheme ? (
          <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 p-4 overflow-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedTheme.color }} />
                <h3 className="text-lg font-semibold">{selectedTheme.name}</h3>
              </div>
              <button onClick={() => handleDelete(selectedTheme.id)} className="text-gray-400 hover:text-red-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            {selectedTheme.description && (
              <p className="text-gray-400 mb-4">{selectedTheme.description}</p>
            )}

            {/* Occurrences */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Where this theme appears ({occurrences.length})
              </h4>
              <div className="space-y-1">
                {occurrences.map(occ => (
                  <div key={occ.id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500 uppercase">{getItemType(occ)}</span>
                      <span>{getItemName(occ)}</span>
                    </div>
                    <button onClick={() => handleRemoveOccurrence(occ.id)} className="text-gray-500 hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Occurrence */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Link to...</h4>
              <div className="grid grid-cols-3 gap-2">
                <select
                  onChange={e => e.target.value && handleAddOccurrence('scene', Number(e.target.value))}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  value=""
                >
                  <option value="">Add scene...</option>
                  {scenes.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
                <select
                  onChange={e => e.target.value && handleAddOccurrence('event', Number(e.target.value))}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  value=""
                >
                  <option value="">Add event...</option>
                  {events.map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
                <select
                  onChange={e => e.target.value && handleAddOccurrence('entity', Number(e.target.value))}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  value=""
                >
                  <option value="">Add character...</option>
                  {entities.filter(e => e.type === 'character').map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a theme to see where it appears
          </div>
        )}
      </div>
    </div>
  );
}
