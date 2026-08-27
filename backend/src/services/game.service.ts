import { query } from "../db";
import { CategoryData, ClueData } from "../types/board";


export const getAllTitleData = async () => {
  try {
    const result = await query(
      `SELECT id, name FROM games`
    );
    
    if (result.rows.length === 0) return null;
    return result.rows;

  } catch (error) {
    console.error("Error fetching game data:", error);
    throw error;
  }
};

export const getGameData = async (gameId: number) => {
  try {
    const result = await query(
      `SELECT * FROM games WHERE id = $1`,
      [gameId]
    );

    if (result.rows.length === 0) return null;
    return result.rows[0];
    
  } catch (error) {
    console.error("Error fetching game data:", error);
    throw error;
  }
};

export const addGameData = async (
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
      `INSERT INTO games (name, game_data)
      VALUES ($1, $2) RETURNING id`,
      [name, json_data]
    );

    if (result.rows.length === 0) return null;
    return result.rows[0].id;
    
  } catch (error) {
    console.error("Error fetching game data:", error);
    throw error;
  }
};