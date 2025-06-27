import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RotateCcw, Play, Trophy, Target, Clock, Zap, Timer } from 'lucide-react';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { SettingsDialog } from '@/components/SettingsDialog';
import { LeaderboardDialog } from '@/components/LeaderboardDialog';
import { textSamples } from '@/data/textSamples';

const TypingTest = () => {
  const { timeLimit, difficulty, realtimeFeedback, soundEffects } = useSettings();
  const { addScore } = useLeaderboard();
  
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const playSound = useCallback((type: 'correct' | 'incorrect') => {
    if (!soundEffects) return;
    
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(type === 'correct' ? 800 : 400, audioContext.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }, [soundEffects]);

  const generateNewText = useCallback(() => {
    const samples = textSamples[difficulty];
    const randomIndex = Math.floor(Math.random() * samples.length);
    setCurrentText(samples[randomIndex]);
    setUserInput('');
    setCurrentIndex(0);
    setIsActive(false);
    setStartTime(null);
    setTimeLeft(timeLimit);
    setWpm(0);
    setAccuracy(100);
    setIsCompleted(false);
    inputRef.current?.focus();
  }, [difficulty, timeLimit]);

  const startTest = () => {
    generateNewText();
    setIsActive(true);
    setStartTime(Date.now());
    setTimeLeft(timeLimit);
    inputRef.current?.focus();
  };

  const restartTest = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    generateNewText();
  };

  const calculateWPM = useCallback(() => {
    if (!startTime || !isActive) return 0;
    
    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
    const wordsTyped = userInput.trim().split(' ').length;
    return Math.round(wordsTyped / timeElapsed) || 0;
  }, [startTime, userInput, isActive]);

  const calculateAccuracy = useCallback(() => {
    if (userInput.length === 0) return 100;
    
    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (i < currentText.length && userInput[i] === currentText[i]) {
        correctChars++;
      }
    }
    
    return Math.round((correctChars / userInput.length) * 100);
  }, [userInput, currentText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (!isActive && value && !isCompleted) {
      setIsActive(true);
      setStartTime(Date.now());
    }
    
    if (value.length <= currentText.length && !isCompleted) {
      const lastChar = value[value.length - 1];
      const expectedChar = currentText[value.length - 1];
      
      if (soundEffects && lastChar) {
        playSound(lastChar === expectedChar ? 'correct' : 'incorrect');
      }
      
      setUserInput(value);
      setCurrentIndex(value.length);
      
      if (value === currentText) {
        setIsCompleted(true);
        setIsActive(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        // Add score to leaderboard
        const finalWpm = calculateWPM();
        const finalAccuracy = calculateAccuracy();
        addScore(finalWpm, finalAccuracy, timeLimit);
      }
    }
  };

  const renderText = () => {
    return (
      <div className="text-2xl leading-relaxed font-mono select-none p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
        {currentText.split('').map((char, index) => {
          let className = 'transition-all duration-100 ';
          
          if (realtimeFeedback && index < userInput.length) {
            if (userInput[index] === char) {
              className += 'text-green-600 bg-green-100 dark:bg-green-900 ';
            } else {
              className += 'text-white bg-red-500 ';
            }
          } else if (index === currentIndex) {
            className += 'bg-blue-500 text-white animate-pulse ';
          } else {
            className += 'text-gray-600 dark:text-gray-300 ';
          }
          
          return (
            <span key={index} className={className}>
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  // Timer effect
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setIsCompleted(true);
            // Add score to leaderboard
            const finalWpm = calculateWPM();
            const finalAccuracy = calculateAccuracy();
            addScore(finalWpm, finalAccuracy, timeLimit);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timeLeft, calculateWPM, calculateAccuracy, addScore, timeLimit]);

  // Reset timer when time limit changes
  useEffect(() => {
    setTimeLeft(timeLimit);
    if (!isActive) {
      generateNewText();
    }
  }, [timeLimit, generateNewText]);

  useEffect(() => {
    generateNewText();
  }, [generateNewText]);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setWpm(calculateWPM());
        setAccuracy(calculateAccuracy());
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isActive, calculateWPM, calculateAccuracy]);

  const progress = currentText.length > 0 ? (userInput.length / currentText.length) * 100 : 0;
  const timeProgress = ((timeLimit - timeLeft) / timeLimit) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-3">
            <Zap className="text-blue-600" />
            TypeRush
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Test your typing speed and accuracy</p>
          <div className="flex justify-center gap-4 mt-4">
            <SettingsDialog />
            <LeaderboardDialog />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Left</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
              <Progress value={timeProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">WPM</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{wpm}</div>
              <p className="text-xs text-muted-foreground">Words per minute</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
              <p className="text-xs text-muted-foreground">Typing accuracy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{Math.round(progress)}%</div>
              <p className="text-xs text-muted-foreground">Test completion</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            {renderText()}
          </CardContent>
        </Card>

        <div className="mb-6">
          <Progress value={progress} className="h-3" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder="Start typing here..."
            className="flex-1 p-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
            disabled={isCompleted || timeLeft === 0}
          />
          <div className="flex gap-2">
            <Button onClick={startTest} className="flex items-center gap-2">
              <Play size={16} />
              New Test
            </Button>
            <Button 
              variant="outline" 
              onClick={restartTest}
              className="flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Restart
            </Button>
          </div>
        </div>

        {(isCompleted || timeLeft === 0) && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <CardContent className="p-6 text-center">
              <Trophy className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-green-800 dark:text-green-400 mb-2">
                {timeLeft === 0 ? 'Time\'s Up!' : 'Test Completed!'}
              </h3>
              <div className="flex justify-center gap-6 mb-4">
                <Badge variant="secondary" className="text-lg p-2">
                  {wpm} WPM
                </Badge>
                <Badge variant="secondary" className="text-lg p-2">
                  {accuracy}% Accuracy
                </Badge>
              </div>
              <p className="text-green-700 dark:text-green-300">
                {wpm >= 40 ? 'Excellent typing speed!' : 
                 wpm >= 25 ? 'Good typing speed!' : 
                 'Keep practicing to improve your speed!'}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
          <p>Difficulty: <span className="capitalize font-medium">{difficulty}</span> • Time Limit: {timeLimit/60} minute{timeLimit > 60 ? 's' : ''}</p>
          <p className="mt-2">Built with React and Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <SettingsProvider>
      <TypingTest />
    </SettingsProvider>
  );
};

export default Index;
