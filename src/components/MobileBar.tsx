import { UserProfile, LeaderboardEntry } from '@territory-grid/shared';

interface MobileBarProps {
  user: UserProfile;
  leaderboard: LeaderboardEntry[];
}

export function MobileBar({ user, leaderboard }: MobileBarProps) {
  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="lg:hidden border-t border-surface-border bg-surface-raised/80 px-4 py-3 shrink-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-8 h-8 rounded-lg shrink-0"
            style={{ backgroundColor: user.color }}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user.nickname}</p>
            <p className="text-xs text-teal-400 font-mono">{user.cellsOwned} cells</p>
          </div>
        </div>
        {top3.length > 0 && (
          <div className="flex gap-3 text-xs">
            {top3.map((e) => (
              <div key={e.userId} className="text-center">
                <span className="text-gray-500">#{e.rank}</span>
                <p className="font-mono text-teal-400">{e.cellsOwned}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
