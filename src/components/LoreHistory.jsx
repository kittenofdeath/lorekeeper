import { useState, useEffect } from 'react';
import { getAllLoreHistory, getLoreHistory, getAllEntities } from '../db';
import { History, Clock, User, Filter } from 'lucide-react';

export default function LoreHistory({ entities, onSelectEntity }) {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedEntityId, setSelectedEntityId] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [selectedEntityId]);

  async function loadHistory() {
    let h;
    if (selectedEntityId) {
      h = await getLoreHistory(selectedEntityId);
    } else {
      h = await getAllLoreHistory();
    }
    setHistory(h.slice(0, 100)); // Limit to last 100
  }

  function getEntityName(id) {
    return entities.find(e => e.id === id)?.name || `Entity #${id}`;
  }

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  function formatValue(value) {
    if (value === null || value === undefined) return '(empty)';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  const groupedHistory = history.reduce((groups, item) => {
    const date = new Date(item.changedAt).toLocaleDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
    return groups;
  }, {});

  const characters = entities.filter(e => e.type === 'character');

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <History className="w-6 h-6 text-amber-400" />
          Lore Version History
        </h2>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedEntityId || ''}
            onChange={e => setSelectedEntityId(e.target.value ? Number(e.target.value) : null)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm"
          >
            <option value="">All Entities</option>
            {entities.map(e => (
              <option key={e.id} value={e.id}>{e.name} ({e.type})</option>
            ))}
          </select>
        </div>
        <span className="text-sm text-gray-400">
          {history.length} change{history.length !== 1 ? 's' : ''} recorded
        </span>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-auto">
        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No changes recorded yet</p>
            <p className="text-sm mt-1">Changes to entities will appear here</p>
          </div>
        ) : (
          Object.entries(groupedHistory).map(([date, items]) => (
            <div key={date} className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2 sticky top-0 bg-gray-900 py-1">
                {date}
              </h3>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-400" />
                        <button
                          onClick={() => onSelectEntity(item.entityId)}
                          className="text-blue-300 hover:text-blue-200"
                        >
                          {getEntityName(item.entityId)}
                        </button>
                        <span className="text-gray-500">·</span>
                        <span className="text-sm text-gray-400">{item.field}</span>
                      </div>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.changedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-red-500/10 border border-red-500/20 rounded">
                        <span className="text-xs text-red-400">Before:</span>
                        <p className="text-red-300 truncate">{formatValue(item.oldValue)}</p>
                      </div>
                      <div className="p-2 bg-green-500/10 border border-green-500/20 rounded">
                        <span className="text-xs text-green-400">After:</span>
                        <p className="text-green-300 truncate">{formatValue(item.newValue)}</p>
                      </div>
                    </div>
                    
                    {item.note && (
                      <p className="mt-2 text-sm text-gray-500 italic">Note: {item.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="text-xs font-medium text-gray-400 mb-2">About Version History</h4>
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Changes to entity fields are automatically tracked</p>
          <p>• Use this to see how your lore evolved over time</p>
          <p>• Track "what changed when" for debugging plot holes</p>
        </div>
      </div>
    </div>
  );
}
