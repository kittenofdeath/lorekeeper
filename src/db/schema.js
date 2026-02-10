import Dexie from 'dexie';

export const db = new Dexie('lorekeeper');

db.version(5).stores({
  // Multi-project support
  projects: '++id, name, isActive, createdAt',
  entities: '++id, projectId, type, name, birthDate, deathDate, isSpoiler',
  relationships: '++id, projectId, sourceId, targetId, type, startDate, endDate',
  events: '++id, projectId, title, startDate, endDate, locationId, isSpoiler',
  eventParticipants: '++id, eventId, entityId, role',
  eventCausality: '++id, causeEventId, effectEventId, plotlineId',
  plotlines: '++id, projectId, name, color, description',
  arcDimensions: '++id, projectId, name, color, icon, description',
  arcPointTags: '++id, arcPointId, tag',
  media: '++id, entityId, eventId, type, filename',
  project: '++id, name, spoilerMode, activeProjectId',
  locationPositions: '++id, locationId, x, y',
  arcPoints: '++id, entityId, eventId, year, value, dimension',
  calendars: '++id, projectId, name, monthNames, daysPerMonth, yearOffset, eraName',
  chapters: '++id, title, order, povCharacterId, wordCount, status',
  scenes: '++id, chapterId, title, order, locationId, timeYear, content, wordCount',
  sceneCharacters: '++id, sceneId, entityId, role',
  knowledge: '++id, entityId, factId, learnedAt, learnedInScene, isTrue, notes',
  facts: '++id, description, isTrue, revealedInScene, category',
  setups: '++id, description, plantedInScene, payoffInScene, status, category',
  rules: '++id, system, rule, exceptions, category',
  truthLayers: '++id, factId, layer, description',
  namingRules: '++id, culture, pattern, examples, notes',
  loreVersions: '++id, entityId, field, oldValue, newValue, changedAt, note',
  travelDistances: '++id, fromLocationId, toLocationId, distance, unit, travelTime, method',
  themes: '++id, name, description, color',
  themeOccurrences: '++id, themeId, entityId, eventId, sceneId, notes',
  writingGoals: '++id, type, target, current, startDate, endDate, status',
  writingSessions: '++id, date, wordCount, duration, notes',
  dialogues: '++id, sceneId, participants, summary, importance, tags',
  creatures: '++id, name, type, habitat, description, abilities, isSpoiler',
  languages: '++id, name, description, phonology, grammar',
  vocabulary: '++id, languageId, word, meaning, pronunciation, partOfSpeech, etymology',
  plotBeats: '++id, storyId, beatType, title, description, order, sceneId, status',
  frames: '++id, projectId, name, description, timelineStart, timelineEnd, parentFrameId, order',
  poems: '++id, projectId, title, content, type, performedBy, composedBy, sceneId',
  currencies: '++id, projectId, name, symbol, baseValue, description',
  sceneDrafts: '++id, sceneId, content, savedAt, note',
  arcClosures: '++id, entityId, description, unresolvedPlots, lastWords',
  dialogueNodes: '++id, projectId, characterId, text, isPlayerChoice, isRoot, parentId, order',
  dialogueChoices: '++id, nodeId, text, nextNodeId, condition',
  personalities: '++id, entityId, openness, conscientiousness, extraversion, agreeableness, neuroticism, values, motivations',
  arcTypes: '++id, projectId, name, pattern, description',
  // v5: Quest system
  quests: '++id, projectId, name, type, status, questGiverId, locationId, factionId, level, isRepeatable, isSpoiler',
  questObjectives: '++id, questId, type, description, targetId, targetCount, order, isOptional',
  questRewards: '++id, questId, type, itemId, amount, factionId, reputationChange',
  questPrerequisites: '++id, questId, prereqType, prereqQuestId, prereqFactionId, prereqLevel, prereqItemId',
  questStages: '++id, questId, stageNumber, description, dialogueNodeId, locationId',
  questBranches: '++id, fromQuestId, toQuestId, condition, description'
});

export default db;
