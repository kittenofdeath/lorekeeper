import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getAllEvents, getEventParticipants, getLocationPositions, setLocationPosition, getProjectSettings, updateProjectSettings } from '../db';
import { Play, Pause, SkipBack, SkipForward, Upload, Move, Save } from 'lucide-react';

// Default fantasy map layout
const defaultPositions = {
  'Winterfell': { x: 0.5, y: 0.25 },
  'The Wall': { x: 0.5, y: 0.08 },
  'Castle Black': { x: 0.5, y: 0.1 },
  "King's Landing": { x: 0.55, y: 0.7 },
  'The Twins': { x: 0.45, y: 0.45 },
  'Dragonstone': { x: 0.65, y: 0.65 },
};

export default function MapView({ entities, spoilerMode, onSelectEntity, onSelectEvent }) {
  const mapRef = useRef(null);
  const timelineRef = useRef(null);
  const fileInputRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [eventParticipants, setEventParticipants] = useState({});
  const [currentYear, setCurrentYear] = useState(280);
  const [isPlaying, setIsPlaying] = useState(false);
  const [yearRange, setYearRange] = useState({ min: 260, max: 310 });
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [customMapImage, setCustomMapImage] = useState(null);
  const [locationPositions, setLocationPositionsState] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [draggedLocation, setDraggedLocation] = useState(null);
  const playIntervalRef = useRef(null);

  const locations = entities.filter(e => e.type === 'location');

  useEffect(() => {
    loadData();
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [spoilerMode]);

  useEffect(() => {
    renderMap();
  }, [locations, visibleEvents, currentYear, customMapImage, locationPositions, editMode]);

  useEffect(() => {
    renderTimeline();
  }, [events, currentYear]);

  useEffect(() => {
    const visible = events.filter(e => {
      const start = e.startDate || 0;
      const end = e.endDate || start;
      return start <= currentYear && end >= currentYear - 5;
    });
    setVisibleEvents(visible);
  }, [currentYear, events]);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentYear(y => {
          if (y >= yearRange.max) {
            setIsPlaying(false);
            return yearRange.max;
          }
          return y + 1;
        });
      }, 500);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, yearRange.max]);

  async function loadData() {
    // Load events
    let allEvents = await getAllEvents();
    if (!spoilerMode) {
      allEvents = allEvents.filter(e => !e.isSpoiler);
    }
    setEvents(allEvents);

    const parts = {};
    for (const evt of allEvents) {
      parts[evt.id] = await getEventParticipants(evt.id);
    }
    setEventParticipants(parts);

    // Calculate year range
    const years = allEvents.flatMap(e => [e.startDate, e.endDate].filter(Boolean));
    if (years.length > 0) {
      setYearRange({
        min: Math.min(...years) - 10,
        max: Math.max(...years) + 5
      });
      setCurrentYear(Math.min(...years));
    }

    // Load custom map and positions
    const settings = await getProjectSettings();
    if (settings.customMapImage) {
      setCustomMapImage(settings.customMapImage);
    }

    const positions = await getLocationPositions();
    const posMap = {};
    positions.forEach(p => {
      posMap[p.locationId] = { x: p.x, y: p.y };
    });
    setLocationPositionsState(posMap);
  }

  function getLocationPosition(location) {
    // Check saved positions first
    if (locationPositions[location.id]) {
      return locationPositions[location.id];
    }
    // Check default positions by name
    for (const [name, pos] of Object.entries(defaultPositions)) {
      if (location.name.toLowerCase().includes(name.toLowerCase()) || 
          name.toLowerCase().includes(location.name.toLowerCase())) {
        return pos;
      }
    }
    // Random position for unknown locations
    return { 
      x: 0.2 + (location.id * 0.1) % 0.6, 
      y: 0.2 + (location.id * 0.15) % 0.6 
    };
  }

  async function handleMapUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target.result;
        setCustomMapImage(imageData);
        await updateProjectSettings({ customMapImage: imageData });
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleLocationDrag(locationId, x, y) {
    const newPositions = { ...locationPositions, [locationId]: { x, y } };
    setLocationPositionsState(newPositions);
  }

  async function savePositions() {
    for (const [locationId, pos] of Object.entries(locationPositions)) {
      await setLocationPosition(Number(locationId), pos.x, pos.y);
    }
    setEditMode(false);
  }

  function renderMap() {
    const container = mapRef.current;
    if (!container) return;

    const svg = d3.select(container);
    svg.selectAll('*').remove();

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Background
    if (customMapImage) {
      svg.append('image')
        .attr('href', customMapImage)
        .attr('width', width)
        .attr('height', height)
        .attr('preserveAspectRatio', 'xMidYMid slice');
    } else {
      // Default gradient background
      const defs = svg.append('defs');
      const gradient = defs.append('linearGradient')
        .attr('id', 'map-bg')
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '0%').attr('y2', '100%');
      gradient.append('stop').attr('offset', '0%').attr('stop-color', '#1a365d');
      gradient.append('stop').attr('offset', '50%').attr('stop-color', '#1e3a5f');
      gradient.append('stop').attr('offset', '100%').attr('stop-color', '#2d3748');

      svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'url(#map-bg)');

      // Draw "The Wall" line
      svg.append('line')
        .attr('x1', width * 0.1)
        .attr('x2', width * 0.9)
        .attr('y1', height * 0.12)
        .attr('y2', height * 0.12)
        .attr('stroke', '#a0aec0')
        .attr('stroke-width', 4)
        .attr('stroke-dasharray', '10,5');

      svg.append('text')
        .attr('x', width * 0.5)
        .attr('y', height * 0.12 - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#a0aec0')
        .attr('font-size', '10px')
        .text('THE WALL');
    }

    // Draw locations
    locations.forEach(loc => {
      const pos = getLocationPosition(loc);
      const x = pos.x * width;
      const y = pos.y * height;

      const eventsAtLocation = visibleEvents.filter(e => e.locationId === loc.id);
      const hasEvents = eventsAtLocation.length > 0;

      const g = svg.append('g')
        .attr('transform', `translate(${x}, ${y})`)
        .attr('cursor', editMode ? 'move' : 'pointer')
        .attr('data-location-id', loc.id);

      if (editMode) {
        // Make draggable in edit mode
        g.call(d3.drag()
          .on('drag', function(event) {
            const newX = Math.max(0, Math.min(1, event.x / width));
            const newY = Math.max(0, Math.min(1, event.y / height));
            d3.select(this).attr('transform', `translate(${event.x}, ${event.y})`);
            handleLocationDrag(loc.id, newX, newY);
          })
        );

        // Edit mode indicator
        g.append('circle')
          .attr('r', 25)
          .attr('fill', 'none')
          .attr('stroke', '#3b82f6')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '4,2');
      }

      // Glow effect for locations with events
      if (hasEvents) {
        g.append('circle')
          .attr('r', 20)
          .attr('fill', '#f59e0b')
          .attr('opacity', 0.3);
        
        g.append('circle')
          .attr('r', 12)
          .attr('fill', '#f59e0b')
          .attr('opacity', 0.5);
      }

      g.append('circle')
        .attr('r', hasEvents ? 8 : 5)
        .attr('fill', hasEvents ? '#f59e0b' : '#22c55e')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

      g.append('text')
        .attr('y', hasEvents ? -15 : -10)
        .attr('text-anchor', 'middle')
        .attr('fill', hasEvents ? '#fbbf24' : '#9ca3af')
        .attr('font-size', hasEvents ? '12px' : '10px')
        .attr('font-weight', hasEvents ? 'bold' : 'normal')
        .text(loc.name);

      if (eventsAtLocation.length > 0) {
        g.append('circle')
          .attr('cx', 10)
          .attr('cy', -5)
          .attr('r', 8)
          .attr('fill', '#ef4444');
        
        g.append('text')
          .attr('x', 10)
          .attr('y', -2)
          .attr('text-anchor', 'middle')
          .attr('fill', '#fff')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .text(eventsAtLocation.length);
      }

      if (!editMode) {
        g.on('click', () => onSelectEntity(loc.id));
      }
    });

    // Year display
    svg.append('text')
      .attr('x', width - 20)
      .attr('y', 30)
      .attr('text-anchor', 'end')
      .attr('fill', '#fbbf24')
      .attr('font-size', '24px')
      .attr('font-weight', 'bold')
      .text(`Year ${currentYear}`);
  }

  function renderTimeline() {
    const container = timelineRef.current;
    if (!container) return;

    const svg = d3.select(container);
    svg.selectAll('*').remove();

    const width = container.clientWidth;
    const height = 80;
    const margin = { left: 40, right: 40 };

    const xScale = d3.scaleLinear()
      .domain([yearRange.min, yearRange.max])
      .range([margin.left, width - margin.right]);

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#1a202c');

    const xAxis = d3.axisBottom(xScale)
      .ticks(10)
      .tickFormat(d => d);

    svg.append('g')
      .attr('transform', `translate(0, ${height - 25})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#888');

    svg.selectAll('.domain, .tick line')
      .attr('stroke', '#444');

    // Event markers on timeline
    events.forEach(evt => {
      const x = xScale(evt.startDate);
      svg.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', 10)
        .attr('y2', height - 30)
        .attr('stroke', evt.isSpoiler ? '#ef4444' : '#f59e0b')
        .attr('stroke-width', 2)
        .attr('opacity', 0.6)
        .attr('cursor', 'pointer')
        .on('click', () => {
          setCurrentYear(evt.startDate);
          onSelectEvent(evt.id);
        });
    });

    // Current year indicator
    const currentX = xScale(currentYear);
    svg.append('line')
      .attr('x1', currentX)
      .attr('x2', currentX)
      .attr('y1', 0)
      .attr('y2', height - 20)
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3);

    svg.append('polygon')
      .attr('points', `${currentX - 8},0 ${currentX + 8},0 ${currentX},10`)
      .attr('fill', '#3b82f6');

    // Draggable area
    svg.append('rect')
      .attr('x', margin.left)
      .attr('y', 0)
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - 20)
      .attr('fill', 'transparent')
      .attr('cursor', 'pointer')
      .on('click', function(event) {
        const [mouseX] = d3.pointer(event);
        const year = Math.round(xScale.invert(mouseX));
        setCurrentYear(Math.max(yearRange.min, Math.min(yearRange.max, year)));
      });
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Map View</h2>
        <div className="flex items-center gap-2">
          {/* Map controls */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleMapUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
          >
            <Upload className="w-4 h-4" />
            Upload Map
          </button>
          <button
            onClick={() => editMode ? savePositions() : setEditMode(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
              editMode ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {editMode ? <Save className="w-4 h-4" /> : <Move className="w-4 h-4" />}
            {editMode ? 'Save Positions' : 'Edit Positions'}
          </button>
          
          {/* Playback controls */}
          <div className="ml-4 flex items-center gap-1">
            <button
              onClick={() => setCurrentYear(yearRange.min)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-lg ${isPlaying ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setCurrentYear(yearRange.max)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
          <span className="ml-2 text-lg font-bold text-amber-400">Year {currentYear}</span>
        </div>
      </div>

      {editMode && (
        <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-300">
          <Move className="w-4 h-4 inline mr-2" />
          Drag locations to reposition them on the map. Click "Save Positions" when done.
        </div>
      )}

      {/* Map */}
      <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden relative">
        <svg ref={mapRef} className="w-full h-full" />
        
        {/* Events Panel */}
        {visibleEvents.length > 0 && !editMode && (
          <div className="absolute bottom-4 left-4 right-4 max-h-32 overflow-auto bg-gray-900/90 rounded-lg p-3 border border-gray-700">
            <h3 className="text-sm font-semibold text-amber-400 mb-2">
              Events around Year {currentYear}
            </h3>
            <div className="space-y-1">
              {visibleEvents.slice(0, 5).map(evt => (
                <div 
                  key={evt.id}
                  className="text-sm cursor-pointer hover:text-amber-300 flex items-center gap-2"
                  onClick={() => onSelectEvent(evt.id)}
                >
                  <span className="text-gray-400">Year {evt.startDate}:</span>
                  <span>{evt.title}</span>
                </div>
              ))}
              {visibleEvents.length > 5 && (
                <p className="text-xs text-gray-500">+{visibleEvents.length - 5} more</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Timeline Scrubber */}
      <div className="mt-4">
        <svg ref={timelineRef} className="w-full h-20" />
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-6 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-500" /> Location
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-amber-500" /> Location with Events
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-amber-500" /> Event on Timeline
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-blue-500" /> Current Year
        </span>
      </div>
    </div>
  );
}
