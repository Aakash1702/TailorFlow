export function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace("#", "");
  
  let r: number, g: number, b: number;
  
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else {
    return hex;
  }
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function withOpacity(color: string, opacity: number): string {
  if (color.startsWith("rgba")) {
    return color.replace(/[\d.]+\)$/, `${opacity})`);
  }
  if (color.startsWith("rgb")) {
    return color.replace("rgb", "rgba").replace(")", `, ${opacity})`);
  }
  if (color.startsWith("#")) {
    return hexToRgba(color, opacity);
  }
  return color;
}
