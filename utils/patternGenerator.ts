import { GeneratedPattern, PatternPiece, PatternLabel } from '@/types';

const SCALE = 10;
const SEAM_ALLOWANCE = 0.5;

interface BlouseMeasurements {
  bust: number;
  waist: number;
  shoulderWidth: number;
  frontLength: number;
  backLength: number;
  sleeveLength: number;
  armhole: number;
  neckDepthFront?: number;
  neckDepthBack?: number;
}

interface BlouseOptions {
  sleeveType: 'short' | 'elbow' | 'full' | 'sleeveless';
  neckType: 'round' | 'boat' | 'sweetheart' | 'square';
  ease: number;
}

interface KidsFrockMeasurements {
  chest: number;
  waist: number;
  shoulderWidth: number;
  totalLength: number;
  bodiceLength: number;
  armhole: number;
}

interface KidsFrockOptions {
  sleeveType: 'puff' | 'short' | 'sleeveless';
  skirtStyle: 'gathered' | 'aline' | 'flared';
  ease: number;
}

function generateSvgPath(points: [number, number][]): string {
  if (points.length === 0) return '';
  let path = `M ${points[0][0] * SCALE} ${points[0][1] * SCALE}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i][0] * SCALE} ${points[i][1] * SCALE}`;
  }
  path += ' Z';
  return path;
}

function generateCurvedPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  curveDepth: number
): string {
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2 + curveDepth;
  return `Q ${midX * SCALE} ${midY * SCALE} ${endX * SCALE} ${endY * SCALE}`;
}

export function generateBasicSareeBlouse(
  measurements: BlouseMeasurements,
  options: BlouseOptions
): GeneratedPattern {
  const {
    bust,
    waist,
    shoulderWidth,
    frontLength,
    backLength,
    sleeveLength,
    armhole,
    neckDepthFront = 4,
    neckDepthBack = 2,
  } = measurements;

  const { sleeveType, neckType, ease = 2 } = options;

  const bustWithEase = bust + ease;
  const halfBust = bustWithEase / 2;
  const quarterBust = halfBust / 2;

  const pieces: PatternPiece[] = [];

  const frontWidth = quarterBust + SEAM_ALLOWANCE * 2;
  const frontHeight = frontLength + SEAM_ALLOWANCE * 2;
  const neckWidth = shoulderWidth / 3;

  let frontPath = `M ${SEAM_ALLOWANCE * SCALE} ${SEAM_ALLOWANCE * SCALE}`;
  frontPath += ` L ${(neckWidth / 2) * SCALE} ${SEAM_ALLOWANCE * SCALE}`;

  if (neckType === 'round') {
    frontPath += ` Q ${(neckWidth / 2 + 1) * SCALE} ${(neckDepthFront / 2) * SCALE} ${(neckWidth / 2) * SCALE} ${neckDepthFront * SCALE}`;
  } else if (neckType === 'boat') {
    frontPath += ` L ${(neckWidth / 2) * SCALE} ${(neckDepthFront * 0.5) * SCALE}`;
  } else if (neckType === 'sweetheart') {
    frontPath += ` Q ${(neckWidth / 2 + 0.5) * SCALE} ${(neckDepthFront * 0.3) * SCALE} ${(neckWidth / 4) * SCALE} ${(neckDepthFront * 0.6) * SCALE}`;
    frontPath += ` Q ${0} ${neckDepthFront * SCALE} ${(neckWidth / 4) * SCALE} ${neckDepthFront * SCALE}`;
  } else {
    frontPath += ` L ${(neckWidth / 2) * SCALE} ${neckDepthFront * SCALE}`;
  }

  frontPath += ` L ${SEAM_ALLOWANCE * SCALE} ${neckDepthFront * SCALE}`;

  frontPath += ` L ${SEAM_ALLOWANCE * SCALE} ${(armhole + SEAM_ALLOWANCE) * SCALE}`;

  frontPath += ` Q ${(quarterBust * 0.3) * SCALE} ${(armhole + 1) * SCALE} ${(quarterBust * 0.5) * SCALE} ${(frontLength - 2) * SCALE}`;

  frontPath += ` L ${frontWidth * SCALE} ${frontHeight * SCALE}`;

  frontPath += ` L ${frontWidth * SCALE} ${SEAM_ALLOWANCE * SCALE}`;

  frontPath += ` L ${(shoulderWidth / 2 + SEAM_ALLOWANCE) * SCALE} ${SEAM_ALLOWANCE * SCALE}`;

  frontPath += ' Z';

  const frontLabels: PatternLabel[] = [
    { text: 'FRONT', x: frontWidth * SCALE / 2, y: frontHeight * SCALE / 2 },
    { text: 'Cut 1 on fold', x: frontWidth * SCALE / 2, y: frontHeight * SCALE / 2 + 20 },
    { text: 'Grain line', x: 15, y: frontHeight * SCALE / 2, rotation: 90 },
  ];

  pieces.push({
    name: 'Front Bodice',
    path: frontPath,
    width: frontWidth,
    height: frontHeight,
    labels: frontLabels,
  });

  const backWidth = quarterBust + SEAM_ALLOWANCE * 2;
  const backHeight = backLength + SEAM_ALLOWANCE * 2;

  const backPoints: [number, number][] = [
    [SEAM_ALLOWANCE, SEAM_ALLOWANCE],
    [neckWidth / 2, SEAM_ALLOWANCE],
    [neckWidth / 2, neckDepthBack],
    [SEAM_ALLOWANCE, neckDepthBack],
    [SEAM_ALLOWANCE, armhole + SEAM_ALLOWANCE],
    [quarterBust * 0.5, backLength - 1],
    [backWidth, backHeight],
    [backWidth, SEAM_ALLOWANCE],
    [shoulderWidth / 2 + SEAM_ALLOWANCE, SEAM_ALLOWANCE],
  ];

  const backLabels: PatternLabel[] = [
    { text: 'BACK', x: backWidth * SCALE / 2, y: backHeight * SCALE / 2 },
    { text: 'Cut 1 on fold', x: backWidth * SCALE / 2, y: backHeight * SCALE / 2 + 20 },
  ];

  pieces.push({
    name: 'Back Bodice',
    path: generateSvgPath(backPoints),
    width: backWidth,
    height: backHeight,
    labels: backLabels,
  });

  if (sleeveType !== 'sleeveless') {
    let sleeveLen = sleeveLength;
    if (sleeveType === 'short') sleeveLen = Math.min(sleeveLength, 6);
    else if (sleeveType === 'elbow') sleeveLen = Math.min(sleeveLength, 12);

    const sleeveWidth = armhole + ease + SEAM_ALLOWANCE * 2;
    const sleeveHeight = sleeveLen + SEAM_ALLOWANCE * 2;

    const sleevePath = `
      M ${SEAM_ALLOWANCE * SCALE} ${SEAM_ALLOWANCE * SCALE}
      Q ${(sleeveWidth / 2) * SCALE} ${-2 * SCALE} ${(sleeveWidth - SEAM_ALLOWANCE) * SCALE} ${SEAM_ALLOWANCE * SCALE}
      L ${(sleeveWidth - SEAM_ALLOWANCE) * SCALE} ${sleeveHeight * SCALE}
      L ${SEAM_ALLOWANCE * SCALE} ${sleeveHeight * SCALE}
      Z
    `;

    const sleeveLabels: PatternLabel[] = [
      { text: 'SLEEVE', x: sleeveWidth * SCALE / 2, y: sleeveHeight * SCALE / 2 },
      { text: 'Cut 2', x: sleeveWidth * SCALE / 2, y: sleeveHeight * SCALE / 2 + 20 },
    ];

    pieces.push({
      name: 'Sleeve',
      path: sleevePath,
      width: sleeveWidth,
      height: sleeveHeight,
      labels: sleeveLabels,
    });
  }

  const totalWidth = Math.max(...pieces.map(p => p.width)) + 4;
  const totalHeight = pieces.reduce((sum, p) => sum + p.height + 2, 0) + 4;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth * SCALE} ${totalHeight * SCALE}" width="${totalWidth * SCALE}" height="${totalHeight * SCALE}">`;
  svg += `<style>
    .pattern-piece { fill: none; stroke: #333; stroke-width: 1.5; }
    .seam-line { fill: none; stroke: #999; stroke-width: 0.5; stroke-dasharray: 4,2; }
    .label { font-family: Arial, sans-serif; font-size: 12px; fill: #333; text-anchor: middle; }
    .grain-line { stroke: #666; stroke-width: 1; marker-end: url(#arrow); }
  </style>`;
  svg += `<defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#666"/>
    </marker>
  </defs>`;

  let yOffset = 2;
  for (const piece of pieces) {
    svg += `<g transform="translate(${2 * SCALE}, ${yOffset * SCALE})">`;
    svg += `<path class="pattern-piece" d="${piece.path}"/>`;

    for (const label of piece.labels) {
      if (label.rotation) {
        svg += `<text class="label" x="${label.x}" y="${label.y}" transform="rotate(${label.rotation}, ${label.x}, ${label.y})">${label.text}</text>`;
      } else {
        svg += `<text class="label" x="${label.x}" y="${label.y}">${label.text}</text>`;
      }
    }

    svg += `</g>`;
    yOffset += piece.height + 2;
  }

  svg += `</svg>`;

  return {
    pieces,
    totalWidth,
    totalHeight,
    svg,
  };
}

export function generateKidsFrock(
  measurements: KidsFrockMeasurements,
  options: KidsFrockOptions
): GeneratedPattern {
  const {
    chest,
    waist,
    shoulderWidth,
    totalLength,
    bodiceLength,
    armhole,
  } = measurements;

  const { skirtStyle, ease = 2 } = options;

  const chestWithEase = chest + ease;
  const quarterChest = chestWithEase / 4;
  const skirtLength = totalLength - bodiceLength;

  const pieces: PatternPiece[] = [];

  const bodiceWidth = quarterChest + SEAM_ALLOWANCE * 2;
  const bodiceHeight = bodiceLength + SEAM_ALLOWANCE * 2;

  const bodicePoints: [number, number][] = [
    [SEAM_ALLOWANCE, SEAM_ALLOWANCE],
    [shoulderWidth / 4, SEAM_ALLOWANCE],
    [shoulderWidth / 4, 2],
    [SEAM_ALLOWANCE, 2],
    [SEAM_ALLOWANCE, armhole * 0.8],
    [quarterChest * 0.4, bodiceLength],
    [bodiceWidth, bodiceHeight],
    [bodiceWidth, SEAM_ALLOWANCE],
  ];

  pieces.push({
    name: 'Bodice Front',
    path: generateSvgPath(bodicePoints),
    width: bodiceWidth,
    height: bodiceHeight,
    labels: [
      { text: 'BODICE FRONT', x: bodiceWidth * SCALE / 2, y: bodiceHeight * SCALE / 2 },
      { text: 'Cut 1 on fold', x: bodiceWidth * SCALE / 2, y: bodiceHeight * SCALE / 2 + 20 },
    ],
  });

  let skirtWidth = quarterChest;
  if (skirtStyle === 'gathered') skirtWidth = quarterChest * 1.5;
  else if (skirtStyle === 'flared') skirtWidth = quarterChest * 2;

  skirtWidth += SEAM_ALLOWANCE * 2;
  const skirtHeight = skirtLength + SEAM_ALLOWANCE * 2;

  const skirtPoints: [number, number][] = [
    [SEAM_ALLOWANCE, SEAM_ALLOWANCE],
    [skirtWidth, SEAM_ALLOWANCE],
    [skirtWidth, skirtHeight],
    [SEAM_ALLOWANCE, skirtHeight],
  ];

  pieces.push({
    name: 'Skirt Panel',
    path: generateSvgPath(skirtPoints),
    width: skirtWidth,
    height: skirtHeight,
    labels: [
      { text: 'SKIRT', x: skirtWidth * SCALE / 2, y: skirtHeight * SCALE / 2 },
      { text: 'Cut 2', x: skirtWidth * SCALE / 2, y: skirtHeight * SCALE / 2 + 20 },
    ],
  });

  const totalPatternWidth = Math.max(...pieces.map(p => p.width)) + 4;
  const totalPatternHeight = pieces.reduce((sum, p) => sum + p.height + 2, 0) + 4;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalPatternWidth * SCALE} ${totalPatternHeight * SCALE}" width="${totalPatternWidth * SCALE}" height="${totalPatternHeight * SCALE}">`;
  svg += `<style>
    .pattern-piece { fill: none; stroke: #333; stroke-width: 1.5; }
    .label { font-family: Arial, sans-serif; font-size: 12px; fill: #333; text-anchor: middle; }
  </style>`;

  let yOffset = 2;
  for (const piece of pieces) {
    svg += `<g transform="translate(${2 * SCALE}, ${yOffset * SCALE})">`;
    svg += `<path class="pattern-piece" d="${piece.path}"/>`;
    for (const label of piece.labels) {
      svg += `<text class="label" x="${label.x}" y="${label.y}">${label.text}</text>`;
    }
    svg += `</g>`;
    yOffset += piece.height + 2;
  }

  svg += `</svg>`;

  return {
    pieces,
    totalWidth: totalPatternWidth,
    totalHeight: totalPatternHeight,
    svg,
  };
}

export function generatePattern(
  templateName: string,
  measurements: Record<string, number>,
  options: Record<string, string | number>
): GeneratedPattern | null {
  switch (templateName) {
    case 'Basic Saree Blouse':
      return generateBasicSareeBlouse(
        measurements as unknown as BlouseMeasurements,
        options as unknown as BlouseOptions
      );
    case 'Kids Frock':
      return generateKidsFrock(
        measurements as unknown as KidsFrockMeasurements,
        options as unknown as KidsFrockOptions
      );
    default:
      return null;
  }
}
