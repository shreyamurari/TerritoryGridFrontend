import { useState, useCallback } from 'react';
import { useSocket } from './hooks/useSocket';
import { JoinScreen } from './components/JoinScreen';
import { Header } from './components/Header';
import { TerritoryGrid } from './components/TerritoryGrid';
import { Sidebar } from './components/Sidebar';
import { MobileBar } from './components/MobileBar';

export default function App() {
  const {
    status,
    user,
    gridSize,
    cells,
    leaderboard,
    stats,
    activity,
    onlineUsers,
    isRegistered,
    lastCaptureFlash,
    register,
    captureCell,
  } = useSocket();

  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | undefined>();

  const handleJoin = useCallback(
    async (nickname: string) => {
      setJoinLoading(true);
      setJoinError(undefined);
      const ok = await register(nickname);
      setJoinLoading(false);
      if (!ok) setJoinError('Could not connect. Is the server running?');
      return ok;
    },
    [register]
  );

  const handleCapture = useCallback(
    (x: number, y: number) => {
      captureCell(x, y);
    },
    [captureCell]
  );

  if (!isRegistered || !user) {
    return (
      <JoinScreen
        onJoin={handleJoin}
        isLoading={joinLoading || status === 'connecting'}
        error={joinError}
      />
    );
  }

  const totalCells = stats?.totalCells ?? gridSize * gridSize;
  const totalClaimed = stats?.totalClaimed ?? cells.size;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header
        activeUsers={stats?.activeUsers ?? onlineUsers.length}
        status={status}
        totalClaimed={totalClaimed}
        totalCells={totalCells}
      />

      <div className="flex flex-1 min-h-0">
        <TerritoryGrid
          gridSize={gridSize}
          cells={cells}
          userId={user.id}
          userColor={user.color}
          lastCaptureFlash={lastCaptureFlash}
          onCapture={handleCapture}
        />

        <Sidebar
          user={user}
          leaderboard={leaderboard}
          stats={stats}
          activity={activity}
          onlineUsers={onlineUsers}
        />
      </div>

      <MobileBar user={user} leaderboard={leaderboard} />
    </div>
  );
}
