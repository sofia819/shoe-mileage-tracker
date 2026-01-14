export interface Shoe {
  id: string;
  name: string;
  archived: boolean;
  totalMiles: number;
}

export interface Entry {
  id: string;
  shoeId: string;
  date: string;
  miles: number;
}
