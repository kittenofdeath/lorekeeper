import { useState, useEffect } from 'react';
import { analyzeWordFrequency, getTotalWordCount } from '../db';
import { BarChart3, RefreshCw, AlertTriangle } from 'lucide-react';

export default function WordFrequency() {
  const [words, setWords] = useState([]);
  const [totalWords, setTotalWords] = useState(0);
  const [minLength, setMinLength] = useState(4);
  const [limit, setLimit] = useState(50);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    analyze();
  }, []);

  async function analyze() {
    setIsAnalyzing(true);
    const freq = await analyzeWordFrequency(minLength, limit);
    setWords(freq);
    const total = await getTotalWordCount();
    setTotalWords(total);
    setIsAnalyzing(false);
  }

  const maxCount = words[0]?.count || 1;

  // Flag potentially overused words (appear more than 0.5% of total)
  const overusedThreshold = totalWords * 0.005;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          Word Frequency
        </h2>
        <button
          onClick={analyze}
          disabled={isAnalyzing}
          className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
        >
          <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <label className="text-gray-400">Min length:</label>
          <input
            type="number"
            value={minLength}
            onChange={e => setMinLength(Number(e.target.value))}
            className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1"
            min={2}
            max={10}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-gray-400">Show top:</label>
          <input
            type="number"
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1"
            min={10}
            max={200}
          />
        </div>
        <span className="text-gray-500">|</span>
        <span className="text-gray-400">Total: {totalWords.toLocaleString()} words</span>
      </div>

      <div className="flex-1 overflow-auto">
        {words.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No words to analyze</p>
            <p className="text-sm">Write some scenes first!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {words.map((item, i) => {
              const isOverused = item.count > overusedThreshold;
              const pct = (item.count / totalWords * 100).toFixed(2);
              
              return (
                <div key={item.word} className="flex items-center gap-2">
                  <span className="w-8 text-xs text-gray-500 text-right">{i + 1}.</span>
                  <div className="w-32 font-mono text-sm truncate flex items-center gap-1">
                    {item.word}
                    {isOverused && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                  </div>
                  <div className="flex-1 h-4 bg-gray-800 rounded overflow-hidden">
                    <div
                      className={`h-full ${isOverused ? 'bg-amber-500' : 'bg-blue-500'}`}
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-16 text-xs text-gray-400 text-right">{item.count}×</span>
                  <span className="w-16 text-xs text-gray-500 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>Words appearing more than 0.5% of total may be overused</span>
        </div>
      </div>
    </div>
  );
}
