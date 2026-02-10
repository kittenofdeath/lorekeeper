import { useState, useEffect } from 'react';
import { getPersonality, savePersonality, getAllPersonalities } from '../db';
import { Brain, Save, User } from 'lucide-react';

// Big Five personality traits
const BIG_FIVE = [
  { id: 'openness', label: 'Openness', low: 'Practical, conventional', high: 'Curious, creative' },
  { id: 'conscientiousness', label: 'Conscientiousness', low: 'Spontaneous, flexible', high: 'Organized, disciplined' },
  { id: 'extraversion', label: 'Extraversion', low: 'Reserved, solitary', high: 'Outgoing, energetic' },
  { id: 'agreeableness', label: 'Agreeableness', low: 'Competitive, skeptical', high: 'Cooperative, trusting' },
  { id: 'neuroticism', label: 'Neuroticism', low: 'Calm, secure', high: 'Anxious, sensitive' },
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

export default function PersonalityEditor({ entities, onSelectEntity }) {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [personality, setPersonality] = useState(null);
  const [allPersonalities, setAllPersonalities] = useState([]);
  const [dirty, setDirty] = useState(false);

  const characters = entities.filter(e => e.type === 'character');

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
        values: {},
        motivations: []
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

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Brain className="w-5 h-5 text-amber-400" />
          Personality System
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

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Character List */}
        <div className="w-56 overflow-auto space-y-1">
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
        </div>

        {/* Personality Editor */}
        {personality ? (
          <div className="flex-1 overflow-auto space-y-6 pr-2">
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

            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Core Values</h3>
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

            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Primary Motivations</h3>
              <div className="flex flex-wrap gap-2">
                {MOTIVATIONS.map(mot => (
                  <button
                    key={mot}
                    onClick={() => toggleMotivation(mot)}
                    className={`px-2 py-1 rounded text-xs ${
                      personality.motivations?.includes(mot)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {mot}
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Summary */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h4 className="text-sm font-medium text-amber-400 mb-2">Personality Summary</h4>
              <p className="text-sm text-gray-300">
                {selectedEntity?.name} is 
                {personality.extraversion > 60 ? ' outgoing and energetic' : personality.extraversion < 40 ? ' reserved and introspective' : ' balanced in social energy'}, 
                {personality.agreeableness > 60 ? ' cooperative and trusting' : personality.agreeableness < 40 ? ' competitive and skeptical' : ' pragmatic in relationships'}, 
                {personality.conscientiousness > 60 ? ' organized and disciplined' : personality.conscientiousness < 40 ? ' spontaneous and flexible' : ' moderately structured'}.
                {personality.neuroticism > 60 ? ' They tend toward anxiety and sensitivity.' : personality.neuroticism < 40 ? ' They remain calm under pressure.' : ''}
                {personality.openness > 60 ? ' Highly creative and curious.' : personality.openness < 40 ? ' Prefers the familiar and practical.' : ''}
                {personality.motivations?.length > 0 && ` Driven by ${personality.motivations.join(', ').toLowerCase()}.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a character to define their personality
          </div>
        )}
      </div>
    </div>
  );
}
