import { useState } from 'react';
import { searchLore, findScenesWithCharacters } from '../db';
import { Search, User, Calendar, BookOpen, Lightbulb, Filter, X } from 'lucide-react';

export default function AdvancedSearch({ entities, onSelectEntity, onSelectEvent }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [typeFilter, setTypeFilter] = useState(null);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [sceneResults, setSceneResults] = useState([]);
  const [searchMode, setSearchMode] = useState('text'); // 'text' | 'characters'

  async function handleSearch() {
    if (!query.trim() && searchMode === 'text') return;
    
    setIsSearching(true);
    
    if (searchMode === 'text') {
      const r = await searchLore(query, { type: typeFilter });
      setResults(r);
      setSceneResults([]);
    } else {
      // Find scenes with selected characters
      if (selectedCharacters.length >= 2) {
        const scenes = await findScenesWithCharacters(selectedCharacters);
        setSceneResults(scenes);
        setResults([]);
      }
    }
    
    setIsSearching(false);
  }

  function toggleCharacter(id) {
    if (selectedCharacters.includes(id)) {
      setSelectedCharacters(selectedCharacters.filter(c => c !== id));
    } else {
      setSelectedCharacters([...selectedCharacters, id]);
    }
  }

  function getEntityName(id) {
    return entities.find(e => e.id === id)?.name || `Entity #${id}`;
  }

  const characters = entities.filter(e => e.type === 'character');

  const TYPE_ICONS = {
    entity: User,
    event: Calendar,
    scene: BookOpen,
    fact: Lightbulb,
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Search className="w-6 h-6 text-amber-400" />
          Advanced Search
        </h2>
      </div>

      {/* Search Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSearchMode('text')}
          className={`px-4 py-2 rounded-lg text-sm ${
            searchMode === 'text' ? 'bg-amber-500 text-gray-900' : 'bg-gray-700'
          }`}
        >
          Text Search
        </button>
        <button
          onClick={() => setSearchMode('characters')}
          className={`px-4 py-2 rounded-lg text-sm ${
            searchMode === 'characters' ? 'bg-amber-500 text-gray-900' : 'bg-gray-700'
          }`}
        >
          Find Scenes With Characters
        </button>
      </div>

      {searchMode === 'text' ? (
        <>
          {/* Text Search */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search characters, events, scenes, lore..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-lg font-medium disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filter:</span>
            {[null, 'entities', 'events', 'scenes', 'facts'].map(type => (
              <button
                key={type || 'all'}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1 rounded text-sm ${
                  typeFilter === type ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {type || 'All'}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="flex-1 overflow-auto">
            {results.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {query ? 'No results found' : 'Enter a search query'}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-400 mb-2">{results.length} results found</p>
                {results.map((result, idx) => {
                  const Icon = TYPE_ICONS[result.type] || Search;
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-amber-500/50 cursor-pointer"
                      onClick={() => {
                        if (result.type === 'entity') onSelectEntity(result.item.id);
                        else if (result.type === 'event') onSelectEvent(result.item.id);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-gray-700 rounded">
                          <Icon className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 uppercase">{result.type}</span>
                            <span className="text-xs text-gray-600">• matched in {result.match}</span>
                          </div>
                          <p className="font-medium truncate">
                            {result.item.name || result.item.title || result.item.description?.slice(0, 50)}
                          </p>
                          {result.item.description && (
                            <p className="text-sm text-gray-400 truncate mt-1">
                              {result.item.description.slice(0, 100)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Character Scene Finder */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              Select 2+ characters to find scenes where they appear together:
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedCharacters.map(id => (
                <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-sm">
                  {getEntityName(id)}
                  <button onClick={() => toggleCharacter(id)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-auto p-2 bg-gray-800 rounded-lg">
              {characters.filter(c => !selectedCharacters.includes(c.id)).map(char => (
                <button
                  key={char.id}
                  onClick={() => toggleCharacter(char.id)}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                >
                  {char.name}
                </button>
              ))}
            </div>
            <button
              onClick={handleSearch}
              disabled={selectedCharacters.length < 2 || isSearching}
              className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-lg font-medium disabled:opacity-50"
            >
              Find Scenes
            </button>
          </div>

          {/* Scene Results */}
          <div className="flex-1 overflow-auto">
            {sceneResults.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {selectedCharacters.length < 2 
                  ? 'Select at least 2 characters' 
                  : 'No scenes found with these characters together'}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-400 mb-2">
                  {sceneResults.length} scene(s) with {selectedCharacters.map(id => getEntityName(id)).join(' & ')}
                </p>
                {sceneResults.map(scene => (
                  <div key={scene.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <p className="font-medium">{scene.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                      {scene.timeYear && <span>Year {scene.timeYear}</span>}
                      <span>{scene.wordCount || 0} words</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Search Tips */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="text-xs font-medium text-gray-400 mb-2">Search Tips</h4>
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Search finds matches in names, descriptions, aliases, and content</p>
          <p>• Use "Find Scenes With Characters" to find dialogue opportunities</p>
          <p>• Example: "Find all scenes where Tyrion and Cersei are alone"</p>
        </div>
      </div>
    </div>
  );
}
