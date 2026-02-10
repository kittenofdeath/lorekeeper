import { useState, useEffect } from 'react';
import { getAllNamingRules, createNamingRule, updateNamingRule, deleteNamingRule } from '../db';
import { Type, Plus, Dice6, X, Copy, Check } from 'lucide-react';

export default function NamingTools({ entities }) {
  const [rules, setRules] = useState([]);
  const [selectedCulture, setSelectedCulture] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState({ culture: '', pattern: '', examples: '', notes: '' });
  const [generatedNames, setGeneratedNames] = useState([]);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    const r = await getAllNamingRules();
    setRules(r);
  }

  async function handleCreate() {
    if (newRule.culture && newRule.pattern) {
      await createNamingRule(newRule);
      setNewRule({ culture: '', pattern: '', examples: '', notes: '' });
      setShowAdd(false);
      loadRules();
    }
  }

  async function handleDelete(id) {
    if (confirm('Delete this naming rule?')) {
      await deleteNamingRule(id);
      loadRules();
    }
  }

  function generateNames(rule) {
    // Parse the pattern and generate names
    const pattern = rule.pattern;
    const examples = rule.examples?.split(',').map(e => e.trim()) || [];
    
    // Extract components from examples
    const prefixes = [];
    const suffixes = [];
    const middles = [];
    
    examples.forEach(ex => {
      if (ex.length >= 3) {
        prefixes.push(ex.slice(0, 2));
        suffixes.push(ex.slice(-2));
        if (ex.length > 4) {
          middles.push(ex.slice(2, -2));
        }
      }
    });

    // Common fantasy syllables as fallback
    const defaultPrefixes = ['Ae', 'El', 'Gor', 'Thr', 'Val', 'Kar', 'Mor', 'Dra', 'Ser', 'Jon', 'Bra', 'Ty'];
    const defaultSuffixes = ['on', 'an', 'or', 'is', 'os', 'yn', 'wen', 'ric', 'mir', 'win', 'ard', 'ion'];
    const defaultMiddles = ['ala', 'en', 'ara', 'eri', 'olo', 'ini', 'oro', 'and', 'enn'];

    const usePrefixes = prefixes.length > 0 ? prefixes : defaultPrefixes;
    const useSuffixes = suffixes.length > 0 ? suffixes : defaultSuffixes;
    const useMiddles = middles.length > 0 ? middles : defaultMiddles;

    const names = [];
    for (let i = 0; i < 10; i++) {
      const prefix = usePrefixes[Math.floor(Math.random() * usePrefixes.length)];
      const middle = Math.random() > 0.5 ? useMiddles[Math.floor(Math.random() * useMiddles.length)] : '';
      const suffix = useSuffixes[Math.floor(Math.random() * useSuffixes.length)];
      
      let name = prefix + middle + suffix;
      name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      
      if (!names.includes(name)) {
        names.push(name);
      }
    }

    setGeneratedNames(names);
  }

  function copyName(name) {
    navigator.clipboard.writeText(name);
    setCopied(name);
    setTimeout(() => setCopied(null), 1500);
  }

  const cultures = [...new Set(rules.map(r => r.culture))];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Type className="w-6 h-6 text-amber-400" />
          Naming Conventions
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
            showAdd ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Plus className="w-4 h-4" />
          Add Culture
        </button>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Cultures List */}
        <div className="w-64 flex flex-col">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Cultures</h3>
          
          {showAdd && (
            <div className="mb-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
              <input
                type="text"
                value={newRule.culture}
                onChange={e => setNewRule({ ...newRule, culture: e.target.value })}
                placeholder="Culture name (e.g., Stark, Valyrian)"
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm mb-2"
              />
              <input
                type="text"
                value={newRule.pattern}
                onChange={e => setNewRule({ ...newRule, pattern: e.target.value })}
                placeholder="Pattern (e.g., [Prefix]-[Suffix])"
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm mb-2"
              />
              <input
                type="text"
                value={newRule.examples}
                onChange={e => setNewRule({ ...newRule, examples: e.target.value })}
                placeholder="Examples (comma separated)"
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm mb-2"
              />
              <textarea
                value={newRule.notes}
                onChange={e => setNewRule({ ...newRule, notes: e.target.value })}
                placeholder="Notes on naming conventions..."
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm mb-2 resize-none"
                rows={2}
              />
              <button
                onClick={handleCreate}
                className="w-full py-1 bg-amber-500 text-gray-900 rounded text-sm"
              >
                Add
              </button>
            </div>
          )}

          <div className="flex-1 overflow-auto space-y-1">
            {cultures.length === 0 ? (
              <p className="text-sm text-gray-500">No cultures defined yet</p>
            ) : (
              cultures.map(culture => (
                <button
                  key={culture}
                  onClick={() => setSelectedCulture(culture)}
                  className={`w-full text-left p-2 rounded ${
                    selectedCulture === culture ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {culture}
                  <span className="text-xs text-gray-500 ml-2">
                    ({rules.filter(r => r.culture === culture).length} rules)
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Rules & Generator */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedCulture ? (
            <>
              <h3 className="text-lg font-medium mb-3">{selectedCulture} Naming Rules</h3>
              
              <div className="flex-1 overflow-auto space-y-3 mb-4">
                {rules.filter(r => r.culture === selectedCulture).map(rule => (
                  <div key={rule.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">Pattern: <code className="bg-gray-700 px-1 rounded">{rule.pattern}</code></p>
                        {rule.examples && (
                          <p className="text-sm text-gray-400 mt-1">
                            Examples: {rule.examples}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => generateNames(rule)}
                          className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm hover:bg-purple-500/30"
                        >
                          <Dice6 className="w-4 h-4" /> Generate
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    {rule.notes && (
                      <p className="text-sm text-gray-500 mt-2">{rule.notes}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Generated Names */}
              {generatedNames.length > 0 && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-300 mb-2 flex items-center gap-2">
                    <Dice6 className="w-4 h-4" /> Generated Names
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedNames.map((name, idx) => (
                      <button
                        key={idx}
                        onClick={() => copyName(name)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm"
                      >
                        {name}
                        {copied === name ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-400" />
                        )}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const rule = rules.find(r => r.culture === selectedCulture);
                      if (rule) generateNames(rule);
                    }}
                    className="mt-2 text-sm text-purple-400 hover:text-purple-300"
                  >
                    ↻ Generate more
                  </button>
                </div>
              )}

              {/* Existing Names from This Culture */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Existing Characters</h4>
                <div className="flex flex-wrap gap-2">
                  {entities.filter(e => e.type === 'character').slice(0, 20).map(char => (
                    <span key={char.id} className="px-2 py-0.5 bg-gray-800 rounded text-sm text-gray-400">
                      {char.name}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Type className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a culture to view naming rules</p>
                <p className="text-sm mt-1">Or add a new culture to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
