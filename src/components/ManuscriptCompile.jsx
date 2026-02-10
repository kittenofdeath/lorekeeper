import { useState } from 'react';
import { compileManuscript, getTotalWordCount, getAllChapters } from '../db';
import { FileText, Download, Copy, Check, BookOpen } from 'lucide-react';

export default function ManuscriptCompile() {
  const [manuscript, setManuscript] = useState('');
  const [stats, setStats] = useState({ words: 0, chapters: 0 });
  const [isCompiling, setIsCompiling] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCompile() {
    setIsCompiling(true);
    const text = await compileManuscript();
    setManuscript(text);
    
    const words = await getTotalWordCount();
    const chapters = await getAllChapters();
    setStats({ words, chapters: chapters.length });
    setIsCompiling(false);
  }

  function handleDownload() {
    const blob = new Blob([manuscript], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manuscript-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCopy() {
    navigator.clipboard.writeText(manuscript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Estimate reading time (250 words per minute average)
  const readingMinutes = Math.ceil(stats.words / 250);
  const readingTime = readingMinutes < 60 
    ? `${readingMinutes} min`
    : `${Math.floor(readingMinutes / 60)}h ${readingMinutes % 60}m`;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          Manuscript Compile
        </h2>
        <button
          onClick={handleCompile}
          disabled={isCompiling}
          className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded text-sm font-medium"
        >
          <BookOpen className="w-4 h-4" />
          {isCompiling ? 'Compiling...' : 'Compile All Scenes'}
        </button>
      </div>

      {manuscript ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-800 rounded p-3 text-center">
              <p className="text-xl font-bold">{stats.chapters}</p>
              <p className="text-xs text-gray-400">Chapters</p>
            </div>
            <div className="bg-gray-800 rounded p-3 text-center">
              <p className="text-xl font-bold">{stats.words.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Words</p>
            </div>
            <div className="bg-gray-800 rounded p-3 text-center">
              <p className="text-xl font-bold">{Math.ceil(stats.words / 250)}</p>
              <p className="text-xs text-gray-400">Pages (~250w)</p>
            </div>
            <div className="bg-gray-800 rounded p-3 text-center">
              <p className="text-xl font-bold">{readingTime}</p>
              <p className="text-xs text-gray-400">Read Time</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm"
            >
              <Download className="w-4 h-4" /> Download .md
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Preview */}
          <div className="flex-1 overflow-auto">
            <pre className="bg-gray-800 rounded p-4 text-sm font-mono whitespace-pre-wrap text-gray-300 leading-relaxed">
              {manuscript}
            </pre>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Click "Compile All Scenes" to generate your manuscript</p>
            <p className="text-sm mt-1">All chapters and scenes will be combined in order</p>
          </div>
        </div>
      )}
    </div>
  );
}
