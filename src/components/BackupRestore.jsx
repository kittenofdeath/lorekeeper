import { useState } from 'react';
import { exportFullBackup, importFullBackup } from '../db';
import { Download, Upload, AlertTriangle, Check, Database } from 'lucide-react';

export default function BackupRestore({ onDataChange }) {
  const [status, setStatus] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    setStatus(null);
    try {
      const backup = await exportFullBackup();
      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lorekeeper-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus({ type: 'success', message: 'Backup downloaded successfully!' });
    } catch (e) {
      setStatus({ type: 'error', message: `Export failed: ${e.message}` });
    }
    setIsExporting(false);
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('This will REPLACE all your current data. Are you sure?')) {
      e.target.value = '';
      return;
    }

    setIsImporting(true);
    setStatus(null);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      
      if (!backup.data) {
        throw new Error('Invalid backup file format');
      }
      
      await importFullBackup(backup);
      setStatus({ type: 'success', message: `Restored backup from ${backup.exportedAt || 'unknown date'}` });
      if (onDataChange) onDataChange();
    } catch (e) {
      setStatus({ type: 'error', message: `Import failed: ${e.message}` });
    }
    setIsImporting(false);
    e.target.value = '';
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-6 h-6 text-amber-400" />
        <h2 className="text-2xl font-bold">Backup & Restore</h2>
      </div>

      <div className="max-w-xl space-y-6">
        {/* Warning */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-300">Your data is stored locally</h3>
              <p className="text-sm text-amber-200/70 mt-1">
                All data lives in your browser's IndexedDB. Clearing browser data or switching browsers will lose everything.
                <strong className="text-amber-200"> Export regularly!</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
            <Download className="w-5 h-5 text-green-400" />
            Export Backup
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Download your entire world as a JSON file. Includes all entities, events, chapters, scenes, rules, and settings.
          </p>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Download Backup'}
          </button>
        </div>

        {/* Import */}
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-400" />
            Restore from Backup
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Upload a previously exported backup file. This will <strong className="text-red-400">replace all current data</strong>.
          </p>
          <label className={`w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center justify-center gap-2 cursor-pointer ${isImporting ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload className="w-4 h-4" />
            {isImporting ? 'Importing...' : 'Choose Backup File'}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              disabled={isImporting}
            />
          </label>
        </div>

        {/* Status */}
        {status && (
          <div className={`p-4 rounded-lg flex items-center gap-2 ${
            status.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/30 text-green-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}>
            {status.type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {status.message}
          </div>
        )}

        {/* Tips */}
        <div className="text-sm text-gray-500 space-y-1">
          <p>💡 <strong>Tip:</strong> Set a weekly reminder to export your backup</p>
          <p>💡 Store backups in cloud storage (Google Drive, Dropbox) for safety</p>
          <p>💡 Keep multiple dated backups in case you need to rollback</p>
        </div>
      </div>
    </div>
  );
}
