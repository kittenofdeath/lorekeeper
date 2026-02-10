import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  getAllQuests, getQuestBranches, createQuestBranch, deleteQuestBranch,
  getQuestPrerequisites, getQuestStats, getActiveProject
} from '../db';
import { Map, Plus, X, Filter, BarChart3, Link2 } from 'lucide-react';

const QUEST_TYPE_COLORS = {
  main: '#eab308',
  side: '#3b82f6',
  faction: '#a855f7',
  radiant: '#22c55e',
  companion: '#ec4899',
  bounty: '#f97316',
  fetch: '#6b7280',
  escort: '#14b8a6',
};

export default function QuestOverview({ entities, spoilerMode, onSelectQuest }) {
  const svgRef = useRef(null);
  const [quests, setQuests] = useState([]);
  const [branches, setBranches] = useState([]);
  const [prerequisites, setPrerequisites] = useState({});
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showStats, setShowStats] = useState(false);
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [newBranch, setNewBranch] = useState({ fromQuestId: '', toQuestId: '', condition: '' });
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    loadData();
  }, [spoilerMode]);

  useEffect(() => {
    if (quests.length > 0) {
      renderGraph();
    }
  }, [quests, branches, prerequisites, filter, selectedNode]);

  async function loadData() {
    const project = await getActiveProject();
    if (!project) return;
    
    let q = await getAllQuests(project.id);
    if (!spoilerMode) {
      q = q.filter(x => !x.isSpoiler);
    }
    setQuests(q);
    
    const b = await getQuestBranches();
    setBranches(b);
    
    // Load prerequisites for all quests
    const prereqs = {};
    for (const quest of q) {
      prereqs[quest.id] = await getQuestPrerequisites(quest.id);
    }
    setPrerequisites(prereqs);
    
    const s = await getQuestStats();
    setStats(s);
  }

  async function handleAddBranch() {
    if (newBranch.fromQuestId && newBranch.toQuestId && newBranch.fromQuestId !== newBranch.toQuestId) {
      await createQuestBranch({
        fromQuestId: Number(newBranch.fromQuestId),
        toQuestId: Number(newBranch.toQuestId),
        condition: newBranch.condition
      });
      setNewBranch({ fromQuestId: '', toQuestId: '', condition: '' });
      setShowAddBranch(false);
      loadData();
    }
  }

  async function handleDeleteBranch(id) {
    await deleteQuestBranch(id);
    loadData();
  }

  function renderGraph() {
    const container = svgRef.current;
    if (!container) return;

    const svg = d3.select(container);
    svg.selectAll('*').remove();

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Filter quests
    const filteredQuests = filter === 'all' ? quests : quests.filter(q => q.type === filter);

    if (filteredQuests.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#666')
        .text('No quests to display. Create some quests first.');
      return;
    }

    // Build links from branches AND prerequisites
    const links = [];
    
    // Branch links
    branches.forEach(b => {
      if (filteredQuests.find(q => q.id === b.fromQuestId) && filteredQuests.find(q => q.id === b.toQuestId)) {
        links.push({
          source: b.fromQuestId,
          target: b.toQuestId,
          type: 'branch',
          id: b.id,
          condition: b.condition
        });
      }
    });
    
    // Prerequisite links
    Object.entries(prerequisites).forEach(([questId, prereqs]) => {
      prereqs.forEach(p => {
        if (p.prereqQuestId && filteredQuests.find(q => q.id === p.prereqQuestId) && filteredQuests.find(q => q.id === Number(questId))) {
          links.push({
            source: p.prereqQuestId,
            target: Number(questId),
            type: 'prerequisite'
          });
        }
      });
    });

    const nodes = filteredQuests.map(q => ({ ...q }));
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(80))
      .stop();

    for (let i = 0; i < 300; i++) simulation.tick();

    // Zoom
    const g = svg.append('g');
    const zoom = d3.zoom()
      .scaleExtent([0.2, 3])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    // Arrow markers
    const defs = g.append('defs');
    
    defs.append('marker')
      .attr('id', 'arrow-branch')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 45)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#22c55e');

    defs.append('marker')
      .attr('id', 'arrow-prereq')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 45)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#ef4444');

    // Draw links
    links.forEach(link => {
      const source = nodeMap.get(link.source.id || link.source);
      const target = nodeMap.get(link.target.id || link.target);
      if (!source || !target) return;

      const isBranch = link.type === 'branch';
      const dx = target.x - source.x;
      const dy = target.y - source.y;

      const path = g.append('path')
        .attr('d', `M${source.x},${source.y} Q${(source.x + target.x) / 2 + dy * 0.1},${(source.y + target.y) / 2 - dx * 0.1} ${target.x},${target.y}`)
        .attr('fill', 'none')
        .attr('stroke', isBranch ? '#22c55e' : '#ef4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', isBranch ? 'none' : '5,3')
        .attr('marker-end', `url(#arrow-${link.type === 'branch' ? 'branch' : 'prereq'})`)
        .attr('opacity', 0.7)
        .attr('cursor', isBranch ? 'pointer' : 'default');

      if (isBranch && link.id) {
        path.on('click', () => {
          if (confirm('Delete this quest branch?')) {
            handleDeleteBranch(link.id);
          }
        });
      }

      // Link label
      if (link.condition) {
        const midX = (source.x + target.x) / 2 + dy * 0.05;
        const midY = (source.y + target.y) / 2 - dx * 0.05;
        g.append('text')
          .attr('x', midX)
          .attr('y', midY)
          .attr('text-anchor', 'middle')
          .attr('fill', '#22c55e')
          .attr('font-size', '9px')
          .text(link.condition);
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const isSelected = selectedNode === node.id;
      const color = QUEST_TYPE_COLORS[node.type] || '#6b7280';
      
      const nodeG = g.append('g')
        .attr('transform', `translate(${node.x}, ${node.y})`)
        .attr('cursor', 'pointer')
        .on('click', () => {
          setSelectedNode(node.id === selectedNode ? null : node.id);
          if (onSelectQuest) onSelectQuest(node.id);
        })
        .on('contextmenu', (event) => {
          event.preventDefault();
          setSelectedNode(node.id);
        });

      // Node shape - hexagon for main quests, rounded rect for others
      if (node.type === 'main') {
        const hexPoints = [0, -35, 30, -18, 30, 18, 0, 35, -30, 18, -30, -18].map((v, i) => 
          i % 2 === 0 ? v * 1.3 : v
        ).join(',');
        nodeG.append('polygon')
          .attr('points', hexPoints)
          .attr('fill', isSelected ? color : color + '40')
          .attr('stroke', color)
          .attr('stroke-width', isSelected ? 3 : 2);
      } else {
        nodeG.append('rect')
          .attr('x', -55)
          .attr('y', -25)
          .attr('width', 110)
          .attr('height', 50)
          .attr('rx', 8)
          .attr('fill', isSelected ? color + '60' : color + '20')
          .attr('stroke', color)
          .attr('stroke-width', isSelected ? 3 : 1);
      }

      // Quest type icon/badge
      nodeG.append('rect')
        .attr('x', -55)
        .attr('y', -25)
        .attr('width', 22)
        .attr('height', 16)
        .attr('rx', 4)
        .attr('fill', color);

      nodeG.append('text')
        .attr('x', -44)
        .attr('y', -13)
        .attr('text-anchor', 'middle')
        .attr('fill', '#000')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .text(node.type?.[0]?.toUpperCase() || '?');

      // Quest name
      nodeG.append('text')
        .attr('x', 0)
        .attr('y', 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', '11px')
        .attr('font-weight', 'medium')
        .text(node.name?.length > 16 ? node.name.slice(0, 14) + '...' : node.name);

      // Level badge
      nodeG.append('text')
        .attr('x', 45)
        .attr('y', -13)
        .attr('text-anchor', 'middle')
        .attr('fill', '#9ca3af')
        .attr('font-size', '9px')
        .text(`Lv${node.level || 1}`);

      // Status indicator
      const statusColors = { draft: '#6b7280', outlined: '#3b82f6', scripted: '#eab308', implemented: '#22c55e', tested: '#a855f7' };
      nodeG.append('circle')
        .attr('cx', 50)
        .attr('cy', 20)
        .attr('r', 5)
        .attr('fill', statusColors[node.status] || '#6b7280');
    });

    // Legend
    const legend = svg.append('g').attr('transform', `translate(10, ${height - 80})`);
    
    legend.append('line').attr('x1', 0).attr('y1', 6).attr('x2', 20).attr('y2', 6).attr('stroke', '#22c55e').attr('stroke-width', 2);
    legend.append('text').attr('x', 25).attr('y', 10).attr('fill', '#9ca3af').attr('font-size', '10px').text('Branch');
    
    legend.append('line').attr('x1', 70).attr('y1', 6).attr('x2', 90).attr('y2', 6).attr('stroke', '#ef4444').attr('stroke-width', 2).attr('stroke-dasharray', '5,3');
    legend.append('text').attr('x', 95).attr('y', 10).attr('fill', '#9ca3af').attr('font-size', '10px').text('Prerequisite');

    legend.append('text').attr('x', 0).attr('y', 30).attr('fill', '#666').attr('font-size', '9px').text('Click quest to select • Right-click for options • Click branches to delete');
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Map className="w-5 h-5 text-amber-400" />
          Quest Overview
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${showStats ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            <BarChart3 className="w-4 h-4" /> Stats
          </button>
          <button
            onClick={() => setShowAddBranch(!showAddBranch)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${showAddBranch ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            <Link2 className="w-4 h-4" /> Link Quests
          </button>
        </div>
      </div>

      {/* Stats panel */}
      {showStats && stats && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-purple-500/50">
          <h3 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Quest Statistics
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-gray-500">Total Quests</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">By Type</div>
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: QUEST_TYPE_COLORS[type] }} />
                  <span className="text-gray-300">{type}: {count}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">By Status</div>
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status} className="text-xs text-gray-300">{status}: {count}</div>
              ))}
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Connections</div>
              <div className="text-xs text-gray-300">Branches: {branches.length}</div>
              <div className="text-xs text-gray-300">With prereqs: {Object.values(prerequisites).filter(p => p.length > 0).length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Add branch panel */}
      {showAddBranch && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-green-500/50">
          <h3 className="text-sm font-medium text-green-300 mb-3">Create Quest Branch</h3>
          <div className="flex items-center gap-3">
            <select
              value={newBranch.fromQuestId}
              onChange={e => setNewBranch({ ...newBranch, fromQuestId: e.target.value })}
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
            >
              <option value="">From quest...</option>
              {quests.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
            </select>
            <span className="text-gray-500">→</span>
            <select
              value={newBranch.toQuestId}
              onChange={e => setNewBranch({ ...newBranch, toQuestId: e.target.value })}
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
            >
              <option value="">To quest...</option>
              {quests.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
            </select>
            <input
              type="text"
              placeholder="Condition (optional)"
              value={newBranch.condition}
              onChange={e => setNewBranch({ ...newBranch, condition: e.target.value })}
              className="w-40 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
            />
            <button onClick={handleAddBranch} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm">
              Create
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Branches show quest flow. Use prerequisites in Quest Builder for unlock requirements.</p>
        </div>
      )}

      {/* Type filter */}
      <div className="flex gap-1 mb-4 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-2 py-1 rounded text-xs ${filter === 'all' ? 'bg-gray-600 text-white' : 'bg-gray-700/50 text-gray-400'}`}
        >
          All
        </button>
        {Object.entries(QUEST_TYPE_COLORS).map(([type, color]) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-2 py-1 rounded text-xs capitalize ${filter === type ? 'text-white' : 'text-gray-300'}`}
            style={{ backgroundColor: filter === type ? color : color + '30' }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Graph */}
      <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}
