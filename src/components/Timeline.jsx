import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getAllEvents, getEventParticipants } from '../db';
import { Filter, ZoomIn, ZoomOut, Plus } from 'lucide-react';

export default function Timeline({ entities, spoilerMode, onSelectEvent, onSelectEntity }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [eventParticipants, setEventParticipants] = useState({});
  const [selectedEntities, setSelectedEntities] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [hoveredEvent, setHoveredEvent] = useState(null);

  useEffect(() => {
    loadEvents();
  }, [spoilerMode]);

  useEffect(() => {
    if (events.length > 0) {
      renderTimeline();
    }
  }, [events, selectedEntities, zoom, entities]);

  async function loadEvents() {
    let allEvents = await getAllEvents();
    if (!spoilerMode) {
      allEvents = allEvents.filter(e => !e.isSpoiler);
    }
    setEvents(allEvents);

    // Load participants for each event
    const parts = {};
    for (const evt of allEvents) {
      parts[evt.id] = await getEventParticipants(evt.id);
    }
    setEventParticipants(parts);
  }

  function toggleEntityFilter(entityId) {
    const newSet = new Set(selectedEntities);
    if (newSet.has(entityId)) {
      newSet.delete(entityId);
    } else {
      newSet.add(entityId);
    }
    setSelectedEntities(newSet);
  }

  function getEntityName(id) {
    const e = entities.find(x => x.id === id);
    return e ? e.name : '';
  }

  function getEntityColor(id) {
    const e = entities.find(x => x.id === id);
    if (!e) return '#888';
    switch (e.type) {
      case 'character': return '#3b82f6';
      case 'faction': return '#eab308';
      case 'location': return '#22c55e';
      case 'item': return '#a855f7';
      case 'concept': return '#f97316';
      default: return '#888';
    }
  }

  function renderTimeline() {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 40, right: 40, bottom: 60, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Filter entities to show
    let entitiesToShow = entities.filter(e => e.type === 'character' || e.type === 'faction');
    if (selectedEntities.size > 0) {
      entitiesToShow = entitiesToShow.filter(e => selectedEntities.has(e.id));
    }
    entitiesToShow = entitiesToShow.slice(0, 15); // Limit for readability

    // Filter events that involve selected entities
    let filteredEvents = events;
    if (selectedEntities.size > 0) {
      filteredEvents = events.filter(evt => {
        const parts = eventParticipants[evt.id] || [];
        return parts.some(p => selectedEntities.has(p.entityId));
      });
    }

    // Calculate time range
    const allDates = [
      ...entitiesToShow.flatMap(e => [e.birthDate, e.deathDate].filter(Boolean)),
      ...filteredEvents.flatMap(e => [e.startDate, e.endDate].filter(Boolean))
    ].filter(Boolean);

    if (allDates.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#666')
        .text('No data to display. Load some data first.');
      return;
    }

    const minYear = Math.min(...allDates) - 10;
    const maxYear = Math.max(...allDates) + 10;

    // Scales
    const xScale = d3.scaleLinear()
      .domain([minYear, maxYear])
      .range([0, innerWidth * zoom]);

    const yScale = d3.scaleBand()
      .domain(entitiesToShow.map(e => e.id))
      .range([0, innerHeight])
      .padding(0.3);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add clip path for scrolling
    svg.append('defs')
      .append('clipPath')
      .attr('id', 'timeline-clip')
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight);

    // Grid lines
    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.min(20, (maxYear - minYear) / 10))
      .tickFormat(d => d);

    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#888');

    g.selectAll('.domain, .tick line')
      .attr('stroke', '#444');

    // Vertical grid lines
    g.selectAll('.grid-line')
      .data(xScale.ticks(20))
      .join('line')
      .attr('class', 'grid-line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#333')
      .attr('stroke-dasharray', '2,2');

    // Content group with clipping
    const content = g.append('g')
      .attr('clip-path', 'url(#timeline-clip)');

    // Entity labels (Y axis)
    g.selectAll('.entity-label')
      .data(entitiesToShow)
      .join('text')
      .attr('class', 'entity-label')
      .attr('x', -10)
      .attr('y', d => yScale(d.id) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', d => getEntityColor(d.id))
      .attr('font-size', '12px')
      .attr('cursor', 'pointer')
      .text(d => d.name.length > 18 ? d.name.slice(0, 16) + '...' : d.name)
      .on('click', (e, d) => onSelectEntity(d.id));

    // Lifespan bars
    content.selectAll('.lifespan')
      .data(entitiesToShow.filter(e => e.birthDate))
      .join('rect')
      .attr('class', 'lifespan')
      .attr('x', d => xScale(d.birthDate))
      .attr('y', d => yScale(d.id) + yScale.bandwidth() * 0.3)
      .attr('width', d => {
        const end = d.deathDate || maxYear;
        return Math.max(0, xScale(end) - xScale(d.birthDate));
      })
      .attr('height', yScale.bandwidth() * 0.4)
      .attr('fill', d => getEntityColor(d.id))
      .attr('opacity', 0.3)
      .attr('rx', 2);

    // Birth markers
    content.selectAll('.birth')
      .data(entitiesToShow.filter(e => e.birthDate))
      .join('circle')
      .attr('class', 'birth')
      .attr('cx', d => xScale(d.birthDate))
      .attr('cy', d => yScale(d.id) + yScale.bandwidth() / 2)
      .attr('r', 5)
      .attr('fill', d => getEntityColor(d.id))
      .attr('stroke', '#111')
      .attr('stroke-width', 2);

    // Death markers
    content.selectAll('.death')
      .data(entitiesToShow.filter(e => e.deathDate))
      .join('g')
      .attr('class', 'death')
      .attr('transform', d => `translate(${xScale(d.deathDate)}, ${yScale(d.id) + yScale.bandwidth() / 2})`)
      .each(function(d) {
        const g = d3.select(this);
        g.append('line')
          .attr('x1', -4).attr('y1', -4)
          .attr('x2', 4).attr('y2', 4)
          .attr('stroke', '#ef4444').attr('stroke-width', 2);
        g.append('line')
          .attr('x1', -4).attr('y1', 4)
          .attr('x2', 4).attr('y2', -4)
          .attr('stroke', '#ef4444').attr('stroke-width', 2);
      });

    // Event markers
    filteredEvents.forEach(evt => {
      const parts = eventParticipants[evt.id] || [];
      const involvedIds = parts.map(p => p.entityId);
      const visibleInvolved = entitiesToShow.filter(e => involvedIds.includes(e.id));

      if (visibleInvolved.length > 0) {
        // Draw vertical line connecting all participants
        const yPositions = visibleInvolved.map(e => yScale(e.id) + yScale.bandwidth() / 2);
        const minY = Math.min(...yPositions);
        const maxY = Math.max(...yPositions);

        content.append('line')
          .attr('class', 'event-line')
          .attr('x1', xScale(evt.startDate))
          .attr('x2', xScale(evt.startDate))
          .attr('y1', minY)
          .attr('y2', maxY)
          .attr('stroke', '#f59e0b')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '4,2')
          .attr('opacity', 0.6);

        // Event diamond at each participant
        visibleInvolved.forEach(entity => {
          const y = yScale(entity.id) + yScale.bandwidth() / 2;
          content.append('path')
            .attr('d', d3.symbol().type(d3.symbolDiamond).size(80))
            .attr('transform', `translate(${xScale(evt.startDate)}, ${y})`)
            .attr('fill', '#f59e0b')
            .attr('stroke', '#111')
            .attr('stroke-width', 1)
            .attr('cursor', 'pointer')
            .on('click', () => onSelectEvent(evt.id))
            .on('mouseenter', function() {
              d3.select(this).attr('fill', '#fbbf24').attr('transform', `translate(${xScale(evt.startDate)}, ${y}) scale(1.3)`);
              setHoveredEvent(evt);
            })
            .on('mouseleave', function() {
              d3.select(this).attr('fill', '#f59e0b').attr('transform', `translate(${xScale(evt.startDate)}, ${y}) scale(1)`);
              setHoveredEvent(null);
            });
        });
      }
    });

    // Enable panning
    const zoomBehavior = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        content.attr('transform', `translate(${event.transform.x}, 0) scale(${event.transform.k}, 1)`);
      });

    svg.call(zoomBehavior);
  }

  const characters = entities.filter(e => e.type === 'character');
  const factions = entities.filter(e => e.type === 'faction');

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Timeline</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
              showFilters ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters {selectedEntities.size > 0 && `(${selectedEntities.size})`}
          </button>
          <button
            onClick={() => onSelectEvent('new')}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Filter by Character/Faction</h3>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-auto">
            {[...characters, ...factions].map(entity => (
              <button
                key={entity.id}
                onClick={() => toggleEntityFilter(entity.id)}
                className={`px-2 py-1 rounded text-sm transition-colors ${
                  selectedEntities.has(entity.id)
                    ? 'bg-amber-500 text-gray-900'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {entity.name}
              </button>
            ))}
          </div>
          {selectedEntities.size > 0 && (
            <button
              onClick={() => setSelectedEntities(new Set())}
              className="mt-2 text-sm text-amber-400 hover:text-amber-300"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Timeline Canvas */}
      <div ref={containerRef} className="flex-1 bg-gray-800 rounded-lg border border-gray-700 relative overflow-hidden">
        <svg ref={svgRef} className="w-full h-full" />
        
        {/* Event Tooltip */}
        {hoveredEvent && (
          <div className="absolute top-4 right-4 p-3 bg-gray-900 border border-gray-600 rounded-lg shadow-lg max-w-xs">
            <h4 className="font-semibold text-amber-400">{hoveredEvent.title}</h4>
            <p className="text-sm text-gray-400">Year {hoveredEvent.startDate}</p>
            {hoveredEvent.description && (
              <p className="text-sm mt-1 text-gray-300 line-clamp-3">{hoveredEvent.description}</p>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-6 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-500" /> Birth
        </span>
        <span className="flex items-center gap-1">
          <span className="text-red-500">✕</span> Death
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rotate-45 bg-amber-500" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} /> Event
        </span>
        <span className="flex items-center gap-1">
          <span className="w-8 h-2 bg-blue-500 opacity-30 rounded" /> Lifespan
        </span>
      </div>
    </div>
  );
}
