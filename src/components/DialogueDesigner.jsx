import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  getDialogueNodes, createDialogueNode, updateDialogueNode, deleteDialogueNode,
  getDialogueChoices, createDialogueChoice, updateDialogueChoice, deleteDialogueChoice, getActiveProject
} from '../db';
import { MessageCircle, Plus, X, User, ArrowRight, Trash2, GitBranch, List } from 'lucide-react';

export default function DialogueDesigner({ entities }) {
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [choices, setChoices] = useState([]);
  const [allChoices, setAllChoices] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [viewMode, setViewMode] = useState('graph'); // 'tree' or 'graph'
  const svgRef = useRef(null);

  const characters = entities.filter(e => e.type === 'character');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedNode) {
      loadChoices(selectedNode.id);
    }
  }, [selectedNode]);

  useEffect(() => {
    if (viewMode === 'graph' && nodes.length > 0) {
      renderGraph();
    }
  }, [nodes, allChoices, viewMode, selectedNode]);

  async function loadData() {
    const project = await getActiveProject();
    if (project) {
      setProjectId(project.id);
      const n = await getDialogueNodes(project.id);
      setNodes(n);
      // Load all choices for graph view
      const allC = [];
      for (const node of n) {
        const c = await getDialogueChoices(node.id);
        allC.push(...c);
      }
      setAllChoices(allC);
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
    loadData();
  }

  async function handleUpdateChoice(id, updates) {
    await updateDialogueChoice(id, updates);
    loadChoices(selectedNode.id);
    loadData();
  }

  async function handleDeleteChoice(id) {
    await deleteDialogueChoice(id);
    loadChoices(selectedNode.id);
    loadData();
  }

  function getCharName(id) {
    return characters.find(c => c.id === id)?.name || 'Unknown';
  }

  const rootNodes = nodes.filter(n => n.isRoot);
  const childNodes = (parentId) => nodes.filter(n => n.parentId === parentId);

  function renderGraph() {
    const container = svgRef.current;
    if (!container) return;

    const svg = d3.select(container);
    svg.selectAll('*').remove();

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (nodes.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#666')
        .text('No dialogue nodes. Create one to start.');
      return;
    }

    // Build links from parent-child relationships AND choices
    const links = [];
    
    // Parent-child links
    nodes.forEach(node => {
      if (node.parentId) {
        links.push({
          source: node.parentId,
          target: node.id,
          type: 'parent'
        });
      }
    });

    // Choice links (convergence points)
    allChoices.forEach(choice => {
      if (choice.nextNodeId) {
        links.push({
          source: choice.nodeId,
          target: choice.nextNodeId,
          type: 'choice',
          label: choice.text?.slice(0, 15)
        });
      }
    });

    // Create node map
    const nodeMap = new Map(nodes.map(n => [n.id, { ...n }]));

    // Calculate positions using force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60))
      .stop();

    // Run simulation
    for (let i = 0; i < 300; i++) simulation.tick();

    // Create zoom behavior
    const g = svg.append('g');
    
    const zoom = d3.zoom()
      .scaleExtent([0.2, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Arrow markers
    const defs = g.append('defs');
    
    defs.append('marker')
      .attr('id', 'arrow-parent')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 35)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#6b7280');

    defs.append('marker')
      .attr('id', 'arrow-choice')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 35)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#f59e0b');

    // Draw links
    links.forEach(link => {
      const source = nodeMap.get(link.source.id || link.source);
      const target = nodeMap.get(link.target.id || link.target);
      if (!source || !target) return;

      const isChoice = link.type === 'choice';
      
      // Curved path for choice links to show convergence clearly
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dr = isChoice ? Math.sqrt(dx * dx + dy * dy) * 0.5 : 0;

      const path = g.append('path')
        .attr('d', isChoice 
          ? `M${source.x},${source.y} Q${(source.x + target.x) / 2 + dy * 0.2},${(source.y + target.y) / 2 - dx * 0.2} ${target.x},${target.y}`
          : `M${source.x},${source.y} L${target.x},${target.y}`)
        .attr('fill', 'none')
        .attr('stroke', isChoice ? '#f59e0b' : '#6b7280')
        .attr('stroke-width', isChoice ? 2 : 1.5)
        .attr('stroke-dasharray', isChoice ? '5,3' : 'none')
        .attr('marker-end', `url(#arrow-${link.type})`);

      // Link label for choices
      if (link.label) {
        const midX = (source.x + target.x) / 2 + (dy * 0.1);
        const midY = (source.y + target.y) / 2 - (dx * 0.1);
        g.append('text')
          .attr('x', midX)
          .attr('y', midY)
          .attr('text-anchor', 'middle')
          .attr('fill', '#f59e0b')
          .attr('font-size', '9px')
          .attr('opacity', 0.8)
          .text(link.label + '...');
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const isSelected = selectedNode?.id === node.id;
      const isPlayer = node.isPlayerChoice;
      
      const nodeG = g.append('g')
        .attr('transform', `translate(${node.x}, ${node.y})`)
        .attr('cursor', 'pointer')
        .on('click', () => setSelectedNode(node));

      // Node shape - rectangle for NPC, rounded for player
      if (isPlayer) {
        nodeG.append('rect')
          .attr('x', -50)
          .attr('y', -20)
          .attr('width', 100)
          .attr('height', 40)
          .attr('rx', 20)
          .attr('fill', isSelected ? '#3b82f6' : '#1e40af')
          .attr('stroke', isSelected ? '#60a5fa' : '#3b82f6')
          .attr('stroke-width', isSelected ? 3 : 1);
      } else {
        nodeG.append('rect')
          .attr('x', -50)
          .attr('y', -20)
          .attr('width', 100)
          .attr('height', 40)
          .attr('rx', 6)
          .attr('fill', isSelected ? '#166534' : '#14532d')
          .attr('stroke', isSelected ? '#22c55e' : '#15803d')
          .attr('stroke-width', isSelected ? 3 : 1);
      }

      // Icon
      nodeG.append('text')
        .attr('x', -35)
        .attr('y', 4)
        .attr('fill', isPlayer ? '#93c5fd' : '#86efac')
        .attr('font-size', '14px')
        .text(isPlayer ? '👤' : '💬');

      // Text preview
      const text = node.text?.slice(0, 12) || '...';
      nodeG.append('text')
        .attr('x', -20)
        .attr('y', 5)
        .attr('fill', '#fff')
        .attr('font-size', '10px')
        .text(text + (node.text?.length > 12 ? '...' : ''));

      // Character name badge for NPC
      if (!isPlayer && node.characterId) {
        nodeG.append('text')
          .attr('x', 0)
          .attr('y', -25)
          .attr('text-anchor', 'middle')
          .attr('fill', '#9ca3af')
          .attr('font-size', '9px')
          .text(getCharName(node.characterId));
      }

      // Convergence indicator (multiple incoming links)
      const incomingCount = links.filter(l => (l.target.id || l.target) === node.id).length;
      if (incomingCount > 1) {
        nodeG.append('circle')
          .attr('cx', 45)
          .attr('cy', -15)
          .attr('r', 10)
          .attr('fill', '#f59e0b');
        nodeG.append('text')
          .attr('x', 45)
          .attr('y', -11)
          .attr('text-anchor', 'middle')
          .attr('fill', '#000')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .text(incomingCount);
      }
    });

    // Legend
    const legend = svg.append('g').attr('transform', `translate(10, ${height - 60})`);
    
    legend.append('rect').attr('x', 0).attr('y', 0).attr('width', 12).attr('height', 12).attr('rx', 2).attr('fill', '#15803d');
    legend.append('text').attr('x', 18).attr('y', 10).attr('fill', '#9ca3af').attr('font-size', '10px').text('NPC');
    
    legend.append('rect').attr('x', 50).attr('y', 0).attr('width', 12).attr('height', 12).attr('rx', 6).attr('fill', '#1e40af');
    legend.append('text').attr('x', 68).attr('y', 10).attr('fill', '#9ca3af').attr('font-size', '10px').text('Player');
    
    legend.append('line').attr('x1', 110).attr('y1', 6).attr('x2', 130).attr('y2', 6).attr('stroke', '#f59e0b').attr('stroke-dasharray', '5,3');
    legend.append('text').attr('x', 136).attr('y', 10).attr('fill', '#9ca3af').attr('font-size', '10px').text('Converge');
    
    legend.append('circle').attr('cx', 200).attr('cy', 6).attr('r', 8).attr('fill', '#f59e0b');
    legend.append('text').attr('x', 214).attr('y', 10).attr('fill', '#9ca3af').attr('font-size', '10px').text('= incoming paths');
  }

  function NodeTree({ node, depth = 0 }) {
    const children = childNodes(node.id);

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
          <div className="flex bg-gray-700 rounded overflow-hidden">
            <button
              onClick={() => setViewMode('graph')}
              className={`px-2 py-1 text-xs flex items-center gap-1 ${viewMode === 'graph' ? 'bg-amber-500 text-gray-900' : 'text-gray-300'}`}
            >
              <GitBranch className="w-3 h-3" /> Graph
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-2 py-1 text-xs flex items-center gap-1 ${viewMode === 'tree' ? 'bg-amber-500 text-gray-900' : 'text-gray-300'}`}
            >
              <List className="w-3 h-3" /> Tree
            </button>
          </div>
          <button
            onClick={() => handleCreateNode(false)}
            className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
          >
            <Plus className="w-3 h-3" /> NPC
          </button>
          <button
            onClick={() => handleCreateNode(true)}
            className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
          >
            <Plus className="w-3 h-3" /> Player
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Graph or Tree View */}
        <div className={`${selectedNode ? 'w-1/2' : 'flex-1'} overflow-hidden flex flex-col`}>
          {viewMode === 'graph' ? (
            <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <svg ref={svgRef} className="w-full h-full" />
            </div>
          ) : (
            <div className="flex-1 overflow-auto border-r border-gray-700 pr-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Dialogue Tree</h3>
              {rootNodes.length === 0 ? (
                <p className="text-sm text-gray-500">No dialogue nodes yet</p>
              ) : (
                rootNodes.map(node => <NodeTree key={node.id} node={node} />)
              )}
            </div>
          )}
        </div>

        {/* Node Editor */}
        {selectedNode && (
          <div className="w-1/2 overflow-auto">
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                {selectedNode.isPlayerChoice ? (
                  <span className="text-sm text-blue-400 flex items-center gap-1"><User className="w-4 h-4" /> Player Choice</span>
                ) : (
                  <span className="text-sm text-green-400 flex items-center gap-1"><MessageCircle className="w-4 h-4" /> NPC Dialogue</span>
                )}
                <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
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

              {/* Choices / Links to other nodes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-400">
                    {selectedNode.isPlayerChoice ? 'Leads to (next NPC response)' : 'Response Options'}
                  </label>
                  <button
                    onClick={() => handleAddChoice(selectedNode.id)}
                    className="text-xs text-amber-400 hover:text-amber-300"
                  >
                    + Add {selectedNode.isPlayerChoice ? 'Link' : 'Option'}
                  </button>
                </div>
                <div className="space-y-2">
                  {choices.filter(c => c.nodeId === selectedNode.id).map(choice => (
                    <div key={choice.id} className="flex items-center gap-2 p-2 bg-gray-700/50 rounded">
                      <ArrowRight className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={choice.text}
                        onChange={e => handleUpdateChoice(choice.id, { text: e.target.value })}
                        className="flex-1 bg-transparent border-b border-gray-600 text-sm focus:outline-none focus:border-amber-500"
                        placeholder="Option text..."
                      />
                      <select
                        value={choice.nextNodeId || ''}
                        onChange={e => handleUpdateChoice(choice.id, { nextNodeId: e.target.value ? Number(e.target.value) : null })}
                        className="bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-xs max-w-[120px]"
                      >
                        <option value="">→ End</option>
                        {nodes.filter(n => n.id !== selectedNode.id).map(n => (
                          <option key={n.id} value={n.id}>
                            {n.isPlayerChoice ? '👤' : '💬'} {n.text?.slice(0, 15)}...
                          </option>
                        ))}
                      </select>
                      <button onClick={() => handleDeleteChoice(choice.id)} className="text-gray-500 hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {choices.filter(c => c.nodeId === selectedNode.id).length === 0 && (
                    <p className="text-xs text-gray-500">No links yet. Add one to connect to other nodes.</p>
                  )}
                </div>
              </div>

              {/* Quick add child nodes */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-500 mb-2">Quick add child node:</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCreateNode(false, selectedNode.id)}
                    className="flex items-center gap-1 px-2 py-1 bg-green-700/50 hover:bg-green-700 rounded text-xs"
                  >
                    <Plus className="w-3 h-3" /> NPC Response
                  </button>
                  <button
                    onClick={() => handleCreateNode(true, selectedNode.id)}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-700/50 hover:bg-blue-700 rounded text-xs"
                  >
                    <Plus className="w-3 h-3" /> Player Option
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
        <p>💡 Use <span className="text-amber-400">Response Options</span> to link nodes → creates convergence points in graph. Orange badge = multiple paths converge.</p>
      </div>
    </div>
  );
}
