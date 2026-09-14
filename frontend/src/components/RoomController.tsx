import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Title from "./Title";
import Board from "./Board";
import Clue from "./Clue";
import type { BoardItem, BoardPage } from "../types/board";
import type { ClueData } from "../types/board";
import type { PlayerItem, RoomItem } from "../types/multiplayer";
import ScoreboardModal from "../modals/ScoreboardModal";
import { fetchBoard } from "../api/board.api";
import { changeCluePage, changePage, rejoinRoom, selectClue, updateScore } from "../api/room.api";
import { socket, wakeSocket } from "../api/socket";
import { useAuth } from "../context/AuthContext";


const RoomController: React.FC = () => {
  const { roomId } = useParams();
  const { user } = useAuth();

  const [page, setPage] = useState<BoardPage>('TITLE');
  const [board, setBoard] = useState<BoardItem>({} as BoardItem);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [hostId, setHostId] = useState<string>('');
  const [hostName, setHostName] = useState<string>('');
  const [players, setPlayers] = useState<Record<string, PlayerItem>>({} as Record<string, PlayerItem>);

  const [visitedCells, setVisitedCells] = useState<string[]>([]);
  const [clueData, setClueData] = useState<ClueData>({ score: "", pages: [] });
  const [cluePageIndex, setCluePageIndex] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { // unlock auto play media
    const unlockAudioContext = () => {
      const dummyAudio = new Audio();
      dummyAudio.src = "data:audio/wav;base64,U2FtcGxl";

      dummyAudio
        .play()
        .then(() => {
          dummyAudio.pause();
        })
        .catch(() => {
          // ignore failed attempt
        });

      // cleanup immediately
      window.removeEventListener("click", unlockAudioContext);
      window.removeEventListener("keydown", unlockAudioContext);
      window.removeEventListener("touchstart", unlockAudioContext);
    };

    window.addEventListener("click", unlockAudioContext);
    window.addEventListener("keydown", unlockAudioContext);
    window.addEventListener("touchstart", unlockAudioContext);

    return () => {
      window.removeEventListener("click", unlockAudioContext);
      window.removeEventListener("keydown", unlockAudioContext);
      window.removeEventListener("touchstart", unlockAudioContext);
    };
  }, []);

  useEffect(() => { // join room
    if (!roomId || !user?.id) {
      setError("Room ID or User session missing");
      setLoading(false);
      return;
    }

    setLoading(true);
    let active = true;
    let rejoinedSocketId: string | undefined;
    const rejoinCurrentRoom = () => {
      if (!active || !socket.id || socket.id === rejoinedSocketId) return;
      rejoinedSocketId = socket.id;
      rejoinRoom(roomId, user.id);
    };

    socket.on("connect", rejoinCurrentRoom);

    wakeSocket()
      .then(() => {
        if (!active) return;
        if (socket.connected) rejoinCurrentRoom();
        else socket.connect();
      })
      .catch((error) => {
        if (!active) return;
        console.error(error);
        setError("Failed to connect to the game server");
        setLoading(false);
      });

    return () => {
      active = false;
      socket.off("connect", rejoinCurrentRoom);
    };
  }, [roomId, user?.id]);

  useEffect(() => { // fetch board data
    const loadBoard = async (roomData: RoomItem) => {
      try {
        if (!roomId) throw new Error("Room ID is missing");
        const boardData = (await fetchBoard(roomData.boardId)).payload;
        setBoard(boardData);

        const hostId = roomData.hostId;
        setHostId(hostId);
        const { [hostId]: hostPlayer, ...filteredPlayers } = roomData.players;

        if (hostId === user?.id) setIsHost(true);
        if (hostPlayer) setHostName(hostPlayer.username);
        setPlayers(filteredPlayers);

        // loadGameState
        if (roomData.gameState) {
          setPage(roomData.gameState.page ?? "TITLE");
          setVisitedCells(roomData.gameState.visitedCells ?? []);
          setCluePageIndex(roomData.gameState.cluePageIdx ?? 0);

          const cellId = roomData.gameState.cellId;
          if (cellId === "final") {
            setClueData(boardData.board_data.final_jeopardy);
          } else if (cellId && cellId.includes("-")) {
            const [catIdx, clueIdx] = cellId.split("-").map(Number);
            setClueData(boardData.board_data.categories[catIdx]?.clues[clueIdx]);
          }
        }

      } catch (error) {
        console.error(error);
        setError("Failed to fetch board data");

      } finally {
        setLoading(false);
      }
    };

    const handleRoomNotFound = () => {
      setLoading(false);
      setError("Room Not Found");
    };

    socket.on("room_rejoined", loadBoard);
    socket.on("room_not_found", handleRoomNotFound);

    return () => {
      socket.off("room_rejoined", loadBoard);
      socket.off("room_not_found", handleRoomNotFound);
    };
  }, [roomId, user?.id]);

  useEffect(() => {
    const handleClueSelected = (cellId: string) => {
      const [catIdx, clueIdx] = cellId.split('-').map(Number);
      setClueData(board.board_data.categories[catIdx].clues[clueIdx]);
      setVisitedCells((prev) => [...prev, cellId]);
      setCluePageIndex(0);
      setPage('CLUE');
    };

    const handleScoreUpdated = ({ playerId, score }: { playerId: string, score: number }) => {
      setPlayers((prev) => {
        return {
          ...prev,
          [playerId]: {
            ...prev[playerId],
            score: score
          }
        };
      });
    };

    const handleMediaPlay = (mediaId: string) => {
      window.dispatchEvent(new CustomEvent("remote_media_play", { detail: { mediaId } }));
    };

    const handleMediaPause = (mediaId: string) => {
      window.dispatchEvent(new CustomEvent("remote_media_pause", { detail: { mediaId } }));
    };

    const handleMediaSeeked = ({ mediaId, currentTime }: { mediaId: string, currentTime: number }) => {
      window.dispatchEvent(new CustomEvent("remote_media_seeked", { detail: { mediaId, currentTime } }));
    };

    socket.on("update_players", (updatedPlayers: Record<string, PlayerItem>) => setPlayers(updatedPlayers));
    socket.on("score_updated", handleScoreUpdated)
    socket.on("page_changed", (newPage: BoardPage) => setPage(newPage));
    socket.on("clue_selected", handleClueSelected);
    socket.on("clue_page_changed", (index: number) => setCluePageIndex(index));
    socket.on("media_played", handleMediaPlay);
    socket.on("media_paused", handleMediaPause);
    socket.on("media_seeked", handleMediaSeeked);

    return () => {
      socket.off("update_players");
      socket.off("score_updated", handleScoreUpdated);
      socket.off("page_changed");
      socket.off("clue_selected", handleClueSelected);
      socket.off("clue_page_changed");
      socket.off("media_played", handleMediaPlay);
      socket.off("media_paused", handleMediaPause);
      socket.off("media_seeked", handleMediaSeeked);
    };
  }, [roomId, board]);

  if (loading) return <div>Loading board...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!board) return <div>Board not found</div>;

  const handleUpdateScore = (playerId: string, score: number) => {
    if (!roomId) return;
    updateScore(roomId, playerId, score);
  };

  const handlePageChange = (newPage: BoardPage) => {
    if (!roomId) return;
    setPage(newPage);
    changePage(roomId, newPage);
  };

  const handleSelectClue = (catIdx: number, clueIdx: number) => {
    if (catIdx === -1 && clueIdx === -1) setClueData(board.board_data.final_jeopardy);
    else setClueData(board.board_data.categories[catIdx].clues[clueIdx]);

    setCluePageIndex(0);
    setPage('CLUE');
  };

  const handleCellClick = (cellId: string) => {
    if (!roomId) return;
    setVisitedCells((prev) => [...prev, cellId]);
    selectClue(roomId, cellId);
  };

  const handleCluePageChange = (newIndex: number) => {
    if (!roomId) return;
    setCluePageIndex(newIndex);
    changeCluePage(roomId, newIndex);
  };

  const pageMap: Record<string, React.ReactNode> = {
    TITLE: <Title title={board.board_data.title} onNext={() => handlePageChange('BOARD')} disabled={!isHost} />,
    BOARD: <Board boardData={board.board_data} onSelectClue={handleSelectClue} disabled={!isHost} visitedCells={visitedCells} onCellClick={handleCellClick} />,
    CLUE: <Clue clueData={clueData} onNext={() => handlePageChange('BOARD')} disabled={!isHost} hostId={hostId} roomId={roomId} pageIndex={cluePageIndex} onPageChange={handleCluePageChange} />,
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
      <ScoreboardModal
        hostName={hostName}
        roomId={roomId ?? ''}
        players={players}
        setPlayers={setPlayers}
        disabled={!isHost}
        onUpdateScore={handleUpdateScore}
      />
    </div>
  );
};


export default RoomController;