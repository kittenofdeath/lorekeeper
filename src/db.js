import Dexie from 'dexie';

export const db = new Dexie('lorekeeper');

db.version(3).stores({
  // Multi-project support
  projects: '++id, name, isActive, createdAt',
  entities: '++id, projectId, type, name, birthDate, deathDate, isSpoiler',
  relationships: '++id, projectId, sourceId, targetId, type, startDate, endDate',
  events: '++id, projectId, title, startDate, endDate, locationId, isSpoiler',
  eventParticipants: '++id, eventId, entityId, role',
  eventCausality: '++id, causeEventId, effectEventId',
  media: '++id, entityId, eventId, type, filename',
  project: '++id, name, spoilerMode, activeProjectId',
  locationPositions: '++id, locationId, x, y',
  arcPoints: '++id, entityId, eventId, year, value, dimension',
  // Custom calendar system
  calendars: '++id, projectId, name, monthNames, daysPerMonth, yearOffset, eraName',
  // Writing system
  chapters: '++id, title, order, povCharacterId, wordCount, status',
  scenes: '++id, chapterId, title, order, locationId, timeYear, content, wordCount',
  sceneCharacters: '++id, sceneId, entityId, role',
  // Knowledge tracking
  knowledge: '++id, entityId, factId, learnedAt, learnedInScene, isTrue, notes',
  facts: '++id, description, isTrue, revealedInScene, category',
  // Foreshadowing
  setups: '++id, description, plantedInScene, payoffInScene, status, category',
  // Magic system
  rules: '++id, system, rule, exceptions, category',
  // Mystery layers
  truthLayers: '++id, factId, layer, description',
  // Naming
  namingRules: '++id, culture, pattern, examples, notes',
  // Version history
  loreVersions: '++id, entityId, field, oldValue, newValue, changedAt, note',
  // v2: Travel distances between locations
  travelDistances: '++id, fromLocationId, toLocationId, distance, unit, travelTime, method',
  // v2: Themes
  themes: '++id, name, description, color',
  themeOccurrences: '++id, themeId, entityId, eventId, sceneId, notes',
  // v2: Writing goals
  writingGoals: '++id, type, target, current, startDate, endDate, status',
  writingSessions: '++id, date, wordCount, duration, notes',
  // v2: Dialogue log
  dialogues: '++id, sceneId, participants, summary, importance, tags',
  // v2: Bestiary / Flora
  creatures: '++id, name, type, habitat, description, abilities, isSpoiler',
  // v2: Conlang
  languages: '++id, name, description, phonology, grammar',
  vocabulary: '++id, languageId, word, meaning, pronunciation, partOfSpeech, etymology',
  // v2: Plot structure
  plotBeats: '++id, storyId, beatType, title, description, order, sceneId, status',
  // v3: Frame narratives (nested timelines)
  frames: '++id, projectId, name, description, timelineStart, timelineEnd, parentFrameId, order',
  // v3: Poetry and songs
  poems: '++id, projectId, title, content, type, performedBy, composedBy, sceneId',
  // v3: Currency systems
  currencies: '++id, projectId, name, symbol, baseValue, description',
  // v3: Scene drafts (version control)
  sceneDrafts: '++id, sceneId, content, savedAt, note',
  // v3: Character arc closures (what dies with them)
  arcClosures: '++id, entityId, description, unresolvedPlots, lastWords',
  // v4: Dialogue trees for games
  dialogueNodes: '++id, projectId, characterId, text, isPlayerChoice, isRoot, parentId, order',
  dialogueChoices: '++id, nodeId, text, nextNodeId, condition',
  // v4: Personality system (Big Five + values)
  personalities: '++id, entityId, openness, conscientiousness, extraversion, agreeableness, neuroticism, values, motivations',
  // v4: Arc archetypes for comparison
  arcTypes: '++id, projectId, name, pattern, description'
});

// Media helpers
export async function addMedia(media) {
  return db.media.add({
    ...media,
    createdAt: Date.now()
  });
}

export async function getMediaForEntity(entityId) {
  return db.media.where('entityId').equals(entityId).toArray();
}

export async function getMediaForEvent(eventId) {
  return db.media.where('eventId').equals(eventId).toArray();
}

export async function deleteMedia(id) {
  return db.media.delete(id);
}

// Location position helpers
export async function getLocationPositions() {
  return db.locationPositions.toArray();
}

export async function setLocationPosition(locationId, x, y) {
  const existing = await db.locationPositions.where('locationId').equals(locationId).first();
  if (existing) {
    return db.locationPositions.update(existing.id, { x, y });
  }
  return db.locationPositions.add({ locationId, x, y });
}

// Event causality helpers
export async function getEventCausality() {
  return db.eventCausality.toArray();
}

export async function addEventCausality(causeEventId, effectEventId, description = '') {
  return db.eventCausality.add({ causeEventId, effectEventId, description });
}

export async function removeEventCausality(id) {
  return db.eventCausality.delete(id);
}

export async function getCausesForEvent(eventId) {
  return db.eventCausality.where('effectEventId').equals(eventId).toArray();
}

export async function getEffectsOfEvent(eventId) {
  return db.eventCausality.where('causeEventId').equals(eventId).toArray();
}

// Arc points helpers (for character arc visualization)
export async function getArcPointsForEntity(entityId) {
  return db.arcPoints.where('entityId').equals(entityId).toArray();
}

export async function addArcPoint(entityId, year, value, dimension = 'power') {
  return db.arcPoints.add({ entityId, year, value, dimension, createdAt: Date.now() });
}

export async function updateArcPoint(id, updates) {
  return db.arcPoints.update(id, updates);
}

export async function deleteArcPoint(id) {
  return db.arcPoints.delete(id);
}

// Project settings for custom map
export async function setCustomMap(imageData) {
  const settings = await getProjectSettings();
  return updateProjectSettings({ ...settings, customMapImage: imageData });
}

// ========== CHAPTERS & SCENES ==========
export async function getAllChapters() {
  return db.chapters.orderBy('order').toArray();
}

export async function getChapter(id) {
  return db.chapters.get(id);
}

export async function createChapter(chapter) {
  const chapters = await getAllChapters();
  return db.chapters.add({
    ...chapter,
    order: chapters.length + 1,
    wordCount: 0,
    status: 'draft',
    createdAt: Date.now()
  });
}

export async function updateChapter(id, updates) {
  return db.chapters.update(id, { ...updates, updatedAt: Date.now() });
}

export async function deleteChapter(id) {
  await db.scenes.where('chapterId').equals(id).delete();
  return db.chapters.delete(id);
}

export async function getScenesForChapter(chapterId) {
  return db.scenes.where('chapterId').equals(chapterId).sortBy('order');
}

export async function getAllScenes() {
  return db.scenes.toArray();
}

export async function getScene(id) {
  return db.scenes.get(id);
}

export async function createScene(scene) {
  const scenes = await getScenesForChapter(scene.chapterId);
  return db.scenes.add({
    ...scene,
    order: scenes.length + 1,
    wordCount: scene.content ? scene.content.split(/\s+/).length : 0,
    createdAt: Date.now()
  });
}

export async function updateScene(id, updates) {
  if (updates.content) {
    updates.wordCount = updates.content.split(/\s+/).filter(w => w).length;
  }
  return db.scenes.update(id, { ...updates, updatedAt: Date.now() });
}

export async function deleteScene(id) {
  await db.sceneCharacters.where('sceneId').equals(id).delete();
  return db.scenes.delete(id);
}

export async function getSceneCharacters(sceneId) {
  return db.sceneCharacters.where('sceneId').equals(sceneId).toArray();
}

export async function addSceneCharacter(sceneId, entityId, role = 'present') {
  return db.sceneCharacters.add({ sceneId, entityId, role });
}

export async function removeSceneCharacter(id) {
  return db.sceneCharacters.delete(id);
}

// ========== KNOWLEDGE TRACKING ==========
export async function getAllFacts() {
  return db.facts.toArray();
}

export async function createFact(fact) {
  return db.facts.add({ ...fact, createdAt: Date.now() });
}

export async function updateFact(id, updates) {
  return db.facts.update(id, updates);
}

export async function deleteFact(id) {
  await db.knowledge.where('factId').equals(id).delete();
  await db.truthLayers.where('factId').equals(id).delete();
  return db.facts.delete(id);
}

export async function getKnowledgeForEntity(entityId) {
  return db.knowledge.where('entityId').equals(entityId).toArray();
}

export async function getKnowledgeForFact(factId) {
  return db.knowledge.where('factId').equals(factId).toArray();
}

export async function addKnowledge(knowledge) {
  return db.knowledge.add({ ...knowledge, createdAt: Date.now() });
}

export async function removeKnowledge(id) {
  return db.knowledge.delete(id);
}

export async function getReaderKnowledgeAtScene(sceneId) {
  // Get all facts revealed up to this scene
  const scene = await getScene(sceneId);
  if (!scene) return [];
  const allScenes = await getAllScenes();
  const priorScenes = allScenes.filter(s => s.order <= scene.order);
  const priorSceneIds = priorScenes.map(s => s.id);
  return db.facts.filter(f => priorSceneIds.includes(f.revealedInScene)).toArray();
}

// ========== FORESHADOWING ==========
export async function getAllSetups() {
  return db.setups.toArray();
}

export async function createSetup(setup) {
  return db.setups.add({ ...setup, status: 'planted', createdAt: Date.now() });
}

export async function updateSetup(id, updates) {
  return db.setups.update(id, updates);
}

export async function deleteSetup(id) {
  return db.setups.delete(id);
}

export async function getUnresolvedSetups() {
  return db.setups.filter(s => s.status !== 'resolved').toArray();
}

// ========== MAGIC/RULES SYSTEM ==========
export async function getAllRules() {
  return db.rules.toArray();
}

export async function getRulesBySystem(system) {
  return db.rules.where('system').equals(system).toArray();
}

export async function createRule(rule) {
  return db.rules.add({ ...rule, createdAt: Date.now() });
}

export async function updateRule(id, updates) {
  return db.rules.update(id, updates);
}

export async function deleteRule(id) {
  return db.rules.delete(id);
}

// ========== TRUTH LAYERS ==========
export async function getTruthLayersForFact(factId) {
  return db.truthLayers.where('factId').equals(factId).toArray();
}

export async function addTruthLayer(layer) {
  return db.truthLayers.add(layer);
}

export async function removeTruthLayer(id) {
  return db.truthLayers.delete(id);
}

// ========== NAMING RULES ==========
export async function getAllNamingRules() {
  return db.namingRules.toArray();
}

export async function getNamingRulesByCulture(culture) {
  return db.namingRules.where('culture').equals(culture).toArray();
}

export async function createNamingRule(rule) {
  return db.namingRules.add({ ...rule, createdAt: Date.now() });
}

export async function updateNamingRule(id, updates) {
  return db.namingRules.update(id, updates);
}

export async function deleteNamingRule(id) {
  return db.namingRules.delete(id);
}

// ========== VERSION HISTORY ==========
export async function logLoreChange(entityId, field, oldValue, newValue, note = '') {
  return db.loreVersions.add({
    entityId,
    field,
    oldValue,
    newValue,
    changedAt: Date.now(),
    note
  });
}

export async function getLoreHistory(entityId) {
  return db.loreVersions.where('entityId').equals(entityId).reverse().sortBy('changedAt');
}

export async function getAllLoreHistory() {
  return db.loreVersions.reverse().sortBy('changedAt');
}

// ========== CONTINUITY CHECKER ==========
export async function checkContinuity() {
  const issues = [];
  const entities = await getAllEntities();
  const scenes = await getAllScenes();
  const events = await getAllEvents();
  
  // Check 1: Dead characters appearing after death
  const characters = entities.filter(e => e.type === 'character' && e.deathDate);
  for (const char of characters) {
    const laterScenes = scenes.filter(s => s.timeYear && s.timeYear > char.deathDate);
    for (const scene of laterScenes) {
      const sceneChars = await getSceneCharacters(scene.id);
      if (sceneChars.some(sc => sc.entityId === char.id)) {
        issues.push({
          type: 'dead_character',
          severity: 'error',
          message: `${char.name} appears in scene "${scene.title}" (Year ${scene.timeYear}) but died in Year ${char.deathDate}`,
          entityId: char.id,
          sceneId: scene.id
        });
      }
    }
  }
  
  // Check 2: Age consistency
  for (const char of entities.filter(e => e.type === 'character' && e.birthDate)) {
    if (char.deathDate && char.deathDate < char.birthDate) {
      issues.push({
        type: 'age_error',
        severity: 'error',
        message: `${char.name} has death date (${char.deathDate}) before birth date (${char.birthDate})`,
        entityId: char.id
      });
    }
  }
  
  // Check 3: Unresolved setups
  const unresolvedSetups = await getUnresolvedSetups();
  for (const setup of unresolvedSetups) {
    issues.push({
      type: 'unresolved_setup',
      severity: 'warning',
      message: `Unresolved foreshadowing: "${setup.description}"`,
      setupId: setup.id
    });
  }
  
  // Check 4: Events without dates
  for (const evt of events) {
    if (!evt.startDate) {
      issues.push({
        type: 'missing_date',
        severity: 'warning',
        message: `Event "${evt.title}" has no date`,
        eventId: evt.id
      });
    }
  }
  
  return issues;
}

// ========== ADVANCED SEARCH ==========
export async function searchLore(query, options = {}) {
  const results = [];
  const q = query.toLowerCase();
  
  // Search entities
  if (!options.type || options.type === 'entities') {
    const entities = await getAllEntities();
    for (const e of entities) {
      if (e.name?.toLowerCase().includes(q) || 
          e.description?.toLowerCase().includes(q) ||
          e.aliases?.some(a => a.toLowerCase().includes(q))) {
        results.push({ type: 'entity', item: e, match: 'name/description' });
      }
    }
  }
  
  // Search events
  if (!options.type || options.type === 'events') {
    const events = await getAllEvents();
    for (const e of events) {
      if (e.title?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q)) {
        results.push({ type: 'event', item: e, match: 'title/description' });
      }
    }
  }
  
  // Search scenes
  if (!options.type || options.type === 'scenes') {
    const scenes = await getAllScenes();
    for (const s of scenes) {
      if (s.title?.toLowerCase().includes(q) || s.content?.toLowerCase().includes(q)) {
        results.push({ type: 'scene', item: s, match: 'title/content' });
      }
    }
  }
  
  // Search facts
  if (!options.type || options.type === 'facts') {
    const facts = await getAllFacts();
    for (const f of facts) {
      if (f.description?.toLowerCase().includes(q)) {
        results.push({ type: 'fact', item: f, match: 'description' });
      }
    }
  }
  
  return results;
}

export async function findScenesWithCharacters(characterIds) {
  const scenes = await getAllScenes();
  const result = [];
  
  for (const scene of scenes) {
    const sceneChars = await getSceneCharacters(scene.id);
    const sceneCharIds = sceneChars.map(sc => sc.entityId);
    if (characterIds.every(id => sceneCharIds.includes(id))) {
      result.push(scene);
    }
  }
  
  return result;
}

// Helper functions
export async function getAllEntities() {
  return db.entities.toArray();
}

export async function getEntitiesByType(type) {
  return db.entities.where('type').equals(type).toArray();
}

export async function getEntity(id) {
  return db.entities.get(id);
}

export async function createEntity(entity) {
  return db.entities.add({
    ...entity,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
}

export async function updateEntity(id, updates) {
  return db.entities.update(id, { ...updates, updatedAt: Date.now() });
}

export async function deleteEntity(id) {
  await db.relationships.where('sourceId').equals(id).delete();
  await db.relationships.where('targetId').equals(id).delete();
  await db.eventParticipants.where('entityId').equals(id).delete();
  return db.entities.delete(id);
}

export async function getAllRelationships() {
  return db.relationships.toArray();
}

export async function getRelationshipsForEntity(entityId) {
  const asSource = await db.relationships.where('sourceId').equals(entityId).toArray();
  const asTarget = await db.relationships.where('targetId').equals(entityId).toArray();
  return [...asSource, ...asTarget];
}

export async function createRelationship(rel) {
  return db.relationships.add(rel);
}

export async function deleteRelationship(id) {
  return db.relationships.delete(id);
}

export async function getAllEvents() {
  return db.events.toArray();
}

export async function getEvent(id) {
  return db.events.get(id);
}

export async function createEvent(event) {
  return db.events.add({
    ...event,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
}

export async function updateEvent(id, updates) {
  return db.events.update(id, { ...updates, updatedAt: Date.now() });
}

export async function deleteEvent(id) {
  await db.eventParticipants.where('eventId').equals(id).delete();
  await db.eventCausality.where('causeEventId').equals(id).delete();
  await db.eventCausality.where('effectEventId').equals(id).delete();
  return db.events.delete(id);
}

export async function getEventParticipants(eventId) {
  return db.eventParticipants.where('eventId').equals(eventId).toArray();
}

export async function addEventParticipant(eventId, entityId, role) {
  return db.eventParticipants.add({ eventId, entityId, role });
}

export async function removeEventParticipant(id) {
  return db.eventParticipants.delete(id);
}

export async function getEventsForEntity(entityId) {
  const participations = await db.eventParticipants.where('entityId').equals(entityId).toArray();
  const eventIds = participations.map(p => p.eventId);
  return db.events.where('id').anyOf(eventIds).toArray();
}

export async function getProjectSettings() {
  const settings = await db.project.toArray();
  return settings[0] || { spoilerMode: true };
}

export async function updateProjectSettings(updates) {
  const settings = await db.project.toArray();
  if (settings.length === 0) {
    return db.project.add({ name: 'My World', spoilerMode: true, ...updates });
  }
  return db.project.update(settings[0].id, updates);
}

export async function clearAllData() {
  await db.entities.clear();
  await db.relationships.clear();
  await db.events.clear();
  await db.eventParticipants.clear();
  await db.eventCausality.clear();
  await db.media.clear();
}

// ========== BACKUP & RESTORE ==========
export async function exportFullBackup() {
  const backup = {
    version: 2,
    exportedAt: new Date().toISOString(),
    data: {}
  };
  
  const tables = [
    'entities', 'relationships', 'events', 'eventParticipants', 'eventCausality',
    'media', 'project', 'locationPositions', 'arcPoints', 'chapters', 'scenes',
    'sceneCharacters', 'knowledge', 'facts', 'setups', 'rules', 'truthLayers',
    'namingRules', 'loreVersions', 'travelDistances', 'themes', 'themeOccurrences',
    'writingGoals', 'writingSessions', 'dialogues', 'creatures', 'languages',
    'vocabulary', 'plotBeats'
  ];
  
  for (const table of tables) {
    try {
      backup.data[table] = await db[table].toArray();
    } catch (e) {
      backup.data[table] = [];
    }
  }
  
  return backup;
}

export async function importFullBackup(backup) {
  // Clear all existing data
  const tables = Object.keys(backup.data);
  for (const table of tables) {
    try {
      await db[table].clear();
    } catch (e) {
      console.warn(`Could not clear ${table}:`, e);
    }
  }
  
  // Import all data
  for (const table of tables) {
    if (backup.data[table]?.length > 0) {
      try {
        await db[table].bulkAdd(backup.data[table]);
      } catch (e) {
        console.warn(`Could not import ${table}:`, e);
      }
    }
  }
}

// ========== TRAVEL DISTANCES ==========
export async function getAllTravelDistances() {
  return db.travelDistances.toArray();
}

export async function getTravelDistance(fromId, toId) {
  return db.travelDistances
    .filter(t => (t.fromLocationId === fromId && t.toLocationId === toId) ||
                 (t.fromLocationId === toId && t.toLocationId === fromId))
    .first();
}

export async function setTravelDistance(fromId, toId, distance, unit = 'days', method = 'horse') {
  const existing = await getTravelDistance(fromId, toId);
  if (existing) {
    return db.travelDistances.update(existing.id, { distance, unit, method });
  }
  return db.travelDistances.add({ fromLocationId: fromId, toLocationId: toId, distance, unit, method });
}

export async function deleteTravelDistance(id) {
  return db.travelDistances.delete(id);
}

// ========== THEMES ==========
export async function getAllThemes() {
  return db.themes.toArray();
}

export async function createTheme(theme) {
  return db.themes.add({ ...theme, createdAt: Date.now() });
}

export async function updateTheme(id, updates) {
  return db.themes.update(id, updates);
}

export async function deleteTheme(id) {
  await db.themeOccurrences.where('themeId').equals(id).delete();
  return db.themes.delete(id);
}

export async function getThemeOccurrences(themeId) {
  return db.themeOccurrences.where('themeId').equals(themeId).toArray();
}

export async function addThemeOccurrence(occurrence) {
  return db.themeOccurrences.add({ ...occurrence, createdAt: Date.now() });
}

export async function removeThemeOccurrence(id) {
  return db.themeOccurrences.delete(id);
}

// ========== WRITING GOALS ==========
export async function getAllWritingGoals() {
  return db.writingGoals.toArray();
}

export async function createWritingGoal(goal) {
  return db.writingGoals.add({ ...goal, current: 0, status: 'active', createdAt: Date.now() });
}

export async function updateWritingGoal(id, updates) {
  return db.writingGoals.update(id, updates);
}

export async function deleteWritingGoal(id) {
  return db.writingGoals.delete(id);
}

export async function getWritingSessions(startDate, endDate) {
  return db.writingSessions.filter(s => s.date >= startDate && s.date <= endDate).toArray();
}

export async function logWritingSession(session) {
  return db.writingSessions.add({ ...session, createdAt: Date.now() });
}

export async function getTotalWordCount() {
  const scenes = await getAllScenes();
  return scenes.reduce((sum, s) => sum + (s.wordCount || 0), 0);
}

// ========== DIALOGUES ==========
export async function getAllDialogues() {
  return db.dialogues.toArray();
}

export async function getDialoguesForScene(sceneId) {
  return db.dialogues.where('sceneId').equals(sceneId).toArray();
}

export async function createDialogue(dialogue) {
  return db.dialogues.add({ ...dialogue, createdAt: Date.now() });
}

export async function updateDialogue(id, updates) {
  return db.dialogues.update(id, updates);
}

export async function deleteDialogue(id) {
  return db.dialogues.delete(id);
}

// ========== CREATURES / BESTIARY ==========
export async function getAllCreatures() {
  return db.creatures.toArray();
}

export async function getCreature(id) {
  return db.creatures.get(id);
}

export async function createCreature(creature) {
  return db.creatures.add({ ...creature, createdAt: Date.now() });
}

export async function updateCreature(id, updates) {
  return db.creatures.update(id, updates);
}

export async function deleteCreature(id) {
  return db.creatures.delete(id);
}

// ========== LANGUAGES / CONLANG ==========
export async function getAllLanguages() {
  return db.languages.toArray();
}

export async function getLanguage(id) {
  return db.languages.get(id);
}

export async function createLanguage(language) {
  return db.languages.add({ ...language, createdAt: Date.now() });
}

export async function updateLanguage(id, updates) {
  return db.languages.update(id, updates);
}

export async function deleteLanguage(id) {
  await db.vocabulary.where('languageId').equals(id).delete();
  return db.languages.delete(id);
}

export async function getVocabulary(languageId) {
  return db.vocabulary.where('languageId').equals(languageId).toArray();
}

export async function addWord(word) {
  return db.vocabulary.add({ ...word, createdAt: Date.now() });
}

export async function updateWord(id, updates) {
  return db.vocabulary.update(id, updates);
}

export async function deleteWord(id) {
  return db.vocabulary.delete(id);
}

// ========== PLOT STRUCTURE ==========
export async function getAllPlotBeats() {
  return db.plotBeats.orderBy('order').toArray();
}

export async function createPlotBeat(beat) {
  const beats = await getAllPlotBeats();
  return db.plotBeats.add({ ...beat, order: beats.length + 1, status: 'planned', createdAt: Date.now() });
}

export async function updatePlotBeat(id, updates) {
  return db.plotBeats.update(id, updates);
}

export async function deletePlotBeat(id) {
  return db.plotBeats.delete(id);
}

export async function reorderPlotBeats(orderedIds) {
  for (let i = 0; i < orderedIds.length; i++) {
    await db.plotBeats.update(orderedIds[i], { order: i + 1 });
  }
}

// ========== TRAVEL TIME VALIDATION ==========
export async function validateTravelTime(fromLocationId, toLocationId, daysAllowed) {
  const distance = await getTravelDistance(fromLocationId, toLocationId);
  if (!distance) return { valid: true, message: 'No distance data' };
  
  if (distance.distance > daysAllowed) {
    return {
      valid: false,
      message: `Travel takes ${distance.distance} ${distance.unit} by ${distance.method}, but only ${daysAllowed} days allowed`,
      required: distance.distance,
      allowed: daysAllowed
    };
  }
  return { valid: true, message: 'Travel time is valid' };
}

// ========== MULTI-PROJECT SUPPORT ==========
export async function getAllProjects() {
  return db.projects.toArray();
}

export async function getActiveProject() {
  const settings = await getProjectSettings();
  if (settings.activeProjectId) {
    return db.projects.get(settings.activeProjectId);
  }
  // Return first project or create default
  const projects = await getAllProjects();
  if (projects.length === 0) {
    const id = await createProject({ name: 'My World' });
    await updateProjectSettings({ activeProjectId: id });
    return db.projects.get(id);
  }
  await updateProjectSettings({ activeProjectId: projects[0].id });
  return projects[0];
}

export async function createProject(project) {
  return db.projects.add({ ...project, createdAt: Date.now() });
}

export async function updateProject(id, updates) {
  return db.projects.update(id, updates);
}

export async function deleteProject(id) {
  // Delete all project data
  await db.entities.where('projectId').equals(id).delete();
  await db.relationships.where('projectId').equals(id).delete();
  await db.events.where('projectId').equals(id).delete();
  await db.calendars.where('projectId').equals(id).delete();
  return db.projects.delete(id);
}

export async function switchProject(projectId) {
  await updateProjectSettings({ activeProjectId: projectId });
  return getActiveProject();
}

// ========== CUSTOM CALENDARS ==========
export async function getCalendar(projectId) {
  return db.calendars.where('projectId').equals(projectId).first();
}

export async function createCalendar(calendar) {
  return db.calendars.add({ ...calendar, createdAt: Date.now() });
}

export async function updateCalendar(id, updates) {
  return db.calendars.update(id, updates);
}

// ========== AGE CALCULATOR ==========
export function calculateAge(birthYear, targetYear, deathYear = null) {
  if (!birthYear || !targetYear) return null;
  const effectiveYear = deathYear && targetYear > deathYear ? deathYear : targetYear;
  return effectiveYear - birthYear;
}

export async function getCharacterAgeAtEvent(entityId, eventId) {
  const entity = await getEntity(entityId);
  const event = await getEvent(eventId);
  if (!entity?.birthDate || !event?.startDate) return null;
  return calculateAge(entity.birthDate, event.startDate, entity.deathDate);
}

// ========== WORD FREQUENCY ANALYSIS ==========
export async function analyzeWordFrequency(minLength = 4, limit = 50) {
  const scenes = await getAllScenes();
  const allText = scenes.map(s => s.content || '').join(' ').toLowerCase();
  const words = allText.match(/\b[a-z]+\b/g) || [];
  
  const freq = {};
  const stopWords = new Set(['that', 'this', 'with', 'from', 'have', 'were', 'been', 'their', 'would', 'could', 'should', 'there', 'where', 'which', 'about', 'into', 'them', 'then', 'than', 'your', 'what', 'when', 'will', 'more', 'some', 'only', 'over', 'such', 'just', 'also', 'back', 'after', 'before']);
  
  for (const word of words) {
    if (word.length >= minLength && !stopWords.has(word)) {
      freq[word] = (freq[word] || 0) + 1;
    }
  }
  
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

// ========== MANUSCRIPT COMPILE ==========
export async function compileManuscript() {
  const chapters = await getAllChapters();
  let manuscript = '';
  
  for (const chapter of chapters) {
    manuscript += `# ${chapter.title}\n\n`;
    const scenes = await getScenesForChapter(chapter.id);
    for (const scene of scenes) {
      if (scene.title) {
        manuscript += `## ${scene.title}\n\n`;
      }
      if (scene.content) {
        manuscript += scene.content + '\n\n';
      }
    }
    manuscript += '\n---\n\n';
  }
  
  return manuscript;
}

// ========== FAMILY TREE DATA ==========
export async function getFamilyTreeData() {
  const entities = await getAllEntities();
  const relationships = await getAllRelationships();
  
  const characters = entities.filter(e => e.type === 'character');
  // Handle both type: 'family' with subtype AND direct type: 'parent' etc.
  const familyRels = relationships.filter(r => 
    r.type === 'family' || ['parent', 'child', 'spouse', 'sibling'].includes(r.type)
  ).map(r => ({
    ...r,
    // Normalize: if type is 'family', use subtype as the effective type
    effectiveType: r.type === 'family' ? r.subtype : r.type
  }));
  
  return { characters, relationships: familyRels };
}

// ========== FRAME NARRATIVES ==========
export async function getAllFrames(projectId) {
  return db.frames.where('projectId').equals(projectId).sortBy('order');
}

export async function createFrame(frame) {
  const frames = await getAllFrames(frame.projectId);
  return db.frames.add({ ...frame, order: frames.length + 1, createdAt: Date.now() });
}

export async function updateFrame(id, updates) {
  return db.frames.update(id, updates);
}

export async function deleteFrame(id) {
  return db.frames.delete(id);
}

// ========== POETRY & SONGS ==========
export async function getAllPoems(projectId) {
  return db.poems.where('projectId').equals(projectId).toArray();
}

export async function createPoem(poem) {
  return db.poems.add({ ...poem, createdAt: Date.now() });
}

export async function updatePoem(id, updates) {
  return db.poems.update(id, updates);
}

export async function deletePoem(id) {
  return db.poems.delete(id);
}

// ========== CURRENCY SYSTEMS ==========
export async function getAllCurrencies(projectId) {
  return db.currencies.where('projectId').equals(projectId).toArray();
}

export async function createCurrency(currency) {
  return db.currencies.add({ ...currency, createdAt: Date.now() });
}

export async function updateCurrency(id, updates) {
  return db.currencies.update(id, updates);
}

export async function deleteCurrency(id) {
  return db.currencies.delete(id);
}

// ========== SCENE DRAFTS (VERSION CONTROL) ==========
export async function getSceneDrafts(sceneId) {
  return db.sceneDrafts.where('sceneId').equals(sceneId).reverse().sortBy('savedAt');
}

export async function saveSceneDraft(sceneId, content, note = '') {
  return db.sceneDrafts.add({ sceneId, content, savedAt: Date.now(), note });
}

export async function deleteSceneDraft(id) {
  return db.sceneDrafts.delete(id);
}

// ========== ARC CLOSURES ==========
export async function getArcClosure(entityId) {
  return db.arcClosures.where('entityId').equals(entityId).first();
}

export async function saveArcClosure(entityId, data) {
  const existing = await getArcClosure(entityId);
  if (existing) {
    return db.arcClosures.update(existing.id, data);
  }
  return db.arcClosures.add({ entityId, ...data, createdAt: Date.now() });
}

// ========== PACING ANALYSIS ==========
export async function analyzePacing() {
  const chapters = await getAllChapters();
  const results = [];
  
  for (const chapter of chapters) {
    const scenes = await getScenesForChapter(chapter.id);
    const sceneCount = scenes.length;
    const totalWords = scenes.reduce((sum, s) => sum + (s.wordCount || 0), 0);
    const avgSceneWords = sceneCount > 0 ? Math.round(totalWords / sceneCount) : 0;
    
    results.push({
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      chapterOrder: chapter.order,
      sceneCount,
      totalWords,
      avgSceneWords,
      povCharacterId: chapter.povCharacterId
    });
  }
  
  // Calculate averages
  const avgChapterWords = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.totalWords, 0) / results.length)
    : 0;
  const avgSceneCount = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.sceneCount, 0) / results.length)
    : 0;
    
  return { chapters: results, avgChapterWords, avgSceneCount };
}

// ========== READING ORDER VS CHRONOLOGICAL ==========
export async function getChronologicalOrder() {
  const scenes = await getAllScenes();
  return scenes
    .filter(s => s.timeYear)
    .sort((a, b) => {
      if (a.timeYear !== b.timeYear) return a.timeYear - b.timeYear;
      return (a.order || 0) - (b.order || 0);
    });
}

export async function getReadingOrder() {
  const chapters = await getAllChapters();
  const result = [];
  
  for (const chapter of chapters) {
    const scenes = await getScenesForChapter(chapter.id);
    for (const scene of scenes) {
      result.push({ ...scene, chapterTitle: chapter.title, chapterOrder: chapter.order });
    }
  }
  
  return result;
}

// ========== DIALOGUE TREES ==========
export async function getDialogueNodes(projectId) {
  return db.dialogueNodes.where('projectId').equals(projectId).toArray();
}

export async function getDialogueNode(id) {
  return db.dialogueNodes.get(id);
}

export async function createDialogueNode(node) {
  return db.dialogueNodes.add({ ...node, createdAt: Date.now() });
}

export async function updateDialogueNode(id, updates) {
  return db.dialogueNodes.update(id, updates);
}

export async function deleteDialogueNode(id) {
  await db.dialogueChoices.where('nodeId').equals(id).delete();
  await db.dialogueChoices.where('nextNodeId').equals(id).delete();
  return db.dialogueNodes.delete(id);
}

export async function getDialogueChoices(nodeId) {
  return db.dialogueChoices.where('nodeId').equals(nodeId).toArray();
}

export async function createDialogueChoice(choice) {
  return db.dialogueChoices.add(choice);
}

export async function updateDialogueChoice(id, updates) {
  return db.dialogueChoices.update(id, updates);
}

export async function deleteDialogueChoice(id) {
  return db.dialogueChoices.delete(id);
}

// ========== PERSONALITY SYSTEM ==========
export async function getPersonality(entityId) {
  return db.personalities.where('entityId').equals(entityId).first();
}

export async function savePersonality(entityId, data) {
  const existing = await getPersonality(entityId);
  if (existing) {
    return db.personalities.update(existing.id, data);
  }
  return db.personalities.add({ entityId, ...data, createdAt: Date.now() });
}

export async function getAllPersonalities() {
  return db.personalities.toArray();
}

// ========== ARC TYPES ==========
export async function getAllArcTypes(projectId) {
  return db.arcTypes.where('projectId').equals(projectId).toArray();
}

export async function createArcType(arcType) {
  return db.arcTypes.add({ ...arcType, createdAt: Date.now() });
}

export async function deleteArcType(id) {
  return db.arcTypes.delete(id);
}

export { db as database };
