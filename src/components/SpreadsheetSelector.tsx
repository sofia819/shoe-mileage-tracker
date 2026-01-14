import React, { useEffect, useState } from 'react';
import { createSpreadsheet, validateSpreadsheet } from '../lib/api';

interface Props {
  token: string;
  onSelect: (spreadsheetId: string) => void;
}

export const SpreadsheetSelector: React.FC<Props> = ({ token, onSelect }) => {
  const [existingId, setExistingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingLocal, setCheckingLocal] = useState(true);
  const [warnDeleted, setWarnDeleted] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem('spreadsheetId');
    if (!storedId) {
      setCheckingLocal(false);
      return;
    }
    const check = async () => {
      const valid = await validateSpreadsheet(token, storedId);
      if (valid) onSelect(storedId);
      else {
        localStorage.removeItem('spreadsheetId');
        setWarnDeleted(true);
      }
      setCheckingLocal(false);
    };
    check();
  }, [token, onSelect]);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const id = await createSpreadsheet(token);
      localStorage.setItem('spreadsheetId', id);
      onSelect(id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUseExisting = async () => {
    if (!existingId) return;
    setLoading(true);
    try {
      const valid = await validateSpreadsheet(token, existingId);
      if (!valid)
        throw new Error('Spreadsheet invalid or not created by this app');
      localStorage.setItem('spreadsheetId', existingId);
      onSelect(existingId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingLocal)
    return <p style={{ textAlign: 'center' }}>Checking saved spreadsheet…</p>;

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Shoe Mileage Tracker Spreadsheet</h2>
      {warnDeleted && (
        <p style={{ color: 'red' }}>
          Previously selected sheet no longer exists.
        </p>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleCreate} disabled={loading}>
          {loading ? 'Creating...' : 'Create New Spreadsheet'}
        </button>
      </div>

      <div>
        <input
          type='text'
          placeholder='Enter existing Spreadsheet ID'
          value={existingId}
          onChange={(e) => setExistingId(e.target.value)}
          style={{ padding: '8px', width: '250px', marginRight: '10px' }}
        />
        <button onClick={handleUseExisting} disabled={loading || !existingId}>
          {loading ? 'Checking...' : 'Use Existing'}
        </button>
      </div>
    </div>
  );
};
