export type User = {
  _id: string;
  name: string;
  email: string;
  password: string;
  wineList: string[];
  columns: number;
  shelves: number;
};

export type Wine = {
  _id: string;
  title: string;
  country: string;
  year: number;
  comment: string;
  shelf: number;
  column: number;
  archived: boolean;
  img: string;
  rating: string;
  price: number;
  vivinoUrl: string;
};

export type ScrapingResult = {
  img: string;
  rating: string;
  country: string;
  vivinoUrl: string;
};
