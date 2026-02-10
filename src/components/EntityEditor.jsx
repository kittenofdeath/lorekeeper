import { useState, useEffect, useRef } from 'react';
import { X, Save, Trash2, Plus, Link, Image, TrendingUp, Upload } from 'lucide-react';
import { 
  getEntity, createEntity, updateEntity, deleteEntity,
  getRelationshipsForEntity, createRelationship, deleteRelationship,
  getEventsForEntity, getMediaForEntity, addMedia, deleteMedia
} from '../db';

const relationshipTypes = [
  { value: 'family', label: 'Family' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'ally', label: 'Ally' },
  { value: 'enemy', label: 'Enemy' },
  { value: 'member', label: 'Member' },
  { value: 'controls', label: 'Controls' },
];

export default function EntityEditor({ entityId, entityType, onClose, onSave, allEntities, onShowArc }) {
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
  const [media, setMedia] = useState([]);
  const [newAlias, setNewAlias] = useState('');
  const [showAddRelationship, setShowAddRelationship] = useState(false);
  const [newRel, setNewRel] = useState({ targetId: '', type: 'ally', subtype: '' });
  const fileInputRef = useRef(null);

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
      const med = await getMediaForEntity(entityId);
      setMedia(med);
    }
  }

  async function handleMediaUpload(e) {
    const file = e.target.files[0];
    if (file && entityId) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        await addMedia({
          entityId,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          filename: file.name,
          data: event.target.result,
          mimeType: file.type
        });
        const med = await getMediaForEntity(entityId);
        setMedia(med);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleDeleteMedia(mediaId) {
    await deleteMedia(mediaId);
    const med = await getMediaForEntity(entityId);
    setMedia(med);
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
        <div className="flex items-center gap-2">
          {entityId && entityType === 'character' && onShowArc && (
            <button
              onClick={() => onShowArc(entity)}
              className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-sm hover:bg-amber-500/30"
            >
              <TrendingUp className="w-4 h-4" />
              Arc
            </button>
          )}
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Avatar */}
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
            {entity.avatar ? (
              <img src={entity.avatar} alt={entity.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl">
                {entity.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={entity.name}
              onChange={e => setEntity({ ...entity, name: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
              placeholder="Enter name..."
            />
            <input
              type="text"
              value={entity.avatar || ''}
              onChange={e => setEntity({ ...entity, avatar: e.target.value })}
              className="w-full mt-2 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500"
              placeholder="Avatar image URL..."
            />
          </div>
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
          <>
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
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Voice Notes</label>
              <textarea
                value={entity.voiceNotes || ''}
                onChange={e => setEntity({ ...entity, voiceNotes: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
                rows={2}
                placeholder="Speech patterns, verbal tics, accent, common phrases..."
              />
            </div>
            {/* Arc Closure (for deceased characters) */}
            {entity.deathDate && (
              <div className="p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                <label className="block text-sm font-medium text-gray-300 mb-1">Arc Closure</label>
                <textarea
                  value={entity.arcClosure || ''}
                  onChange={e => setEntity({ ...entity, arcClosure: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
                  rows={2}
                  placeholder="What storylines ended with this character? Unresolved plots?"
                />
                <input
                  type="text"
                  value={entity.lastWords || ''}
                  onChange={e => setEntity({ ...entity, lastWords: e.target.value })}
                  className="w-full mt-2 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  placeholder="Last words..."
                />
              </div>
            )}
          </>
        )}

        {/* Heraldry for factions */}
        {entityType === 'faction' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Heraldry / Sigil</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={entity.heraldry || ''}
                onChange={e => setEntity({ ...entity, heraldry: e.target.value })}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                placeholder="Describe: 'A grey direwolf on white' or paste image URL"
              />
            </div>
            <input
              type="text"
              value={entity.motto || ''}
              onChange={e => setEntity({ ...entity, motto: e.target.value })}
              className="w-full mt-2 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              placeholder="House words / Motto..."
            />
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

        {/* Media Gallery (only if editing existing) */}
        {entityId && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Image className="w-4 h-4" /> Media Gallery
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleMediaUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Upload className="w-4 h-4" /> Upload
              </button>
            </div>
            {media.length === 0 ? (
              <p className="text-sm text-gray-500">No media attached</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {media.map(m => (
                  <div key={m.id} className="relative group">
                    {m.type === 'image' && m.data && (
                      <img 
                        src={m.data} 
                        alt={m.filename}
                        className="w-full h-20 object-cover rounded"
                      />
                    )}
                    <button
                      onClick={() => handleDeleteMedia(m.id)}
                      className="absolute top-1 right-1 p-1 bg-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
