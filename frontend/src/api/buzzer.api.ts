import { socket } from "./socket";

export const resetBuzzer = (roomId: string) => {
  socket.emit("reset_buzzer", roomId);
};

export const sendBuzzer = (roomId: string, name: string, pressTime: number) => {
  socket.emit("send_buzzer", { roomId: roomId, name: name, pressTime: pressTime });
};

export const toggleBuzzerLock = (roomId: string, isUnlocked: boolean) => {
  socket.emit("toggle_lock", { roomId: roomId, isOpen: isUnlocked });
};