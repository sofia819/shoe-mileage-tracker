import React, { useState } from 'react';
import { ShoesView } from './ShoesView';
import { EntriesView } from './EntriesView';

interface Props {
  token: string;
  spreadsheetId: string;
  onLogout: () => void;
}

export const MainTabs: React.FC<Props> = ({
  token,
  spreadsheetId,
  onLogout,
}) => {
  const [tab, setTab] = useState<'shoes' | 'entries'>('shoes');

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setTab('shoes')}>Shoes</button>
        <button
          onClick={() => setTab('entries')}
          style={{ marginLeft: '10px' }}
        >
          Entries
        </button>
        <button onClick={onLogout} style={{ marginLeft: '10px' }}>
          Logout
        </button>
      </div>
      {tab === 'shoes' ? (
        <ShoesView token={token} spreadsheetId={spreadsheetId} />
      ) : (
        <EntriesView token={token} spreadsheetId={spreadsheetId} />
      )}
    </div>
  );
};
