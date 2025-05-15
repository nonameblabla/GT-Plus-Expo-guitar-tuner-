// SettingsContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from 'react';
import { initDatabase, getAllSettings, setSetting } from './database';

export type NoteLang = 'uk' | 'en';
export type Tuning =
  | 'standard'
  | 'dropD'
  | 'dropDG'
  | 'dropC'
  | 'DADGAD'
  | 'openG';
export type Handed = 'right' | 'left';
export type GuitarType = 'six' | 'seven' | 'eight';

interface Settings {
  darkMode: boolean;
  setDarkMode: (v: boolean) => Promise<void>;
  noteLang: NoteLang;
  setNoteLang: (v: NoteLang) => Promise<void>;
  tuning: Tuning;
  setTuning: (v: Tuning) => Promise<void>;
  handedness: Handed;
  setHandedness: (v: Handed) => Promise<void>;
  guitarType: GuitarType;
  setGuitarType: (v: GuitarType) => Promise<void>;
  isReady: boolean;
}

export const SettingsContext = createContext<Settings>({
  darkMode: false,
  setDarkMode: async () => {},
  noteLang: 'uk',
  setNoteLang: async () => {},
  tuning: 'standard',
  setTuning: async () => {},
  handedness: 'right',
  setHandedness: async () => {},
  guitarType: 'six',
  setGuitarType: async () => {},
  isReady: false,
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkModeState] = useState(false);
  const [noteLang, setNoteLangState] = useState<NoteLang>('uk');
  const [tuning, setTuningState] = useState<Tuning>('standard');
  const [handedness, setHandednessState] = useState<Handed>('right');
  const [guitarType, setGuitarTypeState] = useState<GuitarType>('six');
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initDatabase();
      const all = await getAllSettings();
      setDarkModeState(all.darkMode === 'true');
      setNoteLangState(all.noteLang as NoteLang);
      setTuningState(all.tuning as Tuning);
      setHandednessState(all.handedness as Handed);
      setGuitarTypeState(all.guitarType as GuitarType);
      setReady(true);
    })();
  }, []);

  const setDarkMode = async (v: boolean) => {
    await setSetting('darkMode', String(v));
    setDarkModeState(v);
  };
  const setNoteLang = async (v: NoteLang) => {
    await setSetting('noteLang', v);
    setNoteLangState(v);
  };
  const setTuning = async (v: Tuning) => {
    await setSetting('tuning', v);
    setTuningState(v);
  };
  const setHandedness = async (v: Handed) => {
    await setSetting('handedness', v);
    setHandednessState(v);
  };
  const setGuitarType = async (v: GuitarType) => {
    await setSetting('guitarType', v);
    setGuitarTypeState(v);
  };

  const contextValue = useMemo(
    () => ({
      darkMode,
      setDarkMode,
      noteLang,
      setNoteLang,
      tuning,
      setTuning,
      handedness,
      setHandedness,
      guitarType,
      setGuitarType,
      isReady,
    }), [darkMode, noteLang, tuning, handedness, guitarType, isReady]
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};