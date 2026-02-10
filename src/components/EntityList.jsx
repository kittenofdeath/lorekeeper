import { Plus, User, Castle, MapPin, Gem, Lightbulb, Skull } from 'lucide-react';

const typeIcons = {
  character: User,
  faction: Castle,
  location: MapPin,
  item: Gem,
  concept: Lightbulb
};

const typeColors = {
  character: 'border-blue-500/30 hover:border-blue-500/60',
  faction: 'border-yellow-500/30 hover:border-yellow-500/60',
  location: 'border-green-500/30 hover:border-green-500/60',
  item: 'border-purple-500/30 hover:border-purple-500/60',
  concept: 'border-orange-500/30 hover:border-orange-500/60'
};

const typeBg = {
  character: 'bg-blue-500/10',
  faction: 'bg-yellow-500/10',
  location: 'bg-green-500/10',
  item: 'bg-purple-500/10',
  concept: 'bg-orange-500/10'
};

export default function EntityList({ type, entities, onSelect, onCreate }) {
  const Icon = typeIcons[type] || User;
  const typeName = type.charAt(0).toUpperCase() + type.slice(1) + 's';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{typeName}</h2>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New {type}
        </button>
      </div>

      {entities.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Icon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No {typeName.toLowerCase()} yet</p>
          <button
            onClick={onCreate}
            className="mt-4 text-amber-400 hover:text-amber-300"
          >
            Create your first {type}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entities.map(entity => (
            <button
              key={entity.id}
              onClick={() => onSelect(entity.id)}
              className={`text-left p-4 rounded-lg border ${typeColors[type]} ${typeBg[type]} transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-800">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{entity.name}</h3>
                    {entity.status === 'deceased' && (
                      <Skull className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    )}
                    {entity.isSpoiler && (
                      <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-300 rounded">
                        SPOILER
                      </span>
                    )}
                  </div>
                  {entity.aliases && entity.aliases.length > 0 && (
                    <p className="text-sm text-gray-400 truncate">
                      aka {entity.aliases.slice(0, 2).join(', ')}
                    </p>
                  )}
                  {entity.birthDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      {entity.birthDate}
                      {entity.deathDate 
                        ? ` - ${entity.deathDate} (${entity.deathDate - entity.birthDate} years)` 
                        : ' - present'}
                    </p>
                  )}
                  {entity.attributes?.title && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {entity.attributes.title}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
