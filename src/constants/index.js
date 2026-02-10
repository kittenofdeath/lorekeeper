// Entity types
export const ENTITY_TYPES = {
  CHARACTER: 'character',
  FACTION: 'faction',
  LOCATION: 'location',
  ITEM: 'item',
  CONCEPT: 'concept',
};

// Relationship types
export const RELATIONSHIP_TYPES = [
  { value: 'family', label: 'Family' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'ally', label: 'Ally' },
  { value: 'enemy', label: 'Enemy' },
  { value: 'member', label: 'Member' },
  { value: 'controls', label: 'Controls' },
];

// Faction types
export const FACTION_TYPES = [
  { value: 'organization', label: 'Organization' },
  { value: 'house', label: 'Noble House / Family' },
  { value: 'kingdom', label: 'Kingdom / Nation' },
  { value: 'region', label: 'Region / Territory' },
  { value: 'race', label: 'Race / Species' },
  { value: 'religion', label: 'Religion / Faith' },
  { value: 'guild', label: 'Guild / Order' },
  { value: 'tribe', label: 'Tribe / Clan' },
  { value: 'other', label: 'Other' },
];

// Event participant roles
export const PARTICIPANT_ROLES = [
  { value: 'present', label: 'Present' },
  { value: 'affected', label: 'Affected' },
  { value: 'orchestrated', label: 'Orchestrated' },
  { value: 'mentioned', label: 'Mentioned' },
];

// Chapter statuses
export const CHAPTER_STATUSES = [
  { value: 'outline', label: 'Outline' },
  { value: 'draft', label: 'Draft' },
  { value: 'revision', label: 'Revision' },
  { value: 'final', label: 'Final' },
];

// Plot beat types (Save the Cat)
export const PLOT_BEAT_TYPES = [
  { value: 'opening', label: 'Opening Image' },
  { value: 'setup', label: 'Setup' },
  { value: 'theme', label: 'Theme Stated' },
  { value: 'catalyst', label: 'Catalyst' },
  { value: 'debate', label: 'Debate' },
  { value: 'break-into-2', label: 'Break into Two' },
  { value: 'b-story', label: 'B Story' },
  { value: 'fun-games', label: 'Fun and Games' },
  { value: 'midpoint', label: 'Midpoint' },
  { value: 'bad-guys', label: 'Bad Guys Close In' },
  { value: 'all-is-lost', label: 'All Is Lost' },
  { value: 'dark-night', label: 'Dark Night of Soul' },
  { value: 'break-into-3', label: 'Break into Three' },
  { value: 'finale', label: 'Finale' },
  { value: 'final-image', label: 'Final Image' },
];

// Colors
export const ENTITY_COLORS = {
  character: '#3b82f6',
  faction: '#eab308',
  location: '#22c55e',
  item: '#a855f7',
  concept: '#f97316',
};

export const THEME_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
];

// Big Five personality traits
export const BIG_FIVE_TRAITS = [
  { id: 'openness', label: 'Openness', low: 'Practical, conventional', high: 'Curious, creative' },
  { id: 'conscientiousness', label: 'Conscientiousness', low: 'Spontaneous, flexible', high: 'Organized, disciplined' },
  { id: 'extraversion', label: 'Extraversion', low: 'Reserved, solitary', high: 'Outgoing, energetic' },
  { id: 'agreeableness', label: 'Agreeableness', low: 'Competitive, skeptical', high: 'Cooperative, trusting' },
  { id: 'neuroticism', label: 'Neuroticism', low: 'Calm, secure', high: 'Anxious, sensitive' },
];

// Group culture traits
export const GROUP_TRAITS = [
  { id: 'militarism', label: 'Militarism', low: 'Pacifist, diplomatic', high: 'Warlike, aggressive' },
  { id: 'tradition', label: 'Traditionalism', low: 'Progressive, adaptive', high: 'Conservative, ritualistic' },
  { id: 'openness', label: 'Openness to Outsiders', low: 'Xenophobic, insular', high: 'Welcoming, cosmopolitan' },
  { id: 'hierarchy', label: 'Hierarchy', low: 'Egalitarian, flat', high: 'Stratified, rigid caste' },
  { id: 'collectivism', label: 'Collectivism', low: 'Individualistic', high: 'Community-focused' },
  { id: 'religiosity', label: 'Religiosity', low: 'Secular, skeptical', high: 'Devout, theocratic' },
  { id: 'honor', label: 'Honor Culture', low: 'Pragmatic, flexible', high: 'Honor-bound, rigid codes' },
];

// Default arc dimensions
export const DEFAULT_ARC_DIMENSIONS = [
  { id: 'power', name: 'Power/Influence', color: '#eab308', icon: 'Crown', isDefault: true },
  { id: 'morality', name: 'Morality', color: '#22c55e', icon: 'Heart', isDefault: true },
  { id: 'danger', name: 'Danger Level', color: '#ef4444', icon: 'Swords', isDefault: true },
];

// Motivations
export const CHARACTER_MOTIVATIONS = [
  'Revenge', 'Love', 'Duty', 'Glory', 'Survival', 'Justice', 'Freedom', 'Knowledge', 'Wealth', 'Family', 'Faith', 'Legacy'
];

export const GROUP_MOTIVATIONS = [
  'Expansion', 'Defense', 'Domination', 'Prosperity', 'Honor', 'Survival', 'Unity', 'Revenge', 'Justice', 'Tradition', 'Faith', 'Independence'
];

// Values (Schwartz model)
export const VALUES = [
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
