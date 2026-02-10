import db from './schema';

// ========== CHAPTERS ==========
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

// ========== SCENES ==========
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

// ========== SCENE CHARACTERS ==========
export async function getSceneCharacters(sceneId) {
  return db.sceneCharacters.where('sceneId').equals(sceneId).toArray();
}

export async function addSceneCharacter(sceneId, entityId, role = 'present') {
  return db.sceneCharacters.add({ sceneId, entityId, role });
}

export async function removeSceneCharacter(id) {
  return db.sceneCharacters.delete(id);
}

// ========== SCENE DRAFTS ==========
export async function getSceneDrafts(sceneId) {
  return db.sceneDrafts.where('sceneId').equals(sceneId).reverse().sortBy('savedAt');
}

export async function saveSceneDraft(sceneId, content, note = '') {
  return db.sceneDrafts.add({ sceneId, content, savedAt: Date.now(), note });
}

export async function deleteSceneDraft(id) {
  return db.sceneDrafts.delete(id);
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

// ========== READING/CHRONOLOGICAL ORDER ==========
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

// ========== POETRY ==========
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
