
import { Trophy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLeaderboard } from '@/hooks/useLeaderboard';

export const LeaderboardDialog = () => {
  const { scores, clearLeaderboard } = useLeaderboard();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Trophy size={16} />
          Leaderboard
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Scores
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {scores.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No scores yet. Complete a typing test to see your results here!
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {scores.map((score, index) => (
                  <div
                    key={score.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg w-6">#{index + 1}</span>
                      <div>
                        <div className="font-medium">{score.wpm} WPM</div>
                        <div className="text-sm text-muted-foreground">
                          {score.accuracy}% accuracy • {score.timeLimit/60}min • {score.date}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                onClick={clearLeaderboard}
                variant="outline"
                size="sm"
                className="w-full flex items-center gap-2"
              >
                <Trash2 size={14} />
                Clear Leaderboard
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
