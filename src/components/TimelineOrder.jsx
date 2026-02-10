import { useState, useEffect } from 'react';
import { getChronologicalOrder, getReadingOrder } from '../db';
import { List, Clock, BookOpen, ArrowDownUp } from 'lucide-react';

export default function TimelineOrder({ entities }) {
  const [chronological, setChronological] = useState([]);
  const [reading, setReading] = useState([]);
  const [mode, setMode] = useState('compare'); // 'compare' | 'chronological' | 'reading'

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const chron = await getChronologicalOrder();
    const read = await getReadingOrder();
    setChronological(chron);
    setReading(read);
  }

  function getLocationName(id) {
    return entities.find(e => e.id === id)?.name || '';
  }

  const SceneCard = ({ scene, showChapter = false }) => (
    <div className="p-2 bg-gray-800 rounded border border-gray-700 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium">{scene.title}</span>
        {scene.timeYear && <span className="text-xs text-amber-400">Year {scene.timeYear}</span>}
      </div>
      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
        {showChapter && scene.chapterTitle && <span>Ch: {scene.chapterTitle}</span>}
        {scene.locationId && <span>📍 {getLocationName(scene.locationId)}</span>}
        <span>{scene.wordCount || 0}w</span>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ArrowDownUp className="w-5 h-5 text-amber-400" />
          Timeline Order
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => setMode('compare')}
            className={`px-2 py-1 rounded text-xs ${mode === 'compare' ? 'bg-amber-500 text-gray-900' : 'bg-gray-700'}`}
          >
            Compare
          </button>
          <button
            onClick={() => setMode('chronological')}
            className={`px-2 py-1 rounded text-xs ${mode === 'chronological' ? 'bg-amber-500 text-gray-900' : 'bg-gray-700'}`}
          >
            <Clock className="w-3 h-3 inline mr-1" />
            Chronological
          </button>
          <button
            onClick={() => setMode('reading')}
            className={`px-2 py-1 rounded text-xs ${mode === 'reading' ? 'bg-amber-500 text-gray-900' : 'bg-gray-700'}`}
          >
            <BookOpen className="w-3 h-3 inline mr-1" />
            Reading
          </button>
        </div>
      </div>

      {mode === 'compare' ? (
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Reading Order */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
              <BookOpen className="w-4 h-4" /> Reading Order
            </h3>
            <div className="flex-1 overflow-auto space-y-1">
              {reading.map((scene, i) => (
                <div key={`r-${scene.id}`} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-6">{i + 1}</span>
                  <div className="flex-1"><SceneCard scene={scene} /></div>
                </div>
              ))}
              {reading.length === 0 && <p className="text-sm text-gray-500">No scenes</p>}
            </div>
          </div>

          {/* Chronological Order */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
              <Clock className="w-4 h-4" /> Chronological Order
            </h3>
            <div className="flex-1 overflow-auto space-y-1">
              {chronological.map((scene, i) => (
                <div key={`c-${scene.id}`} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-6">{i + 1}</span>
                  <div className="flex-1"><SceneCard scene={scene} showChapter /></div>
                </div>
              ))}
              {chronological.length === 0 && <p className="text-sm text-gray-500">No dated scenes</p>}
            </div>
          </div>
        </div>
      ) : mode === 'chronological' ? (
        <div className="flex-1 overflow-auto space-y-1">
          {chronological.map((scene, i) => (
            <div key={scene.id} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-6">{i + 1}</span>
              <div className="flex-1"><SceneCard scene={scene} showChapter /></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-auto space-y-1">
          {reading.map((scene, i) => (
            <div key={scene.id} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-6">{i + 1}</span>
              <div className="flex-1"><SceneCard scene={scene} /></div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
        <p>💡 <strong>Reading order:</strong> How scenes appear in the manuscript</p>
        <p>💡 <strong>Chronological:</strong> When events actually happen in-world (requires scene years)</p>
      </div>
    </div>
  );
}
