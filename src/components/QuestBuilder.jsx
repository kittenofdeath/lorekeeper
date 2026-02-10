import { useState, useEffect } from 'react';
import {
  getAllQuests, getQuest, createQuest, updateQuest, deleteQuest,
  getQuestObjectives, createQuestObjective, updateQuestObjective, deleteQuestObjective,
  getQuestRewards, createQuestReward, deleteQuestReward,
  getQuestPrerequisites, createQuestPrerequisite, deleteQuestPrerequisite,
  getQuestStages, createQuestStage, updateQuestStage, deleteQuestStage,
  getActiveProject
} from '../db';
import { Scroll, Plus, Trash2, Target, Gift, Lock, MapPin, Users, ChevronRight, Save, X, Flag } from 'lucide-react';

const QUEST_TYPES = [
  { value: 'main', label: 'Main Quest', color: '#eab308' },
  { value: 'side', label: 'Side Quest', color: '#3b82f6' },
  { value: 'faction', label: 'Faction Quest', color: '#a855f7' },
  { value: 'radiant', label: 'Radiant/Repeatable', color: '#22c55e' },
  { value: 'companion', label: 'Companion Quest', color: '#ec4899' },
  { value: 'bounty', label: 'Bounty/Contract', color: '#f97316' },
  { value: 'fetch', label: 'Fetch Quest', color: '#6b7280' },
  { value: 'escort', label: 'Escort Quest', color: '#14b8a6' },
];

const QUEST_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'outlined', label: 'Outlined' },
  { value: 'scripted', label: 'Scripted' },
  { value: 'implemented', label: 'Implemented' },
  { value: 'tested', label: 'Tested' },
];

const OBJECTIVE_TYPES = [
  { value: 'kill', label: 'Kill/Defeat' },
  { value: 'collect', label: 'Collect Items' },
  { value: 'talk', label: 'Talk To' },
  { value: 'escort', label: 'Escort' },
  { value: 'reach', label: 'Reach Location' },
  { value: 'discover', label: 'Discover' },
  { value: 'defend', label: 'Defend' },
  { value: 'craft', label: 'Craft' },
  { value: 'custom', label: 'Custom' },
];

const REWARD_TYPES = [
  { value: 'item', label: 'Item' },
  { value: 'gold', label: 'Gold/Currency' },
  { value: 'xp', label: 'Experience' },
  { value: 'reputation', label: 'Reputation' },
  { value: 'unlock', label: 'Unlock (ability/area)' },
  { value: 'follower', label: 'Companion/Follower' },
];

export default function QuestBuilder({ entities, spoilerMode }) {
  const [quests, setQuests] = useState([]);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [objectives, setObjectives] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [prerequisites, setPrerequisites] = useState([]);
  const [stages, setStages] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [dirty, setDirty] = useState(false);

  const characters = entities.filter(e => e.type === 'character');
  const locations = entities.filter(e => e.type === 'location');
  const factions = entities.filter(e => e.type === 'faction');
  const items = entities.filter(e => e.type === 'item');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedQuest?.id) {
      loadQuestDetails(selectedQuest.id);
    }
  }, [selectedQuest?.id]);

  async function loadData() {
    const project = await getActiveProject();
    if (project) {
      setProjectId(project.id);
      const q = await getAllQuests(project.id);
      setQuests(spoilerMode ? q : q.filter(x => !x.isSpoiler));
    }
  }

  async function loadQuestDetails(questId) {
    const [obj, rew, prereq, stg] = await Promise.all([
      getQuestObjectives(questId),
      getQuestRewards(questId),
      getQuestPrerequisites(questId),
      getQuestStages(questId)
    ]);
    setObjectives(obj);
    setRewards(rew);
    setPrerequisites(prereq);
    setStages(stg);
  }

  async function handleCreateQuest() {
    if (!projectId) return;
    const id = await createQuest({
      projectId,
      name: 'New Quest',
      type: 'side',
      status: 'draft',
      description: '',
      level: 1,
      isRepeatable: false,
      isSpoiler: false
    });
    await loadData();
    const quest = await getQuest(id);
    setSelectedQuest(quest);
  }

  async function handleSaveQuest() {
    if (!selectedQuest) return;
    await updateQuest(selectedQuest.id, selectedQuest);
    setDirty(false);
    loadData();
  }

  async function handleDeleteQuest(id) {
    if (confirm('Delete this quest and all its objectives, rewards, and stages?')) {
      await deleteQuest(id);
      if (selectedQuest?.id === id) {
        setSelectedQuest(null);
      }
      loadData();
    }
  }

  function updateSelectedQuest(updates) {
    setSelectedQuest({ ...selectedQuest, ...updates });
    setDirty(true);
  }

  async function handleAddObjective() {
    await createQuestObjective({
      questId: selectedQuest.id,
      type: 'custom',
      description: 'New objective',
      targetCount: 1
    });
    loadQuestDetails(selectedQuest.id);
  }

  async function handleAddReward() {
    await createQuestReward({
      questId: selectedQuest.id,
      type: 'gold',
      amount: 100
    });
    loadQuestDetails(selectedQuest.id);
  }

  async function handleAddPrerequisite() {
    await createQuestPrerequisite({
      questId: selectedQuest.id,
      prereqType: 'quest'
    });
    loadQuestDetails(selectedQuest.id);
  }

  async function handleAddStage() {
    await createQuestStage({
      questId: selectedQuest.id,
      description: 'New stage'
    });
    loadQuestDetails(selectedQuest.id);
  }

  function getEntityName(id, list) {
    return list.find(e => e.id === id)?.name || `#${id}`;
  }

  function getQuestTypeBadge(type) {
    const t = QUEST_TYPES.find(x => x.value === type);
    return t ? (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: t.color + '30', color: t.color }}>
        {t.label}
      </span>
    ) : null;
  }

  const filteredQuests = filter === 'all' ? quests : quests.filter(q => q.type === filter);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Scroll className="w-5 h-5 text-amber-400" />
          Quest Builder
        </h2>
        <div className="flex items-center gap-2">
          {dirty && (
            <button onClick={handleSaveQuest} className="flex items-center gap-1 px-3 py-1 bg-amber-500 text-gray-900 rounded text-sm">
              <Save className="w-4 h-4" /> Save
            </button>
          )}
          <button onClick={handleCreateQuest} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm">
            <Plus className="w-4 h-4" /> New Quest
          </button>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-1 mb-4 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-2 py-1 rounded text-xs ${filter === 'all' ? 'bg-gray-600 text-white' : 'bg-gray-700/50 text-gray-400'}`}
        >
          All ({quests.length})
        </button>
        {QUEST_TYPES.map(t => {
          const count = quests.filter(q => q.type === t.value).length;
          return (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`px-2 py-1 rounded text-xs ${filter === t.value ? 'text-white' : 'text-gray-300'}`}
              style={{ backgroundColor: filter === t.value ? t.color : t.color + '30' }}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Quest List */}
        <div className="w-72 overflow-auto space-y-1">
          {filteredQuests.length === 0 ? (
            <p className="text-sm text-gray-500">No quests yet. Create one to start!</p>
          ) : (
            filteredQuests.map(quest => (
              <div
                key={quest.id}
                onClick={() => setSelectedQuest(quest)}
                className={`p-3 rounded-lg cursor-pointer border ${
                  selectedQuest?.id === quest.id
                    ? 'bg-amber-500/20 border-amber-500/50'
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm">{quest.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {getQuestTypeBadge(quest.type)}
                      <span className="text-[10px] text-gray-500">Lv.{quest.level || 1}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteQuest(quest.id); }}
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
                {quest.questGiverId && (
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {getEntityName(quest.questGiverId, characters)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Quest Editor */}
        {selectedQuest ? (
          <div className="flex-1 overflow-auto space-y-4 pr-2">
            {/* Basic Info */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Flag className="w-4 h-4" /> Quest Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Quest Name</label>
                  <input
                    type="text"
                    value={selectedQuest.name || ''}
                    onChange={e => updateSelectedQuest({ name: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Type</label>
                    <select
                      value={selectedQuest.type || 'side'}
                      onChange={e => updateSelectedQuest({ type: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-2 text-sm"
                    >
                      {QUEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Status</label>
                    <select
                      value={selectedQuest.status || 'draft'}
                      onChange={e => updateSelectedQuest({ status: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-2 text-sm"
                    >
                      {QUEST_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Level</label>
                    <input
                      type="number"
                      value={selectedQuest.level || 1}
                      onChange={e => updateSelectedQuest({ level: Number(e.target.value) })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Quest Giver</label>
                    <select
                      value={selectedQuest.questGiverId || ''}
                      onChange={e => updateSelectedQuest({ questGiverId: e.target.value ? Number(e.target.value) : null })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-2 text-sm"
                    >
                      <option value="">None</option>
                      {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Location</label>
                    <select
                      value={selectedQuest.locationId || ''}
                      onChange={e => updateSelectedQuest({ locationId: e.target.value ? Number(e.target.value) : null })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-2 text-sm"
                    >
                      <option value="">Any</option>
                      {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Associated Faction</label>
                  <select
                    value={selectedQuest.factionId || ''}
                    onChange={e => updateSelectedQuest({ factionId: e.target.value ? Number(e.target.value) : null })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-2 text-sm"
                  >
                    <option value="">None</option>
                    {factions.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Description</label>
                  <textarea
                    value={selectedQuest.description || ''}
                    onChange={e => updateSelectedQuest({ description: e.target.value })}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm resize-none"
                    placeholder="Quest description shown to player..."
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedQuest.isRepeatable || false}
                      onChange={e => updateSelectedQuest({ isRepeatable: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Repeatable</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedQuest.isSpoiler || false}
                      onChange={e => updateSelectedQuest({ isSpoiler: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Spoiler</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Objectives */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" /> Objectives ({objectives.length})
                </h3>
                <button onClick={handleAddObjective} className="text-xs text-amber-400 hover:text-amber-300">+ Add</button>
              </div>
              <div className="space-y-2">
                {objectives.map((obj, idx) => (
                  <div key={obj.id} className="flex items-center gap-2 p-2 bg-gray-700/50 rounded">
                    <span className="text-xs text-gray-500 w-5">{idx + 1}.</span>
                    <select
                      value={obj.type}
                      onChange={async e => { await updateQuestObjective(obj.id, { type: e.target.value }); loadQuestDetails(selectedQuest.id); }}
                      className="bg-gray-600 border border-gray-500 rounded px-1 py-0.5 text-xs"
                    >
                      {OBJECTIVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <input
                      type="text"
                      value={obj.description}
                      onChange={async e => { await updateQuestObjective(obj.id, { description: e.target.value }); loadQuestDetails(selectedQuest.id); }}
                      className="flex-1 bg-transparent border-b border-gray-600 text-sm focus:outline-none"
                    />
                    {obj.targetCount > 1 && (
                      <span className="text-xs text-gray-500">×{obj.targetCount}</span>
                    )}
                    {obj.isOptional && (
                      <span className="text-[10px] text-gray-500">(optional)</span>
                    )}
                    <button onClick={async () => { await deleteQuestObjective(obj.id); loadQuestDetails(selectedQuest.id); }} className="text-gray-500 hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {objectives.length === 0 && <p className="text-xs text-gray-500">No objectives defined</p>}
              </div>
            </div>

            {/* Rewards */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-yellow-400" /> Rewards ({rewards.length})
                </h3>
                <button onClick={handleAddReward} className="text-xs text-amber-400 hover:text-amber-300">+ Add</button>
              </div>
              <div className="space-y-2">
                {rewards.map(rew => (
                  <div key={rew.id} className="flex items-center gap-2 p-2 bg-gray-700/50 rounded">
                    <select
                      value={rew.type}
                      onChange={async e => { await updateQuestReward(rew.id, { type: e.target.value }); loadQuestDetails(selectedQuest.id); }}
                      className="bg-gray-600 border border-gray-500 rounded px-1 py-0.5 text-xs"
                    >
                      {REWARD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    {rew.type === 'item' ? (
                      <select
                        value={rew.itemId || ''}
                        onChange={async e => { await updateQuestReward(rew.id, { itemId: Number(e.target.value) }); loadQuestDetails(selectedQuest.id); }}
                        className="flex-1 bg-gray-600 border border-gray-500 rounded px-1 py-0.5 text-xs"
                      >
                        <option value="">Select item...</option>
                        {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                      </select>
                    ) : rew.type === 'reputation' ? (
                      <select
                        value={rew.factionId || ''}
                        onChange={async e => { await updateQuestReward(rew.id, { factionId: Number(e.target.value) }); loadQuestDetails(selectedQuest.id); }}
                        className="flex-1 bg-gray-600 border border-gray-500 rounded px-1 py-0.5 text-xs"
                      >
                        <option value="">Select faction...</option>
                        {factions.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    ) : (
                      <input
                        type="number"
                        value={rew.amount || 0}
                        onChange={async e => { await updateQuestReward(rew.id, { amount: Number(e.target.value) }); loadQuestDetails(selectedQuest.id); }}
                        className="w-24 bg-gray-600 border border-gray-500 rounded px-2 py-0.5 text-xs"
                      />
                    )}
                    <button onClick={async () => { await deleteQuestReward(rew.id); loadQuestDetails(selectedQuest.id); }} className="text-gray-500 hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {rewards.length === 0 && <p className="text-xs text-gray-500">No rewards defined</p>}
              </div>
            </div>

            {/* Prerequisites */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-red-400" /> Prerequisites ({prerequisites.length})
                </h3>
                <button onClick={handleAddPrerequisite} className="text-xs text-amber-400 hover:text-amber-300">+ Add</button>
              </div>
              <div className="space-y-2">
                {prerequisites.map(prereq => (
                  <div key={prereq.id} className="flex items-center gap-2 p-2 bg-gray-700/50 rounded text-sm">
                    <span className="text-gray-500">Requires:</span>
                    <select
                      value={prereq.prereqQuestId || ''}
                      onChange={async e => { 
                        await createQuestPrerequisite({ ...prereq, prereqQuestId: Number(e.target.value) }); 
                        await deleteQuestPrerequisite(prereq.id);
                        loadQuestDetails(selectedQuest.id); 
                      }}
                      className="flex-1 bg-gray-600 border border-gray-500 rounded px-1 py-0.5 text-xs"
                    >
                      <option value="">Select quest...</option>
                      {quests.filter(q => q.id !== selectedQuest.id).map(q => (
                        <option key={q.id} value={q.id}>{q.name}</option>
                      ))}
                    </select>
                    <button onClick={async () => { await deleteQuestPrerequisite(prereq.id); loadQuestDetails(selectedQuest.id); }} className="text-gray-500 hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {prerequisites.length === 0 && <p className="text-xs text-gray-500">No prerequisites</p>}
              </div>
            </div>

            {/* Quest Stages */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-green-400" /> Quest Stages ({stages.length})
                </h3>
                <button onClick={handleAddStage} className="text-xs text-amber-400 hover:text-amber-300">+ Add Stage</button>
              </div>
              <div className="space-y-2">
                {stages.map((stage, idx) => (
                  <div key={stage.id} className="p-3 bg-gray-700/50 rounded border-l-2 border-green-500">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-green-400">Stage {idx + 1}</span>
                      <button onClick={async () => { await deleteQuestStage(stage.id); loadQuestDetails(selectedQuest.id); }} className="ml-auto text-gray-500 hover:text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <textarea
                      value={stage.description || ''}
                      onChange={async e => { await updateQuestStage(stage.id, { description: e.target.value }); loadQuestDetails(selectedQuest.id); }}
                      rows={2}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm resize-none"
                      placeholder="What happens in this stage..."
                    />
                    <div className="flex gap-2 mt-2">
                      <select
                        value={stage.locationId || ''}
                        onChange={async e => { await updateQuestStage(stage.id, { locationId: e.target.value ? Number(e.target.value) : null }); loadQuestDetails(selectedQuest.id); }}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs"
                      >
                        <option value="">📍 Location...</option>
                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
                {stages.length === 0 && <p className="text-xs text-gray-500">No stages defined. Add stages to outline quest flow.</p>}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a quest to edit or create a new one
          </div>
        )}
      </div>
    </div>
  );
}
