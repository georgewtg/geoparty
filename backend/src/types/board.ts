export type DataType = 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO';

export type BoardData = {
  title: string;
  categories: CategoryData[];
  final_jeopardy: ClueData;
}

export type CategoryData = {
  id: string;
  name: string;
  clues: ClueData[];
}

export type ClueData = {
  score: string;
  pages: PageData[][];
}

export type PageData = {
  type: DataType;
  value: string;
}