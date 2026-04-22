import React from 'react';
import Svg, { Polyline } from 'react-native-svg';

export default function Sparkline({ data }: { data: number[] }) {
  const points = data.map((d: number, i: number) => `${i * 10},${100 - d}`).join(' ');

  return (
    <Svg height="100" width="100%">
      <Polyline points={points} fill="none" stroke="blue" />
    </Svg>
  );
}