import db from './schema';

// ========== PROJECT SETTINGS ==========
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

export async function setCustomMap(imageData) {
  const settings = await getProjectSettings();
  return updateProjectSettings({ ...settings, customMapImage: imageData });
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
    'vocabulary', 'plotBeats', 'frames', 'poems', 'currencies', 'sceneDrafts',
    'arcClosures', 'dialogueNodes', 'dialogueChoices', 'personalities', 'arcTypes',
    'plotlines', 'arcDimensions', 'arcPointTags', 'calendars', 'projects'
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
  const tables = Object.keys(backup.data);
  for (const table of tables) {
    try {
      await db[table].clear();
    } catch (e) {
      console.warn(`Could not clear ${table}:`, e);
    }
  }
  
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

export async function clearAllData() {
  await db.entities.clear();
  await db.relationships.clear();
  await db.events.clear();
  await db.eventParticipants.clear();
  await db.eventCausality.clear();
  await db.media.clear();
}
