
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  timeLimit: number;
  setTimeLimit: (time: number) => void;
  difficulty: 'easy' | 'medium' | 'hard';
  setDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  realtimeFeedback: boolean;
  setRealtimeFeedback: (enabled: boolean) => void;
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
  soundEffects: boolean;
  setSoundEffects: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [timeLimit, setTimeLimit] = useState(() => {
    const saved = localStorage.getItem('typing-time-limit');
    return saved ? parseInt(saved) : 60;
  });
  
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(() => {
    const saved = localStorage.getItem('typing-difficulty');
    return (saved as 'easy' | 'medium' | 'hard') || 'medium';
  });
  
  const [realtimeFeedback, setRealtimeFeedback] = useState(() => {
    const saved = localStorage.getItem('typing-realtime-feedback');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('typing-dark-mode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [soundEffects, setSoundEffects] = useState(() => {
    const saved = localStorage.getItem('typing-sound-effects');
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('typing-time-limit', timeLimit.toString());
  }, [timeLimit]);

  useEffect(() => {
    localStorage.setItem('typing-difficulty', difficulty);
  }, [difficulty]);

  useEffect(() => {
    localStorage.setItem('typing-realtime-feedback', JSON.stringify(realtimeFeedback));
  }, [realtimeFeedback]);

  useEffect(() => {
    localStorage.setItem('typing-dark-mode', JSON.stringify(darkMode));
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('typing-sound-effects', JSON.stringify(soundEffects));
  }, [soundEffects]);

  return (
    <SettingsContext.Provider value={{
      timeLimit,
      setTimeLimit,
      difficulty,
      setDifficulty,
      realtimeFeedback,
      setRealtimeFeedback,
      darkMode,
      setDarkMode,
      soundEffects,
      setSoundEffects,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
