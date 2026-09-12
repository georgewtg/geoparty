import { useEffect, useRef } from "react";
import { pauseMedia, playMedia, seekMedia } from "../api/room.api";
import { useSettings } from "../context/SettingsContext";

interface MediaItemProps {
  roomId: string;
  mediaId: string;
  type: 'AUDIO' | 'VIDEO';
  src: string;
  disabled?: boolean;
}

export const MediaItem: React.FC<MediaItemProps> = ({ roomId, mediaId, type, src, disabled }) => {
  const { getAudioVolume } = useSettings();
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);

  const handleMediaRef = (node: HTMLMediaElement | null) => {
    if (node) {
      node.volume = getAudioVolume();
      mediaRef.current = node;
    }
  };

  useEffect(() => {
    const handleRemotePlay = (e: Event) => {
      const customEvent = e as CustomEvent<{ mediaId: string }>;
      if (customEvent.detail.mediaId !== mediaId) return;

      if (mediaRef.current?.paused) {
        mediaRef.current.play().catch(() => console.log("Autoplay blocked"));
      }
    };

    const handleRemotePause = (e: Event) => {
      const customEvent = e as CustomEvent<{ mediaId: string }>;
      if (customEvent.detail.mediaId !== mediaId) return;

      if (mediaRef.current && !mediaRef.current.paused) {
        mediaRef.current.pause();
      }
    };

    const handleRemoteSeeked = (e: Event) => {
      const customEvent = e as CustomEvent<{ mediaId: string; currentTime: number }>;
      if (customEvent.detail.mediaId !== mediaId) return;

      const { currentTime } = customEvent.detail;
      if (mediaRef.current && Math.abs(mediaRef.current.currentTime - currentTime) > 0.3) {
        mediaRef.current.currentTime = currentTime;
      }
    };

    window.addEventListener("remote_media_play", handleRemotePlay);
    window.addEventListener("remote_media_pause", handleRemotePause);
    window.addEventListener("remote_media_seeked", handleRemoteSeeked);

    return () => {
      window.removeEventListener("remote_media_play", handleRemotePlay);
      window.removeEventListener("remote_media_pause", handleRemotePause);
      window.removeEventListener("remote_media_seeked", handleRemoteSeeked);
    };
  }, [mediaId]);

  const handlePlay = () => {
      if (!disabled) playMedia(roomId, mediaId);
    };
  
    const handlePause = () => {
      if (!disabled) pauseMedia(roomId, mediaId);
    };
  
    const handleSeeked = () => {
    if (!disabled && mediaRef.current) {
      const currentTime = mediaRef.current.currentTime;
      seekMedia(roomId, mediaId, currentTime);
    }
  };

  const commonProps = {
    src,
    controls: true,
    className: disabled ? 'player-media-disabled' : '',
    onPlay: handlePlay,
    onPause: handlePause,
    onSeeked: handleSeeked,
  };

  if (type === 'AUDIO') {
    return <audio ref={handleMediaRef} {...commonProps} />
  } else if (type === 'VIDEO') {
    return <video ref={handleMediaRef} {...commonProps} />
  }
};