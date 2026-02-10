import db from './schema';
import { getScene, getAllScenes } from './writing';

// ========== FACTS ==========
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

// ========== KNOWLEDGE TRACKING ==========
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
  const scene = await getScene(sceneId);
  if (!scene) return [];
  const allScenes = await getAllScenes();
  const priorScenes = allScenes.filter(s => s.order <= scene.order);
  const priorSceneIds = priorScenes.map(s => s.id);
  return db.facts.filter(f => priorSceneIds.includes(f.revealedInScene)).toArray();
}

// ========== FORESHADOWING / SETUPS ==========
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
