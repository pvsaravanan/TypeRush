
import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  id: string;
  wpm: number;
  accuracy: number;
  date: string;
  timeLimit: number;
}

export const useLeaderboard = () => {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('typing-leaderboard');
    if (saved) {
      setScores(JSON.parse(saved));
    }
  }, []);

  const addScore = (wpm: number, accuracy: number, timeLimit: number) => {
    const newEntry: LeaderboardEntry = {
      id: Date.now().toString(),
      wpm,
      accuracy,
      date: new Date().toLocaleDateString(),
      timeLimit,
    };

    const updatedScores = [...scores, newEntry]
      .sort((a, b) => b.wpm - a.wpm)
      .slice(0, 10); // Keep top 10

    setScores(updatedScores);
    localStorage.setItem('typing-leaderboard', JSON.stringify(updatedScores));
  };

  const clearLeaderboard = () => {
    setScores([]);
    localStorage.removeItem('typing-leaderboard');
  };

  return { scores, addScore, clearLeaderboard };
};
