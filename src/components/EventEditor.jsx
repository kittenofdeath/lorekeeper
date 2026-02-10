import { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus, UserPlus } from 'lucide-react';
import { 
  getEvent, createEvent, updateEvent, deleteEvent,
  getEventParticipants, addEventParticipant, removeEventParticipant
} from '../db';

const participantRoles = [
  { value: 'present', label: 'Present' },
  { value: 'affected', label: 'Affected' },
  { value: 'orchestrated', label: 'Orchestrated' },
  { value: 'mentioned', label: 'Mentioned' },
];

export default function EventEditor({ eventId, onClose, onSave, allEntities }) {
  const [event, setEvent] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    locationId: null,
    tags: [],
    isSpoiler: false
  });
  const [participants, setParticipants] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipant, setNewParticipant] = useState({ entityId: '', role: 'present' });

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  async function loadEvent() {
    const e = await getEvent(eventId);
    if (e) {
      setEvent(e);
      const parts = await getEventParticipants(eventId);
      setParticipants(parts);
    }
  }

  async function handleSave() {
    const data = {
      ...event,
      startDate: event.startDate ? Number(event.startDate) : null,
      endDate: event.endDate ? Number(event.endDate) : null,
      locationId: event.locationId ? Number(event.locationId) : null,
    };
    
    if (eventId) {
      await updateEvent(eventId, data);
    } else {
      await createEvent(data);
    }
    onSave();
  }

  async function handleDelete() {
    if (confirm('Delete this event?')) {
      await deleteEvent(eventId);
      onClose();
    }
  }

  function addTag() {
    if (newTag.trim() && !(event.tags || []).includes(newTag.trim())) {
      setEvent({
        ...event,
        tags: [...(event.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  }

  function removeTag(tag) {
    setEvent({
      ...event,
      tags: (event.tags || []).filter(t => t !== tag)
    });
  }

  async function addParticipantToEvent() {
    if (newParticipant.entityId && eventId) {
      await addEventParticipant(eventId, Number(newParticipant.entityId), newParticipant.role);
      setNewParticipant({ entityId: '', role: 'present' });
      setShowAddParticipant(false);
      const parts = await getEventParticipants(eventId);
      setParticipants(parts);
    }
  }

  async function removeParticipantFromEvent(partId) {
    await removeEventParticipant(partId);
    const parts = await getEventParticipants(eventId);
    setParticipants(parts);
  }

  function getEntityName(id) {
    const e = allEntities.find(x => x.id === id);
    return e ? e.name : `Entity #${id}`;
  }

  const locations = allEntities.filter(e => e.type === 'location');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">
          {eventId ? 'Edit' : 'New'} Event
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
          <input
            type="text"
            value={event.title}
            onChange={e => setEvent({ ...event, title: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
            placeholder="Event title..."
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Start Year</label>
            <input
              type="number"
              value={event.startDate || ''}
              onChange={e => setEvent({ ...event, startDate: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">End Year (optional)</label>
            <input
              type="number"
              value={event.endDate || ''}
              onChange={e => setEvent({ ...event, endDate: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
          <select
            value={event.locationId || ''}
            onChange={e => setEvent({ ...event, locationId: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            <option value="">No location</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
          <textarea
            value={event.description || ''}
            onChange={e => setEvent({ ...event, description: e.target.value })}
            rows={4}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 resize-none"
            placeholder="What happened..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(event.tags || []).map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-sm">
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-red-400">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag()}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500"
              placeholder="Add tag..."
            />
            <button onClick={addTag} className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm">
              Add
            </button>
          </div>
        </div>

        {/* Spoiler */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={event.isSpoiler || false}
            onChange={e => setEvent({ ...event, isSpoiler: e.target.checked })}
            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm">Mark as Spoiler</span>
        </label>

        {/* Participants (only if editing existing) */}
        {eventId && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Participants</label>
              <button
                onClick={() => setShowAddParticipant(!showAddParticipant)}
                className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <UserPlus className="w-4 h-4" /> Add
              </button>
            </div>
            
            {showAddParticipant && (
              <div className="p-3 bg-gray-700 rounded-lg mb-3 space-y-2">
                <select
                  value={newParticipant.entityId}
                  onChange={e => setNewParticipant({ ...newParticipant, entityId: e.target.value })}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1.5 text-sm"
                >
                  <option value="">Select entity...</option>
                  {allEntities.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.type})</option>
                  ))}
                </select>
                <select
                  value={newParticipant.role}
                  onChange={e => setNewParticipant({ ...newParticipant, role: e.target.value })}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1.5 text-sm"
                >
                  {participantRoles.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <button
                  onClick={addParticipantToEvent}
                  className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded text-sm font-medium"
                >
                  Add Participant
                </button>
              </div>
            )}

            <div className="space-y-2">
              {participants.length === 0 ? (
                <p className="text-sm text-gray-500">No participants yet</p>
              ) : (
                participants.map(part => (
                  <div key={part.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <div className="text-sm">
                      <span className="text-white">{getEntityName(part.entityId)}</span>
                      <span className="text-gray-400"> — {part.role}</span>
                    </div>
                    <button
                      onClick={() => removeParticipantFromEvent(part.id)}
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

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-lg font-medium"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          {eventId && (
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
