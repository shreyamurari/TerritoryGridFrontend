import { motion, AnimatePresence } from 'framer-motion';
import {
  UserProfile,
  LeaderboardEntry,
  StatsSnapshot,
  ActivityEvent,
} from '@territory-grid/shared';

interface SidebarProps {
  user: UserProfile;
  leaderboard: LeaderboardEntry[];
  stats: StatsSnapshot | null;
  activity: ActivityEvent[];
  onlineUsers: UserProfile[];
}

export function Sidebar({ user, leaderboard, stats, activity, onlineUsers }: SidebarProps) {
  return (
    <aside className="w-80 shrink-0 border-l border-surface-border bg-surface-raised/40 flex flex-col overflow-hidden hidden lg:flex">
      <div className="p-4 border-b border-surface-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Your profile
        </h2>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl shrink-0 shadow-lg"
            style={{ backgroundColor: user.color }}
          />
          <div className="min-w-0">
            <p className="font-semibold truncate">{user.nickname}</p>
            <p className="text-sm text-teal-400 font-mono">{user.cellsOwned} cells</p>
          </div>
        </div>
      </div>

      {stats && (
        <div className="p-4 border-b border-surface-border grid grid-cols-2 gap-2">
          <StatCard label="Captures" value={stats.totalCaptures} />
          <StatCard label="Claimed" value={`${stats.totalClaimed}`} />
          <StatCard label="Online" value={stats.activeUsers} />
          <StatCard
            label="Top player"
            value={stats.topPlayer?.nickname?.slice(0, 8) ?? '—'}
            small
          />
        </div>
      )}

      <Section title="Leaderboard">
        <ul className="space-y-1">
          <AnimatePresence mode="popLayout">
            {leaderboard.length === 0 ? (
              <li className="text-sm text-gray-500 py-2">No captures yet — be first!</li>
            ) : (
              leaderboard.map((entry) => (
                <motion.li
                  key={entry.userId}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm ${
                    entry.userId === user.id ? 'bg-teal-500/10 border border-teal-500/20' : ''
                  }`}
                >
                  <span className="w-5 text-center font-mono text-gray-500 text-xs">
                    {entry.rank}
                  </span>
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="flex-1 truncate">{entry.nickname}</span>
                  <span className="font-mono text-teal-400/90">{entry.cellsOwned}</span>
                </motion.li>
              ))
            )}
          </AnimatePresence>
        </ul>
      </Section>

      <Section title="Online" scroll>
        <div className="flex flex-wrap gap-1.5">
          {onlineUsers.map((u) => (
            <span
              key={u.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-surface border border-surface-border"
              title={u.nickname}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: u.color }} />
              {u.nickname}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Live feed" scroll flex>
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {activity.map((event) => (
              <motion.li
                key={event.id}
                initial={{ opacity: 0, y: -12, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                className="text-xs text-gray-400 leading-snug flex gap-2"
              >
                {event.userColor && (
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: event.userColor }}
                  />
                )}
                <span>{event.message}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </Section>
    </aside>
  );
}

function StatCard({
  label,
  value,
  small,
}: {
  label: string;
  value: string | number;
  small?: boolean;
}) {
  return (
    <div className="bg-surface rounded-lg px-3 py-2 border border-surface-border/80">
      <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`font-semibold font-mono ${small ? 'text-sm truncate' : 'text-lg'}`}>
        {value}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
  scroll,
  flex,
}: {
  title: string;
  children: React.ReactNode;
  scroll?: boolean;
  flex?: boolean;
}) {
  return (
    <div
      className={`p-4 border-b border-surface-border ${flex ? 'flex-1 min-h-0 flex flex-col' : ''} ${scroll ? 'overflow-y-auto' : ''}`}
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 shrink-0">
        {title}
      </h2>
      <div className={flex ? 'flex-1 min-h-0 overflow-y-auto' : ''}>{children}</div>
    </div>
  );
}
