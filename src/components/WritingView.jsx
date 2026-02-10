import { useState, useEffect, useCallback } from 'react';
import { 
  getAllChapters, createChapter, updateChapter, deleteChapter,
  getScenesForChapter, createScene, updateScene, deleteScene,
  getSceneCharacters, addSceneCharacter, removeSceneCharacter,
  getEntity, calculateAge, getSceneDrafts, saveSceneDraft
} from '../db';
import { BookOpen, Plus, Trash2, Save, ChevronRight, ChevronDown, User, MapPin, Edit3, GripVertical, Clock, Eye, EyeOff, History, AlertTriangle } from 'lucide-react';

export default function WritingView({ entities, onSelectEntity }) {
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedScene, setSelectedScene] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [sceneCharacters, setSceneCharacters] = useState([]);
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [editingScene, setEditingScene] = useState(false);
  const [draggedScene, setDraggedScene] = useState(null);
  const [draggedChapter, setDraggedChapter] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [showDrafts, setShowDrafts] = useState(false);

  useEffect(() => {
    loadChapters();
  }, []);

  useEffect(() => {
    if (selectedChapter) {
      loadScenes(selectedChapter.id);
    }
  }, [selectedChapter]);

  useEffect(() => {
    if (selectedScene) {
      loadSceneCharacters(selectedScene.id);
      loadDrafts(selectedScene.id);
    }
  }, [selectedScene]);

  async function loadDrafts(sceneId) {
    const d = await getSceneDrafts(sceneId);
    setDrafts(d);
  }

  async function handleSaveDraft() {
    if (!selectedScene) return;
    const note = prompt('Draft note (optional):');
    await saveSceneDraft(selectedScene.id, selectedScene.content, note || '');
    loadDrafts(selectedScene.id);
  }

  function restoreDraft(draft) {
    if (confirm('Restore this draft? Current content will be replaced.')) {
      setSelectedScene({ ...selectedScene, content: draft.content });
    }
  }

  async function loadChapters() {
    const chs = await getAllChapters();
    setChapters(chs);
  }

  async function loadScenes(chapterId) {
    const scs = await getScenesForChapter(chapterId);
    setScenes(scs);
  }

  async function loadSceneCharacters(sceneId) {
    const chars = await getSceneCharacters(sceneId);
    setSceneCharacters(chars);
  }

  async function handleCreateChapter() {
    const title = prompt('Chapter title:');
    if (title) {
      await createChapter({ title, povCharacterId: null });
      loadChapters();
    }
  }

  async function handleSetChapterPOV(chapterId, povId) {
    await updateChapter(chapterId, { povCharacterId: povId ? Number(povId) : null });
    loadChapters();
  }

  async function handleCreateScene() {
    if (!selectedChapter) return;
    const title = prompt('Scene title:');
    if (title) {
      await createScene({ chapterId: selectedChapter.id, title, content: '' });
      loadScenes(selectedChapter.id);
    }
  }

  async function handleDeleteChapter(id) {
    if (confirm('Delete this chapter and all its scenes?')) {
      await deleteChapter(id);
      if (selectedChapter?.id === id) {
        setSelectedChapter(null);
        setSelectedScene(null);
      }
      loadChapters();
    }
  }

  async function handleDeleteScene(id) {
    if (confirm('Delete this scene?')) {
      await deleteScene(id);
      if (selectedScene?.id === id) setSelectedScene(null);
      loadScenes(selectedChapter.id);
    }
  }

  async function handleSaveScene() {
    if (!selectedScene) return;
    await updateScene(selectedScene.id, {
      title: selectedScene.title,
      content: selectedScene.content,
      timeYear: selectedScene.timeYear,
      locationId: selectedScene.locationId
    });
    setEditingScene(false);
    loadScenes(selectedChapter.id);
  }

  async function handleAddCharacterToScene(entityId) {
    if (!selectedScene) return;
    await addSceneCharacter(selectedScene.id, Number(entityId));
    loadSceneCharacters(selectedScene.id);
  }

  async function handleRemoveCharacterFromScene(id) {
    await removeSceneCharacter(id);
    loadSceneCharacters(selectedScene.id);
  }

  function toggleChapter(chapterId) {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  }

  function getEntityName(id) {
    const e = entities.find(x => x.id === id);
    return e?.name || `Entity #${id}`;
  }

  function getCharacterAge(charId) {
    if (!selectedScene?.timeYear) return null;
    const char = entities.find(e => e.id === charId);
    if (!char?.birthDate) return null;
    return calculateAge(char.birthDate, selectedScene.timeYear, char.deathDate);
  }

  // Drag and drop for scenes
  async function handleSceneDrop(targetIdx) {
    if (draggedScene === null || draggedScene === targetIdx) return;
    
    const reordered = [...scenes];
    const [moved] = reordered.splice(draggedScene, 1);
    reordered.splice(targetIdx, 0, moved);
    
    // Update order in DB
    for (let i = 0; i < reordered.length; i++) {
      await updateScene(reordered[i].id, { order: i + 1 });
    }
    
    setDraggedScene(null);
    loadScenes(selectedChapter.id);
  }

  // Drag and drop for chapters
  async function handleChapterDrop(targetIdx) {
    if (draggedChapter === null || draggedChapter === targetIdx) return;
    
    const reordered = [...chapters];
    const [moved] = reordered.splice(draggedChapter, 1);
    reordered.splice(targetIdx, 0, moved);
    
    for (let i = 0; i < reordered.length; i++) {
      await updateChapter(reordered[i].id, { order: i + 1 });
    }
    
    setDraggedChapter(null);
    loadChapters();
  }

  const totalWordCount = chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
  const locations = entities.filter(e => e.type === 'location');
  const characters = entities.filter(e => e.type === 'character');

  return (
    <div className="h-full flex">
      {/* Left Panel - Chapter/Scene Outline */}
      <div className="w-72 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              Manuscript
            </h2>
            <button
              onClick={handleCreateChapter}
              className="p-1 hover:bg-gray-700 rounded"
              title="Add Chapter"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400">
            {chapters.length} chapters · {totalWordCount.toLocaleString()} words
          </p>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {chapters.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No chapters yet. Click + to add one.
            </p>
          ) : (
            chapters.map((chapter, idx) => (
              <div 
                key={chapter.id} 
                className="mb-1"
                draggable
                onDragStart={() => setDraggedChapter(idx)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleChapterDrop(idx)}
              >
                <div
                  className={`flex items-center gap-1 p-2 rounded cursor-pointer ${
                    selectedChapter?.id === chapter.id ? 'bg-gray-700' : 'hover:bg-gray-800'
                  } ${draggedChapter === idx ? 'opacity-50' : ''}`}
                  onClick={() => {
                    setSelectedChapter(chapter);
                    toggleChapter(chapter.id);
                  }}
                >
                  <GripVertical className="w-3 h-3 text-gray-500 cursor-grab" />
                  {expandedChapters.has(chapter.id) ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="flex-1 text-sm truncate">
                    Ch {idx + 1}: {chapter.title}
                    {chapter.povCharacterId && (
                      <span className="text-xs text-blue-400 ml-1">
                        [{characters.find(c => c.id === chapter.povCharacterId)?.name?.split(' ')[0] || 'POV'}]
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-gray-500">{chapter.wordCount || 0}w</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteChapter(chapter.id); }}
                    className="p-1 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3 h-3 text-gray-400" />
                  </button>
                </div>

                {expandedChapters.has(chapter.id) && selectedChapter?.id === chapter.id && (
                  <div className="ml-4 mt-1 space-y-1">
                    {/* POV Selector */}
                    <div className="flex items-center gap-1 p-1 text-xs">
                      <Eye className="w-3 h-3 text-gray-400" />
                      <select
                        value={chapter.povCharacterId || ''}
                        onChange={e => handleSetChapterPOV(chapter.id, e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-xs"
                        onClick={e => e.stopPropagation()}
                      >
                        <option value="">POV: None</option>
                        {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    {scenes.map((scene, sIdx) => (
                      <div
                        key={scene.id}
                        draggable
                        onDragStart={() => setDraggedScene(sIdx)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={() => handleSceneDrop(sIdx)}
                        className={`flex items-center gap-1 p-1.5 rounded text-sm cursor-pointer ${
                          selectedScene?.id === scene.id ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-gray-800'
                        } ${draggedScene === sIdx ? 'opacity-50' : ''}`}
                        onClick={() => setSelectedScene(scene)}
                      >
                        <GripVertical className="w-3 h-3 text-gray-500 cursor-grab" />
                        <span className="text-gray-500">{sIdx + 1}.</span>
                        <span className="flex-1 truncate">{scene.title}</span>
                        <span className="text-xs text-gray-500">{scene.wordCount || 0}w</span>
                      </div>
                    ))}
                    <button
                      onClick={handleCreateScene}
                      className="flex items-center gap-1 p-1.5 text-sm text-gray-400 hover:text-white w-full"
                    >
                      <Plus className="w-3 h-3" /> Add Scene
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Scene Editor */}
      <div className="flex-1 flex flex-col">
        {selectedScene ? (
          <>
            {/* Scene Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-2">
                {editingScene ? (
                  <input
                    type="text"
                    value={selectedScene.title}
                    onChange={e => setSelectedScene({ ...selectedScene, title: e.target.value })}
                    className="text-xl font-bold bg-transparent border-b border-amber-500 focus:outline-none"
                  />
                ) : (
                  <h2 className="text-xl font-bold">{selectedScene.title}</h2>
                )}
                <div className="flex items-center gap-2">
                  {editingScene ? (
                    <button
                      onClick={handleSaveScene}
                      className="flex items-center gap-1 px-3 py-1 bg-amber-500 text-gray-900 rounded text-sm"
                    >
                      <Save className="w-4 h-4" /> Save
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingScene(true)}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                    >
                      <Edit3 className="w-4 h-4" /> Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteScene(selectedScene.id)}
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Scene metadata */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-green-400" />
                  {editingScene ? (
                    <select
                      value={selectedScene.locationId || ''}
                      onChange={e => setSelectedScene({ ...selectedScene, locationId: e.target.value ? Number(e.target.value) : null })}
                      className="bg-gray-700 border border-gray-600 rounded px-2 py-0.5 text-sm"
                    >
                      <option value="">No location</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-400">
                      {selectedScene.locationId ? getEntityName(selectedScene.locationId) : 'No location'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Year:</span>
                  {editingScene ? (
                    <input
                      type="number"
                      value={selectedScene.timeYear || ''}
                      onChange={e => setSelectedScene({ ...selectedScene, timeYear: e.target.value ? Number(e.target.value) : null })}
                      className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-0.5 text-sm"
                      placeholder="Year"
                    />
                  ) : (
                    <span className="text-gray-400">{selectedScene.timeYear || '?'}</span>
                  )}
                </div>
                <span className="text-gray-500">{selectedScene.wordCount || 0} words</span>
                
                {/* Unreliable narrator toggle */}
                {editingScene && (
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedScene.unreliableNarrator || false}
                      onChange={e => setSelectedScene({ ...selectedScene, unreliableNarrator: e.target.checked })}
                      className="w-3 h-3"
                    />
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-amber-400">Unreliable</span>
                  </label>
                )}
                {!editingScene && selectedScene.unreliableNarrator && (
                  <span className="flex items-center gap-1 text-xs text-amber-400">
                    <AlertTriangle className="w-3 h-3" /> Unreliable narrator
                  </span>
                )}

                {/* Draft controls */}
                <button
                  onClick={() => setShowDrafts(!showDrafts)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200"
                >
                  <History className="w-3 h-3" /> {drafts.length} drafts
                </button>
                {editingScene && (
                  <button
                    onClick={handleSaveDraft}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Save draft
                  </button>
                )}
              </div>

              {/* Drafts panel */}
              {showDrafts && drafts.length > 0 && (
                <div className="mt-2 p-2 bg-gray-800 rounded border border-gray-700 max-h-32 overflow-auto">
                  <p className="text-xs text-gray-400 mb-1">Previous drafts:</p>
                  {drafts.slice(0, 5).map(draft => (
                    <div key={draft.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-700 last:border-0">
                      <span className="text-gray-500">
                        {new Date(draft.savedAt).toLocaleString()}
                        {draft.note && <span className="text-gray-400 ml-1">- {draft.note}</span>}
                      </span>
                      <button onClick={() => restoreDraft(draft)} className="text-blue-400 hover:text-blue-300">
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scene Content */}
            <div className="flex-1 flex">
              <div className="flex-1 p-4">
                <textarea
                  value={selectedScene.content || ''}
                  onChange={e => setSelectedScene({ ...selectedScene, content: e.target.value })}
                  placeholder="Write your scene here..."
                  className="w-full h-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-200 resize-none focus:outline-none focus:border-amber-500 font-serif text-lg leading-relaxed"
                  disabled={!editingScene}
                />
              </div>

              {/* Scene Characters Panel */}
              <div className="w-56 border-l border-gray-700 p-3">
                <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                  <User className="w-4 h-4" /> Characters in Scene
                </h3>
                <div className="space-y-1 mb-3">
                  {sceneCharacters.map(sc => {
                    const age = getCharacterAge(sc.entityId);
                    return (
                      <div key={sc.id} className="flex items-center justify-between p-1.5 bg-gray-700/50 rounded text-sm">
                        <div className="flex items-center gap-1">
                          <span 
                            className="text-blue-300 cursor-pointer hover:text-blue-200"
                            onClick={() => onSelectEntity(sc.entityId)}
                          >
                            {getEntityName(sc.entityId)}
                          </span>
                          {age !== null && (
                            <span className="text-xs text-gray-500" title="Age in this scene">
                              ({age})
                            </span>
                          )}
                        </div>
                        {editingScene && (
                          <button
                            onClick={() => handleRemoveCharacterFromScene(sc.id)}
                            className="text-gray-400 hover:text-red-400"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {editingScene && (
                  <select
                    onChange={e => {
                      if (e.target.value) {
                        handleAddCharacterToScene(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  >
                    <option value="">+ Add character</option>
                    {characters.filter(c => !sceneCharacters.some(sc => sc.entityId === c.id)).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </>
        ) : selectedChapter ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a scene to start writing</p>
              <button
                onClick={handleCreateScene}
                className="mt-4 text-amber-400 hover:text-amber-300"
              >
                + Create first scene
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a chapter to view scenes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
