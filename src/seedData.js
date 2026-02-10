// Game of Thrones seed data
import { db, clearAllData, createEntity, createRelationship, createEvent, addEventParticipant, addEventCausality } from './db';

export async function seedGameOfThrones() {
  await clearAllData();
  
  // ========== CHARACTERS ==========
  const eddard = await createEntity({
    type: 'character',
    name: 'Eddard Stark',
    aliases: ['Ned', 'The Quiet Wolf'],
    description: 'Lord of Winterfell, Warden of the North, and Hand of the King. Known for his unwavering honor and sense of duty.',
    birthDate: 263,
    deathDate: 298,
    status: 'deceased',
    attributes: { title: 'Lord of Winterfell', religion: 'Old Gods' }
  });

  const catelyn = await createEntity({
    type: 'character',
    name: 'Catelyn Stark',
    aliases: ['Cat', 'Lady Stoneheart'],
    description: 'Lady of Winterfell, wife of Eddard Stark. Born a Tully of Riverrun.',
    birthDate: 264,
    deathDate: 299,
    status: 'deceased',
    attributes: { title: 'Lady of Winterfell', maidenName: 'Tully' }
  });

  const robb = await createEntity({
    type: 'character',
    name: 'Robb Stark',
    aliases: ['The Young Wolf', 'King in the North'],
    description: 'Eldest son of Eddard and Catelyn. Declared King in the North after his father\'s execution.',
    birthDate: 283,
    deathDate: 299,
    status: 'deceased',
    attributes: { title: 'King in the North' }
  });

  const sansa = await createEntity({
    type: 'character',
    name: 'Sansa Stark',
    aliases: ['Little Bird', 'Alayne Stone'],
    description: 'Eldest daughter of Eddard and Catelyn. Grew from a naive girl dreaming of knights to a shrewd political player.',
    birthDate: 286,
    status: 'active',
    attributes: { title: 'Lady of Winterfell' }
  });

  const arya = await createEntity({
    type: 'character',
    name: 'Arya Stark',
    aliases: ['Arry', 'No One', 'Cat of the Canals'],
    description: 'Younger daughter of Eddard. A fierce and independent spirit who trained with the Faceless Men.',
    birthDate: 287,
    status: 'active',
    attributes: { title: 'Princess' }
  });

  const bran = await createEntity({
    type: 'character',
    name: 'Bran Stark',
    aliases: ['Bran the Broken', 'Three-Eyed Raven'],
    description: 'Second son of Eddard. Became the Three-Eyed Raven after being pushed from a tower.',
    birthDate: 290,
    status: 'active',
    attributes: { title: 'King of the Six Kingdoms', abilities: 'Greensight, Warging' }
  });

  const jon = await createEntity({
    type: 'character',
    name: 'Jon Snow',
    aliases: ['The White Wolf', 'Lord Snow', 'Aegon Targaryen'],
    description: 'Believed to be Ned\'s bastard son, actually the son of Rhaegar Targaryen and Lyanna Stark. Lord Commander of the Night\'s Watch.',
    birthDate: 283,
    status: 'active',
    attributes: { title: 'King in the North', trueParentage: 'Rhaegar Targaryen & Lyanna Stark' },
    isSpoiler: true
  });

  const tyrion = await createEntity({
    type: 'character',
    name: 'Tyrion Lannister',
    aliases: ['The Imp', 'Halfman', 'Giant of Lannister'],
    description: 'Youngest son of Tywin Lannister. Despite being mocked for his dwarfism, he possesses a brilliant mind.',
    birthDate: 273,
    status: 'active',
    attributes: { title: 'Hand of the King' }
  });

  const cersei = await createEntity({
    type: 'character',
    name: 'Cersei Lannister',
    aliases: ['Light of the West'],
    description: 'Queen of the Seven Kingdoms, twin sister of Jaime. Ruthless and ambitious.',
    birthDate: 266,
    deathDate: 305,
    status: 'deceased',
    attributes: { title: 'Queen of the Seven Kingdoms' }
  });

  const jaime = await createEntity({
    type: 'character',
    name: 'Jaime Lannister',
    aliases: ['Kingslayer', 'Goldenhand'],
    description: 'Twin brother of Cersei, one of the greatest swordsmen in Westeros. Killed the Mad King.',
    birthDate: 266,
    deathDate: 305,
    status: 'deceased',
    attributes: { title: 'Lord Commander of the Kingsguard' }
  });

  const tywin = await createEntity({
    type: 'character',
    name: 'Tywin Lannister',
    aliases: ['The Great Lion'],
    description: 'Lord of Casterly Rock, Warden of the West. The most powerful man in Westeros.',
    birthDate: 242,
    deathDate: 300,
    status: 'deceased',
    attributes: { title: 'Lord of Casterly Rock, Hand of the King' }
  });

  const robert = await createEntity({
    type: 'character',
    name: 'Robert Baratheon',
    aliases: ['The Usurper', 'Demon of the Trident'],
    description: 'King of the Seven Kingdoms. Won the throne by conquest during Robert\'s Rebellion.',
    birthDate: 262,
    deathDate: 298,
    status: 'deceased',
    attributes: { title: 'King of the Seven Kingdoms' }
  });

  const daenerys = await createEntity({
    type: 'character',
    name: 'Daenerys Targaryen',
    aliases: ['Dany', 'Mother of Dragons', 'Breaker of Chains', 'Khaleesi'],
    description: 'Last known Targaryen heir (publicly). Born during a storm on Dragonstone. Commands three dragons.',
    birthDate: 284,
    deathDate: 305,
    status: 'deceased',
    attributes: { title: 'Queen of the Seven Kingdoms', dragons: 'Drogon, Rhaegal, Viserion' }
  });

  const joffrey = await createEntity({
    type: 'character',
    name: 'Joffrey Baratheon',
    aliases: ['Joffrey the Illborn'],
    description: 'Eldest son of Cersei, believed son of Robert. Cruel and sadistic ruler.',
    birthDate: 286,
    deathDate: 300,
    status: 'deceased',
    attributes: { title: 'King of the Seven Kingdoms', trueParentage: 'Jaime Lannister & Cersei Lannister' },
    isSpoiler: true
  });

  const petyr = await createEntity({
    type: 'character',
    name: 'Petyr Baelish',
    aliases: ['Littlefinger'],
    description: 'Master of Coin, later Lord of Harrenhal. A master manipulator who rose from nothing.',
    birthDate: 268,
    deathDate: 304,
    status: 'deceased',
    attributes: { title: 'Lord of Harrenhal, Lord Protector of the Vale' }
  });

  const varys = await createEntity({
    type: 'character',
    name: 'Varys',
    aliases: ['The Spider', 'Master of Whisperers'],
    description: 'Eunuch spymaster who claims to serve the realm above all else.',
    birthDate: 250,
    deathDate: 305,
    status: 'deceased',
    attributes: { title: 'Master of Whisperers' }
  });

  // ========== FACTIONS ==========
  const houseStark = await createEntity({
    type: 'faction',
    name: 'House Stark',
    aliases: ['The Wolves'],
    description: 'One of the Great Houses of Westeros, ruling the North from Winterfell. Words: "Winter is Coming"',
    attributes: { seat: 'Winterfell', region: 'The North', words: 'Winter is Coming', sigil: 'Grey Direwolf' }
  });

  const houseLannister = await createEntity({
    type: 'faction',
    name: 'House Lannister',
    aliases: ['The Lions'],
    description: 'Richest house in Westeros, ruling the Westerlands from Casterly Rock. Words: "Hear Me Roar"',
    attributes: { seat: 'Casterly Rock', region: 'The Westerlands', words: 'Hear Me Roar', sigil: 'Golden Lion' }
  });

  const houseBaratheon = await createEntity({
    type: 'faction',
    name: 'House Baratheon',
    aliases: ['The Stags'],
    description: 'Royal house after Robert\'s Rebellion. Words: "Ours is the Fury"',
    attributes: { seat: 'Storm\'s End', region: 'The Stormlands', words: 'Ours is the Fury', sigil: 'Crowned Stag' }
  });

  const houseTargaryen = await createEntity({
    type: 'faction',
    name: 'House Targaryen',
    aliases: ['The Dragons', 'Blood of Old Valyria'],
    description: 'Former ruling dynasty, overthrown in Robert\'s Rebellion. Words: "Fire and Blood"',
    attributes: { seat: 'Dragonstone (formerly Red Keep)', words: 'Fire and Blood', sigil: 'Three-Headed Dragon' }
  });

  const nightsWatch = await createEntity({
    type: 'faction',
    name: "Night's Watch",
    aliases: ['The Black Brothers', 'Crows'],
    description: 'Ancient order guarding the Wall against threats from the North.',
    attributes: { seat: 'Castle Black', purpose: 'Guard the Wall' }
  });

  // ========== LOCATIONS ==========
  const winterfell = await createEntity({
    type: 'location',
    name: 'Winterfell',
    description: 'Ancient seat of House Stark, capital of the North. Built over hot springs.',
    attributes: { region: 'The North', type: 'Castle' }
  });

  const kingsLanding = await createEntity({
    type: 'location',
    name: "King's Landing",
    description: 'Capital of the Seven Kingdoms, seat of the Iron Throne.',
    attributes: { region: 'The Crownlands', type: 'City', population: '500,000' }
  });

  const theWall = await createEntity({
    type: 'location',
    name: 'The Wall',
    description: '700 feet tall, 300 miles long barrier of ice protecting the realms of men.',
    attributes: { type: 'Fortification', length: '300 miles', height: '700 feet' }
  });

  const castleBlack = await createEntity({
    type: 'location',
    name: 'Castle Black',
    description: 'Primary castle of the Night\'s Watch along the Wall.',
    attributes: { region: 'The Wall', type: 'Castle' }
  });

  const theTwins = await createEntity({
    type: 'location',
    name: 'The Twins',
    description: 'Twin castles of House Frey spanning the Green Fork of the Trident.',
    attributes: { region: 'The Riverlands', type: 'Castle', house: 'Frey' }
  });

  const dragonstone = await createEntity({
    type: 'location',
    name: 'Dragonstone',
    description: 'Island fortress, ancestral seat of House Targaryen.',
    attributes: { region: 'Blackwater Bay', type: 'Island Castle' }
  });

  // ========== CONCEPTS ==========
  const ironThrone = await createEntity({
    type: 'item',
    name: 'The Iron Throne',
    description: 'Seat of the King of the Seven Kingdoms, forged from the swords of Aegon\'s enemies by dragonfire.',
    attributes: { location: "King's Landing", forgedBy: 'Aegon the Conqueror' }
  });

  const wildfire = await createEntity({
    type: 'concept',
    name: 'Wildfire',
    description: 'Highly volatile green substance that burns with intense heat. Created by the Alchemists\' Guild.',
    attributes: { createdBy: "Alchemists' Guild", properties: 'Burns on water, intensely hot' }
  });

  const whiteWalkers = await createEntity({
    type: 'concept',
    name: 'White Walkers',
    aliases: ['The Others'],
    description: 'Ancient ice creatures from the far North, commanding armies of the dead.',
    attributes: { weakness: 'Dragonglass, Valyrian Steel', origin: 'Created by Children of the Forest' },
    isSpoiler: true
  });

  // ========== RELATIONSHIPS ==========
  // Stark family
  await createRelationship({ sourceId: eddard, targetId: catelyn, type: 'family', subtype: 'spouse' });
  await createRelationship({ sourceId: eddard, targetId: robb, type: 'family', subtype: 'parent' });
  await createRelationship({ sourceId: eddard, targetId: sansa, type: 'family', subtype: 'parent' });
  await createRelationship({ sourceId: eddard, targetId: arya, type: 'family', subtype: 'parent' });
  await createRelationship({ sourceId: eddard, targetId: bran, type: 'family', subtype: 'parent' });
  await createRelationship({ sourceId: eddard, targetId: jon, type: 'family', subtype: 'guardian', notes: 'Raised as bastard son' });
  await createRelationship({ sourceId: catelyn, targetId: robb, type: 'family', subtype: 'parent' });
  await createRelationship({ sourceId: catelyn, targetId: sansa, type: 'family', subtype: 'parent' });
  await createRelationship({ sourceId: catelyn, targetId: arya, type: 'family', subtype: 'parent' });
  await createRelationship({ sourceId: catelyn, targetId: bran, type: 'family', subtype: 'parent' });

  // Lannister family
  await createRelationship({ sourceId: tywin, targetId: cersei, type: 'family', subtype: 'parent' });
  await createRelationship({ sourceId: tywin, targetId: jaime, type: 'family', subtype: 'parent' });
  await createRelationship({ sourceId: tywin, targetId: tyrion, type: 'family', subtype: 'parent' });
  await createRelationship({ sourceId: cersei, targetId: jaime, type: 'family', subtype: 'twin' });
  await createRelationship({ sourceId: cersei, targetId: jaime, type: 'romantic', subtype: 'lovers', isSpoiler: true });
  await createRelationship({ sourceId: cersei, targetId: joffrey, type: 'family', subtype: 'parent' });
  await createRelationship({ sourceId: cersei, targetId: robert, type: 'family', subtype: 'spouse' });

  // Political relationships
  await createRelationship({ sourceId: eddard, targetId: robert, type: 'ally', subtype: 'friends', notes: 'Childhood friends, fostered together' });
  await createRelationship({ sourceId: eddard, targetId: cersei, type: 'enemy', subtype: 'political rival' });
  await createRelationship({ sourceId: eddard, targetId: jaime, type: 'enemy', subtype: 'distrust', notes: 'Ned despises Jaime for killing the Mad King' });
  await createRelationship({ sourceId: tyrion, targetId: sansa, type: 'family', subtype: 'spouse (forced)', startDate: 300, notes: 'Forced marriage' });
  await createRelationship({ sourceId: petyr, targetId: catelyn, type: 'romantic', subtype: 'unrequited', notes: 'Littlefinger loved Cat since childhood' });
  await createRelationship({ sourceId: petyr, targetId: sansa, type: 'ally', subtype: 'manipulator', notes: 'Uses Sansa, obsessed with her resemblance to Cat' });
  await createRelationship({ sourceId: varys, targetId: petyr, type: 'enemy', subtype: 'rival spymasters' });

  // House memberships
  await createRelationship({ sourceId: eddard, targetId: houseStark, type: 'member', subtype: 'lord' });
  await createRelationship({ sourceId: robb, targetId: houseStark, type: 'member', subtype: 'heir' });
  await createRelationship({ sourceId: jon, targetId: nightsWatch, type: 'member', subtype: 'Lord Commander' });
  await createRelationship({ sourceId: tywin, targetId: houseLannister, type: 'member', subtype: 'lord' });
  await createRelationship({ sourceId: robert, targetId: houseBaratheon, type: 'member', subtype: 'lord' });
  await createRelationship({ sourceId: daenerys, targetId: houseTargaryen, type: 'member', subtype: 'heir' });

  // ========== EVENTS ==========
  const rebellion = await createEvent({
    title: "Robert's Rebellion",
    description: 'Civil war that ended Targaryen rule and put Robert Baratheon on the Iron Throne. Triggered by the kidnapping of Lyanna Stark.',
    startDate: 282,
    endDate: 283,
    tags: ['war', 'political']
  });
  await addEventParticipant(rebellion, robert, 'orchestrated');
  await addEventParticipant(rebellion, eddard, 'present');
  await addEventParticipant(rebellion, houseStark, 'affected');
  await addEventParticipant(rebellion, houseTargaryen, 'affected');

  const branFall = await createEvent({
    title: 'Bran pushed from tower',
    description: 'Bran Stark is pushed from a tower by Jaime Lannister after witnessing Jaime and Cersei together.',
    startDate: 298,
    locationId: winterfell,
    tags: ['tragedy', 'secret'],
    isSpoiler: true
  });
  await addEventParticipant(branFall, bran, 'affected');
  await addEventParticipant(branFall, jaime, 'orchestrated');
  await addEventParticipant(branFall, cersei, 'present');

  const nedExecution = await createEvent({
    title: 'Execution of Eddard Stark',
    description: 'Eddard Stark is publicly executed at the Great Sept of Baelor on orders of King Joffrey.',
    startDate: 298,
    locationId: kingsLanding,
    tags: ['death', 'political', 'tragedy']
  });
  await addEventParticipant(nedExecution, eddard, 'affected');
  await addEventParticipant(nedExecution, joffrey, 'orchestrated');
  await addEventParticipant(nedExecution, sansa, 'present');
  await addEventParticipant(nedExecution, arya, 'present');
  await addEventParticipant(nedExecution, cersei, 'present');

  const redWedding = await createEvent({
    title: 'The Red Wedding',
    description: 'Massacre at the wedding of Edmure Tully and Roslin Frey. Robb Stark, Catelyn Stark, and most of the Northern army are slaughtered.',
    startDate: 299,
    locationId: theTwins,
    tags: ['betrayal', 'death', 'war', 'tragedy']
  });
  await addEventParticipant(redWedding, robb, 'affected');
  await addEventParticipant(redWedding, catelyn, 'affected');
  await addEventParticipant(redWedding, houseStark, 'affected');
  await addEventParticipant(redWedding, tywin, 'orchestrated');
  await addEventParticipant(redWedding, houseLannister, 'orchestrated');

  const purpleWedding = await createEvent({
    title: 'The Purple Wedding',
    description: 'King Joffrey is poisoned at his own wedding feast.',
    startDate: 300,
    locationId: kingsLanding,
    tags: ['death', 'assassination', 'political']
  });
  await addEventParticipant(purpleWedding, joffrey, 'affected');
  await addEventParticipant(purpleWedding, tyrion, 'present');
  await addEventParticipant(purpleWedding, sansa, 'present');
  await addEventParticipant(purpleWedding, petyr, 'orchestrated');

  const tywinDeath = await createEvent({
    title: 'Death of Tywin Lannister',
    description: 'Tywin is killed by his son Tyrion with a crossbow while on the privy.',
    startDate: 300,
    locationId: kingsLanding,
    tags: ['death', 'revenge']
  });
  await addEventParticipant(tywinDeath, tywin, 'affected');
  await addEventParticipant(tywinDeath, tyrion, 'orchestrated');

  const battleOfBastards = await createEvent({
    title: 'Battle of the Bastards',
    description: 'Jon Snow and Sansa Stark retake Winterfell from Ramsay Bolton.',
    startDate: 303,
    locationId: winterfell,
    tags: ['battle', 'victory'],
    isSpoiler: true
  });
  await addEventParticipant(battleOfBastards, jon, 'orchestrated');
  await addEventParticipant(battleOfBastards, sansa, 'orchestrated');
  await addEventParticipant(battleOfBastards, houseStark, 'affected');

  const longNight = await createEvent({
    title: 'The Long Night',
    description: 'The Night King leads his army against Winterfell in the final battle against the White Walkers.',
    startDate: 304,
    locationId: winterfell,
    tags: ['battle', 'survival', 'apocalyptic'],
    isSpoiler: true
  });
  await addEventParticipant(longNight, jon, 'present');
  await addEventParticipant(longNight, daenerys, 'present');
  await addEventParticipant(longNight, arya, 'orchestrated');
  await addEventParticipant(longNight, bran, 'present');
  await addEventParticipant(longNight, whiteWalkers, 'orchestrated');

  // ========== CAUSALITY CHAINS ==========
  // Rebellion → Ned's Execution → Red Wedding
  await addEventCausality(rebellion, nedExecution, 'Targaryen loyalists never forgave');
  await addEventCausality(branFall, nedExecution, 'Bran\'s fall led to investigation');
  await addEventCausality(nedExecution, redWedding, 'Robb declared war after father\'s death');
  await addEventCausality(redWedding, purpleWedding, 'Tyrell/Martell revenge plot');
  await addEventCausality(purpleWedding, tywinDeath, 'Tyrion blamed, escaped, killed father');

  // ========== CHAPTERS & SCENES ==========
  const ch1 = await db.chapters.add({ title: 'Winter is Coming', order: 1, povCharacterId: bran, wordCount: 3200 });
  const ch2 = await db.chapters.add({ title: 'The Kingsroad', order: 2, povCharacterId: eddard, wordCount: 2800 });
  const ch3 = await db.chapters.add({ title: 'Lord Snow', order: 3, povCharacterId: jon, wordCount: 2500 });

  await db.scenes.add({ chapterId: ch1, title: 'The Deserter', order: 1, locationId: winterfell, timeYear: 298, content: 'The morning had dawned clear and cold...', wordCount: 1200 });
  await db.scenes.add({ chapterId: ch1, title: 'The Direwolves', order: 2, locationId: winterfell, timeYear: 298, content: 'They found the direwolf pups in the snow...', wordCount: 800, unreliableNarrator: false });
  await db.scenes.add({ chapterId: ch1, title: 'The King Arrives', order: 3, locationId: winterfell, timeYear: 298, content: 'The king had arrived at Winterfell...', wordCount: 1200 });
  await db.scenes.add({ chapterId: ch2, title: 'Leaving Home', order: 1, locationId: winterfell, timeYear: 298, content: 'Ned watched the towers of Winterfell recede...', wordCount: 900 });
  await db.scenes.add({ chapterId: ch2, title: 'The Incident', order: 2, timeYear: 298, content: 'Joffrey drew his sword...', wordCount: 1100 });
  await db.scenes.add({ chapterId: ch3, title: 'Castle Black', order: 1, locationId: castleBlack, timeYear: 298, content: 'The Wall loomed before them...', wordCount: 1400 });
  await db.scenes.add({ chapterId: ch3, title: 'Taking the Black', order: 2, locationId: castleBlack, timeYear: 298, content: 'The words of the oath echoed...', wordCount: 1100 });

  // ========== FORESHADOWING / SETUPS ==========
  await db.setups.add({ description: 'The direwolf mother killed by a stag', category: 'foreshadow', status: 'resolved', plantedInScene: 1 });
  await db.setups.add({ description: "Bran's climbing despite warnings", category: 'chekhov', status: 'resolved', plantedInScene: 1 });
  await db.setups.add({ description: 'Jon gives Arya a sword named Needle', category: 'chekhov', status: 'resolved', plantedInScene: 2 });
  await db.setups.add({ description: "Daenerys's dragon eggs", category: 'chekhov', status: 'resolved' });
  await db.setups.add({ description: 'The prophecy of Azor Ahai', category: 'prophecy', status: 'planted' });
  await db.setups.add({ description: "Melisandre's vision in the flames", category: 'prophecy', status: 'planted' });

  // ========== FACTS / KNOWLEDGE ==========
  const fact1 = await db.facts.add({ description: 'Jon Snow is actually Aegon Targaryen', isTrue: true, category: 'character' });
  const fact2 = await db.facts.add({ description: 'Joffrey is not Robert\'s son', isTrue: true, category: 'character' });
  const fact3 = await db.facts.add({ description: 'Littlefinger orchestrated the war', isTrue: true, category: 'plot' });
  const fact4 = await db.facts.add({ description: 'The White Walkers were created by the Children', isTrue: true, category: 'world' });
  
  // Who knows what
  await db.knowledge.add({ entityId: eddard, factId: fact2, isTrue: true });
  await db.knowledge.add({ entityId: tyrion, factId: fact2, isTrue: true });
  await db.knowledge.add({ entityId: bran, factId: fact1, isTrue: true });
  await db.knowledge.add({ entityId: bran, factId: fact4, isTrue: true });

  // Truth layers
  await db.truthLayers.add({ factId: fact1, layer: 'truth', description: 'Jon is the son of Rhaegar and Lyanna, making him Aegon Targaryen' });
  await db.truthLayers.add({ factId: fact1, layer: 'believed', description: 'Everyone believes Jon is Ned\'s bastard' });
  await db.truthLayers.add({ factId: fact1, layer: 'reader', description: 'Revealed through Bran\'s visions' });

  // ========== MAGIC RULES ==========
  await db.rules.add({ system: 'Warging', rule: 'A warg can only enter the mind of an animal they have bonded with', category: 'limitation' });
  await db.rules.add({ system: 'Warging', rule: 'Warging into a human is considered an abomination', category: 'cost' });
  await db.rules.add({ system: 'Warging', rule: 'The warg\'s body is vulnerable while their consciousness is elsewhere', category: 'cost' });
  await db.rules.add({ system: 'Dragons', rule: 'Dragons bond with a single rider for life', category: 'limitation' });
  await db.rules.add({ system: 'Dragons', rule: 'Dragons can only be controlled by those with Valyrian blood', category: 'source', exceptions: 'Night King controlled undead Viserion' });
  await db.rules.add({ system: 'Resurrection', rule: 'The Lord of Light can resurrect the dead through R\'hllor priests', category: 'source' });
  await db.rules.add({ system: 'Resurrection', rule: 'Each resurrection takes something from the person', category: 'cost' });
  await db.rules.add({ system: 'Faceless Men', rule: 'A Faceless Man must give up their identity to serve', category: 'cost' });
  await db.rules.add({ system: 'Faceless Men', rule: 'Cannot kill someone they know personally', category: 'limitation' });

  // ========== THEMES ==========
  const theme1 = await db.themes.add({ name: 'Power Corrupts', description: 'Those who seek power are often destroyed by it', color: '#ef4444' });
  const theme2 = await db.themes.add({ name: 'Family vs Duty', description: 'The conflict between personal loyalty and greater responsibility', color: '#3b82f6' });
  const theme3 = await db.themes.add({ name: 'Identity', description: 'Characters discovering or hiding their true selves', color: '#8b5cf6' });
  await db.themeOccurrences.add({ themeId: theme1, entityId: cersei });
  await db.themeOccurrences.add({ themeId: theme1, entityId: daenerys });
  await db.themeOccurrences.add({ themeId: theme2, entityId: eddard });
  await db.themeOccurrences.add({ themeId: theme2, entityId: jon });
  await db.themeOccurrences.add({ themeId: theme3, entityId: arya });
  await db.themeOccurrences.add({ themeId: theme3, entityId: jon });

  // ========== DIALOGUES ==========
  await db.dialogues.add({ participants: [eddard, cersei], summary: 'Ned confronts Cersei about her children\'s parentage and gives her a chance to flee', importance: 'critical', tags: 'confrontation, warning' });
  await db.dialogues.add({ participants: [tyrion, jon], summary: 'Tyrion advises Jon to wear his bastard status as armor', importance: 'major', tags: 'advice, bonding' });
  await db.dialogues.add({ participants: [petyr, varys], summary: 'Littlefinger and Varys spar verbally about chaos and power', importance: 'major', tags: 'philosophy, rivalry' });
  await db.dialogues.add({ participants: [tywin, tyrion], summary: 'Tywin tells Tyrion he wanted to drown him at birth', importance: 'critical', tags: 'family, cruelty' });

  // ========== BESTIARY ==========
  await db.creatures.add({ name: 'Direwolf', type: 'beast', habitat: 'The North, beyond the Wall', description: 'Larger cousins of wolves, once thought extinct south of the Wall. The sigil of House Stark.', abilities: 'Enhanced strength, speed, and intelligence. Can bond with wargs.' });
  await db.creatures.add({ name: 'Dragon', type: 'magical', habitat: 'Valyria (extinct), Essos', description: 'Fire-breathing reptiles of immense size and power. The source of Targaryen dominance.', abilities: 'Flight, firebreathing, near-impervious scales' });
  await db.creatures.add({ name: 'Wight', type: 'monster', habitat: 'Beyond the Wall', description: 'Reanimated corpses controlled by the White Walkers.', abilities: 'Tireless, feels no pain, can only be killed by fire or dragonglass', isSpoiler: true });
  await db.creatures.add({ name: 'Giant', type: 'beast', habitat: 'Beyond the Wall', description: 'Massive humanoids standing 10-14 feet tall.', abilities: 'Immense strength, can ride mammoths' });
  await db.creatures.add({ name: 'Kraken', type: 'beast', habitat: 'The seas around the Iron Islands', description: 'Legendary sea creature, sigil of House Greyjoy. May or may not exist.', abilities: 'Can sink ships, massive tentacles' });
  await db.creatures.add({ name: 'Shadowcat', type: 'beast', habitat: 'Mountains of the Vale and North', description: 'Large predatory cats with black fur.', abilities: 'Stealth, climbing' });

  // ========== LANGUAGES ==========
  const valyrian = await db.languages.add({ 
    name: 'High Valyrian', 
    description: 'Ancient language of the Valyrian Freehold. Used in formal contexts and magic.',
    phonology: 'Vowel length distinction, palatalization, stress on penultimate syllable',
    grammar: 'Four grammatical genders (lunar, solar, terrestrial, aquatic). Highly inflected.'
  });
  const dothraki = await db.languages.add({ 
    name: 'Dothraki', 
    description: 'Language of the Dothraki horse lords of the eastern plains.',
    phonology: 'No initial consonant clusters. Vowel harmony.',
    grammar: 'Animacy-based noun classification. Verb agrees with subject.'
  });

  await db.vocabulary.add({ languageId: valyrian, word: 'Valar morghulis', meaning: 'All men must die', partOfSpeech: 'phrase' });
  await db.vocabulary.add({ languageId: valyrian, word: 'Valar dohaeris', meaning: 'All men must serve', partOfSpeech: 'phrase' });
  await db.vocabulary.add({ languageId: valyrian, word: 'dracarys', meaning: 'dragonfire', pronunciation: 'dra-KA-ris', partOfSpeech: 'noun' });
  await db.vocabulary.add({ languageId: valyrian, word: 'zaldrīzes', meaning: 'dragon', partOfSpeech: 'noun' });
  await db.vocabulary.add({ languageId: dothraki, word: 'khaleesi', meaning: 'queen, wife of khal', pronunciation: 'kah-LEE-see', partOfSpeech: 'noun' });
  await db.vocabulary.add({ languageId: dothraki, word: 'arakh', meaning: 'curved sword', partOfSpeech: 'noun' });
  await db.vocabulary.add({ languageId: dothraki, word: 'Dothrak', meaning: 'to ride', partOfSpeech: 'verb' });

  // ========== TRAVEL DISTANCES ==========
  await db.travelDistances.add({ fromLocationId: winterfell, toLocationId: kingsLanding, distance: 30, unit: 'days', method: 'horse' });
  await db.travelDistances.add({ fromLocationId: winterfell, toLocationId: castleBlack, distance: 14, unit: 'days', method: 'horse' });
  await db.travelDistances.add({ fromLocationId: kingsLanding, toLocationId: theTwins, distance: 20, unit: 'days', method: 'horse' });
  await db.travelDistances.add({ fromLocationId: winterfell, toLocationId: theTwins, distance: 15, unit: 'days', method: 'horse' });
  await db.travelDistances.add({ fromLocationId: dragonstone, toLocationId: kingsLanding, distance: 2, unit: 'days', method: 'ship' });

  // ========== PLOT BEATS (Save the Cat structure) ==========
  await db.plotBeats.add({ beatType: 'opening', title: 'White Walkers Attack', description: 'Prologue shows the threat beyond the Wall', order: 1, status: 'complete' });
  await db.plotBeats.add({ beatType: 'setup', title: 'Stark Family Introduction', description: 'Meet the Starks in Winterfell', order: 2, status: 'complete' });
  await db.plotBeats.add({ beatType: 'catalyst', title: 'The King Comes to Winterfell', description: 'Robert asks Ned to be Hand', order: 3, status: 'complete' });
  await db.plotBeats.add({ beatType: 'debate', title: "Ned's Decision", description: 'Should Ned leave Winterfell?', order: 4, status: 'complete' });
  await db.plotBeats.add({ beatType: 'break-into-2', title: 'Journey South', description: 'The Starks split up, adventure begins', order: 5, status: 'complete' });
  await db.plotBeats.add({ beatType: 'midpoint', title: "Ned Discovers the Truth", description: 'Realizes Joffrey isn\'t Robert\'s son', order: 6, status: 'complete' });
  await db.plotBeats.add({ beatType: 'all-is-lost', title: "Ned's Execution", description: 'Joffrey orders Ned killed', order: 7, status: 'complete' });

  // ========== NAMING RULES ==========
  await db.namingRules.add({ culture: 'Stark/Northern', pattern: 'Short, harsh sounds', examples: 'Ned, Robb, Bran, Arya, Rickon', notes: 'Simple names, often one syllable. Old First Men tradition.' });
  await db.namingRules.add({ culture: 'Lannister/Westerlands', pattern: 'Ty- prefix common', examples: 'Tywin, Tyrion, Tytos, Tygett', notes: 'Roman-inspired names. J- names for some (Jaime, Joanna, Joffrey).' });
  await db.namingRules.add({ culture: 'Targaryen', pattern: 'Ae- prefix, -rys/-gon suffixes', examples: 'Aegon, Aerys, Aemon, Daenerys, Rhaegar', notes: 'Valyrian names. Repeating names across generations.' });
  await db.namingRules.add({ culture: 'Dothraki', pattern: 'Harsh consonants, -o endings', examples: 'Drogo, Rakharo, Kovarro, Jhogo', notes: 'Warrior-sounding names.' });

  // ========== FRAME NARRATIVES ==========
  await db.frames.add({ projectId: 1, name: 'Main Timeline', description: 'Events as they occur in the present day', timelineStart: 297, timelineEnd: 305, order: 1 });
  await db.frames.add({ projectId: 1, name: "Robert's Rebellion Flashbacks", description: 'Events from the rebellion, shown through memories and stories', timelineStart: 280, timelineEnd: 283, parentFrameId: 1, order: 2 });
  await db.frames.add({ projectId: 1, name: "Bran's Visions", description: 'Scenes witnessed through greensight - Tower of Joy, past events', timelineStart: 1, timelineEnd: 305, parentFrameId: 1, order: 3 });

  // ========== POETRY & SONGS ==========
  await db.poems.add({ projectId: 1, title: 'The Rains of Castamere', type: 'song', content: 'And who are you, the proud lord said,\nthat I must bow so low?\nOnly a cat of a different coat,\nthat\'s all the truth I know.\n\nIn a coat of gold or a coat of red,\na lion still has claws,\nAnd mine are long and sharp, my lord,\nas long and sharp as yours.', performedBy: tyrion });
  await db.poems.add({ projectId: 1, title: 'The Bear and the Maiden Fair', type: 'song', content: 'A bear there was, a bear, a bear!\nall black and brown, and covered with hair.\nThe bear! The bear!\n\nOh come they said, oh come to the fair!\nThe fair? Said he, but I\'m a bear!\nAll black and brown, and covered with hair!' });
  await db.poems.add({ projectId: 1, title: 'Jenny\'s Song', type: 'song', content: 'High in the halls of the kings who are gone\nJenny would dance with her ghosts...' });
  await db.poems.add({ projectId: 1, title: 'The Night\'s Watch Oath', type: 'chant', content: 'Night gathers, and now my watch begins.\nIt shall not end until my death.\nI shall take no wife, hold no lands, father no children.\nI shall wear no crowns and win no glory.\nI shall live and die at my post.\nI am the sword in the darkness.\nI am the watcher on the walls.\nI am the fire that burns against the cold,\nthe light that brings the dawn,\nthe horn that wakes the sleepers,\nthe shield that guards the realms of men.' });
  await db.poems.add({ projectId: 1, title: 'The Prince That Was Promised', type: 'prophecy', content: 'When the red star bleeds and the darkness gathers,\nAzor Ahai shall be born again amidst smoke and salt\nto wake dragons out of stone.' });

  // ========== CURRENCY ==========
  await db.currencies.add({ projectId: 1, name: 'Gold Dragon', symbol: '🪙', baseValue: 100, description: 'Standard gold coin of the Seven Kingdoms' });
  await db.currencies.add({ projectId: 1, name: 'Silver Stag', symbol: '🥈', baseValue: 10, description: '7 Silver Stags = 1 Gold Dragon' });
  await db.currencies.add({ projectId: 1, name: 'Copper Penny', symbol: '🪙', baseValue: 1, description: '56 Copper = 1 Silver Stag' });
  await db.currencies.add({ projectId: 1, name: 'Copper Star', symbol: '⭐', baseValue: 0.125, description: '8 Stars = 1 Penny' });

  // ========== WRITING GOALS ==========
  await db.writingGoals.add({ type: 'manuscript', target: 300000, current: 8500, status: 'active' });
  await db.writingGoals.add({ type: 'daily', target: 2000, current: 0, status: 'active' });

  // ========== ARC POINTS (Character development) ==========
  await db.arcPoints.add({ entityId: eddard, year: 297, value: 80, dimension: 'power' });
  await db.arcPoints.add({ entityId: eddard, year: 298, value: 90, dimension: 'power' });
  await db.arcPoints.add({ entityId: eddard, year: 298, value: 0, dimension: 'power' }); // death
  await db.arcPoints.add({ entityId: daenerys, year: 297, value: 10, dimension: 'power' });
  await db.arcPoints.add({ entityId: daenerys, year: 298, value: 30, dimension: 'power' });
  await db.arcPoints.add({ entityId: daenerys, year: 300, value: 60, dimension: 'power' });
  await db.arcPoints.add({ entityId: daenerys, year: 304, value: 95, dimension: 'power' });
  await db.arcPoints.add({ entityId: jon, year: 298, value: 20, dimension: 'power' });
  await db.arcPoints.add({ entityId: jon, year: 302, value: 50, dimension: 'power' });
  await db.arcPoints.add({ entityId: jon, year: 304, value: 85, dimension: 'power' });

  // Update factions with heraldry
  await db.entities.update(houseStark, { heraldry: 'A grey direwolf on an ice-white field', motto: 'Winter is Coming' });
  await db.entities.update(houseLannister, { heraldry: 'A golden lion on a crimson field', motto: 'Hear Me Roar' });
  await db.entities.update(houseBaratheon, { heraldry: 'A crowned black stag on a gold field', motto: 'Ours is the Fury' });
  await db.entities.update(houseTargaryen, { heraldry: 'A three-headed red dragon on black', motto: 'Fire and Blood' });

  // Update some characters with voice notes and arc closures
  await db.entities.update(eddard, { 
    voiceNotes: 'Speaks formally, rarely jokes. Northern accent. Often says "Winter is Coming" as both warning and philosophy.',
    arcClosure: 'His investigation of Jon Arryn\'s death dies with him. The truth about Cersei\'s children remains hidden longer. His honor was his downfall.',
    lastWords: 'Baelor... (whispered, thought to be a prayer)'
  });
  await db.entities.update(tyrion, { 
    voiceNotes: 'Witty, sardonic. Uses humor as a shield. Drinks and knows things. Often quotes himself.'
  });

  // ========== PERSONALITY DATA ==========
  await db.personalities.add({
    entityId: tyrion,
    openness: 85,
    conscientiousness: 45,
    extraversion: 70,
    agreeableness: 55,
    neuroticism: 40,
    values: { power: 30, achievement: 75, hedonism: 80, selfdirection: 90, benevolence: 60 },
    motivations: ['Knowledge', 'Survival', 'Love']
  });

  await db.personalities.add({
    entityId: eddard,
    openness: 35,
    conscientiousness: 95,
    extraversion: 40,
    agreeableness: 75,
    neuroticism: 25,
    values: { tradition: 90, conformity: 85, security: 80, benevolence: 85, universalism: 70 },
    motivations: ['Duty', 'Family', 'Justice']
  });

  await db.personalities.add({
    entityId: cersei,
    openness: 30,
    conscientiousness: 70,
    extraversion: 60,
    agreeableness: 15,
    neuroticism: 75,
    values: { power: 95, security: 90, achievement: 70 },
    motivations: ['Power', 'Family', 'Revenge']
  });

  await db.personalities.add({
    entityId: jon,
    openness: 50,
    conscientiousness: 80,
    extraversion: 35,
    agreeableness: 70,
    neuroticism: 55,
    values: { benevolence: 85, universalism: 75, tradition: 60, conformity: 50 },
    motivations: ['Duty', 'Justice', 'Love']
  });

  await db.personalities.add({
    entityId: arya,
    openness: 75,
    conscientiousness: 55,
    extraversion: 45,
    agreeableness: 30,
    neuroticism: 50,
    values: { stimulation: 85, selfdirection: 90, power: 40 },
    motivations: ['Revenge', 'Freedom', 'Survival']
  });

  await db.personalities.add({
    entityId: daenerys,
    openness: 70,
    conscientiousness: 75,
    extraversion: 75,
    agreeableness: 50,
    neuroticism: 60,
    values: { power: 85, universalism: 80, achievement: 75, benevolence: 65 },
    motivations: ['Justice', 'Power', 'Legacy']
  });

  // ========== DIALOGUE TREE SAMPLE ==========
  const dialogueRoot = await db.dialogueNodes.add({
    projectId: 1,
    characterId: tyrion,
    text: "Ah, a visitor. What brings you to King's Landing?",
    isPlayerChoice: false,
    isRoot: true,
    order: 1
  });

  const playerChoice1 = await db.dialogueNodes.add({
    projectId: 1,
    text: "I seek your counsel on a matter of great importance.",
    isPlayerChoice: true,
    parentId: dialogueRoot,
    order: 2
  });

  const playerChoice2 = await db.dialogueNodes.add({
    projectId: 1,
    text: "I hear you know things. Prove it.",
    isPlayerChoice: true,
    parentId: dialogueRoot,
    order: 3
  });

  await db.dialogueNodes.add({
    projectId: 1,
    characterId: tyrion,
    text: "Counsel is cheap here, but wine is expensive. Let's start with the wine.",
    isPlayerChoice: false,
    parentId: playerChoice1,
    order: 4
  });

  await db.dialogueNodes.add({
    projectId: 1,
    characterId: tyrion,
    text: "I know you're testing me. I also know you can't afford the answers you want.",
    isPlayerChoice: false,
    parentId: playerChoice2,
    order: 5
  });

  // ========== ARC TYPES ==========
  await db.arcTypes.add({ projectId: 1, name: 'Redemption', pattern: 'villain→crisis→change→hero', description: 'A character transforms from antagonist to protagonist through moral growth' });
  await db.arcTypes.add({ projectId: 1, name: 'Tragedy', pattern: 'noble→flaw→downfall→death', description: 'A noble character is brought low by their own flaws' });
  await db.arcTypes.add({ projectId: 1, name: 'Rise to Power', pattern: 'nobody→struggle→victory→ruler', description: 'An underdog rises to a position of power' });

  // Store arc assignments in local storage will be done by user

  // Add some character avatars
  await db.entities.update(eddard, { avatar: 'https://static.wikia.nocookie.net/gameofthrones/images/3/37/Eddard_Stark.jpg' });
  await db.entities.update(tyrion, { avatar: 'https://static.wikia.nocookie.net/gameofthrones/images/5/5f/Tyrion_S8_EW.jpg' });
  await db.entities.update(daenerys, { avatar: 'https://static.wikia.nocookie.net/gameofthrones/images/b/bc/Daenerys_Targaryen_S8.jpg' });
  await db.entities.update(jon, { avatar: 'https://static.wikia.nocookie.net/gameofthrones/images/4/4c/Jon_Snow_S8_Promo.jpg' });

  // Add creature avatars
  await db.creatures.bulkPut([
    { id: 1, avatar: 'https://static.wikia.nocookie.net/gameofthrones/images/8/8f/Direwolf_sigil.png' }
  ]).catch(() => {}); // Ignore if doesn't exist

  console.log('Game of Thrones data seeded with full examples!');
}
