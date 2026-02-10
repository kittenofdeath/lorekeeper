import { useState } from 'react';
import { Download, FileText, Globe, Copy, Check } from 'lucide-react';
import { getAllEntities, getAllRelationships, getAllEvents, getEventParticipants, getEventCausality } from '../db';

export default function ExportView({ entities, spoilerMode }) {
  const [exportFormat, setExportFormat] = useState('markdown');
  const [includeRelationships, setIncludeRelationships] = useState(true);
  const [includeEvents, setIncludeEvents] = useState(true);
  const [includeCausality, setIncludeCausality] = useState(true);
  const [exportContent, setExportContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generateExport() {
    setIsGenerating(true);
    
    const allEntities = await getAllEntities();
    const relationships = includeRelationships ? await getAllRelationships() : [];
    const events = includeEvents ? await getAllEvents() : [];
    const causality = includeCausality ? await getEventCausality() : [];
    
    // Filter spoilers if needed
    const filteredEntities = spoilerMode ? allEntities : allEntities.filter(e => !e.isSpoiler);
    const filteredEvents = spoilerMode ? events : events.filter(e => !e.isSpoiler);
    const filteredRels = spoilerMode ? relationships : relationships.filter(r => !r.isSpoiler);
    
    // Load event participants
    const eventParticipantsMap = {};
    for (const evt of filteredEvents) {
      eventParticipantsMap[evt.id] = await getEventParticipants(evt.id);
    }

    let content = '';
    
    if (exportFormat === 'markdown') {
      content = generateMarkdown(filteredEntities, filteredRels, filteredEvents, eventParticipantsMap, causality);
    } else if (exportFormat === 'html') {
      content = generateHTML(filteredEntities, filteredRels, filteredEvents, eventParticipantsMap, causality);
    } else if (exportFormat === 'json') {
      content = JSON.stringify({
        entities: filteredEntities,
        relationships: filteredRels,
        events: filteredEvents,
        eventParticipants: eventParticipantsMap,
        causality
      }, null, 2);
    }
    
    setExportContent(content);
    setIsGenerating(false);
  }

  function generateMarkdown(entities, relationships, events, participantsMap, causality) {
    const getEntityName = (id) => entities.find(e => e.id === id)?.name || `Entity #${id}`;
    
    let md = '# World Lore\n\n';
    md += `*Generated on ${new Date().toLocaleDateString()}*\n\n`;
    md += '---\n\n';
    
    // Group entities by type
    const types = ['character', 'faction', 'location', 'item', 'concept'];
    
    types.forEach(type => {
      const typeEntities = entities.filter(e => e.type === type);
      if (typeEntities.length === 0) return;
      
      md += `## ${type.charAt(0).toUpperCase() + type.slice(1)}s\n\n`;
      
      typeEntities.forEach(entity => {
        md += `### ${entity.name}\n\n`;
        
        if (entity.aliases?.length) {
          md += `*Also known as: ${entity.aliases.join(', ')}*\n\n`;
        }
        
        if (entity.birthDate) {
          md += `**Lifespan:** ${entity.birthDate}`;
          if (entity.deathDate) {
            md += ` - ${entity.deathDate} (${entity.deathDate - entity.birthDate} years)`;
          } else {
            md += ' - present';
          }
          md += '\n\n';
        }
        
        if (entity.description) {
          md += `${entity.description}\n\n`;
        }
        
        // Relationships for this entity
        const entityRels = relationships.filter(r => r.sourceId === entity.id || r.targetId === entity.id);
        if (entityRels.length > 0) {
          md += '**Relationships:**\n';
          entityRels.forEach(rel => {
            const otherId = rel.sourceId === entity.id ? rel.targetId : rel.sourceId;
            md += `- ${rel.type}${rel.subtype ? ` (${rel.subtype})` : ''}: ${getEntityName(otherId)}\n`;
          });
          md += '\n';
        }
        
        // Events involving this entity
        const entityEvents = events.filter(evt => {
          const parts = participantsMap[evt.id] || [];
          return parts.some(p => p.entityId === entity.id);
        });
        if (entityEvents.length > 0) {
          md += '**Key Events:**\n';
          entityEvents.forEach(evt => {
            const part = participantsMap[evt.id]?.find(p => p.entityId === entity.id);
            md += `- Year ${evt.startDate}: ${evt.title}${part ? ` (${part.role})` : ''}\n`;
          });
          md += '\n';
        }
        
        md += '---\n\n';
      });
    });
    
    // Events section
    if (events.length > 0) {
      md += '## Timeline of Events\n\n';
      const sortedEvents = [...events].sort((a, b) => (a.startDate || 0) - (b.startDate || 0));
      
      sortedEvents.forEach(evt => {
        md += `### Year ${evt.startDate}: ${evt.title}\n\n`;
        if (evt.description) {
          md += `${evt.description}\n\n`;
        }
        const parts = participantsMap[evt.id] || [];
        if (parts.length > 0) {
          md += '**Participants:**\n';
          parts.forEach(p => {
            md += `- ${getEntityName(p.entityId)} (${p.role})\n`;
          });
          md += '\n';
        }
        
        // Causality
        const causes = causality.filter(c => c.effectEventId === evt.id);
        const effects = causality.filter(c => c.causeEventId === evt.id);
        
        if (causes.length > 0) {
          md += '**Caused by:** ';
          md += causes.map(c => {
            const causeEvt = events.find(e => e.id === c.causeEventId);
            return causeEvt ? causeEvt.title : 'Unknown';
          }).join(', ');
          md += '\n\n';
        }
        
        if (effects.length > 0) {
          md += '**Led to:** ';
          md += effects.map(c => {
            const effectEvt = events.find(e => e.id === c.effectEventId);
            return effectEvt ? effectEvt.title : 'Unknown';
          }).join(', ');
          md += '\n\n';
        }
        
        md += '---\n\n';
      });
    }
    
    return md;
  }

  function generateHTML(entities, relationships, events, participantsMap, causality) {
    const md = generateMarkdown(entities, relationships, events, participantsMap, causality);
    
    // Simple markdown to HTML conversion
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>World Lore</title>
  <style>
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 2rem; 
      background: #1a1a2e; 
      color: #eee; 
    }
    h1 { color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 0.5rem; }
    h2 { color: #3b82f6; margin-top: 2rem; }
    h3 { color: #22c55e; }
    hr { border: none; border-top: 1px solid #333; margin: 1.5rem 0; }
    ul { padding-left: 1.5rem; }
    li { margin: 0.25rem 0; }
    em { color: #888; }
    strong { color: #f59e0b; }
    a { color: #3b82f6; }
  </style>
</head>
<body>
`;
    
    // Convert markdown to HTML (basic)
    html += md
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      .replace(/---/g, '<hr>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^/g, '<p>')
      .replace(/$/g, '</p>');
    
    html += '</body></html>';
    return html;
  }

  async function downloadExport() {
    if (!exportContent) return;
    
    const ext = exportFormat === 'json' ? 'json' : exportFormat === 'html' ? 'html' : 'md';
    const mimeType = exportFormat === 'json' ? 'application/json' : exportFormat === 'html' ? 'text/html' : 'text/markdown';
    
    const blob = new Blob([exportContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `world-lore.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function copyToClipboard() {
    if (!exportContent) return;
    await navigator.clipboard.writeText(exportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Download className="w-6 h-6 text-amber-400" />
          Export Lore
        </h2>
      </div>

      {/* Options */}
      <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Export Format</h3>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setExportFormat('markdown')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
              exportFormat === 'markdown' ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <FileText className="w-4 h-4" />
            Markdown
          </button>
          <button
            onClick={() => setExportFormat('html')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
              exportFormat === 'html' ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Globe className="w-4 h-4" />
            HTML Wiki
          </button>
          <button
            onClick={() => setExportFormat('json')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
              exportFormat === 'json' ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {'{ }'}
            JSON
          </button>
        </div>

        <h3 className="text-sm font-medium text-gray-300 mb-2">Include</h3>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeRelationships}
              onChange={e => setIncludeRelationships(e.target.checked)}
              className="rounded"
            />
            Relationships
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeEvents}
              onChange={e => setIncludeEvents(e.target.checked)}
              className="rounded"
            />
            Events
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeCausality}
              onChange={e => setIncludeCausality(e.target.checked)}
              className="rounded"
            />
            Causality Chains
          </label>
        </div>

        <button
          onClick={generateExport}
          disabled={isGenerating}
          className="mt-4 w-full py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-lg font-medium disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate Export'}
        </button>
      </div>

      {/* Preview */}
      {exportContent && (
        <>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-300">Preview</h3>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={downloadExport}
                className="flex items-center gap-1 px-2 py-1 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded text-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
          <div className="flex-1 bg-gray-900 rounded-lg border border-gray-700 overflow-auto p-4">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
              {exportContent.slice(0, 5000)}
              {exportContent.length > 5000 && '\n\n... (truncated for preview)'}
            </pre>
          </div>
        </>
      )}

      {!exportContent && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>Configure options and click "Generate Export" to preview</p>
        </div>
      )}
    </div>
  );
}
