import db from './schema';
import { getAllEntities } from './entities';
import { getAllEvents } from './events';
import { getAllScenes, getScenesForChapter, getAllChapters, getSceneCharacters } from './writing';
import { getAllFacts, getUnresolvedSetups } from './knowledge';

// ========== ADVANCED SEARCH ==========
export async function searchLore(query, options = {}) {
  const results = [];
  const q = query.toLowerCase();
  
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
  
  if (!options.type || options.type === 'events') {
    const events = await getAllEvents();
    for (const e of events) {
      if (e.title?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q)) {
        results.push({ type: 'event', item: e, match: 'title/description' });
      }
    }
  }
  
  if (!options.type || options.type === 'scenes') {
    const scenes = await getAllScenes();
    for (const s of scenes) {
      if (s.title?.toLowerCase().includes(q) || s.content?.toLowerCase().includes(q)) {
        results.push({ type: 'scene', item: s, match: 'title/content' });
      }
    }
  }
  
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
  
  const avgChapterWords = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.totalWords, 0) / results.length)
    : 0;
  const avgSceneCount = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.sceneCount, 0) / results.length)
    : 0;
    
  return { chapters: results, avgChapterWords, avgSceneCount };
}

// ========== WORD FREQUENCY ==========
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

export async function getCharacterAgeAtEvent(entityId, eventId) {
  const entity = await db.entities.get(entityId);
  const event = await db.events.get(eventId);
  if (!entity?.birthDate || !event?.startDate) return null;
  const effectiveYear = entity.deathDate && event.startDate > entity.deathDate 
    ? entity.deathDate 
    : event.startDate;
  return effectiveYear - entity.birthDate;
}
