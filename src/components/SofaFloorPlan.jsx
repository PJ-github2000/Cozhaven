/**
 * SofaFloorPlan — top-down line-art SVG diagrams for sofa configurations.
 * Matches the Atunus "Select Base Configuration" grid style.
 *
 * Usage:
 *   <SofaFloorPlan type="l-shape-right" size={64} />
 *
 * Available types:
 *   1-seater, 2-seater, 3-seater, 3-seater-ottoman,
 *   chaise-right, chaise-left,
 *   l-shape-right, l-shape-left,
 *   l-shape-right-ottoman, l-shape-left-ottoman,
 *   u-shape-small, u-shape, u-shape-ottoman,
 *   u-shape-large, u-shape-large-ottoman
 */

const DEFAULT_STROKE  = '#333';
const DEFAULT_SW      = 1.4;
const DEFAULT_FILL    = '#f5f4f2';
const DEFAULT_FILL_OT = '#ede9e4'; // ottoman fill (slightly different)

// ─── individual shape primitives ───────────────────────────────────────────

/** Horizontal sofa section: back strip + n equal seats */
function HorizSofa({ x, y, seats, sw = 20, sh = 18, bh = 9, fill, stroke, strokeWidth }) {
  const totalW = seats * sw;
  return (
    <g fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
      {/* back cushion strip */}
      <rect x={x} y={y} width={totalW} height={bh} />
      {/* seat modules */}
      {Array.from({ length: seats }).map((_, i) => (
        <rect key={i} x={x + i * sw} y={y + bh} width={sw} height={sh} />
      ))}
    </g>
  );
}

/** Vertical sofa section (arm): back strip on one side + n seats stacked */
function VertSofa({ x, y, seats, sw = 18, sh = 20, bw = 9, backSide = 'right', fill, stroke, strokeWidth }) {
  const totalH = seats * sh;
  const bx = backSide === 'right' ? x + sw : x;
  const sx = backSide === 'right' ? x : x + bw;
  return (
    <g fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
      {/* back cushion strip */}
      <rect x={bx} y={y} width={bw} height={totalH} />
      {/* seat modules */}
      {Array.from({ length: seats }).map((_, i) => (
        <rect key={i} x={sx} y={y + i * sh} width={sw} height={sh} />
      ))}
    </g>
  );
}

/** Ottoman rectangle */
function Ottoman({ x, y, w = 18, h = 14, fillOttoman, stroke, strokeWidth }) {
  return <rect x={x} y={y} width={w} height={h} fill={fillOttoman} stroke={stroke} strokeWidth={strokeWidth} />;
}

// ─── configuration map ──────────────────────────────────────────────────────

const CONFIGS = {

  '1-seater': {
    vb: '0 0 60 60',
    render: (c) => <HorizSofa x={10} y={12} seats={1} sw={28} sh={20} bh={9} {...c} />,
  },

  '2-seater': {
    vb: '0 0 80 60',
    render: (c) => <HorizSofa x={8} y={12} seats={2} sw={30} sh={20} bh={9} {...c} />,
  },

  '3-seater': {
    vb: '0 0 90 60',
    render: (c) => <HorizSofa x={5} y={10} seats={3} sw={26} sh={22} bh={9} {...c} />,
  },

  '3-seater-ottoman': {
    vb: '0 0 90 80',
    render: (c) => (
      <>
        <HorizSofa x={5} y={8} seats={3} sw={26} sh={22} bh={9} {...c} />
        <Ottoman x={23} y={44} w={26} h={15} {...c} />
      </>
    ),
  },

  'chaise-right': {
    vb: '0 0 100 80',
    render: (c) => (
      <>
        {/* 3 horizontal seats */}
        <HorizSofa x={5} y={8} seats={3} sw={22} sh={20} bh={9} {...c} />
        {/* chaise arm: right side, back on right, 1 deep seat */}
        <VertSofa x={66} y={8} seats={2} sw={20} sh={18} bw={9} backSide="right" {...c} />
      </>
    ),
  },

  'chaise-left': {
    vb: '0 0 100 80',
    render: (c) => (
      <>
        {/* chaise arm: left side, back on left */}
        <VertSofa x={5} y={8} seats={2} sw={20} sh={18} bw={9} backSide="left" {...c} />
        {/* 3 horizontal seats */}
        <HorizSofa x={34} y={8} seats={3} sw={22} sh={20} bh={9} {...c} />
      </>
    ),
  },

  'l-shape-right': {
    vb: '0 0 100 88',
    render: (c) => (
      <>
        {/* 3 top seats */}
        <HorizSofa x={5} y={8} seats={3} sw={22} sh={20} bh={9} {...c} />
        {/* right arm going down */}
        <VertSofa x={71} y={8} seats={2} sw={20} sh={22} bw={9} backSide="right" {...c} />
      </>
    ),
  },

  'l-shape-left': {
    vb: '0 0 100 88',
    render: (c) => (
      <>
        {/* left arm going down */}
        <VertSofa x={5} y={8} seats={2} sw={20} sh={22} bw={9} backSide="left" {...c} />
        {/* 3 top seats */}
        <HorizSofa x={34} y={8} seats={3} sw={22} sh={20} bh={9} {...c} />
      </>
    ),
  },

  'l-shape-right-ottoman': {
    vb: '0 0 100 96',
    render: (c) => (
      <>
        <HorizSofa x={5} y={8} seats={3} sw={22} sh={20} bh={9} {...c} />
        <VertSofa x={71} y={8} seats={2} sw={20} sh={22} bw={9} backSide="right" {...c} />
        <Ottoman x={30} y={52} w={22} h={15} {...c} />
      </>
    ),
  },

  'l-shape-left-ottoman': {
    vb: '0 0 100 96',
    render: (c) => (
      <>
        <VertSofa x={5} y={8} seats={2} sw={20} sh={22} bw={9} backSide="left" {...c} />
        <HorizSofa x={34} y={8} seats={3} sw={22} sh={20} bh={9} {...c} />
        <Ottoman x={42} y={52} w={22} h={15} {...c} />
      </>
    ),
  },

  'u-shape-small': {
    vb: '0 0 100 96',
    render: (c) => (
      <>
        {/* top 3 seats */}
        <HorizSofa x={5} y={5} seats={3} sw={22} sh={18} bh={8} {...c} />
        {/* left arm */}
        <VertSofa x={5} y={31} seats={2} sw={18} sh={20} bw={8} backSide="left" {...c} />
        {/* right arm */}
        <VertSofa x={69} y={31} seats={2} sw={18} sh={20} bw={8} backSide="right" {...c} />
      </>
    ),
  },

  'u-shape': {
    vb: '0 0 108 104',
    render: (c) => (
      <>
        {/* top 4 seats */}
        <HorizSofa x={5} y={5} seats={4} sw={22} sh={18} bh={8} {...c} />
        {/* left arm 2 seats */}
        <VertSofa x={5} y={31} seats={2} sw={18} sh={22} bw={8} backSide="left" {...c} />
        {/* right arm 2 seats */}
        <VertSofa x={81} y={31} seats={2} sw={18} sh={22} bw={8} backSide="right" {...c} />
      </>
    ),
  },

  'u-shape-ottoman': {
    vb: '0 0 108 112',
    render: (c) => (
      <>
        <HorizSofa x={5} y={5} seats={4} sw={22} sh={18} bh={8} {...c} />
        <VertSofa x={5} y={31} seats={2} sw={18} sh={22} bw={8} backSide="left" {...c} />
        <VertSofa x={81} y={31} seats={2} sw={18} sh={22} bw={8} backSide="right" {...c} />
        <Ottoman x={30} y={80} w={20} h={14} {...c} />
        <Ottoman x={55} y={80} w={20} h={14} {...c} />
      </>
    ),
  },

  'u-shape-large': {
    vb: '0 0 120 112',
    render: (c) => (
      <>
        {/* top 5 seats */}
        <HorizSofa x={5} y={5} seats={5} sw={21} sh={18} bh={8} {...c} />
        {/* left arm 3 seats */}
        <VertSofa x={5} y={31} seats={3} sw={18} sh={20} bw={8} backSide="left" {...c} />
        {/* right arm 3 seats */}
        <VertSofa x={94} y={31} seats={3} sw={18} sh={20} bw={8} backSide="right" {...c} />
      </>
    ),
  },

  'u-shape-large-ottoman': {
    vb: '0 0 120 120',
    render: (c) => (
      <>
        <HorizSofa x={5} y={5} seats={5} sw={21} sh={18} bh={8} {...c} />
        <VertSofa x={5} y={31} seats={3} sw={18} sh={20} bw={8} backSide="left" {...c} />
        <VertSofa x={94} y={31} seats={3} sw={18} sh={20} bw={8} backSide="right" {...c} />
        <Ottoman x={30} y={95} w={26} h={16} {...c} />
        <Ottoman x={62} y={95} w={26} h={16} {...c} />
      </>
    ),
  },
};

// ─── public component ───────────────────────────────────────────────────────

export default function SofaFloorPlan({
  type = '3-seater',
  size,
  stroke = DEFAULT_STROKE,
  fill = DEFAULT_FILL,
  fillOttoman = DEFAULT_FILL_OT,
  strokeWidth = DEFAULT_SW,
}) {
  const config = CONFIGS[type] || CONFIGS['3-seater'];
  const colorProps = { fill, fillOttoman, stroke, strokeWidth };
  return (
    <svg
      viewBox={config.vb}
      width={size || undefined}
      height={size || undefined}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block', width: size ? size : '100%', height: size ? size : '100%' }}
    >
      {config.render(colorProps)}
    </svg>
  );
}

export const FLOOR_PLAN_TYPES = Object.keys(CONFIGS);
