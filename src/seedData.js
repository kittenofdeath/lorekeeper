// Game of Thrones seed data
import { db, clearAllData, createEntity, createRelationship, createEvent, addEventParticipant } from './db';

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

  console.log('Game of Thrones data seeded!');
}
