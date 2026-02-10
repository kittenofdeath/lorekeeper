import { Users, Castle, MapPin, Gem, Lightbulb, Calendar, Network, Map, Link2, Download, BookOpen, Brain, Sparkles, Wand2, AlertTriangle, Search, Type, History, Route, Layers, Palette, Target, MessageSquare, Bug, Languages, Database, GitBranch, BarChart3, FileText, FolderOpen, Music, Coins, ArrowDownUp, Boxes, TrendingUp, Gamepad2, Scroll, MapPinned } from 'lucide-react';
import packageJson from '../../package.json';

const navItems = [
  { id: 'characters', icon: Users, label: 'Characters', color: 'text-blue-400' },
  { id: 'factions', icon: Castle, label: 'Factions', color: 'text-yellow-400' },
  { id: 'locations', icon: MapPin, label: 'Locations', color: 'text-green-400' },
  { id: 'items', icon: Gem, label: 'Items', color: 'text-purple-400' },
  { id: 'concepts', icon: Lightbulb, label: 'Concepts', color: 'text-orange-400' },
];

const viewItems = [
  { id: 'writing', icon: BookOpen, label: 'Writing' },
  { id: 'timeline', icon: Calendar, label: 'Timeline' },
  { id: 'timelineorder', icon: ArrowDownUp, label: 'Order' },
  { id: 'graph', icon: Network, label: 'Relations' },
  { id: 'familytree', icon: GitBranch, label: 'Family' },
  { id: 'map', icon: Map, label: 'Map' },
  { id: 'causality', icon: Link2, label: 'Cause' },
  { id: 'plot', icon: Layers, label: 'Plot' },
  { id: 'frames', icon: Boxes, label: 'Frames' },
];

const toolItems = [
  { id: 'knowledge', icon: Brain, label: 'POV' },
  { id: 'foreshadowing', icon: Sparkles, label: 'Foreshadow' },
  { id: 'themes', icon: Palette, label: 'Themes' },
  { id: 'magic', icon: Wand2, label: 'Magic' },
  { id: 'continuity', icon: AlertTriangle, label: 'Continuity' },
  { id: 'travel', icon: Route, label: 'Travel' },
  { id: 'dialogue', icon: MessageSquare, label: 'Dialogue' },
  { id: 'personality', icon: Brain, label: 'Personality' },
  { id: 'arcs', icon: TrendingUp, label: 'Arcs' },
  { id: 'search', icon: Search, label: 'Search' },
];

const gameItems = [
  { id: 'quests', icon: Scroll, label: 'Quests' },
  { id: 'questmap', icon: MapPinned, label: 'Quest Map' },
  { id: 'dialoguedesign', icon: Gamepad2, label: 'Dialogue Tree' },
];

const worldItems = [
  { id: 'bestiary', icon: Bug, label: 'Bestiary' },
  { id: 'conlang', icon: Languages, label: 'Languages' },
  { id: 'naming', icon: Type, label: 'Naming' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'poetry', icon: Music, label: 'Poetry' },
  { id: 'currency', icon: Coins, label: 'Currency' },
];

const systemItems = [
  { id: 'goals', icon: Target, label: 'Goals' },
  { id: 'pacing', icon: BarChart3, label: 'Pacing' },
  { id: 'wordfreq', icon: BarChart3, label: 'Words' },
  { id: 'manuscript', icon: FileText, label: 'Compile' },
  { id: 'history', icon: History, label: 'History' },
  { id: 'projects', icon: FolderOpen, label: 'Projects' },
  { id: 'backup', icon: Database, label: 'Backup' },
  { id: 'export', icon: Download, label: 'Export' },
];

export default function Sidebar({ view, setView, entities }) {
  const getCounts = (type) => entities.filter(e => e.type === type).length;
  
  const typeMap = {
    characters: 'character',
    factions: 'faction', 
    locations: 'location',
    items: 'item',
    concepts: 'concept'
  };

  const Section = ({ title, items, showCounts = false }) => (
    <div className="px-2 py-1.5 border-b border-gray-700/50">
      <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">{title}</h2>
      <nav className="space-y-px">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs transition-colors ${
              view === item.id 
                ? 'bg-amber-500/20 text-amber-300' 
                : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <item.icon className={`w-3 h-3 ${item.color || ''}`} />
              {item.label}
            </span>
            {showCounts && <span className="text-[10px] text-gray-600">{getCounts(typeMap[item.id])}</span>}
          </button>
        ))}
      </nav>
    </div>
  );

  return (
    <aside className="w-40 bg-gray-800 border-r border-gray-700 flex flex-col text-sm overflow-y-auto">
      <Section title="Library" items={navItems} showCounts />
      <Section title="Views" items={viewItems} />
      <Section title="Tools" items={toolItems} />
      <Section title="Game" items={gameItems} />
      <Section title="World" items={worldItems} />
      <Section title="System" items={systemItems} />
      <div className="mt-auto p-2 border-t border-gray-700">
        <p className="text-[10px] text-gray-600 text-center">v{packageJson.version}</p>
      </div>
    </aside>
  );
}
