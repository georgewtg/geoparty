import { useState } from "react";
import { VolumeContext } from "./VolumeContext";

const VolumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [volume, setVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem("geoparty_volume");
    return saved !== null ? parseFloat(saved) : 100;
  });

  const setVolume = (val: number) => {
    const clamped = Math.min(100, Math.max(0, val));
    setVolumeState(clamped);
    localStorage.setItem("geoparty_volume", clamped.toString());
  };

  // Logarithmic conversion (volume^2) for media player
  const getAudioVolume = () => Math.pow(volume / 100, 2);

  return (
    <VolumeContext.Provider value={{ volume, setVolume, getAudioVolume }}>
      {children}
    </VolumeContext.Provider>
  );
};

export default VolumeProvider;