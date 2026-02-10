import { useState, useEffect } from 'react';
import { getAllRules, createRule, updateRule, deleteRule } from '../db';
import { Wand2, Plus, X, AlertCircle, Zap, Shield, Skull } from 'lucide-react';

export default function MagicRules() {
  const [rules, setRules] = useState([]);
  const [selectedSystem, setSelectedSystem] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState({ system: '', rule: '', exceptions: '', category: 'cost' });
  const [editingRule, setEditingRule] = useState(null);
  const [systems, setSystems] = useState([]);

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    const r = await getAllRules();
    setRules(r);
    // Extract unique systems
    const uniqueSystems = [...new Set(r.map(rule => rule.system).filter(Boolean))];
    setSystems(uniqueSystems);
  }

  async function handleCreate() {
    if (newRule.system && newRule.rule) {
      await createRule(newRule);
      setNewRule({ system: '', rule: '', exceptions: '', category: 'cost' });
      setShowAdd(false);
      loadRules();
    }
  }

  async function handleUpdate() {
    if (editingRule) {
      await updateRule(editingRule.id, editingRule);
      setEditingRule(null);
      loadRules();
    }
  }

  async function handleDelete(id) {
    if (confirm('Delete this rule?')) {
      await deleteRule(id);
      loadRules();
    }
  }

  const CATEGORIES = [
    { id: 'cost', label: 'Cost/Price', icon: Skull, color: 'text-red-400', description: 'What magic costs' },
    { id: 'limitation', label: 'Limitation', icon: Shield, color: 'text-yellow-400', description: 'What magic cannot do' },
    { id: 'source', label: 'Source', icon: Zap, color: 'text-blue-400', description: 'Where magic comes from' },
    { id: 'effect', label: 'Effect', icon: Wand2, color: 'text-purple-400', description: 'What magic does' },
  ];

  const filteredRules = selectedSystem === 'all' 
    ? rules 
    : rules.filter(r => r.system === selectedSystem);

  const rulesByCategory = CATEGORIES.map(cat => ({
    ...cat,
    rules: filteredRules.filter(r => r.category === cat.id)
  }));

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Wand2 className="w-6 h-6 text-amber-400" />
          Magic System Rules
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
            showAdd ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {/* System Filter */}
      <div className="flex gap-2 mb-4 overflow-auto pb-2">
        <button
          onClick={() => setSelectedSystem('all')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            selectedSystem === 'all' ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          All Systems
        </button>
        {systems.map(sys => (
          <button
            key={sys}
            onClick={() => setSelectedSystem(sys)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              selectedSystem === sys ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {sys}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium mb-3">Define a Magic Rule</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Magic System</label>
                <input
                  type="text"
                  value={newRule.system}
                  onChange={e => setNewRule({ ...newRule, system: e.target.value })}
                  placeholder="e.g., Sympathy, The Force, Naming"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                  list="systems"
                />
                <datalist id="systems">
                  {systems.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Category</label>
                <select
                  value={newRule.category}
                  onChange={e => setNewRule({ ...newRule, category: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Rule</label>
              <textarea
                value={newRule.rule}
                onChange={e => setNewRule({ ...newRule, rule: e.target.value })}
                placeholder="e.g., 'Magic always has a price - using fire magic causes burns on the caster'"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm resize-none"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Exceptions (optional)</label>
              <textarea
                value={newRule.exceptions}
                onChange={e => setNewRule({ ...newRule, exceptions: e.target.value })}
                placeholder="e.g., 'Except when using a conduit stone' or 'Unless the caster is of royal blood'"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm resize-none"
                rows={2}
              />
            </div>
            <button
              onClick={handleCreate}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded font-medium text-sm"
            >
              Add Rule
            </button>
          </div>
        </div>
      )}

      {/* Rules by Category */}
      <div className="flex-1 overflow-auto space-y-6">
        {rulesByCategory.map(category => (
          <div key={category.id}>
            <h3 className={`text-sm font-medium mb-2 flex items-center gap-2 ${category.color}`}>
              <category.icon className="w-4 h-4" />
              {category.label}
              <span className="text-gray-500 font-normal">({category.rules.length})</span>
            </h3>
            
            {category.rules.length === 0 ? (
              <p className="text-sm text-gray-500 ml-6">No {category.label.toLowerCase()} rules defined</p>
            ) : (
              <div className="space-y-2">
                {category.rules.map(rule => (
                  <div
                    key={rule.id}
                    className="p-3 bg-gray-800 rounded-lg border border-gray-700 ml-2"
                  >
                    {editingRule?.id === rule.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editingRule.system}
                          onChange={e => setEditingRule({ ...editingRule, system: e.target.value })}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                        />
                        <textarea
                          value={editingRule.rule}
                          onChange={e => setEditingRule({ ...editingRule, rule: e.target.value })}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm resize-none"
                          rows={2}
                        />
                        <textarea
                          value={editingRule.exceptions || ''}
                          onChange={e => setEditingRule({ ...editingRule, exceptions: e.target.value })}
                          placeholder="Exceptions..."
                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button onClick={handleUpdate} className="px-3 py-1 bg-amber-500 text-gray-900 rounded text-sm">Save</button>
                          <button onClick={() => setEditingRule(null)} className="px-3 py-1 bg-gray-600 rounded text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <span className="text-xs text-purple-400 font-medium">{rule.system}</span>
                            <p className="mt-1">{rule.rule}</p>
                            {rule.exceptions && (
                              <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm">
                                <AlertCircle className="w-4 h-4 inline text-yellow-400 mr-1" />
                                <span className="text-yellow-300">Exception:</span> {rule.exceptions}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => setEditingRule(rule)}
                              className="p-1 hover:bg-gray-700 rounded text-gray-400"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => handleDelete(rule.id)}
                              className="p-1 hover:bg-gray-700 rounded"
                            >
                              <X className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Wand2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No magic rules defined yet</p>
            <p className="text-sm mt-1">Define rules for your magic systems to ensure consistency</p>
          </div>
        </div>
      )}
    </div>
  );
}
