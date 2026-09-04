import { createContext, useContext } from "react";

export interface VolumeContextType {
  volume: number;
  setVolume: (v: number) => void;
  getAudioVolume: () => number;
}

export const VolumeContext = createContext<VolumeContextType>({} as VolumeContextType);

export const useVolume = () => useContext(VolumeContext);