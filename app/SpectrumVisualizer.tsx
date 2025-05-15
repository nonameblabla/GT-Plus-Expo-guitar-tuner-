// SpectrumVisualizer.tsx
import React, { useEffect, useRef, memo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import FFT from 'fft.js';
interface SpectrumVisualizerProps {
  audioData: Float32Array | null;
  size?: number;
  width?: number;
  height?: number;
  sampleRate?: number;
  currentFreq?: number;
  targetFreq?: number;
  darkMode?: boolean;
}
interface FFTInstance {
  createComplexArray(): number[];
  realTransform(output: number[], input: Float32Array | number[]): void;
  completeSpectrum(output: number[]): void;
}
const SpectrumVisualizer: React.FC<SpectrumVisualizerProps> = memo(({
  audioData,
  size = 32,
  width = 300,
  height = 100,
  sampleRate = 44100,
  currentFreq,
  targetFreq,
}) => {
  const bars = useRef<Animated.Value[]>([]);
  if (bars.current.length !== size) {
    bars.current = Array.from({ length: size }, () => new Animated.Value(0));
  }

  const fftRef = useRef<FFTInstance | null>(null);
  const FFTConstructor = FFT as unknown as { new (n: number): FFTInstance };

  useEffect(() => {
    fftRef.current = new FFTConstructor(size * 2);
  }, [size, FFTConstructor]);

  useEffect(() => {
    const fft = fftRef.current;
    if (!audioData || !fft) return;

    const N = size * 2;
    const input = audioData.length >= N
      ? audioData.subarray(0, N)
      : new Float32Array(N).map((_, i) => audioData[i] || 0);

    const out = fft.createComplexArray();
    fft.realTransform(out, input);
    fft.completeSpectrum(out);

    const mags = new Array<number>(size);
    for (let i = 0; i < size; i++) {
      const re = out[2 * i];
      const im = out[2 * i + 1];
      mags[i] = Math.hypot(re, im);
    }
    const maxMag = Math.max(...mags, 1);

    bars.current.forEach((av, i) => {
      const scale = mags[i] / maxMag;
      Animated.timing(av, {
        toValue: scale,
        duration: 100,
        useNativeDriver: true,
      }).start();
    });
  }, [audioData, size, sampleRate, height]);

  const gap = 2;
  const barWidth = (width - gap * (size - 1)) / size;

  // Обчислення індексу цільової частоти
  let targetIndex: number | null = null;
  if (targetFreq && sampleRate) {
    const nyquist = sampleRate / 2;
    const freqResolution = nyquist / size;
    targetIndex = Math.round(targetFreq / freqResolution);
    if (targetIndex >= size) targetIndex = size - 1;
  }

  // Обчислення відхилення
  let deviation = 0;
  if (currentFreq && targetFreq) {
    deviation = currentFreq - targetFreq;
  }

  // Визначення кольору індикатора точності
  const getDeviationColor = () => {
    if (Math.abs(deviation) < 1) return '#4CAF50'; // Зелений — точно
    if (Math.abs(deviation) < 5) return '#FFC107'; // Жовтий — майже
    return '#F44336'; // Червоний — далеко
  };

  return (
    <View style={[styles.container, { width, height }]}>
      {bars.current.map((av, i) => {
        const isTarget = i === targetIndex;
        return (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                width: barWidth,
                height,
                marginLeft: i === 0 ? 0 : gap,
                backgroundColor: isTarget ? getDeviationColor() : '#4CAF50',
                transform: [{ scaleY: av }],
              },
            ]}
          />
        );
      })}
    </View>
  );
});
const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', overflow: 'hidden' },
  bar:       { backgroundColor: '#4CAF50', borderRadius: 2 },
});
export default SpectrumVisualizer;
