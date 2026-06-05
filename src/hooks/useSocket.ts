import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  UserProfile,
  GridState,
  CellOwnership,
  LeaderboardEntry,
  StatsSnapshot,
  ActivityEvent,
  CaptureResult,
} from '../shared';
import { SOCKET_URL } from '../config';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

function cellKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function useSocket() {
  const socketRef = useRef<AppSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [gridSize, setGridSize] = useState(50);
  const [cells, setCells] = useState<Map<string, CellOwnership>>(new Map());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<StatsSnapshot | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserProfile[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [lastCaptureFlash, setLastCaptureFlash] = useState<string | null>(null);

  const applyCell = useCallback((cell: CellOwnership) => {
    setCells((prev) => {
      const next = new Map(prev);
      next.set(cellKey(cell.x, cell.y), cell);
      return next;
    });
  }, []);

  const syncGrid = useCallback((grid: GridState) => {
    setGridSize(grid.gridSize);
    const map = new Map<string, CellOwnership>();
    for (const cell of grid.cells) {
      if (cell.ownerId) {
        map.set(cellKey(cell.x, cell.y), cell);
      }
    }
    setCells(map);
  }, []);

  useEffect(() => {
    const socket: AppSocket = io(SOCKET_URL || undefined, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => setStatus('connected'));
    socket.on('disconnect', () => {
      setStatus('disconnected');
      setIsRegistered(false);
    });
    socket.on('connect_error', () => setStatus('error'));

    socket.on('grid:sync', syncGrid);

    socket.on('cell:updated', (cell, event) => {
      applyCell(cell);
      setLastCaptureFlash(cellKey(cell.x, cell.y));
      setTimeout(() => setLastCaptureFlash(null), 400);
      setActivity((prev) => [event, ...prev].slice(0, 50));
    });

    socket.on('capture:failed', ({ x, y }) => {
      setCells((prev) => {
        const next = new Map(prev);
        next.delete(cellKey(x, y));
        return next;
      });
    });

    socket.on('leaderboard:updated', (entries) => {
      setLeaderboard(entries);
      setUser((u) => {
        if (!u) return u;
        const me = entries.find((e) => e.userId === u.id);
        return me ? { ...u, cellsOwned: me.cellsOwned } : u;
      });
    });
    socket.on('stats:updated', setStats);
    socket.on('users:online', setOnlineUsers);
    socket.on('activity:new', (event) => {
      setActivity((prev) => [event, ...prev].slice(0, 50));
    });

    socket.on('user:joined', (joinedUser) => {
      setOnlineUsers((prev) => {
        if (prev.some((u) => u.id === joinedUser.id)) return prev;
        return [...prev, joinedUser];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [applyCell, syncGrid]);

  const register = useCallback(
    (nickname: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const socket = socketRef.current;
        if (!socket?.connected) {
          resolve(false);
          return;
        }

        setStatus('connecting');
        socket.emit('user:register', { nickname }, (result) => {
          if (!result.user.id) {
            setStatus('error');
            resolve(false);
            return;
          }
          setUser(result.user);
          syncGrid(result.grid);
          setLeaderboard(result.leaderboard);
          setStats(result.stats);
          setActivity(result.activity);
          setIsRegistered(true);
          setStatus('connected');
          resolve(true);
        });
      });
    },
    [syncGrid]
  );

  const captureCell = useCallback(
    (x: number, y: number): Promise<CaptureResult | null> => {
      return new Promise((resolve) => {
        const socket = socketRef.current;
        if (!socket?.connected || !user) {
          resolve(null);
          return;
        }

        const key = cellKey(x, y);
        const optimistic: CellOwnership = {
          x,
          y,
          ownerId: user.id,
          ownerNickname: user.nickname,
          ownerColor: user.color,
          capturedAt: new Date().toISOString(),
        };

        setCells((prev) => {
          const next = new Map(prev);
          next.set(key, optimistic);
          return next;
        });
        setLastCaptureFlash(key);

        socket.emit('cell:capture', { x, y }, (result) => {
          if (result.success) {
            applyCell(result.cell);
          } else {
            applyCell(result.cell);
            if (!result.cell.ownerId) {
              setCells((prev) => {
                const next = new Map(prev);
                next.delete(key);
                return next;
              });
            }
          }
          setTimeout(() => setLastCaptureFlash(null), 400);
          resolve(result);
        });
      });
    },
    [user, applyCell]
  );

  return {
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
  };
}
