import React, { useState } from 'react';
import type { Shoe } from '../lib/types';
import { createShoe } from '../lib/api';

interface ShoesViewProps {
  token: string;
  spreadsheetId: string;
  shoes: Shoe[];
  setShoes: (shoes: Shoe[]) => void;
}

export const ShoesView: React.FC<ShoesViewProps> = ({
  token,
  spreadsheetId,
  shoes,
  setShoes,
}) => {
  const [newShoeName, setNewShoeName] = useState('');

  const handleAddShoe = async () => {
    if (!newShoeName.trim()) return;
    const shoe = await createShoe(token, spreadsheetId, newShoeName.trim());
    setShoes([...shoes, shoe]);
    setNewShoeName('');
  };

  return (
    <div>
      <h2>Shoes</h2>

      <div style={{ marginBottom: '10px' }}>
        <input
          value={newShoeName}
          onChange={(e) => setNewShoeName(e.target.value)}
          placeholder='New shoe name'
        />
        <button onClick={handleAddShoe} style={{ marginLeft: '5px' }}>
          Add Shoe
        </button>
      </div>

      {shoes.length === 0 ? (
        <p>No shoes yet.</p>
      ) : (
        <ul>
          {shoes.map((shoe) => (
            <li key={shoe.id} style={{ marginBottom: '5px' }}>
              {shoe.name} — {shoe.totalMiles?.toFixed(1) ?? 0} miles
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
