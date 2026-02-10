import { useState, useEffect } from 'react';
import { 
  getAllFacts, createFact, updateFact, deleteFact,
  getKnowledgeForEntity, getKnowledgeForFact, addKnowledge, removeKnowledge,
  getAllScenes, getTruthLayersForFact, addTruthLayer, removeTruthLayer
} from '../db';
import { Brain, Plus, Eye, EyeOff, Users, BookOpen, Layers, Check, X } from 'lucide-react';

export default function KnowledgeTracker({ entities, onSelectEntity }) {
  const [facts, setFacts] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [selectedFact, setSelectedFact] = useState(null);
  const [factKnowledge, setFactKnowledge] = useState([]);
  const [truthLayers, setTruthLayers] = useState([]);
  const [view, setView] = useState('facts'); // 'facts' | 'byCharacter'
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterKnowledge, setCharacterKnowledge] = useState([]);
  const [showAddFact, setShowAddFact] = useState(false);
  const [newFact, setNewFact] = useState({ description: '', isTrue: true, category: 'plot' });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedFact) {
      loadFactDetails(selectedFact.id);
    }
  }, [selectedFact]);

  useEffect(() => {
    if (selectedCharacter) {
      loadCharacterKnowledge(selectedCharacter.id);
    }
  }, [selectedCharacter]);

  async function loadData() {
    const f = await getAllFacts();
    setFacts(f);
    const s = await getAllScenes();
    setScenes(s);
  }

  async function loadFactDetails(factId) {
    const k = await getKnowledgeForFact(factId);
    setFactKnowledge(k);
    const t = await getTruthLayersForFact(factId);
    setTruthLayers(t);
  }

  async function loadCharacterKnowledge(entityId) {
    const k = await getKnowledgeForEntity(entityId);
    setCharacterKnowledge(k);
  }

  async function handleCreateFact() {
    if (newFact.description) {
      await createFact(newFact);
      setNewFact({ description: '', isTrue: true, category: 'plot' });
      setShowAddFact(false);
      loadData();
    }
  }

  async function handleDeleteFact(id) {
    if (confirm('Delete this fact?')) {
      await deleteFact(id);
      if (selectedFact?.id === id) setSelectedFact(null);
      loadData();
    }
  }

  async function handleToggleKnowledge(entityId, factId, knows) {
    if (knows) {
      // Remove knowledge
      const existing = factKnowledge.find(k => k.entityId === entityId);
      if (existing) {
        await removeKnowledge(existing.id);
      }
    } else {
      // Add knowledge
      await addKnowledge({ entityId, factId, isTrue: true });
    }
    loadFactDetails(factId);
  }

  async function handleAddTruthLayer(factId, layer, description) {
    await addTruthLayer({ factId, layer, description });
    loadFactDetails(factId);
  }

  function getEntityName(id) {
    return entities.find(e => e.id === id)?.name || `Entity #${id}`;
  }

  function getSceneName(id) {
    return scenes.find(s => s.id === id)?.title || `Scene #${id}`;
  }

  const characters = entities.filter(e => e.type === 'character');

  const LAYERS = [
    { id: 'truth', label: 'Actual Truth', color: 'text-green-400' },
    { id: 'believed', label: 'What Characters Believe', color: 'text-blue-400' },
    { id: 'reader', label: 'What Reader Sees', color: 'text-purple-400' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-amber-400" />
          Knowledge & POV Tracker
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('facts')}
            className={`px-3 py-1.5 rounded-lg text-sm ${view === 'facts' ? 'bg-amber-500 text-gray-900' : 'bg-gray-700'}`}
          >
            By Fact
          </button>
          <button
            onClick={() => setView('byCharacter')}
            className={`px-3 py-1.5 rounded-lg text-sm ${view === 'byCharacter' ? 'bg-amber-500 text-gray-900' : 'bg-gray-700'}`}
          >
            By Character
          </button>
        </div>
      </div>

      {view === 'facts' ? (
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Facts List */}
          <div className="w-80 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-300">Facts / Secrets</h3>
              <button
                onClick={() => setShowAddFact(!showAddFact)}
                className="text-amber-400 hover:text-amber-300"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showAddFact && (
              <div className="mb-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                <textarea
                  value={newFact.description}
                  onChange={e => setNewFact({ ...newFact, description: e.target.value })}
                  placeholder="Describe the fact or secret..."
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm mb-2 resize-none"
                  rows={2}
                />
                <div className="flex items-center gap-2 mb-2">
                  <select
                    value={newFact.category}
                    onChange={e => setNewFact({ ...newFact, category: e.target.value })}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  >
                    <option value="plot">Plot</option>
                    <option value="character">Character Secret</option>
                    <option value="world">World Lore</option>
                    <option value="mystery">Mystery</option>
                  </select>
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={newFact.isTrue}
                      onChange={e => setNewFact({ ...newFact, isTrue: e.target.checked })}
                    />
                    True
                  </label>
                </div>
                <button
                  onClick={handleCreateFact}
                  className="w-full py-1 bg-amber-500 text-gray-900 rounded text-sm"
                >
                  Add Fact
                </button>
              </div>
            )}

            <div className="flex-1 overflow-auto space-y-1">
              {facts.map(fact => (
                <div
                  key={fact.id}
                  onClick={() => setSelectedFact(fact)}
                  className={`p-2 rounded cursor-pointer ${
                    selectedFact?.id === fact.id ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {fact.isTrue ? (
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{fact.description}</p>
                      <span className="text-xs text-gray-500">{fact.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fact Details */}
          {selectedFact ? (
            <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 p-4 overflow-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedFact.description}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm ${selectedFact.isTrue ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedFact.isTrue ? '✓ True' : '✗ False/Lie'}
                    </span>
                    <span className="text-sm text-gray-500">· {selectedFact.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteFact(selectedFact.id)}
                  className="text-gray-400 hover:text-red-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Truth Layers */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                  <Layers className="w-4 h-4" /> Truth Layers
                </h4>
                <div className="space-y-2">
                  {LAYERS.map(layer => {
                    const layerData = truthLayers.find(t => t.layer === layer.id);
                    return (
                      <div key={layer.id} className="p-2 bg-gray-700/50 rounded">
                        <span className={`text-sm font-medium ${layer.color}`}>{layer.label}:</span>
                        {layerData ? (
                          <p className="text-sm text-gray-300 mt-1">{layerData.description}</p>
                        ) : (
                          <input
                            type="text"
                            placeholder={`What is the ${layer.label.toLowerCase()}?`}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm mt-1"
                            onKeyDown={e => {
                              if (e.key === 'Enter' && e.target.value) {
                                handleAddTruthLayer(selectedFact.id, layer.id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Who Knows */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                  <Users className="w-4 h-4" /> Who Knows This?
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {characters.map(char => {
                    const knows = factKnowledge.some(k => k.entityId === char.id);
                    return (
                      <button
                        key={char.id}
                        onClick={() => handleToggleKnowledge(char.id, selectedFact.id, knows)}
                        className={`flex items-center gap-2 p-2 rounded text-sm text-left ${
                          knows ? 'bg-green-500/20 text-green-300' : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {knows ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {char.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a fact to see who knows it
            </div>
          )}
        </div>
      ) : (
        /* By Character View */
        <div className="flex-1 flex gap-4 overflow-hidden">
          <div className="w-64 space-y-1 overflow-auto">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Characters</h3>
            {characters.map(char => (
              <button
                key={char.id}
                onClick={() => setSelectedCharacter(char)}
                className={`w-full text-left p-2 rounded ${
                  selectedCharacter?.id === char.id ? 'bg-amber-500/20' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {char.name}
              </button>
            ))}
          </div>

          {selectedCharacter ? (
            <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 p-4 overflow-auto">
              <h3 className="text-lg font-semibold mb-4">
                What {selectedCharacter.name} Knows
              </h3>
              {characterKnowledge.length === 0 ? (
                <p className="text-gray-500">This character doesn't know any tracked facts yet.</p>
              ) : (
                <div className="space-y-2">
                  {characterKnowledge.map(k => {
                    const fact = facts.find(f => f.id === k.factId);
                    if (!fact) return null;
                    return (
                      <div key={k.id} className="p-3 bg-gray-700/50 rounded">
                        <p className="text-sm">{fact.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span className={fact.isTrue ? 'text-green-400' : 'text-red-400'}>
                            {fact.isTrue ? 'True' : 'False'}
                          </span>
                          {k.learnedInScene && <span>Learned in: {getSceneName(k.learnedInScene)}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a character to see what they know
            </div>
          )}
        </div>
      )}
    </div>
  );
}
