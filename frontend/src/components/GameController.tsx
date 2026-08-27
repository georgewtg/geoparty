import { useEffect, useState } from "react";
import Title from "./Title";
import Board from "./Board";
import { fetchGame } from "../api/game.api";
import { useParams } from "react-router-dom";
import type { GameItem } from "../types/game";
import Clue from "./Clue";
import type { ClueData } from "../types/board";


type GamePage = 'TITLE' | 'BOARD' | 'CLUE';


const GameController: React.FC = () => {
  const { gameId } = useParams();
  const [page, setPage] = useState<GamePage>('TITLE');
  const [game, setGame] = useState<GameItem | null>(null);
  const [clueData, setClueData] = useState<ClueData>({ score: "", question: [], answer: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGame = async () => {
      try {
        setLoading(true);
        const data = await fetchGame(parseInt(gameId ?? '', 10));
        setGame(data.payload);

      } catch (error) {
        setError('Failed to fetch game data');
        console.error(error);

      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [gameId]);

  if (loading) return <div>Loading board...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!game) return <div>Game not found</div>;

  const handleSelectClue = (clueData: ClueData) => {
    setClueData(clueData);
    setPage('CLUE');
  };

  const pageMap: Record<string, React.ReactNode> = {
    TITLE: <Title title={game.game_data.title} onNext={() => setPage('BOARD')} />,
    BOARD: <Board boardData={game.game_data} onSelectClue={handleSelectClue} />,
    CLUE: <Clue clueData={clueData} onNext={() => setPage('BOARD')} />,
  };

  return (
    <div style={{
      width: "100%",
      height: "100dvh",
      display: "flex",
      flexDirection: "column",
    }}>
      {pageMap[page] ?? <div>Page not found</div>}
    </div>
  );
}


export default GameController;