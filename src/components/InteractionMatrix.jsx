import { useEffect, useState } from 'react';
import { getAllRelationships, getAllEvents, getEventParticipants } from '../db';
import { Users, Castle, X, ChevronDown } from 'lucide-react';

export default function InteractionMatrix({ entities, spoilerMode, onSelectEntity, onSelectEvent }) {
  const [relationships, setRelationships] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventParticipants, setEventParticipants] = useState({});
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [showSelector, setShowSelector] = useState(true);
  const [interactions, setInteractions] = useState([]);

  useEffect(() => {
    loadData();
  }, [spoilerMode]);

  useEffect(() => {
    if (selectedEntities.length >= 2) {
      calculateInteractions();
    } else {
      setInteractions([]);
    }
  }, [selectedEntities, relationships, events, eventParticipants]);

  async function loadData() {
    let rels = await getAllRelationships();
    if (!spoilerMode) {
      rels = rels.filter(r => !r.isSpoiler);
    }
    setRelationships(rels);

    let allEvents = await getAllEvents();
    if (!spoilerMode) {
      allEvents = allEvents.filter(e => !e.isSpoiler);
    }
    setEvents(allEvents);

    const parts = {};
    for (const evt of allEvents) {
      parts[evt.id] = await getEventParticipants(evt.id);
    }
    setEventParticipants(parts);
  }

  function toggleEntity(entityId) {
    if (selectedEntities.includes(entityId)) {
      setSelectedEntities(selectedEntities.filter(id => id !== entityId));
    } else {
      setSelectedEntities([...selectedEntities, entityId]);
    }
  }

  function calculateInteractions() {
    const selectedSet = new Set(selectedEntities);
    const result = [];

    // Find direct relationships between selected entities
    relationships.forEach(rel => {
      if (selectedSet.has(rel.sourceId) && selectedSet.has(rel.targetId)) {
        result.push({
          type: 'relationship',
          entities: [rel.sourceId, rel.targetId],
          relationType: rel.type,
          subtype: rel.subtype,
          data: rel
        });
      }
    });

    // Find shared events
    events.forEach(evt => {
      const parts = eventParticipants[evt.id] || [];
      const involvedSelected = parts.filter(p => selectedSet.has(p.entityId));
      
      if (involvedSelected.length >= 2) {
        result.push({
          type: 'event',
          entities: involvedSelected.map(p => p.entityId),
          eventTitle: evt.title,
          date: evt.startDate,
          roles: involvedSelected.reduce((acc, p) => {
            acc[p.entityId] = p.role;
            return acc;
          }, {}),
          data: evt
        });
      }
    });

    // Sort by date for events, relationships first
    result.sort((a, b) => {
      if (a.type === 'relationship' && b.type === 'event') return -1;
      if (a.type === 'event' && b.type === 'relationship') return 1;
      if (a.type === 'event' && b.type === 'event') {
        return (a.date || 0) - (b.date || 0);
      }
      return 0;
    });

    setInteractions(result);
  }

  function getEntityName(id) {
    const e = entities.find(x => x.id === id);
    return e ? e.name : `Entity #${id}`;
  }

  function getEntityColor(id) {
    const e = entities.find(x => x.id === id);
    if (!e) return 'bg-gray-500';
    switch (e.type) {
      case 'character': return 'bg-blue-500';
      case 'faction': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  }

  const characters = entities.filter(e => e.type === 'character');
  const factions = entities.filter(e => e.type === 'faction');

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Interaction Matrix</h2>
        <button
          onClick={() => setShowSelector(!showSelector)}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
        >
          Select Entities
          <ChevronDown className={`w-4 h-4 transition-transform ${showSelector ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Entity Selector */}
      {showSelector && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="mb-3">
            <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" /> Characters
            </h3>
            <div className="flex flex-wrap gap-2">
              {characters.map(entity => (
                <button
                  key={entity.id}
                  onClick={() => toggleEntity(entity.id)}
                  className={`px-2 py-1 rounded text-sm transition-colors ${
                    selectedEntities.includes(entity.id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {entity.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Castle className="w-4 h-4 text-yellow-400" /> Factions
            </h3>
            <div className="flex flex-wrap gap-2">
              {factions.map(entity => (
                <button
                  key={entity.id}
                  onClick={() => toggleEntity(entity.id)}
                  className={`px-2 py-1 rounded text-sm transition-colors ${
                    selectedEntities.includes(entity.id)
                      ? 'bg-yellow-500 text-gray-900'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {entity.name}
                </button>
              ))}
            </div>
          </div>
          {selectedEntities.length > 0 && (
            <button
              onClick={() => setSelectedEntities([])}
              className="mt-3 text-sm text-amber-400 hover:text-amber-300"
            >
              Clear selection
            </button>
          )}
        </div>
      )}

      {/* Selected Entities Pills */}
      {selectedEntities.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedEntities.map(id => (
            <span 
              key={id} 
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${getEntityColor(id)} text-white`}
            >
              {getEntityName(id)}
              <button onClick={() => toggleEntity(id)} className="hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Interactions List */}
      <div className="flex-1 overflow-auto">
        {selectedEntities.length < 2 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Select at least 2 entities to see their interactions</p>
          </div>
        ) : interactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No direct interactions found between selected entities</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-400 mb-4">
              Found {interactions.length} interaction{interactions.length !== 1 ? 's' : ''}
            </p>
            
            {interactions.map((interaction, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-lg border cursor-pointer hover:border-amber-500/50 transition-colors ${
                  interaction.type === 'relationship' 
                    ? 'bg-purple-500/10 border-purple-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}
                onClick={() => {
                  if (interaction.type === 'event') {
                    onSelectEvent(interaction.data.id);
                  }
                }}
              >
                {interaction.type === 'relationship' ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded">
                        RELATIONSHIP
                      </span>
                      <span className="text-sm text-gray-400">
                        {interaction.relationType}
                        {interaction.subtype && ` (${interaction.subtype})`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-blue-300 hover:text-blue-200 cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); onSelectEntity(interaction.entities[0]); }}
                      >
                        {getEntityName(interaction.entities[0])}
                      </span>
                      <span className="text-gray-500">↔</span>
                      <span 
                        className="text-blue-300 hover:text-blue-200 cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); onSelectEntity(interaction.entities[1]); }}
                      >
                        {getEntityName(interaction.entities[1])}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 bg-amber-500/30 text-amber-300 rounded">
                        EVENT
                      </span>
                      <span className="text-sm text-gray-400">Year {interaction.date}</span>
                    </div>
                    <h4 className="font-semibold text-amber-300 mb-2">{interaction.eventTitle}</h4>
                    <div className="flex flex-wrap gap-2">
                      {interaction.entities.map(entityId => (
                        <span 
                          key={entityId}
                          className="text-sm px-2 py-0.5 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                          onClick={(e) => { e.stopPropagation(); onSelectEntity(entityId); }}
                        >
                          {getEntityName(entityId)}
                          <span className="text-gray-400 ml-1">({interaction.roles[entityId]})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
