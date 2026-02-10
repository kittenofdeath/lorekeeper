import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { getFamilyTreeData } from '../db';
import { GitBranch, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export default function FamilyTree({ entities, onSelectEntity }) {
  const svgRef = useRef();
  const [treeData, setTreeData] = useState({ characters: [], relationships: [] });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    loadData();
  }, [entities]);

  useEffect(() => {
    if (treeData.characters.length > 0) {
      renderTree();
    }
  }, [treeData, zoom]);

  async function loadData() {
    const data = await getFamilyTreeData();
    setTreeData(data);
  }

  function renderTree() {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const g = svg.append('g')
      .attr('transform', `translate(${width/2}, 50) scale(${zoom})`);

    const { characters, relationships } = treeData;

    // Build adjacency for layout
    const parentOf = {};
    const spouseOf = {};
    
    relationships.forEach(r => {
      const relType = r.effectiveType || r.subtype || r.type;
      if (relType === 'parent') {
        if (!parentOf[r.targetId]) parentOf[r.targetId] = [];
        parentOf[r.targetId].push(r.sourceId);
      }
      if (relType === 'spouse') {
        spouseOf[r.sourceId] = r.targetId;
        spouseOf[r.targetId] = r.sourceId;
      }
    });

    // Find roots (characters with no parents in data)
    const hasParent = new Set(Object.keys(parentOf).map(Number));
    const roots = characters.filter(c => !hasParent.has(c.id));

    // Simple tree layout - position nodes
    const nodePositions = {};
    const nodeSpacing = 120;
    const levelSpacing = 100;
    
    function layoutSubtree(charId, x, level, visited = new Set()) {
      if (visited.has(charId)) return x;
      visited.add(charId);
      
      nodePositions[charId] = { x, y: level * levelSpacing };
      
      // Find children
      const children = characters.filter(c => 
        parentOf[c.id]?.includes(charId) && !visited.has(c.id)
      );
      
      let nextX = x - (children.length - 1) * nodeSpacing / 2;
      children.forEach(child => {
        nextX = layoutSubtree(child.id, nextX, level + 1, visited);
        nextX += nodeSpacing;
      });
      
      return x;
    }

    // Layout from roots
    let startX = -(roots.length - 1) * nodeSpacing / 2;
    const visited = new Set();
    roots.forEach(root => {
      layoutSubtree(root.id, startX, 0, visited);
      startX += nodeSpacing * 2;
    });

    // Layout any unvisited characters (disconnected)
    characters.filter(c => !visited.has(c.id)).forEach((c, i) => {
      nodePositions[c.id] = { x: startX + i * nodeSpacing, y: 0 };
    });

    // Draw relationships
    relationships.forEach(r => {
      const source = nodePositions[r.sourceId];
      const target = nodePositions[r.targetId];
      if (!source || !target) return;

      const relType = r.effectiveType || r.subtype || r.type;
      const color = relType === 'spouse' ? '#ec4899' : 
                    relType === 'parent' ? '#3b82f6' : '#6b7280';
      const dash = relType === 'spouse' ? '4,4' : 'none';

      g.append('line')
        .attr('x1', source.x)
        .attr('y1', source.y)
        .attr('x2', target.x)
        .attr('y2', target.y)
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', dash)
        .attr('opacity', 0.6);
    });

    // Draw nodes
    characters.forEach(char => {
      const pos = nodePositions[char.id];
      if (!pos) return;

      const node = g.append('g')
        .attr('transform', `translate(${pos.x}, ${pos.y})`)
        .style('cursor', 'pointer')
        .on('click', () => onSelectEntity(char.id));

      // Circle
      node.append('circle')
        .attr('r', 25)
        .attr('fill', char.deathDate ? '#374151' : '#1f2937')
        .attr('stroke', char.deathDate ? '#6b7280' : '#f59e0b')
        .attr('stroke-width', 2);

      // Name
      node.append('text')
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .attr('fill', '#e5e7eb')
        .attr('font-size', '11px')
        .text(char.name?.split(' ')[0] || 'Unknown');

      // Birth-death
      if (char.birthDate) {
        const lifespan = char.deathDate 
          ? `${char.birthDate}-${char.deathDate}`
          : `b.${char.birthDate}`;
        node.append('text')
          .attr('y', 52)
          .attr('text-anchor', 'middle')
          .attr('fill', '#9ca3af')
          .attr('font-size', '9px')
          .text(lifespan);
      }
    });
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-amber-400" />
          Family Tree
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} className="p-1 hover:bg-gray-700 rounded">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.2))} className="p-1 hover:bg-gray-700 rounded">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => setZoom(1)} className="p-1 hover:bg-gray-700 rounded">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
      <div className="mt-2 flex gap-4 text-xs text-gray-500">
        <span><span className="inline-block w-3 h-0.5 bg-blue-500 mr-1"></span>Parent-Child</span>
        <span><span className="inline-block w-3 h-0.5 bg-pink-500 mr-1" style={{borderBottom: '2px dashed'}}></span>Spouse</span>
        <span><span className="inline-block w-3 h-3 rounded-full border-2 border-amber-500 mr-1"></span>Living</span>
        <span><span className="inline-block w-3 h-3 rounded-full border-2 border-gray-500 mr-1"></span>Deceased</span>
      </div>
    </div>
  );
}
