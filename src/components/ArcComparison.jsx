import { useState, useEffect } from 'react';
import { getAllArcTypes, createArcType, deleteArcType, getActiveProject } from '../db';
import { TrendingUp, Plus, X, ArrowRight } from 'lucide-react';

const ARC_PATTERNS = [
  { id: 'redemption', name: 'Redemption', pattern: ['villain', 'crisis', 'change', 'hero'], color: '#22c55e', emoji: '😈➡️😇' },
  { id: 'fall', name: 'Fall from Grace', pattern: ['hero', 'temptation', 'corruption', 'villain'], color: '#ef4444', emoji: '😇➡️😈' },
  { id: 'coming-of-age', name: 'Coming of Age', pattern: ['naive', 'trials', 'growth', 'mature'], color: '#3b82f6', emoji: '👶➡️🧑' },
  { id: 'tragedy', name: 'Tragedy', pattern: ['noble', 'flaw', 'downfall', 'death'], color: '#8b5cf6', emoji: '👑➡️💀' },
  { id: 'rise', name: 'Rise to Power', pattern: ['nobody', 'struggle', 'victory', 'ruler'], color: '#f59e0b', emoji: '🐛➡️🦋' },
  { id: 'sacrifice', name: 'Sacrifice', pattern: ['selfish', 'love', 'choice', 'martyr'], color: '#ec4899', emoji: '🤷➡️🙏' },
  { id: 'corruption', name: 'Corruption of Power', pattern: ['idealist', 'power', 'compromise', 'tyrant'], color: '#6b7280', emoji: '✨➡️💀' },
  { id: 'revenge', name: 'Revenge', pattern: ['wronged', 'obsession', 'vengeance', 'empty'], color: '#dc2626', emoji: '😢➡️🔥' },
];

export default function ArcComparison({ entities }) {
  const [arcTypes, setArcTypes] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [assignments, setAssignments] = useState({});

  const characters = entities.filter(e => e.type === 'character');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const project = await getActiveProject();
    if (project) {
      setProjectId(project.id);
      const types = await getAllArcTypes(project.id);
      setArcTypes(types);
    }
    
    // Load from localStorage for now (could move to DB)
    const saved = localStorage.getItem('lorekeeper-arc-assignments');
    if (saved) {
      setAssignments(JSON.parse(saved));
    }
  }

  function assignArc(characterId, arcId) {
    const newAssignments = { ...assignments, [characterId]: arcId };
    setAssignments(newAssignments);
    localStorage.setItem('lorekeeper-arc-assignments', JSON.stringify(newAssignments));
  }

  function getArcPattern(arcId) {
    return ARC_PATTERNS.find(a => a.id === arcId);
  }

  // Group characters by arc type
  const arcGroups = {};
  ARC_PATTERNS.forEach(arc => {
    arcGroups[arc.id] = characters.filter(c => assignments[c.id] === arc.id);
  });

  // Find missing arc types
  const usedArcs = new Set(Object.values(assignments));
  const unusedArcs = ARC_PATTERNS.filter(a => !usedArcs.has(a.id));

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          Arc Comparison
        </h2>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Assign character arcs to see patterns and identify missing story types.
      </p>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Character Assignment */}
        <div className="w-72 overflow-auto">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Assign Arcs</h3>
          <div className="space-y-2">
            {characters.map(char => (
              <div key={char.id} className="p-2 bg-gray-800 rounded-lg">
                <p className="text-sm font-medium mb-1">{char.name}</p>
                <select
                  value={assignments[char.id] || ''}
                  onChange={e => assignArc(char.id, e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs"
                >
                  <option value="">Select arc...</option>
                  {ARC_PATTERNS.map(arc => (
                    <option key={arc.id} value={arc.id}>{arc.emoji} {arc.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Arc Visualization */}
        <div className="flex-1 overflow-auto">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Arc Patterns</h3>
          <div className="space-y-4">
            {ARC_PATTERNS.map(arc => {
              const chars = arcGroups[arc.id] || [];
              return (
                <div 
                  key={arc.id} 
                  className={`p-3 rounded-lg border ${chars.length > 0 ? 'bg-gray-800 border-gray-700' : 'bg-gray-900 border-gray-800 opacity-50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{arc.emoji}</span>
                      <span className="font-medium" style={{ color: arc.color }}>{arc.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{chars.length} character(s)</span>
                  </div>
                  
                  {/* Pattern visualization */}
                  <div className="flex items-center gap-1 mb-2">
                    {arc.pattern.map((step, i) => (
                      <div key={i} className="flex items-center">
                        <span className="px-2 py-0.5 bg-gray-700 rounded text-xs capitalize">{step}</span>
                        {i < arc.pattern.length - 1 && <ArrowRight className="w-3 h-3 text-gray-500 mx-1" />}
                      </div>
                    ))}
                  </div>

                  {/* Characters with this arc */}
                  {chars.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {chars.map(char => (
                        <span key={char.id} className="px-2 py-0.5 text-xs rounded" style={{ backgroundColor: arc.color + '30', color: arc.color }}>
                          {char.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Missing arcs warning */}
          {unusedArcs.length > 0 && (
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <h4 className="text-sm font-medium text-amber-400 mb-2">Missing Arc Types</h4>
              <p className="text-xs text-amber-200/70 mb-2">
                Consider adding characters with these arcs for variety:
              </p>
              <div className="flex flex-wrap gap-2">
                {unusedArcs.map(arc => (
                  <span key={arc.id} className="px-2 py-1 bg-gray-800 rounded text-xs">
                    {arc.emoji} {arc.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
