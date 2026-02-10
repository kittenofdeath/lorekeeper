import db from './schema';

// ========== EVENTS ==========
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

// ========== EVENT PARTICIPANTS ==========
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

// ========== EVENT CAUSALITY ==========
export async function getEventCausality() {
  return db.eventCausality.toArray();
}

export async function addEventCausality(causeEventId, effectEventId, description = '', plotlineId = null) {
  return db.eventCausality.add({ causeEventId, effectEventId, description, plotlineId });
}

export async function updateEventCausality(id, updates) {
  return db.eventCausality.update(id, updates);
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

// ========== PLOTLINES ==========
export async function getPlotlines() {
  return db.plotlines.toArray();
}

export async function addPlotline(name, color = '#eab308', description = '') {
  return db.plotlines.add({ name, color, description, createdAt: Date.now() });
}

export async function updatePlotline(id, updates) {
  return db.plotlines.update(id, updates);
}

export async function deletePlotline(id) {
  const links = await db.eventCausality.where('plotlineId').equals(id).toArray();
  for (const link of links) {
    await db.eventCausality.update(link.id, { plotlineId: null });
  }
  return db.plotlines.delete(id);
}

// ========== LOCATION POSITIONS ==========
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
