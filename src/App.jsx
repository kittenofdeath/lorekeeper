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
import InteractionMatrix from './components/InteractionMatrix';
import MapView from './components/MapView';
import CausalityView from './components/CausalityView';
import CharacterArc from './components/CharacterArc';
import ExportView from './components/ExportView';
import WritingView from './components/WritingView';
import KnowledgeTracker from './components/KnowledgeTracker';
import ForeshadowingTracker from './components/ForeshadowingTracker';
import MagicRules from './components/MagicRules';
import ContinuityChecker from './components/ContinuityChecker';
import AdvancedSearch from './components/AdvancedSearch';
import NamingTools from './components/NamingTools';
import LoreHistory from './components/LoreHistory';
import EventEditor from './components/EventEditor';
import BackupRestore from './components/BackupRestore';
import TravelValidator from './components/TravelValidator';
import PlotStructure from './components/PlotStructure';
import ThemeTracker from './components/ThemeTracker';
import WritingGoals from './components/WritingGoals';
import DialogueLog from './components/DialogueLog';
import Bestiary from './components/Bestiary';
import ConlangBuilder from './components/ConlangBuilder';
import FamilyTree from './components/FamilyTree';
import CalendarEditor from './components/CalendarEditor';
import WordFrequency from './components/WordFrequency';
import ProjectSwitcher from './components/ProjectSwitcher';
import ManuscriptCompile from './components/ManuscriptCompile';
import FrameNarrative from './components/FrameNarrative';
import PoetryEditor from './components/PoetryEditor';
import CurrencySystem from './components/CurrencySystem';
import PacingAnalysis from './components/PacingAnalysis';
import TimelineOrder from './components/TimelineOrder';
import DialogueDesigner from './components/DialogueDesigner';
import PersonalityEditor from './components/PersonalityEditor';
import ArcComparison from './components/ArcComparison';

function App() {
  const [view, setView] = useState('characters');
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showCharacterArc, setShowCharacterArc] = useState(null);
  const [spoilerMode, setSpoilerMode] = useState(true);
  const [entities, setEntities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Keyboard shortcuts
    function handleKeyDown(e) {
      // Ignore if typing in input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // Cmd/Ctrl shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch(e.key) {
          case 'e': e.preventDefault(); setView('writing'); break;
          case 't': e.preventDefault(); setView('timeline'); break;
          case 'g': e.preventDefault(); setView('graph'); break;
          case 'm': e.preventDefault(); setView('map'); break;
          case 'f': e.preventDefault(); setView('search'); break;
          case 'b': e.preventDefault(); setView('backup'); break;
        }
      }
      // Number shortcuts for library
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        switch(e.key) {
          case '1': setView('characters'); break;
          case '2': setView('factions'); break;
          case '3': setView('locations'); break;
          case '4': setView('items'); break;
          case '5': setView('concepts'); break;
        }
      }
      // Escape to close panels
      if (e.key === 'Escape') {
        setSelectedEntityId(null);
        setSelectedEventId(null);
        setShowCharacterArc(null);
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
            ) : view === 'writing' ? (
              <WritingView
                entities={filteredEntities}
                onSelectEntity={handleSelectEntity}
              />
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
            ) : view === 'interactions' ? (
              <InteractionMatrix
                entities={filteredEntities}
                spoilerMode={spoilerMode}
                onSelectEntity={handleSelectEntity}
                onSelectEvent={handleSelectEvent}
              />
            ) : view === 'map' ? (
              <MapView
                entities={filteredEntities}
                spoilerMode={spoilerMode}
                onSelectEntity={handleSelectEntity}
                onSelectEvent={handleSelectEvent}
              />
            ) : view === 'causality' ? (
              <CausalityView
                entities={filteredEntities}
                spoilerMode={spoilerMode}
                onSelectEvent={handleSelectEvent}
              />
            ) : view === 'knowledge' ? (
              <KnowledgeTracker
                entities={filteredEntities}
                onSelectEntity={handleSelectEntity}
              />
            ) : view === 'foreshadowing' ? (
              <ForeshadowingTracker
                entities={filteredEntities}
              />
            ) : view === 'magic' ? (
              <MagicRules />
            ) : view === 'continuity' ? (
              <ContinuityChecker
                entities={filteredEntities}
                onSelectEntity={handleSelectEntity}
                onSelectEvent={handleSelectEvent}
              />
            ) : view === 'search' ? (
              <AdvancedSearch
                entities={filteredEntities}
                onSelectEntity={handleSelectEntity}
                onSelectEvent={handleSelectEvent}
              />
            ) : view === 'naming' ? (
              <NamingTools
                entities={filteredEntities}
              />
            ) : view === 'history' ? (
              <LoreHistory
                entities={filteredEntities}
                onSelectEntity={handleSelectEntity}
              />
            ) : view === 'backup' ? (
              <BackupRestore
                onDataChange={loadData}
              />
            ) : view === 'travel' ? (
              <TravelValidator
                entities={filteredEntities}
              />
            ) : view === 'plot' ? (
              <PlotStructure />
            ) : view === 'themes' ? (
              <ThemeTracker
                entities={filteredEntities}
              />
            ) : view === 'goals' ? (
              <WritingGoals />
            ) : view === 'dialogue' ? (
              <DialogueLog
                entities={filteredEntities}
              />
            ) : view === 'bestiary' ? (
              <Bestiary
                spoilerMode={spoilerMode}
              />
            ) : view === 'conlang' ? (
              <ConlangBuilder />
            ) : view === 'familytree' ? (
              <FamilyTree
                entities={filteredEntities}
                onSelectEntity={handleSelectEntity}
              />
            ) : view === 'calendar' ? (
              <CalendarEditor />
            ) : view === 'wordfreq' ? (
              <WordFrequency />
            ) : view === 'projects' ? (
              <ProjectSwitcher onSwitch={loadData} />
            ) : view === 'manuscript' ? (
              <ManuscriptCompile />
            ) : view === 'frames' ? (
              <FrameNarrative />
            ) : view === 'poetry' ? (
              <PoetryEditor entities={filteredEntities} />
            ) : view === 'currency' ? (
              <CurrencySystem />
            ) : view === 'pacing' ? (
              <PacingAnalysis entities={filteredEntities} />
            ) : view === 'timelineorder' ? (
              <TimelineOrder entities={filteredEntities} />
            ) : view === 'dialoguedesign' ? (
              <DialogueDesigner entities={filteredEntities} />
            ) : view === 'personality' ? (
              <PersonalityEditor entities={filteredEntities} onSelectEntity={handleSelectEntity} />
            ) : view === 'arcs' ? (
              <ArcComparison entities={filteredEntities} />
            ) : view === 'export' ? (
              <ExportView
                entities={filteredEntities}
                spoilerMode={spoilerMode}
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
                  onShowArc={(entity) => setShowCharacterArc(entity)}
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

      {/* Character Arc Modal */}
      {showCharacterArc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-[800px] max-h-[80vh] overflow-auto">
            <CharacterArc
              entity={showCharacterArc}
              allEntities={entities}
              onClose={() => setShowCharacterArc(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
