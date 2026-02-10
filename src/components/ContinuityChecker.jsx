import { useState, useEffect } from 'react';
import { checkContinuity } from '../db';
import { AlertTriangle, CheckCircle, RefreshCw, XCircle, Clock, User, Calendar, Sparkles } from 'lucide-react';

export default function ContinuityChecker({ entities, onSelectEntity, onSelectEvent }) {
  const [issues, setIssues] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [filter, setFilter] = useState('all');

  async function runCheck() {
    setIsChecking(true);
    const results = await checkContinuity();
    setIssues(results);
    setLastChecked(new Date());
    setIsChecking(false);
  }

  useEffect(() => {
    runCheck();
  }, []);

  const ISSUE_TYPES = {
    dead_character: { icon: User, color: 'text-red-400', bgColor: 'bg-red-500/10', label: 'Dead Character Appears' },
    age_error: { icon: Calendar, color: 'text-red-400', bgColor: 'bg-red-500/10', label: 'Age Error' },
    unresolved_setup: { icon: Sparkles, color: 'text-amber-400', bgColor: 'bg-amber-500/10', label: 'Unresolved Setup' },
    missing_date: { icon: Clock, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', label: 'Missing Date' },
  };

  const filteredIssues = filter === 'all' 
    ? issues 
    : issues.filter(i => filter === 'errors' ? i.severity === 'error' : i.severity === 'warning');

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
          Continuity Checker
        </h2>
        <button
          onClick={runCheck}
          disabled={isChecking}
          className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Checking...' : 'Run Check'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className={`rounded-lg p-4 border ${
          issues.length === 0 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-gray-800 border-gray-700'
        }`}>
          {issues.length === 0 ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-lg font-bold text-green-400">All Clear!</p>
                <p className="text-sm text-green-400/70">No issues found</p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold">{issues.length}</p>
              <p className="text-sm text-gray-400">Total Issues</p>
            </>
          )}
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-3xl font-bold text-red-400">{errorCount}</p>
          <p className="text-sm text-red-400/70">Errors</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <p className="text-3xl font-bold text-amber-400">{warningCount}</p>
          <p className="text-sm text-amber-400/70">Warnings</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-400">Show:</span>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
        >
          All ({issues.length})
        </button>
        <button
          onClick={() => setFilter('errors')}
          className={`px-3 py-1 rounded text-sm ${filter === 'errors' ? 'bg-red-500/20 text-red-300' : 'hover:bg-gray-800'}`}
        >
          Errors ({errorCount})
        </button>
        <button
          onClick={() => setFilter('warnings')}
          className={`px-3 py-1 rounded text-sm ${filter === 'warnings' ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-gray-800'}`}
        >
          Warnings ({warningCount})
        </button>
        {lastChecked && (
          <span className="ml-auto text-xs text-gray-500">
            Last checked: {lastChecked.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-auto">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400/50" />
            <p className="text-gray-400">
              {issues.length === 0 
                ? 'No continuity issues found!' 
                : `No ${filter} to show`}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredIssues.map((issue, idx) => {
              const typeInfo = ISSUE_TYPES[issue.type] || { 
                icon: AlertTriangle, 
                color: 'text-gray-400', 
                bgColor: 'bg-gray-800',
                label: issue.type 
              };
              const Icon = typeInfo.icon;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    issue.severity === 'error' 
                      ? 'bg-red-500/5 border-red-500/30' 
                      : 'bg-amber-500/5 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
                      {issue.severity === 'error' ? (
                        <XCircle className="w-5 h-5 text-red-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          issue.severity === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {issue.severity.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-400">{typeInfo.label}</span>
                      </div>
                      <p className="text-gray-200">{issue.message}</p>
                      <div className="flex gap-2 mt-2">
                        {issue.entityId && (
                          <button
                            onClick={() => onSelectEntity(issue.entityId)}
                            className="text-sm text-blue-400 hover:text-blue-300"
                          >
                            View Entity →
                          </button>
                        )}
                        {issue.eventId && (
                          <button
                            onClick={() => onSelectEvent(issue.eventId)}
                            className="text-sm text-blue-400 hover:text-blue-300"
                          >
                            View Event →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* What We Check */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="text-xs font-medium text-gray-400 mb-2">Checks Performed</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          <div>• Dead characters appearing in later scenes</div>
          <div>• Birth/death date consistency</div>
          <div>• Unresolved foreshadowing/setups</div>
          <div>• Events without dates</div>
        </div>
      </div>
    </div>
  );
}
