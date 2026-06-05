import { memo } from 'react';
import { motion } from 'framer-motion';
import { CellOwnership } from '../shared';

interface GridCellProps {
  x: number;
  y: number;
  cell: CellOwnership | undefined;
  userColor: string | null;
  userId: string | null;
  isFlashing: boolean;
  onCapture: (x: number, y: number) => void;
  onHover: (x: number, y: number | null) => void;
}

export const GridCell = memo(function GridCell({
  x,
  y,
  cell,
  userColor,
  userId,
  isFlashing,
  onCapture,
  onHover,
}: GridCellProps) {
  const isOwned = !!cell?.ownerId;
  const isMine = cell?.ownerId === userId;
  const bg = isOwned ? cell!.ownerColor! : '#1a1f2e';

  return (
    <motion.button
      type="button"
      layout={false}
      initial={false}
      animate={{
        backgroundColor: bg,
        scale: isFlashing ? 1.15 : 1,
        boxShadow: isFlashing
          ? `0 0 12px ${bg}`
          : isMine
            ? `inset 0 0 0 1px ${userColor}88`
            : 'inset 0 0 0 1px rgba(255,255,255,0.03)',
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      whileHover={{ scale: 1.2, zIndex: 10 }}
      className="grid-cell-shadow w-full h-full min-w-0 min-h-0 rounded-[2px] cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-400"
      onClick={() => onCapture(x, y)}
      onMouseEnter={() => onHover(x, y)}
      onMouseLeave={() => onHover(x, null)}
      aria-label={`Cell ${x}, ${y}${isOwned ? ` owned by ${cell?.ownerNickname}` : ' unclaimed'}`}
    />
  );
});
