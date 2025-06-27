
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/contexts/SettingsContext';

export const SettingsDialog = () => {
  const {
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
  } = useSettings();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Time Limit</Label>
            <RadioGroup
              value={timeLimit.toString()}
              onValueChange={(value) => setTimeLimit(parseInt(value))}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="60" id="1min" />
                <Label htmlFor="1min">1 min</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="180" id="3min" />
                <Label htmlFor="3min">3 min</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="300" id="5min" />
                <Label htmlFor="5min">5 min</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Difficulty</Label>
            <RadioGroup
              value={difficulty}
              onValueChange={(value) => setDifficulty(value as 'easy' | 'medium' | 'hard')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="easy" id="easy" />
                <Label htmlFor="easy">Easy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hard" id="hard" />
                <Label htmlFor="hard">Hard</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="realtime-feedback" className="text-sm font-medium">
              Real-time Feedback
            </Label>
            <Switch
              id="realtime-feedback"
              checked={realtimeFeedback}
              onCheckedChange={setRealtimeFeedback}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="text-sm font-medium">
              Dark Mode
            </Label>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sound-effects" className="text-sm font-medium">
              Sound Effects
            </Label>
            <Switch
              id="sound-effects"
              checked={soundEffects}
              onCheckedChange={setSoundEffects}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
