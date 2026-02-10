import db from './schema';

// ========== ENTITIES ==========
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

// ========== RELATIONSHIPS ==========
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

// ========== FAMILY TREE ==========
export async function getFamilyTreeData() {
  const entities = await getAllEntities();
  const relationships = await getAllRelationships();
  
  const characters = entities.filter(e => e.type === 'character');
  const familyRels = relationships.filter(r => 
    r.type === 'family' || ['parent', 'child', 'spouse', 'sibling'].includes(r.type)
  ).map(r => ({
    ...r,
    effectiveType: r.type === 'family' ? r.subtype : r.type
  }));
  
  return { characters, relationships: familyRels };
}

// ========== PERSONALITY ==========
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

// ========== MEDIA ==========
export async function addMedia(media) {
  return db.media.add({ ...media, createdAt: Date.now() });
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

// ========== ARC POINTS ==========
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

// ========== ARC DIMENSIONS ==========
export async function getArcDimensions() {
  return db.arcDimensions.toArray();
}

export async function addArcDimension(name, color = '#eab308', icon = 'TrendingUp', description = '') {
  return db.arcDimensions.add({ name, color, icon, description, createdAt: Date.now() });
}

export async function updateArcDimension(id, updates) {
  return db.arcDimensions.update(id, updates);
}

export async function deleteArcDimension(id) {
  const points = await db.arcPoints.where('dimension').equals(String(id)).toArray();
  for (const p of points) {
    await db.arcPoints.delete(p.id);
  }
  return db.arcDimensions.delete(id);
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

// ========== LORE VERSION HISTORY ==========
export async function logLoreChange(entityId, field, oldValue, newValue, note = '') {
  return db.loreVersions.add({
    entityId, field, oldValue, newValue, changedAt: Date.now(), note
  });
}

export async function getLoreHistory(entityId) {
  return db.loreVersions.where('entityId').equals(entityId).reverse().sortBy('changedAt');
}

export async function getAllLoreHistory() {
  return db.loreVersions.reverse().sortBy('changedAt');
}

// ========== AGE CALCULATOR ==========
export function calculateAge(birthYear, targetYear, deathYear = null) {
  if (!birthYear || !targetYear) return null;
  const effectiveYear = deathYear && targetYear > deathYear ? deathYear : targetYear;
  return effectiveYear - birthYear;
}
