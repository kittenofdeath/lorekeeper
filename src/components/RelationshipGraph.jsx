import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getAllRelationships } from '../db';

const relationshipColors = {
  family: '#3b82f6',
  romantic: '#ec4899',
  ally: '#22c55e',
  enemy: '#ef4444',
  member: '#8b5cf6',
  controls: '#f59e0b'
};

export default function RelationshipGraph({ entities, spoilerMode, onSelectEntity }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [relationships, setRelationships] = useState([]);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadRelationships();
  }, [spoilerMode]);

  useEffect(() => {
    if (relationships.length > 0 && entities.length > 0) {
      renderGraph();
    }
  }, [relationships, entities, filterType]);

  async function loadRelationships() {
    let rels = await getAllRelationships();
    if (!spoilerMode) {
      rels = rels.filter(r => !r.isSpoiler);
    }
    setRelationships(rels);
  }

  function renderGraph() {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Filter relationships
    let filteredRels = relationships;
    if (filterType !== 'all') {
      filteredRels = relationships.filter(r => r.type === filterType);
    }

    // Get entities that have relationships
    const entityIds = new Set();
    filteredRels.forEach(r => {
      entityIds.add(r.sourceId);
      entityIds.add(r.targetId);
    });

    const graphEntities = entities.filter(e => entityIds.has(e.id));

    if (graphEntities.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#666')
        .text('No relationships to display');
      return;
    }

    // Create nodes and links for D3 force simulation
    const nodes = graphEntities.map(e => ({
      id: e.id,
      name: e.name,
      type: e.type,
      status: e.status
    }));

    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    const links = filteredRels
      .filter(r => nodeMap.has(r.sourceId) && nodeMap.has(r.targetId))
      .map(r => ({
        source: r.sourceId,
        target: r.targetId,
        type: r.type,
        subtype: r.subtype
      }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Create arrow markers for directed edges
    const defs = svg.append('defs');
    Object.keys(relationshipColors).forEach(type => {
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 25)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', relationshipColors[type]);
    });

    // Container for zoom/pan
    const g = svg.append('g');

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => relationshipColors[d.type] || '#666')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', d => `url(#arrow-${d.type})`);

    // Draw link labels
    const linkLabel = g.append('g')
      .selectAll('text')
      .data(links)
      .join('text')
      .attr('font-size', '10px')
      .attr('fill', '#888')
      .attr('text-anchor', 'middle')
      .text(d => d.subtype || d.type);

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (e, d) => onSelectEntity(d.id));

    // Node circles
    node.append('circle')
      .attr('r', 20)
      .attr('fill', d => {
        switch (d.type) {
          case 'character': return '#3b82f6';
          case 'faction': return '#eab308';
          case 'location': return '#22c55e';
          default: return '#888';
        }
      })
      .attr('stroke', d => d.status === 'deceased' ? '#ef4444' : '#111')
      .attr('stroke-width', d => d.status === 'deceased' ? 3 : 2);

    // Node labels
    node.append('text')
      .attr('dy', 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ddd')
      .attr('font-size', '11px')
      .text(d => d.name.length > 15 ? d.name.slice(0, 13) + '...' : d.name);

    // Node initials
    node.append('text')
      .attr('dy', 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(d => d.name.split(' ').map(n => n[0]).join('').slice(0, 2));

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      linkLabel
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2 - 5);

      node.attr('transform', d => `translate(${d.x}, ${d.y})`);
    });

    // Drag functions
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Enable zoom/pan
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Relationships</h2>
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Types</option>
            <option value="family">Family</option>
            <option value="romantic">Romantic</option>
            <option value="ally">Ally</option>
            <option value="enemy">Enemy</option>
            <option value="member">Member</option>
          </select>
        </div>
      </div>

      {/* Graph Canvas */}
      <div ref={containerRef} className="flex-1 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-400">
        {Object.entries(relationshipColors).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1">
            <span className="w-4 h-0.5" style={{ backgroundColor: color }} />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        ))}
        <span className="ml-4">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-red-500 mr-1" />
          Deceased
        </span>
      </div>

      {/* Instructions */}
      <p className="mt-2 text-xs text-gray-500">
        Drag nodes to rearrange • Scroll to zoom • Click node to view details
      </p>
    </div>
  );
}
