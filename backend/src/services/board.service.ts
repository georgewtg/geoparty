import { query } from "../db";
import { BoardData, CategoryData, ClueData, DataType, PageData } from "../types/board";
import { updateAssetRefs } from "./asset.service";


const MEDIA_TYPES: Set<DataType> = new Set(['IMAGE', 'VIDEO', 'AUDIO']);

export const extractPublicIds = (boardData: BoardData): string[] => {
  if (!boardData) return [];

  const publicIds = new Set<string>();

  const processPageData = (pageList?: PageData[]) => {
    if (!Array.isArray(pageList)) return;

    for (const page of pageList) {
      if (page && MEDIA_TYPES.has(page.type) && page.value) {
        // Use directly if page.value is public_id, or extract if page.value is a URL
        const publicId = page.value;
        if (publicId) publicIds.add(publicId);
      }
    }
  };

  const processClue = (clue?: ClueData) => {
    if (!clue) return;
    processPageData(clue.question);
    processPageData(clue.answer);
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
      `SELECT id, name FROM boards`
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

  const final_jeopardy: PageData[] = [];
  const json_data = JSON.stringify({ title, categories, final_jeopardy });

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

export const editBoardData = async (boardId: string, updates : { key: string, value: string}[]) => {
  if (!updates || updates.length === 0) return null;

  try {
    // fetch old board json state
    const currentBoardRes = await query(`SELECT board_data FROM boards WHERE id = $1`, [boardId]);
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