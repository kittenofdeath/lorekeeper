import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getArcPointsForEntity, addArcPoint, deleteArcPoint, getEventsForEntity, getArcDimensions, addArcDimension, updateArcDimension, deleteArcDimension } from '../db';
import { Plus, Trash2, TrendingUp, Crown, Heart, Swords, Settings, Edit2, Tag } from 'lucide-react';

const DEFAULT_DIMENSIONS = [
  { id: 'power', name: 'Power/Influence', color: '#eab308', icon: 'Crown', isDefault: true },
  { id: 'morality', name: 'Morality', color: '#22c55e', icon: 'Heart', isDefault: true },
  { id: 'danger', name: 'Danger Level', color: '#ef4444', icon: 'Swords', isDefault: true },
];

const ICON_MAP = { Crown, Heart, Swords, TrendingUp };
const ICON_OPTIONS = ['Crown', 'Heart', 'Swords', 'TrendingUp'];
const COLOR_PRESETS = ['#eab308', '#22c55e', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function CharacterArc({ entity, allEntities, onClose }) {
  const chartRef = useRef(null);
  const [arcPoints, setArcPoints] = useState([]);
  const [events, setEvents] = useState([]);
  const [customDimensions, setCustomDimensions] = useState([]);
  const [selectedDimension, setSelectedDimension] = useState('power');
  const [showAddPoint, setShowAddPoint] = useState(false);
  const [showDimensionManager, setShowDimensionManager] = useState(false);
  const [newPoint, setNewPoint] = useState({ year: '', value: 50, tags: '' });
  const [newDimension, setNewDimension] = useState({ name: '', color: '#8b5cf6', icon: 'TrendingUp', description: '' });
  const [editingDimension, setEditingDimension] = useState(null);

  // Combine default and custom dimensions
  const allDimensions = [...DEFAULT_DIMENSIONS, ...customDimensions.map(d => ({ ...d, id: String(d.id) }))];

  useEffect(() => {
    loadDimensions();
  }, []);

  useEffect(() => {
    if (entity?.id) {
      loadData();
    }
  }, [entity?.id]);

  useEffect(() => {
    renderChart();
  }, [arcPoints, events, selectedDimension, allDimensions]);

  async function loadDimensions() {
    const dims = await getArcDimensions();
    setCustomDimensions(dims);
  }

  async function loadData() {
    const points = await getArcPointsForEntity(entity.id);
    setArcPoints(points);
    const evts = await getEventsForEntity(entity.id);
    setEvents(evts.sort((a, b) => (a.startDate || 0) - (b.startDate || 0)));
  }

  async function handleAddPoint() {
    if (newPoint.year) {
      await addArcPoint(entity.id, Number(newPoint.year), newPoint.value, selectedDimension);
      setNewPoint({ year: '', value: 50, tags: '' });
      setShowAddPoint(false);
      loadData();
    }
  }

  async function handleDeletePoint(pointId) {
    await deleteArcPoint(pointId);
    loadData();
  }

  async function handleAddDimension() {
    if (newDimension.name.trim()) {
      await addArcDimension(newDimension.name.trim(), newDimension.color, newDimension.icon, newDimension.description);
      setNewDimension({ name: '', color: COLOR_PRESETS[customDimensions.length % COLOR_PRESETS.length], icon: 'TrendingUp', description: '' });
      loadDimensions();
    }
  }

  async function handleUpdateDimension() {
    if (editingDimension && editingDimension.name.trim()) {
      await updateArcDimension(editingDimension.id, {
        name: editingDimension.name.trim(),
        color: editingDimension.color,
        icon: editingDimension.icon,
        description: editingDimension.description
      });
      setEditingDimension(null);
      loadDimensions();
    }
  }

  async function handleDeleteDimension(id) {
    if (confirm('Delete this dimension? All arc points using it will be removed.')) {
      await deleteArcDimension(id);
      if (selectedDimension === String(id)) {
        setSelectedDimension('power');
      }
      loadDimensions();
      loadData();
    }
  }

  function getDimension(dimId) {
    return allDimensions.find(d => d.id === dimId) || { name: dimId, color: '#888', icon: 'TrendingUp' };
  }

  function renderChart() {
    const container = chartRef.current;
    if (!container) return;

    const svg = d3.select(container);
    svg.selectAll('*').remove();

    const width = container.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const currentDim = getDimension(selectedDimension);
    const dimensionPoints = arcPoints
      .filter(p => p.dimension === selectedDimension)
      .sort((a, b) => a.year - b.year);

    const allYears = [
      entity.birthDate,
      entity.deathDate,
      ...events.map(e => e.startDate),
      ...dimensionPoints.map(p => p.year)
    ].filter(Boolean);

    if (allYears.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#666')
        .text('No data available. Add arc points or events.');
      return;
    }

    const minYear = Math.min(...allYears) - 5;
    const maxYear = Math.max(...allYears) + 5;

    const xScale = d3.scaleLinear().domain([minYear, maxYear]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    svg.insert('rect', ':first-child')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#1a202c');

    g.selectAll('.grid-y')
      .data([0, 25, 50, 75, 100])
      .join('line')
      .attr('class', 'grid-y')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#333')
      .attr('stroke-dasharray', '2,2');

    const xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d => d);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#888');

    g.append('g').call(yAxis).selectAll('text').attr('fill', '#888');
    g.selectAll('.domain, .tick line').attr('stroke', '#444');

    // Life span area
    if (entity.birthDate) {
      const lifeStart = xScale(entity.birthDate);
      const lifeEnd = entity.deathDate ? xScale(entity.deathDate) : innerWidth;
      
      g.append('rect')
        .attr('x', lifeStart)
        .attr('y', 0)
        .attr('width', lifeEnd - lifeStart)
        .attr('height', innerHeight)
        .attr('fill', '#3b82f6')
        .attr('opacity', 0.1);

      g.append('line')
        .attr('x1', lifeStart)
        .attr('x2', lifeStart)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,2');

      g.append('text')
        .attr('x', lifeStart + 5)
        .attr('y', 15)
        .attr('fill', '#3b82f6')
        .attr('font-size', '10px')
        .text('Birth');

      if (entity.deathDate) {
        g.append('line')
          .attr('x1', lifeEnd)
          .attr('x2', lifeEnd)
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .attr('stroke', '#ef4444')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '4,2');

        g.append('text')
          .attr('x', lifeEnd - 30)
          .attr('y', 15)
          .attr('fill', '#ef4444')
          .attr('font-size', '10px')
          .text('Death');
      }
    }

    // Event markers
    events.forEach(evt => {
      const x = xScale(evt.startDate);
      g.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', 0.5);

      g.append('circle')
        .attr('cx', x)
        .attr('cy', innerHeight + 15)
        .attr('r', 4)
        .attr('fill', '#f59e0b');
    });

    // Draw arc line
    if (dimensionPoints.length >= 2) {
      const dimColor = currentDim.color;
      
      const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(dimensionPoints)
        .attr('fill', 'none')
        .attr('stroke', dimColor)
        .attr('stroke-width', 3)
        .attr('d', line);

      const area = d3.area()
        .x(d => xScale(d.year))
        .y0(innerHeight)
        .y1(d => yScale(d.value))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(dimensionPoints)
        .attr('fill', dimColor)
        .attr('opacity', 0.1)
        .attr('d', area);
    }

    // Draw arc points
    dimensionPoints.forEach(point => {
      const dimColor = currentDim.color;
      
      g.append('circle')
        .attr('cx', xScale(point.year))
        .attr('cy', yScale(point.value))
        .attr('r', 8)
        .attr('fill', dimColor)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('cursor', 'pointer')
        .on('click', () => {
          if (confirm(`Delete point at year ${point.year}?`)) {
            handleDeletePoint(point.id);
          }
        });

      g.append('text')
        .attr('x', xScale(point.year))
        .attr('y', yScale(point.value) - 12)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', '10px')
        .text(point.value);
    });

    // Y-axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#888')
      .attr('font-size', '12px')
      .text(currentDim.name || 'Value');
  }

  if (!entity) return null;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Character Arc: {entity.name}
          </h2>
          <p className="text-sm text-gray-400">
            {entity.birthDate && `${entity.birthDate}`}
            {entity.deathDate && ` - ${entity.deathDate} (${entity.deathDate - entity.birthDate} years)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDimensionManager(!showDimensionManager)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
              showDimensionManager ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Settings className="w-4 h-4" />
            Dimensions
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
      </div>

      {/* Dimension manager */}
      {showDimensionManager && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-purple-500/50">
          <h3 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Custom Arc Dimensions
          </h3>
          <p className="text-xs text-gray-400 mb-3">
            Create custom dimensions to track any aspect of character development: wealth, knowledge, relationships, corruption, fame, etc.
          </p>
          
          {/* Custom dimensions list */}
          <div className="space-y-2 mb-3">
            {customDimensions.map(dim => (
              <div key={dim.id} className="flex items-center gap-2 p-2 bg-gray-700/50 rounded">
                {editingDimension?.id === dim.id ? (
                  <>
                    <input
                      type="color"
                      value={editingDimension.color}
                      onChange={e => setEditingDimension({ ...editingDimension, color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <select
                      value={editingDimension.icon}
                      onChange={e => setEditingDimension({ ...editingDimension, icon: e.target.value })}
                      className="bg-gray-600 border border-gray-500 rounded px-1 py-1 text-sm"
                    >
                      {ICON_OPTIONS.map(ico => (
                        <option key={ico} value={ico}>{ico}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={editingDimension.name}
                      onChange={e => setEditingDimension({ ...editingDimension, name: e.target.value })}
                      className="flex-1 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                    />
                    <button onClick={handleUpdateDimension} className="px-2 py-1 bg-green-600 rounded text-sm">Save</button>
                    <button onClick={() => setEditingDimension(null)} className="px-2 py-1 bg-gray-600 rounded text-sm">Cancel</button>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: dim.color }} />
                    {ICON_MAP[dim.icon] && (() => {
                      const Icon = ICON_MAP[dim.icon];
                      return <Icon className="w-4 h-4" style={{ color: dim.color }} />;
                    })()}
                    <span className="flex-1 text-sm">{dim.name}</span>
                    <span className="text-xs text-gray-500">
                      {arcPoints.filter(p => p.dimension === String(dim.id)).length} points
                    </span>
                    <button onClick={() => setEditingDimension({ ...dim })} className="p-1 hover:bg-gray-600 rounded">
                      <Edit2 className="w-3 h-3 text-gray-400" />
                    </button>
                    <button onClick={() => handleDeleteDimension(dim.id)} className="p-1 hover:bg-gray-600 rounded">
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </>
                )}
              </div>
            ))}
            {customDimensions.length === 0 && (
              <p className="text-xs text-gray-500">No custom dimensions yet. Create one below.</p>
            )}
          </div>

          {/* Add new dimension */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newDimension.color}
              onChange={e => setNewDimension({ ...newDimension, color: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer"
            />
            <select
              value={newDimension.icon}
              onChange={e => setNewDimension({ ...newDimension, icon: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-1 py-1 text-sm"
            >
              {ICON_OPTIONS.map(ico => (
                <option key={ico} value={ico}>{ico}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Dimension name (e.g., Wealth, Knowledge)"
              value={newDimension.name}
              onChange={e => setNewDimension({ ...newDimension, name: e.target.value })}
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
            />
            <button
              onClick={handleAddDimension}
              className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 rounded text-sm font-medium"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Dimension selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {allDimensions.map(dim => {
          const Icon = ICON_MAP[dim.icon] || TrendingUp;
          return (
            <button
              key={dim.id}
              onClick={() => setSelectedDimension(dim.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedDimension === dim.id
                  ? 'text-gray-900 font-medium'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              style={{ backgroundColor: selectedDimension === dim.id ? dim.color : undefined }}
            >
              <Icon className="w-4 h-4" />
              {dim.name}
              {!dim.isDefault && <span className="text-xs opacity-60">(custom)</span>}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 mb-4">
        <svg ref={chartRef} className="w-full" style={{ height: '300px' }} />
      </div>

      {/* Add point controls */}
      <div className="flex items-center gap-4 mb-4">
        {showAddPoint ? (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="number"
              placeholder="Year"
              value={newPoint.year}
              onChange={e => setNewPoint({ ...newPoint, year: e.target.value })}
              className="w-24 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            />
            <input
              type="range"
              min="0"
              max="100"
              value={newPoint.value}
              onChange={e => setNewPoint({ ...newPoint, value: Number(e.target.value) })}
              className="w-32"
            />
            <span className="text-sm w-8">{newPoint.value}</span>
            <input
              type="text"
              placeholder="Tags (optional, comma-separated)"
              value={newPoint.tags}
              onChange={e => setNewPoint({ ...newPoint, tags: e.target.value })}
              className="w-48 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            />
            <button
              onClick={handleAddPoint}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded text-sm"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddPoint(false)}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddPoint(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Arc Point
          </button>
        )}
      </div>

      {/* Arc points list for current dimension */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-300 mb-2">
          Points for {getDimension(selectedDimension).name}
        </h3>
        <div className="space-y-1 max-h-32 overflow-auto">
          {arcPoints.filter(p => p.dimension === selectedDimension).length === 0 ? (
            <p className="text-sm text-gray-500">No points yet. Add one above.</p>
          ) : (
            arcPoints
              .filter(p => p.dimension === selectedDimension)
              .sort((a, b) => a.year - b.year)
              .map(point => (
                <div key={point.id} className="text-sm flex items-center gap-2 p-2 bg-gray-700/50 rounded">
                  <span className="text-gray-400">Year {point.year}:</span>
                  <span className="font-medium" style={{ color: getDimension(selectedDimension).color }}>
                    {point.value}/100
                  </span>
                  {point.tags && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {point.tags}
                    </span>
                  )}
                  <button
                    onClick={() => handleDeletePoint(point.id)}
                    className="ml-auto p-1 hover:bg-gray-600 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Events list */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-2">Key Events</h3>
        <div className="space-y-1 max-h-32 overflow-auto">
          {events.length === 0 ? (
            <p className="text-sm text-gray-500">No events involving this character</p>
          ) : (
            events.map(evt => (
              <div key={evt.id} className="text-sm flex items-center gap-2 p-2 bg-gray-700/50 rounded">
                <span className="text-amber-400">Year {evt.startDate}</span>
                <span>{evt.title}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-700 flex items-center gap-6 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-4 h-0.5 bg-blue-500" /> Lifespan
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Event
        </span>
        <span>Click points to delete</span>
      </div>
    </div>
  );
}
