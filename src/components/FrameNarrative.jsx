import { useState, useEffect } from 'react';
import { getAllFrames, createFrame, updateFrame, deleteFrame, getActiveProject } from '../db';
import { Layers, Plus, X, ChevronRight, Edit2 } from 'lucide-react';

export default function FrameNarrative() {
  const [frames, setFrames] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newFrame, setNewFrame] = useState({ name: '', description: '', timelineStart: '', timelineEnd: '', parentFrameId: null });

  useEffect(() => {
    loadFrames();
  }, []);

  async function loadFrames() {
    const project = await getActiveProject();
    if (project) {
      setProjectId(project.id);
      const f = await getAllFrames(project.id);
      setFrames(f);
    }
  }

  async function handleCreate() {
    if (newFrame.name && projectId) {
      await createFrame({ ...newFrame, projectId });
      setNewFrame({ name: '', description: '', timelineStart: '', timelineEnd: '', parentFrameId: null });
      setShowAdd(false);
      loadFrames();
    }
  }

  async function handleUpdate(id, updates) {
    await updateFrame(id, updates);
    setEditingId(null);
    loadFrames();
  }

  async function handleDelete(id) {
    if (confirm('Delete this narrative frame?')) {
      await deleteFrame(id);
      loadFrames();
    }
  }

  // Build tree structure
  const rootFrames = frames.filter(f => !f.parentFrameId);
  const childFrames = (parentId) => frames.filter(f => f.parentFrameId === parentId);

  function FrameNode({ frame, depth = 0 }) {
    const children = childFrames(frame.id);
    const isEditing = editingId === frame.id;

    return (
      <div style={{ marginLeft: depth * 20 }}>
        <div className={`p-3 rounded-lg mb-2 ${depth === 0 ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-gray-800 border border-gray-700'}`}>
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={frame.name}
                onChange={e => handleUpdate(frame.id, { name: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
              />
              <textarea
                value={frame.description || ''}
                onChange={e => handleUpdate(frame.id, { description: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={frame.timelineStart || ''}
                  onChange={e => handleUpdate(frame.id, { timelineStart: Number(e.target.value) })}
                  placeholder="Start year"
                  className="w-24 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  value={frame.timelineEnd || ''}
                  onChange={e => handleUpdate(frame.id, { timelineEnd: Number(e.target.value) })}
                  placeholder="End year"
                  className="w-24 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                />
              </div>
              <button onClick={() => setEditingId(null)} className="text-sm text-gray-400">Done</button>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium flex items-center gap-1">
                  {depth > 0 && <ChevronRight className="w-3 h-3 text-gray-500" />}
                  {frame.name}
                </h4>
                {frame.description && <p className="text-sm text-gray-400 mt-1">{frame.description}</p>}
                {(frame.timelineStart || frame.timelineEnd) && (
                  <p className="text-xs text-gray-500 mt-1">
                    Timeline: {frame.timelineStart || '?'} - {frame.timelineEnd || '?'}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditingId(frame.id)} className="p-1 hover:bg-gray-700 rounded">
                  <Edit2 className="w-3 h-3 text-gray-400" />
                </button>
                <button onClick={() => handleDelete(frame.id)} className="p-1 hover:bg-gray-700 rounded">
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>
        {children.map(child => (
          <FrameNode key={child.id} frame={child} depth={depth + 1} />
        ))}
        {depth === 0 && (
          <button
            onClick={() => {
              setNewFrame({ ...newFrame, parentFrameId: frame.id });
              setShowAdd(true);
            }}
            className="ml-5 text-xs text-purple-400 hover:text-purple-300 mb-2"
          >
            + Add nested frame
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          Frame Narratives
        </h2>
        <button
          onClick={() => { setNewFrame({ name: '', description: '', timelineStart: '', timelineEnd: '', parentFrameId: null }); setShowAdd(!showAdd); }}
          className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${showAdd ? 'bg-amber-500 text-gray-900' : 'bg-gray-700'}`}
        >
          <Plus className="w-3 h-3" /> Add Frame
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Define nested narrative structures (e.g., Kvothe telling his story to Chronicler, which contains flashbacks within flashbacks).
      </p>

      {showAdd && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700 space-y-2">
          <input
            type="text"
            value={newFrame.name}
            onChange={e => setNewFrame({ ...newFrame, name: e.target.value })}
            placeholder="Frame name (e.g., 'Present Day - Waystone Inn')"
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
          />
          <textarea
            value={newFrame.description}
            onChange={e => setNewFrame({ ...newFrame, description: e.target.value })}
            placeholder="Description..."
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm resize-none"
            rows={2}
          />
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={newFrame.timelineStart}
              onChange={e => setNewFrame({ ...newFrame, timelineStart: e.target.value })}
              placeholder="Start year"
              className="w-24 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              value={newFrame.timelineEnd}
              onChange={e => setNewFrame({ ...newFrame, timelineEnd: e.target.value })}
              placeholder="End year"
              className="w-24 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            />
            {newFrame.parentFrameId && (
              <span className="text-xs text-purple-400">
                Nested in: {frames.find(f => f.id === newFrame.parentFrameId)?.name}
              </span>
            )}
          </div>
          <button onClick={handleCreate} className="px-3 py-1 bg-amber-500 text-gray-900 rounded text-sm">Create</button>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {rootFrames.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No narrative frames defined</p>
            <p className="text-sm">Create frames for nested storytelling</p>
          </div>
        ) : (
          rootFrames.map(frame => <FrameNode key={frame.id} frame={frame} />)
        )}
      </div>
    </div>
  );
}
