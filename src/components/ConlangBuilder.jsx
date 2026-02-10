import { useState, useEffect } from 'react';
import { 
  getAllLanguages, createLanguage, updateLanguage, deleteLanguage,
  getVocabulary, addWord, updateWord, deleteWord
} from '../db';
import { Languages, Plus, X, Book, Volume2 } from 'lucide-react';

export default function ConlangBuilder() {
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState(null);
  const [vocabulary, setVocabulary] = useState([]);
  const [showAddLang, setShowAddLang] = useState(false);
  const [showAddWord, setShowAddWord] = useState(false);
  const [searchWord, setSearchWord] = useState('');
  const [newLang, setNewLang] = useState({ name: '', description: '', phonology: '', grammar: '' });
  const [newWord, setNewWord] = useState({ word: '', meaning: '', pronunciation: '', partOfSpeech: 'noun', etymology: '' });

  useEffect(() => {
    loadLanguages();
  }, []);

  useEffect(() => {
    if (selectedLang) {
      loadVocabulary(selectedLang.id);
    }
  }, [selectedLang]);

  async function loadLanguages() {
    const l = await getAllLanguages();
    setLanguages(l);
  }

  async function loadVocabulary(langId) {
    const v = await getVocabulary(langId);
    setVocabulary(v);
  }

  async function handleCreateLang() {
    if (newLang.name) {
      await createLanguage(newLang);
      setNewLang({ name: '', description: '', phonology: '', grammar: '' });
      setShowAddLang(false);
      loadLanguages();
    }
  }

  async function handleDeleteLang(id) {
    if (confirm('Delete this language and all its vocabulary?')) {
      await deleteLanguage(id);
      if (selectedLang?.id === id) {
        setSelectedLang(null);
        setVocabulary([]);
      }
      loadLanguages();
    }
  }

  async function handleAddWord() {
    if (newWord.word && newWord.meaning && selectedLang) {
      await addWord({ ...newWord, languageId: selectedLang.id });
      setNewWord({ word: '', meaning: '', pronunciation: '', partOfSpeech: 'noun', etymology: '' });
      setShowAddWord(false);
      loadVocabulary(selectedLang.id);
    }
  }

  async function handleDeleteWord(id) {
    await deleteWord(id);
    loadVocabulary(selectedLang.id);
  }

  const PARTS_OF_SPEECH = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection'];

  const filteredVocab = vocabulary.filter(w =>
    w.word.toLowerCase().includes(searchWord.toLowerCase()) ||
    w.meaning.toLowerCase().includes(searchWord.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Languages className="w-6 h-6 text-amber-400" />
          Conlang Builder
        </h2>
        <button
          onClick={() => setShowAddLang(!showAddLang)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
            showAddLang ? 'bg-amber-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Plus className="w-4 h-4" />
          New Language
        </button>
      </div>

      {/* Add Language Form */}
      {showAddLang && (
        <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={newLang.name}
              onChange={e => setNewLang({ ...newLang, name: e.target.value })}
              placeholder="Language name (e.g., High Valyrian)"
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={newLang.description}
              onChange={e => setNewLang({ ...newLang, description: e.target.value })}
              placeholder="Brief description"
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
            />
          </div>
          <textarea
            value={newLang.phonology}
            onChange={e => setNewLang({ ...newLang, phonology: e.target.value })}
            placeholder="Phonology notes (sounds, stress patterns, allowed combinations...)"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm mb-3 resize-none"
            rows={2}
          />
          <textarea
            value={newLang.grammar}
            onChange={e => setNewLang({ ...newLang, grammar: e.target.value })}
            placeholder="Grammar notes (word order, conjugation patterns, cases...)"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm mb-3 resize-none"
            rows={2}
          />
          <button
            onClick={handleCreateLang}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded text-sm font-medium"
          >
            Create Language
          </button>
        </div>
      )}

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Languages List */}
        <div className="w-64 overflow-auto space-y-2">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Languages</h3>
          {languages.map(lang => (
            <div
              key={lang.id}
              onClick={() => setSelectedLang(lang)}
              className={`p-3 rounded-lg cursor-pointer ${
                selectedLang?.id === lang.id
                  ? 'bg-amber-500/20 border border-amber-500/30'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{lang.name}</p>
                <button
                  onClick={e => { e.stopPropagation(); handleDeleteLang(lang.id); }}
                  className="p-1 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </div>
              {lang.description && (
                <p className="text-xs text-gray-500 mt-1">{lang.description}</p>
              )}
            </div>
          ))}
          {languages.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No languages created</p>
          )}
        </div>

        {/* Language Details & Vocabulary */}
        {selectedLang ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Language Info */}
            <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold mb-2">{selectedLang.name}</h3>
              {selectedLang.phonology && (
                <div className="mb-2">
                  <span className="text-xs text-gray-400">Phonology:</span>
                  <p className="text-sm text-gray-300">{selectedLang.phonology}</p>
                </div>
              )}
              {selectedLang.grammar && (
                <div>
                  <span className="text-xs text-gray-400">Grammar:</span>
                  <p className="text-sm text-gray-300">{selectedLang.grammar}</p>
                </div>
              )}
            </div>

            {/* Vocabulary */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchWord}
                  onChange={e => setSearchWord(e.target.value)}
                  placeholder="Search vocabulary..."
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm"
                />
              </div>
              <button
                onClick={() => setShowAddWord(!showAddWord)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${
                  showAddWord ? 'bg-amber-500 text-gray-900' : 'bg-gray-700'
                }`}
              >
                <Plus className="w-4 h-4" /> Add Word
              </button>
            </div>

            {showAddWord && (
              <div className="mb-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <input
                    type="text"
                    value={newWord.word}
                    onChange={e => setNewWord({ ...newWord, word: e.target.value })}
                    placeholder="Word"
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="text"
                    value={newWord.pronunciation}
                    onChange={e => setNewWord({ ...newWord, pronunciation: e.target.value })}
                    placeholder="Pronunciation"
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="text"
                    value={newWord.meaning}
                    onChange={e => setNewWord({ ...newWord, meaning: e.target.value })}
                    placeholder="Meaning"
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  />
                  <select
                    value={newWord.partOfSpeech}
                    onChange={e => setNewWord({ ...newWord, partOfSpeech: e.target.value })}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  >
                    {PARTS_OF_SPEECH.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <button
                  onClick={handleAddWord}
                  className="px-3 py-1 bg-amber-500 text-gray-900 rounded text-sm"
                >
                  Add
                </button>
              </div>
            )}

            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="py-2 px-2">Word</th>
                    <th className="py-2 px-2">Pronunciation</th>
                    <th className="py-2 px-2">Meaning</th>
                    <th className="py-2 px-2">Type</th>
                    <th className="py-2 px-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVocab.map(word => (
                    <tr key={word.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-2 px-2 font-medium">{word.word}</td>
                      <td className="py-2 px-2 text-gray-400">{word.pronunciation || '—'}</td>
                      <td className="py-2 px-2">{word.meaning}</td>
                      <td className="py-2 px-2 text-gray-500 text-xs">{word.partOfSpeech}</td>
                      <td className="py-2 px-2">
                        <button
                          onClick={() => handleDeleteWord(word.id)}
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          <X className="w-3 h-3 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredVocab.length === 0 && (
                <p className="text-center py-8 text-gray-500">No words in vocabulary</p>
              )}
            </div>

            <div className="mt-2 text-xs text-gray-500">
              {vocabulary.length} words in vocabulary
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Languages className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a language or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
