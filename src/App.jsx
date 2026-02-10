import { useState, useEffect } from 'react';
import { 
  Users, Castle, MapPin, Gem, Lightbulb, Calendar, Network, 
  Eye, EyeOff, Plus, Database, Search
} from 'lucide-react';
import { getAllEntities, getProjectSettings, updateProjectSettings } from './db';
import { seedGameOfThrones } from './seedData';
import Sidebar from './components/Sidebar';
import EntityList from './components/EntityList';
import EntityEditor from './components/EntityEditor';
import Timeline from './components/Timeline';
import RelationshipGraph from './components/RelationshipGraph';
import EventEditor from './components/EventEditor';

function App() {
  const [view, setView] = useState('characters');
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [spoilerMode, setSpoilerMode] = useState(true);
  const [entities, setEntities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    const settings = await getProjectSettings();
    setSpoilerMode(settings.spoilerMode);
    const allEntities = await getAllEntities();
    setEntities(allEntities);
    setIsLoading(false);
  }

  async function toggleSpoilerMode() {
    const newMode = !spoilerMode;
    setSpoilerMode(newMode);
    await updateProjectSettings({ spoilerMode: newMode });
  }

  async function handleSeedData() {
    if (confirm('This will clear existing data and load Game of Thrones lore. Continue?')) {
      await seedGameOfThrones();
      await loadData();
      setView('characters');
      setSelectedEntityId(null);
    }
  }

  function handleSelectEntity(id) {
    setSelectedEntityId(id);
    setSelectedEventId(null);
  }

  function handleSelectEvent(id) {
    setSelectedEventId(id);
    setSelectedEntityId(null);
  }

  function handleCloseEditor() {
    setSelectedEntityId(null);
    setSelectedEventId(null);
    loadData();
  }

  function handleCreateNew() {
    if (view === 'timeline') {
      setSelectedEventId('new');
    } else if (['characters', 'factions', 'locations', 'items', 'concepts'].includes(view)) {
      setSelectedEntityId('new');
    }
  }

  const typeMap = {
    characters: 'character',
    factions: 'faction',
    locations: 'location',
    items: 'item',
    concepts: 'concept'
  };

  const filteredEntities = entities.filter(e => {
    if (!spoilerMode && e.isSpoiler) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return e.name.toLowerCase().includes(q) || 
             (e.aliases && e.aliases.some(a => a.toLowerCase().includes(q)));
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        view={view} 
        setView={(v) => { setView(v); setSelectedEntityId(null); setSelectedEventId(null); }}
        entities={filteredEntities}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-amber-400">🏰 Lorekeeper</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSeedData}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
            >
              <Database className="w-4 h-4" />
              Load GoT Data
            </button>
            <button
              onClick={toggleSpoilerMode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                spoilerMode 
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                  : 'bg-green-500/20 text-green-300 border border-green-500/30'
              }`}
            >
              {spoilerMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Spoilers {spoilerMode ? 'ON' : 'OFF'}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main View */}
          <div className="flex-1 overflow-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">Loading...</div>
              </div>
            ) : view === 'timeline' ? (
              <Timeline 
                entities={filteredEntities} 
                spoilerMode={spoilerMode}
                onSelectEvent={handleSelectEvent}
                onSelectEntity={handleSelectEntity}
              />
            ) : view === 'graph' ? (
              <RelationshipGraph 
                entities={filteredEntities}
                spoilerMode={spoilerMode}
                onSelectEntity={handleSelectEntity}
              />
            ) : (
              <EntityList
                type={typeMap[view]}
                entities={filteredEntities.filter(e => e.type === typeMap[view])}
                onSelect={handleSelectEntity}
                onCreate={handleCreateNew}
              />
            )}
          </div>

          {/* Side Panel (Editor) */}
          {(selectedEntityId || selectedEventId) && (
            <div className="w-[480px] border-l border-gray-700 bg-gray-800 overflow-auto">
              {selectedEntityId && (
                <EntityEditor
                  entityId={selectedEntityId === 'new' ? null : selectedEntityId}
                  entityType={typeMap[view] || 'character'}
                  onClose={handleCloseEditor}
                  onSave={handleCloseEditor}
                  allEntities={entities}
                />
              )}
              {selectedEventId && (
                <EventEditor
                  eventId={selectedEventId === 'new' ? null : selectedEventId}
                  onClose={handleCloseEditor}
                  onSave={handleCloseEditor}
                  allEntities={entities}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
