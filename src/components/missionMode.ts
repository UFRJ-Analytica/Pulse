import { useSyncExternalStore } from 'react';

// Mission mode shared by every page header, kept across pages and reloads like the theme.
export type MissionMode = 'ISS' | 'Lunar Base' | 'Mars Transit';
export const MISSION_MODES: MissionMode[] = ['ISS', 'Lunar Base', 'Mars Transit'];
const STORAGE_KEY = 'pulse-health-mission';
const listeners = new Set<() => void>();

function readStored(): MissionMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return MISSION_MODES.find(mode => mode === saved) ?? 'ISS';
  } catch { return 'ISS'; }
}

let current = readStored();

export function setMissionMode(mode: MissionMode) {
  current = mode;
  try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* Keep the mode for this session. */ }
  listeners.forEach(listener => listener());
}

export function useMissionMode(): MissionMode {
  return useSyncExternalStore(listener => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, () => current);
}
