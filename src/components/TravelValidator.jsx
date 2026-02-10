import { useState, useEffect } from 'react';
import { 
  getAllTravelDistances, setTravelDistance, deleteTravelDistance,
  getAllScenes, getSceneCharacters, validateTravelTime
} from '../db';
import { Map, Plus, X, AlertTriangle, Check, Route } from 'lucide-react';

export default function TravelValidator({ entities }) {
  const [distances, setDistances] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [violations, setViolations] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newDistance, setNewDistance] = useState({ from: '', to: '', distance: '', unit: 'days', method: 'horse' });

  const locations = entities.filter(e => e.type === 'location');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const d = await getAllTravelDistances();
    setDistances(d);
    const s = await getAllScenes();
    setScenes(s);
  }

  async function handleAdd() {
    if (newDistance.from && newDistance.to && newDistance.distance) {
      await setTravelDistance(
        Number(newDistance.from),
        Number(newDistance.to),
        Number(newDistance.distance),
        newDistance.unit,
        newDistance.method
      );
      setNewDistance({ from: '', to: '', distance: '', unit: 'days', method: 'horse' });
      setShowAdd(false);
      loadData();
    }
  }

  async function handleDelete(id) {
    await deleteTravelDistance(id);
    loadData();
  }

  async function checkViolations() {
    const issues = [];
    
    // Group scenes by character to track their movements
    const characters = entities.filter(e => e.type === 'character');
    
    for (const char of characters) {
      const charScenes = [];
      for (const scene of scenes.filter(s => s.timeYear && s.locationId)) {
        const sceneChars = await getSceneCharacters(scene.id);
        if (sceneChars.some(sc => sc.entityId === char.id)) {
          charScenes.push(scene);
        }
      }
      
      // Sort by time
      charScenes.sort((a, b) => (a.timeYear - b.timeYear) || (a.order - b.order));
      
      // Check consecutive scenes for travel time violations
      for (let i = 1; i < charScenes.length; i++) {
        const prev = charScenes[i - 1];
        const curr = charScenes[i];
        
        if (prev.locationId !== curr.locationId) {
          const timeDiff = curr.timeYear - prev.timeYear;
          // Assume 365 days per year for rough calculation
          const daysAllowed = timeDiff * 365;
          
          const validation = await validateTravelTime(prev.locationId, curr.locationId, daysAllowed);
          if (!validation.valid) {
            const fromLoc = locations.find(l => l.id === prev.locationId)?.name || 'Unknown';
            const toLoc = locations.find(l => l.id === curr.locationId)?.name || 'Unknown';
            issues.push({
              character: char.name,
              from: fromLoc,
              to: toLoc,
              fromScene: prev.title,
              toScene: curr.title,
              message: validation.message
            });
          }
        }
      }
    }
    
    setViolations(issues);
  }

  function getLocationName(id) {
    return locations.find(l => l.id === id)?.name || `Location #${id}`;
  }

  const METHODS = ['walk', 'horse', 'ship', 'dragon', 'teleport'];
  const UNITS = ['hours', 'days', 'weeks', 'months'];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Route className="w-6 h-6 text-amber-400" />
          Travel Time Validator
        </h2>
        <div className="flex gap-2">
          <button
            onClick={checkViolations}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            Check Violations
          </button>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
              showAdd ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Route
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium mb-3">Define Travel Distance</h3>
          <div className="grid grid-cols-5 gap-3">
            <select
              value={newDistance.from}
              onChange={e => setNewDistance({ ...newDistance, from: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
            >
              <option value="">From...</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <select
              value={newDistance.to}
              onChange={e => setNewDistance({ ...newDistance, to: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
            >
              <option value="">To...</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <input
              type="number"
              value={newDistance.distance}
              onChange={e => setNewDistance({ ...newDistance, distance: e.target.value })}
              placeholder="Distance"
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
            />
            <select
              value={newDistance.unit}
              onChange={e => setNewDistance({ ...newDistance, unit: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
            >
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <select
              value={newDistance.method}
              onChange={e => setNewDistance({ ...newDistance, method: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
            >
              {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <button
            onClick={handleAdd}
            className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded text-sm font-medium"
          >
            Add Route
          </button>
        </div>
      )}

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Distances List */}
        <div className="w-1/2 overflow-auto">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Defined Routes ({distances.length})</h3>
          {distances.length === 0 ? (
            <p className="text-sm text-gray-500">No routes defined. Add travel times between locations.</p>
          ) : (
            <div className="space-y-2">
              {distances.map(d => (
                <div key={d.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {getLocationName(d.fromLocationId)} → {getLocationName(d.toLocationId)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {d.distance} {d.unit} by {d.method}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(d.id)} className="p-1 hover:bg-gray-700 rounded">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Violations */}
        <div className="w-1/2 overflow-auto">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Travel Violations ({violations.length})</h3>
          {violations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Check className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No violations found</p>
              <p className="text-sm">Click "Check Violations" to scan</p>
            </div>
          ) : (
            <div className="space-y-2">
              {violations.map((v, i) => (
                <div key={i} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-300">{v.character}</p>
                      <p className="text-sm text-gray-300">
                        {v.from} → {v.to}
                      </p>
                      <p className="text-sm text-gray-400">
                        "{v.fromScene}" → "{v.toScene}"
                      </p>
                      <p className="text-xs text-red-400 mt-1">{v.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
