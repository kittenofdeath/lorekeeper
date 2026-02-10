import { useState, useEffect } from 'react';
import { 
  getAllWritingGoals, createWritingGoal, updateWritingGoal, deleteWritingGoal,
  getWritingSessions, logWritingSession, getTotalWordCount
} from '../db';
import { Target, Plus, TrendingUp, Calendar, Award, Flame } from 'lucide-react';

export default function WritingGoals() {
  const [goals, setGoals] = useState([]);
  const [totalWords, setTotalWords] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({ type: 'daily', target: 1000 });
  const [todayWords, setTodayWords] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const g = await getAllWritingGoals();
    setGoals(g);
    
    const total = await getTotalWordCount();
    setTotalWords(total);
    
    // Calculate today's words and streak
    const today = new Date().toISOString().slice(0, 10);
    const sessions = await getWritingSessions(today, today);
    setTodayWords(sessions.reduce((sum, s) => sum + (s.wordCount || 0), 0));
    
    // Simple streak calculation (last 7 days)
    let currentStreak = 0;
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const daySessions = await getWritingSessions(dateStr, dateStr);
      if (daySessions.length > 0) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }
    setStreak(currentStreak);
  }

  async function handleCreate() {
    if (newGoal.target > 0) {
      await createWritingGoal(newGoal);
      setNewGoal({ type: 'daily', target: 1000 });
      setShowAdd(false);
      loadData();
    }
  }

  async function handleLogSession() {
    const words = prompt('How many words did you write?');
    if (words && !isNaN(Number(words))) {
      await logWritingSession({
        date: new Date().toISOString().slice(0, 10),
        wordCount: Number(words)
      });
      loadData();
    }
  }

  async function handleDelete(id) {
    await deleteWritingGoal(id);
    loadData();
  }

  const GOAL_TYPES = {
    daily: { label: 'Daily', icon: Calendar },
    weekly: { label: 'Weekly', icon: TrendingUp },
    manuscript: { label: 'Manuscript', icon: Target },
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Target className="w-6 h-6 text-amber-400" />
          Writing Goals
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleLogSession}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            Log Session
          </button>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
              showAdd ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-3xl font-bold">{totalWords.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Total Words</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-3xl font-bold">{todayWords.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Today</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-400" />
            <p className="text-3xl font-bold text-amber-400">{streak}</p>
          </div>
          <p className="text-sm text-amber-400/70">Day Streak</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-400" />
            <p className="text-3xl font-bold text-purple-400">{goals.filter(g => g.status === 'completed').length}</p>
          </div>
          <p className="text-sm text-purple-400/70">Goals Met</p>
        </div>
      </div>

      {/* Add Goal Form */}
      {showAdd && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Goal Type</label>
              <select
                value={newGoal.type}
                onChange={e => setNewGoal({ ...newGoal, type: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
              >
                {Object.entries(GOAL_TYPES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Target Words</label>
              <input
                type="number"
                value={newGoal.target}
                onChange={e => setNewGoal({ ...newGoal, target: Number(e.target.value) })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCreate}
                className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded font-medium text-sm"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="flex-1 overflow-auto">
        {goals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No goals set yet</p>
            <p className="text-sm mt-1">Set daily, weekly, or manuscript goals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map(goal => {
              const GoalIcon = GOAL_TYPES[goal.type]?.icon || Target;
              const progress = Math.min((goal.current || 0) / goal.target * 100, 100);
              const isComplete = progress >= 100;

              return (
                <div
                  key={goal.id}
                  className={`p-4 rounded-lg border ${
                    isComplete 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GoalIcon className={`w-5 h-5 ${isComplete ? 'text-green-400' : 'text-gray-400'}`} />
                      <span className="font-medium">{GOAL_TYPES[goal.type]?.label} Goal</span>
                    </div>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-gray-400 hover:text-red-400 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${isComplete ? 'bg-green-500' : 'bg-amber-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{(goal.current || 0).toLocaleString()} / {goal.target.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{progress.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-500">
        <p>💡 Log writing sessions to track progress toward your goals</p>
        <p>💡 Word counts from scenes are automatically included in totals</p>
      </div>
    </div>
  );
}
