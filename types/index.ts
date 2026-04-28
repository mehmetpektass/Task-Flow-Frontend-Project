export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Board {
  _id: string;
  title: string;
  owner: string;
  createdAt: string;
}

export interface Column {
  _id: string;
  title: string;
  board: string;
  order: number;
}

export interface Card {
  _id: string;
  title: string;
  description: string;
  column: string;
  board: string;
  order: number;
}