import React, { useMemo } from 'react';
import Svg, { Rect } from 'react-native-svg';
import JsBarcode from 'jsbarcode';

/**
 * Renders a real, scannable Code 128 barcode (same format as the Project I
 * Android app). JsBarcode only computes the bar pattern; react-native-svg draws it.
 */
export function Barcode({
  value,
  height = 70,
  barWidth = 2,
}: {
  value: string;
  height?: number;
  barWidth?: number;
}) {
  const binary = useMemo(() => {
    try {
      const target: any = {};
      JsBarcode(target, value, { format: 'CODE128', valid: () => {} } as any);
      return (target.encodings?.[0]?.data as string) ?? '';
    } catch {
      return '';
    }
  }, [value]);

  if (!binary) return null;

  const quiet = 10 * barWidth; // quiet zone either side
  const width = binary.length * barWidth + quiet * 2;

  const bars: React.ReactElement[] = [];
  let i = 0;
  while (i < binary.length) {
    if (binary[i] === '1') {
      let run = 1;
      while (i + run < binary.length && binary[i + run] === '1') run++;
      bars.push(
        <Rect key={i} x={quiet + i * barWidth} y={0} width={run * barWidth} height={height} fill="#000" />
      );
      i += run;
    } else {
      i++;
    }
  }

  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      <Rect x={0} y={0} width={width} height={height} fill="#fff" />
      {bars}
    </Svg>
  );
}
