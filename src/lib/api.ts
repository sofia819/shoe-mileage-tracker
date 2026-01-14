import type { Shoe, Entry } from './types';

// Helper: fetch wrapper for Sheets API
const sheetsFetch = async (
  token: string,
  url: string,
  options?: RequestInit
) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...options,
  });
  if (!res.ok)
    throw new Error(`Sheets API error: ${res.status} ${res.statusText}`);
  return res.json();
};

// --------------------
// Spreadsheet management
// --------------------
export const createSpreadsheet = async (token: string): Promise<string> => {
  const body = {
    properties: { title: 'Shoe Mileage Tracker' },
    sheets: [
      { properties: { title: 'Shoes' } },
      { properties: { title: 'Entries' } },
    ],
  };
  const data: any = await sheetsFetch(
    token,
    'https://sheets.googleapis.com/v4/spreadsheets',
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
  return data.spreadsheetId;
};

export const validateSpreadsheet = async (
  token: string,
  spreadsheetId: string
): Promise<boolean> => {
  try {
    const data: any = await sheetsFetch(
      token,
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?includeGridData=false`
    );
    const sheetTitles = data.sheets.map((s: any) => s.properties.title);
    return sheetTitles.includes('Shoes') && sheetTitles.includes('Entries');
  } catch {
    return false;
  }
};

// --------------------
// Drive: list user's spreadsheets
// --------------------
export const listUserSheets = async (
  token: string
): Promise<{ id: string; name: string }[]> => {
  const query = encodeURIComponent(
    "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false"
  );
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Drive API error: ${res.status}`);
  const data = await res.json();
  return data.files ?? [];
};

// --------------------
// Shoes CRUD
// --------------------
export const listShoes = async (
  token: string,
  spreadsheetId: string
): Promise<Shoe[]> => {
  const data: any = await sheetsFetch(
    token,
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Shoes!A2:D`
  );
  if (!data.values) return [];
  return data.values.map((row: any) => ({
    id: row[0],
    name: row[1],
    archived: row[2] === 'true',
    totalMiles: parseFloat(row[3] || '0'),
  }));
};

export const createShoe = async (
  token: string,
  spreadsheetId: string,
  shoeName: string
): Promise<Shoe> => {
  const id = crypto.randomUUID();

  // Formula for totalMiles column (column D)
  // It sums all miles in Entries!D:D where Entries!B:B matches this shoe id
  const totalMilesFormula = '=SUMIF(Entries!B:B,A:A,Entries!D:D)';

  const values = [[id, shoeName, 'false', totalMilesFormula]];

  await sheetsFetch(
    token,
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Shoes!A:D:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      body: JSON.stringify({ values }),
    }
  );

  return { id, name: shoeName, archived: false, totalMiles: 0 };
};

// --------------------
// Entries CRUD (sorted descending by date)
// --------------------
export const listEntries = async (
  token: string,
  spreadsheetId: string
): Promise<Entry[]> => {
  const data: any = await sheetsFetch(
    token,
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Entries!A2:D`
  );
  if (!data.values) return [];
  const entries: Entry[] = data.values.map((row: any) => ({
    id: row[0],
    shoeId: row[1],
    date: row[2],
    miles: parseFloat(row[3]),
  }));
  return entries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const createEntry = async (
  token: string,
  spreadsheetId: string,
  entry: { shoeId: string; date: string; miles: number }
): Promise<Entry> => {
  const id = crypto.randomUUID();
  const newEntry: Entry = { id, ...entry };

  const values = [
    [newEntry.id, newEntry.shoeId, newEntry.date, newEntry.miles.toFixed(1)],
  ];

  await sheetsFetch(
    token,
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Entries!A:D:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      body: JSON.stringify({ values }),
    }
  );

  return newEntry;
};
