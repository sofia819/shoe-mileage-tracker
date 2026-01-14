import React, { useState } from 'react';
import type { Entry, Shoe } from '../lib/types';
import { createEntry } from '../lib/api';

interface EntriesViewProps {
  token: string;
  spreadsheetId: string;
  shoes: Shoe[];
  entries: Entry[];
  setEntries: (entries: Entry[]) => void;
}

export const EntriesView: React.FC<EntriesViewProps> = ({
  token,
  spreadsheetId,
  shoes,
  entries,
  setEntries,
}) => {
  const [date, setDate] = useState('');
  const [miles, setMiles] = useState('');
  const [shoeId, setShoeId] = useState('');

  const handleAddEntry = async () => {
    if (!date || !miles || !shoeId) return;
    const entry = await createEntry(token, spreadsheetId, {
      date,
      miles: parseFloat(miles),
      shoeId,
    });
    setEntries([entry, ...entries]);
    setDate('');
    setMiles('');
    setShoeId('');
  };

  if (shoes.length === 0)
    return <p>Please add at least one shoe before logging entries.</p>;

  return (
    <div>
      <h2>Entries</h2>

      <div style={{ marginBottom: '10px' }}>
        <input
          type='date'
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type='number'
          placeholder='Miles'
          step='0.1'
          value={miles}
          onChange={(e) => setMiles(e.target.value)}
          style={{ marginLeft: '5px' }}
        />
        <select
          value={shoeId}
          onChange={(e) => setShoeId(e.target.value)}
          style={{ marginLeft: '5px' }}
        >
          <option value=''>Select shoe</option>
          {shoes
            .filter((s) => !s.archived)
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
        </select>
        <button onClick={handleAddEntry} style={{ marginLeft: '5px' }}>
          Add Entry
        </button>
      </div>

      {entries.length === 0 ? (
        <p>No entries yet.</p>
      ) : (
        <ul>
          {entries
            .slice()
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .map((e) => {
              const shoe = shoes.find((s) => s.id === e.shoeId);
              return (
                <li key={e.id} style={{ marginBottom: '5px' }}>
                  {e.date}: {e.miles.toFixed(1)} miles —{' '}
                  {shoe?.name || 'Unknown Shoe'}
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
};
