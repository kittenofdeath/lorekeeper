import { useState, useEffect } from 'react';
import { getPersonality, savePersonality, getAllPersonalities } from '../db';
import { Brain, Save, User, Castle, Users, ChevronRight } from 'lucide-react';

// Big Five personality traits (for individuals)
const BIG_FIVE = [
  { id: 'openness', label: 'Openness', low: 'Practical, conventional', high: 'Curious, creative' },
  { id: 'conscientiousness', label: 'Conscientiousness', low: 'Spontaneous, flexible', high: 'Organized, disciplined' },
  { id: 'extraversion', label: 'Extraversion', low: 'Reserved, solitary', high: 'Outgoing, energetic' },
  { id: 'agreeableness', label: 'Agreeableness', low: 'Competitive, skeptical', high: 'Cooperative, trusting' },
  { id: 'neuroticism', label: 'Neuroticism', low: 'Calm, secure', high: 'Anxious, sensitive' },
];

// Group culture traits (for factions/races)
const GROUP_TRAITS = [
  { id: 'militarism', label: 'Militarism', low: 'Pacifist, diplomatic', high: 'Warlike, aggressive' },
  { id: 'tradition', label: 'Traditionalism', low: 'Progressive, adaptive', high: 'Conservative, ritualistic' },
  { id: 'openness', label: 'Openness to Outsiders', low: 'Xenophobic, insular', high: 'Welcoming, cosmopolitan' },
  { id: 'hierarchy', label: 'Hierarchy', low: 'Egalitarian, flat', high: 'Stratified, rigid caste' },
  { id: 'collectivism', label: 'Collectivism', low: 'Individualistic', high: 'Community-focused' },
  { id: 'religiosity', label: 'Religiosity', low: 'Secular, skeptical', high: 'Devout, theocratic' },
  { id: 'honor', label: 'Honor Culture', low: 'Pragmatic, flexible', high: 'Honor-bound, rigid codes' },
];

const VALUES = [
  { id: 'power', label: 'Power', description: 'Desire for control, influence' },
  { id: 'achievement', label: 'Achievement', description: 'Personal success, competence' },
  { id: 'hedonism', label: 'Hedonism', description: 'Pleasure, enjoyment' },
  { id: 'stimulation', label: 'Stimulation', description: 'Excitement, novelty' },
  { id: 'selfdirection', label: 'Self-Direction', description: 'Independence, freedom' },
  { id: 'universalism', label: 'Universalism', description: 'Justice, equality' },
  { id: 'benevolence', label: 'Benevolence', description: 'Helping loved ones' },
  { id: 'tradition', label: 'Tradition', description: 'Customs, stability' },
  { id: 'conformity', label: 'Conformity', description: 'Obedience, duty' },
  { id: 'security', label: 'Security', description: 'Safety, order' },
];

const MOTIVATIONS = [
  'Revenge', 'Love', 'Duty', 'Glory', 'Survival', 'Justice', 'Freedom', 'Knowledge', 'Wealth', 'Family', 'Faith', 'Legacy'
];

const GROUP_MOTIVATIONS = [
  'Expansion', 'Defense', 'Domination', 'Prosperity', 'Honor', 'Survival', 'Unity', 'Revenge', 'Justice', 'Tradition', 'Faith', 'Independence'
];

export default function PersonalityEditor({ entities, onSelectEntity }) {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [personality, setPersonality] = useState(null);
  const [allPersonalities, setAllPersonalities] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [viewType, setViewType] = useState('characters'); // 'characters' | 'factions'

  const characters = entities.filter(e => e.type === 'character');
  const factions = entities.filter(e => e.type === 'faction');
  
  // Build faction hierarchy
  const topLevelFactions = factions.filter(f => !f.parentFactionId);
  const getChildFactions = (parentId) => factions.filter(f => f.parentFactionId === parentId);
  const getFactionDepth = (faction, depth = 0) => {
    if (!faction.parentFactionId) return depth;
    const parent = factions.find(f => f.id === faction.parentFactionId);
    return parent ? getFactionDepth(parent, depth + 1) : depth;
  };

  const isGroup = selectedEntity?.type === 'faction';

  useEffect(() => {
    loadAllPersonalities();
  }, []);

  useEffect(() => {
    if (selectedEntity) {
      loadPersonality(selectedEntity.id);
    }
  }, [selectedEntity]);

  async function loadAllPersonalities() {
    const all = await getAllPersonalities();
    setAllPersonalities(all);
  }

  async function loadPersonality(entityId) {
    const p = await getPersonality(entityId);
    if (p) {
      setPersonality(p);
    } else {
      // Default personality
      setPersonality({
        entityId,
        openness: 50,
        conscientiousness: 50,
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 50,
        // Group traits
        militarism: 50,
        tradition: 50,
        hierarchy: 50,
        collectivism: 50,
        religiosity: 50,
        honor: 50,
        values: {},
        motivations: [],
        // Group-specific
        customs: '',
        taboos: '',
        greetings: '',
      });
    }
    setDirty(false);
  }

  async function handleSave() {
    if (!personality) return;
    await savePersonality(personality.entityId, personality);
    setDirty(false);
    loadAllPersonalities();
  }

  function updateTrait(trait, value) {
    setPersonality({ ...personality, [trait]: value });
    setDirty(true);
  }

  function updateValue(valueId, score) {
    const values = { ...personality.values, [valueId]: score };
    setPersonality({ ...personality, values });
    setDirty(true);
  }

  function toggleMotivation(mot) {
    const motivations = personality.motivations || [];
    if (motivations.includes(mot)) {
      setPersonality({ ...personality, motivations: motivations.filter(m => m !== mot) });
    } else {
      setPersonality({ ...personality, motivations: [...motivations, mot] });
    }
    setDirty(true);
  }

  function hasPersonality(entityId) {
    return allPersonalities.some(p => p.entityId === entityId);
  }

  function FactionItem({ faction, depth = 0 }) {
    const children = getChildFactions(faction.id);
    return (
      <>
        <button
          onClick={() => setSelectedEntity(faction)}
          className={`w-full text-left p-2 rounded flex items-center gap-2 ${
            selectedEntity?.id === faction.id ? 'bg-amber-500/20' : 'bg-gray-800 hover:bg-gray-700'
          }`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          {depth > 0 && <ChevronRight className="w-3 h-3 text-gray-600" />}
          <Castle className={`w-4 h-4 ${hasPersonality(faction.id) ? 'text-green-400' : 'text-gray-500'}`} />
          <span className="text-sm truncate">{faction.name}</span>
          {faction.factionType && (
            <span className="text-[10px] text-gray-500 ml-auto">{faction.factionType}</span>
          )}
        </button>
        {children.map(child => (
          <FactionItem key={child.id} faction={child} depth={depth + 1} />
        ))}
      </>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Brain className="w-5 h-5 text-amber-400" />
          Personality & Culture
        </h2>
        {dirty && (
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1 bg-amber-500 text-gray-900 rounded text-sm"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        )}
      </div>

      {/* View Type Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setViewType('characters'); setSelectedEntity(null); }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${
            viewType === 'characters' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          <User className="w-4 h-4" /> Characters ({characters.length})
        </button>
        <button
          onClick={() => { setViewType('factions'); setSelectedEntity(null); }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${
            viewType === 'factions' ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-gray-300'
          }`}
        >
          <Castle className="w-4 h-4" /> Factions ({factions.length})
        </button>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Entity List */}
        <div className="w-56 overflow-auto space-y-1">
          {viewType === 'characters' ? (
            <>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Characters</h3>
              {characters.map(char => (
                <button
                  key={char.id}
                  onClick={() => setSelectedEntity(char)}
                  className={`w-full text-left p-2 rounded flex items-center gap-2 ${
                    selectedEntity?.id === char.id ? 'bg-amber-500/20' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <User className={`w-4 h-4 ${hasPersonality(char.id) ? 'text-green-400' : 'text-gray-500'}`} />
                  <span className="text-sm truncate">{char.name}</span>
                </button>
              ))}
            </>
          ) : (
            <>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Factions (Hierarchy)</h3>
              {topLevelFactions.map(faction => (
                <FactionItem key={faction.id} faction={faction} />
              ))}
              {factions.filter(f => f.parentFactionId && !factions.find(p => p.id === f.parentFactionId)).map(orphan => (
                <FactionItem key={orphan.id} faction={orphan} />
              ))}
            </>
          )}
        </div>

        {/* Personality Editor */}
        {personality ? (
          <div className="flex-1 overflow-auto space-y-6 pr-2">
            {/* Individual traits (characters) */}
            {!isGroup && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Big Five Personality Traits</h3>
                <div className="space-y-4">
                  {BIG_FIVE.map(trait => (
                    <div key={trait.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{trait.label}</span>
                        <span className="text-xs text-gray-400">{personality[trait.id]}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-24">{trait.low}</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={personality[trait.id] || 50}
                          onChange={e => updateTrait(trait.id, Number(e.target.value))}
                          className="flex-1 accent-amber-500"
                        />
                        <span className="text-xs text-gray-500 w-24 text-right">{trait.high}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Group culture traits (factions) */}
            {isGroup && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Group Culture Traits</h3>
                <div className="space-y-4">
                  {GROUP_TRAITS.map(trait => (
                    <div key={trait.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{trait.label}</span>
                        <span className="text-xs text-gray-400">{personality[trait.id] || 50}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-28">{trait.low}</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={personality[trait.id] || 50}
                          onChange={e => updateTrait(trait.id, Number(e.target.value))}
                          className="flex-1 accent-yellow-500"
                        />
                        <span className="text-xs text-gray-500 w-28 text-right">{trait.high}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Core Values */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">
                {isGroup ? 'Cultural Values' : 'Core Values'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {VALUES.map(value => (
                  <div key={value.id} className="p-2 bg-gray-800 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{value.label}</span>
                      <span className="text-xs text-gray-500">{personality.values?.[value.id] || 0}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={personality.values?.[value.id] || 0}
                      onChange={e => updateValue(value.id, Number(e.target.value))}
                      className="w-full accent-blue-500 h-1"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivations */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">
                {isGroup ? 'Group Goals' : 'Primary Motivations'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {(isGroup ? GROUP_MOTIVATIONS : MOTIVATIONS).map(mot => (
                  <button
                    key={mot}
                    onClick={() => toggleMotivation(mot)}
                    className={`px-2 py-1 rounded text-xs ${
                      personality.motivations?.includes(mot)
                        ? isGroup ? 'bg-yellow-500 text-gray-900' : 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {mot}
                  </button>
                ))}
              </div>
            </div>

            {/* Group-specific text fields */}
            {isGroup && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Customs & Traditions</h3>
                  <textarea
                    value={personality.customs || ''}
                    onChange={e => { setPersonality({ ...personality, customs: e.target.value }); setDirty(true); }}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm resize-none"
                    rows={3}
                    placeholder="Marriage rituals, coming-of-age ceremonies, holidays, funeral rites..."
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Taboos & Forbidden Practices</h3>
                  <textarea
                    value={personality.taboos || ''}
                    onChange={e => { setPersonality({ ...personality, taboos: e.target.value }); setDirty(true); }}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm resize-none"
                    rows={2}
                    placeholder="Forbidden foods, actions, words, social violations..."
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Greetings & Social Norms</h3>
                  <textarea
                    value={personality.greetings || ''}
                    onChange={e => { setPersonality({ ...personality, greetings: e.target.value }); setDirty(true); }}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm resize-none"
                    rows={2}
                    placeholder="How do they greet? Bow, handshake, honorifics? Hospitality rules?"
                  />
                </div>
              </div>
            )}

            {/* Generated Summary */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h4 className="text-sm font-medium text-amber-400 mb-2">
                {isGroup ? 'Culture Summary' : 'Personality Summary'}
              </h4>
              <p className="text-sm text-gray-300">
                {isGroup ? (
                  <>
                    <strong>{selectedEntity?.name}</strong> is 
                    {personality.militarism > 60 ? ' a warlike culture' : personality.militarism < 40 ? ' a peaceful people' : ' balanced between war and peace'}, 
                    {personality.tradition > 60 ? ' deeply traditional' : personality.tradition < 40 ? ' progressive and adaptive' : ' moderately traditional'}, 
                    {personality.hierarchy > 60 ? ' with rigid social hierarchy' : personality.hierarchy < 40 ? ' fairly egalitarian' : ' with moderate social structure'}.
                    {personality.collectivism > 60 ? ' They prioritize the group over individuals.' : personality.collectivism < 40 ? ' Individual achievement is valued.' : ''}
                    {personality.religiosity > 60 ? ' Religion plays a central role.' : personality.religiosity < 40 ? ' They are secular or skeptical.' : ''}
                    {personality.honor > 60 ? ' Honor codes define their behavior.' : ''}
                    {personality.motivations?.length > 0 && ` Primary goals: ${personality.motivations.join(', ').toLowerCase()}.`}
                  </>
                ) : (
                  <>
                    <strong>{selectedEntity?.name}</strong> is 
                    {personality.extraversion > 60 ? ' outgoing and energetic' : personality.extraversion < 40 ? ' reserved and introspective' : ' balanced in social energy'}, 
                    {personality.agreeableness > 60 ? ' cooperative and trusting' : personality.agreeableness < 40 ? ' competitive and skeptical' : ' pragmatic in relationships'}, 
                    {personality.conscientiousness > 60 ? ' organized and disciplined' : personality.conscientiousness < 40 ? ' spontaneous and flexible' : ' moderately structured'}.
                    {personality.neuroticism > 60 ? ' They tend toward anxiety and sensitivity.' : personality.neuroticism < 40 ? ' They remain calm under pressure.' : ''}
                    {personality.openness > 60 ? ' Highly creative and curious.' : personality.openness < 40 ? ' Prefers the familiar and practical.' : ''}
                    {personality.motivations?.length > 0 && ` Driven by ${personality.motivations.join(', ').toLowerCase()}.`}
                  </>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select {viewType === 'characters' ? 'a character' : 'a faction'} to define their {viewType === 'characters' ? 'personality' : 'culture'}
          </div>
        )}
      </div>
    </div>
  );
}
