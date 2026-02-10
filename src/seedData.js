// Game of Thrones seed data - Complete edition
import { db } from './db/schema';
import { clearAllData, createEntity, createRelationship, createEvent, addEventParticipant } from './db';
import { addEventCausality, addPlotline, updateEventCausality } from './db';
import { createQuest, createQuestObjective, createQuestReward, createQuestStage, createQuestBranch, createQuestPrerequisite } from './db';
import { createCreature, createLanguage, addWord, createCurrency, createTheme, addThemeOccurrence } from './db';
import { createRule, createFact, addKnowledge, createSetup, createNamingRule } from './db';
import { addArcDimension, addArcPoint, savePersonality, createFrame, createPoem } from './db';
import { createChapter, createScene, createPlotBeat, createDialogueNode, createDialogueChoice } from './db';

export async function seedGameOfThrones() {
  await clearAllData();
  
  // Get/create project
  let project = await db.projects.toArray();
  let projectId;
  if (project.length === 0) {
    projectId = await db.projects.add({ name: 'Game of Thrones', createdAt: Date.now() });
  } else {
    projectId = project[0].id;
  }
  await db.project.clear();
  await db.project.add({ name: 'Game of Thrones', spoilerMode: true, activeProjectId: projectId });

  // ==================== CHARACTERS ====================
  const eddard = await createEntity({
    projectId, type: 'character', name: 'Eddard Stark', aliases: ['Ned', 'The Quiet Wolf'],
    description: 'Lord of Winterfell, Warden of the North, and Hand of the King. Known for his unwavering honor.',
    birthDate: 263, deathDate: 298, status: 'deceased',
    attributes: { title: 'Lord of Winterfell', religion: 'Old Gods' }
  });

  const catelyn = await createEntity({
    projectId, type: 'character', name: 'Catelyn Stark', aliases: ['Cat', 'Lady Stoneheart'],
    description: 'Lady of Winterfell, wife of Eddard Stark. Born a Tully of Riverrun.',
    birthDate: 264, deathDate: 299, status: 'deceased',
    attributes: { title: 'Lady of Winterfell', maidenName: 'Tully' }
  });

  const robb = await createEntity({
    projectId, type: 'character', name: 'Robb Stark', aliases: ['The Young Wolf', 'King in the North'],
    description: 'Eldest son of Eddard and Catelyn. Declared King in the North.',
    birthDate: 283, deathDate: 299, status: 'deceased',
    attributes: { title: 'King in the North' }
  });

  const sansa = await createEntity({
    projectId, type: 'character', name: 'Sansa Stark', aliases: ['Little Bird', 'Alayne Stone'],
    description: 'Eldest daughter of Eddard. Grew from naive to shrewd political player.',
    birthDate: 286, status: 'active',
    attributes: { title: 'Queen in the North' }
  });

  const arya = await createEntity({
    projectId, type: 'character', name: 'Arya Stark', aliases: ['Arry', 'No One', 'Cat of the Canals'],
    description: 'Younger daughter of Eddard. Trained with the Faceless Men.',
    birthDate: 287, status: 'active',
    attributes: { title: 'Princess' }
  });

  const bran = await createEntity({
    projectId, type: 'character', name: 'Bran Stark', aliases: ['Bran the Broken', 'Three-Eyed Raven'],
    description: 'Second son of Eddard. Became the Three-Eyed Raven.',
    birthDate: 290, status: 'active',
    attributes: { title: 'King of the Six Kingdoms', abilities: 'Greensight, Warging' }
  });

  const jon = await createEntity({
    projectId, type: 'character', name: 'Jon Snow', aliases: ['The White Wolf', 'Aegon Targaryen'],
    description: 'Actually son of Rhaegar Targaryen and Lyanna Stark. Lord Commander of Night\'s Watch.',
    birthDate: 283, status: 'active',
    attributes: { title: 'King in the North', trueParentage: 'Rhaegar & Lyanna' },
    isSpoiler: true
  });

  const tyrion = await createEntity({
    projectId, type: 'character', name: 'Tyrion Lannister', aliases: ['The Imp', 'Halfman'],
    description: 'Youngest son of Tywin. Brilliant mind despite being mocked.',
    birthDate: 273, status: 'active',
    attributes: { title: 'Hand of the King' }
  });

  const cersei = await createEntity({
    projectId, type: 'character', name: 'Cersei Lannister', aliases: ['Light of the West'],
    description: 'Queen of the Seven Kingdoms, twin of Jaime. Ruthless and ambitious.',
    birthDate: 266, deathDate: 305, status: 'deceased',
    attributes: { title: 'Queen' }
  });

  const jaime = await createEntity({
    projectId, type: 'character', name: 'Jaime Lannister', aliases: ['Kingslayer', 'Goldenhand'],
    description: 'Twin of Cersei, greatest swordsman. Killed the Mad King.',
    birthDate: 266, deathDate: 305, status: 'deceased',
    attributes: { title: 'Lord Commander of Kingsguard' }
  });

  const tywin = await createEntity({
    projectId, type: 'character', name: 'Tywin Lannister', aliases: ['The Great Lion'],
    description: 'Lord of Casterly Rock. Most powerful man in Westeros.',
    birthDate: 242, deathDate: 300, status: 'deceased',
    attributes: { title: 'Lord of Casterly Rock, Hand of the King' }
  });

  const daenerys = await createEntity({
    projectId, type: 'character', name: 'Daenerys Targaryen', aliases: ['Dany', 'Mother of Dragons', 'Khaleesi'],
    description: 'Last Targaryen heir. Commands three dragons.',
    birthDate: 284, deathDate: 305, status: 'deceased',
    attributes: { title: 'Queen', dragons: 'Drogon, Rhaegal, Viserion' }
  });

  const petyr = await createEntity({
    projectId, type: 'character', name: 'Petyr Baelish', aliases: ['Littlefinger'],
    description: 'Master of Coin, master manipulator who rose from nothing.',
    birthDate: 268, deathDate: 304, status: 'deceased',
    attributes: { title: 'Lord of Harrenhal' }
  });

  const nightKing = await createEntity({
    projectId, type: 'character', name: 'The Night King', aliases: ['The Great Other'],
    description: 'Leader of the White Walkers, created by the Children of the Forest.',
    deathDate: 304, status: 'deceased', isSpoiler: true,
    attributes: { abilities: 'Necromancy, Ice Magic' }
  });

  // ==================== FACTIONS (with hierarchy) ====================
  const westeros = await createEntity({
    projectId, type: 'faction', name: 'Westeros', factionType: 'region',
    description: 'The continent containing the Seven Kingdoms.',
    heraldry: 'Varies by region', motto: 'United under the Iron Throne'
  });

  const theNorth = await createEntity({
    projectId, type: 'faction', name: 'The North', factionType: 'region',
    parentFactionId: westeros,
    description: 'Largest region of the Seven Kingdoms, ruled from Winterfell.',
    heraldry: 'Grey Direwolf', motto: 'The North Remembers'
  });

  const houseStark = await createEntity({
    projectId, type: 'faction', name: 'House Stark', factionType: 'house',
    parentFactionId: theNorth,
    description: 'Great House ruling the North from Winterfell.',
    heraldry: 'Grey Direwolf on white', motto: 'Winter is Coming'
  });

  const houseBolton = await createEntity({
    projectId, type: 'faction', name: 'House Bolton', factionType: 'house',
    parentFactionId: theNorth,
    description: 'Northern house known for flaying their enemies.',
    heraldry: 'Flayed Man', motto: 'Our Blades are Sharp'
  });

  const theWesterlands = await createEntity({
    projectId, type: 'faction', name: 'The Westerlands', factionType: 'region',
    parentFactionId: westeros,
    description: 'Richest region, containing gold mines.',
    heraldry: 'Golden Lion'
  });

  const houseLannister = await createEntity({
    projectId, type: 'faction', name: 'House Lannister', factionType: 'house',
    parentFactionId: theWesterlands,
    description: 'Richest house, ruling from Casterly Rock.',
    heraldry: 'Golden Lion on crimson', motto: 'Hear Me Roar'
  });

  const houseTargaryen = await createEntity({
    projectId, type: 'faction', name: 'House Targaryen', factionType: 'house',
    description: 'Former ruling dynasty with dragons.',
    heraldry: 'Three-headed dragon', motto: 'Fire and Blood'
  });

  const nightsWatch = await createEntity({
    projectId, type: 'faction', name: "Night's Watch", factionType: 'guild',
    description: 'Ancient order guarding the Wall.',
    heraldry: 'Black', motto: 'Night gathers, and now my watch begins'
  });

  const facelessMen = await createEntity({
    projectId, type: 'faction', name: 'Faceless Men', factionType: 'guild',
    description: 'Guild of assassins serving the Many-Faced God.',
    heraldry: 'None', motto: 'Valar Morghulis'
  });

  // ==================== LOCATIONS ====================
  const winterfell = await createEntity({
    projectId, type: 'location', name: 'Winterfell',
    description: 'Ancient seat of House Stark, built over hot springs.',
    attributes: { region: 'The North', type: 'Castle' }
  });

  const kingsLanding = await createEntity({
    projectId, type: 'location', name: "King's Landing",
    description: 'Capital of the Seven Kingdoms.',
    attributes: { region: 'Crownlands', type: 'City', population: '500,000' }
  });

  const theWall = await createEntity({
    projectId, type: 'location', name: 'The Wall',
    description: '700 feet tall barrier of ice.',
    attributes: { type: 'Fortification', height: '700 feet' }
  });

  const castleBlack = await createEntity({
    projectId, type: 'location', name: 'Castle Black',
    description: 'Primary castle of the Night\'s Watch.',
    attributes: { region: 'The Wall', type: 'Castle' }
  });

  const braavos = await createEntity({
    projectId, type: 'location', name: 'Braavos',
    description: 'Free City known for the Iron Bank and Faceless Men.',
    attributes: { region: 'Essos', type: 'City' }
  });

  const dragonstone = await createEntity({
    projectId, type: 'location', name: 'Dragonstone',
    description: 'Island fortress of House Targaryen.',
    attributes: { region: 'Blackwater Bay', type: 'Castle' }
  });

  const theTwins = await createEntity({
    projectId, type: 'location', name: 'The Twins',
    description: 'Twin castles of House Frey.',
    attributes: { region: 'Riverlands', type: 'Castle' }
  });

  // ==================== ITEMS ====================
  const ironThrone = await createEntity({
    projectId, type: 'item', name: 'The Iron Throne',
    description: 'Seat of power forged from swords of enemies by dragonfire.',
    attributes: { location: "King's Landing" }
  });

  const longclaw = await createEntity({
    projectId, type: 'item', name: 'Longclaw',
    description: 'Valyrian steel bastard sword of House Mormont, given to Jon Snow.',
    attributes: { type: 'Sword', material: 'Valyrian Steel' }
  });

  const needle = await createEntity({
    projectId, type: 'item', name: 'Needle',
    description: 'Arya Stark\'s thin sword, gift from Jon Snow.',
    attributes: { type: 'Sword' }
  });

  const dragonglass = await createEntity({
    projectId, type: 'item', name: 'Dragonglass',
    description: 'Obsidian that can kill White Walkers.',
    attributes: { type: 'Material', properties: 'Kills White Walkers' }
  });

  // ==================== CONCEPTS ====================
  const whiteWalkers = await createEntity({
    projectId, type: 'concept', name: 'White Walkers', aliases: ['The Others'],
    description: 'Ancient ice creatures commanding armies of the dead.',
    attributes: { weakness: 'Dragonglass, Valyrian Steel' },
    isSpoiler: true
  });

  const warging = await createEntity({
    projectId, type: 'concept', name: 'Warging',
    description: 'Ability to enter the minds of animals.',
    attributes: { users: 'Starks, Wildlings' }
  });

  const wildfire = await createEntity({
    projectId, type: 'concept', name: 'Wildfire',
    description: 'Volatile green substance that burns intensely.',
    attributes: { createdBy: "Alchemists' Guild" }
  });

  // ==================== RELATIONSHIPS ====================
  // Stark family
  await createRelationship({ projectId, sourceId: eddard, targetId: catelyn, type: 'family', subtype: 'spouse' });
  await createRelationship({ projectId, sourceId: eddard, targetId: robb, type: 'family', subtype: 'parent' });
  await createRelationship({ projectId, sourceId: eddard, targetId: sansa, type: 'family', subtype: 'parent' });
  await createRelationship({ projectId, sourceId: eddard, targetId: arya, type: 'family', subtype: 'parent' });
  await createRelationship({ projectId, sourceId: eddard, targetId: bran, type: 'family', subtype: 'parent' });
  await createRelationship({ projectId, sourceId: catelyn, targetId: robb, type: 'family', subtype: 'parent' });
  await createRelationship({ projectId, sourceId: catelyn, targetId: sansa, type: 'family', subtype: 'parent' });
  await createRelationship({ projectId, sourceId: robb, targetId: sansa, type: 'family', subtype: 'sibling' });
  await createRelationship({ projectId, sourceId: arya, targetId: bran, type: 'family', subtype: 'sibling' });
  await createRelationship({ projectId, sourceId: arya, targetId: jon, type: 'family', subtype: 'sibling' });

  // Lannister family
  await createRelationship({ projectId, sourceId: tywin, targetId: cersei, type: 'family', subtype: 'parent' });
  await createRelationship({ projectId, sourceId: tywin, targetId: jaime, type: 'family', subtype: 'parent' });
  await createRelationship({ projectId, sourceId: tywin, targetId: tyrion, type: 'family', subtype: 'parent' });
  await createRelationship({ projectId, sourceId: cersei, targetId: jaime, type: 'family', subtype: 'twin' });
  await createRelationship({ projectId, sourceId: cersei, targetId: jaime, type: 'romantic', isSpoiler: true });

  // Political
  await createRelationship({ projectId, sourceId: eddard, targetId: cersei, type: 'enemy' });
  await createRelationship({ projectId, sourceId: tyrion, targetId: sansa, type: 'family', subtype: 'spouse (forced)', startDate: 300 });
  await createRelationship({ projectId, sourceId: arya, targetId: facelessMen, type: 'member' });
  await createRelationship({ projectId, sourceId: jon, targetId: nightsWatch, type: 'member', subtype: 'Lord Commander' });
  await createRelationship({ projectId, sourceId: daenerys, targetId: houseTargaryen, type: 'member', subtype: 'heir' });

  // ==================== EVENTS ====================
  const rebellion = await createEvent({
    projectId, title: "Robert's Rebellion",
    description: 'Civil war that ended Targaryen rule.',
    startDate: 282, endDate: 283, tags: ['war', 'political']
  });

  const branFall = await createEvent({
    projectId, title: 'Bran pushed from tower',
    description: 'Bran discovers Jaime and Cersei, is pushed by Jaime.',
    startDate: 298, locationId: winterfell, tags: ['tragedy'], isSpoiler: true
  });
  await addEventParticipant(branFall, bran, 'affected');
  await addEventParticipant(branFall, jaime, 'orchestrated');

  const nedExecution = await createEvent({
    projectId, title: 'Execution of Eddard Stark',
    description: 'Ned executed at Great Sept of Baelor.',
    startDate: 298, locationId: kingsLanding, tags: ['death', 'political']
  });
  await addEventParticipant(nedExecution, eddard, 'affected');
  await addEventParticipant(nedExecution, sansa, 'present');
  await addEventParticipant(nedExecution, arya, 'present');

  const redWedding = await createEvent({
    projectId, title: 'The Red Wedding',
    description: 'Massacre of Robb, Catelyn, and Northern army at Twins.',
    startDate: 299, locationId: theTwins, tags: ['betrayal', 'death']
  });
  await addEventParticipant(redWedding, robb, 'affected');
  await addEventParticipant(redWedding, catelyn, 'affected');
  await addEventParticipant(redWedding, tywin, 'orchestrated');

  const battleBastards = await createEvent({
    projectId, title: 'Battle of the Bastards',
    description: 'Jon and Sansa retake Winterfell from Boltons.',
    startDate: 303, locationId: winterfell, tags: ['battle'], isSpoiler: true
  });
  await addEventParticipant(battleBastards, jon, 'orchestrated');
  await addEventParticipant(battleBastards, sansa, 'orchestrated');

  const longNight = await createEvent({
    projectId, title: 'The Long Night',
    description: 'Final battle against the White Walkers at Winterfell.',
    startDate: 304, locationId: winterfell, tags: ['battle', 'survival'], isSpoiler: true
  });
  await addEventParticipant(longNight, arya, 'orchestrated');
  await addEventParticipant(longNight, nightKing, 'affected');

  const kingsLandingBurning = await createEvent({
    projectId, title: 'Burning of King\'s Landing',
    description: 'Daenerys burns the city with Drogon after bells ring.',
    startDate: 305, locationId: kingsLanding, tags: ['destruction'], isSpoiler: true
  });
  await addEventParticipant(kingsLandingBurning, daenerys, 'orchestrated');
  await addEventParticipant(kingsLandingBurning, cersei, 'affected');
  await addEventParticipant(kingsLandingBurning, jaime, 'affected');

  // ==================== PLOTLINES & CAUSALITY ====================
  const plotNorth = await addPlotline('Northern Independence', '#3b82f6', 'Stark quest for Northern freedom');
  const plotThrone = await addPlotline('Iron Throne', '#eab308', 'War for the Iron Throne');
  const plotWhiteWalkers = await addPlotline('White Walker Threat', '#06b6d4', 'The Long Night approaches');
  const plotDany = await addPlotline('Targaryen Return', '#ef4444', 'Daenerys quest to reclaim throne');

  const c1 = await addEventCausality(branFall, nedExecution, 'Investigation led to discovery', plotNorth);
  const c2 = await addEventCausality(nedExecution, redWedding, 'Robb declared war', plotNorth);
  const c3 = await addEventCausality(redWedding, battleBastards, 'Starks reclaim the North', plotNorth);
  const c4 = await addEventCausality(battleBastards, longNight, 'United North faces threat', plotWhiteWalkers);
  const c5 = await addEventCausality(longNight, kingsLandingBurning, 'Dany lost too much', plotDany);

  // ==================== CUSTOM ARC DIMENSIONS ====================
  await addArcDimension('Wealth', '#22c55e', 'Coins', 'Material wealth and resources');
  await addArcDimension('Honor', '#3b82f6', 'Crown', 'Personal honor and reputation');
  await addArcDimension('Magic', '#a855f7', 'Sparkles', 'Connection to magical forces');

  // Arc points for Jon
  await addArcPoint(jon, 283, 10, 'power'); // born
  await addArcPoint(jon, 298, 30, 'power'); // joins Watch
  await addArcPoint(jon, 300, 70, 'power'); // Lord Commander
  await addArcPoint(jon, 303, 90, 'power'); // King in the North
  await addArcPoint(jon, 305, 50, 'power'); // exiled

  // Arc points for Daenerys
  await addArcPoint(daenerys, 284, 5, 'power'); // exiled baby
  await addArcPoint(daenerys, 298, 20, 'power'); // married to Drogo
  await addArcPoint(daenerys, 299, 40, 'power'); // dragons born
  await addArcPoint(daenerys, 302, 80, 'power'); // conquers cities
  await addArcPoint(daenerys, 305, 100, 'power'); // takes throne
  await addArcPoint(daenerys, 305, 0, 'morality'); // burns city

  // ==================== PERSONALITIES ====================
  await savePersonality(eddard, {
    openness: 30, conscientiousness: 95, extraversion: 40, agreeableness: 75, neuroticism: 25,
    values: { tradition: 90, security: 85, benevolence: 80 },
    motivations: ['Duty', 'Family', 'Justice']
  });

  await savePersonality(tyrion, {
    openness: 90, conscientiousness: 60, extraversion: 75, agreeableness: 50, neuroticism: 45,
    values: { stimulation: 80, selfdirection: 85, achievement: 70 },
    motivations: ['Knowledge', 'Survival', 'Love']
  });

  await savePersonality(arya, {
    openness: 85, conscientiousness: 40, extraversion: 35, agreeableness: 30, neuroticism: 40,
    values: { selfdirection: 95, power: 60, stimulation: 75 },
    motivations: ['Revenge', 'Freedom', 'Justice']
  });

  // Faction personalities
  await savePersonality(houseStark, {
    militarism: 60, tradition: 90, openness: 30, hierarchy: 60, collectivism: 75, religiosity: 70, honor: 95,
    customs: 'First Night abolished, execute own sentences, respect the Old Gods',
    taboos: 'Breaking guest right, oath-breaking',
    greetings: 'The North Remembers',
    motivations: ['Honor', 'Survival', 'Unity']
  });

  await savePersonality(houseLannister, {
    militarism: 70, tradition: 60, openness: 50, hierarchy: 85, collectivism: 40, religiosity: 30, honor: 40,
    customs: 'Always pay debts, family above all',
    taboos: 'Appearing weak, losing gold',
    greetings: 'A Lannister always pays his debts',
    motivations: ['Wealth', 'Power', 'Legacy']
  });

  // ==================== QUESTS ====================
  const questNeedle = await createQuest({
    projectId, name: 'Find Needle', type: 'companion', status: 'implemented',
    questGiverId: arya, locationId: braavos, level: 5,
    description: 'Arya must recover her sword Needle from its hiding place.',
    isRepeatable: false
  });
  await createQuestObjective({ questId: questNeedle, type: 'reach', description: 'Go to the hiding spot in Braavos', order: 1 });
  await createQuestObjective({ questId: questNeedle, type: 'collect', description: 'Retrieve Needle', targetCount: 1, order: 2 });
  await createQuestReward({ questId: questNeedle, type: 'item', itemId: needle });
  await createQuestStage({ questId: questNeedle, description: 'Remember where you hid Needle', stageNumber: 1, locationId: braavos });

  const questWall = await createQuest({
    projectId, name: 'Take the Black', type: 'main', status: 'implemented',
    questGiverId: eddard, locationId: castleBlack, level: 1,
    description: 'Join the Night\'s Watch and swear the oath.'
  });
  await createQuestObjective({ questId: questWall, type: 'reach', description: 'Travel to Castle Black', order: 1 });
  await createQuestObjective({ questId: questWall, type: 'talk', description: 'Speak with Lord Commander Mormont', order: 2 });
  await createQuestObjective({ questId: questWall, type: 'custom', description: 'Complete training', order: 3 });
  await createQuestObjective({ questId: questWall, type: 'custom', description: 'Swear the oath', order: 4 });
  await createQuestReward({ questId: questWall, type: 'reputation', factionId: nightsWatch, reputationChange: 50 });
  await createQuestStage({ questId: questWall, description: 'Leave Winterfell for the Wall', stageNumber: 1 });
  await createQuestStage({ questId: questWall, description: 'Train with the other recruits', stageNumber: 2, locationId: castleBlack });

  const questBeyond = await createQuest({
    projectId, name: 'Beyond the Wall', type: 'main', status: 'implemented',
    locationId: theWall, factionId: nightsWatch, level: 10,
    description: 'Venture beyond the Wall to discover the White Walker threat.'
  });
  await createQuestObjective({ questId: questBeyond, type: 'discover', description: 'Find evidence of White Walkers', order: 1 });
  await createQuestObjective({ questId: questBeyond, type: 'reach', description: 'Return to Castle Black alive', order: 2 });
  await createQuestReward({ questId: questBeyond, type: 'xp', amount: 500 });
  await createQuestPrerequisite({ questId: questBeyond, prereqType: 'quest', prereqQuestId: questWall });
  await createQuestBranch({ fromQuestId: questWall, toQuestId: questBeyond, condition: 'Complete training' });

  const questDragonglass = await createQuest({
    projectId, name: 'Mine Dragonglass', type: 'side', status: 'outlined',
    locationId: dragonstone, level: 15,
    description: 'Gather dragonglass from Dragonstone to fight White Walkers.',
    isSpoiler: true
  });
  await createQuestObjective({ questId: questDragonglass, type: 'collect', description: 'Mine dragonglass', targetCount: 100, order: 1 });
  await createQuestObjective({ questId: questDragonglass, type: 'craft', description: 'Forge dragonglass weapons', targetCount: 50, order: 2 });
  await createQuestReward({ questId: questDragonglass, type: 'item', itemId: dragonglass, amount: 50 });
  await createQuestBranch({ fromQuestId: questBeyond, toQuestId: questDragonglass, condition: 'Discover WW weakness' });

  const questFaceless = await createQuest({
    projectId, name: 'The Faceless Men', type: 'faction', status: 'implemented',
    questGiverId: arya, locationId: braavos, factionId: facelessMen, level: 8,
    description: 'Train with the Faceless Men in Braavos.'
  });
  await createQuestObjective({ questId: questFaceless, type: 'reach', description: 'Find the House of Black and White', order: 1 });
  await createQuestObjective({ questId: questFaceless, type: 'custom', description: 'Become "No One"', order: 2 });
  await createQuestReward({ questId: questFaceless, type: 'reputation', factionId: facelessMen, reputationChange: 100 });
  await createQuestReward({ questId: questFaceless, type: 'unlock', amount: 1 }); // Face-changing ability

  // ==================== BESTIARY ====================
  await createCreature({
    name: 'Direwolf', type: 'beast', habitat: 'The North, Beyond the Wall',
    description: 'Giant wolves bonded to Stark children. Extinct south of the Wall until recently.',
    abilities: 'Enhanced senses, pack tactics, warg connection',
    isSpoiler: false
  });

  await createCreature({
    name: 'Dragon', type: 'magical beast', habitat: 'Anywhere',
    description: 'Fire-breathing reptiles, once thought extinct. Daenerys hatched three.',
    abilities: 'Flight, fire breath, magical bond with rider',
    isSpoiler: false
  });

  await createCreature({
    name: 'White Walker', type: 'undead', habitat: 'The Lands of Always Winter',
    description: 'Ancient ice creatures who raise the dead.',
    abilities: 'Ice magic, raise wights, immune to normal weapons',
    isSpoiler: true
  });

  await createCreature({
    name: 'Wight', type: 'undead', habitat: 'Beyond the Wall',
    description: 'Corpses raised by White Walkers.',
    abilities: 'Tireless, follows White Walker commands',
    isSpoiler: true
  });

  await createCreature({
    name: 'Giant', type: 'giant', habitat: 'Beyond the Wall',
    description: 'Massive humanoids allied with the Free Folk.',
    abilities: 'Immense strength, can ride mammoths',
    isSpoiler: false
  });

  // ==================== LANGUAGES ====================
  const valyrian = await createLanguage({
    name: 'High Valyrian', description: 'Ancient language of the Valyrian Freehold.',
    phonology: 'Musical quality, many vowels',
    grammar: 'Highly inflected, four grammatical genders'
  });
  await addWord({ languageId: valyrian, word: 'Valar', meaning: 'All men', pronunciation: 'VAH-lar' });
  await addWord({ languageId: valyrian, word: 'Morghulis', meaning: 'Must die', pronunciation: 'mor-GOO-lis' });
  await addWord({ languageId: valyrian, word: 'Dohaeris', meaning: 'Must serve', pronunciation: 'do-HAY-ris' });
  await addWord({ languageId: valyrian, word: 'Dracarys', meaning: 'Dragonfire', pronunciation: 'drah-KAH-ris' });

  const dothraki = await createLanguage({
    name: 'Dothraki', description: 'Language of the Dothraki horse lords.',
    phonology: 'Harsh consonants, guttural sounds',
    grammar: 'No word for "please" or "thank you"'
  });
  await addWord({ languageId: dothraki, word: 'Khal', meaning: 'King/Leader', pronunciation: 'KAHL' });
  await addWord({ languageId: dothraki, word: 'Khaleesi', meaning: 'Queen/Wife of Khal', pronunciation: 'kah-LEE-see' });

  // ==================== CURRENCIES ====================
  await createCurrency({ projectId, name: 'Gold Dragon', symbol: '🐉', baseValue: 1, description: 'Standard gold coin' });
  await createCurrency({ projectId, name: 'Silver Stag', symbol: '🦌', baseValue: 0.142, description: '7 stags = 1 dragon' });
  await createCurrency({ projectId, name: 'Copper Penny', symbol: '🪙', baseValue: 0.00357, description: '196 pennies = 1 dragon' });

  // ==================== THEMES ====================
  const themePower = await createTheme({ name: 'Power Corrupts', description: 'Those who seek power often lose themselves.', color: '#ef4444' });
  await addThemeOccurrence({ themeId: themePower, entityId: cersei, notes: 'Her paranoia grows with power' });
  await addThemeOccurrence({ themeId: themePower, entityId: daenerys, notes: 'The Mad Queen turn' });

  const themeFamily = await createTheme({ name: 'Family vs Duty', description: 'Characters torn between family and larger obligations.', color: '#3b82f6' });
  await addThemeOccurrence({ themeId: themeFamily, entityId: eddard, notes: 'Chooses honor, loses family' });
  await addThemeOccurrence({ themeId: themeFamily, entityId: jon, notes: 'Duty to realm vs love for Dany' });

  const themeIdentity = await createTheme({ name: 'Identity', description: 'Who are we without our names?', color: '#a855f7' });
  await addThemeOccurrence({ themeId: themeIdentity, entityId: arya, notes: '"No One" training' });
  await addThemeOccurrence({ themeId: themeIdentity, entityId: jon, notes: 'Bastard → Targaryen revelation' });

  // ==================== MAGIC RULES ====================
  await createRule({ system: 'Blood Magic', rule: 'Only death can pay for life', category: 'cost', exceptions: 'Dragons seem to bypass this' });
  await createRule({ system: 'Warging', rule: 'Warg must be unconscious or in trance', category: 'limitation' });
  await createRule({ system: 'Warging', rule: 'Skinchanging humans is forbidden and dangerous', category: 'taboo' });
  await createRule({ system: 'Resurrection', rule: 'Resurrected lose part of themselves each time', category: 'cost' });
  await createRule({ system: 'White Walkers', rule: 'Killed by dragonglass or Valyrian steel', category: 'weakness' });
  await createRule({ system: 'Dragons', rule: 'Bond with one rider at a time', category: 'limitation' });

  // ==================== FACTS & KNOWLEDGE ====================
  const factJon = await createFact({ description: 'Jon Snow is actually Aegon Targaryen', isTrue: true, category: 'parentage' });
  const factCersei = await createFact({ description: 'Joffrey, Myrcella, and Tommen are Jaime\'s children', isTrue: true, category: 'parentage' });
  await addKnowledge({ entityId: bran, factId: factJon, learnedAt: 302, isTrue: true });
  await addKnowledge({ entityId: eddard, factId: factCersei, learnedAt: 298, isTrue: true });

  // ==================== FORESHADOWING ====================
  await createSetup({ description: 'Direwolf mother killed by stag (Stark/Baratheon doom)', category: 'symbolism', status: 'resolved' });
  await createSetup({ description: 'Bran\'s visions of the Mad King', category: 'foreshadow', status: 'resolved' });
  await createSetup({ description: '"The lone wolf dies but the pack survives"', category: 'foreshadow', status: 'resolved' });
  await createSetup({ description: 'Arya\'s list of names', category: 'foreshadow', status: 'resolved' });

  // ==================== NAMING RULES ====================
  await createNamingRule({ culture: 'Valyrian', pattern: '-ys, -on, -erys endings', examples: 'Daenerys, Viserys, Rhaegar, Aegon' });
  await createNamingRule({ culture: 'Northern', pattern: 'Short, harsh consonants', examples: 'Ned, Robb, Bran, Jon' });
  await createNamingRule({ culture: 'Dothraki', pattern: 'Guttural sounds, no soft consonants', examples: 'Drogo, Rakharo, Jhiqui' });
  await createNamingRule({ culture: 'Lannister', pattern: '-ster suffix common, golden imagery', examples: 'Tywin, Tyrion, Cersei, Jaime' });

  // ==================== CHAPTERS & SCENES ====================
  const ch1 = await createChapter({ title: 'Winter is Coming', order: 1, povCharacterId: bran, status: 'final' });
  const ch2 = await createChapter({ title: 'The Kingsroad', order: 2, povCharacterId: eddard, status: 'final' });
  const ch3 = await createChapter({ title: 'Lord Snow', order: 3, povCharacterId: jon, status: 'final' });

  await createScene({ chapterId: ch1, title: 'The Deserter', order: 1, locationId: winterfell, timeYear: 298, content: 'The morning had dawned clear and cold, with a crispness that hinted at the end of summer...', wordCount: 1200 });
  await createScene({ chapterId: ch1, title: 'The Direwolves', order: 2, locationId: winterfell, timeYear: 298, content: 'They found the direwolf pups near the corpse of a stag...', wordCount: 800 });
  await createScene({ chapterId: ch2, title: 'Leaving Winterfell', order: 1, locationId: winterfell, timeYear: 298, content: 'Ned watched the towers of Winterfell recede behind him...', wordCount: 1100 });
  await createScene({ chapterId: ch3, title: 'Castle Black', order: 1, locationId: castleBlack, timeYear: 298, content: 'The Wall loomed before them, impossibly vast...', wordCount: 1400 });

  // ==================== PLOT BEATS ====================
  await createPlotBeat({ beatType: 'opening', title: 'Execution of the Deserter', description: 'Introduces Starks, Northern values, White Walker threat', status: 'complete' });
  await createPlotBeat({ beatType: 'catalyst', title: 'The King Arrives', description: 'Robert comes to Winterfell, offers Ned Hand position', status: 'complete' });
  await createPlotBeat({ beatType: 'break-into-2', title: 'Leaving Winterfell', description: 'Family splits: Ned south, Jon to Wall, girls to KL', status: 'complete' });
  await createPlotBeat({ beatType: 'midpoint', title: 'Ned discovers the truth', description: 'All Robert\'s children are actually Jaime\'s', status: 'complete' });
  await createPlotBeat({ beatType: 'all-is-lost', title: 'Ned\'s Execution', description: 'The honorable man dies, war begins', status: 'complete' });

  // ==================== FRAME NARRATIVES ====================
  await createFrame({ projectId, name: 'Present Day', description: 'Main timeline of events', timelineStart: 298, timelineEnd: 305, order: 1 });
  await createFrame({ projectId, name: 'Robert\'s Rebellion', description: 'Flashbacks to the war', timelineStart: 282, timelineEnd: 283, order: 2 });
  await createFrame({ projectId, name: 'Bran\'s Visions', description: 'Three-Eyed Raven glimpses of past', timelineStart: -8000, timelineEnd: 283, order: 3 });

  // ==================== POETRY ====================
  await createPoem({ projectId, title: 'The Rains of Castamere', type: 'song', content: 'And who are you, the proud lord said,\nThat I must bow so low?\nOnly a cat of a different coat,\nThat\'s all the truth I know...', composedBy: 'Unknown', performedBy: tyrion });
  await createPoem({ projectId, title: 'The Night\'s Watch Oath', type: 'oath', content: 'Night gathers, and now my watch begins.\nIt shall not end until my death.\nI shall take no wife, hold no lands, father no children...' });
  await createPoem({ projectId, title: 'The Bear and the Maiden Fair', type: 'song', content: 'A bear there was, a bear, a bear!\nAll black and brown and covered with hair...' });

  // ==================== DIALOGUE TREES (sample) ====================
  const dNode1 = await createDialogueNode({ projectId, text: 'Lord Stark, the king wishes to speak with you.', characterId: petyr, isPlayerChoice: false, isRoot: true, order: 1 });
  const dNode2 = await createDialogueNode({ projectId, text: 'What does Robert want now?', isPlayerChoice: true, parentId: dNode1, order: 2 });
  const dNode3 = await createDialogueNode({ projectId, text: 'Tell him I\'ll be there shortly.', isPlayerChoice: true, parentId: dNode1, order: 3 });
  await createDialogueChoice({ nodeId: dNode1, text: 'Ask about the king', nextNodeId: dNode2 });
  await createDialogueChoice({ nodeId: dNode1, text: 'Dismiss', nextNodeId: dNode3 });

  // ==================== LOCATION POSITIONS (for map) ====================
  await db.locationPositions.add({ locationId: winterfell, x: 450, y: 150 });
  await db.locationPositions.add({ locationId: castleBlack, x: 450, y: 50 });
  await db.locationPositions.add({ locationId: theWall, x: 400, y: 30 });
  await db.locationPositions.add({ locationId: kingsLanding, x: 550, y: 450 });
  await db.locationPositions.add({ locationId: dragonstone, x: 600, y: 400 });
  await db.locationPositions.add({ locationId: theTwins, x: 480, y: 300 });
  await db.locationPositions.add({ locationId: braavos, x: 700, y: 250 });

  // ==================== TRAVEL DISTANCES ====================
  await db.travelDistances.add({ fromLocationId: winterfell, toLocationId: kingsLanding, distance: 30, unit: 'days', method: 'horse' });
  await db.travelDistances.add({ fromLocationId: winterfell, toLocationId: castleBlack, distance: 14, unit: 'days', method: 'horse' });
  await db.travelDistances.add({ fromLocationId: kingsLanding, toLocationId: dragonstone, distance: 2, unit: 'days', method: 'ship' });
  await db.travelDistances.add({ fromLocationId: winterfell, toLocationId: theTwins, distance: 10, unit: 'days', method: 'horse' });

  console.log('✅ Game of Thrones seed data loaded!');
  console.log('   - 15+ characters with personalities');
  console.log('   - 10+ factions with hierarchy');
  console.log('   - 7 locations with map positions');
  console.log('   - 7 events with causality & plotlines');
  console.log('   - 5 quests with objectives & rewards');
  console.log('   - 5 creatures in bestiary');
  console.log('   - 2 languages with vocabulary');
  console.log('   - 3 currencies');
  console.log('   - 3 themes with occurrences');
  console.log('   - Magic rules, facts, foreshadowing');
  console.log('   - Chapters, scenes, plot beats');
  console.log('   - Poetry, dialogue trees, travel distances');
}
