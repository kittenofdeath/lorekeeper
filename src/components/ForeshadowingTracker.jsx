import { useState, useEffect } from 'react';
import { getAllSetups, createSetup, updateSetup, deleteSetup, getAllScenes } from '../db';
import { Sparkles, Plus, Check, Clock, AlertTriangle, Target, X } from 'lucide-react';

export default function ForeshadowingTracker({ entities }) {
  const [setups, setSetups] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newSetup, setNewSetup] = useState({ description: '', category: 'chekhov', plantedInScene: null });
  const [selectedSetup, setSelectedSetup] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const s = await getAllSetups();
    setSetups(s);
    const sc = await getAllScenes();
    setScenes(sc);
  }

  async function handleCreate() {
    if (newSetup.description) {
      await createSetup(newSetup);
      setNewSetup({ description: '', category: 'chekhov', plantedInScene: null });
      setShowAdd(false);
      loadData();
    }
  }

  async function handleResolve(setup) {
    const sceneId = prompt('Enter the scene ID where this pays off (or leave blank):');
    await updateSetup(setup.id, { 
      status: 'resolved', 
      payoffInScene: sceneId ? Number(sceneId) : null 
    });
    loadData();
  }

  async function handleDelete(id) {
    if (confirm('Delete this setup?')) {
      await deleteSetup(id);
      loadData();
    }
  }

  function getSceneName(id) {
    return scenes.find(s => s.id === id)?.title || `Scene #${id}`;
  }

  const CATEGORIES = [
    { id: 'chekhov', label: "Chekhov's Gun", icon: Target, description: 'Object/detail that must pay off' },
    { id: 'prophecy', label: 'Prophecy', icon: Sparkles, description: 'Prediction that may come true' },
    { id: 'foreshadow', label: 'Foreshadowing', icon: Clock, description: 'Subtle hint of future events' },
    { id: 'setup', label: 'Story Setup', icon: AlertTriangle, description: 'Plot point that needs resolution' },
  ];

  const filteredSetups = setups.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'unresolved') return s.status !== 'resolved';
    if (filter === 'resolved') return s.status === 'resolved';
    return s.category === filter;
  });

  const stats = {
    total: setups.length,
    resolved: setups.filter(s => s.status === 'resolved').length,
    unresolved: setups.filter(s => s.status !== 'resolved').length,
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-400" />
          Foreshadowing & Payoffs
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
            showAdd ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Plus className="w-4 h-4" />
          Plant Setup
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-gray-400">Total Setups</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
          <p className="text-sm text-green-400/70">Resolved</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <p className="text-2xl font-bold text-amber-400">{stats.unresolved}</p>
          <p className="text-sm text-amber-400/70">Need Payoff</p>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium mb-3">Plant a New Setup</h3>
          <div className="space-y-3">
            <textarea
              value={newSetup.description}
              onChange={e => setNewSetup({ ...newSetup, description: e.target.value })}
              placeholder="Describe the setup (e.g., 'The sword hanging above the fireplace')"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm resize-none"
              rows={2}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Category</label>
                <select
                  value={newSetup.category}
                  onChange={e => setNewSetup({ ...newSetup, category: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Planted In Scene</label>
                <select
                  value={newSetup.plantedInScene || ''}
                  onChange={e => setNewSetup({ ...newSetup, plantedInScene: e.target.value ? Number(e.target.value) : null })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                >
                  <option value="">Select scene...</option>
                  {scenes.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleCreate}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded font-medium text-sm"
            >
              Plant Setup
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-auto pb-2">
        {['all', 'unresolved', 'resolved', ...CATEGORIES.map(c => c.id)].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              filter === f ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {f === 'all' ? 'All' : 
             f === 'unresolved' ? '⏳ Unresolved' :
             f === 'resolved' ? '✓ Resolved' :
             CATEGORIES.find(c => c.id === f)?.label || f}
          </button>
        ))}
      </div>

      {/* Setups List */}
      <div className="flex-1 overflow-auto">
        {filteredSetups.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No setups found</p>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')} className="mt-2 text-amber-400">
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSetups.map(setup => {
              const category = CATEGORIES.find(c => c.id === setup.category);
              const Icon = category?.icon || Sparkles;
              
              return (
                <div
                  key={setup.id}
                  className={`p-4 rounded-lg border ${
                    setup.status === 'resolved'
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      setup.status === 'resolved' ? 'bg-green-500/20' : 'bg-amber-500/20'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        setup.status === 'resolved' ? 'text-green-400' : 'text-amber-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{setup.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                        <span>{category?.label}</span>
                        {setup.plantedInScene && (
                          <span>Planted: {getSceneName(setup.plantedInScene)}</span>
                        )}
                        {setup.payoffInScene && (
                          <span className="text-green-400">
                            Payoff: {getSceneName(setup.payoffInScene)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {setup.status !== 'resolved' && (
                        <button
                          onClick={() => handleResolve(setup)}
                          className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded text-sm hover:bg-green-500/30"
                        >
                          <Check className="w-4 h-4" /> Resolve
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(setup.id)}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="text-xs font-medium text-gray-400 mb-2">Categories</h4>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="flex items-center gap-1 text-xs text-gray-500">
              <cat.icon className="w-3 h-3" />
              <span>{cat.label}:</span>
              <span className="text-gray-400">{cat.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
