import { useState, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CellOwnership } from '../shared';
import { GridCell } from './GridCell';

interface TerritoryGridProps {
  gridSize: number;
  cells: Map<string, CellOwnership>;
  userId: string | null;
  userColor: string | null;
  lastCaptureFlash: string | null;
  onCapture: (x: number, y: number) => void;
}

export function TerritoryGrid({
  gridSize,
  cells,
  userId,
  userColor,
  lastCaptureFlash,
  onCapture,
}: TerritoryGridProps) {
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((s) => Math.min(3, Math.max(0.4, s + delta)));
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 1 && !e.altKey && !e.shiftKey) return;
      e.preventDefault();
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    },
    [pan]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    setPan({
      x: panStart.current.panX + (e.clientX - panStart.current.x),
      y: panStart.current.panY + (e.clientY - panStart.current.y),
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const cellElements = useMemo(() => {
    const elements = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const key = `${x},${y}`;
        elements.push(
          <GridCell
            key={key}
            x={x}
            y={y}
            cell={cells.get(key)}
            userId={userId}
            userColor={userColor}
            isFlashing={lastCaptureFlash === key}
            onCapture={onCapture}
            onHover={(cx, cy) => setHoverCoord(cy !== null ? { x: cx, y: cy } : null)}
          />
        );
      }
    }
    return elements;
  }, [gridSize, cells, userId, userColor, lastCaptureFlash, onCapture]);

  const hoverCell = hoverCoord ? cells.get(`${hoverCoord.x},${hoverCoord.y}`) : null;

  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      <div className="flex items-center justify-between px-4 py-2 border-b border-surface-border/50 shrink-0">
        <div className="text-xs font-mono text-gray-500">
          {hoverCoord ? (
            <span>
              ({hoverCoord.x}, {hoverCoord.y})
              {hoverCell?.ownerNickname && (
                <span className="text-gray-400"> — {hoverCell.ownerNickname}</span>
              )}
              {!hoverCell?.ownerId && <span className="text-teal-500/80"> — unclaimed</span>}
            </span>
          ) : (
            <span>Hover a cell · Scroll to zoom · Alt+drag to pan</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.4, s - 0.2))}
            className="w-8 h-8 rounded-lg bg-surface border border-surface-border text-sm hover:bg-surface-border transition-colors"
          >
            −
          </button>
          <span className="text-xs font-mono w-12 text-center text-gray-400">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(3, s + 0.2))}
            className="w-8 h-8 rounded-lg bg-surface border border-surface-border text-sm hover:bg-surface-border transition-colors"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => {
              setScale(1);
              setPan({ x: 0, y: 0 });
            }}
            className="px-2 h-8 rounded-lg bg-surface border border-surface-border text-xs hover:bg-surface-border transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <motion.div
          className="origin-center p-8"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div
            className="mx-auto grid gap-[1px] bg-surface-border/30 p-[1px] rounded-lg"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              width: 'min(100%, 720px)',
              aspectRatio: '1',
            }}
          >
            {cellElements}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
