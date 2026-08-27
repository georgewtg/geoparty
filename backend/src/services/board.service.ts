import { query } from "../db";
import { CategoryData, ClueData } from "../types/board";


export const getAllTitleData = async () => {
  try {
    const result = await query(
      `SELECT id, name FROM boards`
    );
    
    if (result.rows.length === 0) return null;
    return result.rows;

  } catch (error) {
    console.error("Error fetching board data:", error);
    throw error;
  }
};

export const getBoardData = async (boardId: number) => {
  try {
    const result = await query(
      `SELECT * FROM boards WHERE id = $1`,
      [boardId]
    );

    if (result.rows.length === 0) return null;
    return result.rows[0];
    
  } catch (error) {
    console.error("Error fetching board data:", error);
    throw error;
  }
};

export const addBoardData = async (
  name: string,
  title: string,
  num_of_categories: number,
  num_of_questions: number
) => {
  const categories: CategoryData[] = [];
  const clues: ClueData[] = [];

  for (let i = 1; i <= num_of_questions; i++) {
    const clue: ClueData = { score: `${200 * i}`, question: [], answer: [] };
    clues[i-1] = clue;
  }

  for (let i = 1; i <= num_of_categories; i++) {
    categories[i-1] = { id: `cat-${i}`, name: `Category ${i}`, clues: clues }
  }

  const json_data = { title, categories };

  try {
    const result = await query(
      `INSERT INTO boards (name, board_data)
      VALUES ($1, $2) RETURNING id`,
      [name, json_data]
    );

    if (result.rows.length === 0) return null;
    return result.rows[0].id;
    
  } catch (error) {
    console.error("Error inserting board data:", error);
    throw error;
  }
};

export const editBoardData = async (boardId: number, updates : { key: string, value: string}[]) => {
  if (!updates || updates.length === 0) return null;

  try {
    const queryParams: any[] = [boardId];
    const jsonbChain = updates.reduce((acc, curr, index) => {
      const pathParamIdx = index * 2 + 2;
      const valueParamIdx = index * 2 + 3;

      const pathArray = curr.key.split(',');

      queryParams.push(pathArray);
      queryParams.push(JSON.stringify(curr.value));

      return `jsonb_set(${acc}, $${pathParamIdx}::text[], $${valueParamIdx}::jsonb)`;
    }, 'board_data');

    const result = await query(
      `UPDATE boards SET board_data = ${jsonbChain}
      WHERE id = $1 RETURNING *`,
      queryParams
    );

    if (result.rows.length === 0) return null;
    return result.rows[0];
    
  } catch (error) {
    console.error("Error updating board data:", error);
    throw error;
  }
};