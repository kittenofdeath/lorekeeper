import Dexie from 'dexie';

export const db = new Dexie('lorekeeper');

db.version(1).stores({
  entities: '++id, type, name, birthDate, deathDate, isSpoiler',
  relationships: '++id, sourceId, targetId, type, startDate, endDate',
  events: '++id, title, startDate, endDate, locationId, isSpoiler',
  eventParticipants: '++id, eventId, entityId, role',
  eventCausality: '++id, causeEventId, effectEventId',
  media: '++id, entityId, eventId, type, filename',
  project: '++id, name, spoilerMode'
});

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

export { db as database };
