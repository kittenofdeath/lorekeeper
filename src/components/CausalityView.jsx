import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getAllEvents, getEventCausality, addEventCausality, removeEventCausality, updateEventCausality, getPlotlines, addPlotline, updatePlotline, deletePlotline } from '../db';
import { Link2, Plus, X, ArrowRight, Layers, Palette, Edit2, Trash2 } from 'lucide-react';

const DEFAULT_COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function CausalityView({ entities, spoilerMode, onSelectEvent }) {
  const svgRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [causality, setCausality] = useState([]);
  const [plotlines, setPlotlines] = useState([]);
  const [showAddLink, setShowAddLink] = useState(false);
  const [showPlotlineManager, setShowPlotlineManager] = useState(false);
  const [newLink, setNewLink] = useState({ causeId: '', effectId: '', description: '', plotlineId: '' });
  const [selectedPlotline, setSelectedPlotline] = useState(null); // null = show all
  const [newPlotline, setNewPlotline] = useState({ name: '', color: '#f59e0b', description: '' });
  const [editingPlotline, setEditingPlotline] = useState(null);

  useEffect(() => {
    loadData();
  }, [spoilerMode]);

  useEffect(() => {
    if (events.length > 0) {
      renderGraph();
    }
  }, [events, causality, selectedPlotline, plotlines]);

  async function loadData() {
    let allEvents = await getAllEvents();
    if (!spoilerMode) {
      allEvents = allEvents.filter(e => !e.isSpoiler);
    }
    setEvents(allEvents.sort((a, b) => (a.startDate || 0) - (b.startDate || 0)));

    const causalityData = await getEventCausality();
    setCausality(causalityData);

    const plotlineData = await getPlotlines();
    setPlotlines(plotlineData);
  }

  async function handleAddLink() {
    if (newLink.causeId && newLink.effectId && newLink.causeId !== newLink.effectId) {
      await addEventCausality(
        Number(newLink.causeId), 
        Number(newLink.effectId), 
        newLink.description,
        newLink.plotlineId ? Number(newLink.plotlineId) : null
      );
      setNewLink({ causeId: '', effectId: '', description: '', plotlineId: '' });
      setShowAddLink(false);
      loadData();
    }
  }

  async function handleRemoveLink(linkId) {
    await removeEventCausality(linkId);
    loadData();
  }

  async function handleAssignPlotline(linkId, plotlineId) {
    await updateEventCausality(linkId, { plotlineId: plotlineId ? Number(plotlineId) : null });
    loadData();
  }

  async function handleAddPlotline() {
    if (newPlotline.name.trim()) {
      await addPlotline(newPlotline.name.trim(), newPlotline.color, newPlotline.description);
      setNewPlotline({ name: '', color: DEFAULT_COLORS[plotlines.length % DEFAULT_COLORS.length], description: '' });
      loadData();
    }
  }

  async function handleUpdatePlotline() {
    if (editingPlotline && editingPlotline.name.trim()) {
      await updatePlotline(editingPlotline.id, {
        name: editingPlotline.name.trim(),
        color: editingPlotline.color,
        description: editingPlotline.description
      });
      setEditingPlotline(null);
      loadData();
    }
  }

  async function handleDeletePlotline(id) {
    if (confirm('Delete this plotline? Links will become unassigned.')) {
      await deletePlotline(id);
      if (selectedPlotline === id) setSelectedPlotline(null);
      loadData();
    }
  }

  function getEventName(id) {
    const e = events.find(x => x.id === id);
    return e ? e.title : `Event #${id}`;
  }

  function getPlotlineColor(plotlineId) {
    const pl = plotlines.find(p => p.id === plotlineId);
    return pl?.color || '#6b7280';
  }

  function getPlotlineName(plotlineId) {
    const pl = plotlines.find(p => p.id === plotlineId);
    return pl?.name || 'Unassigned';
  }

  function getFilteredCausality() {
    if (selectedPlotline === null) return causality;
    if (selectedPlotline === 'unassigned') return causality.filter(c => !c.plotlineId);
    return causality.filter(c => c.plotlineId === selectedPlotline);
  }

  function renderGraph() {
    const container = svgRef.current;
    if (!container) return;

    const svg = d3.select(container);
    svg.selectAll('*').remove();

    const width = container.clientWidth;
    const height = container.clientHeight;

    const filteredCausality = getFilteredCausality();

    // Filter events involved in filtered causality
    const involvedEventIds = new Set([
      ...filteredCausality.map(c => c.causeEventId),
      ...filteredCausality.map(c => c.effectEventId)
    ]);
    
    const involvedEvents = events.filter(e => involvedEventIds.has(e.id));

    if (involvedEvents.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#666')
        .text(selectedPlotline ? 'No events in this plotline.' : 'No causality chains defined yet. Add links between events.');
      return;
    }

    // Create nodes and links for D3
    const nodes = involvedEvents.map(e => ({
      id: e.id,
      title: e.title,
      year: e.startDate,
      isSpoiler: e.isSpoiler
    }));

    const links = filteredCausality.map(c => ({
      source: c.causeEventId,
      target: c.effectEventId,
      id: c.id,
      description: c.description,
      plotlineId: c.plotlineId,
      color: getPlotlineColor(c.plotlineId)
    }));

    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    
    // Sort nodes by year and assign positions
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

    // Arrow markers for each plotline color
    const defs = svg.append('defs');
    const usedColors = new Set(links.map(l => l.color));
    usedColors.forEach(color => {
      defs.append('marker')
        .attr('id', `arrowhead-${color.replace('#', '')}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color);
    });

    // Draw links
    links.forEach(link => {
      const source = nodeMap.get(link.source);
      const target = nodeMap.get(link.target);
      if (!source || !target) return;

      svg.append('path')
        .attr('d', `M${source.x},${source.y} C${(source.x + target.x) / 2},${source.y} ${(source.x + target.x) / 2},${target.y} ${target.x},${target.y}`)
        .attr('fill', 'none')
        .attr('stroke', link.color)
        .attr('stroke-width', 2)
        .attr('marker-end', `url(#arrowhead-${link.color.replace('#', '')})`)
        .attr('cursor', 'pointer')
        .on('click', () => {
          if (confirm('Remove this causality link?')) {
            handleRemoveLink(link.id);
          }
        });

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

      g.append('rect')
        .attr('x', -80)
        .attr('y', -25)
        .attr('width', 160)
        .attr('height', 50)
        .attr('rx', 8)
        .attr('fill', node.isSpoiler ? '#7f1d1d' : '#1e3a5f')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 1);

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

      g.append('text')
        .attr('x', 0)
        .attr('y', 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', '12px')
        .text(node.title.length > 20 ? node.title.slice(0, 18) + '...' : node.title);
    });
  }

  const filteredCausality = getFilteredCausality();
  const unassignedCount = causality.filter(c => !c.plotlineId).length;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Link2 className="w-6 h-6 text-amber-400" />
          Causality Chains
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPlotlineManager(!showPlotlineManager)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
              showPlotlineManager ? 'bg-purple-500 text-white' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Layers className="w-4 h-4" />
            Plotlines
          </button>
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
      </div>

      {/* Plotline manager */}
      {showPlotlineManager && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-purple-500/50">
          <h3 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Manage Plotlines
          </h3>
          
          {/* Existing plotlines */}
          <div className="space-y-2 mb-3">
            {plotlines.map(pl => (
              <div key={pl.id} className="flex items-center gap-2 p-2 bg-gray-700/50 rounded">
                {editingPlotline?.id === pl.id ? (
                  <>
                    <input
                      type="color"
                      value={editingPlotline.color}
                      onChange={e => setEditingPlotline({ ...editingPlotline, color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editingPlotline.name}
                      onChange={e => setEditingPlotline({ ...editingPlotline, name: e.target.value })}
                      className="flex-1 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                    />
                    <button onClick={handleUpdatePlotline} className="px-2 py-1 bg-green-600 rounded text-sm">Save</button>
                    <button onClick={() => setEditingPlotline(null)} className="px-2 py-1 bg-gray-600 rounded text-sm">Cancel</button>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: pl.color }} />
                    <span className="flex-1 text-sm">{pl.name}</span>
                    <span className="text-xs text-gray-500">
                      {causality.filter(c => c.plotlineId === pl.id).length} links
                    </span>
                    <button onClick={() => setEditingPlotline({ ...pl })} className="p-1 hover:bg-gray-600 rounded">
                      <Edit2 className="w-3 h-3 text-gray-400" />
                    </button>
                    <button onClick={() => handleDeletePlotline(pl.id)} className="p-1 hover:bg-gray-600 rounded">
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add new plotline */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newPlotline.color}
              onChange={e => setNewPlotline({ ...newPlotline, color: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer"
            />
            <input
              type="text"
              placeholder="New plotline name..."
              value={newPlotline.name}
              onChange={e => setNewPlotline({ ...newPlotline, name: e.target.value })}
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
            />
            <button
              onClick={handleAddPlotline}
              className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 rounded text-sm font-medium"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Plotline filter tabs */}
      {plotlines.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400">Filter:</span>
          <button
            onClick={() => setSelectedPlotline(null)}
            className={`px-2 py-1 rounded text-xs ${
              selectedPlotline === null ? 'bg-gray-600 text-white' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All ({causality.length})
          </button>
          {plotlines.map(pl => (
            <button
              key={pl.id}
              onClick={() => setSelectedPlotline(pl.id)}
              className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                selectedPlotline === pl.id ? 'text-white' : 'text-gray-300 hover:opacity-80'
              }`}
              style={{ 
                backgroundColor: selectedPlotline === pl.id ? pl.color : `${pl.color}40`,
                borderColor: pl.color
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pl.color }} />
              {pl.name} ({causality.filter(c => c.plotlineId === pl.id).length})
            </button>
          ))}
          {unassignedCount > 0 && (
            <button
              onClick={() => setSelectedPlotline('unassigned')}
              className={`px-2 py-1 rounded text-xs ${
                selectedPlotline === 'unassigned' ? 'bg-gray-500 text-white' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Unassigned ({unassignedCount})
            </button>
          )}
        </div>
      )}

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
            {plotlines.length > 0 && (
              <select
                value={newLink.plotlineId}
                onChange={e => setNewLink({ ...newLink, plotlineId: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
              >
                <option value="">No plotline</option>
                {plotlines.map(pl => (
                  <option key={pl.id} value={pl.id}>{pl.name}</option>
                ))}
              </select>
            )}
            <button
              onClick={handleAddLink}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded text-sm font-medium"
            >
              Create Link
            </button>
          </div>
        </div>
      )}

      {/* Graph visualization */}
      <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* Causality list with plotline assignment */}
      <div className="mt-4 max-h-48 overflow-auto">
        <h3 className="text-sm font-medium text-gray-300 mb-2">
          {selectedPlotline ? `Links in ${selectedPlotline === 'unassigned' ? 'Unassigned' : getPlotlineName(selectedPlotline)}` : 'All Causality Links'}
          <span className="text-gray-500 ml-2">({filteredCausality.length})</span>
        </h3>
        {filteredCausality.length === 0 ? (
          <p className="text-sm text-gray-500">No causality links</p>
        ) : (
          <div className="space-y-1">
            {filteredCausality.map(link => (
              <div key={link.id} className="flex items-center gap-2 p-2 bg-gray-700/50 rounded text-sm">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: getPlotlineColor(link.plotlineId) }} 
                />
                <span className="text-blue-300">{getEventName(link.causeEventId)}</span>
                <ArrowRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-blue-300">{getEventName(link.effectEventId)}</span>
                {link.description && (
                  <span className="text-gray-500 truncate">({link.description})</span>
                )}
                <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                  {plotlines.length > 0 && (
                    <select
                      value={link.plotlineId || ''}
                      onChange={e => handleAssignPlotline(link.id, e.target.value)}
                      className="bg-gray-600 border border-gray-500 rounded px-1 py-0.5 text-xs"
                    >
                      <option value="">None</option>
                      {plotlines.map(pl => (
                        <option key={pl.id} value={pl.id}>{pl.name}</option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={() => handleRemoveLink(link.id)}
                    className="p-1 hover:bg-gray-600 rounded"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-6 text-xs text-gray-400">
        <span>Click events to view details</span>
        <span>Click links to remove</span>
        {plotlines.length > 0 && (
          <span className="flex items-center gap-1">
            <Palette className="w-3 h-3" /> Colors = plotlines
          </span>
        )}
      </div>
    </div>
  );
}
