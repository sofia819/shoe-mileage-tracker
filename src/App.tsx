import React, { useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { ShoesView } from './components//ShoesView';
import { EntriesView } from './components//EntriesView';
import type { Shoe, Entry } from './lib/types';
import {
  listShoes,
  listEntries,
  validateSpreadsheet,
  createSpreadsheet,
  listUserSheets,
} from './lib/api';

export const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('googleToken')
  );
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(
    localStorage.getItem('spreadsheetId')
  );

  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'entries' | 'shoes'>('entries');
  const [availableSheets, setAvailableSheets] = useState<
    { id: string; name: string }[]
  >([]);

  // Google login hook
  const login = useGoogleLogin({
    flow: 'implicit', // <-- important, this gives a real access_token
    scope:
      'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
    onSuccess: (tokenResponse) => {
      // tokenResponse.access_token is the one we can use with Sheets API
      if (tokenResponse.access_token) {
        localStorage.setItem('googleToken', tokenResponse.access_token);
        setToken(tokenResponse.access_token);
      }
    },
    onError: () => alert('Login failed'),
  });

  // Fetch user sheets from Drive
  useEffect(() => {
    const fetchSheets = async () => {
      if (!token) return;
      try {
        const sheets = await listUserSheets(token);
        setAvailableSheets(sheets || []);
      } catch (err) {
        console.error('Failed to list sheets', err);
      }
    };
    fetchSheets();
  }, [token]);

  // Fetch shoes and entries
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !spreadsheetId) return;
      setLoading(true);

      const valid = await validateSpreadsheet(token, spreadsheetId);
      if (!valid) {
        localStorage.removeItem('spreadsheetId');
        setSpreadsheetId(null);
        setShoes([]);
        setEntries([]);
        setLoading(false);
        return;
      }

      const [shoesData, entriesData] = await Promise.all([
        listShoes(token, spreadsheetId),
        listEntries(token, spreadsheetId),
      ]);

      setShoes(shoesData || []);
      setEntries(entriesData || []);
      setLoading(false);
    };
    fetchData();
  }, [token, spreadsheetId]);

  // Create a new spreadsheet
  const handleCreateSpreadsheet = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const id = await createSpreadsheet(token);
      setSpreadsheetId(id);
      localStorage.setItem('spreadsheetId', id);
      const sheets = await listUserSheets(token);
      setAvailableSheets(sheets);
    } catch (err) {
      console.error(err);
      alert('Failed to create spreadsheet');
    }
    setLoading(false);
  };

  const handleSelectSheet = (id: string) => {
    setSpreadsheetId(id);
    localStorage.setItem('spreadsheetId', id);
  };

  const handleLogout = () => {
    localStorage.removeItem('googleToken');
    localStorage.removeItem('spreadsheetId');
    setToken(null);
    setSpreadsheetId(null);
    setShoes([]);
    setEntries([]);
  };

  // Login view
  if (!token)
    return (
      <div style={{ padding: '20px' }}>
        <h2>Shoe Mileage Tracker</h2>
        <p>Please log in with Google to continue.</p>
        <button onClick={() => login()}>Log in with Google</button>
      </div>
    );

  // Spreadsheet selection / creation
  if (!spreadsheetId)
    return (
      <div style={{ padding: '20px' }}>
        <h2>Shoe Mileage Tracker</h2>
        <button onClick={handleCreateSpreadsheet}>
          Create New Spreadsheet
        </button>

        <div style={{ marginTop: '20px' }}>
          <p>Or select an existing spreadsheet:</p>
          {availableSheets.length === 0 ? (
            <p>No accessible spreadsheets found.</p>
          ) : (
            <ul>
              {availableSheets.map((s) => (
                <li key={s.id} style={{ marginBottom: '5px' }}>
                  {s.name}{' '}
                  <button onClick={() => handleSelectSheet(s.id)}>
                    Use this sheet
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button onClick={handleLogout} style={{ marginTop: '20px' }}>
          Logout
        </button>
      </div>
    );

  if (loading) return <p style={{ padding: '20px' }}>Loading data…</p>;

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setView('entries')}
          disabled={view === 'entries'}
        >
          Entries
        </button>
        <button
          onClick={() => setView('shoes')}
          disabled={view === 'shoes'}
          style={{ marginLeft: '10px' }}
        >
          Shoes
        </button>
        <button onClick={handleLogout} style={{ marginLeft: '20px' }}>
          Logout
        </button>
      </header>

      {view === 'entries' ? (
        <EntriesView
          token={token}
          spreadsheetId={spreadsheetId}
          shoes={shoes}
          entries={entries}
          setEntries={setEntries}
        />
      ) : (
        <ShoesView
          token={token}
          spreadsheetId={spreadsheetId}
          shoes={shoes}
          entries={entries}
          setShoes={setShoes}
        />
      )}
    </div>
  );
};
