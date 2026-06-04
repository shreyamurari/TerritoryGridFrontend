import { useState } from 'react';
import { motion } from 'framer-motion';

interface JoinScreenProps {
  onJoin: (nickname: string) => Promise<boolean>;
  isLoading: boolean;
  error?: string;
}

export function JoinScreen({ onJoin, isLoading, error }: JoinScreenProps) {
  const [nickname, setNickname] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onJoin(nickname.trim() || `Player${Math.floor(Math.random() * 999)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400/20 to-rose-400/20 border border-white/10 mb-6"
            animate={{ rotate: [0, 2, -2, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <span className="text-3xl">🗺️</span>
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-teal-300 via-white to-rose-300 bg-clip-text text-transparent">
            Territory Grid
          </h1>
          <p className="mt-3 text-gray-400 text-sm leading-relaxed">
            Claim the blocks. Every capture is live for everyone online.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface-raised/80 backdrop-blur-xl border border-surface-border rounded-2xl p-8 shadow-2xl shadow-black/40"
        >
          <label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-2">
            Choose your nickname
          </label>
          <input
            id="nickname"
            type="text"
            maxLength={20}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g. PixelKing"
            className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
            autoFocus
            disabled={isLoading}
          />

          {error && (
            <p className="mt-3 text-sm text-rose-400">{error}</p>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-6 w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 text-surface disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25"
          >
            {isLoading ? 'Connecting…' : 'Enter the Grid'}
          </motion.button>
        </form>

       
      </motion.div>
    </div>
  );
}
