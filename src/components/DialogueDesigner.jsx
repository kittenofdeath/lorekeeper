import { useState, useEffect } from 'react';
import { 
  getDialogueNodes, createDialogueNode, updateDialogueNode, deleteDialogueNode,
  getDialogueChoices, createDialogueChoice, deleteDialogueChoice, getActiveProject
} from '../db';
import { MessageCircle, Plus, X, User, ChevronRight, ArrowRight, Trash2 } from 'lucide-react';

export default function DialogueDesigner({ entities }) {
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [choices, setChoices] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const characters = entities.filter(e => e.type === 'character');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedNode) {
      loadChoices(selectedNode.id);
    }
  }, [selectedNode]);

  async function loadData() {
    const project = await getActiveProject();
    if (project) {
      setProjectId(project.id);
      const n = await getDialogueNodes(project.id);
      setNodes(n);
    }
  }

  async function loadChoices(nodeId) {
    const c = await getDialogueChoices(nodeId);
    setChoices(c);
  }

  async function handleCreateNode(isPlayerChoice = false, parentId = null) {
    if (!projectId) return;
    const id = await createDialogueNode({
      projectId,
      text: isPlayerChoice ? 'Player choice...' : 'NPC dialogue...',
      isPlayerChoice,
      isRoot: !parentId,
      parentId,
      order: nodes.length + 1
    });
    loadData();
    setSelectedNode({ id, text: '', isPlayerChoice, parentId });
  }

  async function handleUpdateNode(id, updates) {
    await updateDialogueNode(id, updates);
    if (selectedNode?.id === id) {
      setSelectedNode({ ...selectedNode, ...updates });
    }
    loadData();
  }

  async function handleDeleteNode(id) {
    if (confirm('Delete this node and all its choices?')) {
      await deleteDialogueNode(id);
      if (selectedNode?.id === id) setSelectedNode(null);
      loadData();
    }
  }

  async function handleAddChoice(nodeId) {
    await createDialogueChoice({ nodeId, text: 'Choice option...', nextNodeId: null });
    loadChoices(nodeId);
  }

  async function handleDeleteChoice(id) {
    await deleteDialogueChoice(id);
    loadChoices(selectedNode.id);
  }

  function getCharName(id) {
    return characters.find(c => c.id === id)?.name || 'Unknown';
  }

  function getNodeById(id) {
    return nodes.find(n => n.id === id);
  }

  const rootNodes = nodes.filter(n => n.isRoot);
  const childNodes = (parentId) => nodes.filter(n => n.parentId === parentId);

  function NodeTree({ node, depth = 0 }) {
    const children = childNodes(node.id);
    const nodeChoices = choices.filter(c => c.nodeId === node.id);

    return (
      <div style={{ marginLeft: depth * 16 }} className="mb-2">
        <div
          onClick={() => setSelectedNode(node)}
          className={`p-2 rounded cursor-pointer flex items-center gap-2 ${
            selectedNode?.id === node.id 
              ? 'bg-amber-500/20 border border-amber-500/30' 
              : node.isPlayerChoice ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-gray-800 border border-gray-700'
          }`}
        >
          {node.isPlayerChoice ? (
            <User className="w-4 h-4 text-blue-400" />
          ) : (
            <MessageCircle className="w-4 h-4 text-green-400" />
          )}
          <span className="text-sm flex-1 truncate">
            {node.characterId && <span className="text-gray-400">[{getCharName(node.characterId)}] </span>}
            {node.text?.slice(0, 40)}...
          </span>
          <button onClick={e => { e.stopPropagation(); handleDeleteNode(node.id); }} className="p-1 hover:bg-gray-700 rounded">
            <Trash2 className="w-3 h-3 text-gray-500" />
          </button>
        </div>
        {children.map(child => (
          <NodeTree key={child.id} node={child} depth={depth + 1} />
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-amber-400" />
          Dialogue Designer
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleCreateNode(false)}
            className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
          >
            <Plus className="w-3 h-3" /> NPC Line
          </button>
          <button
            onClick={() => handleCreateNode(true)}
            className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
          >
            <Plus className="w-3 h-3" /> Player Choice
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Tree View */}
        <div className="w-80 overflow-auto border-r border-gray-700 pr-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Dialogue Tree</h3>
          {rootNodes.length === 0 ? (
            <p className="text-sm text-gray-500">No dialogue nodes yet</p>
          ) : (
            rootNodes.map(node => <NodeTree key={node.id} node={node} />)
          )}
        </div>

        {/* Node Editor */}
        {selectedNode ? (
          <div className="flex-1 overflow-auto">
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                {selectedNode.isPlayerChoice ? (
                  <span className="text-sm text-blue-400">Player Choice</span>
                ) : (
                  <span className="text-sm text-green-400">NPC Dialogue</span>
                )}
              </div>

              {!selectedNode.isPlayerChoice && (
                <div className="mb-3">
                  <label className="block text-xs text-gray-400 mb-1">Speaking Character</label>
                  <select
                    value={selectedNode.characterId || ''}
                    onChange={e => handleUpdateNode(selectedNode.id, { characterId: e.target.value ? Number(e.target.value) : null })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  >
                    <option value="">Select character...</option>
                    {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-1">Dialogue Text</label>
                <textarea
                  value={selectedNode.text || ''}
                  onChange={e => handleUpdateNode(selectedNode.id, { text: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm resize-none"
                  rows={4}
                  placeholder={selectedNode.isPlayerChoice ? 'What does the player say?' : 'What does the NPC say?'}
                />
              </div>

              {/* Choices (for NPC nodes leading to player choices) */}
              {!selectedNode.isPlayerChoice && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-400">Response Options</label>
                    <button
                      onClick={() => handleAddChoice(selectedNode.id)}
                      className="text-xs text-amber-400"
                    >
                      + Add Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {choices.filter(c => c.nodeId === selectedNode.id).map(choice => (
                      <div key={choice.id} className="flex items-center gap-2 p-2 bg-gray-700/50 rounded">
                        <ArrowRight className="w-3 h-3 text-gray-500" />
                        <input
                          type="text"
                          value={choice.text}
                          onChange={e => {/* update choice */}}
                          className="flex-1 bg-transparent border-b border-gray-600 text-sm focus:outline-none"
                        />
                        <select
                          value={choice.nextNodeId || ''}
                          onChange={e => {/* update next node */}}
                          className="bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-xs"
                        >
                          <option value="">→ End</option>
                          {nodes.filter(n => n.id !== selectedNode.id).map(n => (
                            <option key={n.id} value={n.id}>{n.text?.slice(0, 20)}...</option>
                          ))}
                        </select>
                        <button onClick={() => handleDeleteChoice(choice.id)} className="text-gray-500 hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add child node buttons */}
              <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
                <button
                  onClick={() => handleCreateNode(false, selectedNode.id)}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                >
                  <Plus className="w-3 h-3" /> Add NPC Response
                </button>
                <button
                  onClick={() => handleCreateNode(true, selectedNode.id)}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                >
                  <Plus className="w-3 h-3" /> Add Player Option
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a node to edit or create a new dialogue
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
        <p>💡 <span className="text-green-400">Green</span> = NPC dialogue | <span className="text-blue-400">Blue</span> = Player choice</p>
      </div>
    </div>
  );
}
