export type DataType = 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO';

export type BoardData = {
  title: string;
  categories: CategoryData[];
}

export type CategoryData = {
  id: string;
  name: string;
  clues: ClueData[];
}

export type ClueData = {
  score: string;
  question: PageData[];
  answer: PageData[];
}

export type PageData = {
  type: DataType;
  value: string;
}