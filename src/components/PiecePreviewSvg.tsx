import React from 'react';
import { TETROMINO_SPECS, TetrominoType } from '../game/tetrisEngine';

interface PiecePreviewSvgProps {
  type: TetrominoType | null;
  size?: 'sm' | 'md' | 'lg';
  dimmed?: boolean;
}

/**
 * Renders a 3D-beveled isometric/faceted SVG representation of a Tetromino
 * for the NEXT and HOLD panels, matching the 3D scene's beveled cube aesthetic.
 */
export const PiecePreviewSvg: React.FC<PiecePreviewSvgProps> = ({
  type,
  size = 'md',
  dimmed = false,
}) => {
  const cellPx = size === 'lg' ? 22 : size === 'md' ? 18 : 14;
  const boxW = cellPx * 4 + 8;
  const boxH = cellPx * 2.6 + 8;

  if (!type) {
    return (
      <div
        style={{ width: boxW, height: boxH }}
        className="flex items-center justify-center text-xs text-slate-600 font-mono-tabular"
      >
        ПУСТО
      </div>
    );
  }

  const spec = TETROMINO_SPECS[type];
  const cells = spec.rotations[0];

  // Compute bounding box to center the tetromino inside the SVG viewBox
  const minX = Math.min(...cells.map((c) => c.x));
  const maxX = Math.max(...cells.map((c) => c.x));
  const minY = Math.min(...cells.map((c) => c.y));
  const maxY = Math.max(...cells.map((c) => c.y));

  const pieceW = (maxX - minX + 1) * cellPx;
  const pieceH = (maxY - minY + 1) * cellPx;
  const offsetX = (boxW - pieceW) / 2 - minX * cellPx;
  const offsetY = (boxH - pieceH) / 2 - minY * cellPx;

  return (
    <svg
      width={boxW}
      height={boxH}
      viewBox={`0 0 ${boxW} ${boxH}`}
      className={dimmed ? 'opacity-45 grayscale' : 'opacity-100'}
      aria-label={spec.nameRu}
    >
      {cells.map((cell, idx) => {
        const x = offsetX + cell.x * cellPx;
        const y = offsetY + cell.y * cellPx;
        const s = cellPx - 1.5;
        const bevel = Math.max(2.5, s * 0.18);

        return (
          <g key={idx} transform={`translate(${x}, ${y})`}>
            {/* Outer beveled block silhouette */}
            <rect
              x={0}
              y={0}
              width={s}
              height={s}
              rx={2.5}
              fill={spec.colorHex}
              stroke={spec.borderHex}
              strokeWidth={1.1}
            />
            {/* Top-left specular bevel highlight */}
            <polygon
              points={`1,1 ${s - 1},1 ${s - bevel},${bevel} ${bevel},${bevel} ${bevel},${s - bevel} 1,${s - 1}`}
              fill="rgba(255,255,255,0.28)"
            />
            {/* Bottom-right shadow bevel */}
            <polygon
              points={`${s - 1},1 ${s - 1},${s - 1} 1,${s - 1} ${bevel},${s - bevel} ${s - bevel},${s - bevel} ${s - bevel},${bevel}`}
              fill="rgba(0,0,0,0.34)"
            />
            {/* Inner recessed core face */}
            <rect
              x={bevel}
              y={bevel}
              width={Math.max(2, s - bevel * 2)}
              height={Math.max(2, s - bevel * 2)}
              rx={1.2}
              fill={spec.colorHex}
              stroke="rgba(255,255,255,0.22)"
              strokeWidth={0.6}
            />
          </g>
        );
      })}
    </svg>
  );
};
