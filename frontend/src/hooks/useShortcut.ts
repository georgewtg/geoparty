import { useEffect } from "react";

export const useShortcut = (
  keyMap: Record<string, (e: KeyboardEvent) => void>,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) { // ignore shortcut in input
        return;
      }

      const handler = keyMap[e.key];
      if (handler) handler(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyMap, enabled]);
};