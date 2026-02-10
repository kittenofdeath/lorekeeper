import { useState, useEffect } from 'react';
import { getAllPlotBeats, createPlotBeat, updatePlotBeat, deletePlotBeat, getAllScenes } from '../db';
import { Layers, Plus, X, Check, Circle, ChevronDown, ChevronUp } from 'lucide-react';

const BEAT_TEMPLATES = {
  'save-the-cat': [
    { beatType: 'opening', title: 'Opening Image', description: 'A visual that represents the struggle & tone' },
    { beatType: 'theme', title: 'Theme Stated', description: 'The theme is hinted at or stated' },
    { beatType: 'setup', title: 'Set-Up', description: 'Explore the "before" world, meet characters' },
    { beatType: 'catalyst', title: 'Catalyst', description: 'Life-changing event that ignites the story' },
    { beatType: 'debate', title: 'Debate', description: 'Hero doubts the journey, should I go?' },
    { beatType: 'break-into-2', title: 'Break into Two', description: 'Hero makes a choice, leaves comfort zone' },
    { beatType: 'b-story', title: 'B Story', description: 'Secondary story, often the love interest' },
    { beatType: 'fun-games', title: 'Fun and Games', description: 'The promise of the premise, trailer moments' },
    { beatType: 'midpoint', title: 'Midpoint', description: 'Stakes are raised, false victory or defeat' },
    { beatType: 'bad-guys', title: 'Bad Guys Close In', description: 'Things fall apart, enemies regroup' },
    { beatType: 'all-is-lost', title: 'All Is Lost', description: 'The lowest point, whiff of death' },
    { beatType: 'dark-night', title: 'Dark Night of the Soul', description: 'Wallowing in hopelessness' },
    { beatType: 'break-into-3', title: 'Break into Three', description: 'Solution found, hero transformed' },
    { beatType: 'finale', title: 'Finale', description: 'Hero proves change, defeats antagonist' },
    { beatType: 'final-image', title: 'Final Image', description: 'Opposite of opening, proof of change' },
  ],
  '3-act': [
    { beatType: 'act1-setup', title: 'Act 1: Setup', description: 'Introduce world, characters, stakes' },
    { beatType: 'inciting', title: 'Inciting Incident', description: 'Event that starts the main conflict' },
    { beatType: 'plot-point-1', title: 'Plot Point 1', description: 'Pushes hero into Act 2' },
    { beatType: 'act2-confront', title: 'Act 2: Confrontation', description: 'Rising action, obstacles' },
    { beatType: 'midpoint', title: 'Midpoint', description: 'Major twist or revelation' },
    { beatType: 'plot-point-2', title: 'Plot Point 2', description: 'Lowest point, pushes to Act 3' },
    { beatType: 'act3-resolution', title: 'Act 3: Resolution', description: 'Climax and denouement' },
  ],
  'heros-journey': [
    { beatType: 'ordinary', title: 'Ordinary World', description: "Hero's normal life" },
    { beatType: 'call', title: 'Call to Adventure', description: 'Something disrupts the ordinary' },
    { beatType: 'refusal', title: 'Refusal of the Call', description: 'Hero hesitates' },
    { beatType: 'mentor', title: 'Meeting the Mentor', description: 'Guidance received' },
    { beatType: 'threshold', title: 'Crossing the Threshold', description: 'Hero commits to journey' },
    { beatType: 'tests', title: 'Tests, Allies, Enemies', description: 'New world challenges' },
    { beatType: 'approach', title: 'Approach to Inmost Cave', description: 'Prepare for ordeal' },
    { beatType: 'ordeal', title: 'Ordeal', description: 'Major crisis, death and rebirth' },
    { beatType: 'reward', title: 'Reward (Seizing the Sword)', description: 'Hero gains what they sought' },
    { beatType: 'road-back', title: 'The Road Back', description: 'Returning to ordinary world' },
    { beatType: 'resurrection', title: 'Resurrection', description: 'Final test, transformation' },
    { beatType: 'elixir', title: 'Return with Elixir', description: 'Hero returns changed' },
  ]
};

export default function PlotStructure() {
  const [beats, setBeats] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [expandedBeat, setExpandedBeat] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const b = await getAllPlotBeats();
    setBeats(b);
    const s = await getAllScenes();
    setScenes(s);
  }

  async function applyTemplate(templateId) {
    if (!confirm('This will add new beats. Continue?')) return;
    
    const template = BEAT_TEMPLATES[templateId];
    for (const beat of template) {
      await createPlotBeat(beat);
    }
    loadData();
    setSelectedTemplate(null);
  }

  async function handleStatusChange(id, status) {
    await updatePlotBeat(id, { status });
    loadData();
  }

  async function handleLinkScene(beatId, sceneId) {
    await updatePlotBeat(beatId, { sceneId: sceneId ? Number(sceneId) : null });
    loadData();
  }

  async function handleDelete(id) {
    if (confirm('Delete this beat?')) {
      await deletePlotBeat(id);
      loadData();
    }
  }

  function getSceneName(id) {
    return scenes.find(s => s.id === id)?.title || 'Not linked';
  }

  const STATUS_COLORS = {
    planned: 'text-gray-400 bg-gray-700',
    drafting: 'text-blue-400 bg-blue-500/20',
    complete: 'text-green-400 bg-green-500/20',
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Layers className="w-6 h-6 text-amber-400" />
          Plot Structure
        </h2>
        <div className="flex gap-2">
          <select
            value={selectedTemplate || ''}
            onChange={e => setSelectedTemplate(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm"
          >
            <option value="">Load template...</option>
            <option value="save-the-cat">Save the Cat (15 beats)</option>
            <option value="3-act">3-Act Structure</option>
            <option value="heros-journey">Hero's Journey</option>
          </select>
          {selectedTemplate && (
            <button
              onClick={() => applyTemplate(selectedTemplate)}
              className="px-3 py-1.5 bg-amber-500 text-gray-900 rounded text-sm font-medium"
            >
              Apply
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      {beats.length > 0 && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm">
              {beats.filter(b => b.status === 'complete').length} / {beats.length} complete
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all"
              style={{ width: `${(beats.filter(b => b.status === 'complete').length / beats.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Beats List */}
      <div className="flex-1 overflow-auto">
        {beats.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No plot beats defined yet</p>
            <p className="text-sm mt-1">Load a template or create custom beats</p>
          </div>
        ) : (
          <div className="space-y-2">
            {beats.map((beat, idx) => (
              <div
                key={beat.id}
                className={`rounded-lg border ${
                  beat.status === 'complete' 
                    ? 'bg-green-500/5 border-green-500/30' 
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                <div 
                  className="p-3 flex items-center gap-3 cursor-pointer"
                  onClick={() => setExpandedBeat(expandedBeat === beat.id ? null : beat.id)}
                >
                  <span className="text-sm text-gray-500 w-6">{idx + 1}</span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleStatusChange(beat.id, beat.status === 'complete' ? 'planned' : 'complete');
                    }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${STATUS_COLORS[beat.status]}`}
                  >
                    {beat.status === 'complete' ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </button>
                  <div className="flex-1">
                    <p className="font-medium">{beat.title}</p>
                    <p className="text-sm text-gray-400">{beat.description}</p>
                  </div>
                  {expandedBeat === beat.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
                
                {expandedBeat === beat.id && (
                  <div className="px-3 pb-3 border-t border-gray-700 pt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Status</label>
                        <select
                          value={beat.status}
                          onChange={e => handleStatusChange(beat.id, e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                        >
                          <option value="planned">Planned</option>
                          <option value="drafting">Drafting</option>
                          <option value="complete">Complete</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Linked Scene</label>
                        <select
                          value={beat.sceneId || ''}
                          onChange={e => handleLinkScene(beat.id, e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                        >
                          <option value="">Not linked</option>
                          {scenes.map(s => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(beat.id)}
                      className="mt-3 text-sm text-red-400 hover:text-red-300"
                    >
                      Delete beat
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
