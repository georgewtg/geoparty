import { query } from "../db";
import { BoardData, CategoryData, ClueData, DataType, PageData } from "../types/board";
import { updateAssetRefs } from "./asset.service";


const MEDIA_TYPES: Set<DataType> = new Set(['IMAGE', 'VIDEO', 'AUDIO']);

export const extractPublicIds = (boardData: BoardData): string[] => {
  if (!boardData) return [];

  const publicIds = new Set<string>();

  const processPageData = (pages?: PageData[][]) => {
    if (!Array.isArray(pages)) return;

    for (const page of pages) {
      if (!Array.isArray(page)) continue;

      for (const item of page) {
        if (item && MEDIA_TYPES.has(item.type) && item.value) {
          const publicId = item.value;
          if (publicId) publicIds.add(publicId);
        }
      }
    }
  };

  const processClue = (clue?: ClueData) => {
    if (!clue) return;
    processPageData(clue.pages);
  };

  // process regular categories
  boardData.categories?.forEach((category) => {
    category.clues?.forEach(processClue);
  });

  // process Final Jeopardy
  processClue(boardData.final_jeopardy);

  return Array.from(publicIds);
};


export const getAllTitleData = async () => {
  try {
    const result = await query(
      `SELECT 
        b.id AS id, 
        b.name AS name
      FROM boards b
      JOIN user_boards ub ON b.id = ub.board_id
      ORDER BY b.created_at DESC`
    );
    
    if (result.rows.length === 0) return [];
    return result.rows;

  } catch (error) {
    console.error("Error fetching board data:", error);
    throw error;
  }
};

export const getBoardData = async (boardId: string) => {
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
  userId: string,
  name: string,
  title: string,
  num_of_categories: number,
  num_of_questions: number
) => {
  const categories: CategoryData[] = [];
  const clues: ClueData[] = [];

  for (let i = 1; i <= num_of_questions; i++) {
    const clue: ClueData = { score: `${200 * i}`, pages: [] };
    clues[i-1] = clue;
  }

  for (let i = 1; i <= num_of_categories; i++) {
    categories[i-1] = { id: `cat-${i}`, name: `Category ${i}`, clues: clues }
  }

  const final_jeopardy: PageData[] = [];
  const json_data = JSON.stringify({ title, categories, final_jeopardy });

  try {
    const result = await query(
      `WITH new_board AS (
        INSERT INTO boards (name, board_data)
        VALUES ($1, $2)
        RETURNING id
      )
      INSERT INTO user_boards (user_id, board_id)
      SELECT $3, id FROM new_board
      RETURNING board_id`,
      [name, json_data, userId]
    );

    if (result.rows.length === 0) return null;
    return result.rows[0].board_id;
    
  } catch (error) {
    console.error("Error inserting board data:", error);
    throw error;
  }
};

export const editBoardData = async (boardId: string, updates : { key: string, value: string}[]) => {
  if (!updates || updates.length === 0) return null;

  try {
    // fetch old board json state
    const currentBoardRes = await query(
      `SELECT board_data FROM boards WHERE id = $1`,
      [boardId]
    );
    if (currentBoardRes.rows.length === 0) return null;

    const oldBoardData = currentBoardRes.rows[0].board_data;
    const oldPublicIds = extractPublicIds(oldBoardData);

    // update json entries
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

    // extract new board json state
    const newBoardData = result.rows[0].board_data;
    const newPublicIds = extractPublicIds(newBoardData);

    await updateAssetRefs(oldPublicIds, newPublicIds);

    return result.rows[0];
    
  } catch (error) {
    console.error("Error updating board data:", error);
    throw error;
  }
};