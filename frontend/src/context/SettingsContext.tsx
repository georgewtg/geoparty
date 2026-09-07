import { createContext, useContext } from "react";

export interface SettingsContextType {
  volume: number;
  setVolume: (v: number) => void;
  getAudioVolume: () => number;

  hasScoreboard: boolean;
  setHasScoreboard: (s: boolean) => void;
}

export const SettingsContext = createContext<SettingsContextType>({} as SettingsContextType);

export const useSettings = () => useContext(SettingsContext);