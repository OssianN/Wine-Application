export type User = {
  _id: string;
  name: string;
  email: string;
  password: string;
  wineList: string[];
  columns: number;
  shelves: number;
};

export type SessionUser = {
  _id: string;
  name: string;
  email: string;
  columns: number;
  shelves: number;
};

export type Wine = {
  _id: string;
  title: string;
  country: string;
  year: number;
  comment: string | null;
  shelf: number;
  column: number;
  archived?: boolean | null;
  img: string;
  rating: string;
  price: number | null;
  currentPrice?: number | null;
  vivinoUrl: string | null;
};

export type ScrapingResult = {
  img: string | null;
  rating: string | null;
  country: string | null;
  vivinoUrl: string | null;
  currentPrice?: number | null;
};
