import { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus, Link } from 'lucide-react';
import { 
  getEntity, createEntity, updateEntity, deleteEntity,
  getRelationshipsForEntity, createRelationship, deleteRelationship,
  getEventsForEntity
} from '../db';

const relationshipTypes = [
  { value: 'family', label: 'Family' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'ally', label: 'Ally' },
  { value: 'enemy', label: 'Enemy' },
  { value: 'member', label: 'Member' },
  { value: 'controls', label: 'Controls' },
];

export default function EntityEditor({ entityId, entityType, onClose, onSave, allEntities }) {
  const [entity, setEntity] = useState({
    type: entityType,
    name: '',
    aliases: [],
    description: '',
    birthDate: '',
    deathDate: '',
    status: 'active',
    attributes: {},
    isSpoiler: false
  });
  const [relationships, setRelationships] = useState([]);
  const [events, setEvents] = useState([]);
  const [newAlias, setNewAlias] = useState('');
  const [showAddRelationship, setShowAddRelationship] = useState(false);
  const [newRel, setNewRel] = useState({ targetId: '', type: 'ally', subtype: '' });

  useEffect(() => {
    if (entityId) {
      loadEntity();
    }
  }, [entityId]);

  async function loadEntity() {
    const e = await getEntity(entityId);
    if (e) {
      setEntity(e);
      const rels = await getRelationshipsForEntity(entityId);
      setRelationships(rels);
      const evts = await getEventsForEntity(entityId);
      setEvents(evts);
    }
  }

  async function handleSave() {
    const data = {
      ...entity,
      birthDate: entity.birthDate ? Number(entity.birthDate) : null,
      deathDate: entity.deathDate ? Number(entity.deathDate) : null,
    };
    
    if (entityId) {
      await updateEntity(entityId, data);
    } else {
      await createEntity(data);
    }
    onSave();
  }

  async function handleDelete() {
    if (confirm('Delete this entity? This will also remove all relationships and event participations.')) {
      await deleteEntity(entityId);
      onClose();
    }
  }

  function addAlias() {
    if (newAlias.trim()) {
      setEntity({
        ...entity,
        aliases: [...(entity.aliases || []), newAlias.trim()]
      });
      setNewAlias('');
    }
  }

  function removeAlias(index) {
    setEntity({
      ...entity,
      aliases: entity.aliases.filter((_, i) => i !== index)
    });
  }

  async function addRelationship() {
    if (newRel.targetId) {
      await createRelationship({
        sourceId: entityId,
        targetId: Number(newRel.targetId),
        type: newRel.type,
        subtype: newRel.subtype
      });
      setNewRel({ targetId: '', type: 'ally', subtype: '' });
      setShowAddRelationship(false);
      const rels = await getRelationshipsForEntity(entityId);
      setRelationships(rels);
    }
  }

  async function removeRelationship(relId) {
    await deleteRelationship(relId);
    const rels = await getRelationshipsForEntity(entityId);
    setRelationships(rels);
  }

  function getEntityName(id) {
    const e = allEntities.find(x => x.id === id);
    return e ? e.name : `Entity #${id}`;
  }

  function getOtherId(rel) {
    return rel.sourceId === entityId ? rel.targetId : rel.sourceId;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">
          {entityId ? 'Edit' : 'New'} {entityType}
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
          <input
            type="text"
            value={entity.name}
            onChange={e => setEntity({ ...entity, name: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
            placeholder="Enter name..."
          />
        </div>

        {/* Aliases */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Aliases</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(entity.aliases || []).map((alias, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-sm">
                {alias}
                <button onClick={() => removeAlias(i)} className="hover:text-red-400">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAlias}
              onChange={e => setNewAlias(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addAlias()}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500"
              placeholder="Add alias..."
            />
            <button onClick={addAlias} className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm">
              Add
            </button>
          </div>
        </div>

        {/* Birth/Death Dates (for characters) */}
        {entityType === 'character' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Born (Year)</label>
              <input
                type="number"
                value={entity.birthDate || ''}
                onChange={e => setEntity({ ...entity, birthDate: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Died (Year)</label>
              <input
                type="number"
                value={entity.deathDate || ''}
                onChange={e => setEntity({ ...entity, deathDate: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
          <select
            value={entity.status || 'active'}
            onChange={e => setEntity({ ...entity, status: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="deceased">Deceased</option>
            <option value="destroyed">Destroyed</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
          <textarea
            value={entity.description || ''}
            onChange={e => setEntity({ ...entity, description: e.target.value })}
            rows={4}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 resize-none"
            placeholder="Enter description..."
          />
        </div>

        {/* Spoiler */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={entity.isSpoiler || false}
            onChange={e => setEntity({ ...entity, isSpoiler: e.target.checked })}
            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm">Mark as Spoiler</span>
        </label>

        {/* Relationships (only if editing existing) */}
        {entityId && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Relationships</label>
              <button
                onClick={() => setShowAddRelationship(!showAddRelationship)}
                className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            
            {showAddRelationship && (
              <div className="p-3 bg-gray-700 rounded-lg mb-3 space-y-2">
                <select
                  value={newRel.targetId}
                  onChange={e => setNewRel({ ...newRel, targetId: e.target.value })}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1.5 text-sm"
                >
                  <option value="">Select entity...</option>
                  {allEntities.filter(e => e.id !== entityId).map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.type})</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <select
                    value={newRel.type}
                    onChange={e => setNewRel({ ...newRel, type: e.target.value })}
                    className="flex-1 bg-gray-600 border border-gray-500 rounded px-2 py-1.5 text-sm"
                  >
                    {relationshipTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newRel.subtype}
                    onChange={e => setNewRel({ ...newRel, subtype: e.target.value })}
                    placeholder="Subtype..."
                    className="flex-1 bg-gray-600 border border-gray-500 rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <button
                  onClick={addRelationship}
                  className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded text-sm font-medium"
                >
                  Add Relationship
                </button>
              </div>
            )}

            <div className="space-y-2">
              {relationships.length === 0 ? (
                <p className="text-sm text-gray-500">No relationships yet</p>
              ) : (
                relationships.map(rel => (
                  <div key={rel.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        <span className="text-gray-400">{rel.type}</span>
                        {rel.subtype && <span className="text-gray-500"> ({rel.subtype})</span>}
                        {' → '}
                        <span className="text-white">{getEntityName(getOtherId(rel))}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => removeRelationship(rel.id)}
                      className="p-1 hover:bg-gray-600 rounded"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Events (only if editing existing) */}
        {entityId && events.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Events</label>
            <div className="space-y-2">
              {events.map(evt => (
                <div key={evt.id} className="p-2 bg-gray-700 rounded text-sm">
                  <span className="text-gray-400">Year {evt.startDate}:</span>{' '}
                  <span>{evt.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-lg font-medium"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          {entityId && (
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
