import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getAllEvents, getEventCausality, addEventCausality, removeEventCausality } from '../db';
import { Link2, Plus, X, ArrowRight } from 'lucide-react';

export default function CausalityView({ entities, spoilerMode, onSelectEvent }) {
  const svgRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [causality, setCausality] = useState([]);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState({ causeId: '', effectId: '', description: '' });
  const [selectedChain, setSelectedChain] = useState(null);

  useEffect(() => {
    loadData();
  }, [spoilerMode]);

  useEffect(() => {
    if (events.length > 0) {
      renderGraph();
    }
  }, [events, causality, selectedChain]);

  async function loadData() {
    let allEvents = await getAllEvents();
    if (!spoilerMode) {
      allEvents = allEvents.filter(e => !e.isSpoiler);
    }
    setEvents(allEvents.sort((a, b) => (a.startDate || 0) - (b.startDate || 0)));

    const causalityData = await getEventCausality();
    setCausality(causalityData);
  }

  async function handleAddLink() {
    if (newLink.causeId && newLink.effectId && newLink.causeId !== newLink.effectId) {
      await addEventCausality(Number(newLink.causeId), Number(newLink.effectId), newLink.description);
      setNewLink({ causeId: '', effectId: '', description: '' });
      setShowAddLink(false);
      loadData();
    }
  }

  async function handleRemoveLink(linkId) {
    await removeEventCausality(linkId);
    loadData();
  }

  function getEventName(id) {
    const e = events.find(x => x.id === id);
    return e ? e.title : `Event #${id}`;
  }

  function getEventYear(id) {
    const e = events.find(x => x.id === id);
    return e?.startDate;
  }

  function buildCausalityChains() {
    // Find events that are causes but not effects (roots)
    const effectIds = new Set(causality.map(c => c.effectEventId));
    const causeIds = new Set(causality.map(c => c.causeEventId));
    
    const roots = events.filter(e => causeIds.has(e.id) && !effectIds.has(e.id));
    
    // Build chains from each root
    const chains = [];
    
    function buildChain(eventId, visited = new Set()) {
      if (visited.has(eventId)) return [];
      visited.add(eventId);
      
      const effects = causality.filter(c => c.causeEventId === eventId);
      if (effects.length === 0) return [eventId];
      
      const chain = [eventId];
      effects.forEach(effect => {
        chain.push(...buildChain(effect.effectEventId, visited));
      });
      return chain;
    }
    
    roots.forEach(root => {
      const chain = buildChain(root.id);
      if (chain.length > 1) {
        chains.push(chain);
      }
    });
    
    // Also find any orphan chains (effects that aren't causes of anything)
    const allInChains = new Set(chains.flat());
    causality.forEach(c => {
      if (!allInChains.has(c.causeEventId)) {
        chains.push([c.causeEventId, c.effectEventId]);
      }
    });
    
    return chains;
  }

  function renderGraph() {
    const container = svgRef.current;
    if (!container) return;

    const svg = d3.select(container);
    svg.selectAll('*').remove();

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Filter events involved in causality
    const involvedEventIds = new Set([
      ...causality.map(c => c.causeEventId),
      ...causality.map(c => c.effectEventId)
    ]);
    
    const involvedEvents = events.filter(e => involvedEventIds.has(e.id));

    if (involvedEvents.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#666')
        .text('No causality chains defined yet. Add links between events.');
      return;
    }

    // Create nodes and links for D3
    const nodes = involvedEvents.map(e => ({
      id: e.id,
      title: e.title,
      year: e.startDate,
      isSpoiler: e.isSpoiler
    }));

    const links = causality.map(c => ({
      source: c.causeEventId,
      target: c.effectEventId,
      id: c.id,
      description: c.description
    }));

    // Create hierarchical layout based on time
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    
    // Sort nodes by year and assign x positions
    const sortedNodes = [...nodes].sort((a, b) => (a.year || 0) - (b.year || 0));
    const yearGroups = d3.group(sortedNodes, d => d.year);
    
    let xPos = 100;
    yearGroups.forEach((group, year) => {
      group.forEach((node, i) => {
        node.x = xPos;
        node.y = 80 + i * 100;
      });
      xPos += 200;
    });

    // Arrow marker
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#f59e0b');

    // Draw links
    links.forEach(link => {
      const source = nodeMap.get(link.source);
      const target = nodeMap.get(link.target);
      if (!source || !target) return;

      const path = svg.append('path')
        .attr('d', `M${source.x},${source.y} C${(source.x + target.x) / 2},${source.y} ${(source.x + target.x) / 2},${target.y} ${target.x},${target.y}`)
        .attr('fill', 'none')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrowhead)')
        .attr('cursor', 'pointer')
        .on('click', () => {
          if (confirm('Remove this causality link?')) {
            handleRemoveLink(link.id);
          }
        });

      // Link label
      if (link.description) {
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        svg.append('text')
          .attr('x', midX)
          .attr('y', midY - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', '#888')
          .attr('font-size', '10px')
          .text(link.description);
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const g = svg.append('g')
        .attr('transform', `translate(${node.x}, ${node.y})`)
        .attr('cursor', 'pointer')
        .on('click', () => onSelectEvent(node.id));

      // Node background
      g.append('rect')
        .attr('x', -80)
        .attr('y', -25)
        .attr('width', 160)
        .attr('height', 50)
        .attr('rx', 8)
        .attr('fill', node.isSpoiler ? '#7f1d1d' : '#1e3a5f')
        .attr('stroke', selectedChain?.includes(node.id) ? '#f59e0b' : '#3b82f6')
        .attr('stroke-width', selectedChain?.includes(node.id) ? 3 : 1);

      // Year badge
      g.append('rect')
        .attr('x', -80)
        .attr('y', -25)
        .attr('width', 50)
        .attr('height', 20)
        .attr('rx', 4)
        .attr('fill', '#3b82f6');

      g.append('text')
        .attr('x', -55)
        .attr('y', -11)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text(node.year || '?');

      // Title
      g.append('text')
        .attr('x', 0)
        .attr('y', 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', '12px')
        .text(node.title.length > 20 ? node.title.slice(0, 18) + '...' : node.title);
    });

    // Enable pan/zoom
    const zoom = d3.zoom()
      .scaleExtent([0.3, 2])
      .on('zoom', (event) => {
        svg.selectAll('g, path, text, rect').attr('transform', event.transform);
      });

    // Don't apply zoom to the main SVG to keep markers working
  }

  const chains = buildCausalityChains();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Link2 className="w-6 h-6 text-amber-400" />
          Causality Chains
        </h2>
        <button
          onClick={() => setShowAddLink(!showAddLink)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
            showAddLink ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Plus className="w-4 h-4" />
          Add Link
        </button>
      </div>

      {/* Add link form */}
      {showAddLink && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Cause Event</label>
              <select
                value={newLink.causeId}
                onChange={e => setNewLink({ ...newLink, causeId: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
              >
                <option value="">Select event...</option>
                {events.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.startDate ? `[${e.startDate}] ` : ''}{e.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Effect Event</label>
              <select
                value={newLink.effectId}
                onChange={e => setNewLink({ ...newLink, effectId: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
              >
                <option value="">Select event...</option>
                {events.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.startDate ? `[${e.startDate}] ` : ''}{e.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Description (optional)"
              value={newLink.description}
              onChange={e => setNewLink({ ...newLink, description: e.target.value })}
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
            />
            <button
              onClick={handleAddLink}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded text-sm font-medium"
            >
              Create Link
            </button>
          </div>
        </div>
      )}

      {/* Chain list */}
      {chains.length > 0 && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Event Chains</h3>
          <div className="flex flex-wrap gap-2">
            {chains.map((chain, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedChain(selectedChain === chain ? null : chain)}
                className={`px-2 py-1 rounded text-sm ${
                  selectedChain === chain
                    ? 'bg-amber-500 text-gray-900'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Chain {idx + 1} ({chain.length} events)
              </button>
            ))}
            {selectedChain && (
              <button
                onClick={() => setSelectedChain(null)}
                className="px-2 py-1 rounded text-sm text-gray-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Graph visualization */}
      <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* Causality list */}
      <div className="mt-4 max-h-40 overflow-auto">
        <h3 className="text-sm font-medium text-gray-300 mb-2">All Causality Links</h3>
        {causality.length === 0 ? (
          <p className="text-sm text-gray-500">No causality links defined</p>
        ) : (
          <div className="space-y-1">
            {causality.map(link => (
              <div key={link.id} className="flex items-center gap-2 p-2 bg-gray-700/50 rounded text-sm">
                <span className="text-blue-300">{getEventName(link.causeEventId)}</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
                <span className="text-blue-300">{getEventName(link.effectEventId)}</span>
                {link.description && (
                  <span className="text-gray-500">({link.description})</span>
                )}
                <button
                  onClick={() => handleRemoveLink(link.id)}
                  className="ml-auto p-1 hover:bg-gray-600 rounded"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-6 text-xs text-gray-400">
        <span>Click events to view details</span>
        <span>Click links to remove</span>
        <span>Drag to pan</span>
      </div>
    </div>
  );
}
