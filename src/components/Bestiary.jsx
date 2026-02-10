import { useState, useEffect } from 'react';
import { getAllCreatures, createCreature, updateCreature, deleteCreature } from '../db';
import { Bug, Plus, X, Leaf, Skull, Sparkles } from 'lucide-react';

export default function Bestiary({ spoilerMode }) {
  const [creatures, setCreatures] = useState([]);
  const [selectedCreature, setSelectedCreature] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newCreature, setNewCreature] = useState({
    name: '',
    type: 'beast',
    habitat: '',
    description: '',
    abilities: '',
    isSpoiler: false
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const c = await getAllCreatures();
    setCreatures(c);
  }

  async function handleCreate() {
    if (newCreature.name) {
      const id = await createCreature(newCreature);
      setNewCreature({ name: '', type: 'beast', habitat: '', description: '', abilities: '', isSpoiler: false });
      setShowAdd(false);
      loadData();
      setSelectedCreature({ ...newCreature, id });
    }
  }

  async function handleUpdate(id, updates) {
    await updateCreature(id, updates);
    loadData();
    if (selectedCreature?.id === id) {
      setSelectedCreature({ ...selectedCreature, ...updates });
    }
  }

  async function handleDelete(id) {
    if (confirm('Delete this creature?')) {
      await deleteCreature(id);
      if (selectedCreature?.id === id) setSelectedCreature(null);
      loadData();
    }
  }

  const TYPES = [
    { id: 'beast', label: 'Beast', icon: Bug },
    { id: 'monster', label: 'Monster', icon: Skull },
    { id: 'plant', label: 'Flora', icon: Leaf },
    { id: 'magical', label: 'Magical', icon: Sparkles },
  ];

  const filteredCreatures = creatures.filter(c => {
    if (!spoilerMode && c.isSpoiler) return false;
    if (filter === 'all') return true;
    return c.type === filter;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bug className="w-6 h-6 text-amber-400" />
          Bestiary & Flora
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
            showAdd ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Plus className="w-4 h-4" />
          Add Creature
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-amber-500 text-gray-900' : 'bg-gray-700'}`}
        >
          All ({creatures.length})
        </button>
        {TYPES.map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
              filter === t.id ? 'bg-amber-500 text-gray-900' : 'bg-gray-700'
            }`}
          >
            <t.icon className="w-3 h-3" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={newCreature.name}
              onChange={e => setNewCreature({ ...newCreature, name: e.target.value })}
              placeholder="Creature name"
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            />
            <select
              value={newCreature.type}
              onChange={e => setNewCreature({ ...newCreature, type: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            >
              {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <input
            type="text"
            value={newCreature.habitat}
            onChange={e => setNewCreature({ ...newCreature, habitat: e.target.value })}
            placeholder="Habitat (e.g., Northern forests, Deep caves)"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm mb-3"
          />
          <textarea
            value={newCreature.description}
            onChange={e => setNewCreature({ ...newCreature, description: e.target.value })}
            placeholder="Description..."
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm mb-3 resize-none"
            rows={2}
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={newCreature.isSpoiler}
                onChange={e => setNewCreature({ ...newCreature, isSpoiler: e.target.checked })}
              />
              Spoiler
            </label>
            <button
              onClick={handleCreate}
              className="ml-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded text-sm font-medium"
            >
              Add Creature
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* List */}
        <div className="w-72 overflow-auto space-y-2">
          {filteredCreatures.map(creature => {
            const TypeIcon = TYPES.find(t => t.id === creature.type)?.icon || Bug;
            return (
              <div
                key={creature.id}
                onClick={() => setSelectedCreature(creature)}
                className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 ${
                  selectedCreature?.id === creature.id
                    ? 'bg-amber-500/20 border border-amber-500/30'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {creature.avatar ? (
                  <img src={creature.avatar} alt={creature.name} className="w-10 h-10 rounded object-cover" />
                ) : (
                  <TypeIcon className="w-5 h-5 text-gray-400" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{creature.name}</p>
                  {creature.habitat && (
                    <p className="text-xs text-gray-500">{creature.habitat}</p>
                  )}
                </div>
                {creature.isSpoiler && (
                  <span className="text-xs text-red-400">⚠</span>
                )}
              </div>
            );
          })}
          {filteredCreatures.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No creatures found</p>
          )}
        </div>

        {/* Details */}
        {selectedCreature ? (
          <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 p-4 overflow-auto">
            <div className="flex items-start gap-4 mb-4">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                {selectedCreature.avatar ? (
                  <img src={selectedCreature.avatar} alt={selectedCreature.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-3xl">🐾</div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{selectedCreature.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                      <span className="capitalize">{selectedCreature.type}</span>
                      {selectedCreature.habitat && (
                        <>
                          <span>•</span>
                          <span>{selectedCreature.habitat}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedCreature.id)}
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <input
                  type="text"
                  value={selectedCreature.avatar || ''}
                  onChange={e => handleUpdate(selectedCreature.id, { avatar: e.target.value })}
                  className="w-full mt-2 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  placeholder="Image URL..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-1">Description</h4>
                <textarea
                  value={selectedCreature.description || ''}
                  onChange={e => handleUpdate(selectedCreature.id, { description: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm resize-none"
                  rows={4}
                  placeholder="Describe this creature..."
                />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-1">Abilities / Properties</h4>
                <textarea
                  value={selectedCreature.abilities || ''}
                  onChange={e => handleUpdate(selectedCreature.id, { abilities: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm resize-none"
                  rows={3}
                  placeholder="Special abilities, behaviors, uses..."
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedCreature.isSpoiler}
                  onChange={e => handleUpdate(selectedCreature.id, { isSpoiler: e.target.checked })}
                />
                Mark as spoiler
              </label>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a creature to view details
          </div>
        )}
      </div>
    </div>
  );
}
