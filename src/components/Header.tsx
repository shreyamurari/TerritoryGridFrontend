import { motion } from 'framer-motion';
import { ConnectionStatus } from '../hooks/useSocket';

interface HeaderProps {
  activeUsers: number;
  status: ConnectionStatus;
  totalClaimed: number;
  totalCells: number;
}

const statusConfig: Record<ConnectionStatus, { label: string; color: string; dot: string }> = {
  connected: { label: 'Live', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  connecting: { label: 'Connecting', color: 'text-amber-400', dot: 'bg-amber-400 animate-pulse-soft' },
  disconnected: { label: 'Offline', color: 'text-gray-400', dot: 'bg-gray-500' },
  error: { label: 'Error', color: 'text-rose-400', dot: 'bg-rose-400' },
};

export function Header({ activeUsers, status, totalClaimed, totalCells }: HeaderProps) {
  const s = statusConfig[status];
  const pct = totalCells > 0 ? Math.round((totalClaimed / totalCells) * 100) : 0;

  return (
    <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-surface-border bg-surface-raised/60 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-xl">🗺️</span>
        <div>
          <h1 className="text-lg font-bold tracking-tight">Territory Grid</h1>
          <p className="text-xs text-gray-500 font-mono">
            {totalClaimed.toLocaleString()} / {totalCells.toLocaleString()} claimed ({pct}%)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
          <span className="font-mono text-teal-400">{activeUsers}</span>
          <span>online</span>
        </div>

        <motion.div
          layout
          className={`flex items-center gap-2 text-sm font-medium ${s.color}`}
        >
          <span className={`w-2 h-2 rounded-full ${s.dot}`} />
          {s.label}
        </motion.div>
      </div>
    </header>
  );
}
