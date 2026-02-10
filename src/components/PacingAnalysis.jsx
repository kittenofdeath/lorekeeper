import { useState, useEffect } from 'react';
import { analyzePacing } from '../db';
import { BarChart3, RefreshCw, AlertTriangle, Check } from 'lucide-react';

export default function PacingAnalysis({ entities }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    runAnalysis();
  }, []);

  async function runAnalysis() {
    setIsAnalyzing(true);
    const result = await analyzePacing();
    setAnalysis(result);
    setIsAnalyzing(false);
  }

  function getCharName(id) {
    return entities.find(e => e.id === id)?.name || '';
  }

  if (!analysis) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const { chapters, avgChapterWords, avgSceneCount } = analysis;
  
  // Calculate variance for consistency check
  const wordCounts = chapters.map(c => c.totalWords);
  const variance = wordCounts.length > 1 
    ? Math.sqrt(wordCounts.reduce((sum, w) => sum + Math.pow(w - avgChapterWords, 2), 0) / wordCounts.length)
    : 0;
  const coefficientOfVariation = avgChapterWords > 0 ? (variance / avgChapterWords * 100).toFixed(0) : 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          Pacing Analysis
        </h2>
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
        >
          <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-800 rounded p-3 text-center">
          <p className="text-2xl font-bold">{chapters.length}</p>
          <p className="text-xs text-gray-400">Chapters</p>
        </div>
        <div className="bg-gray-800 rounded p-3 text-center">
          <p className="text-2xl font-bold">{avgChapterWords.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Avg Words/Ch</p>
        </div>
        <div className="bg-gray-800 rounded p-3 text-center">
          <p className="text-2xl font-bold">{avgSceneCount}</p>
          <p className="text-xs text-gray-400">Avg Scenes/Ch</p>
        </div>
        <div className={`rounded p-3 text-center ${coefficientOfVariation > 50 ? 'bg-amber-500/20' : 'bg-green-500/20'}`}>
          <p className="text-2xl font-bold">{coefficientOfVariation}%</p>
          <p className="text-xs text-gray-400">Variance</p>
        </div>
      </div>

      {/* Consistency Warning */}
      {coefficientOfVariation > 50 && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
          <div className="text-sm">
            <p className="text-amber-300 font-medium">High variance in chapter lengths</p>
            <p className="text-amber-200/70">Consider balancing chapter sizes for more consistent pacing.</p>
          </div>
        </div>
      )}

      {/* Chapter Breakdown */}
      <div className="flex-1 overflow-auto">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Chapter Breakdown</h3>
        <div className="space-y-2">
          {chapters.map(ch => {
            const deviation = avgChapterWords > 0 
              ? ((ch.totalWords - avgChapterWords) / avgChapterWords * 100).toFixed(0)
              : 0;
            const isShort = ch.totalWords < avgChapterWords * 0.5;
            const isLong = ch.totalWords > avgChapterWords * 1.5;
            
            return (
              <div key={ch.chapterId} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Ch {ch.chapterOrder}</span>
                    <span className="font-medium">{ch.chapterTitle}</span>
                    {ch.povCharacterId && (
                      <span className="text-xs text-blue-400">POV: {getCharName(ch.povCharacterId)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isShort && <span className="text-xs text-amber-400">Short</span>}
                    {isLong && <span className="text-xs text-amber-400">Long</span>}
                    {!isShort && !isLong && <Check className="w-3 h-3 text-green-400" />}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>{ch.totalWords.toLocaleString()} words</span>
                  <span className="text-gray-500">|</span>
                  <span>{ch.sceneCount} scenes</span>
                  <span className="text-gray-500">|</span>
                  <span className={deviation > 0 ? 'text-green-400' : 'text-red-400'}>
                    {deviation > 0 ? '+' : ''}{deviation}% vs avg
                  </span>
                </div>
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${isShort ? 'bg-amber-500' : isLong ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, (ch.totalWords / (avgChapterWords * 2)) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
        <p>💡 Aim for consistent chapter lengths (within 50% of average) for smoother reading experience.</p>
      </div>
    </div>
  );
}
