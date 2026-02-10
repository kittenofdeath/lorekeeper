import { useState, useEffect, lazy, Suspense } from 'react';
import { Eye, EyeOff, Database, Search } from 'lucide-react';
import { getAllEntities, getProjectSettings, updateProjectSettings } from './db';
import { seedGameOfThrones } from './seedData';
import Sidebar from './components/Sidebar';
import EntityList from './components/EntityList';
import EntityEditor from './components/EntityEditor';
import EventEditor from './components/EventEditor';

// Lazy load heavy components (D3 visualizations, large views)
const Timeline = lazy(() => import('./components/Timeline'));
const RelationshipGraph = lazy(() => import('./components/RelationshipGraph'));
const MapView = lazy(() => import('./components/MapView'));
const CausalityView = lazy(() => import('./components/CausalityView'));
const FamilyTree = lazy(() => import('./components/FamilyTree'));
const CharacterArc = lazy(() => import('./components/CharacterArc'));
const InteractionMatrix = lazy(() => import('./components/InteractionMatrix'));
const DialogueDesigner = lazy(() => import('./components/DialogueDesigner'));

// Lazy load writing tools
const WritingView = lazy(() => import('./components/WritingView'));
const KnowledgeTracker = lazy(() => import('./components/KnowledgeTracker'));
const ForeshadowingTracker = lazy(() => import('./components/ForeshadowingTracker'));
const ThemeTracker = lazy(() => import('./components/ThemeTracker'));
const PlotStructure = lazy(() => import('./components/PlotStructure'));
const PacingAnalysis = lazy(() => import('./components/PacingAnalysis'));
const TimelineOrder = lazy(() => import('./components/TimelineOrder'));
const ManuscriptCompile = lazy(() => import('./components/ManuscriptCompile'));
const FrameNarrative = lazy(() => import('./components/FrameNarrative'));
const PoetryEditor = lazy(() => import('./components/PoetryEditor'));
const DialogueLog = lazy(() => import('./components/DialogueLog'));

// Lazy load world building tools
const Bestiary = lazy(() => import('./components/Bestiary'));
const ConlangBuilder = lazy(() => import('./components/ConlangBuilder'));
const CalendarEditor = lazy(() => import('./components/CalendarEditor'));
const CurrencySystem = lazy(() => import('./components/CurrencySystem'));
const MagicRules = lazy(() => import('./components/MagicRules'));
const NamingTools = lazy(() => import('./components/NamingTools'));

// Lazy load other tools
const AdvancedSearch = lazy(() => import('./components/AdvancedSearch'));
const ContinuityChecker = lazy(() => import('./components/ContinuityChecker'));
const LoreHistory = lazy(() => import('./components/LoreHistory'));
const TravelValidator = lazy(() => import('./components/TravelValidator'));
const WritingGoals = lazy(() => import('./components/WritingGoals'));
const WordFrequency = lazy(() => import('./components/WordFrequency'));
const PersonalityEditor = lazy(() => import('./components/PersonalityEditor'));
const ArcComparison = lazy(() => import('./components/ArcComparison'));
const BackupRestore = lazy(() => import('./components/BackupRestore'));
const ProjectSwitcher = lazy(() => import('./components/ProjectSwitcher'));
const ExportView = lazy(() => import('./components/ExportView'));

// Loading fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-gray-400 flex items-center gap-2">
      <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      Loading...
    </div>
  </div>
);

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
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
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
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        switch(e.key) {
          case '1': setView('characters'); break;
          case '2': setView('factions'); break;
          case '3': setView('locations'); break;
          case '4': setView('items'); break;
          case '5': setView('concepts'); break;
        }
      }
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

  const renderView = () => {
    const viewProps = {
      entities: filteredEntities,
      spoilerMode,
      onSelectEntity: handleSelectEntity,
      onSelectEvent: handleSelectEvent,
    };

    switch (view) {
      case 'writing':
        return <WritingView {...viewProps} />;
      case 'timeline':
        return <Timeline {...viewProps} />;
      case 'graph':
        return <RelationshipGraph {...viewProps} />;
      case 'interactions':
        return <InteractionMatrix {...viewProps} />;
      case 'map':
        return <MapView {...viewProps} />;
      case 'causality':
        return <CausalityView {...viewProps} />;
      case 'familytree':
        return <FamilyTree {...viewProps} />;
      case 'knowledge':
        return <KnowledgeTracker {...viewProps} />;
      case 'foreshadowing':
        return <ForeshadowingTracker entities={filteredEntities} />;
      case 'magic':
        return <MagicRules />;
      case 'continuity':
        return <ContinuityChecker {...viewProps} />;
      case 'search':
        return <AdvancedSearch {...viewProps} />;
      case 'naming':
        return <NamingTools entities={filteredEntities} />;
      case 'history':
        return <LoreHistory {...viewProps} />;
      case 'backup':
        return <BackupRestore onDataChange={loadData} />;
      case 'travel':
        return <TravelValidator entities={filteredEntities} />;
      case 'plot':
        return <PlotStructure />;
      case 'themes':
        return <ThemeTracker entities={filteredEntities} />;
      case 'goals':
        return <WritingGoals />;
      case 'dialogue':
        return <DialogueLog entities={filteredEntities} />;
      case 'bestiary':
        return <Bestiary spoilerMode={spoilerMode} />;
      case 'conlang':
        return <ConlangBuilder />;
      case 'calendar':
        return <CalendarEditor />;
      case 'wordfreq':
        return <WordFrequency />;
      case 'projects':
        return <ProjectSwitcher onSwitch={loadData} />;
      case 'manuscript':
        return <ManuscriptCompile />;
      case 'frames':
        return <FrameNarrative />;
      case 'poetry':
        return <PoetryEditor entities={filteredEntities} />;
      case 'currency':
        return <CurrencySystem />;
      case 'pacing':
        return <PacingAnalysis entities={filteredEntities} />;
      case 'timelineorder':
        return <TimelineOrder entities={filteredEntities} />;
      case 'dialoguedesign':
        return <DialogueDesigner entities={filteredEntities} />;
      case 'personality':
        return <PersonalityEditor {...viewProps} />;
      case 'arcs':
        return <ArcComparison entities={filteredEntities} />;
      case 'export':
        return <ExportView entities={filteredEntities} spoilerMode={spoilerMode} />;
      default:
        return (
          <EntityList
            type={typeMap[view]}
            entities={filteredEntities.filter(e => e.type === typeMap[view])}
            onSelect={handleSelectEntity}
            onCreate={handleCreateNew}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar 
        view={view} 
        setView={(v) => { setView(v); setSelectedEntityId(null); setSelectedEventId(null); }}
        entities={filteredEntities}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
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

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <Suspense fallback={<LoadingSpinner />}>
                {renderView()}
              </Suspense>
            )}
          </div>

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

      {showCharacterArc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-[800px] max-h-[80vh] overflow-auto">
            <Suspense fallback={<LoadingSpinner />}>
              <CharacterArc
                entity={showCharacterArc}
                allEntities={entities}
                onClose={() => setShowCharacterArc(null)}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
