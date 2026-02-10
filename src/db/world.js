import db from './schema';

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

// ========== CURRENCIES ==========
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

// ========== CALENDARS ==========
export async function getCalendar(projectId) {
  return db.calendars.where('projectId').equals(projectId).first();
}

export async function createCalendar(calendar) {
  return db.calendars.add({ ...calendar, createdAt: Date.now() });
}

export async function updateCalendar(id, updates) {
  return db.calendars.update(id, updates);
}

// ========== DIALOGUE TREES (for games) ==========
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
