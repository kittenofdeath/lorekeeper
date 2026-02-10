import db from './schema';

// ========== QUESTS ==========
export async function getAllQuests(projectId) {
  if (projectId) {
    return db.quests.where('projectId').equals(projectId).toArray();
  }
  return db.quests.toArray();
}

export async function getQuest(id) {
  return db.quests.get(id);
}

export async function createQuest(quest) {
  return db.quests.add({
    ...quest,
    status: quest.status || 'draft',
    createdAt: Date.now()
  });
}

export async function updateQuest(id, updates) {
  return db.quests.update(id, { ...updates, updatedAt: Date.now() });
}

export async function deleteQuest(id) {
  await db.questObjectives.where('questId').equals(id).delete();
  await db.questRewards.where('questId').equals(id).delete();
  await db.questPrerequisites.where('questId').equals(id).delete();
  await db.questStages.where('questId').equals(id).delete();
  await db.questBranches.where('fromQuestId').equals(id).delete();
  await db.questBranches.where('toQuestId').equals(id).delete();
  return db.quests.delete(id);
}

// ========== QUEST OBJECTIVES ==========
export async function getQuestObjectives(questId) {
  return db.questObjectives.where('questId').equals(questId).sortBy('order');
}

export async function createQuestObjective(objective) {
  const objectives = await getQuestObjectives(objective.questId);
  return db.questObjectives.add({
    ...objective,
    order: objectives.length + 1,
    createdAt: Date.now()
  });
}

export async function updateQuestObjective(id, updates) {
  return db.questObjectives.update(id, updates);
}

export async function deleteQuestObjective(id) {
  return db.questObjectives.delete(id);
}

// ========== QUEST REWARDS ==========
export async function getQuestRewards(questId) {
  return db.questRewards.where('questId').equals(questId).toArray();
}

export async function createQuestReward(reward) {
  return db.questRewards.add({ ...reward, createdAt: Date.now() });
}

export async function updateQuestReward(id, updates) {
  return db.questRewards.update(id, updates);
}

export async function deleteQuestReward(id) {
  return db.questRewards.delete(id);
}

// ========== QUEST PREREQUISITES ==========
export async function getQuestPrerequisites(questId) {
  return db.questPrerequisites.where('questId').equals(questId).toArray();
}

export async function createQuestPrerequisite(prereq) {
  return db.questPrerequisites.add({ ...prereq, createdAt: Date.now() });
}

export async function deleteQuestPrerequisite(id) {
  return db.questPrerequisites.delete(id);
}

// ========== QUEST STAGES ==========
export async function getQuestStages(questId) {
  return db.questStages.where('questId').equals(questId).sortBy('stageNumber');
}

export async function createQuestStage(stage) {
  const stages = await getQuestStages(stage.questId);
  return db.questStages.add({
    ...stage,
    stageNumber: stages.length + 1,
    createdAt: Date.now()
  });
}

export async function updateQuestStage(id, updates) {
  return db.questStages.update(id, updates);
}

export async function deleteQuestStage(id) {
  return db.questStages.delete(id);
}

// ========== QUEST BRANCHES (connections between quests) ==========
export async function getQuestBranches() {
  return db.questBranches.toArray();
}

export async function getQuestBranchesFrom(questId) {
  return db.questBranches.where('fromQuestId').equals(questId).toArray();
}

export async function getQuestBranchesTo(questId) {
  return db.questBranches.where('toQuestId').equals(questId).toArray();
}

export async function createQuestBranch(branch) {
  return db.questBranches.add({ ...branch, createdAt: Date.now() });
}

export async function updateQuestBranch(id, updates) {
  return db.questBranches.update(id, updates);
}

export async function deleteQuestBranch(id) {
  return db.questBranches.delete(id);
}

// ========== QUEST CHAINS ==========
export async function getQuestChains() {
  const quests = await getAllQuests();
  const branches = await getQuestBranches();
  
  // Find root quests (no prerequisites or branches leading to them)
  const targetIds = new Set(branches.map(b => b.toQuestId));
  const questsWithPrereqs = new Set();
  
  for (const quest of quests) {
    const prereqs = await getQuestPrerequisites(quest.id);
    if (prereqs.some(p => p.prereqQuestId)) {
      questsWithPrereqs.add(quest.id);
    }
  }
  
  const rootQuests = quests.filter(q => 
    !targetIds.has(q.id) && !questsWithPrereqs.has(q.id)
  );
  
  // Build chains from roots
  const chains = [];
  const visited = new Set();
  
  function buildChain(questId, chain = []) {
    if (visited.has(questId)) return chain;
    visited.add(questId);
    
    const quest = quests.find(q => q.id === questId);
    if (!quest) return chain;
    
    chain.push(quest);
    
    const nextBranches = branches.filter(b => b.fromQuestId === questId);
    for (const branch of nextBranches) {
      buildChain(branch.toQuestId, chain);
    }
    
    return chain;
  }
  
  for (const root of rootQuests) {
    const chain = buildChain(root.id, []);
    if (chain.length > 0) {
      chains.push(chain);
    }
  }
  
  return chains;
}

// ========== QUEST STATS ==========
export async function getQuestStats() {
  const quests = await getAllQuests();
  const byType = {};
  const byStatus = {};
  const byFaction = {};
  
  for (const quest of quests) {
    byType[quest.type] = (byType[quest.type] || 0) + 1;
    byStatus[quest.status] = (byStatus[quest.status] || 0) + 1;
    if (quest.factionId) {
      byFaction[quest.factionId] = (byFaction[quest.factionId] || 0) + 1;
    }
  }
  
  return {
    total: quests.length,
    byType,
    byStatus,
    byFaction
  };
}
