import { useState, useEffect } from 'react';
import { getAllCurrencies, createCurrency, updateCurrency, deleteCurrency, getActiveProject } from '../db';
import { Coins, Plus, X, ArrowRightLeft } from 'lucide-react';

export default function CurrencySystem() {
  const [currencies, setCurrencies] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newCurrency, setNewCurrency] = useState({ name: '', symbol: '', baseValue: 1, description: '' });
  const [convertFrom, setConvertFrom] = useState({ currencyId: '', amount: '' });
  const [convertTo, setConvertTo] = useState({ currencyId: '' });
  const [convertResult, setConvertResult] = useState(null);

  useEffect(() => {
    loadCurrencies();
  }, []);

  async function loadCurrencies() {
    const project = await getActiveProject();
    if (project) {
      setProjectId(project.id);
      const c = await getAllCurrencies(project.id);
      setCurrencies(c);
    }
  }

  async function handleCreate() {
    if (newCurrency.name && projectId) {
      await createCurrency({ ...newCurrency, projectId, baseValue: Number(newCurrency.baseValue) || 1 });
      setNewCurrency({ name: '', symbol: '', baseValue: 1, description: '' });
      setShowAdd(false);
      loadCurrencies();
    }
  }

  async function handleUpdate(id, updates) {
    await updateCurrency(id, updates);
    loadCurrencies();
  }

  async function handleDelete(id) {
    if (confirm('Delete this currency?')) {
      await deleteCurrency(id);
      loadCurrencies();
    }
  }

  function calculateConversion() {
    const from = currencies.find(c => c.id === Number(convertFrom.currencyId));
    const to = currencies.find(c => c.id === Number(convertTo.currencyId));
    if (from && to && convertFrom.amount) {
      const baseAmount = Number(convertFrom.amount) * from.baseValue;
      const result = baseAmount / to.baseValue;
      setConvertResult(result);
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-400" />
          Currency System
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${showAdd ? 'bg-amber-500 text-gray-900' : 'bg-gray-700'}`}
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={newCurrency.name}
              onChange={e => setNewCurrency({ ...newCurrency, name: e.target.value })}
              placeholder="Name (e.g., Gold Dragon)"
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            />
            <input
              type="text"
              value={newCurrency.symbol}
              onChange={e => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
              placeholder="Symbol (e.g., 🪙)"
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            />
            <input
              type="number"
              value={newCurrency.baseValue}
              onChange={e => setNewCurrency({ ...newCurrency, baseValue: e.target.value })}
              placeholder="Base value"
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            />
          </div>
          <input
            type="text"
            value={newCurrency.description}
            onChange={e => setNewCurrency({ ...newCurrency, description: e.target.value })}
            placeholder="Description"
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
          />
          <button onClick={handleCreate} className="px-3 py-1 bg-amber-500 text-gray-900 rounded text-sm">Create</button>
        </div>
      )}

      {/* Currencies List */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Currencies ({currencies.length})</h3>
        {currencies.length === 0 ? (
          <p className="text-sm text-gray-500">No currencies defined</p>
        ) : (
          <div className="space-y-2">
            {currencies.map(curr => (
              <div key={curr.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{curr.symbol || '💰'}</span>
                  <div>
                    <p className="font-medium">{curr.name}</p>
                    <p className="text-xs text-gray-500">Base value: {curr.baseValue}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(curr.id)} className="p-1 hover:bg-gray-700 rounded">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Converter */}
      {currencies.length >= 2 && (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-1">
            <ArrowRightLeft className="w-4 h-4" /> Currency Converter
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={convertFrom.amount}
              onChange={e => setConvertFrom({ ...convertFrom, amount: e.target.value })}
              placeholder="Amount"
              className="w-24 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            />
            <select
              value={convertFrom.currencyId}
              onChange={e => setConvertFrom({ ...convertFrom, currencyId: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            >
              <option value="">From...</option>
              {currencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <span className="text-gray-500">→</span>
            <select
              value={convertTo.currencyId}
              onChange={e => setConvertTo({ ...convertTo, currencyId: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            >
              <option value="">To...</option>
              {currencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={calculateConversion} className="px-3 py-1 bg-amber-500 text-gray-900 rounded text-sm">
              Convert
            </button>
          </div>
          {convertResult !== null && (
            <p className="mt-3 text-lg font-bold text-amber-400">
              = {convertResult.toFixed(2)} {currencies.find(c => c.id === Number(convertTo.currencyId))?.name}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>💡 Set base values relative to a common unit (e.g., if 1 Gold = 100 Silver, set Gold baseValue=100, Silver baseValue=1)</p>
      </div>
    </div>
  );
}
