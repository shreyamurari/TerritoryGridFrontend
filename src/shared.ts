export const GRID_SIZE = 50;
export const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

export interface UserProfile {
  id: string;
  nickname: string;
  color: string;
  cellsOwned: number;
}

export interface CellOwnership {
  x: number;
  y: number;
  ownerId: string | null;
  ownerNickname: string | null;
  ownerColor: string | null;
  capturedAt: string | null;
}

export interface GridState {
  cells: CellOwnership[];
  gridSize: number;
  totalClaimed: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  nickname: string;
  color: string;
  cellsOwned: number;
}

export interface StatsSnapshot {
  totalCells: number;
  totalClaimed: number;
  activeUsers: number;
  totalCaptures: number;
  topPlayer: LeaderboardEntry | null;
}

export interface ActivityEvent {
  id: string;
  type: 'capture' | 'takeover' | 'join';
  message: string;
  timestamp: string;
  userColor?: string;
}

export interface CaptureResult {
  success: boolean;
  cell: CellOwnership;
  previousOwnerId: string | null;
  error?: string;
}

// Socket events — server → client
export interface ServerToClientEvents {
  'grid:sync': (state: GridState) => void;
  'cell:updated': (cell: CellOwnership, event: ActivityEvent) => void;
  'capture:failed': (payload: { x: number; y: number; reason: string }) => void;
  'leaderboard:updated': (entries: LeaderboardEntry[]) => void;
  'stats:updated': (stats: StatsSnapshot) => void;
  'users:online': (users: UserProfile[]) => void;
  'activity:new': (event: ActivityEvent) => void;
  'user:joined': (user: UserProfile) => void;
}

// Socket events — client → server
export interface ClientToServerEvents {
  'user:register': (
    payload: { nickname: string },
    callback: (result: { user: UserProfile; grid: GridState; leaderboard: LeaderboardEntry[]; stats: StatsSnapshot; activity: ActivityEvent[] }) => void
  ) => void;
  'cell:capture': (
    payload: { x: number; y: number },
    callback: (result: CaptureResult) => void
  ) => void;
}

export interface InterServerEvents {
  'cell:broadcast': (cell: CellOwnership, event: ActivityEvent) => void;
}

export interface SocketData {
  userId: string;
  nickname: string;
  color: string;
}
