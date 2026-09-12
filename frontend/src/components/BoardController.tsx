import { useEffect, useState } from "react";
import { fetchBoard } from "../api/board.api";
import { useParams } from "react-router-dom";
import Title from "./Title";
import Board from "./Board";
import Clue from "./Clue";
import type { BoardItem, BoardPage } from "../types/board";
import type { ClueData } from "../types/board";
import EditModal from "../modals/EditModal";


const BoardController: React.FC = () => {
  const { boardId } = useParams();
  const [page, setPage] = useState<BoardPage>('TITLE');
  const [board, setBoard] = useState<BoardItem | null>(null);
  const [selectedClueInfo, setSelectedClueInfo] = useState({ catIdx: -1, clueIdx: -1 });
  const [clueData, setClueData] = useState<ClueData>({ score: "", pages: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBoard = async () => {
      try {
        setLoading(true);
        if (!boardId) throw new Error("Board ID is missing");
        const data = await fetchBoard(boardId);
        setBoard(data.payload);

      } catch (error) {
        setError('Failed to fetch board data');
        console.error(error);

      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [boardId]);

  if (loading) return <div>Loading board...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!board) return <div>Board not found</div>;

  const handleSelectClue = (catIdx: number, clueIdx: number) => {
    setSelectedClueInfo({ catIdx, clueIdx });

    if (catIdx === -1 && clueIdx === -1) setClueData(board.board_data.final_jeopardy);
    else setClueData(board.board_data.categories[catIdx].clues[clueIdx]);
    
    setPage('CLUE');
  };

  const pageMap: Record<string, React.ReactNode> = {
    TITLE: <Title title={board.board_data.title} onNext={() => setPage('BOARD')} />,
    BOARD: <Board boardData={board.board_data} onSelectClue={handleSelectClue} />,
    CLUE: <Clue clueData={clueData} onNext={() => setPage('BOARD')} />,
  };

  return (
    <div style={{
      width: "100%",
      height: "100dvh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }}>
      {pageMap[page] ?? <div>Page not found</div>}
      <EditModal
        page={page}
        boardId={board.id}
        boardData={board.board_data}
        setBoard={setBoard}
        selectedClueInfo={selectedClueInfo}
        setClueData={setClueData}
      />
    </div>
  );
};


export default BoardController;