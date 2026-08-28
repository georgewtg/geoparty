import { useEffect, useState } from "react";
import { fetchBoard } from "../api/board.api";
import { useParams } from "react-router-dom";
import Title from "./Title";
import Board from "./Board";
import Clue from "./Clue";
import type { BoardItem, BoardPage } from "../types/board";
import type { ClueData } from "../types/board";
import EditModal from "../modals/EditModal";
import EditFormModal from "../modals/EditFormModal";


const BoardController: React.FC = () => {
  const { boardId } = useParams();
  const [page, setPage] = useState<BoardPage>('TITLE');
  const [board, setBoard] = useState<BoardItem | null>(null);
  const [selectedClueInfo, setSelectedClueInfo] = useState({ catIdx: -1, clueIdx: -1 });
  const [isShowAnswer, setIsShowAnswer] = useState(false);
  const [clueData, setClueData] = useState<ClueData>({ score: "", question: [], answer: [] });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBoard = async () => {
      try {
        setLoading(true);
        const data = await fetchBoard(parseInt(boardId ?? '', 10));
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

  const handleSelectClue = (clueData: ClueData, catIdx: number, clueIdx: number) => {
    setSelectedClueInfo({ catIdx, clueIdx});
    setClueData(clueData);
    setPage('CLUE');
  };

  const pageMap: Record<string, React.ReactNode> = {
    TITLE: <Title title={board.board_data.title} onNext={() => setPage('BOARD')} />,
    BOARD: <Board boardData={board.board_data} onSelectClue={handleSelectClue} />,
    CLUE: <Clue clueData={clueData} isShowAnswer={isShowAnswer} setIsShowAnswer={setIsShowAnswer} onNext={() => setPage('BOARD')} />,
  };

  return (
    <div style={{
      width: "100%",
      height: "100dvh",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden"
    }}>
      {pageMap[page] ?? <div>Page not found</div>}
      <EditModal onClick={() => setIsModalOpen(true)} />
      <EditFormModal
        isOpen={isModalOpen}
        page={page}
        boardId={board.id}
        boardData={board.board_data}
        setBoard={setBoard}
        selectedClueInfo={selectedClueInfo}
        setClueData={setClueData}
        isShowAnswer={isShowAnswer}
        onClose={() => setIsModalOpen(false)}
        />
    </div>
  );
}


export default BoardController;