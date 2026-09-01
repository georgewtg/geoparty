export const DATA_TYPES = ['TEXT', 'IMAGE', 'AUDIO', 'VIDEO'] as const;
export type DataType = (typeof DATA_TYPES)[number];
export type BoardPage = 'TITLE' | 'BOARD' | 'CLUE';

export type BoardData = {
  title: string;
  categories: CategoryData[];
  final_jeopardy: ClueData;
};

export type CategoryData = {
  id: string;
  name: string;
  clues: ClueData[];
};

export type ClueData = {
  score: string;
  question: PageData[];
  answer: PageData[];
};

export type PageData = {
  type: DataType;
  value: string;
};

export type BoardListItem = {
  id: string;
  name: string;
};

export type BoardItem = {
  id: string;
  name: string;
  board_data: BoardData;
};

export type CreateBoardPayload = {
  name: string;
  title: string;
  num_of_categories: number;
  num_of_questions: number;
};

export type UpdateBoardPayload = {
  key: string;
  value: string | PageData[];
}[]