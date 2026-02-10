import { useState, useEffect } from 'react';
import { getCalendar, createCalendar, updateCalendar, getActiveProject } from '../db';
import { Calendar, Plus, Save, X } from 'lucide-react';

const PRESETS = {
  gregorian: {
    name: 'Gregorian',
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    daysPerMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    yearOffset: 0,
    eraName: 'AD'
  },
  westeros: {
    name: 'Westerosi',
    monthNames: ['First Moon', 'Second Moon', 'Third Moon', 'Fourth Moon', 'Fifth Moon', 'Sixth Moon', 'Seventh Moon', 'Eighth Moon', 'Ninth Moon', 'Tenth Moon', 'Eleventh Moon', 'Twelfth Moon'],
    daysPerMonth: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    yearOffset: 0,
    eraName: 'AC'
  },
  middleEarth: {
    name: 'Shire Reckoning',
    monthNames: ['Afteryule', 'Solmath', 'Rethe', 'Astron', 'Thrimidge', 'Forelithe', 'Afterlithe', 'Wedmath', 'Halimath', 'Winterfilth', 'Blotmath', 'Foreyule'],
    daysPerMonth: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    yearOffset: 1600,
    eraName: 'SR'
  }
};

export default function CalendarEditor() {
  const [calendar, setCalendar] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    monthNames: [],
    daysPerMonth: [],
    yearOffset: 0,
    eraName: ''
  });

  useEffect(() => {
    loadCalendar();
  }, []);

  async function loadCalendar() {
    const project = await getActiveProject();
    setProjectId(project?.id);
    if (project) {
      const cal = await getCalendar(project.id);
      setCalendar(cal);
      if (cal) {
        setForm({
          name: cal.name || '',
          monthNames: cal.monthNames || [],
          daysPerMonth: cal.daysPerMonth || [],
          yearOffset: cal.yearOffset || 0,
          eraName: cal.eraName || ''
        });
      }
    }
  }

  async function handleSave() {
    if (!projectId) return;
    
    if (calendar) {
      await updateCalendar(calendar.id, form);
    } else {
      await createCalendar({ ...form, projectId });
    }
    setEditing(false);
    loadCalendar();
  }

  function applyPreset(presetKey) {
    const preset = PRESETS[presetKey];
    setForm({ ...preset });
    setEditing(true);
  }

  function updateMonth(index, field, value) {
    if (field === 'name') {
      const names = [...form.monthNames];
      names[index] = value;
      setForm({ ...form, monthNames: names });
    } else {
      const days = [...form.daysPerMonth];
      days[index] = Number(value);
      setForm({ ...form, daysPerMonth: days });
    }
  }

  function addMonth() {
    setForm({
      ...form,
      monthNames: [...form.monthNames, 'New Month'],
      daysPerMonth: [...form.daysPerMonth, 30]
    });
  }

  function removeMonth(index) {
    setForm({
      ...form,
      monthNames: form.monthNames.filter((_, i) => i !== index),
      daysPerMonth: form.daysPerMonth.filter((_, i) => i !== index)
    });
  }

  const totalDays = form.daysPerMonth.reduce((a, b) => a + b, 0);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          Custom Calendar
        </h2>
        {editing ? (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="px-3 py-1 bg-gray-700 rounded text-sm">Cancel</button>
            <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1 bg-amber-500 text-gray-900 rounded text-sm">
              <Save className="w-3 h-3" /> Save
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm">
            {calendar ? 'Edit' : 'Create'}
          </button>
        )}
      </div>

      {!calendar && !editing && (
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Start with a preset:</p>
          <div className="flex gap-2">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {(calendar || editing) && (
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Calendar Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                disabled={!editing}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Era Name (e.g., AD, AC, SR)</label>
              <input
                type="text"
                value={form.eraName}
                onChange={e => setForm({ ...form, eraName: e.target.value })}
                disabled={!editing}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm disabled:opacity-50"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-1">Year Offset (for display)</label>
            <input
              type="number"
              value={form.yearOffset}
              onChange={e => setForm({ ...form, yearOffset: Number(e.target.value) })}
              disabled={!editing}
              className="w-32 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm disabled:opacity-50"
            />
          </div>

          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium">Months ({form.monthNames.length})</h3>
            {editing && (
              <button onClick={addMonth} className="flex items-center gap-1 text-xs text-amber-400">
                <Plus className="w-3 h-3" /> Add Month
              </button>
            )}
          </div>

          <div className="space-y-1">
            {form.monthNames.map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 text-xs text-gray-500">{i + 1}.</span>
                <input
                  type="text"
                  value={name}
                  onChange={e => updateMonth(i, 'name', e.target.value)}
                  disabled={!editing}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm disabled:opacity-50"
                />
                <input
                  type="number"
                  value={form.daysPerMonth[i]}
                  onChange={e => updateMonth(i, 'days', e.target.value)}
                  disabled={!editing}
                  className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm disabled:opacity-50"
                />
                <span className="text-xs text-gray-500">days</span>
                {editing && (
                  <button onClick={() => removeMonth(i)} className="p-1 hover:bg-gray-700 rounded">
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-gray-800 rounded text-sm">
            <strong>Year length:</strong> {totalDays} days
          </div>
        </div>
      )}
    </div>
  );
}
