import { Users, Castle, MapPin, Gem, Lightbulb, Calendar, Network } from 'lucide-react';

const navItems = [
  { id: 'characters', icon: Users, label: 'Characters', color: 'text-blue-400' },
  { id: 'factions', icon: Castle, label: 'Factions', color: 'text-yellow-400' },
  { id: 'locations', icon: MapPin, label: 'Locations', color: 'text-green-400' },
  { id: 'items', icon: Gem, label: 'Items', color: 'text-purple-400' },
  { id: 'concepts', icon: Lightbulb, label: 'Concepts', color: 'text-orange-400' },
];

const viewItems = [
  { id: 'timeline', icon: Calendar, label: 'Timeline' },
  { id: 'graph', icon: Network, label: 'Relationships' },
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

  return (
    <aside className="w-56 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Library</h2>
        <nav className="space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                view === item.id 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <span className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                {item.label}
              </span>
              <span className="text-xs text-gray-500">{getCounts(typeMap[item.id])}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-700">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Views</h2>
        <nav className="space-y-1">
          {viewItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                view === item.id 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Lorekeeper v0.1
        </p>
      </div>
    </aside>
  );
}
